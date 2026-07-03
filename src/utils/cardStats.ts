import type { GitHubProfileData } from '../types/github'

export interface CardStats {
  pac: number
  sho: number
  pas: number
  dri: number
  def: number
  phy: number
  ovr: number
  position: string
}

const BASE_FLOOR = 30
const STAT_CEILING = 99
const MAX_TENURE_BONUS = 12
const MAX_ACTIVITY_BONUS = 10

/** Logarithmic scale from `floor` to 99 so a handful of contributions still reads as playable. */
function scaleStat(value: number, referenceMax: number, floor: number): number {
  const ratio = Math.log10(1 + Math.max(0, value)) / Math.log10(1 + referenceMax)
  const scaled = floor + ratio * (STAT_CEILING - floor)
  return Math.round(Math.min(STAT_CEILING, Math.max(floor, scaled)))
}

/**
 * Stars/followers/forks reward chasing GitHub's social metrics, which most working
 * developers never do. A long-tenured, consistently active account earns a higher
 * floor on those stats so it doesn't read as a "bad" card next to a rare hit repo.
 */
function socialStatFloor(yearsActive: number, recentCommitCount: number): number {
  const tenureBonus = Math.min(MAX_TENURE_BONUS, yearsActive * 1.5)
  const activityBonus = Math.min(MAX_ACTIVITY_BONUS, recentCommitCount / 8)
  return Math.round(BASE_FLOOR + tenureBonus + activityBonus)
}

function topLanguage(repos: GitHubProfileData['repos']): string {
  const counts = new Map<string, number>()
  for (const repo of repos) {
    if (repo.fork || !repo.language) continue
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }

  let best: string | null = null
  let bestCount = 0
  for (const [language, count] of counts) {
    if (count > bestCount) {
      best = language
      bestCount = count
    }
  }
  return best ?? 'Full Stack'
}

function yearsSince(isoDate: string): number {
  const ms = Date.now() - new Date(isoDate).getTime()
  return ms / (1000 * 60 * 60 * 24 * 365.25)
}

export function computeCardStats(data: GitHubProfileData): CardStats {
  const ownRepos = data.repos.filter((repo) => !repo.fork)
  const totalStars = ownRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)
  const totalForks = ownRepos.reduce((sum, repo) => sum + repo.forks_count, 0)
  const languageDiversity = new Set(
    ownRepos.map((repo) => repo.language).filter((language): language is string => !!language),
  ).size
  const yearsActive = yearsSince(data.user.created_at)
  const socialFloor = socialStatFloor(yearsActive, data.recentCommitCount)

  const pac = scaleStat(data.recentCommitCount, 60, BASE_FLOOR)
  const sho = scaleStat(totalStars, 500, socialFloor)
  const pas = scaleStat(data.user.followers, 1000, socialFloor)
  const dri = scaleStat(languageDiversity, 10, socialFloor)
  const def = scaleStat(totalForks, 100, socialFloor)
  const phy = scaleStat(yearsActive, 15, BASE_FLOOR)

  const ovr = Math.round((pac + sho + pas + dri + def + phy) / 6)

  return { pac, sho, pas, dri, def, phy, ovr, position: topLanguage(data.repos) }
}
