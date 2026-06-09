export const AUDIT_LOG_REPOSITORY = Symbol('AUDIT_LOG_REPOSITORY');

export interface AuditLogRepositoryPort {
  logSuccess(input: {
    userId: string;
    identityEmail: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  logFailure(input: {
    userId?: string;
    identityEmail: string;
    failureReason: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
}
