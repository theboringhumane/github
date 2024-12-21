import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, MessageCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

interface Issue {
  number: number;
  title: string;
  state: string;
  author: {
    login: string;
    avatar_url: string;
  };
  createdAt: string;
  updatedAt: string;
  body: string;
  labels: Array<{
    name: string;
    color: string;
  }>;
  comments: Array<{
    id: number;
    body: string;
    user: {
      login: string;
      avatar_url: string;
    };
    created_at: string;
  }>;
}

async function getIssues(url: string) {
  const res = await fetch(`/api/github/issues?url=${encodeURIComponent(url)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch issues");
  }

  return res.json();
}

function IssueListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-4 w-4 mt-1" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function IssueList({ url }: { url: string }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const { issues } = await getIssues(url);
        setIssues(issues);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [url]);

  if (loading) {
    return <IssueListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">Error: {error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <Card key={issue.number} className="p-4">
          <div className="flex items-start gap-4">
            <AlertCircle
              className={
                issue.state === "open"
                  ? "text-green-500 h-4 w-4 mt-1"
                  : "text-gray-500 h-4 w-4 mt-1"
              }
            />
            <div className="flex-1">
              <Link
                href={`/issue/${issue.number}?url=${encodeURIComponent(url)}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {issue.title}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>#{issue.number}</span>
                <span>opened by {issue.author.login}</span>
                <span>{new Date(issue.createdAt).toLocaleString()}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {issue.labels.map((label) => (
                  <Badge
                    key={label.name}
                    style={{
                      backgroundColor: `#${label.color}`,
                      color: parseInt(label.color, 16) > 0x7fffff ? "#000" : "#fff",
                    }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{issue.comments.length}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 