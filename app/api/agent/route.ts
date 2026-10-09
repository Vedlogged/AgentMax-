import { MODEL, runAgent } from "@/agent/agent";
import { tools } from "@/agent/tools";

// GET /api/agent -> setup status + the list of tools (shown on the page)
export async function GET() {
  return Response.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL,
    tools: tools.map((t) => ({ name: t.name, description: t.description })),
  });
}

// POST /api/agent { messages, apiKey } -> the agent's answer + the tools it used
export async function POST(req: Request) {
  const body = await req.json();
  const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Add GEMINI_API_KEY to your .env file or enter it in Setup Step 01 to start chatting." },
      { status: 400 }
    );
  }

  const { messages } = body;
  try {
    const result = await runAgent(messages, { baseUrl: new URL(req.url).origin, apiKey });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
