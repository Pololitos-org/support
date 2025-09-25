// lib/types/verification.ts - Actualizado para tu backend
export enum VerificationLevel {
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED', 
  PREMIUM = 'PREMIUM',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Actualizado para coincidir con tu backend
export enum DocumentType {
  IDENTITY = 'IDENTITY',
  ADDRESS = 'ADDRESS', 
  CRIMINAL_RECORD = 'CRIMINAL_RECORD',
  OTHER = 'OTHER',
}

export interface VerificationDocument {
  id: number;
  documentType: DocumentType;
  status: DocumentStatus;
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export interface AdminVerificationDocument extends VerificationDocument {
  userId: number;
  userName: string;
  userEmail?: string;
  profilePictureUrl?: string;
}