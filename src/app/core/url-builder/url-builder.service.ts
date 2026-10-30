import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UrlBuilder } from './url-builder';
import { ApiEndpoints } from './api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class UrlBuilderService {
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Returns a UrlBuilder pre-configured with the application's API base URL.
   */
  public builder(): UrlBuilder {
    return UrlBuilder.create(this.baseUrl);
  }

  /**
   * Starts a URL with a strongly-typed endpoint template from ApiEndpoints.
   */
  public endpoint(endpointTemplate: string): UrlBuilder {
    return UrlBuilder.create(this.baseUrl).path(endpointTemplate);
  }

  /**
   * Reference to the typed endpoints catalogue.
   */
  public readonly endpoints = ApiEndpoints;
}
