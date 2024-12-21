"use client";
import { use } from "react";
import { BranchList } from "../../components/branch-list";
import { RepoHome } from "../../components/repo-home";

export default function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = use(searchParams);

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
      <BranchList url={url} />
    </RepoHome>
  );
}
