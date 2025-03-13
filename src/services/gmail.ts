import type { EmailData } from '../types';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify'
];

export const getGmailAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    response_type: 'token',
    scope: SCOPES.join(' '),
    access_type: 'online',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const fetchEmails = async (accessToken: string, maxResults = 20): Promise<EmailData[]> => {
  try {
    // First, fetch message list
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (!listResponse.ok) throw new Error('Failed to fetch message list');
    const listData = await listResponse.json();
    
    if (!listData.messages) return [];

    // Then fetch full message details for each message
    const emails = await Promise.all(
      listData.messages.map(async (message: { id: string }) => {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        if (!messageResponse.ok) throw new Error('Failed to fetch message details');
        const messageData = await messageResponse.json();
        
        const headers = messageData.payload?.headers || [];
        console.log(headers);
        const sender = headers.find((h: any) => h.name === 'From')?.value || '';
        console.log(sender);
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
        console.log(subject);
        
        // Extract content from message parts
        const parts = messageData.payload?.parts || [];
        const content = parts
          .filter((part: any) => part.mimeType === 'text/plain')
          .map((part: any) => {
            try {
              return atob(part.body?.data?.replace(/-/g, '+').replace(/_/g, '/') || '');
            } catch {
              return '';
            }
          })
          .join('\n');

        // Extract links from HTML content
        const htmlParts = parts.filter((part: any) => part.mimeType === 'text/html');
        const links = htmlParts
          .map((part: any) => {
            try {
              const html = atob(part.body?.data?.replace(/-/g, '+').replace(/_/g, '/') || '');
              const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
              const matches = [...html.matchAll(linkRegex)];
              return matches.map(match => match[1]);
            } catch {
              return [];
            }
          })
          .flat();

        // Extract attachments
        const attachments = parts
          .filter((part: any) => part.filename)
          .map((part: any) => part.filename)
          .filter(Boolean);

        return {
          sender,
          subject,
          content,
          links,
          attachments
        };
      })
    );

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};