/**
 * A MOCK PAID MARKET INTELLIGENCE API (x402 Pattern)
 *
 * Demonstrates another paid API requiring micropayments.
 * Unpaid -> 402 Payment Required.
 * Signed Payment -> 200 OK with premium analytics.
 */
import { verifyPayment } from "@/agent/wallet";

const PRICE = "0.05";
const ASSET = "USDC";
const PAY_TO = "0x000000000000000000000000000000000000dEaD";

export async function GET(req: Request) {
  const symbol = (new URL(req.url).searchParams.get("symbol") ?? "ETH").toUpperCase();

  const payment = await verifyPayment(req.headers.get("X-PAYMENT"));
  if (!payment || payment.to !== PAY_TO || Number(payment.amount) < Number(PRICE)) {
    return Response.json(
      { error: "Payment Required", price: PRICE, asset: ASSET, payTo: PAY_TO },
      { status: 402 }
    );
  }

  const sentiments = ["Strongly Bullish", "Moderate Bullish", "Neutral / Accumulation", "High Volatility Expected"];
  const selectedSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

  return Response.json({
    symbol,
    tier: "Premium Alpha Intelligence",
    sentiment: selectedSentiment,
    onChainMetrics: {
      activeAddressesGrowth: "+14.2% (7d)",
      exchangeNetflow: "-$42.8M (Net Outflow / Accumulation)",
      gasUsageTrend: "Elevated Network Activity",
    },
    signalConfidence: "87%",
    disclaimer: "Simulated market intelligence for AI agent autonomous payment demonstration.",
    paidBy: payment.from,
  });
}
