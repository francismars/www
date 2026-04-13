// Contributions data
const contributions = [
  {
    name: "Satsigner",
    type: "Bitcoin Mobile App",
    description: "A self-custodial Bitcoin mobile signer with UTXO control, message signing, and visual chain analysis. Contributed React Native frontend work, focusing on Bitcoin-specific UX patterns and the BDK integration layer.",
    github: "https://github.com/satsigner/satsigner",
    website: "https://satsigner.com",
    tags: ["Bitcoin", "BDK", "Mobile", "React Native", "TypeScript"]
  },
  {
    name: "Stable Channels",
    type: "Lightning Development",
    description: "A self-custodial way to peg bitcoin to a dollar balance using Lightning channels, with automatic rebalancing based on price feeds — no stablecoin issuer, no custodian. Contributed to the core channel management and rebalancing logic.",
    github: "https://github.com/toneloc/stable-channels",
    website: "https://stablechannels.com",
    tags: ["Bitcoin", "Lightning", "Rust", "BDK", "LDK", "Stablecoin"]
  },
  {
    name: "lnurlp",
    type: "Lightning Development",
    description: "An LNbits extension for static LNURL-pay QR codes and Lightning addresses. Contributed fixes and improvements to the payment flow and address resolution logic.",
    github: "https://github.com/lnbits/lnurlp",
    website: "#",
    tags: ["Bitcoin", "Lightning", "Python", "LNURL", "Payments"]
  },
  {
    name: "Nigiri Bitcoin",
    type: "Bitcoin Development",
    description: "A Docker-based Bitcoin regtest environment with Bitcoin Core, Elements, and supporting services — the standard local dev setup for Liquid/Bitcoin work. Contributed to tooling and environment configuration.",
    github: "https://github.com/vulpemventures/nigiri",
    website: "https://nigiri.vulpem.com",
    tags: ["Bitcoin", "Docker", "Liquid", "Go", "Dev Tools"]
  },
  {
    name: "go-elements",
    type: "Liquid Development",
    description: "A Go library for Elements/Liquid transactions, asset issuance, and confidential transaction features. Contributed during active Liquid Network development work.",
    github: "https://github.com/vulpemventures/go-elements",
    website: "#",
    tags: ["Bitcoin", "Liquid", "Go"]
  },
  {
    name: "tdex-feeder",
    type: "DeFi Development",
    description: "A price feed service that connects external exchanges (Kraken, etc.) to the TDex daemon for automatic market price updates on the Liquid Network. Contributed to feed integration and reliability improvements.",
    github: "https://github.com/tdex-network/tdex-feeder",
    website: "#",
    tags: ["Bitcoin", "Liquid", "Go", "DEX", "Price Feeds"]
  }
]; 