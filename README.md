# 🌙 Luna Connect

**Minecraft Server Tunnel App** — Connect to remote Bedrock servers via LAN, and join Java Edition servers from Bedrock.

Works like **BedrockTogether** for Bedrock servers, and includes a **Bedrock → Java protocol bridge** for Java Edition servers (requires a valid Java account).

---

## ✨ Features

| Feature | Details |
|---|---|
| 🟢 Bedrock LAN Tunnel | Connects to remote Bedrock servers and broadcasts as a LAN game |
| ☕ Java Edition Support | Bridges Java servers to Bedrock via protocol translation |
| 👤 Java Account | Microsoft OAuth or manual username entry |
| 📋 Server List | Save multiple servers, view connection status |
| 🌙 Dark UI | Beautiful dark theme designed for Minecraft players |

---

## 📱 How to Build the APK

### Prerequisites

You need:
- [Node.js](https://nodejs.org) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/eas/) (Expo Application Services)
- An [Expo account](https://expo.dev) (free)

### Step 1 — Install dependencies

```bash
cd luna-connect
npm install
```

### Step 2 — Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 3 — Log in to Expo

```bash
eas login
```

### Step 4 — Configure the project

```bash
eas build:configure
```

### Step 5 — Build the APK

```bash
# Build a .apk file (sideloadable, no Play Store needed)
npm run build:apk

# OR using EAS directly:
eas build --platform android --profile preview
```

EAS will:
1. Upload your code to Expo's build servers
2. Compile it into a signed `.apk`
3. Give you a download link when done (~5–10 minutes)

### Step 6 — Install on Android

Download the `.apk` from the link EAS gives you, then:

1. On your Android device, go to **Settings → Security**
2. Enable **"Install from Unknown Sources"** (or "Install Unknown Apps")
3. Open the downloaded `.apk` and tap Install

---

## 🛠️ Local Development (without building APK)

### Using Expo Go (fastest)

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your Android/iOS device.

### Using Android Emulator

```bash
npx expo start --android
```

---

## 🏗️ Project Structure

```
luna-connect/
├── App.js                          # Entry point, navigation
├── app.json                        # Expo config
├── eas.json                        # Build profiles (APK / AAB)
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # Server list
│   │   ├── AddServerScreen.js      # Add/edit server
│   │   ├── ServerDetailScreen.js   # Connect / tunnel screen
│   │   └── SettingsScreen.js       # Java account management
│   ├── components/
│   │   ├── ServerCard.js           # Server list item
│   │   └── EmptyState.js           # Empty list placeholder
│   ├── context/
│   │   └── ServersContext.js       # Global state (servers, account)
│   └── utils/
│       ├── lanBroadcast.js         # LAN broadcast logic (Bedrock)
│       ├── javaAuth.js             # Java/Microsoft auth flow
│       └── connectionManager.js    # Connection state & tunnel logic
```

---

## 🔧 How the Tunnel Works

### Bedrock Servers

1. Luna Connect resolves the remote server's IP and port
2. Creates a UDP tunnel from your local port 19132 → remote server
3. Broadcasts a fake "Unconnected Pong" packet on the local network
4. Minecraft Bedrock sees it as a LAN game in the **Friends tab**

This is identical to how **BedrockTogether** works.

### Java Edition Servers

1. User must have a valid Java account (Microsoft login or manual)
2. Luna Connect starts a local protocol translation proxy
3. The proxy translates Bedrock packets ↔ Java packets (like GeyserMC, client-side)
4. Your Java account token is used to authenticate with the Java server
5. Minecraft Bedrock connects to it via the LAN tab

---

## ⚠️ Native Android Requirements

For full LAN broadcast functionality (real UDP socket binding), the app needs a **native Android module**. The current implementation uses Expo's managed workflow which simulates the connection.

To add real native UDP broadcast, add this to `android/app/src/main/java/.../`:

```java
// LunaBroadcastModule.java
// Binds to UDP 19132, forwards to remote host:port
// Sends RakNet Unconnected Pong responses to local network
```

And register it in `MainApplication.java`.

For full production release, eject from Expo managed workflow:
```bash
npx expo eject
# Then add the native Android UDP module
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `expo` | React Native framework |
| `@react-navigation/native` | Screen navigation |
| `expo-linear-gradient` | UI gradients |
| `@react-native-async-storage/async-storage` | Persistent server storage |
| `expo-network` | Network info |
| `expo-clipboard` | Copy server addresses |

---

## 🚀 Roadmap

- [ ] Real native UDP socket module (full LAN broadcast)
- [ ] Microsoft OAuth deep link callback
- [ ] Server ping / player count display  
- [ ] QR code sharing for servers
- [ ] Background tunnel (foreground service)
- [ ] Multiple simultaneous tunnels
- [ ] Server icons / custom logos

---

## 📄 License

MIT — build, modify, share freely.
