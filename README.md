# OmniX Assistant

OmniX is a personal AI assistant built with **React Native**.  
It’s designed to run on-device, connect to local models, and provide a modular UI for creating and managing specialized assistants.

---

## 🚀 Features
- **Chatbot Screen** – user ↔ assistant messaging with LLM hook (local-ready)  
- **Matrix Rain Screen** – blue digital rain animation effect  
- **Inception Screen** – brainstorm ideas, expand rough thoughts into structured concepts  
- **Agent Creator Screen** – form-based UI to create specialized assistants (therapy, coding, etc.)  
- **Drawer Navigation** – access any screen from anywhere via hamburger menu  

---

## 🎨 UI Theme
- **Background**: Graphite Black `#0A0D12`  
- **Primary Accent**: Neon Cyan `#00E6FF`  
- **Secondary Accent**: Electric Blue `#2EC9FF`  
- **Tertiary Accent**: Tech Teal `#00B3B3`  
- **Neutral Slate**: `#2C3540` (dividers, outlines)  
- **Neutral Steel**: `#7A8691` (secondary text)  

---

## 🛠 Installation

### Prerequisites
- Node.js (LTS)
- Java 17 (Temurin/OpenJDK/Oracle)
- Android Studio SDK + Platform Tools
- React Native CLI

### Clone & Install
```bash
git clone https://github.com/YOUR-USERNAME/OmniX.git
cd OmniX
npm install
```

### Run
- Start Metro: `npm start`
- Android: `npm run android`
- iOS (macOS): `npm run ios`

### Test
- Without Watchman: `npx jest --no-watchman`

---

## 🧠 Local LLMs (Scaffold)
- App includes a thin LLM service wired for a native llama.cpp bridge.
- Configure a local GGUF path in App Settings: “Local Model Path (GGUF)”.
- Until the native bridge is implemented, the app falls back to echo responses.

Implementation notes:
- `src/native/llamaBridge.ts`: native module contract and graceful fallback.
- `src/services/llm.ts`: init/load, generateOnce, and a simple generateStream shim.
- Chatbot and Inception screens call into this service and will stream once the bridge is added.

## ⬇️ Hugging Face (Scaffold)
- `src/services/hf.ts` provides a small catalog and URL helpers.
- Android native downloader scaffold is included (`HFDownloader` via DownloadManager). Add UI wiring to create real tasks.
- Use App Settings “Hugging Face Token (optional)” for private repos/rate limits.

## 🗄️ Memory
- AsyncStorage-backed assistants, conversations, app settings.
- Settings include: clear-on-exit and keep-last-N messages per conversation.
