/**
 * Fluent, type-safe URL builder designed to prevent hardcoded URL strings,
 * handle path parameters (e.g. {id:guid} or {alertId}), sanitize slashes,
 * and format query strings correctly.
 */
export class UrlBuilder {
  private base: string = '';
  private segments: string[] = [];
  private pathParams: Record<string, string | number | boolean> = {};
  private queryParams: Record<string, string | number | boolean | null | undefined> = {};

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.base = baseUrl.replace(/\/+$/, '');
    }
  }

  public static create(baseUrl?: string): UrlBuilder {
    return new UrlBuilder(baseUrl);
  }

  /**
   * Appends one or more path segments to the URL.
   */
  public segment(...parts: (string | number | undefined | null)[]): this {
    for (const part of parts) {
      if (part !== undefined && part !== null && String(part).trim().length > 0) {
        const cleaned = String(part).replace(/^\/+|\/+$/g, '');
        if (cleaned) {
          this.segments.push(cleaned);
        }
      }
    }
    return this;
  }

  /**
   * Directly sets the path or route template (e.g., 'trading/quote' or 'crypto/alerts/{alertId:guid}').
   */
  public path(routeTemplate: string): this {
    return this.segment(routeTemplate);
  }

  /**
   * Replaces a path parameter token in route templates.
   * Matches both `{param}` and ASP.NET Core typed route constraints like `{param:guid}` or `{param:int}`.
   */
  public param(name: string, value: string | number | boolean): this {
    this.pathParams[name] = value;
    return this;
  }

  /**
   * Sets multiple path parameters at once.
   */
  public params(paramsMap: Record<string, string | number | boolean>): this {
    Object.assign(this.pathParams, paramsMap);
    return this;
  }

  /**
   * Appends a single query parameter key-value pair.
   * Automatically omits undefined or null values.
   */
  public query(key: string, value: string | number | boolean | null | undefined): this {
    if (value !== undefined && value !== null && value !== '') {
      this.queryParams[key] = value;
    }
    return this;
  }

  /**
   * Appends multiple query parameters from an object.
   */
  public queryMap(map: Record<string, any> | null | undefined): this {
    if (!map) return this;
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined && v !== null && v !== '') {
        this.queryParams[k] = v;
      }
    }
    return this;
  }

  /**
   * Builds the complete URL string with base URL, resolved path params, and query string.
   */
  public build(): string {
    let resolvedPath = this.segments.join('/');

    // Substitute path parameters: {paramName} or {paramName:constraint}
    for (const [paramName, paramVal] of Object.entries(this.pathParams)) {
      const regex = new RegExp(`\\{${paramName}(?::[a-zA-Z0-9]+)?\\}`, 'g');
      resolvedPath = resolvedPath.replace(regex, encodeURIComponent(String(paramVal)));
    }

    // Clean up any remaining unreplaced optional tokens
    resolvedPath = resolvedPath.replace(/\{[a-zA-Z0-9_]+(?::[a-zA-Z0-9]+)?\}/g, '');

    let fullUrl = this.base ? `${this.base}/${resolvedPath}` : resolvedPath;

    // Build Query String
    const queryEntries = Object.entries(this.queryParams).filter(
      ([, val]) => val !== undefined && val !== null && val !== ''
    );

    if (queryEntries.length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, val] of queryEntries) {
        searchParams.append(key, String(val));
      }
      const qs = searchParams.toString();
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
      }
    }

    return fullUrl;
  }

  /**
   * Returns relative URL without the origin base.
   */
  public buildRelative(): string {
    const originalBase = this.base;
    this.base = '';
    const rel = this.build();
    this.base = originalBase;
    return rel.startsWith('/') ? rel : `/${rel}`;
  }

  public toString(): string {
    return this.build();
  }
}
