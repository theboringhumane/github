import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import logger from '../../../../lib/logger'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  logger.info('Received GitHub branches request', { url })

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
    const { data: branches } = await octokit.repos.listBranches({
      owner,
      repo,
    })

    const branchDetails = await Promise.all(
      branches.map(async (branch) => {
        const { data: commit } = await octokit.repos.getBranch({
          owner,
          repo,
          branch: branch.name,
        })

        return {
          name: branch.name,
          sha: branch.commit.sha,
          protected: branch.protected,
          lastCommit: {
            message: commit.commit.commit.message,
            author: commit.commit.author?.login,
            date: commit.commit.commit.author?.date,
          },
        }
      })
    )

    return NextResponse.json({ branches: branchDetails })
  } catch (error) {
    logger.error('Error fetching branches', { error, owner, repo })
    return NextResponse.json({ error: 'Error fetching branches' }, { status: 500 })
  }
} 