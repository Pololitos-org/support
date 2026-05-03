import { api } from './api';

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  profilePictureUrl?: string;
  state: string;
}

export const communicationsService = {
  /**
   * Dispara el envío de notificaciones push a perfiles incompletos
   */
  async sendIncompleteProfilePush(title: string, message: string): Promise<{ success: boolean; sent?: number; message?: string; error?: string }> {
    return communicationsService.sendPushNotification(title, message, 'INCOMPLETE_PROFILES', []);
  },

  /**
   * Nuevo endpoint flexible: envía push a perfiles incompletos o a usuarios específicos
   */
  async sendPushNotification(
    title: string, 
    message: string, 
    mode: 'INCOMPLETE_PROFILES' | 'SPECIFIC_USERS',
    userIds: number[],
    path?: string
  ): Promise<{ success: boolean; sent?: number; message?: string; error?: string }> {
    try {
      const response = await api.post<{ success: boolean; sent?: number; message?: string; error?: string }>(
        '/api/admin/communications/push-notification',
        { title, message, mode, userIds, path }
      );
      return response.data || { success: false, error: 'No data returned' };
    } catch (error: any) {
      console.error('Error triggering push notifications:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  /**
   * Busca usuarios por nombre o email (reutiliza adminUsersService)
   */
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const response = await api.get<{ success: boolean; data: { users: UserSearchResult[] } }>(
        `/api/admin/users?search=${encodeURIComponent(query)}&limit=20`
      );
      // La API retorna { success: true, data: { users: [], pagination: {} } }
      return response.data?.data?.users || [];
    } catch (error: any) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  /**
   * Crea un ticket de soporte en nombre del usuario y le envía una notificación push.
   * Equivale al "mensaje directo" del panel admin de la app mobile.
   */
  async sendDirectMessage(
    userId: number,
    subject: string,
    message: string
  ): Promise<{ success: boolean; ticketId?: number; error?: string }> {
    try {
      const response = await api.post<{ ticket: { id: number } }>(
        '/api/support/admin/create-ticket',
        { userId, subject, message }
      );
      const ticketId = response.data?.ticket?.id;
      return { success: true, ticketId };
    } catch (error: any) {
      console.error('Error sending direct message:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  /**
   * Dispara la campaña de email masivo SES
   */
  async sendSESCampaign(audience: 'WORK' | 'HIRE' | 'BOTH', subject: string, html: string): Promise<{ success: boolean; message?: string; targetCount?: number; error?: string }> {
    try {
      const response = await api.post<{ success: boolean; message?: string; targetCount?: number; error?: string }>(
        '/api/admin/communications/ses-campaign',
        { audience, subject, html }
      );
      return response.data || { success: false, error: 'No data returned' };
    } catch (error: any) {
      console.error('Error triggering SES campaign:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }
};
