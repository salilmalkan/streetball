import './style.css'
import { getCrew, getPlayer, TUNING } from './game/content'
import {
  clearFlash,
  commitPlay,
  createRun,
  doRedraw,
  getPreview,
  pickDraft,
  setHypeSpend,
  skipDraft,
  toggleSelect,
  waveInfo,
} from './game/state'
import type { RunState, Tag } from './game/types'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('#app missing')
const app = root

let state: RunState = createRun()
let useBypass = false
let replaceCrewId: string | undefined

const TAG_CLASS: Record<Tag, string> = {
  Slash: 'tag-slash',
  Splash: 'tag-splash',
  Dish: 'tag-dish',
  Screen: 'tag-screen',
  Rim: 'tag-rim',
}

function render(): void {
  const wave = waveInfo(state)
  const preview = getPreview(state, useBypass)
  const hasBypass =
    state.crewIds.some((id) => getCrew(id).effect === 'ignoreTax') &&
    state.ignoreTaxAvailable

  const rotateGate = `
    <div class="rotate-gate" aria-live="polite">
      <div>
        <div class="rotate-icon" aria-hidden="true"></div>
        <strong>Turn your phone</strong>
        <span>Streetball plays in landscape.</span>
      </div>
    </div>
  `

  if (state.phase === 'won' || state.phase === 'lost') {
    app.innerHTML = `
      ${rotateGate}
      <div class="shell end-shell">
        <h1>${state.phase === 'won' ? 'Run Cleared' : 'Run Over'}</h1>
        <p class="lede">${escapeHtml(state.message)}</p>
        <p class="big-stat">Total ${state.totalScore}</p>
        <button class="btn primary" data-action="new-run">New Run</button>
      </div>
    `
    bind()
    return
  }

  if (state.phase === 'draft') {
    const crewFull = state.crewIds.length >= TUNING.maxCrew
    app.innerHTML = `
      ${rotateGate}
      <div class="shell draft-shell">
        <header class="top">
          <div class="brand">Streetball</div>
          <div class="wave-name">Draft</div>
        </header>
        <div class="left-col" style="grid-column:1/-1">
          <p class="lede">${escapeHtml(state.message)}</p>
          ${
            crewFull
              ? `<p class="hint">Crew full. Tap a crew chip to mark replacement, then pick a crew draft.</p>
                 <div class="crew-row">${renderCrew(true)}</div>`
              : `<div class="crew-row">${renderCrew(false)}</div>`
          }
          <div class="draft-list">
            ${state.draftOptions
              .map((opt, i) => {
                if (opt.kind === 'player') {
                  const p = getPlayer(opt.defId)
                  return `<button class="draft-card" data-draft="${i}">
                    <span class="draft-kind">Player</span>
                    <strong>${escapeHtml(p.name)}</strong>
                    <span class="tags">${p.tags.map(tagChip).join('')}</span>
                  </button>`
                }
                const c = getCrew(opt.defId)
                return `<button class="draft-card" data-draft="${i}">
                  <span class="draft-kind">Crew</span>
                  <strong>${escapeHtml(c.name)}</strong>
                  <span class="draft-text">${escapeHtml(c.text)}</span>
                </button>`
              })
              .join('')}
          </div>
        </div>
        <div class="draft-actions">
          <button class="btn ghost" data-action="skip-draft">Skip</button>
        </div>
      </div>
    `
    bind()
    return
  }

  app.innerHTML = `
    ${rotateGate}
    <div class="shell ${state.flashScore !== null ? 'flash' : ''}">
      <header class="top">
        <div class="brand">Streetball</div>
        <div class="wave-name">${escapeHtml(wave.name)} · W${state.waveIndex + 1}/3</div>
      </header>

      <aside class="left-col">
        <section class="status">
          <div class="stat">
            <span class="label">Score</span>
            <span class="value ${state.flashScore !== null ? 'bump' : ''}">${state.score}<small>/${wave.target}</small></span>
          </div>
          <div class="stat">
            <span class="label">Poss.</span>
            <span class="value">${state.possessionsLeft}</span>
          </div>
          <div class="stat">
            <span class="label">Hype</span>
            <span class="value hype">${state.hype}</span>
          </div>
        </section>
        <div class="meter"><div class="meter-fill" style="width:${Math.min(100, (state.score / wave.target) * 100)}%"></div></div>
        <section class="rules">
          <div><span class="pill">Court</span> ${escapeHtml(wave.court)}</div>
          <div><span class="pill rival">Rival</span> ${escapeHtml(wave.rival)}</div>
        </section>
        <div class="crew-row">${renderCrew(false)}</div>
      </aside>

      <section class="center-col">
        <p class="message">${escapeHtml(state.message)}</p>
        <div class="hand" aria-label="Hand">
          ${state.hand
            .map((card) => {
              const def = getPlayer(card.defId)
              const selected = state.selectedUids.includes(card.uid)
              return `<button class="card ${selected ? 'selected' : ''}" data-card="${card.uid}">
                <span class="card-name">${escapeHtml(def.name)}</span>
                <span class="tags">${def.tags.map(tagChip).join('')}</span>
              </button>`
            })
            .join('')}
        </div>
      </section>

      <aside class="right-col">
        <section class="preview">
          ${
            preview
              ? `<div class="preview-title">${escapeHtml(preview.playName)} → <strong>${preview.score}</strong></div>
                 <div class="preview-sub">base ${preview.base} + tags ${preview.tagBonuses} + hype ${preview.spentHypeBonus}${preview.crewFlat ? ` + crew ${preview.crewFlat}` : ''}${preview.crewMult ? ` ×${(1 + preview.crewMult).toFixed(1)}` : ''} · Hype ${preview.hypeSpent > 0 ? `-${preview.hypeSpent}` : ''}${preview.hypeEarned ? ` +${preview.hypeEarned}` : ''}</div>
                 ${preview.notes.length ? `<div class="preview-notes">${preview.notes.map(escapeHtml).join(' · ')}</div>` : ''}`
              : `<div class="preview-title">Select 1–3 cards</div>
                 <div class="preview-sub">Named plays score more. Spend Hype to spike.</div>`
          }
        </section>
        <div class="action-bar">
          <div class="hype-spend">
            <button class="btn icon" data-action="hype-dec" aria-label="Less hype">−</button>
            <span>Hype ${state.hypeToSpend}</span>
            <button class="btn icon" data-action="hype-inc" aria-label="More hype">+</button>
          </div>
          ${
            hasBypass
              ? `<label class="bypass"><input type="checkbox" data-action="bypass" ${useBypass ? 'checked' : ''}/> Bypass</label>`
              : ''
          }
          <button class="btn" data-action="redraw" ${state.redrawsLeft ? '' : 'disabled'}>Redraw (${state.redrawsLeft})</button>
          <button class="btn primary" data-action="commit" ${preview ? '' : 'disabled'}>Commit</button>
        </div>
      </aside>
    </div>
  `

  bind()

  if (state.flashScore !== null) {
    window.setTimeout(() => {
      state = clearFlash(state)
      render()
    }, 450)
  }
}

function renderCrew(selectable: boolean): string {
  if (state.crewIds.length === 0) {
    return `<span class="muted">No crew pieces yet</span>`
  }
  return state.crewIds
    .map((id) => {
      const c = getCrew(id)
      const marked = replaceCrewId === id
      if (selectable) {
        return `<button class="crew-chip ${marked ? 'marked' : ''}" data-replace-crew="${id}" title="${escapeHtml(c.text)}">${escapeHtml(c.name)}</button>`
      }
      return `<span class="crew-chip" title="${escapeHtml(c.text)}">${escapeHtml(c.name)}</span>`
    })
    .join('')
}

function tagChip(tag: Tag): string {
  return `<span class="tag ${TAG_CLASS[tag]}">${tag}</span>`
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function bind(): void {
  app.querySelectorAll<HTMLElement>('[data-card]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.card
      if (!id) return
      state = toggleSelect(state, id)
      render()
    })
  })

  app.querySelectorAll<HTMLElement>('[data-action]').forEach((el) => {
    el.addEventListener('click', () => {
      const action = el.dataset.action
      if (action === 'commit') {
        state = commitPlay(state, useBypass)
        useBypass = false
        render()
      } else if (action === 'redraw') {
        state = doRedraw(state)
        render()
      } else if (action === 'hype-inc') {
        state = setHypeSpend(state, state.hypeToSpend + 1)
        render()
      } else if (action === 'hype-dec') {
        state = setHypeSpend(state, state.hypeToSpend - 1)
        render()
      } else if (action === 'new-run') {
        state = createRun()
        useBypass = false
        replaceCrewId = undefined
        render()
      } else if (action === 'skip-draft') {
        state = skipDraft(state)
        replaceCrewId = undefined
        render()
      }
    })
  })

  const bypass = app.querySelector<HTMLInputElement>('[data-action="bypass"]')
  bypass?.addEventListener('change', () => {
    useBypass = Boolean(bypass.checked)
    render()
  })

  app.querySelectorAll<HTMLElement>('[data-draft]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = Number(el.dataset.draft)
      const before = state
      state = pickDraft(state, idx, replaceCrewId)
      if (state.phase === 'draft' && state === before) {
        // message-only update path returns new object usually
      }
      if (state.phase !== 'draft') replaceCrewId = undefined
      render()
    })
  })

  app.querySelectorAll<HTMLElement>('[data-replace-crew]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.replaceCrew
      replaceCrewId = replaceCrewId === id ? undefined : id
      render()
    })
  })
}

render()
window.addEventListener('orientationchange', () => {
  window.setTimeout(render, 50)
})
