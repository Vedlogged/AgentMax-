# AgentMax: Autonomous AI Agent with Embedded Crypto Wallet (Week 1 Submission)

> **Agentmaxxing Week 1 Project**  
> An autonomous AI agent powered by **Google Gemini** that reasons over user intent, invokes custom tools, and manages its own **Web3 cryptographic wallet** on Base Sepolia to sign and pay for API services via the **x402 payment standard**.

---

## 🚀 Overview

Traditional chatbots are purely conversational text generators. **AgentMax** is an active, autonomous **AI Agent**:
- **Cognitive Loop**: Combines Google Gemini function-calling with a multi-step execution loop to iteratively decide, act, observe, and summarize.
- **Embedded Web3 Wallet**: Possesses its own cryptographic identity (managed with `viem`), enabling autonomous micro-transactions and payment signing.
- **x402 Micropayment Standard**: Automatically intercepts HTTP `402 Payment Required` responses, generates cryptographic signatures for payment, and resubmits authenticated requests.
- **Rich Tool Ecosystem**: Equipped with multiple custom tools spanning mock paid endpoints, live crypto market data, geodata lookups, and utility functions.

---

## 🛠️ Tool Directory

| Tool Name | Type | Cost / Protocol | Description |
| :--- | :--- | :--- | :--- |
| `get_weather` | Paid API | `0.01 USDC` (x402) | Fetches city weather after automatically signing payment from the agent's wallet. |
| `get_market_intel` | Paid API | `0.05 USDC` (x402) | Unlocks premium on-chain sentiment and metrics with wallet signature. |
| `get_my_wallet` | Wallet Tool | Free | Reads the agent's public address and ETH balance on Base Sepolia testnet. |
| `get_crypto_price` | Custom Tool | Free | Retrieves live, real-time cryptocurrency prices (BTC, ETH, SOL, etc.) via Binance ticker & CoinGecko fallback. |
| `get_country_info` | Custom Tool | Free | Fetches capital, ISO codes, and regional info with multi-source fallback. |
| `get_joke` | Custom Tool | Free | Fetches a programming or general joke to entertain the user. |
| `roll_dice` | Plain Tool | Free | Rolls an N-sided dice (default: 6 or user-specified). |

---

## 🧠 How the x402 Payment Flow Works

```
[User Message] ──> [Gemini LLM] ──> Decides to call `get_weather` or `get_market_intel`
                                            │
                                            ▼
                               [Agent sends HTTP request]
                                            │
                                            ▼
                           [API responds with 402 Payment Required]
                           (Returns price, asset, recipient address)
                                            │
                                            ▼
                     [Agent Wallet signs payment message using viem]
                                            │
                                            ▼
                    [Agent retries request with `X-PAYMENT` header]
                                            │
                                            ▼
                     [API verifies signature and returns 200 OK]
                                            │
                                            ▼
                [Gemini receives data & formulates final user answer]
```

---

## 📋 Week 1 Submission Details

### 1. Short Description of What Your Agent Does
> **AgentMax** is an autonomous AI agent integrated with a cryptographic testnet wallet on Base Sepolia. When prompted by a user, the agent uses Gemini's function-calling to analyze requirements, inspects or utilizes its testnet wallet, pays for metered services (such as weather reports and market analytics) using signed x402 headers, and fetches live real-time crypto prices, geography facts, or jokes without requiring human intervention.

### 2. Brief Note on What Was Learned or Experimented With
> - **Autonomous Agency vs. Chatbots**: Explored how agents differ from passive LLMs through observation-action loops, tool execution, and dynamic context injection.
> - **Cryptographic Micro-Payments (x402)**: Implemented and tested how an agent can autonomously handle API paywalls by reading 402 headers, creating an off-chain cryptographic signature via `viem`, and attaching payment proof in HTTP headers.
> - **Tool Resilience**: Built error handling and multi-provider fallbacks for external APIs (e.g. crypto prices and country queries) so agent tool execution remains robust against network or rate-limiting failures.
> - **State & Identity Persistence**: Configured `.agent-wallet.json` to persist the agent's private key across sessions and restarts while ensuring safety via `.gitignore`.

---

## 💻 Getting Started

### Prerequisites
- **Node.js** v20 or newer (`node -v`)
- Free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### Quick Setup

1. **Clone the repository**:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd agentmaxing
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your API Key**:
   Create or edit `.env` in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-flash-latest
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Create / View Agent Wallet**:
   - The agent wallet is automatically generated and persisted in `.agent-wallet.json`.
   - In the web UI, you can view your agent's Base Sepolia address and copy or refresh the balance.

---

## 🧪 Try These Prompts

- `What's the weather in Mumbai?` *(Triggers paid weather tool with 0.01 USDC wallet signature)*
- `Get market intel on ETH` *(Triggers premium paid analytics tool with 0.05 USDC wallet signature)*
- `What's in your wallet?` *(Inspects agent wallet address & Base Sepolia testnet balance)*
- `What is the price of Bitcoin?` *(Fetches live crypto price)*
- `What's the capital of Japan?` *(Queries country intelligence)*
- `Tell me a joke` *(Retrieves a joke)*
- `Roll a 20 sided dice` *(Executes dice roll)*

---

## 📂 Project Architecture

```
├── agent/
│   ├── agent.ts         # Agent loop, Gemini model setup, and system instructions
│   ├── tools.ts         # Tool declarations and execution handlers
│   └── wallet.ts        # viem wallet management, message signing, and verification
├── app/
│   ├── api/
│   │   ├── agent/       # Agent execution endpoint
│   │   ├── wallet/      # Wallet status endpoint
│   │   ├── weather/     # Mock paid weather API (x402)
│   │   └── market-intel/# Mock paid market intelligence API (x402)
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Modern UI with setup guide, live tool inspector, and chat
├── components/          # Reusable UI components
├── .env.example         # Environment variable template
├── .gitignore           # Ignores .env and .agent-wallet.json
└── package.json         # Scripts and project dependencies
```

---

## 🔒 Security Notice
The private key stored in `.agent-wallet.json` is strictly for **Base Sepolia testnet** experimentation. Never send real mainnet funds to this address. All payments are signed test authorizations.
