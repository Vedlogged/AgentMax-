import { createWallet, getWalletAddress, getWalletBalance } from "@/agent/wallet";

// GET /api/wallet -> the agent's wallet address and balance (or null if none yet)
export async function GET() {
  const address = getWalletAddress();
  if (!address) return Response.json({ address: null });

  const balance = await getWalletBalance().catch(() => "unavailable");
  return Response.json({ address, balance });
}

// POST /api/wallet -> create or reset the agent's wallet
export async function POST(req: Request) {
  let reset = false;
  try {
    const body = await req.json();
    reset = Boolean(body?.reset);
  } catch {
    // plain POST without body
  }
  const address = createWallet(reset);
  const balance = await getWalletBalance().catch(() => "0 ETH");
  return Response.json({ address, balance });
}
