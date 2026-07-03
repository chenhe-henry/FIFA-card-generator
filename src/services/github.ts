import type { GitHubProfileData, GitHubRepo, GitHubUser } from '../types/github'

const API_BASE = 'https://api.github.com'

export class GitHubApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
  }
}

export function parseGithubUsername(input: string): string {
  const trimmed = input.trim()
  const urlMatch = trimmed.match(/github\.com\/([^/?#]+)/i)
  const candidate = urlMatch ? urlMatch[1] : trimmed
  return candidate.replace(/^@/, '')
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (response.status === 404) {
    throw new GitHubApiError('GitHub user not found.', 404)
  }
  if (response.status === 403) {
    throw new GitHubApiError(
      'GitHub API rate limit exceeded. Try again in a few minutes.',
      403,
    )
  }
  if (!response.ok) {
    throw new GitHubApiError(`GitHub API request failed (${response.status}).`, response.status)
  }

  return response.json() as Promise<T>
}

interface PublicEvent {
  type: string
  payload?: { size?: number }
}

async function fetchRecentCommitCount(username: string): Promise<number> {
  const events = await getJson<PublicEvent[]>(`/users/${username}/events/public?per_page=100`)
  return events
    .filter((event) => event.type === 'PushEvent')
    .reduce((total, event) => total + (event.payload?.size ?? 0), 0)
}

export async function fetchGithubProfile(username: string): Promise<GitHubProfileData> {
  const user = await getJson<GitHubUser>(`/users/${username}`)
  const repos = await getJson<GitHubRepo[]>(
    `/users/${username}/repos?per_page=100&sort=pushed`,
  )
  const recentCommitCount = await fetchRecentCommitCount(username)

  return { user, repos, recentCommitCount }
}
