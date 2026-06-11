import { Column, Index, PrimaryColumn } from 'typeorm';

export abstract class BaseLogEntity {
  @PrimaryColumn({ name: 'inserted_at', type: 'bigint' })
  insertedAt: number;

  @Index()
  @Column({ name: 'deleted_at', type: 'bigint', nullable: true })
  deletedAt: number | null;
}
