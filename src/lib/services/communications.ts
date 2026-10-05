import { api } from './api';

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  profilePictureUrl?: string;
  state: string;
}

export type ActivitySegment =
  | 'no_publish_7d'
  | 'no_apply_7d'
  | 'task_no_offers_72h'
  | 'offer_no_response_48h'
  | 'assigned_no_complete_5d'
  | 'inactive_30d';

export const communicationsService = {
  async sendIncompleteProfilePush(title: string, message: string): Promise<{ success: boolean; sent?: number; message?: string; error?: string }> {
    return communicationsService.sendPushNotification(title, message, ['INCOMPLETE_PROFILES'], []);
  },

  async sendPushNotification(
    title: string,
    message: string,
    modes: string[],
    userIds: number[],
    path?: string,
    type?: 'ACTION_NEEDED' | 'CUSTOM_MESSAGE'
  ): Promise<{ success: boolean; sent?: number; message?: string; error?: string }> {
    try {
      const response = await api.post<{ success: boolean; sent?: number; message?: string; error?: string }>(
        '/api/admin/communications/push-notification',
        { title, message, modes, userIds, path, type }
      );
      return response.data || { success: false, error: 'No data returned' };
    } catch (error: any) {
      console.error('Error triggering push notifications:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  async searchUsers(query: string): Promise<UserSearchResult[]> {
    try {
      const response = await api.get<{ success: boolean; data: { users: UserSearchResult[] } }>(
        `/api/admin/users?search=${encodeURIComponent(query)}&limit=20`
      );
      return response.data?.data?.users || [];
    } catch (error: any) {
      console.error('Error searching users:', error);
      return [];
    }
  },

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
  },

  async sendTestEmail(to: string, subject: string, html: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await api.post<{ success: boolean; messageId?: string; error?: string }>(
        '/api/admin/emails/test',
        { to, subject, html }
      );
      return response.data || { success: false, error: 'No data returned' };
    } catch (error: any) {
      console.error('Error sending test email:', error);
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  async getAudienceCount(audience: 'WORK' | 'HIRE' | 'BOTH'): Promise<{ count: number }> {
    try {
      const response = await api.get<{ success: boolean; count: number }>(
        `/api/admin/communications/ses-count?audience=${audience}`
      );
      return { count: response.data?.count ?? 0 };
    } catch (error: any) {
      console.error('Error getting audience count:', error);
      return { count: 0 };
    }
  },

  async getCustomSegmentCount(condition: string, days: number, role: string): Promise<{ count: number; userIds: number[] }> {
    try {
      const response = await api.get<{ success: boolean; count: number; userIds: number[] }>(
        `/api/admin/segments/custom?condition=${condition}&days=${days}&role=${role}`
      );
      return { count: response.data?.count ?? 0, userIds: response.data?.userIds ?? [] };
    } catch (error: any) {
      console.error('Error getting custom segment count:', error);
      return { count: 0, userIds: [] };
    }
  },

  async getUnionCount(modes: string[], userIds: number[]): Promise<{ count: number }> {
    try {
      const params = new URLSearchParams();
      if (modes.length) params.set('modes', modes.join(','));
      if (userIds.length) params.set('userIds', userIds.join(','));
      const response = await api.get<{ success: boolean; count: number }>(
        `/api/admin/segments/union-count?${params.toString()}`
      );
      return { count: response.data?.count ?? 0 };
    } catch {
      return { count: 0 };
    }
  },

  async getSegmentCount(segmentName: ActivitySegment | string): Promise<{ count: number; userIds: number[] }> {
    try {
      const response = await api.get<{ success: boolean; count: number; userIds: number[] }>(
        `/api/admin/segments/${segmentName}`
      );
      return { count: response.data?.count ?? 0, userIds: response.data?.userIds ?? [] };
    } catch (error: any) {
      console.error('Error getting segment count:', error);
      return { count: 0, userIds: [] };
    }
  }
};
