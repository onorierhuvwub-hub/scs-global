import { getAdminTokenFromCookieHeader, verifyAdminSessionToken } from '@/lib/admin-session';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character] || character));

export async function POST(request: Request) {
  const sessionToken = getAdminTokenFromCookieHeader(request.headers.get('cookie'));
  if (!verifyAdminSessionToken(sessionToken)) {
    return Response.json({ error: 'Admin sign-in is required.' }, { status: 401 });
  }

  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return Response.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return Response.json({ error: 'Email is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to the server environment.' }, { status: 503 });
  }

  let payload: { recipientEmail?: string; recipientName?: string; trackingNumber?: string; origin?: string; destination?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { recipientEmail, recipientName, trackingNumber, origin, destination } = payload;
  if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail) || !recipientName || !trackingNumber || !origin || !destination) {
    return Response.json({ error: 'Recipient name, valid email, tracking number, origin, and destination are required.' }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const trackingUrl = `${siteUrl.replace(/\/$/, '')}/track?tn=${encodeURIComponent(trackingNumber)}`;
  const safeName = escapeHtml(recipientName);
  const safeTrackingNumber = escapeHtml(trackingNumber);
  const safeOrigin = escapeHtml(origin);
  const safeDestination = escapeHtml(destination);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `Shipment registered: ${trackingNumber}`,
      html: `<p>Hello ${safeName},</p><p>Your shipment has been registered.</p><p><strong>Tracking number:</strong> ${safeTrackingNumber}<br><strong>Route:</strong> ${safeOrigin} to ${safeDestination}</p><p><a href="${escapeHtml(trackingUrl)}">Track your shipment</a></p>`,
      text: `Hello ${recipientName},\n\nYour shipment has been registered.\nTracking number: ${trackingNumber}\nRoute: ${origin} to ${destination}\nTrack your shipment: ${trackingUrl}`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error('Shipment email provider error:', response.status, details);
    return Response.json({ error: 'The shipment was registered, but the notification email could not be sent.' }, { status: 502 });
  }

  return Response.json({ sent: true });
}
