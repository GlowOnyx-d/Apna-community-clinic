/**
 * Helper to determine the best mobile-reachable URL for QR codes.
 * When running locally on developer machine, localhost (127.0.0.1) cannot be reached
 * by external mobile phones. Instead, the local Wi-Fi LAN IP is used so phones on the same
 * Wi-Fi network connect smoothly.
 */
export function getMobileReachableUrl(overrideIp) {
  if (typeof window === 'undefined') return 'https://arogyaclinic.org';

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost) {
    const ip = overrideIp || '192.168.1.6';
    const port = window.location.port ? `:${window.location.port}` : ':5173';
    return `http://${ip}${port}`;
  }

  return window.location.origin;
}
