"use client";
import Link from "next/link";
import { GitPullRequest, MessagesSquare } from "lucide-react";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { Navbar } from "./navbar";
import { Skeleton } from "./ui/skeleton";
import { AnimatedShinyText } from "./ui/animated-tag";
import { PR } from "../types/objects";

async function getPRs(url: string) {
  const res = await fetch(`/api/github?url=${encodeURIComponent(url)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch PRs: ${res.statusText}`);
  }

  return res.json();
}

function PRListSkeleton() {
  return (
    <div className="rounded-lg mt-4 mx-auto container border border-muted bg-card">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 border-b border-muted p-4 last:border-0"
        >
          <Skeleton className="h-4 w-4" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PRList({ searchParams }: { searchParams: { url?: string } }) {
  const { url } = searchParams;
  const [prs, setPRs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    setLoading(true);
    const fetchPRs = async () => {
      try {
        const { prs } = await getPRs(url);
        setPRs(prs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch PRs");
      } finally {
        setLoading(false);
      }
    };
    fetchPRs();
  }, [url]);

  const [filter, setFilter] = useState("all");

  const filteredPRs = prs.filter((pr) => {
    const [filterType, filterValue] = filter.split(":");
    if (filterType === "all") return true;
    if (filterType === "label") return pr.labels.includes(filterValue);
    if (filterType === "state") return pr.state === filterValue;
    return true;
  });

  if (!url) {
    return (
      <div className="text-center p-4">
        Please enter a GitHub repository URL
      </div>
    );
  }

  if (loading) {
    return <PRListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">Error: {error}</div>
    );
  }

  if (!filteredPRs || filteredPRs.length === 0) {
    return <div className="text-center p-4">No pull requests found</div>;
  }

  return (
    <div className="mx-auto container">
      <Navbar
        prs={prs}
        repo={url.replace("https://github.com/", "")}
        setFilter={setFilter}
      />
      <div className="rounded-lg border border-muted bg-card">
        {filteredPRs.map((pr: PR) => (
          <div
            key={pr.number}
            className="flex items-start gap-4 border-b border-muted p-4 last:border-0"
          >
            <Checkbox />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/pull-requests/${pr.number}?url=${encodeURIComponent(url)}`}
                    className="text-lg flex items-center gap-2 font-semibold hover:text-primary"
                  >
                    <GitPullRequest className={
                      pr.state === "open" ? "text-green-500" : "text-gray-500"
                    } />
                    <span>{pr.title}</span>
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>#{pr.number} by</span>
                    <AnimatedShinyText className="flex items-center gap-2">
                      <img
                        src={pr.author.avatar_url}
                        alt={pr.author.login}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />{" "}
                      {pr.author.login}
                    </AnimatedShinyText>{" "}
                    <span>
                      was {pr.state} {new Date(pr.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <MessagesSquare className="h-4 w-4" />
                    <span className="text-sm">{pr.comments.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitPullRequest className="h-4 w-4" />
                    <span className="text-sm">{pr.reviewComments.length}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {pr.labels.map((label: string) => (
                  <Badge
                    key={label}
                    variant={
                      label.includes("complete")
                        ? "success"
                        : label === "enhancement"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
