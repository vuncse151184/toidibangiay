export interface MeView {
  id: string;
  status: string;
  email: string | null;
  emailVerified: boolean;
  profile: {
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  };
  roles: string[];
}
