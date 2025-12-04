import api from './api';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  defaultSubject: string;
}

export interface RecipientGroup {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface SendResult {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

export const emailAPI = {
  getTemplates: async () => {
    const response = await api.get('/admin/emails/templates');
    return response.data;
  },

  getRecipientGroups: async () => {
    const response = await api.get('/admin/emails/recipient-groups');
    return response.data;
  },

  previewEmail: async (data: {
    templateId?: string;
    title?: string;
    subject?: string;
    content: string;
  }) => {
    const response = await api.post('/admin/emails/preview', data);
    return response.data;
  },

  sendBulkEmail: async (data: {
    templateId?: string;
    recipientGroup?: string;
    customEmails?: string[];
    subject?: string;
    title?: string;
    content: string;
    scheduledAt?: string;
  }) => {
    const response = await api.post('/admin/emails/send', data);
    return response.data;
  },

  sendTestEmail: async (data: {
    testEmail: string;
  }) => {
    const response = await api.post('/admin/emails/test', data);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/admin/emails/history');
    return response.data;
  }
};
