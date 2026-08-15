import type { CatalogService as CatalogServiceEntity } from '../../../core/types/domain';

export interface CreateCatalogServiceInput {
  name: string;
  description?: string;
  duration_minutes: number;
  price_cents: number;
  currency?: string;
}

export interface CatalogService {
  list(): Promise<CatalogServiceEntity[]>;
  create(input: CreateCatalogServiceInput): Promise<CatalogServiceEntity>;
}
