/**
 * Luna Connect - Connection Manager
 *
 * Manages active tunnel connections between the device and remote servers.
 * Tracks state, handles reconnection, and provides status updates.
 */

export const CONNECTION_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  BROADCASTING: 'broadcasting',
  ERROR: 'error',
  DISCONNECTED: 'disconnected',
};

export const SERVER_TYPES = {
  BEDROCK: 'bedrock',
  JAVA: 'java',
};

// Returns a human-readable description of what Luna Connect is doing
export function getConnectionDescription(status, serverType) {
  switch (status) {
    case CONNECTION_STATUS.CONNECTING:
      return serverType === SERVER_TYPES.JAVA
        ? 'Authenticating with Java Edition...'
        : 'Connecting to Bedrock server...';
    case CONNECTION_STATUS.CONNECTED:
      return 'Tunnel established';
    case CONNECTION_STATUS.BROADCASTING:
      return serverType === SERVER_TYPES.JAVA
        ? 'Broadcasting Java server as LAN (with translation)'
        : 'Broadcasting as LAN game — open Minecraft!';
    case CONNECTION_STATUS.ERROR:
      return 'Connection failed';
    case CONNECTION_STATUS.DISCONNECTED:
      return 'Disconnected';
    default:
      return 'Not connected';
  }
}

// Step-by-step instructions shown to users after connecting
export function getConnectionInstructions(server) {
  if (server.type === SERVER_TYPES.JAVA) {
    return [
      'Luna Connect is translating Java ↔ Bedrock packets',
      'Open Minecraft Bedrock Edition',
      'Go to Play → Friends tab',
      `Look for "${server.name}" under LAN Games`,
      'Tap to join — your Java account will authenticate',
    ];
  }

  return [
    'Luna Connect is broadcasting the server as a LAN game',
    'Open Minecraft Bedrock Edition on this device',
    'Go to Play → Friends tab',
    `Look for "${server.name}" under LAN Games`,
    'Tap to join!',
  ];
}

// Simulate establishing a connection (in production, this calls native code)
export async function connectToServer(server, javaAccount, onStatusUpdate) {
  const steps = server.type === SERVER_TYPES.JAVA
    ? [
        { status: CONNECTION_STATUS.CONNECTING, message: 'Verifying Java account...', delay: 800 },
        { status: CONNECTION_STATUS.CONNECTING, message: 'Resolving server address...', delay: 600 },
        { status: CONNECTION_STATUS.CONNECTING, message: 'Establishing tunnel...', delay: 1000 },
        { status: CONNECTION_STATUS.CONNECTED, message: 'Tunnel established!', delay: 500 },
        { status: CONNECTION_STATUS.BROADCASTING, message: 'Broadcasting as LAN...', delay: 0 },
      ]
    : [
        { status: CONNECTION_STATUS.CONNECTING, message: 'Resolving server address...', delay: 500 },
        { status: CONNECTION_STATUS.CONNECTING, message: 'Pinging server...', delay: 700 },
        { status: CONNECTION_STATUS.CONNECTED, message: 'Connected!', delay: 400 },
        { status: CONNECTION_STATUS.BROADCASTING, message: 'Broadcasting as LAN...', delay: 0 },
      ];

  for (const step of steps) {
    if (step.delay > 0) {
      await new Promise(r => setTimeout(r, step.delay));
    }
    onStatusUpdate(step.status, step.message);
  }

  return { success: true };
}

export async function disconnectFromServer(serverId) {
  // In production: kill the native UDP/TCP tunnel process
  await new Promise(r => setTimeout(r, 300));
  return { success: true };
}

// Get color for status indicator
export function getStatusColor(status) {
  switch (status) {
    case CONNECTION_STATUS.CONNECTED:
    case CONNECTION_STATUS.BROADCASTING:
      return '#4ade80';
    case CONNECTION_STATUS.CONNECTING:
      return '#fbbf24';
    case CONNECTION_STATUS.ERROR:
      return '#f87171';
    default:
      return '#6b7280';
  }
}
