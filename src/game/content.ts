import type { CrewDef, PlayerCardDef, WaveDef } from './types'

/** Tunables — adjust freely for balance */
export const TUNING = {
  handSize: 5,
  possessionsPerWave: 8,
  maxCrew: 3,
  maxPlayCards: 3,
  hypePerPoint: 4,
  tagBonus: 1,
  redrawCardsMax: 2,
}

export const PLAYER_CARDS: PlayerCardDef[] = [
  { id: 'nez', name: 'Nez', tags: ['Slash'], starter: true },
  { id: 'kito', name: 'Kito', tags: ['Splash'], starter: true },
  { id: 'deo', name: 'Deo', tags: ['Dish'], starter: true },
  { id: 'brick', name: 'Brick', tags: ['Screen'], starter: true },
  { id: 'moose', name: 'Moose', tags: ['Rim'], starter: true },
  { id: 'jax', name: 'Jax', tags: ['Slash', 'Dish'], starter: true },
  { id: 'ven', name: 'Ven', tags: ['Splash', 'Slash'], starter: true },
  { id: 'tally', name: 'Tally', tags: ['Screen', 'Rim'], starter: true },
  { id: 'rio', name: 'Rio', tags: ['Splash', 'Dish'] },
  { id: 'haze', name: 'Haze', tags: ['Slash', 'Screen'] },
  { id: 'loom', name: 'Loom', tags: ['Rim', 'Dish'] },
  { id: 'pix', name: 'Pix', tags: ['Splash', 'Screen'] },
]

export const CREW: CrewDef[] = [
  {
    id: 'radio',
    name: 'Radio Guy',
    text: 'Splash plays earn +2 Hype',
    effect: 'splashHype',
  },
  {
    id: 'hinge',
    name: 'Hinge Bro',
    text: 'Once/wave: Screen play refunds the screener',
    effect: 'screenRefund',
  },
  {
    id: 'spark',
    name: 'Spark Plug',
    text: 'Spent Hype is worth +6 each (instead of +4)',
    effect: 'hypeEfficient',
  },
  {
    id: 'bypass',
    name: 'Bypass',
    text: 'Once/wave: ignore the rival tax',
    effect: 'ignoreTax',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    text: 'Motion plays get +0.5 mult',
    effect: 'motionMult',
  },
  {
    id: 'emcee',
    name: 'Emcee',
    text: 'Dish plays earn +2 Hype',
    effect: 'dishHype',
  },
  {
    id: 'corner',
    name: 'Corner Cop',
    text: 'Kick-Out +5 score before mult',
    effect: 'kickOutBonus',
  },
  {
    id: 'paint',
    name: 'Paint Dog',
    text: 'Rim tags give +2 bonus each',
    effect: 'rimPower',
  },
]

export const WAVES: WaveDef[] = [
  {
    id: 'corner-park',
    name: 'Corner Park',
    target: 25,
    court: 'Splash plays earn +2 Hype',
    rival: 'Iso scores half',
    courtId: 'splashHype',
    rivalId: 'isoHalf',
  },
  {
    id: 'night-lights',
    name: 'Night Lights',
    target: 80,
    court: 'Repeating the same play type scores half',
    rival: 'Splash is muted unless Screen is in the play',
    courtId: 'noRepeat',
    rivalId: 'muteSplash',
  },
  {
    id: 'king-court',
    name: 'King Court',
    target: 200,
    court: 'Iso scores 0',
    rival: 'Dish earns 0 Hype (unless Bypass)',
    courtId: 'noIso',
    rivalId: 'muteDishHype',
  },
]

export function getPlayer(defId: string): PlayerCardDef {
  const card = PLAYER_CARDS.find((c) => c.id === defId)
  if (!card) throw new Error(`Unknown player ${defId}`)
  return card
}

export function getCrew(defId: string): CrewDef {
  const crew = CREW.find((c) => c.id === defId)
  if (!crew) throw new Error(`Unknown crew ${defId}`)
  return crew
}
