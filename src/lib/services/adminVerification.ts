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
    try {
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
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      throw error;
    }
  },

  // Aprobar documento
  approveDocument: async (documentId: number): Promise<void> => {
    try {
      await api.post(`/api/verification/admin/document/${documentId}/approve`);
    } catch (error) {
      console.error('❌ Error approving document:', error);
      throw error;
    }
  },

  // Rechazar documento con razón
  rejectDocument: async (documentId: number, reason: string): Promise<void> => {
    try {
      await api.post(`/api/verification/admin/document/${documentId}/reject`, { reason });
    } catch (error) {
      console.error('❌ Error rejecting document:', error);
      throw error;
    }
  },

  // Obtener documento específico
  getDocument: async (documentId: number): Promise<AdminVerificationDocument> => {
    try {
      const response = await api.get<AdminVerificationDocument>(`/api/verification/admin/document/${documentId}`);
      return response.data!;
    } catch (error) {
      console.error('❌ Error fetching document:', error);
      throw error;
    }
  },

  // Obtener documentos de un usuario específico
  getUserDocuments: async (userId: number): Promise<AdminVerificationDocument[]> => {
    try {
      const response = await api.get<AdminVerificationDocument[]>(`/api/verification/admin/user/${userId}/documents`);
      return response.data!;
    } catch (error) {
      console.error('❌ Error fetching user documents:', error);
      throw error;
    }
  },
};