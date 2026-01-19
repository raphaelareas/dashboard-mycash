export type FamilyMemberRole = 'owner' | 'member' | 'viewer';

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: FamilyMemberRole;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
