import { useEffect, useState } from "react";
import { GitBranch, GitCommit, Shield } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

interface Branch {
  name: string;
  sha: string;
  protected: boolean;
  lastCommit: {
    message: string;
    author: string;
    date: string;
  };
}

async function getBranches(url: string) {
  const res = await fetch(`/api/github/branches?url=${encodeURIComponent(url)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch branches");
  }

  return res.json();
}

function BranchListSkeleton() {
  return (
    <div className="space-y-4 mt-4 container pb-8 mx-auto">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-2 space-y-1">
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function BranchList({ url }: { url: string }) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { branches } = await getBranches(url);
        setBranches(branches);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [url]);

  if (loading) {
    return <BranchListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4 mt-4 container pb-8 mx-auto">
      {branches.map((branch) => (
        <Card key={branch.name} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-medium">{branch.name}</span>
              {branch.protected && (
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Protected
                </Badge>
              )}
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {branch.sha.slice(0, 7)}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm">{branch.lastCommit.message}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitCommit className="h-3 w-3" />
              <span>
                {branch.lastCommit.author} committed{" "}
                {new Date(branch.lastCommit.date).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 