/**
 * YOUR AGENT'S TOOLS
 *
 * A tool is just a function the agent is allowed to call.
 * Gemini reads the `description` to decide WHEN to use it,
 * and `parameters` to know WHAT to pass in.
 */
import { getGasPrice, getWalletAddress, getWalletBalance, payAndFetch, signAction } from "./wallet";

export type Tool = {
  name: string;
  description: string;
  /** JSON Schema describing the inputs. */
  parameters: object;
  /** The code that runs when the agent calls this tool. */
  run: (args: any, ctx: { baseUrl: string }) => Promise<unknown>;
};

export const tools: Tool[] = [
  // ─── 1. Paid API: Weather (Costs 0.01 USDC, auto-signed via wallet) ───
  {
    name: "get_weather",
    description: "Get the current weather for a city. Costs 0.01 USDC, paid automatically from the agent's wallet.",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name, e.g. Mumbai, Tokyo, New York" },
      },
      required: ["city"],
    },
    run: async ({ city }, { baseUrl }) => {
      return payAndFetch(`${baseUrl}/api/weather?city=${encodeURIComponent(city)}`);
    },
  },

  // ─── 2. Paid API: Market Intel (Costs 0.05 USDC, auto-signed via wallet) ───
  {
    name: "get_market_intel",
    description:
      "Get premium on-chain crypto intelligence and sentiment metrics for a crypto asset. Costs 0.05 USDC, paid automatically from the agent's wallet.",
    parameters: {
      type: "object",
      properties: {
        symbol: { type: "string", description: "Crypto token symbol, e.g. ETH, BTC, SOL" },
      },
      required: ["symbol"],
    },
    run: async ({ symbol }, { baseUrl }) => {
      return payAndFetch(`${baseUrl}/api/market-intel?symbol=${encodeURIComponent(symbol)}`);
    },
  },

  // ─── 3. Wallet tool: Read the agent's own wallet ───
  {
    name: "get_my_wallet",
    description: "Get the agent's own wallet address and its ETH balance on Base Sepolia (testnet).",
    parameters: { type: "object", properties: {} },
    run: async () => ({
      address: getWalletAddress(),
      balance: await getWalletBalance(),
      network: "Base Sepolia (testnet)",
    }),
  },

  // ─── 4. Plain tool: Roll dice ───
  {
    name: "roll_dice",
    description: "Roll a dice with the given number of sides. Default is 6 sides.",
    parameters: {
      type: "object",
      properties: {
        sides: { type: "number", description: "How many sides the dice has. Default 6." },
      },
    },
    run: async ({ sides = 6 }) => ({ rolled: Math.floor(Math.random() * sides) + 1, sides }),
  },

  // ─── 5. Plain tool: Random joke ───
  {
    name: "get_joke",
    description: "Get a random joke. Use when the user asks for a joke or lighthearted humor.",
    parameters: {
      type: "object",
      properties: {},
    },
    run: async () => {
      try {
        const res = await fetch("https://official-joke-api.appspot.com/random_joke");
        if (res.ok) {
          const data = await res.json();
          return {
            setup: data.setup,
            punchline: data.punchline,
            type: data.type,
          };
        }
      } catch {
        // fallback
      }
      return {
        setup: "Why do programmers prefer dark mode?",
        punchline: "Because light attracts bugs!",
      };
    },
  },

  // ─── 6. Plain tool: Country intelligence with resilient fallback ───
  {
    name: "get_country_info",
    description: "Get facts about a country, including its capital, ISO codes, and region summary.",
    parameters: {
      type: "object",
      properties: {
        country: {
          type: "string",
          description: "Country name, e.g. India, Japan, Germany",
        },
      },
      required: ["country"],
    },
    run: async ({ country }: { country: string }) => {
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/capital", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country }),
        });
        const json = await res.json();
        if (!json.error && json.data) {
          return {
            country: json.data.name,
            capital: json.data.capital,
            iso2: json.data.iso2,
            iso3: json.data.iso3,
          };
        }
      } catch {
        // proceed to wiki fallback
      }

      try {
        const wikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`,
          { headers: { "User-Agent": "agentmaxing-agent/1.0" } }
        );
        if (wikiRes.ok) {
          const wiki = await wikiRes.json();
          return {
            country: wiki.title,
            description: wiki.description,
            summary: wiki.extract,
          };
        }
      } catch {
        // fallback
      }

      return {
        country,
        note: `Country information for ${country} could not be retrieved from external directory.`,
      };
    },
  },

  // ─── 7. Plain tool: Real-time crypto price ───
  {
    name: "get_crypto_price",
    description: "Get real-time live price for a cryptocurrency (e.g. Bitcoin, Ethereum, Solana).",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Cryptocurrency symbol, e.g. BTC, ETH, SOL, DOGE, ADA",
        },
      },
      required: ["symbol"],
    },
    run: async ({ symbol }: { symbol: string }) => {
      const cleanSymbol = symbol.trim().toUpperCase().replace(/USDT$/, "");
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}USDT`);
        if (res.ok) {
          const data = await res.json();
          const price = parseFloat(data.price);
          return {
            symbol: cleanSymbol,
            priceUsd: price >= 1 ? price.toFixed(2) : price.toFixed(6),
            pair: `${cleanSymbol}/USDT`,
            source: "Binance Public Market Data",
          };
        }
      } catch {
        // fallback to CoinGecko
      }

      const idMap: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        SOL: "solana",
        BNB: "binancecoin",
        DOGE: "dogecoin",
      };
      const cgId = idMap[cleanSymbol] || cleanSymbol.toLowerCase();
      try {
        const cgRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`
        );
        if (cgRes.ok) {
          const cgData = await cgRes.json();
          if (cgData[cgId]) {
            return {
              symbol: cleanSymbol,
              priceUsd: cgData[cgId].usd,
              source: "CoinGecko Market Data",
            };
          }
        }
      } catch {
        // fallback
      }

      return {
        symbol: cleanSymbol,
        note: `Unable to retrieve live market quote for ${cleanSymbol} at this moment.`,
      };
    },
  },

  // ─── 8. Paid API: Deep Research Brief (Costs 0.10 USDC, auto-signed via wallet) ───
  {
    name: "get_deep_research",
    description:
      "Generate an in-depth autonomous on-chain research report with fundamentals, catalysts, and health scores. Costs 0.10 USDC, paid automatically from the agent's wallet.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic or asset name to research, e.g. Ethereum, Solana, DeFi, Layer2",
        },
      },
      required: ["topic"],
    },
    run: async ({ topic }, { baseUrl }) => {
      return payAndFetch(`${baseUrl}/api/deep-research?topic=${encodeURIComponent(topic)}`);
    },
  },

  // ─── 9. Live Web3 Tool: Trending Tokens on CoinGecko ───
  {
    name: "get_trending_tokens",
    description: "Get real-time top trending cryptocurrencies and tokens globally from market data feeds.",
    parameters: {
      type: "object",
      properties: {},
    },
    run: async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
        if (res.ok) {
          const data = await res.json();
          const trending = (data.coins || []).slice(0, 5).map((c: any) => ({
            name: c.item?.name,
            symbol: c.item?.symbol,
            rank: c.item?.market_cap_rank,
            priceBtc: c.item?.price_btc,
          }));
          return {
            source: "CoinGecko Global Trending",
            trending,
          };
        }
      } catch {
        // fallback
      }
      return {
        source: "Market Feed",
        trending: [
          { name: "Bitcoin", symbol: "BTC", rank: 1 },
          { name: "Ethereum", symbol: "ETH", rank: 2 },
          { name: "Solana", symbol: "SOL", rank: 5 },
        ],
      };
    },
  },

  // ─── 10. Live On-Chain Tool: Base Sepolia Network Gas Price ───
  {
    name: "get_network_gas",
    description: "Get current live network gas price in Gwei on Base Sepolia blockchain testnet.",
    parameters: {
      type: "object",
      properties: {},
    },
    run: async () => {
      const gas = await getGasPrice();
      return {
        network: "Base Sepolia (L2 Testnet)",
        gasPrice: gas,
        status: "Optimal for Microtransactions",
      };
    },
  },

  // ─── 11. Autonomous Financial Tool: Simulate Token Transfer & Sign Action ───
  {
    name: "transfer_test_tokens",
    description: "Simulate and cryptographically sign an autonomous test token transfer or payment from the agent's wallet.",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient address, e.g. 0x123... or dead address" },
        amount: { type: "string", description: "Amount of test tokens or ETH, e.g. 0.005 ETH" },
        memo: { type: "string", description: "Purpose or memo for the transfer" },
      },
      required: ["amount"],
    },
    run: async ({ to = "0x000000000000000000000000000000000000dEaD", amount, memo = "Agent autonomous payment" }) => {
      return signAction({ to, amount, memo });
    },
  },
];
