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
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-3 sm:p-4 animate-pulse">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-[80%]" />
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
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
      <div className="text-center p-4 rounded-lg bg-destructive/10 text-destructive">
        <p className="font-medium">Error loading commits</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {commits.map((commit) => (
        <Card 
          key={commit.sha} 
          className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <img
              src={commit.author.avatar_url}
              alt={commit.author.name}
              className="h-8 w-8 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-background ring-muted"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {commit.parsed.description.split("\n")[0]}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <AnimatedShinyText className="flex items-center gap-1">
                      {commit.author.login}
                    </AnimatedShinyText>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <GitCommit className="h-3 w-3" />
                      <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs sm:text-sm">
                      {new Date(commit.date).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>
                {commit.stats && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge 
                      className="flex items-center gap-1 transition-transform hover:scale-105 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                    >
                      <Plus className="h-3 w-3" />
                      {commit.stats.additions}
                    </Badge>
                    <Badge 
                      className="flex items-center gap-1 transition-transform hover:scale-105 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                    >
                      <Minus className="h-3 w-3" />
                      {commit.stats.deletions}
                    </Badge>
                  </div>
                )}
              </div>
              {commit.parsed.scope && (
                <div className="mt-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {commit.parsed.scope}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 