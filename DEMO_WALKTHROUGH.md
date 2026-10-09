# 🎥 AgentMax Week 2 Demo & Walkthrough Guide

This walkthrough demonstrates the capabilities of **AgentMax**, an autonomous Web3 AI agent with embedded cryptographic financial agency on Base Sepolia.

---

## 🚀 Live Demo Overview

AgentMax has evolved from a basic prototype into a multi-capability **autonomous Web3 intelligence agent**.

### 🌟 Key Week 2 Advancements:
1. **11 Interactive Tools**: Expanded from 7 tools to 11 live tools covering market discovery, on-chain analytics, network fees, and transaction signing.
2. **Multi-Step Workflows**: Chained tool pipelines that query, pay, verify, and synthesize data across disparate services.
3. **x402 Micropayment Protocol**: Unlocks 3 metered APIs (`get_weather` for 0.01 USDC, `get_market_intel` for 0.05 USDC, and `get_deep_research` for 0.10 USDC) via automatic off-chain wallet signatures.
4. **Interactive Dashboard**: Direct in-browser API key configurator, workflow shortcut toolbar, and live receipt inspection.

---

## 🎬 Step-by-Step Walkthrough Script

### Step 1: Launch & Connect
1. Start the application:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. Under **01 Setup**, enter your Gemini API key and click **Connect**.
4. Observe the green checkmark: `Connected to Gemini`.
5. Under **02 Setup**, observe the agent's pre-configured Base Sepolia wallet address and balance.

---

### Step 2: Test Multi-Step Workflows (New in Week 2)

#### Workflow A: Market Overview & Gas Audit
- **Click Workflow Button**: `⚡ Market Overview Workflow` (or send: *"Check trending tokens, live ETH price, and Base Sepolia gas fees to give me a market overview."*)
- **What Happens**:
  1. The agent calls `get_trending_tokens` to identify what coins are surging globally.
  2. The agent calls `get_crypto_price` for live Binance ticker prices.
  3. The agent calls `get_network_gas` for live on-chain Gwei fees on Base Sepolia.
  4. The agent synthesizes all three streams into a structured market brief.
- **Inspect**: Click each collapsible tool entry in the chat to view the input parameters and live JSON responses.

#### Workflow B: Deep Research with x402 Micropayment
- **Click Workflow Button**: `🔍 Deep Research Workflow` (or send: *"Generate a deep research report on Solana and analyze on-chain sentiment."*)
- **What Happens**:
  1. The agent intercepts `HTTP 402 Payment Required` from `/api/deep-research`.
  2. The agent's embedded wallet signs an authorization for **0.10 USDC**.
  3. The agent repeats the request with the `X-PAYMENT` header, unlocking fundamentals, risk profiles, and catalyst metrics.
  4. The agent calls `get_market_intel` (signing **0.05 USDC**) to obtain sentiment.
  5. The agent presents a comprehensive institutional-grade report with cryptographic payment receipts.

#### Workflow C: Autonomous Transfer Simulation
- **Prompt**: *"Simulate transferring 0.005 ETH to 0x000000000000000000000000000000000000dEaD for test payment"*
- **What Happens**:
  1. The agent invokes `transfer_test_tokens`.
  2. The wallet signs a cryptographic payload with a timestamp, nonce, and sender signature.
  3. The agent returns the verifiable receipt and status `Signed & Authorized`.

---

### Step 3: Test Core & Utility Tools

| Action | Prompt | What It Demonstrates |
| :--- | :--- | :--- |
| **Paid Weather API** | *"What's the weather in Mumbai?"* | Baseline x402 payment (0.01 USDC) |
| **Wallet Inspection** | *"What's in your wallet?"* | Reads Base Sepolia address & balance |
| **Live Crypto Quote** | *"What is the price of Bitcoin?"* | Real-time Binance ticker |
| **Country Intelligence** | *"What's the capital of Japan?"* | Multi-source geodata retrieval |
| **Entertainment** | *"Tell me a joke"* | External REST API integration |
| **Dice Roll** | *"Roll a 20 sided dice"* | Deterministic random utility |

---

## 🛠️ Architecture Summary

```
                      ┌────────────────────────┐
                      │    User Message / UI   │
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │  Google Gemini Engine  │
                      │   (Multi-Step Loop)    │
                      └───────────┬────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Free Data APIs  │    │ On-Chain RPC Feeds│   │ x402 Paywall APIs│
│ • CoinGecko Trend│    │ • Base Gas (Gwei)│    │ • Weather (0.01) │
│ • Binance Prices │    │ • Wallet Balance │    │ • Intel (0.05)   │
│ • Country/Jokes  │    │ • Action Signer  │    │ • Research (0.10)│
└──────────────────┘    └──────────────────┘    └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │ Agent Wallet Key │
                                                │ (viem Signature) │
                                                └──────────────────┘
```
