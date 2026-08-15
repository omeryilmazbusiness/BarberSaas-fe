import { ApiPath } from '../../../core/api/endpoints';
import type { HttpClient } from '../../../core/api/httpClient';
import type { CatalogService as CatalogServiceEntity } from '../../../core/types/domain';
import type { CatalogService, CreateCatalogServiceInput } from './CatalogService';

export class HttpCatalogService implements CatalogService {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<CatalogServiceEntity[]> {
    return this.http.request<CatalogServiceEntity[]>({
      path: ApiPath.CatalogServices,
    });
  }

  create(input: CreateCatalogServiceInput): Promise<CatalogServiceEntity> {
    return this.http.request<CatalogServiceEntity>({
      method: 'POST',
      path: ApiPath.CatalogServices,
      body: input,
    });
  }
}
