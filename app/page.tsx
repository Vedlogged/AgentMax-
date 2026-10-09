"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  CircleAlert,
  Copy,
  ExternalLink,
  KeyRound,
  RefreshCw,
  RotateCcw,
  SendHorizontal,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Step = { tool: string; args: unknown; result: any; error?: boolean };
type Message = { role: "user" | "agent"; text: string; steps?: Step[]; error?: boolean };
type Status = { hasApiKey: boolean; model: string; tools: { name: string; description: string }[] };
type WalletInfo = { address: string | null; balance?: string };

const EXAMPLES = [
  "Scan trending tokens, live ETH price, and Base gas fees",
  "Generate a deep research report on Solana",
  "Get market intel on ETH",
  "What is the current gas price on Base Sepolia?",
  "What's the weather in Mumbai?",
  "What's in your wallet?",
  "Simulate transferring 0.005 ETH to 0x0000...dEaD",
  "What is the price of Bitcoin?",
  "Tell me a joke",
  "What's the capital of Japan?",
  "Roll a 20 sided dice",
];

const WORKFLOWS = [
  {
    title: "⚡ Market Overview Workflow",
    prompt: "Check trending tokens, live ETH price, and Base Sepolia gas fees to give me a market overview.",
  },
  {
    title: "🔍 Deep Research Workflow",
    prompt: "Generate a deep research report on Ethereum and analyze on-chain sentiment.",
  },
  {
    title: "💳 Wallet & Gas Audit",
    prompt: "Inspect your wallet address, testnet balance, and live network gas price.",
  },
];

const TOOL_PROMPTS: Record<string, string> = {
  get_weather: "What's the weather in Mumbai?",
  get_market_intel: "Get market intel on ETH",
  get_deep_research: "Generate a deep research report on Solana",
  get_trending_tokens: "What cryptocurrencies are trending right now?",
  get_network_gas: "What is the current gas price on Base Sepolia?",
  transfer_test_tokens: "Simulate transferring 0.005 ETH to 0x000000000000000000000000000000000000dEaD",
  get_my_wallet: "What's in your wallet?",
  get_crypto_price: "What is the price of Bitcoin?",
  get_country_info: "What's the capital of Japan?",
  get_joke: "Tell me a joke",
  roll_dice: "Roll a 20 sided dice",
};

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [activeApiKey, setActiveApiKey] = useState("");
  const [inlineKey, setInlineKey] = useState("");

  const loadStatus = () =>
    fetch("/api/agent")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});

  const loadWallet = () =>
    fetch("/api/wallet")
      .then((r) => r.json())
      .then(setWallet)
      .catch(() => {});

  useEffect(() => {
    loadStatus();
    loadWallet();
    try {
      const saved = localStorage.getItem("agent_gemini_api_key");
      if (saved) {
        setActiveApiKey(saved);
        setInlineKey(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function createWallet(reset = false) {
    setCreating(true);
    await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset }),
    }).catch(() => {});
    await loadWallet();
    setCreating(false);
  }

  async function handleSaveKeyDirect(key: string) {
    const trimmed = key.trim();
    if (!trimmed) return;
    setSavingKey(true);
    try {
      localStorage.setItem("agent_gemini_api_key", trimmed);
      setActiveApiKey(trimmed);
      setShowKeyInput(false);
      setApiKeyInput("");

      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      }).catch(() => {});

      await loadStatus();
    } catch {}
    setSavingKey(false);
  }

  async function handleSaveKey(e?: React.FormEvent) {
    if (e) e.preventDefault();
    await handleSaveKeyDirect(apiKeyInput);
  }

  async function send(text: string, overrideKey?: string) {
    if (!text.trim() || thinking) return;

    const keyToUse = overrideKey || activeApiKey;
    const isReady = Boolean(status?.hasApiKey || keyToUse);

    if (!isReady) {
      setShowKeyInput(true);
      setMessages((m) => [
        ...m,
        { role: "user", text },
        {
          role: "agent",
          text: "🔑 Gemini API key needed: Paste your key below to connect and run this query.",
          error: true,
        },
      ]);
      return;
    }

    const history: Message[] = [...messages, { role: "user", text }];
    setMessages(history);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: keyToUse || undefined,
          messages: history.filter((m) => !m.error).map(({ role, text: msgText }) => ({ role, text: msgText })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        data.error
          ? { role: "agent", text: data.error, error: true }
          : { role: "agent", text: data.answer, steps: data.steps },
      ]);
      if (data.steps?.some((s: Step) => s.result?.payment)) loadWallet();
    } catch {
      setMessages((m) => [
        ...m,
        { role: "agent", text: "Could not reach the server. Is the application running?", error: true },
      ]);
    }
    setThinking(false);
  }

  const ready = Boolean(status?.hasApiKey || activeApiKey);

  return (
    <main className="mx-auto flex min-h-screen max-w-[1520px] flex-col gap-10 px-4 py-8 md:px-12 md:py-12">
      {/* Header */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>
            <img src="/risein-logo.svg" alt="Rise In" className="mr-3 h-5 w-auto" />
            <span className="text-foreground">/ Agentmaxxing</span>&nbsp;Week 2 Build & Ship
          </Label>
          <div className="flex items-center gap-2">
            <span className="rounded-xs bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] text-primary font-mono uppercase">
              11 Tools Active
            </span>
            {status && <Label>Model: {status.model}</Label>}
          </div>
        </div>
        <h1 className="text-5xl leading-[0.9] font-bold tracking-[-0.045em] uppercase md:text-7xl">
          Agent<span className="text-primary">Max.</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          An autonomous Web3 AI agent with multi-step workflows, on-chain intelligence, and x402 micropayments.
        </p>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: setup + tools */}
        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <SectionTitle num="01" title="Setup" />
            </CardHeader>
            <CardContent className="flex flex-col">
              {/* Step 1 */}
              <SetupStep number={1} title="Configure Gemini API key" done={ready}>
                {!ready || showKeyInput ? (
                  <form onSubmit={handleSaveKey} className="flex flex-col gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Paste your key below, or set <Code>GEMINI_API_KEY</Code> in <Code>.env</Code>.{" "}
                      <a
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get free key
                      </a>
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Paste AI Studio API key..."
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={savingKey || !apiKeyInput.trim()}
                        className="cursor-pointer whitespace-nowrap text-xs font-mono"
                      >
                        {savingKey ? "Saving..." : "Connect"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="text-green-500 font-mono flex items-center gap-1.5">
                      <Check className="size-3.5" /> Connected to Gemini
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowKeyInput(true)}
                      className="text-[11px] underline hover:text-primary cursor-pointer font-mono"
                    >
                      Change Key
                    </button>
                  </div>
                )}
              </SetupStep>

              {/* Step 2 */}
              <SetupStep number={2} title="Create the agent wallet" done={Boolean(wallet?.address)}>
                {wallet && !wallet.address && (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground">
                      The agent signs cryptographic payments with this wallet to unlock paid APIs.
                    </p>
                    <Button
                      onClick={() => createWallet(false)}
                      disabled={creating}
                      className="w-fit font-mono tracking-wider uppercase cursor-pointer"
                    >
                      <Wallet className="size-4 mr-2" /> {creating ? "Creating..." : "Create wallet"}
                    </Button>
                  </div>
                )}
                {wallet?.address && (
                  <WalletDetails
                    wallet={wallet}
                    onRefresh={loadWallet}
                    onReset={() => createWallet(true)}
                  />
                )}
              </SetupStep>

              {/* Step 3 */}
              <SetupStep
                number={3}
                title="Chat with your agent"
                done={messages.some((m) => m.role === "agent" && !m.error)}
                last
              >
                <p className="text-xs text-muted-foreground">
                  Pick any example prompt below or test one of the 7 custom tools.
                </p>
              </SetupStep>
            </CardContent>
          </Card>

          {/* Tools Card */}
          <Card>
            <CardHeader>
              <SectionTitle num="02" title="Tools" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {status?.tools.map((t) => {
                const sample = TOOL_PROMPTS[t.name];
                return (
                  <div
                    key={t.name}
                    onClick={() => {
                      if (sample) {
                        setInput(sample);
                        send(sample);
                      }
                    }}
                    className="group -mx-2 p-2 rounded-sm hover:bg-muted/60 transition-colors cursor-pointer border border-transparent hover:border-border"
                    title={sample ? `Click to run: "${sample}"` : undefined}
                  >
                    <p className="font-mono text-xs flex items-center justify-between">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        <span className="text-primary font-bold">&gt;</span> {t.name}
                      </span>
                      {sample && (
                        <span className="text-[10px] font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                          Try ↵
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                  </div>
                );
              })}
              <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                Add more tools in <Code>agent/tools.ts</Code>. All tools reload dynamically.
              </p>
            </CardContent>
          </Card>
        </aside>

        {/* Right: chat */}
        <Card className="flex h-[calc(100vh-4rem)] min-h-[560px] flex-col lg:sticky lg:top-8">
          <CardHeader className="border-b border-border">
            <SectionTitle num="03" title="Chat" />
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono uppercase cursor-pointer hover:bg-muted"
                onClick={() => setMessages([])}
                disabled={messages.length === 0 || thinking}
              >
                <RotateCcw className="size-3.5 mr-1" /> Clear
              </Button>
            </CardAction>
          </CardHeader>

          {/* Week 2: Multi-Step Workflows Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border overflow-x-auto text-xs font-mono">
            <span className="text-muted-foreground uppercase text-[10px] whitespace-nowrap flex items-center gap-1 font-semibold">
              <Sparkles className="size-3 text-primary" /> Workflows:
            </span>
            {WORKFLOWS.map((wf) => (
              <button
                key={wf.title}
                type="button"
                onClick={() => {
                  setInput(wf.prompt);
                  send(wf.prompt);
                }}
                className="px-2.5 py-1 bg-background border border-border hover:border-primary hover:text-primary rounded-xs transition-colors cursor-pointer whitespace-nowrap text-[11px]"
                title={wf.prompt}
              >
                {wf.title}
              </button>
            ))}
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-5 px-4 py-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-5 py-12 text-center">
                  <div className="flex size-12 items-center justify-center bg-primary text-primary-foreground rounded-sm">
                    <Bot className="size-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight uppercase">Ask your agent something</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {!ready
                        ? "Tip: Connect your Gemini API key in Step 01 to unlock live model answers."
                        : "Click any prompt chip to execute tools and test autonomous micropayments."}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                    {EXAMPLES.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => {
                          setInput(e);
                          send(e);
                        }}
                        className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 text-xs font-mono hover:border-primary hover:bg-primary/5 transition-all cursor-pointer rounded-sm"
                      >
                        <span className="text-primary font-bold">&gt;</span> {e}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className="max-w-[85%] self-end bg-primary px-4 py-2.5 font-medium text-primary-foreground rounded-sm text-sm">
                    {m.text}
                  </div>
                ) : (
                  <div key={i} className="flex max-w-[85%] gap-3 self-start">
                    <div className="flex size-8 shrink-0 items-center justify-center border border-border rounded-sm bg-muted/30">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                      {m.steps?.map((s, j) => (
                        <ToolCall key={j} step={s} />
                      ))}
                      <div
                        className={cn(
                          "px-4 py-2.5 whitespace-pre-wrap rounded-sm text-sm",
                          m.error ? "flex flex-col gap-2 bg-destructive/10 text-destructive border border-destructive/20" : "bg-muted text-foreground"
                        )}
                      >
                        <div className="flex gap-2">
                          {m.error && <CircleAlert className="mt-0.5 size-4 shrink-0" />}
                          <div>{m.text}</div>
                        </div>

                        {m.error && !ready && (
                          <div className="flex flex-col gap-2 pt-2 border-t border-destructive/20 mt-1">
                            <div className="flex gap-2">
                              <Input
                                type="password"
                                placeholder="Paste Gemini API key (AQ... or AIza...)"
                                value={inlineKey}
                                onChange={(e) => setInlineKey(e.target.value)}
                                className="h-8 text-xs font-mono bg-background text-foreground border-border"
                              />
                              <Button
                                type="button"
                                size="sm"
                                disabled={!inlineKey.trim()}
                                onClick={async () => {
                                  if (!inlineKey.trim()) return;
                                  const key = inlineKey.trim();
                                  await handleSaveKeyDirect(key);
                                  const lastUser = messages.filter((msg) => msg.role === "user").pop();
                                  if (lastUser) {
                                    send(lastUser.text, key);
                                  }
                                }}
                                className="cursor-pointer text-xs font-mono whitespace-nowrap bg-primary text-primary-foreground"
                              >
                                Connect & Run ↵
                              </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Keys are stored locally in your browser for this deployment.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {thinking && (
                <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  agent is thinking <span className="inline-block h-3 w-1.5 animate-pulse bg-primary" />
                </p>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <CardFooter className="border-t border-border pt-4">
            <form
              className="flex w-full gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <div className="flex flex-1 items-center border border-input bg-background focus-within:border-primary rounded-sm transition-colors">
                <span className="pl-3 font-mono text-base whitespace-nowrap text-muted-foreground md:text-xs">~/agent $</span>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={ready ? "ask your agent something..." : "ask something or enter your API key in Step 01..."}
                  className="h-11 border-0 bg-transparent font-mono focus-visible:ring-0 text-sm"
                />
              </div>
              <Button
                type="submit"
                className="h-auto px-5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                disabled={thinking || !input.trim()}
                aria-label="Send"
              >
                <SendHorizontal className="size-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="flex items-center font-mono text-xs font-medium tracking-[0.06em] text-muted-foreground uppercase">{children}</p>;
}

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <p className="font-mono text-xs font-medium tracking-[0.06em] uppercase">
      <span className="text-primary font-bold">{num}</span>
      <span className="ml-3 text-muted-foreground">{title}</span>
    </p>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground rounded-xs">{children}</code>;
}

function SetupStep(props: { number: number; title: string; done: boolean; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center border-2 font-mono text-xs font-bold rounded-sm transition-colors",
            props.done ? "border-primary bg-primary text-primary-foreground" : "border-primary text-primary"
          )}
        >
          {props.done ? <Check className="size-3.5" strokeWidth={3} /> : props.number}
        </span>
        {!props.last && <span className={cn("w-0.5 flex-1", props.done ? "bg-primary" : "bg-border")} />}
      </div>
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", !props.last && "pb-5")}>
        <p className="font-bold tracking-tight uppercase text-xs">{props.title}</p>
        {props.children}
      </div>
    </div>
  );
}

function WalletDetails({
  wallet,
  onRefresh,
  onReset,
}: {
  wallet: WalletInfo;
  onRefresh: () => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const address = wallet.address!;

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = address;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 400);
  }

  return (
    <div className="flex flex-col gap-2.5 border border-border bg-background p-3 rounded-sm">
      <div className="flex items-center justify-between gap-2">
        <code className="truncate font-mono text-xs text-primary select-all">{address}</code>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={copy}
          className="cursor-pointer hover:bg-muted"
          aria-label="Copy address"
          title="Copy address"
        >
          {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-muted-foreground uppercase">
        <span>
          Balance: <span className="text-foreground font-semibold">{wallet.balance || "0 ETH"}</span>
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleRefresh}
          className="cursor-pointer hover:bg-muted"
          aria-label="Refresh balance"
          title="Refresh balance"
        >
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin text-primary")} />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border pt-2.5 font-mono text-[11px] uppercase">
        <div className="flex gap-3">
          <a
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            href={`https://sepolia.basescan.org/address/${address}`}
            target="_blank"
            rel="noreferrer"
          >
            Explorer <ExternalLink className="size-3" />
          </a>
          <a
            className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            href="https://docs.base.org/base-chain/tools/network-faucets"
            target="_blank"
            rel="noreferrer"
          >
            Faucet <ExternalLink className="size-3" />
          </a>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-muted-foreground hover:text-primary underline cursor-pointer text-[10px]"
          title="Generate fresh test wallet"
        >
          New Wallet
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">Base Sepolia testnet. Saved in .agent-wallet.json.</p>
    </div>
  );
}

function ToolCall({ step }: { step: Step }) {
  const [open, setOpen] = useState(false);
  const payment = step.result?.payment;

  return (
    <div className="border border-border font-mono text-xs rounded-sm overflow-hidden bg-background">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/70 cursor-pointer transition-colors"
      >
        <ChevronRight className={cn("size-3.5 transition-transform text-muted-foreground", open && "rotate-90")} />
        <span className="text-muted-foreground uppercase text-[10px]">Tool:</span>
        <span className="text-primary font-semibold">{step.tool}</span>
        {payment && (
          <Badge className="ml-auto bg-blue-600/15 text-blue-400 border border-blue-500/30 font-mono text-[10px] uppercase">
            Paid {payment.amount}
          </Badge>
        )}
        {step.error && (
          <Badge variant="destructive" className="ml-auto font-mono uppercase text-[10px]">
            Failed
          </Badge>
        )}
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-border px-3 py-2 bg-muted/20">
          <Json label="Input" value={step.args} />
          <Json label="Output" value={step.result} />
        </div>
      )}
    </div>
  );
}

function Json({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="mb-1 text-muted-foreground text-[10px] uppercase font-mono">{label}</p>
      <pre className="overflow-x-auto bg-background p-2 border border-border text-[11px] font-mono rounded-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
