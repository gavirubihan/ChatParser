<p align="center">
  <img src="public/chatparser.svg" width="120" height="120" alt="ChatParser Logo" style="border-radius: 24px" />
</p>

<h1 align="center">ChatParser</h1>

<p align="center">
  <strong>A private and seamless way to view WhatsApp chat exports.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Privacy-100%25_Local%20(Zero--Server)-00a884?style=for-the-badge&logo=shield" alt="Privacy Badge" />
  <img src="https://img.shields.io/badge/Framework-React_19-61DAFB?style=for-the-badge&logo=react" alt="React Badge" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript Badge" />
  <img src="https://img.shields.io/badge/Build-Vite_8-646CFF?style=for-the-badge&logo=vite" alt="Vite Badge" />
  <img src="https://img.shields.io/badge/App-PWA_Ready-00a884?style=for-the-badge&logo=pwa" alt="PWA Badge" />
  <img src="https://img.shields.io/badge/Performance-60_FPS_Virtual_Scrolling-8b5cf6?style=for-the-badge&logo=lightning" alt="Performance Badge" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel Badge" />
</p>

---

## 📸 Preview

<p align="center">
  <img src="public/chatparser_preview.webp" width="100%" alt="ChatParser Preview" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2)" />
</p>

---

## ✨ Why ChatParser?

WhatsApp allows you to export your chat history, but it leaves you with a raw text file or a messy ZIP that's hard to read and easy to lose. **ChatParser bridges that gap.** 

We transform those raw exports into a premium, interactive experience that feels like the original app—only faster, more searchable, and completely offline.

> [!IMPORTANT]
> **Zero-Server Architecture:** Your chats never leave your device. All parsing and media rendering happen locally in your browser's memory using IndexedDB and modern Web APIs.

---

## 🚀 Key Features

| 🛡️ 100% Private | ⚡ High Performance | 🖼️ Full Media Support |
| :--- | :--- | :--- |
| No data is ever uploaded. Everything stays in your browser's IndexedDB. | Handles 500k+ messages with ease using advanced virtualization. | Native playback for images, videos, audio, and documents. |

| 🔍 Smart Search | 🌓 Dynamic Themes | 📱 Installable PWA |
| :--- | :--- | :--- |
| Filter by date, message type, or instant text search across years of history. | Beautiful Light and Dark modes that respect your system settings. | Install on your phone or desktop and share files directly to it. |

---

## 📂 How It Works

1. **Export:** Open any chat in WhatsApp → Menu → More → **Export Chat**.
2. **Include Media:** Choose "Include Media" to generate a ZIP file (recommended).
3. **Upload:** Drag & drop your `.zip` or `.txt` file into ChatParser.
4. **Relive:** Browse your memories in a beautiful, high-speed interface.

---

## 🛠️ Tech Stack

- **Core:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **State & Storage:** [IndexedDB (idb)](https://github.com/jakearchibald/idb), [JSZip](https://stuk.github.io/jszip/)
- **Rendering:** [Virtua](https://github.com/inokawa/virtua) for 60FPS list virtualization
- **Experience:** [Vite PWA](https://vite-pwa-org.netlify.app/) for offline support and Share Target API

---

## 💻 Local Development

Want to run ChatParser on your own hardware?

```bash
# Clone the repository
git clone https://github.com/gavirubihan/ChatParser.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

<p align="center">
  Built with ❤️ for privacy and memories.
</p>

<p align="center">
  © 2024 ChatParser · Owned by <a href="https://neovise.me">neovise.me</a> · <a href="https://chatparser.online">Live Site</a>
</p>
