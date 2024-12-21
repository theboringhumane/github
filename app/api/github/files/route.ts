import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import logger from '../../../../lib/logger'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const path = searchParams.get('path') || ''
  const branch = searchParams.get('branch') || 'sudo'

  logger.info('Received GitHub files request', { url, path, branch })

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
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })

    const files = Array.isArray(contents) ? contents : [contents]
    const formattedFiles = files.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      sha: file.sha,
      url: file.html_url,
      download_url: file.download_url,
    }))

    return NextResponse.json({ files: formattedFiles })
  } catch (error) {
    logger.error('Error fetching repository files', { error, owner, repo, path })
    return NextResponse.json({ error: 'Error fetching repository files' }, { status: 500 })
  }
} 