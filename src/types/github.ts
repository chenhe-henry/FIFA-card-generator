export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  followers: number
  following: number
  public_repos: number
  created_at: string
  html_url: string
}

export interface GitHubRepo {
  name: string
  language: string | null
  stargazers_count: number
  forks_count: number
  fork: boolean
}

export interface GitHubProfileData {
  user: GitHubUser
  repos: GitHubRepo[]
  recentCommitCount: number
}
