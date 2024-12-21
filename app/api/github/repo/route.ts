import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import logger from '../../../../lib/logger'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  logger.info('Received GitHub repository request', { url })

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
    const [repoResponse, readmeResponse, branchesResponse] = await Promise.all([
      octokit.repos.get({
        owner,
        repo,
      }),
      octokit.repos.getReadme({
        owner,
        repo,
      }).catch(() => null), // Don't fail if README doesn't exist
      octokit.repos.listBranches({
        owner,
        repo,
      }),
    ])

    const repoData = repoResponse.data;
    const readmeContent = readmeResponse ? 
      Buffer.from(readmeResponse.data.content, 'base64').toString('utf-8') : 
      null;

    return NextResponse.json({
      name: repoData.name,
      description: repoData.description,
      stars: repoData.stargazers_count,
      watchers: repoData.watchers_count,
      forks: repoData.forks_count,
      defaultBranch: repoData.default_branch,
      topics: repoData.topics || [],
      license: repoData.license?.name,
      isPrivate: repoData.private,
      updatedAt: repoData.updated_at,
      readme: readmeContent,
      branches: branchesResponse.data.map(branch => branch.name),
    })
  } catch (error) {
    logger.error('Error fetching repository info', { error, owner, repo })
    return NextResponse.json({ error: 'Error fetching repository info' }, { status: 500 })
  }
} 