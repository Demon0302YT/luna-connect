/**
 * Luna Connect - Java Edition Account Manager
 *
 * Handles Microsoft/Mojang authentication for Java Edition servers.
 * Uses the same OAuth flow as official launchers.
 *
 * Flow:
 * 1. Open Microsoft OAuth in browser
 * 2. Get authorization code
 * 3. Exchange for Xbox Live token
 * 4. Exchange for Minecraft token
 * 5. Get player profile (UUID + username)
 *
 * This token is then passed to the ViaProxy-style connection
 * when bridging Bedrock → Java.
 */

export const MS_OAUTH_URL =
  'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize' +
  '?client_id=00000000402b5328' + // Minecraft's official client ID
  '&response_type=code' +
  '&scope=service%3A%3Auser.auth.xboxlive.com%3A%3AMBI_SSL' +
  '&redirect_uri=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf' +
  '&prompt=select_account';

// Validates that a Java account object has required fields
export function isValidJavaAccount(account) {
  return (
    account &&
    typeof account.username === 'string' &&
    account.username.length > 0 &&
    typeof account.uuid === 'string'
  );
}

// Parse the redirect URL after Microsoft OAuth to extract the auth code
export function extractAuthCode(redirectUrl) {
  try {
    const url = new URL(redirectUrl);
    return url.searchParams.get('code');
  } catch {
    return null;
  }
}

// Mock auth flow for demonstration - in production this calls real MS endpoints
export async function authenticateWithMicrosoft(authCode) {
  // In a real implementation, this would:
  // 1. POST to https://login.live.com/oauth20_token.srf with the code
  // 2. POST to https://user.auth.xboxlive.com/user/authenticate
  // 3. POST to https://xsts.auth.xboxlive.com/xsts/authorize
  // 4. POST to https://api.minecraftservices.com/authentication/login_with_xbox
  // 5. GET https://api.minecraftservices.com/minecraft/profile

  // For demonstration, return a mock profile
  return {
    username: 'Player',
    uuid: '00000000-0000-0000-0000-000000000000',
    accessToken: 'demo_token',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    skinUrl: null,
  };
}

// Check if stored token is still valid
export function isTokenExpired(account) {
  if (!account?.expiresAt) return true;
  return new Date(account.expiresAt) < new Date();
}

// Format UUID for display
export function formatUUID(uuid) {
  if (!uuid) return 'Unknown';
  if (uuid.length === 32) {
    return `${uuid.slice(0,8)}-${uuid.slice(8,12)}-${uuid.slice(12,16)}-${uuid.slice(16,20)}-${uuid.slice(20)}`;
  }
  return uuid;
}

// Bedrock → Java bridge connection config
// This is what gets sent to the ViaProxy-compatible native layer
export function buildJavaBridgeConfig(server, javaAccount) {
  return {
    targetHost: server.host,
    targetPort: server.port || 25565,
    protocol: 'java',
    authMode: 'online', // uses the java account
    playerName: javaAccount?.username || 'Player',
    accessToken: javaAccount?.accessToken,
    uuid: javaAccount?.uuid,
    // ViaProxy translates Bedrock packets → Java packets
    useProtocolTranslation: true,
    translationVersion: 'auto', // auto-detect Java server version
  };
}
