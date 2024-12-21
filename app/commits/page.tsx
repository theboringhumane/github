"use client";
import { use } from "react";
import { CommitList } from "../../components/commit-list";
import { RepoHome } from "../../components/repo-home";

export default function CommitsPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; branch?: string }>;
}) {
  const { url, branch } = use(searchParams);

  if (!url) {
    return (
      <div className="text-center p-4">
        Please enter a GitHub repository URL
      </div>
    );
  }

  const [owner, repo] = url.replace("https://github.com/", "").split("/");

  return (
    <RepoHome owner={owner} repo={repo} url={url}>
      <div className="container mx-auto py-6">
        <CommitList url={url} branch={branch} />
      </div>
    </RepoHome>
  );
} 