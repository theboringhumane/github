import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import logger from '../../../../lib/logger'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Common Git commit types and their corresponding emojis
const commitTypeEmojis: Record<string, string> = {
  feat: '✨',
  fix: '🐛',
  docs: '📚',
  style: '💎',
  refactor: '♻️',
  perf: '🚀',
  test: '🧪',
  build: '🛠️',
  ci: '⚙️',
  chore: '🧹',
  revert: '⏪',
  wip: '🚧',
  init: '🎉',
  security: '🔒',
  deps: '📦',
  breaking: '💥',
  config: '🔧',
  remove: '🗑️',
}

function parseCommitMessage(message: string) {
  // Match conventional commit format: type(scope): description
  const match = message.match(/^(\w+)(?:\(([^)]+)\))?: (.+)/)
  
  if (match) {
    const [, type, scope, description] = match
    return {
      type,
      scope,
      description,
      emoji: commitTypeEmojis[type.toLowerCase()] || '💡'
    }
  }

  // Try to infer type from message content
  const inferredType = Object.entries(commitTypeEmojis).find(([type]) => 
    message.toLowerCase().includes(type)
  )

  if (inferredType) {
    return {
      type: inferredType[0],
      scope: null,
      description: message,
      emoji: inferredType[1]
    }
  }

  return {
    type: 'other',
    scope: null,
    description: message,
    emoji: '💡'
  }
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const branch = searchParams.get('branch') || 'main'
  const page = parseInt(searchParams.get('page') || '1')
  const per_page = parseInt(searchParams.get('per_page') || '30')

  logger.info('Received GitHub commits request', { url, branch, page })

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
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page,
      page,
    })

    const formattedCommits = commits.map(commit => {
      const parsed = parseCommitMessage(commit.commit.message)
      return {
        sha: commit.sha,
        message: commit.commit.message,
        parsed,
        author: {
          name: commit.commit.author?.name,
          email: commit.commit.author?.email,
          avatar_url: commit.author?.avatar_url,
          login: commit.author?.login,
        },
        date: commit.commit.author?.date,
        stats: {
          additions: commit.stats?.additions,
          deletions: commit.stats?.deletions,
          total: commit.stats?.total,
        },
      }
    })

    return NextResponse.json({ commits: formattedCommits })
  } catch (error) {
    logger.error('Error fetching commits', { error, owner, repo })
    return NextResponse.json({ error: 'Error fetching commits' }, { status: 500 })
  }
} 