// lib/services/adminVerification.ts - Conectado a tu backend real
import { api } from './api';

// Interfaces adaptadas a tu backend
export interface AdminVerificationDocument {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  documentType: 'IDENTITY' | 'ADDRESS' | 'CRIMINAL_RECORD' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  profilePictureUrl?: string;
}

export interface VerificationFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
  type?: 'IDENTITY' | 'ADDRESS' | 'CRIMINAL_RECORD' | 'OTHER' | 'ALL';
  search?: string;
}

// Servicio de verificaciones admin
export const adminVerificationService = {
  // Obtener todos los documentos con filtros
  getAllDocuments: async (filters?: VerificationFilters): Promise<AdminVerificationDocument[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        params.append('status', filters.status);
      }
      if (filters.type && filters.type !== 'ALL') {
        params.append('type', filters.type);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
    }
    
    const endpoint = `/api/verification/admin/documents${params.toString() ? `?${params}` : ''}`;
    const response = await api.get<AdminVerificationDocument[]>(endpoint);
    return response.data!;
  },

  // Aprobar documento
  approveDocument: async (documentId: number): Promise<void> => {
    await api.post(`/api/verification/admin/document/${documentId}/approve`);
  },

  // Rechazar documento con razón
  rejectDocument: async (documentId: number, reason: string): Promise<void> => {
    await api.post(`/api/verification/admin/document/${documentId}/reject`, { reason });
  },
};