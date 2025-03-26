export enum Role {
  SUPER_ADMIN = 'superadmin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'successful',
  FAILED = 'failed',
}

export enum RewardStatus {
  PENDING = 'pending',
  SUCCESS = 'successful',
}

export enum RegistrationStatus {
  INCOMPLETE = 'incomplete',
  COMPLETE = 'complete',
  ACTIVE = 'active',
}
