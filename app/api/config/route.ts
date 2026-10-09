import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();
    if (!apiKey || typeof apiKey !== "string") {
      return Response.json({ error: "Invalid API key format" }, { status: 400 });
    }

    const trimmed = apiKey.trim();
    process.env.GEMINI_API_KEY = trimmed;

    // Persist to .env if local filesystem is writable (non-Vercel environment)
    try {
      const envPath = path.join(process.cwd(), ".env");
      let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${trimmed}`);
      } else {
        content += `\nGEMINI_API_KEY=${trimmed}\n`;
      }
      fs.writeFileSync(envPath, content);
    } catch {
      // Vercel serverless functions have a read-only filesystem; memory process.env handles it
    }

    return Response.json({ success: true, hasApiKey: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
