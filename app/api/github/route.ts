import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import logger from "../../../lib/logger";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  logger.info("Received GitHub data request", { url });

  if (!url) {
    logger.warn("No URL provided", { url });
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  const [, owner, repo] = url.match(/github\.com\/([^\/]+)\/([^\/]+)/) || [];

  if (!owner || !repo) {
    logger.warn("Invalid GitHub URL format", { url });
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
  }

  try {
    const [prsResponse, repoResponse] = await Promise.all([
      octokit.pulls.list({ owner, repo, state: "all" }),
      octokit.repos.get({ owner, repo }),
    ]);

    if (repoResponse.data.private) {
      logger.warn("Repository is private", { owner, repo });
      return NextResponse.json(
        { error: "Repository is private" },
        { status: 403 }
      );
    }

    const getPrComments = async (pr: any) => {
      const comments = await octokit.issues.listComments({
        owner,
        repo,
        issue_number: pr.number,
      });
      return comments.data;
    };

    const getReviewComments = async (pr: any) => {
      const reviewComments = await octokit.pulls.listReviewComments({
        owner,
        repo,
        pull_number: pr.number,
      });
      return reviewComments.data;
    };

    const prs = await Promise.all(
      prsResponse.data.map(async (pr) => {
        const comments = await getPrComments(pr);
        const reviewComments = await getReviewComments(pr);
        return {
          number: pr.number,
          title: pr.title,
          author: { login: pr.user?.login, avatar_url: pr.user?.avatar_url },
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          state: pr.state,
          labels: pr.labels.map((label) => label.name),
          comments: comments.map((comment) => ({
            number: comment.id,
            author: comment.user?.login,
            body: comment.body,
            avatar_url: comment.user?.avatar_url,
          })),
          reviewComments: reviewComments.map((comment) => ({
            number: comment.id,
            author: comment.user?.login,
            body: comment.body,
            position: comment.position,
            path: comment.path,
            avatar_url: comment.user?.avatar_url,
          })),
        };
      })
    );

    return NextResponse.json({ prs });
  } catch (error) {
    logger.error("Error fetching GitHub data", { error, owner, repo });
    return NextResponse.json(
      { error: "Error fetching GitHub data" },
      { status: 500 }
    );
  }
}
