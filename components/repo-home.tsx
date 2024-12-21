"use client";
import {
  Bug,
  Code,
  Eye,
  GitBranch,
  GitFork,
  GitPullRequest,
  MessageCircle,
  Star,
} from "lucide-react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";
import logger from "../lib/logger";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { getRepoInfo } from "../lib/methods";
import { RepoInfo } from "../types/objects";
export function RepoHome({
  owner,
  repo,
  url,
  children,
}: {
  owner: string;
  repo: string;
  url: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>({
    stars: 0,
    watchers: 0,
    forks: 0,
    isPrivate: false,
    name: "",
    description: "",
    defaultBranch: "",
    branches: [],
    readme: "",
    topics: [],
    license: "",
    updatedAt: "",
  });
  const fetchRepoInfo = async () => {
    try {
      const data = await getRepoInfo(url);
      setRepoInfo(data);
    } catch (err) {
      logger.error("Error fetching repository info", { error: err });
    }
  };

  // get current path
  const currentPath = usePathname();

  useEffect(() => {
    fetchRepoInfo();
  }, [url]);

  const tabs = [
    { name: "Code", icon: Code, href: "/repo" },
    { name: "Branches", icon: GitBranch, href: "/branches" },
    { name: "Pull Requests", icon: GitPullRequest, href: "/pull-requests" },
    { name: "Issues", icon: Bug, href: "/issues" },
    { name: "Discussions", icon: MessageCircle, href: "/discussions" },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="border-b border-muted">
        <div className="container mx-auto py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <Link
                href={`https://github.com/${owner}`}
                className="hover:text-foreground hover:underline"
              >
                {owner}
              </Link>
              <span>/</span>
              <Link
                href={url}
                className="font-semibold text-foreground hover:underline"
              >
                {repo}
              </Link>
              {repoInfo?.isPrivate && (
                <Badge variant="secondary">Private</Badge>
              )}
            </div>

            <ThemeToggle />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 hover:bg-muted/80">
              <Star className="h-4 w-4" />
              Star
              <Badge variant="secondary">{repoInfo?.stars}</Badge>
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 hover:bg-muted/80">
              <Eye className="h-4 w-4" />
              Watch
              <Badge variant="secondary">{repoInfo?.watchers}</Badge>
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 hover:bg-muted/80">
              <GitFork className="h-4 w-4" />
              Fork
              <Badge variant="secondary">{repoInfo?.forks}</Badge>
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-muted">
        <div className="container mx-auto">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.href === currentPath;
              return (
                <Link
                  key={tab.name}
                  href={`${tab.href}?url=${encodeURIComponent(url)}`}
                  className={`flex items-center gap-2 border-b-2 border-muted px-4 py-3 hover:bg-muted/50 ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
