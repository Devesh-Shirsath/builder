import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { actions, useStore } from './store'
import type { Doc } from './types'
import { paletteTokens } from './theme/palette'
import { DEFAULT_FONT, fontStack, useFonts } from './theme/fonts'
import { Canvas } from './canvas/Canvas'
import { LeftPanel } from './panels/LeftPanel'
import { AddSection } from './panels/AddSection'
import { PortalShell } from './portal/PortalShell'
import { StartScreen } from './panels/StartScreen'
import type { BuilderVersion } from './store'
import { Icon } from './ui/Icon'
import { Ph_ } from './ui/Phosphor'
import { useDismiss } from './ui/useDismiss'

const DEVICES = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'mobile', label: 'Mobile' },
] as const

/** Exit, import, export and reset — used rarely, so they live behind one button. */
function MoreMenu({ onToast }: { onToast: (msg: string) => void }) {
  const doc = useStore((s) => s.doc)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, ref, close)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'portal.json'
    a.click()
    URL.revokeObjectURL(a.href)
    onToast('Exported portal.json')
  }

  const importJson = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const next = JSON.parse(String(reader.result)) as Doc
        if (!next.theme || !next.nav || !next.pages || !Array.isArray(next.pageOrder)) {
          throw new Error('bad shape')
        }
        actions.replaceDoc(next)
        onToast('Imported')
      } catch {
        onToast("That file doesn't look like a saved portal")
      }
    }
    reader.readAsText(file)
  }

  const item = (icon: string, label: string, run: () => void, danger = false) => (
    <button
      className={`menu-item ${danger ? 'danger' : ''}`}
      onClick={() => {
        setOpen(false)
        run()
      }}
    >
      <Ph_ name={icon} size={16} />
      {label}
    </button>
  )

  return (
    <div className="menu-wrap" ref={ref}>
      <button className={`btn-ui icon ${open ? 'active' : ''}`} title="More" onClick={() => setOpen((v) => !v)}>
        <Ph_ name="DotsThree" size={18} weight="bold" />
      </button>
      {open && (
        <div className="menu">
          {item('SignOut', 'Exit builder', () => actions.openPortal())}
          <span className="menu-sep" />
          {item('UploadSimple', 'Import JSON', () => fileRef.current?.click())}
          {item('DownloadSimple', 'Export JSON', exportJson)}
          <span className="menu-sep" />
          {item('Trash', 'Reset every page', () => {
            if (confirm('Reset every page back to the starter content?')) {
              actions.resetAll()
              onToast('Reset')
            }
          }, true)}
        </div>
      )}
      <input ref={fileRef} type="file" accept="application/json" hidden
        onChange={(e) => { importJson(e.target.files?.[0] ?? undefined); e.target.value = '' }} />
    </div>
  )
}

const VERSIONS: { id: BuilderVersion; name: string; tagline: string; desc: string }[] = [
  {
    id: 'v1',
    name: 'Version 1',
    tagline: 'Section catalogue',
    desc: 'Every page starts filled in. Sections are added from a modal library.',
  },
  {
    id: 'v2',
    name: 'Version 2',
    tagline: 'Onboarding & templates',
    desc: 'Start from a template or a blank canvas, then drag sections in from the side library.',
  },
]

/** Switches between the two iterations. Each keeps its own saved document. */
function VersionMenu() {
  const version = useStore((s) => s.version)
  const started = useStore((s) => s.started)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, ref, close)

  return (
    <div className="menu-wrap" ref={ref}>
      <button
        className={`version-btn ${open ? 'on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title="Builder iteration"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {version.toUpperCase()}
        <Ph_ name="CaretDown" size={11} />
      </button>
      {open && (
        <div className="menu version-menu" role="menu">
          <div className="menu-label">Iteration</div>
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              className={`version-item ${version === v.id ? 'on' : ''}`}
              onClick={() => {
                setOpen(false)
                actions.setVersion(v.id)
              }}
            >
              <span className="version-item-head">
                {v.name}
                <span className="version-tag">{v.tagline}</span>
                {version === v.id && <Ph_ name="Check" size={14} className="version-check" />}
              </span>
              <span className="version-item-desc">{v.desc}</span>
            </button>
          ))}
          {version === 'v2' && started && (
            <>
              <span className="menu-sep" />
              <button
                className="menu-item"
                onClick={() => {
                  setOpen(false)
                  actions.restart()
                }}
              >
                <Ph_ name="ArrowCounterClockwise" size={16} /> Back to the start screen
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function BuilderBar({ onToast }: { onToast: (msg: string) => void }) {
  const device = useStore((s) => s.device)
  const preview = useStore((s) => s.preview)
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)
  const navOpen = useStore((s) => s.navOpen)

  return (
    <header className="topbar">
      <div className="topbar-side">
        {/* The portal's top bar is hidden in here, so this is the only way back
            to the navigation. */}
        <button className="btn-ui icon" onClick={() => actions.toggleNav()} title={navOpen ? 'Hide navigation' : 'Show navigation'}>
          <Ph_ name="SidebarSimple" size={20} />
        </button>
        <span className="topbar-title">Builder</span>
        <VersionMenu />
        <span className="divider-v" />
        <button className="btn-ui icon" title="Undo (⌘Z)" disabled={!canUndo} onClick={() => actions.undo()}>
          <Ph_ name="ArrowUUpLeft" size={16} />
        </button>
        <button className="btn-ui icon" title="Redo (⇧⌘Z)" disabled={!canRedo} onClick={() => actions.redo()}>
          <Ph_ name="ArrowUUpRight" size={16} />
        </button>
      </div>

      <div className="seg" role="group" aria-label="Device">
        {DEVICES.map((d) => (
          <button key={d.id} className={device === d.id ? 'on' : ''} onClick={() => actions.setDevice(d.id)}>
            {d.label}
          </button>
        ))}
      </div>

      <div className="topbar-side end">
        <MoreMenu onToast={onToast} />
        <div className="mode-switch" role="group" aria-label="Customise mode">
          <button
            className={!preview ? 'on' : ''}
            aria-pressed={!preview}
            onClick={() => actions.setPreview(false)}
          >
            <Ph_ name="NotePencil" size={16} />
            Edit
          </button>
          <button
            className={preview ? 'on' : ''}
            aria-pressed={preview}
            onClick={() => actions.setPreview(true)}
          >
            <Ph_ name="Eye" size={17} />
            Preview
          </button>
        </div>
        <button className="btn-ui primary" onClick={() => onToast('Published')}>
          <Ph_ name="RocketLaunch" size={16} /> Publish Changes
        </button>
      </div>
    </header>
  )
}

function Builder({ onToast }: { onToast: (msg: string) => void }) {
  const preview = useStore((s) => s.preview)
  const version = useStore((s) => s.version)
  const started = useStore((s) => s.started)
  const [addAt, setAddAt] = useState<number | null>(null)

  // v1 picks sections from a modal; v2 keeps the library in the side panel,
  // where it can be dragged onto the canvas.
  const onAdd = (i: number) => (version === 'v2' ? actions.openLibrary(i) : setAddAt(i))

  return (
    <div className="builder">
      <BuilderBar onToast={onToast} />
      <div className={`workspace ${preview ? 'preview-mode' : ''}`}>
        <LeftPanel onAdd={onAdd} />
        <Canvas onAdd={onAdd} />
      </div>
      {addAt !== null && <AddSection index={addAt} onClose={() => setAddAt(null)} />}
      {/* First run: the builder is already behind it, so the choice reads as a
          starting point rather than a separate step. */}
      {version === 'v2' && !started && <StartScreen />}
    </div>
  )
}

export default function App() {
  const theme = useStore((s) => s.doc.theme)
  const appMode = useStore((s) => s.appMode)
  const selection = useStore((s) => s.selection)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1800)
  }, [])

  const fontPrimary = theme.fontPrimary ?? DEFAULT_FONT
  const fontSecondary = theme.fontSecondary ?? DEFAULT_FONT
  useFonts([fontPrimary, fontSecondary])

  // Layer 1 of the token system, applied once at the root so the portal chrome
  // and the previewed site read from the same generated palette. The two font
  // roles ride along, so the canvas only has to consume them.
  const primitives = useMemo(
    () => ({
      ...paletteTokens(theme.accent, theme.appearance),
      '--font-primary': fontStack(fontPrimary),
      '--font-secondary': fontStack(fontSecondary),
    }),
    [theme.accent, theme.appearance, fontPrimary, fontSecondary],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (appMode !== 'builder') return
      const el = document.activeElement as HTMLElement | null
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (typing) return
        e.preventDefault()
        e.shiftKey ? actions.redo() : actions.undo()
        return
      }
      if (e.key === 'Escape') {
        if (typing) return
        actions.panelBack()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && selection?.sectionId) {
        e.preventDefault()
        actions.removeSection(selection.sectionId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection?.sectionId, appMode])

  return (
    <div className="app-root" data-appearance={theme.appearance} style={primitives as React.CSSProperties}>
      <PortalShell>
        {appMode === 'builder' && <Builder onToast={showToast} />}
      </PortalShell>

      {toast && (
        <div className="toast">
          <Icon name="check" size={14} /> {toast}
        </div>
      )}
    </div>
  )
}
