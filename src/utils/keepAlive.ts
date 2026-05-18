import https from 'https';
import http from 'http';

export const keepAlive = (): void => {
  const renderUrl = process.env.RENDER_URL;

  if (!renderUrl) {
    console.log('[KeepAlive] RENDER_URL not set — skipping keep-alive pings.');
    return;
  }

  const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

  const ping = (): void => {
    const client = renderUrl.startsWith('https') ? https : http;
    client
      .get(renderUrl, (res) => {
        console.log(`[KeepAlive] ✅ Ping successful — status: ${res.statusCode} at ${new Date().toISOString()}`);
      })
      .on('error', (err: Error) => {
        console.error(`[KeepAlive] ❌ Ping failed — ${err.message} at ${new Date().toISOString()}`);
      });
  };

  setInterval(ping, INTERVAL_MS);
  console.log(`[KeepAlive] 🔄 Pinging ${renderUrl} every 14 minutes to prevent sleep.`);
};
