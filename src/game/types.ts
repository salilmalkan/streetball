export type Tag = 'Slash' | 'Splash' | 'Dish' | 'Screen' | 'Rim'

export type PlayId =
  | 'iso'
  | 'twoMan'
  | 'kickOut'
  | 'lob'
  | 'motion'
  | 'fastBreak'
  | 'postUp'
  | 'waste'

export type CrewEffectId =
  | 'splashHype'
  | 'screenRefund'
  | 'hypeEfficient'
  | 'ignoreTax'
  | 'motionMult'
  | 'dishHype'
  | 'kickOutBonus'
  | 'rimPower'

export interface PlayerCardDef {
  id: string
  name: string
  tags: Tag[]
  starter?: boolean
}

export interface CrewDef {
  id: string
  name: string
  text: string
  effect: CrewEffectId
}

export interface WaveDef {
  id: string
  name: string
  target: number
  court: string
  rival: string
  courtId: 'splashHype' | 'noRepeat' | 'noIso'
  rivalId: 'isoHalf' | 'muteSplash' | 'muteDishHype'
}

export interface CardInstance {
  uid: string
  defId: string
}

export type Phase = 'play' | 'draft' | 'won' | 'lost'

export interface RunState {
  phase: Phase
  waveIndex: number
  score: number
  hype: number
  possessionsLeft: number
  deck: CardInstance[]
  hand: CardInstance[]
  discard: CardInstance[]
  selectedUids: string[]
  hypeToSpend: number
  redrawsLeft: number
  crewIds: string[]
  lastPlayId: PlayId | null
  ignoreTaxAvailable: boolean
  screenRefundAvailable: boolean
  draftOptions: DraftOption[]
  flashScore: number | null
  message: string
  totalScore: number
}

export type DraftOption =
  | { kind: 'player'; defId: string }
  | { kind: 'crew'; defId: string }
