import type { CatalogService as CatalogServiceEntity } from '../../../core/types/domain';
import type { CatalogService, CreateCatalogServiceInput } from './CatalogService';

const services: CatalogServiceEntity[] = [
  {
    id: '44444444-4444-4444-4444-444444444441',
    name: 'Classic Haircut',
    description: 'Scissor cut and finish',
    duration_minutes: 30,
    price_cents: 25000,
    currency: 'TRY',
    is_active: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444442',
    name: 'Beard Trim',
    duration_minutes: 20,
    price_cents: 15000,
    currency: 'TRY',
    is_active: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444443',
    name: 'Cut + Beard',
    duration_minutes: 45,
    price_cents: 35000,
    currency: 'TRY',
    is_active: true,
  },
];

export class MockCatalogService implements CatalogService {
  async list(): Promise<CatalogServiceEntity[]> {
    await delay(250);
    return [...services];
  }

  async create(input: CreateCatalogServiceInput): Promise<CatalogServiceEntity> {
    await delay(300);
    const created: CatalogServiceEntity = {
      id: randomId(),
      name: input.name,
      description: input.description,
      duration_minutes: input.duration_minutes,
      price_cents: input.price_cents,
      currency: input.currency ?? 'TRY',
      is_active: true,
    };
    services.unshift(created);
    return created;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const mockCatalogFixtures = services;
