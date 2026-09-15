import { getCrew, getPlayer, TUNING } from './content'
import type {
  CardInstance,
  CrewEffectId,
  PlayId,
  RunState,
  Tag,
  WaveDef,
} from './types'

export interface PlayResult {
  playId: PlayId
  playName: string
  base: number
  tagBonuses: number
  spentHypeBonus: number
  crewFlat: number
  crewMult: number
  score: number
  hypeEarned: number
  hypeSpent: number
  notes: string[]
}

const PLAY_NAMES: Record<PlayId, string> = {
  iso: 'Iso',
  twoMan: 'Two-Man',
  kickOut: 'Kick-Out',
  lob: 'Lob',
  motion: 'Motion',
  fastBreak: 'Fast Break',
  postUp: 'Post-Up',
  waste: 'Waste',
}

const PLAY_BASE: Record<PlayId, number> = {
  iso: 4,
  twoMan: 10,
  kickOut: 12,
  lob: 14,
  motion: 16,
  fastBreak: 11,
  postUp: 11,
  waste: 2,
}

function hasTag(tagLists: Tag[][], tag: Tag): boolean {
  return tagLists.some((t) => t.includes(tag))
}

function sharedTag(tagLists: Tag[][]): boolean {
  if (tagLists.length !== 3) return false
  const tags: Tag[] = ['Slash', 'Splash', 'Dish', 'Screen', 'Rim']
  return tags.some((tag) => tagLists.every((list) => list.includes(tag)))
}

export function detectPlay(tagLists: Tag[][]): PlayId {
  const n = tagLists.length
  const candidates: { id: PlayId; base: number }[] = []

  if (n === 3 && sharedTag(tagLists)) {
    candidates.push({ id: 'motion', base: PLAY_BASE.motion })
  }
  if (n === 2 && hasTag(tagLists, 'Dish') && hasTag(tagLists, 'Rim')) {
    candidates.push({ id: 'lob', base: PLAY_BASE.lob })
  }
  if (n === 2 && hasTag(tagLists, 'Slash') && hasTag(tagLists, 'Splash')) {
    candidates.push({ id: 'kickOut', base: PLAY_BASE.kickOut })
  }
  if (n === 2 && hasTag(tagLists, 'Slash') && hasTag(tagLists, 'Dish')) {
    candidates.push({ id: 'fastBreak', base: PLAY_BASE.fastBreak })
  }
  if (n === 2 && hasTag(tagLists, 'Rim') && hasTag(tagLists, 'Screen')) {
    candidates.push({ id: 'postUp', base: PLAY_BASE.postUp })
  }
  if (
    n === 2 &&
    hasTag(tagLists, 'Screen') &&
    (hasTag(tagLists, 'Slash') ||
      hasTag(tagLists, 'Splash') ||
      hasTag(tagLists, 'Rim'))
  ) {
    candidates.push({ id: 'twoMan', base: PLAY_BASE.twoMan })
  }
  if (n === 1) {
    candidates.push({ id: 'iso', base: PLAY_BASE.iso })
  }

  if (candidates.length === 0) return 'waste'
  candidates.sort((a, b) => b.base - a.base)
  return candidates[0].id
}

function crewHas(state: RunState, effect: CrewEffectId): boolean {
  return state.crewIds.some((id) => getCrew(id).effect === effect)
}

function applyMuteSplash(tagLists: Tag[][], muted: boolean): Tag[][] {
  if (!muted) return tagLists
  const hasScreen = hasTag(tagLists, 'Screen')
  if (hasScreen) return tagLists
  return tagLists.map((tags) => tags.filter((t) => t !== 'Splash'))
}

export function previewPlay(
  state: RunState,
  wave: WaveDef,
  selected: CardInstance[],
  hypeToSpend: number,
  useIgnoreTax: boolean,
): PlayResult | null {
  if (selected.length < 1 || selected.length > TUNING.maxPlayCards) return null

  const rawTagLists = selected.map((c) => getPlayer(c.defId).tags)
  const ignoreTax =
    useIgnoreTax && crewHas(state, 'ignoreTax') && state.ignoreTaxAvailable
  const muteSplash = wave.rivalId === 'muteSplash' && !ignoreTax
  const tagLists = applyMuteSplash(rawTagLists, muteSplash)
  const playId = detectPlay(tagLists)
  const notes: string[] = []

  let base = PLAY_BASE[playId]
  let tagBonuses = 0
  for (const tags of tagLists) {
    for (const tag of tags) {
      tagBonuses += tag === 'Rim' && crewHas(state, 'rimPower') ? 2 : TUNING.tagBonus
    }
  }

  const hypeRate = crewHas(state, 'hypeEfficient') ? 6 : TUNING.hypePerPoint
  const hypeSpent = Math.min(Math.max(0, hypeToSpend), state.hype)
  const spentHypeBonus = hypeSpent * hypeRate

  let crewFlat = 0
  let crewMult = 0

  if (playId === 'kickOut' && crewHas(state, 'kickOutBonus')) {
    crewFlat += 5
    notes.push('Corner Cop +5')
  }
  if (playId === 'motion' && crewHas(state, 'motionMult')) {
    crewMult += 0.5
    notes.push('Orbit +0.5×')
  }

  if (wave.courtId === 'noIso' && playId === 'iso') {
    base = 0
    notes.push('Court: Iso = 0')
  }
  if (wave.rivalId === 'isoHalf' && playId === 'iso' && !ignoreTax) {
    base = Math.floor(base / 2)
    tagBonuses = Math.floor(tagBonuses / 2)
    notes.push('Rival: Iso half')
  }

  const repeating =
    wave.courtId === 'noRepeat' &&
    state.lastPlayId !== null &&
    state.lastPlayId === playId
  if (repeating) notes.push('Court: repeat half')

  let preMult = base + tagBonuses + spentHypeBonus + crewFlat
  if (repeating) preMult = Math.floor(preMult / 2)

  const score = Math.max(0, Math.floor(preMult * (1 + crewMult)))

  let hypeEarned = playId === 'waste' ? 0 : 1
  if (
    wave.courtId === 'splashHype' &&
    hasTag(tagLists, 'Splash')
  ) {
    hypeEarned += 2
    notes.push('Court +2 Hype')
  }
  if (crewHas(state, 'splashHype') && hasTag(tagLists, 'Splash')) {
    hypeEarned += 2
    notes.push('Radio +2 Hype')
  }

  const dishHypeBlocked = wave.rivalId === 'muteDishHype' && !ignoreTax
  if (crewHas(state, 'dishHype') && hasTag(rawTagLists, 'Dish')) {
    if (dishHypeBlocked) {
      notes.push('Rival: Dish Hype muted')
    } else {
      hypeEarned += 2
      notes.push('Emcee +2 Hype')
    }
  }

  if (muteSplash && hasTag(rawTagLists, 'Splash') && !hasTag(rawTagLists, 'Screen')) {
    notes.push('Rival: Splash muted')
  }
  if (ignoreTax) notes.push('Bypass on')

  return {
    playId,
    playName: PLAY_NAMES[playId],
    base,
    tagBonuses,
    spentHypeBonus,
    crewFlat,
    crewMult,
    score,
    hypeEarned,
    hypeSpent,
    notes,
  }
}

export function playLabel(playId: PlayId): string {
  return PLAY_NAMES[playId]
}
