export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepositoryPort {
  existsByEmail(emailNormalized: string): Promise<boolean>;
  findUserIdByEmail(emailNormalized: string): Promise<string | null>;
  createUser(input: { fullName: string }): Promise<{ userId: string }>;
  activateUser(userId: string): Promise<void>;
  findRolesByUserId(userId: string): Promise<string[]>;
}
