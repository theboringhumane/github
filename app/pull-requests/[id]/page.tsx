"use client";
import { use, useEffect, useState } from "react";
import { ArrowLeft, File, GitPullRequest } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "../../../components/ui/badge";
import { Card } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { AnimatedShinyText } from "../../../components/ui/animated-tag";
import remarkFrontmatter from "remark-frontmatter";
import { RepoHome } from "../../../components/repo-home";
import { useRouter } from "next/navigation";
import { PR } from "../../../types/objects";
async function getPRDetails(url: string, prNumber: string) {
  const res = await fetch(
    `/api/github/pr?url=${encodeURIComponent(url)}&pr=${prNumber}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch PR details");
  }
  return res.json();
}

function PRDetailsSkeleton() {
  return (
    <div className="bg-background">
      <div className="container bg-background mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          <Separator className="my-6" />

          {/* Review Comments Skeleton */}
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={`review-${i}`}
                className="rounded-lg border border-muted p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Comments Skeleton */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={`comment-${i}`}
                className="rounded-lg border border-muted p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Files Changed Skeleton */}
        <Card className="mt-6 divide-y divide-muted">
          <h2 className="p-4 text-lg font-semibold">Files Changed</h2>
          {[...Array(4)].map((_, i) => (
            <div key={`file-${i}`} className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-64" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default function PRDetails({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const router = useRouter();
  const [pr, setPR] = useState<PR | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { url } = use(searchParams);
  const { id } = use(params);
  useEffect(() => {
    if (!url) return;

    const fetchPRDetails = async () => {
      try {
        const data = await getPRDetails(url, id);
        setPR(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch PR details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPRDetails();
  }, [url, id]);

  if (!url) {
    return <div className="p-4 text-center">No repository URL provided</div>;
  }

  const [owner, repo] = url.replace("https://github.com/", "").split("/");

  if (loading) {
    return (
      <RepoHome owner={owner} repo={repo} url={url}>
        <PRDetailsSkeleton />
      </RepoHome>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">Error: {error}</div>
    );
  }

  if (!pr) {
    return <div className="p-4 text-center">No pull request found</div>;
  }

  return (
    <RepoHome owner={owner} repo={repo} url={url}>
      <div className="container bg-background mx-auto py-6">
        <div className="mb-6">
          <Button
            onClick={() => {
              router.back();
            }}
            variant="ghost"
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pull requests
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{pr.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <GitPullRequest
                  className={
                    pr.state === "open" ? "text-green-500" : "text-gray-500"
                  }
                />
                <span>#{pr.number}</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>{pr.state} by</span>{" "}
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
                  <span>on {new Date(pr.createdAt).toLocaleString()}</span>{" "}
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {pr.labels.map((label: string) => (
                <Badge
                  key={label}
                  variant={label.includes("complete") ? "success" : "default"}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card className="p-6">
          <div className="prose max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkFrontmatter]}>
              {/*
                remove text that starts with <!--  and ends with -->
                */}
              {pr.body.replace(/^<!--[\s\S]*-->/, "") || ""}
            </ReactMarkdown>
          </div>
          <Separator className="my-6" />

          <div className="space-y-6">
            {pr.reviewComments.map((comment, i) => (
              <div key={i} className="rounded-lg border border-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-mono text-sm flex items-center gap-2">
                    <File className="w-4 h-4" /> {comment.path}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Line {comment.position}
                  </div>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs bg-muted flex p-0.5 rounded-md items-center gap-2">
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.login}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                    <AnimatedShinyText className="">
                      {comment.user.login}
                    </AnimatedShinyText>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="prose max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkFrontmatter]}>
                    {comment.body || ""}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-6" />

          <div className="space-y-6">
            {pr.comments.map((comment, i) => (
              <div key={i} className="rounded-lg border border-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.login}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                    <div className="font-semibold">{comment.user.login}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="prose max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkFrontmatter]}>
                    {comment.body.replace(/^---[\s\S]*---/, "") || ""}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-6 divide-y divide-muted">
          <h2 className="p-4 text-lg font-semibold">Files Changed</h2>
          {pr.files.map((file, i) => (
            <div key={i} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-mono text-sm">{file.filename}</div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={file.status === "added" ? "success" : "default"}
                  >
                    {file.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    +{file.additions}, -{file.deletions}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </RepoHome>
  );
}
