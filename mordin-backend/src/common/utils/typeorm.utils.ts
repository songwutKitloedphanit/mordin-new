import { NotFoundException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export async function findOrFail<T extends ObjectLiteral>(
  repo: Repository<T>,
  where: Record<string, any>,
  entityName: string,
): Promise<T> {
  const entity = await repo.findOne({ where });
  if (!entity) throw new NotFoundException(`${entityName} not found`);
  return entity;
}
