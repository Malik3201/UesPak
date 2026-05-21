export type RedirectStatusCode = 301 | 302 | 307 | 308;

export interface RedirectDto {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatusCode;
  isActive: boolean;
  notes?: string;
  hitCount: number;
  lastHitAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RedirectLookupResult {
  id: string;
  toPath: string;
  statusCode: RedirectStatusCode;
}

export const REDIRECT_STATUS_LABELS: Record<RedirectStatusCode, string> = {
  301: "301 Permanent",
  302: "302 Found",
  307: "307 Temporary",
  308: "308 Permanent",
};
