export const SOCIAL_IDENTITY_REPOSITORY = Symbol('SOCIAL_IDENTITY_REPOSITORY');

export interface SocialIdentityData {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  email: string | null;
  displayName: string | null;
}

export interface SocialIdentityRepositoryPort {
  findByProviderAndProviderId(
    provider: string,
    providerId: string,
  ): Promise<SocialIdentityData | null>;

  create(input: {
    userId: string;
    provider: string;
    providerId: string;
    email?: string | null;
    displayName?: string | null;
  }): Promise<SocialIdentityData>;
}
