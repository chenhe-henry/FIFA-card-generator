import type { GitHubProfileData } from '../types/github'

export interface CardStats {
  pac: number
  sho: number
  pas: number
  dri: number
  def: number
  phy: number
  ovr: number
  /** FIFA-style position code (e.g. "CAM", "CB", "GK"), derived from the stat profile. */
  position: string
  /** Most-used GitHub language (e.g. "TypeScript", "Vue"), shown as a badge, not a position. */
  language: string
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

type StatKey = 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy'
type SixStats = Record<StatKey, number>

interface PositionArchetype {
  code: string
  weights: Partial<SixStats>
}

/** Below this OVR the profile reads as too weak to fit any outfield archetype. */
const GOALKEEPER_OVR_CEILING = 45

const POSITION_ARCHETYPES: readonly PositionArchetype[] = [
  { code: 'ST', weights: { pac: 0.3, sho: 0.4, dri: 0.2, phy: 0.1 } },
  { code: 'LW', weights: { pac: 0.4, sho: 0.15, pas: 0.1, dri: 0.35 } },
  { code: 'CAM', weights: { pac: 0.15, sho: 0.15, pas: 0.35, dri: 0.35 } },
  { code: 'CM', weights: { pas: 0.4, dri: 0.2, def: 0.2, phy: 0.2 } },
  { code: 'CDM', weights: { pas: 0.25, dri: 0.1, def: 0.4, phy: 0.25 } },
  { code: 'CB', weights: { pac: 0.15, def: 0.5, phy: 0.35 } },
  { code: 'FB', weights: { pac: 0.35, pas: 0.15, dri: 0.15, def: 0.35 } },
]

/**
 * Position is whichever archetype's weighted stat profile the card best matches —
 * fast+dribbly reads as a winger, defensive+physical reads as a center-back, etc.
 * A very low overall rating skips the archetype match entirely and reads as GK,
 * since none of our six stats represent goalkeeping ability anyway.
 */
function derivePosition(stats: SixStats & { ovr: number }): string {
  if (stats.ovr < GOALKEEPER_OVR_CEILING) return 'GK'

  let bestCode = POSITION_ARCHETYPES[0].code
  let bestScore = -Infinity
  for (const archetype of POSITION_ARCHETYPES) {
    let score = 0
    for (const key of Object.keys(archetype.weights) as StatKey[]) {
      score += (archetype.weights[key] ?? 0) * stats[key]
    }
    if (score > bestScore) {
      bestScore = score
      bestCode = archetype.code
    }
  }
  return bestCode
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
  const position = derivePosition({ pac, sho, pas, dri, def, phy, ovr })

  return { pac, sho, pas, dri, def, phy, ovr, position, language: topLanguage(data.repos) }
}
