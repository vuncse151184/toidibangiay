import { MeView } from '../models/me-view';

export const USER_READ_REPOSITORY = Symbol('USER_READ_REPOSITORY');

export interface UpdateProfileInput {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UserReadRepositoryPort {
  getMeByUserId(userId: string): Promise<MeView | null>;
  updateProfile(userId: string, input: UpdateProfileInput): Promise<MeView>;
}
