import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { GitCommit, Plus, Minus } from "lucide-react";
import { AnimatedShinyText } from "./ui/animated-tag";

interface Commit {
  sha: string;
  message: string;
  parsed: {
    type: string;
    scope: string | null;
    description: string;
    emoji: string;
  };
  author: {
    name: string;
    email: string;
    avatar_url: string;
    login: string;
  };
  date: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  };
}

async function getCommits(url: string, branch?: string, page: number = 1) {
  const res = await fetch(
    `/api/github/commits?url=${encodeURIComponent(url)}&branch=${branch}&page=${page}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch commits");
  }

  return res.json();
}

function CommitListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CommitList({ url, branch }: { url: string; branch?: string }) {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const { commits } = await getCommits(url, branch, page);
        setCommits(commits);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch commits");
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [url, branch, page]);

  if (loading) {
    return <CommitListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {commits.map((commit) => (
        <Card key={commit.sha} className="p-4">
          <div className="flex items-start gap-4">
            <img
              src={commit.author.avatar_url}
              alt={commit.author.name}
              className="h-8 w-8 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {commit.parsed.description.split("\n")[0]}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <AnimatedShinyText className="flex items-center gap-2">
                      {commit.author.login}
                    </AnimatedShinyText>
                    <GitCommit className="h-3 w-3" />
                    <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                    <span>•</span>
                    <span>{new Date(commit.date).toLocaleString()}</span>
                  </div>
                </div>
                {commit.stats && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="success" className="flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      {commit.stats.additions}
                    </Badge>
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Minus className="h-3 w-3" />
                      {commit.stats.deletions}
                    </Badge>
                  </div>
                )}
              </div>
              {commit.parsed.scope && (
                <div className="mt-2">
                  <Badge variant="outline">{commit.parsed.scope}</Badge>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 