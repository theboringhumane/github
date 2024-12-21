import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import logger from '../../../../lib/logger'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const prNumber = searchParams.get('pr')

  logger.info('Received GitHub PR details request', { url, prNumber })

  if (!url || !prNumber) {
    logger.warn('Missing URL or PR number', { url, prNumber })
    return NextResponse.json({ error: 'Missing URL or PR number' }, { status: 400 })
  }

  const [, owner, repo] = url.match(/github\.com\/([^\/]+)\/([^\/]+)/) || []

  if (!owner || !repo) {
    logger.warn('Invalid GitHub URL format', { url })
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
  }

  try {
    const [prResponse, commentsResponse, filesResponse, reviewCommentsResponse] = await Promise.all([
      octokit.pulls.get({ owner, repo, pull_number: parseInt(prNumber) }),
      octokit.issues.listComments({
        owner,
        repo,
        issue_number: parseInt(prNumber),
      }),
      octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: parseInt(prNumber),
      }),
      octokit.pulls.listReviewComments({
        owner,
        repo,
        pull_number: parseInt(prNumber),
      }),
    ])

    const pr = {
      title: prResponse.data.title,
      number: prResponse.data.number,
      state: prResponse.data.state,
      author: { login: prResponse.data.user?.login, avatar_url: prResponse.data.user?.avatar_url },
      createdAt: prResponse.data.created_at,
      body: prResponse.data.body,
      labels: prResponse.data.labels.map((label: any) => label.name),
      comments: commentsResponse.data.map((comment) => ({
        user: comment.user,
        created_at: comment.created_at,
        body: comment.body,
        avatar_url: comment.user?.avatar_url,
      })),
      files: filesResponse.data.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
      })),
      reviewComments: reviewCommentsResponse.data.map((comment) => ({
        user: comment.user,
        created_at: comment.created_at,
        position: comment.position,
        path: comment.path,
        body: comment.body,
        avatar_url: comment.user?.avatar_url,
      })),
    }

    return NextResponse.json(pr)
  } catch (error) {
    logger.error('Error fetching PR details', { error, owner, repo, prNumber })
    return NextResponse.json({ error: 'Error fetching PR details' }, { status: 500 })
  }
}

