export const AUDIT_LOGIN_LOG_REPOSITORY = Symbol('AUDIT_LOGIN_LOG_REPOSITORY');

export interface AuditLogCreateInput {
  userId?: string;
  identityEmail: string;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
}

export interface AuditLoginLogRepositoryPort {
  createSuccess(input: AuditLogCreateInput): Promise<void>;
  createFail(input: AuditLogCreateInput): Promise<void>;
}
