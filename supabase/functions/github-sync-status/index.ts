// Read-only GitHub sync status: latest commits on the source branch,
// recent workflow runs for a given workflow file, and open PRs from
// source -> base. Token is used in-memory only and never persisted.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const repoPath = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);

const branchName = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9_./-]+$/);

const bodySchema = z.object({
  token: z.string().min(20).max(500),
  repo: repoPath,
  sourceBranch: branchName.default("lovable"),
  baseBranch: branchName.default("main"),
  workflowFile: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[A-Za-z0-9_.-]+\.ya?ml$/)
    .default("lovable-sync-pr.yml"),
});

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return json({ error: "Unauthorized" }, 401);

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        400
      );
    }
    const { token, repo, sourceBranch, baseBranch, workflowFile } = parsed.data;

    const gh = (path: string) =>
      fetch(`https://api.github.com${path}`, {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "uhs-sync-status",
        },
      });

    // 1. Repo metadata (also acts as token sanity check)
    const repoRes = await gh(`/repos/${repo}`);
    if (repoRes.status === 401) return json({ error: "Token unauthorized (401)" }, 401);
    if (repoRes.status === 404) return json({ error: "Repo not found or no access" }, 404);
    if (!repoRes.ok) return json({ error: `Repo lookup failed (${repoRes.status})` }, 502);
    const repoData = await repoRes.json();
    const defaultBranch: string = repoData?.default_branch ?? baseBranch;

    // Run remaining calls in parallel
    const [commitsRes, runsRes, prsRes] = await Promise.all([
      gh(`/repos/${repo}/commits?sha=${encodeURIComponent(sourceBranch)}&per_page=10`),
      gh(
        `/repos/${repo}/actions/workflows/${encodeURIComponent(workflowFile)}/runs?per_page=10`
      ),
      gh(
        `/repos/${repo}/pulls?state=open&base=${encodeURIComponent(baseBranch)}&per_page=20`
      ),
    ]);

    // Commits
    let commits: CommitInfo[] = [];
    let commitsError: string | null = null;
    if (commitsRes.ok) {
      const data = await commitsRes.json();
      commits = (Array.isArray(data) ? data : []).map((c: any) => ({
        sha: c.sha,
        shortSha: String(c.sha ?? "").slice(0, 7),
        message: (c.commit?.message ?? "").split("\n")[0].slice(0, 200),
        author:
          c.author?.login ??
          c.commit?.author?.name ??
          "unknown",
        date: c.commit?.author?.date ?? c.commit?.committer?.date ?? "",
        url: c.html_url,
      }));
    } else if (commitsRes.status === 404 || commitsRes.status === 422) {
      commitsError = `Branch "${sourceBranch}" not found`;
    } else {
      commitsError = `Commits lookup failed (${commitsRes.status})`;
    }

    // Workflow runs
    let workflowRuns: WorkflowRunInfo[] = [];
    let workflowError: string | null = null;
    if (runsRes.ok) {
      const data = await runsRes.json();
      workflowRuns = (data?.workflow_runs ?? []).map((r: any) => ({
        id: r.id,
        name: r.name ?? r.display_title ?? "",
        status: r.status ?? "unknown",
        conclusion: r.conclusion,
        headBranch: r.head_branch ?? "",
        headSha: String(r.head_sha ?? "").slice(0, 7),
        event: r.event ?? "",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        url: r.html_url,
      }));
    } else if (runsRes.status === 404) {
      workflowError = `Workflow file "${workflowFile}" not found`;
    } else {
      workflowError = `Workflow runs lookup failed (${runsRes.status})`;
    }

    // PRs (then enrich top 5 with mergeable status)
    let pullRequests: PullRequestInfo[] = [];
    let prError: string | null = null;
    if (prsRes.ok) {
      const list = (await prsRes.json()) as any[];
      const filtered = list.filter(
        (p) => !sourceBranch || p?.head?.ref === sourceBranch || list.length <= 5
      );
      const candidates = (filtered.length > 0 ? filtered : list).slice(0, 5);
      const enriched = await Promise.all(
        candidates.map(async (p: any) => {
          // Detail call returns mergeable/mergeable_state
          let detail: any = p;
          try {
            const dRes = await gh(`/repos/${repo}/pulls/${p.number}`);
            if (dRes.ok) detail = await dRes.json();
          } catch {
            /* ignore */
          }
          return {
            number: detail.number,
            title: detail.title ?? "",
            state: detail.state ?? "open",
            draft: Boolean(detail.draft),
            mergeable: detail.mergeable ?? null,
            mergeableState: detail.mergeable_state ?? "unknown",
            headSha: String(detail.head?.sha ?? "").slice(0, 7),
            headBranch: detail.head?.ref ?? "",
            baseBranch: detail.base?.ref ?? baseBranch,
            createdAt: detail.created_at,
            updatedAt: detail.updated_at,
            url: detail.html_url,
          } as PullRequestInfo;
        })
      );
      pullRequests = enriched;
    } else {
      prError = `PR lookup failed (${prsRes.status})`;
    }

    return json({
      repo,
      defaultBranch,
      sourceBranch,
      baseBranch,
      workflowFile,
      checkedAt: new Date().toISOString(),
      commits,
      commitsError,
      workflowRuns,
      workflowError,
      pullRequests,
      prError,
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Server error" },
      500
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
