import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, EntityManager } from 'typeorm';
import {
  AuditOutbox,
  AuditOutboxAction,
  AuditOutboxEntityType,
} from './entities/audit-outbox.entity';

type AuditSnapshot = Record<string, unknown>;

@Injectable()
export class AuditOutboxService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectDataSource('logs') private readonly logsDataSource: DataSource
  ) {}

  enqueue(
    manager: EntityManager,
    entityType: AuditOutboxEntityType,
    entityId: number,
    action: AuditOutboxAction,
    actorUid: number,
    beforePayload: AuditSnapshot | null,
    afterPayload: AuditSnapshot | null
  ) {
    return manager.insert(AuditOutbox, {
      entityType,
      entityId,
      action,
      actorUid,
      beforePayload: beforePayload as any,
      afterPayload: afterPayload as any,
      status: 'pending',
      attempts: 0,
    });
  }

  async getSummary() {
    const [row] = await this.dataSource.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
        MIN(created_at) FILTER (WHERE status = 'pending') AS oldest_pending
      FROM audit_outbox
    `);
    return {
      pending: row.pending,
      failed: row.failed,
      oldestPending: row.oldest_pending,
    };
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processPending(): Promise<void> {
    if (!this.dataSource.isInitialized || !this.logsDataSource.isInitialized) {
      return;
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const events: Record<string, any>[] = await runner.query(`
        SELECT *
        FROM audit_outbox
        WHERE status = 'pending'
        ORDER BY created_at
        FOR UPDATE SKIP LOCKED
        LIMIT 50
      `);

      for (const event of events) {
        try {
          await this.projectEvent(event);
          await runner.query(
            `UPDATE audit_outbox
             SET status = 'processed', processed_at = NOW(), last_error = NULL
             WHERE audit_event_id = $1`,
            [event.audit_event_id]
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message.slice(0, 2000) : String(error);
          await runner.query(
            `UPDATE audit_outbox
             SET attempts = attempts + 1,
                 status = CASE WHEN attempts + 1 >= 10 THEN 'failed' ELSE 'pending' END,
                 last_error = $2
             WHERE audit_event_id = $1`,
            [event.audit_event_id, message]
          );
        }
      }
      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  private async projectEvent(event: Record<string, any>): Promise<void> {
    const auditEventId = event.audit_event_id;
    const payload = event.after_payload ?? event.before_payload;
    const insertedAt = Date.now();
    const deletedAt = event.action === 'delete' ? insertedAt : null;

    const runner = this.logsDataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const table =
        event.entity_type === 'factory'
          ? 'factories_logs'
          : 'service_areas_logs';
      const existing = await runner.query(
        `SELECT 1 FROM ${table} WHERE audit_event_id = $1 LIMIT 1`,
        [auditEventId]
      );
      if (existing.length) {
        await runner.commitTransaction();
        return;
      }

      const idColumn =
        event.entity_type === 'factory' ? 'factory_id' : 'service_area_id';
      await runner.query(
        `UPDATE ${table}
         SET deleted_at = $2
         WHERE ${idColumn} = $1 AND deleted_at IS NULL`,
        [event.entity_id, insertedAt]
      );

      if (event.entity_type === 'factory') {
        await runner.query(
          `INSERT INTO factories_logs
            (factory_id, name, initial, note, update_uid, inserted_at, deleted_at, audit_event_id, action)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            payload.factoryId,
            payload.name,
            payload.initial,
            payload.note ?? null,
            event.actor_uid,
            insertedAt,
            deletedAt,
            auditEventId,
            event.action,
          ]
        );
      } else {
        await runner.query(
          `INSERT INTO service_areas_logs
            (service_area_id, factory_id, code, name, note, is_active, effective_from,
             effective_to, superseded_by_service_area_id, update_uid, inserted_at,
             deleted_at, audit_event_id, action)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            payload.serviceAreaId,
            payload.factoryId,
            payload.code,
            payload.name,
            payload.note ?? null,
            payload.isActive ?? true,
            payload.effectiveFrom ?? null,
            payload.effectiveTo ?? null,
            payload.supersededByServiceAreaId ?? null,
            event.actor_uid,
            insertedAt,
            deletedAt,
            auditEventId,
            event.action,
          ]
        );
      }
      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }
}
