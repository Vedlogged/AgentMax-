# AgentMax: Autonomous Web3 AI Agent (Week 2: Build & Ship)

> **Agentmaxxing Week 2 Mission**  
> An advanced autonomous AI agent powered by **Google Gemini** that combines multi-step reasoning workflows, real-time blockchain analytics, and an embedded **Web3 cryptographic wallet** on Base Sepolia to sign transactions and unlock paid APIs via the **x402 payment standard**.

---

## 🚀 What's New in Week 2 (Build & Ship)

Week 2 evolved AgentMax from a basic prototype into a capable **autonomous Web3 intelligence agent**:

1. **Expanded Tool Arsenal (11 Active Tools)**: Added deep research synthesis, live CoinGecko global trending tokens, on-chain Base Sepolia gas tracking, and cryptographically signed action receipts.
2. **Multi-Step Agent Workflows**: AgentMax can chain disparate tools together in a single prompt (e.g. scanning trending tokens, querying live prices, inspecting on-chain gas, and delivering structured synthesis).
3. **Multi-Tier x402 Micropayment Engine**:
   - `get_weather`: 0.01 USDC baseline micro-purchase.
   - `get_market_intel`: 0.05 USDC on-chain sentiment intelligence.
   - `get_deep_research`: 0.10 USDC institutional-grade multi-dimensional research brief.
4. **Interactive Dashboard**: Direct in-browser API key configurator, workflow shortcut toolbar, and live receipt inspection.
5. **Detailed Walkthrough**: See [`DEMO_WALKTHROUGH.md`](./DEMO_WALKTHROUGH.md) for full step-by-step testing instructions.

---

## 🛠️ Complete Tool Directory (11 Tools)

| Tool Name | Type | Protocol / Cost | Description |
| :--- | :--- | :--- | :--- |
| `get_deep_research` | **Paid Research** | `0.10 USDC` (x402) | Unlocks in-depth research briefs with catalysts, risk profiles, and health scores. |
| `get_market_intel` | **Paid Intel** | `0.05 USDC` (x402) | Unlocks premium on-chain sentiment and metrics with wallet signature. |
| `get_weather` | **Paid API** | `0.01 USDC` (x402) | Fetches city weather after automatically signing payment from the agent's wallet. |
| `get_trending_tokens` | **Web3 Discovery** | Free | Retrieves live trending tokens globally from CoinGecko market search feeds. |
| `get_network_gas` | **On-Chain RPC** | Free | Queries current live network gas price in Gwei on Base Sepolia. |
| `transfer_test_tokens`| **Financial Tool** | Free | Simulates and cryptographically signs an autonomous test transfer with verifiable receipt. |
| `get_crypto_price` | **Live Market** | Free | Queries real-time cryptocurrency prices (BTC, ETH, SOL, etc.) via Binance with fallback. |
| `get_my_wallet` | **Wallet Tool** | Free | Reads the agent's public address and ETH balance on Base Sepolia testnet. |
| `get_country_info` | **Knowledge** | Free | Fetches capital, ISO codes, and regional info with multi-source fallback. |
| `get_joke` | **Utility** | Free | Fetches random programming or general jokes. |
| `roll_dice` | **Utility** | Free | Rolls an N-sided dice (default 6, or user-specified). |

---

## ⚡ Multi-Step Agent Workflows

AgentMax is engineered to perform complex, multi-action cognitive pipelines:

- **⚡ Market Overview Workflow**:
  - *Input*: `"Check trending tokens, live ETH price, and Base Sepolia gas fees to give me a market overview."`
  - *Execution*: Agent chains `get_trending_tokens` ➔ `get_crypto_price` ➔ `get_network_gas` ➔ Synthesizes a structured market brief.
- **🔍 Deep Research Workflow**:
  - *Input*: `"Generate a deep research report on Ethereum and analyze on-chain sentiment."`
  - *Execution*: Agent signs 0.10 USDC payment for `get_deep_research` ➔ Signs 0.05 USDC for `get_market_intel` ➔ Produces an institutional brief with payment hashes.
- **💳 Wallet & Gas Audit Workflow**:
  - *Input*: `"Inspect your wallet address, testnet balance, and live network gas price."`
  - *Execution*: Chains `get_my_wallet` and `get_network_gas` to confirm transaction feasibility.

---

## 🧠 How the x402 Payment Flow Works

```
[User Request] ──> [Gemini Cognitive Loop] ──> Decides to invoke paid tool
                                                        │
                                                        ▼
                                           [Agent calls API endpoint]
                                                        │
                                                        ▼
                                       [API returns 402 Payment Required]
                                       (Includes price, asset, recipient)
                                                        │
                                                        ▼
                                 [Agent Wallet generates signature with viem]
                                                        │
                                                        ▼
                                [Agent retries with `X-PAYMENT` base64 header]
                                                        │
                                                        ▼
                                    [API verifies signature & returns 200 OK]
                                                        │
                                                        ▼
                            [Gemini processes data & synthesizes final answer]
```

---

## 💻 Getting Started

### Prerequisites
- **Node.js** v20 or newer (`node -v`)
- Free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Vedlogged/AgentMax-.git
   cd AgentMax-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Connect Gemini API Key**:
   - In the web UI under **01 Setup**, paste your free key from Google AI Studio and click **Connect**.
   - (Or add `GEMINI_API_KEY=your_key_here` to `.env`).

5. **Interact With Workflows**:
   - Click any workflow shortcut button or sample prompt chip to watch the agent execute tools live!

---

## 🎬 Demo & Walkthrough
Detailed instructions, script, and walkthrough steps for Week 2 evaluation can be found in [`DEMO_WALKTHROUGH.md`](./DEMO_WALKTHROUGH.md).

---

## 🔒 Security Notice
The private key stored in `.agent-wallet.json` is strictly for **Base Sepolia testnet** experimentation. Never send real mainnet funds to this address. All payments are signed test authorizations.
