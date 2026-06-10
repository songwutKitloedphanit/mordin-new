import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AuditOutboxEntityType = 'factory' | 'service_area';
export type AuditOutboxAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'move'
  | 'supersede';
export type AuditOutboxStatus = 'pending' | 'processed' | 'failed';

@Entity('audit_outbox')
export class AuditOutbox {
  @PrimaryGeneratedColumn('uuid', { name: 'audit_event_id' })
  auditEventId: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 30 })
  entityType: AuditOutboxEntityType;

  @Column({ name: 'entity_id', type: 'int' })
  entityId: number;

  @Column({ type: 'varchar', length: 20 })
  action: AuditOutboxAction;

  @Column({ name: 'actor_uid', type: 'int' })
  actorUid: number;

  @Column({ name: 'before_payload', type: 'jsonb', nullable: true })
  beforePayload: Record<string, unknown> | null;

  @Column({ name: 'after_payload', type: 'jsonb', nullable: true })
  afterPayload: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: AuditOutboxStatus;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
