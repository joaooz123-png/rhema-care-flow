import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  KeyRound,
  Loader2,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  XCircle,
  Zap,
} from "lucide-react";
import { invokeEdgeFn } from "@/lib/invokeEdgeFn";

const CONFIG_KEY = "github.sync.config.v1";
const TOKEN_KEY = "github.sync.token"; // sessionStorage only

const configSchema = z.object({
  repo: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/,
      "Use the format owner/repo"
    ),
  sourceBranch: z.string().trim().min(1).max(120),
  baseBranch: z.string().trim().min(1).max(120),
  workflowFile: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_.-]+\.ya?ml$/, "Must be a .yml/.yaml filename"),
});

type Config = z.infer<typeof configSchema>;

interface CommitInfo {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

interface WorkflowRunInfo {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  headBranch: string;
  headSha: string;
  event: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface PullRequestInfo {
  number: number;
  title: string;
  state: string;
  draft: boolean;
  mergeable: boolean | null;
  mergeableState: string;
  headSha: string;
  headBranch: string;
  baseBranch: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface StatusPayload {
  repo: string;
  defaultBranch: string;
  sourceBranch: string;
  baseBranch: string;
  workflowFile: string;
  checkedAt: string;
  commits: CommitInfo[];
  commitsError: string | null;
  workflowRuns: WorkflowRunInfo[];
  workflowError: string | null;
  pullRequests: PullRequestInfo[];
  prError: string | null;
}

const DEFAULT_CONFIG: Config = {
  repo: "",
  sourceBranch: "lovable",
  baseBranch: "main",
  workflowFile: "lovable-sync-pr.yml",
};

const REFRESH_OPTIONS = [
  { value: "0", label: "Manual" },
  { value: "15", label: "15s" },
  { value: "30", label: "30s" },
  { value: "60", label: "1min" },
  { value: "120", label: "2min" },
];

function loadConfig(): Config {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = configSchema.partial().safeParse(JSON.parse(raw));
    if (!parsed.success) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...parsed.data };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function timeAgo(iso: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function GithubSyncStatus() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState<Config>(DEFAULT_CONFIG);
  const [configError, setConfigError] = useState<string | null>(null);

  const [token, setToken] = useState<string>(
    () => sessionStorage.getItem(TOKEN_KEY) ?? ""
  );
  const [tokenOpen, setTokenOpen] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");

  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refreshSeconds, setRefreshSeconds] = useState<number>(30);
  const [polling, setPolling] = useState(true);

  const tokenRef = useRef(token);
  const configRef = useRef(config);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Load saved config on mount
  useEffect(() => {
    const c = loadConfig();
    setConfig(c);
    setDraft(c);
  }, []);

  const fetchStatus = useCallback(async () => {
    const cfg = configRef.current;
    const tk = tokenRef.current;
    if (!tk || !cfg.repo) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await invokeEdgeFn<StatusPayload>(
      "github-sync-status",
      {
        token: tk,
        repo: cfg.repo,
        sourceBranch: cfg.sourceBranch,
        baseBranch: cfg.baseBranch,
        workflowFile: cfg.workflowFile,
      }
    );
    if (err || !data) {
      setError(err ?? "Failed to load status");
    } else {
      setStatus(data);
    }
    setLoading(false);
  }, []);

  // Initial fetch when token + repo present
  useEffect(() => {
    if (token && config.repo) {
      fetchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, config.repo, config.sourceBranch, config.baseBranch, config.workflowFile]);

  // Polling loop
  useEffect(() => {
    if (!polling || refreshSeconds <= 0) return;
    if (!token || !config.repo) return;
    const id = setInterval(fetchStatus, refreshSeconds * 1000);
    return () => clearInterval(id);
  }, [polling, refreshSeconds, fetchStatus, token, config.repo]);

  function saveConfig() {
    const result = configSchema.safeParse(draft);
    if (!result.success) {
      setConfigError(result.error.issues[0]?.message ?? "Invalid config");
      return;
    }
    setConfig(result.data);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(result.data));
    setConfigError(null);
    toast({ title: "Saved", description: "Configuration updated" });
  }

  function saveToken() {
    if (tokenDraft.trim().length < 20) {
      toast({
        title: "Invalid token",
        description: "Paste a valid GitHub PAT.",
        variant: "destructive",
      });
      return;
    }
    setToken(tokenDraft.trim());
    sessionStorage.setItem(TOKEN_KEY, tokenDraft.trim());
    setTokenDraft("");
    setTokenOpen(false);
    toast({
      title: "Token stored for this session",
      description: "Cleared automatically when you close the tab.",
    });
  }

  function clearToken() {
    setToken("");
    sessionStorage.removeItem(TOKEN_KEY);
    setStatus(null);
    toast({ title: "Token cleared" });
  }

  const headerRight = useMemo(() => {
    if (!token) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={String(refreshSeconds)}
          onValueChange={(v) => setRefreshSeconds(Number(v))}
        >
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REFRESH_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPolling((p) => !p)}
          disabled={refreshSeconds === 0}
        >
          {polling ? (
            <>
              <PauseCircle className="h-4 w-4 mr-1" /> Pause
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-1" /> Resume
            </>
          )}
        </Button>
        <Button size="sm" onClick={fetchStatus} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </div>
    );
  }, [token, refreshSeconds, polling, loading, fetchStatus]);

  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="h-7 w-7 text-primary" />
            GitHub Sync Status
          </h1>
          <p className="text-muted-foreground text-sm">
            Live view of pushes, workflow runs, and pull requests.
          </p>
        </div>
        {headerRight}
      </header>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repository</CardTitle>
          <CardDescription>
            Stored locally in your browser. Token is kept only for this tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="repo">Repo (owner/repo)</Label>
              <Input
                id="repo"
                value={draft.repo}
                onChange={(e) => setDraft({ ...draft, repo: e.target.value })}
                placeholder="my-org/my-app"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workflow">Workflow file</Label>
              <Input
                id="workflow"
                value={draft.workflowFile}
                onChange={(e) =>
                  setDraft({ ...draft, workflowFile: e.target.value })
                }
                placeholder="lovable-sync-pr.yml"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="src">Source branch</Label>
              <Input
                id="src"
                value={draft.sourceBranch}
                onChange={(e) =>
                  setDraft({ ...draft, sourceBranch: e.target.value })
                }
                placeholder="lovable"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="base">Base branch</Label>
              <Input
                id="base"
                value={draft.baseBranch}
                onChange={(e) =>
                  setDraft({ ...draft, baseBranch: e.target.value })
                }
                placeholder="main"
              />
            </div>
          </div>
          {configError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{configError}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveConfig} type="button">
              Save config
            </Button>
            {!token ? (
              <Button
                variant="outline"
                onClick={() => setTokenOpen(true)}
                type="button"
              >
                <KeyRound className="h-4 w-4 mr-1" /> Set GitHub token
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={clearToken}
                type="button"
              >
                <KeyRound className="h-4 w-4 mr-1" /> Clear token
              </Button>
            )}
            {status && (
              <span className="text-xs text-muted-foreground self-center ml-auto">
                Last check: {timeAgo(status.checkedAt)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* No token / no repo */}
      {(!token || !config.repo) && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Set the repo (e.g. <code className="text-xs">owner/repo</code>) and a
            GitHub Personal Access Token with <code className="text-xs">repo</code>{" "}
            scope. Token stays in this tab only — never persisted server-side.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Commits */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-primary" />
                Pushes — <code className="text-xs font-normal">{status.sourceBranch}</code>
              </CardTitle>
              <CardDescription className="text-xs">
                Latest commits on the source branch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {status.commitsError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.commitsError}</AlertDescription>
                </Alert>
              )}
              {!status.commitsError && status.commits.length === 0 && (
                <p className="text-sm text-muted-foreground">No commits found.</p>
              )}
              <ul className="divide-y rounded-md border">
                {status.commits.map((c) => (
                  <li
                    key={c.sha}
                    className="px-3 py-2 flex items-start gap-3 text-sm"
                  >
                    <Badge variant="secondary" className="font-mono shrink-0">
                      {c.shortSha}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.author} · {timeAgo(c.date)}
                      </p>
                    </div>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted-foreground hover:text-primary shrink-0"
                      aria-label="Open commit on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Workflow runs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Workflow — <code className="text-xs font-normal">{status.workflowFile}</code>
              </CardTitle>
              <CardDescription className="text-xs">
                Most recent runs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {status.workflowError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.workflowError}</AlertDescription>
                </Alert>
              )}
              {!status.workflowError && status.workflowRuns.length === 0 && (
                <p className="text-sm text-muted-foreground">No runs yet.</p>
              )}
              <ul className="divide-y rounded-md border">
                {status.workflowRuns.map((r) => (
                  <li
                    key={r.id}
                    className="px-3 py-2 flex items-start gap-3 text-sm"
                  >
                    <RunStatusBadge status={r.status} conclusion={r.conclusion} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {r.name || "(unnamed run)"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.event} · {r.headBranch} @ {r.headSha} ·{" "}
                        {timeAgo(r.updatedAt || r.createdAt)}
                      </p>
                    </div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted-foreground hover:text-primary shrink-0"
                      aria-label="Open run on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pull requests */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-primary" />
                Open PRs into{" "}
                <code className="text-xs font-normal">{status.baseBranch}</code>
              </CardTitle>
              <CardDescription className="text-xs">
                Mergeability is reported by GitHub and may be still computing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {status.prError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.prError}</AlertDescription>
                </Alert>
              )}
              {!status.prError && status.pullRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No open pull requests targeting{" "}
                  <code className="text-xs">{status.baseBranch}</code>.
                </p>
              )}
              <ul className="divide-y rounded-md border">
                {status.pullRequests.map((p) => (
                  <li
                    key={p.number}
                    className="px-3 py-2 flex items-start gap-3 text-sm"
                  >
                    <Badge variant="secondary" className="font-mono shrink-0">
                      #{p.number}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.headBranch} → {p.baseBranch} · {p.headSha} ·{" "}
                        {timeAgo(p.updatedAt)}
                      </p>
                    </div>
                    <MergeBadge pr={p} />
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-muted-foreground hover:text-primary shrink-0"
                      aria-label="Open PR on GitHub"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Token dialog */}
      <Dialog open={tokenOpen} onOpenChange={setTokenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>GitHub Personal Access Token</DialogTitle>
            <DialogDescription>
              Needs <code className="text-xs">repo</code> scope (read on Actions
              and Pull requests). Stored in <strong>sessionStorage</strong> only.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            value={tokenDraft}
            onChange={(e) => setTokenDraft(e.target.value)}
            placeholder="ghp_..."
            autoComplete="off"
            spellCheck={false}
            maxLength={500}
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setTokenDraft("");
                setTokenOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveToken} disabled={!tokenDraft}>
              Use token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RunStatusBadge({
  status,
  conclusion,
}: {
  status: string;
  conclusion: string | null;
}) {
  if (status === "in_progress" || status === "queued" || status === "waiting") {
    return (
      <Badge variant="secondary" className="shrink-0">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        {status.replace("_", " ")}
      </Badge>
    );
  }
  if (conclusion === "success") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600 shrink-0">
        <CheckCircle2 className="h-3 w-3 mr-1" /> success
      </Badge>
    );
  }
  if (conclusion === "failure" || conclusion === "timed_out") {
    return (
      <Badge variant="destructive" className="shrink-0">
        <XCircle className="h-3 w-3 mr-1" /> {conclusion}
      </Badge>
    );
  }
  if (conclusion === "cancelled" || conclusion === "skipped") {
    return (
      <Badge variant="outline" className="shrink-0">
        <Clock className="h-3 w-3 mr-1" /> {conclusion}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0">
      {conclusion ?? status}
    </Badge>
  );
}

function MergeBadge({ pr }: { pr: PullRequestInfo }) {
  if (pr.draft) {
    return (
      <Badge variant="outline" className="shrink-0">
        draft
      </Badge>
    );
  }
  if (pr.mergeable === true && pr.mergeableState === "clean") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600 shrink-0">
        <CheckCircle2 className="h-3 w-3 mr-1" /> clean
      </Badge>
    );
  }
  if (pr.mergeable === false || pr.mergeableState === "dirty") {
    return (
      <Badge variant="destructive" className="shrink-0">
        <XCircle className="h-3 w-3 mr-1" /> conflicts
      </Badge>
    );
  }
  if (pr.mergeableState === "blocked" || pr.mergeableState === "behind") {
    return (
      <Badge variant="secondary" className="shrink-0">
        {pr.mergeableState}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0">
      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
      checking
    </Badge>
  );
}
