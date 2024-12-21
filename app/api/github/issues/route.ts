import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import logger from '../../../../lib/logger'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const state = searchParams.get('state') || 'all'

  logger.info('Received GitHub issues request', { url, state })

  if (!url) {
    logger.warn('No URL provided', { url })
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  const [, owner, repo] = url.match(/github\.com\/([^\/]+)\/([^\/]+)/) || []

  if (!owner || !repo) {
    logger.warn('Invalid GitHub URL format', { url })
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 })
  }

  try {
    const [issuesResponse, labelsResponse] = await Promise.all([
      octokit.issues.listForRepo({
        owner,
        repo,
        state: state as 'open' | 'closed' | 'all',
      }),
      octokit.issues.listLabelsForRepo({
        owner,
        repo,
      }),
    ])

    const issues = await Promise.all(
      issuesResponse.data.map(async (issue) => {
        const comments = await octokit.issues.listComments({
          owner,
          repo,
          issue_number: issue.number,
        })

        return {
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: {
            login: issue.user?.login,
            avatar_url: issue.user?.avatar_url,
          },
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          body: issue.body,
          labels: issue.labels.map((label: any) => ({
            name: label.name,
            color: label.color,
          })),
          comments: comments.data.map((comment) => ({
            id: comment.id,
            body: comment.body,
            user: {
              login: comment.user?.login,
              avatar_url: comment.user?.avatar_url,
            },
            created_at: comment.created_at,
          })),
        }
      })
    )

    return NextResponse.json({
      issues,
      labels: labelsResponse.data.map((label) => ({
        name: label.name,
        color: label.color,
        description: label.description,
      })),
    })
  } catch (error) {
    logger.error('Error fetching issues', { error, owner, repo })
    return NextResponse.json({ error: 'Error fetching issues' }, { status: 500 })
  }
} 