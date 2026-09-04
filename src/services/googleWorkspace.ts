// Google Workspace client-side API helper
// Uses bearer access token obtained from GoogleAuthProvider popup

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
  attendees?: { email: string }[];
}

export interface DriveFolderResult {
  id: string;
  name: string;
  webViewLink: string;
}

export interface DriveFileUploadPayload {
  name: string;
  mimeType: string;
  content: string; // text content or base64
  folderId?: string;
}

export interface SheetsExportPayload {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface GmailSendPayload {
  to: string;
  subject: string;
  bodyText: string;
}

export const createCalendarEvent = async (
  token: string,
  event: CalendarEventPayload
): Promise<{ id: string; htmlLink: string }> => {
  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.startDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.attendees,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  return { id: data.id, htmlLink: data.htmlLink };
};

export const listCalendarEvents = async (
  token: string,
  timeMin?: string
): Promise<any[]> => {
  const now = timeMin || new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&maxResults=15&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to fetch calendar events: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
};

export const createDriveFolder = async (
  token: string,
  folderName: string
): Promise<DriveFolderResult> => {
  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Drive folder creation failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/drive/folders/${data.id}`,
  };
};

export const uploadDriveFile = async (
  token: string,
  payload: DriveFileUploadPayload
): Promise<{ id: string; name: string; webViewLink?: string }> => {
  const metadata: any = {
    name: payload.name,
    mimeType: payload.mimeType,
  };
  if (payload.folderId) {
    metadata.parents = [payload.folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${payload.mimeType}\r\n\r\n` +
    payload.content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Google Drive upload failed: ${response.status}`);
  }

  return await response.json();
};

export const createSpreadsheetWithData = async (
  token: string,
  payload: SheetsExportPayload
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  // Step 1: Create spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: payload.title,
      },
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Failed to create Google Sheet: ${createRes.status}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Step 2: Append rows
  const values = [payload.headers, ...payload.rows];
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Could not populate initial rows into new sheet');
  }

  return { spreadsheetId, spreadsheetUrl };
};

export const sendGmailMessage = async (
  token: string,
  payload: GmailSendPayload
): Promise<{ id: string }> => {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;
  const messageParts = [
    `To: ${payload.to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    payload.bodyText,
  ];
  const message = messageParts.join('\r\n');

  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gmail API error: ${response.status}`);
  }

  return await response.json();
};
