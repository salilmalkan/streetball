import {
  CREW,
  PLAYER_CARDS,
  TUNING,
  WAVES,
  getCrew,
  getPlayer,
} from './content'
import { previewPlay } from './plays'
import type { CardInstance, DraftOption, RunState } from './types'

let uidCounter = 0

function uid(): string {
  uidCounter += 1
  return `c${uidCounter}`
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCard(defId: string): CardInstance {
  return { uid: uid(), defId }
}

function drawToHand(state: RunState): void {
  while (state.hand.length < TUNING.handSize) {
    if (state.deck.length === 0) {
      if (state.discard.length === 0) break
      state.deck = shuffle(state.discard)
      state.discard = []
    }
    const card = state.deck.shift()
    if (!card) break
    state.hand.push(card)
  }
}

function currentWave(state: RunState) {
  return WAVES[state.waveIndex]
}

function crewHas(state: RunState, effect: string): boolean {
  return state.crewIds.some((id) => getCrew(id).effect === effect)
}

export function createRun(): RunState {
  uidCounter = 0
  const starters = PLAYER_CARDS.filter((c) => c.starter).map((c) =>
    makeCard(c.id),
  )
  const state: RunState = {
    phase: 'play',
    waveIndex: 0,
    score: 0,
    hype: 0,
    possessionsLeft: TUNING.possessionsPerWave,
    deck: shuffle(starters),
    hand: [],
    discard: [],
    selectedUids: [],
    hypeToSpend: 0,
    redrawsLeft: 1,
    crewIds: [],
    lastPlayId: null,
    ignoreTaxAvailable: false,
    screenRefundAvailable: false,
    draftOptions: [],
    flashScore: null,
    message: 'Clear the court target. Build Hype. Draft between waves.',
    totalScore: 0,
  }
  refreshWaveFlags(state)
  drawToHand(state)
  return state
}

function refreshWaveFlags(state: RunState): void {
  state.ignoreTaxAvailable = crewHas(state, 'ignoreTax')
  state.screenRefundAvailable = crewHas(state, 'screenRefund')
  state.lastPlayId = null
  state.possessionsLeft = TUNING.possessionsPerWave
  state.score = 0
  state.hype = 0
  state.hypeToSpend = 0
  state.redrawsLeft = 1
  state.selectedUids = []
  state.flashScore = null
}

export function toggleSelect(state: RunState, cardUid: string): RunState {
  if (state.phase !== 'play') return state
  const next = { ...state, selectedUids: [...state.selectedUids] }
  const idx = next.selectedUids.indexOf(cardUid)
  if (idx >= 0) {
    next.selectedUids.splice(idx, 1)
  } else if (next.selectedUids.length < TUNING.maxPlayCards) {
    next.selectedUids.push(cardUid)
  }
  return next
}

export function setHypeSpend(state: RunState, amount: number): RunState {
  return {
    ...state,
    hypeToSpend: Math.max(0, Math.min(amount, state.hype)),
  }
}

export function selectedCards(state: RunState): CardInstance[] {
  return state.selectedUids
    .map((id) => state.hand.find((c) => c.uid === id))
    .filter((c): c is CardInstance => Boolean(c))
}

export function getPreview(state: RunState, useIgnoreTax: boolean) {
  const wave = currentWave(state)
  return previewPlay(
    state,
    wave,
    selectedCards(state),
    state.hypeToSpend,
    useIgnoreTax,
  )
}

export function commitPlay(
  state: RunState,
  useIgnoreTax: boolean,
): RunState {
  if (state.phase !== 'play') return state
  const preview = getPreview(state, useIgnoreTax)
  if (!preview || state.possessionsLeft <= 0) return state

  const next: RunState = {
    ...state,
    hand: [...state.hand],
    discard: [...state.discard],
    deck: [...state.deck],
    selectedUids: [],
    message: '',
  }

  const selected = selectedCards(state)
  const selectedSet = new Set(selected.map((c) => c.uid))

  // Screen refund (once per wave)
  let refund: CardInstance | null = null
  if (
    next.screenRefundAvailable &&
    crewHas(next, 'screenRefund') &&
    selected.some((c) => getPlayer(c.defId).tags.includes('Screen'))
  ) {
    refund =
      selected.find((c) => getPlayer(c.defId).tags.includes('Screen')) ?? null
    if (refund) {
      next.screenRefundAvailable = false
      next.message = `Hinge Bro: ${getPlayer(refund.defId).name} stays in hand.`
    }
  }

  next.hand = next.hand.filter((c) => !selectedSet.has(c.uid))
  for (const card of selected) {
    if (refund && card.uid === refund.uid) {
      next.hand.push(card)
    } else {
      next.discard.push(card)
    }
  }

  if (useIgnoreTax && next.ignoreTaxAvailable && crewHas(next, 'ignoreTax')) {
    next.ignoreTaxAvailable = false
  }

  next.score += preview.score
  next.totalScore += preview.score
  next.hype = next.hype - preview.hypeSpent + preview.hypeEarned
  next.hypeToSpend = 0
  next.possessionsLeft -= 1
  next.lastPlayId = preview.playId
  next.flashScore = preview.score

  drawToHand(next)

  const wave = currentWave(next)
  if (next.score >= wave.target) {
    return clearWave(next)
  }
  if (next.possessionsLeft <= 0) {
    return {
      ...next,
      phase: 'lost',
      message: `Busted at ${wave.name}. ${next.score}/${wave.target}.`,
    }
  }

  if (!next.message) {
    next.message = `${preview.playName} for ${preview.score}.`
  }
  return next
}

function clearWave(state: RunState): RunState {
  if (state.waveIndex >= WAVES.length - 1) {
    return {
      ...state,
      phase: 'won',
      message: `King Court cleared. Run score ${state.totalScore}.`,
      draftOptions: [],
    }
  }
  return {
    ...state,
    phase: 'draft',
    message: `${currentWave(state).name} cleared! Draft one upgrade.`,
    draftOptions: makeDraftOptions(state),
    selectedUids: [],
    hypeToSpend: 0,
  }
}

function makeDraftOptions(state: RunState): DraftOption[] {
  const ownedPlayers = new Set(
    [...state.deck, ...state.hand, ...state.discard].map((c) => c.defId),
  )
  const playerPool = shuffle(
    PLAYER_CARDS.filter((c) => !ownedPlayers.has(c.id)).map((c) => c.id),
  )
  const crewPool = shuffle(
    CREW.filter((c) => !state.crewIds.includes(c.id)).map((c) => c.id),
  )

  const options: DraftOption[] = []
  if (playerPool[0]) options.push({ kind: 'player', defId: playerPool[0] })
  if (crewPool[0]) options.push({ kind: 'crew', defId: crewPool[0] })
  if (playerPool[1]) options.push({ kind: 'player', defId: playerPool[1] })
  else if (crewPool[1]) options.push({ kind: 'crew', defId: crewPool[1] })

  while (options.length < 3) {
    if (crewPool[options.length]) {
      options.push({ kind: 'crew', defId: crewPool[options.length] })
    } else if (playerPool[options.length]) {
      options.push({ kind: 'player', defId: playerPool[options.length] })
    } else break
  }
  return shuffle(options).slice(0, 3)
}

export function pickDraft(
  state: RunState,
  optionIndex: number,
  replaceCrewId?: string,
): RunState {
  if (state.phase !== 'draft') return state
  const option = state.draftOptions[optionIndex]
  if (!option) return state

  const next: RunState = {
    ...state,
    deck: [...state.deck],
    hand: [...state.hand],
    discard: [...state.discard],
    crewIds: [...state.crewIds],
  }

  if (option.kind === 'player') {
    next.discard.push(makeCard(option.defId))
    next.message = `Added ${getPlayer(option.defId).name} to your rotation.`
  } else {
    if (next.crewIds.includes(option.defId)) {
      next.message = 'Already have that crew piece.'
      return advanceAfterDraft(next)
    }
    if (next.crewIds.length >= TUNING.maxCrew) {
      if (!replaceCrewId || !next.crewIds.includes(replaceCrewId)) {
        return {
          ...state,
          message: 'Crew full (3). Tap a crew badge to replace, then draft again.',
        }
      }
      next.crewIds = next.crewIds.filter((id) => id !== replaceCrewId)
    }
    next.crewIds.push(option.defId)
    next.message = `Crewed up: ${getCrew(option.defId).name}.`
  }

  return advanceAfterDraft(next)
}

export function skipDraft(state: RunState): RunState {
  if (state.phase !== 'draft') return state
  return advanceAfterDraft({
    ...state,
    message: 'Skipped draft.',
  })
}

function advanceAfterDraft(state: RunState): RunState {
  const next: RunState = {
    ...state,
    phase: 'play',
    waveIndex: state.waveIndex + 1,
    draftOptions: [],
  }
  // Recycle hand into deck for fresh wave feel
  next.deck = shuffle([...next.deck, ...next.hand, ...next.discard])
  next.hand = []
  next.discard = []
  refreshWaveFlags(next)
  drawToHand(next)
  const wave = currentWave(next)
  next.message = `${wave.name} — target ${wave.target}.`
  return next
}

export function doRedraw(state: RunState): RunState {
  if (state.phase !== 'play' || state.redrawsLeft <= 0) return state
  if (state.selectedUids.length < 1 || state.selectedUids.length > TUNING.redrawCardsMax) {
    return {
      ...state,
      message: 'Select 1–2 cards to redraw.',
    }
  }

  const next: RunState = {
    ...state,
    hand: [...state.hand],
    discard: [...state.discard],
    deck: [...state.deck],
    selectedUids: [],
    redrawsLeft: state.redrawsLeft - 1,
  }

  const selected = selectedCards(state)
  const selectedSet = new Set(selected.map((c) => c.uid))
  next.hand = next.hand.filter((c) => !selectedSet.has(c.uid))
  next.discard.push(...selected)
  drawToHand(next)
  next.message = `Redrawn ${selected.length}.`
  return next
}

export function clearFlash(state: RunState): RunState {
  return { ...state, flashScore: null }
}

export function waveInfo(state: RunState) {
  return WAVES[state.waveIndex]
}
