"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  Star,
  Eye,
  GitFork,
  Code,
  CircleDot,
  GitPullRequest,
  Scale,
  Play,
  Shield,
  Settings,
  Inbox,
  GitCommit,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { FileTree } from "../../components/file-tree";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import logger from "../../lib/logger";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useRouter } from "next/navigation";
import { RepoHome } from "../../components/repo-home";

export interface RepoInfo {
  name: string;
  description: string;
  stars: number;
  watchers: number;
  forks: number;
  defaultBranch: string;
  branches: string[];
  topics: string[];
  license: string;
  isPrivate: boolean;
  updatedAt: string;
  readme: string | null;
}

export async function getRepoInfo(url: string) {
  const res = await fetch(`/api/github/repo?url=${encodeURIComponent(url)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch repository info");
  }

  return res.json();
}

function RepoSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-muted">
        <div className="container mx-auto py-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-muted">
        <div className="container mx-auto">
          <div className="flex gap-6 py-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <Card className="mb-6 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-48" />
              </div>
            </Card>

            <Card className="mb-6 p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <Skeleton className="mb-4 h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { name: "Code", icon: Code, href: "/repo" },
  { name: "Issues", icon: CircleDot, href: "/issues" },
  { name: "Pull Requests", icon: GitPullRequest, href: "/pulls" },
  { name: "Branches", icon: GitBranch, href: "/branches" },
  //   { name: "Actions", icon: Play, href: "/actions" },
  //   { name: "Security", icon: Shield, href: "/security" },
  //   { name: "Insights", icon: Inbox, href: "/insights" },
];

export default function RepoPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; branch?: string }>;
}) {
  const router = useRouter();

  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { url, branch } = use(searchParams);

  useEffect(() => {
    if (!url) return;

    const fetchRepoInfo = async () => {
      try {
        const data = await getRepoInfo(url);
        setRepoInfo(data);
        if (!branch) {
          router.push(`/repo?url=${url}&branch=${data.defaultBranch}`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch repository info"
        );
        logger.error("Error fetching repository info", { error: err });
      } finally {
        setLoading(false);
      }
    };

    fetchRepoInfo();
  }, [url]);

  if (!url) {
    return (
      <div className="text-center p-4">
        Please enter a GitHub repository URL
      </div>
    );
  }

  if (loading) {
    return <RepoSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">Error: {error}</div>
    );
  }

  if (!repoInfo) {
    return <div className="text-center p-4">No repository found</div>;
  }

  const [owner, repo] = url.replace("https://github.com/", "").split("/");

  return (
    <RepoHome owner={owner} repo={repo} url={url}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3">
              <Card className="mb-6 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <Select
                      defaultValue={repoInfo.defaultBranch}
                      onValueChange={(value) => {
                        router.push(`/repo?url=${url}&branch=${value}`);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {repoInfo.branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-2">
                    <Link href={`/commits?url=${url}&branch=${branch}`}>
                      <GitCommit className="h-4 w-4" />
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      Last updated{" "}
                      {new Date(repoInfo.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>

              <FileTree url={url} branch={branch} />

              {repoInfo.readme && (
                <Card className="mb-6 p-6 mt-8">
                  <article className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {repoInfo.readme}
                    </ReactMarkdown>
                  </article>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-4">
                <h2 className="mb-2 font-semibold">About</h2>
                <p className="text-sm text-muted-foreground">
                  {repoInfo.description}
                </p>
                {repoInfo.topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {repoInfo.topics.map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                )}
                {repoInfo.license && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Scale className="h-4 w-4" />
                    {repoInfo.license}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RepoHome>
  );
}
