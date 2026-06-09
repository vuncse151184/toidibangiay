export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserAggregateInput {
  fullName: string;
}

export interface UserRepositoryPort {
  existsByEmail(emailNormalized: string): Promise<boolean>;
  createUserAggregate(input: CreateUserAggregateInput): Promise<{ userId: string }>;
  assignRoleByCode(userId: string, roleCode: string): Promise<void>;
  activateUser(userId: string): Promise<void>;
  findRolesByUserId(userId: string): Promise<string[]>;
  findUserByEmail(emailNormalized: string): Promise<{ userId: string } | null>;
  findPrimaryEmailByUserId(userId: string): Promise<string | null>;
}
