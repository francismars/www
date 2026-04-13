const projects = [
  {
    name: "Chain Duel",
    type: "Lightning Game",
    description: "A real-time multiplayer game where every move is settled on Lightning. Players duel competitively with instant microtransactions — no sign-ups, no custodians, just sats. Running live at Bitcoin conferences worldwide for 3+ years, with hundreds of matches played on stage and on the arcade cabinet.",
    github: "https://github.com/francismars/chain-duel",
    website: "https://chainduel.net",
    tags: ["Bitcoin", "Lightning", "Gaming", "JavaScript", "Real-time", "PixiJS"]
  },
  {
    name: "MarsPay",
    type: "Lightning Backend",
    description: "The payment engine behind Chain Duel. A modular backend that handles WebSocket game state, LNURL generation, LNbits withdrawals, and Nostr (NDK) zap support. Server owns the state; clients send inputs. Designed so any 1v1 game can plug in Lightning payments without touching the payment logic.",
    github: "https://github.com/francismars/marspay",
    website: "#",
    tags: ["Bitcoin", "Lightning", "LNbits", "WebSocket", "Node.js", "TypeScript"]
  },
  {
    name: "PubPay",
    type: "Nostr App",
    description: "A Nostr-native tool for public, shareable payment requests — no sign-ups, no fees. Powers PubPay Live, a real-time zap display for live events, and PubPay Multi Live, a multi-stage conference tool with timeline editor and auto-rotation. Battle-tested at Bitcoin 2025, BCC8333, and Adopting Bitcoin.",
    github: "https://github.com/francismars/PubPay",
    website: "https://pubpay.me",
    tags: ["Bitcoin", "Lightning", "Nostr", "Node.js", "JavaScript", "React"]
  },
  {
    name: "Homeserver Dashboard",
    type: "Admin UI",
    description: "A Next.js admin UI built for Pubky homeserver management during an engagement with Synonym. Features user management, a WebDAV file browser, API explorer, and Docker/Umbrel integration with Tailscale tunnel support for air-gapped or closed networks.",
    github: "https://github.com/francismars/homeserver-dashboard",
    website: "#",
    tags: ["Next.js", "TypeScript", "Docker", "Tailscale", "Pubky", "Tailwind"]
  }
]; 