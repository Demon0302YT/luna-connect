/**
 * Luna Connect - LAN Broadcast Utility
 *
 * This module handles the core logic for:
 * 1. Broadcasting a remote Bedrock server as a LAN game (like BedrockTogether)
 * 2. Building the MOTD/ping packet that Minecraft Bedrock expects
 *
 * How it works:
 * - Minecraft Bedrock scans for LAN games by listening on UDP port 19132
 * - It expects "Unconnected Ping" packets and responds with server info
 * - Luna Connect intercepts those and responds as if the remote server is local
 *
 * Note: Full UDP socket broadcast requires native Android code.
 * This module generates the config/instructions and interfaces with
 * the native module (LunaConnectNative) when available.
 */

// Bedrock LAN advertisement packet structure
// Format: "MCPE;<motd>;<protocol>;<version>;<players>;<maxPlayers>;<id>;<subMotd>;<gamemode>;<nintendoLimited>;<port4>;<port6>;"
export function buildBedrockMotdPacket(serverInfo) {
  const {
    name = 'Luna Connect Server',
    host,
    port = 19132,
    protocol = 594,
    version = '1.20.80',
    players = 0,
    maxPlayers = 20,
    gamemode = 'Survival',
  } = serverInfo;

  const serverId = Math.floor(Math.random() * 9999999999999);
  const motd = [
    'MCPE',
    name,
    protocol,
    version,
    players,
    maxPlayers,
    serverId,
    'Luna Connect',
    gamemode,
    '1',
    port,
    '19133',
    '',
  ].join(';');

  return motd;
}

// Build the unconnected pong response header (RakNet protocol)
// Byte layout: [0x1C][timestamp 8 bytes][magic 16 bytes][server id 8 bytes][motd string]
export function buildRakNetPongPacket(motd, serverGuid) {
  const OFFLINE_MESSAGE_DATA = [
    0x00, 0xff, 0xff, 0x00, 0xfe, 0xfe, 0xfe, 0xfe,
    0xfd, 0xfd, 0xfd, 0xfd, 0x12, 0x34, 0x56, 0x78,
  ];

  const motdBytes = stringToBytes(motd);
  const totalLen = 1 + 8 + 16 + 8 + 2 + motdBytes.length;
  const buf = new Uint8Array(totalLen);
  let offset = 0;

  // Packet ID: Unconnected Pong
  buf[offset++] = 0x1c;

  // Timestamp (8 bytes, we use 0 for simplicity)
  for (let i = 0; i < 8; i++) buf[offset++] = 0;

  // Server GUID (8 bytes)
  const guidBytes = bigIntToBytes(BigInt(serverGuid), 8);
  for (let i = 0; i < 8; i++) buf[offset++] = guidBytes[i];

  // Offline message magic (16 bytes)
  for (let i = 0; i < 16; i++) buf[offset++] = OFFLINE_MESSAGE_DATA[i];

  // MOTD string length (2 bytes big-endian)
  buf[offset++] = (motdBytes.length >> 8) & 0xff;
  buf[offset++] = motdBytes.length & 0xff;

  // MOTD string bytes
  for (let i = 0; i < motdBytes.length; i++) buf[offset++] = motdBytes[i];

  return buf;
}

function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) & 0xff);
  }
  return bytes;
}

function bigIntToBytes(value, length) {
  const bytes = new Array(length).fill(0);
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}

// Generates the adb/shell command to start UDP broadcast on Android
// This is used when running via ADB or in development
export function getAndroidBroadcastCommand(host, port, localPort = 19132) {
  return `# Run on your Android device via ADB:
adb shell "while true; do
  nc -u -l ${localPort} | nc -u ${host} ${port}
done"`;
}

// VPN tunnel configuration for routing Bedrock traffic
export function buildTunnelConfig(server) {
  return {
    remoteHost: server.host,
    remotePort: server.port || 19132,
    localPort: 19132,
    protocol: server.type === 'java' ? 'tcp' : 'udp',
    useProxy: false,
    serverName: server.name,
  };
}

// Parse a server address like "play.example.com:19132" or "192.168.1.1"
export function parseServerAddress(address) {
  if (!address) return { host: '', port: null };

  const trimmed = address.trim();

  // IPv6
  if (trimmed.startsWith('[')) {
    const match = trimmed.match(/^\[([^\]]+)\](?::(\d+))?$/);
    if (match) return { host: match[1], port: match[2] ? parseInt(match[2]) : null };
  }

  // IPv4 or hostname with port
  const parts = trimmed.split(':');
  if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
    return { host: parts[0], port: parseInt(parts[1]) };
  }

  return { host: trimmed, port: null };
}

// Check if a port is valid
export function isValidPort(port) {
  const n = parseInt(port);
  return !isNaN(n) && n >= 1 && n <= 65535;
}

// Simulate pinging a server (in a real native app, this would use actual UDP/TCP)
export async function pingServer(host, port, type = 'bedrock') {
  return new Promise((resolve) => {
    // Simulate network latency
    const start = Date.now();
    setTimeout(() => {
      const ping = Date.now() - start;
      // In a real app: send actual UDP ping (Bedrock) or TCP (Java) packet
      resolve({ online: true, ping, players: 0, maxPlayers: 20 });
    }, 50 + Math.random() * 150);
  });
}
