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
        <div className="container mx-auto py-4 px-4 lg:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
              <GitBranch className="h-4 w-4" />
              <Link
                href={`https://github.com/${owner}`}
                className="hover:text-foreground hover:underline transition-colors"
              >
                {owner}
              </Link>
              <span>/</span>
              <Link
                href={url}
                className="font-semibold text-foreground hover:underline transition-colors"
              >
                {repo}
              </Link>
              {repoInfo?.isPrivate && (
                <Badge variant="secondary" className="animate-in fade-in">Private</Badge>
              )}
            </div>

            <ThemeToggle />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4">
            <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 hover:bg-muted/80 transition-colors">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Star</span>
              <Badge variant="secondary" className="ml-1">{repoInfo?.stars || 0}</Badge>
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 hover:bg-muted/80 transition-colors">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Watch</span>
              <Badge variant="secondary" className="ml-1">{repoInfo?.watchers || 0}</Badge>
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 hover:bg-muted/80 transition-colors">
              <GitFork className="h-4 w-4" />
              <span className="hidden sm:inline">Fork</span>
              <Badge variant="secondary" className="ml-1">{repoInfo?.forks || 0}</Badge>
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-muted overflow-x-auto">
        <div className="container mx-auto">
          <nav className="flex min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.href === currentPath;
              return (
                <Link
                  key={tab.name}
                  href={`${tab.href}?url=${encodeURIComponent(url)}`}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors hover:bg-muted/50 ${
                    isActive
                      ? "border-primary text-foreground font-medium"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.slice(0, 1)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-4 lg:px-6">
        {children}
      </div>
    </div>
  );
}
