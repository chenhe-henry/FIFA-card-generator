import { computeCardStats } from './cardStats'
import type { GitHubProfileData } from '../types/github'

function makeProfile(overrides: Partial<GitHubProfileData> = {}): GitHubProfileData {
  return {
    user: {
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      bio: null,
      company: null,
      location: null,
      followers: 0,
      following: 0,
      public_repos: 0,
      created_at: new Date().toISOString(),
      html_url: 'https://github.com/octocat',
    },
    repos: [],
    recentCommitCount: 0,
    ...overrides,
  }
}

describe('computeCardStats', () => {
  it('floors every stat at 30 for a brand-new, inactive account', () => {
    const stats = computeCardStats(makeProfile())
    expect(stats.pac).toBe(30)
    expect(stats.sho).toBe(30)
    expect(stats.pas).toBe(30)
    expect(stats.dri).toBe(30)
    expect(stats.def).toBe(30)
    expect(stats.ovr).toBe(30)
  })

  it('raises the floor on star/follower/fork/language stats for a tenured, active account with no social traction', () => {
    const stats = computeCardStats(
      makeProfile({
        user: {
          ...makeProfile().user,
          followers: 0,
          created_at: new Date(Date.now() - 8 * 365.25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        repos: [],
        recentCommitCount: 40,
      }),
    )
    // tenureBonus = min(12, 8 * 1.5) = 12, activityBonus = min(10, 40 / 8) = 5 -> floor 47
    expect(stats.sho).toBe(47)
    expect(stats.pas).toBe(47)
    expect(stats.dri).toBe(47)
    expect(stats.def).toBe(47)
    // pac/phy are direct activity/age measures, not boosted by the social floor
    expect(stats.pac).toBeGreaterThan(30)
    expect(stats.phy).toBeGreaterThan(30)
  })

  it('scales stats up with activity, capped at 99', () => {
    const stats = computeCardStats(
      makeProfile({
        user: {
          ...makeProfile().user,
          followers: 5000,
          created_at: new Date(Date.now() - 20 * 365.25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        repos: [
          { name: 'a', language: 'TypeScript', stargazers_count: 1000, forks_count: 200, fork: false },
          { name: 'b', language: 'Rust', stargazers_count: 50, forks_count: 10, fork: false },
          { name: 'forked', language: 'Go', stargazers_count: 999, forks_count: 999, fork: true },
        ],
        recentCommitCount: 500,
      }),
    )
    expect(stats.pac).toBe(99)
    expect(stats.sho).toBe(99)
    expect(stats.pas).toBe(99)
    expect(stats.phy).toBe(99)
    expect(stats.position).toBe('TypeScript')
  })

  it('excludes forked repos from stars, forks, and language stats', () => {
    const stats = computeCardStats(
      makeProfile({
        repos: [{ name: 'forked', language: 'Go', stargazers_count: 999, forks_count: 999, fork: true }],
      }),
    )
    expect(stats.sho).toBe(30)
    expect(stats.def).toBe(30)
    expect(stats.dri).toBe(30)
  })

  it('falls back to "Full Stack" when no language signal exists', () => {
    const stats = computeCardStats(makeProfile())
    expect(stats.position).toBe('Full Stack')
  })
})
