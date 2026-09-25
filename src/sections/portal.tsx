import { useState } from 'react'
import { Btn, Ed, Ico, Img, Pick, useSection } from '../canvas/Bits'
import { Ph_ } from '../ui/Phosphor'

/* ==========================================================================
   DEVELOPER PORTAL SECTIONS — every layout from the Figma
   (Dev Portal · Docuwiz 2026 › Common Template Layout Variants).

   Product visuals (code panels, API cards, dashboards, phone) are built from
   markup rather than images so they follow the brand, the chrome treatment,
   the radius and the fonts. Anything that is genuinely a picture — people,
   photography — is an image slot with a themed fallback.
   ========================================================================== */

type P = Record<string, any>
const arr = (v: any): any[] => (Array.isArray(v) ? v : [])

/* ------------------------------------------------------------ shared bits */

function Head({ p, center = true, className = '' }: { p: P; center?: boolean; className?: string }) {
  return (
    <div className={`phead ${center ? 'center' : ''} ${className}`}>
      {p.showEyebrow !== false && p.eyebrow !== undefined && <Ed path="eyebrow" className="ptag" />}
      <Ed path="title" as="h2" className="ph2" multiline />
      {p.sub !== undefined && <Ed path="sub" as="p" className="psub" multiline />}
    </div>
  )
}

/** A partner or publication mark: the uploaded logo, or a themed wordmark. */
function Logo({ base, it, className = '' }: { base: string; it: any; className?: string }) {
  if (it?.image) {
    return (
      <Pick path={`${base}.image`} className={`plogo plogo-has-img ${className}`}>
        <img src={it.image} alt={it.name ?? ''} />
      </Pick>
    )
  }
  return (
    <span className={`plogo ${className}`}>
      <Ico path={`${base}.icon`} size={22} weight="bold" />
      <Ed path={`${base}.name`} />
    </span>
  )
}

function UsedBy() {
  return (
    <div className="usedby">
      <span className="usedby-avs">
        {['AK', 'JM', 'RS', 'LT', 'MP'].map((x, i) => (
          <span key={x} className="usedby-av" style={{ '--i': i } as React.CSSProperties}>{x}</span>
        ))}
      </span>
      <span className="usedby-text">
        <Ed path="usedByLabel" />
        <Ed path="usedByCount" className="usedby-count" />
      </span>
    </div>
  )
}

function Arrows({ count = 3, active = 1 }: { count?: number; active?: number }) {
  return (
    <div className="parrows" aria-hidden="true">
      <Ph_ name="ArrowLeft" size={18} className="parrow off" />
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`pdot ${i === active ? 'on' : ''}`} />
      ))}
      <Ph_ name="ArrowRight" size={18} className="parrow" />
    </div>
  )
}

/** Code with line numbers and quoted strings picked out. Edited from the panel. */
function Code({
  text, path, numbered = true, className = '',
}: { text: string; path?: string; numbered?: boolean; className?: string }) {
  const lines = String(text ?? '').split('\n')
  const content = lines.map((line, i) => (
    <div className="pcode-line" key={i}>
      {numbered && <span className="pcode-n">{i + 1}</span>}
      <span>
        {line.split(/("[^"]*"|'[^']*')/g).map((part, j) =>
          j % 2 ? <span key={j} className="pcode-s">{part}</span> : part,
        )}
      </span>
    </div>
  ))
  return path
    ? <Pick path={path} as="pre" className={`pcode ${className}`}>{content}</Pick>
    : <pre className={`pcode ${className}`}>{content}</pre>
}

const Skel = ({ w = 60, className = '' }: { w?: number | string; className?: string }) => (
  <span className={`skel ${className}`} style={{ width: typeof w === 'number' ? `${w}%` : w }} />
)

/* ==================================================================== nav */

export function PortalNav({ p }: { p: P }) {
  const { editing, interactive = true } = useSection()
  const [open, setOpen] = useState<number | null>(null)
  const restricted = (item: any) => item?.visibility && item.visibility !== 'everyone'
  const accessTitle = (item: any) => {
    if (item?.visibility === 'logged-in') return 'Logged-in users only'
    if (item?.visibility === 'logged-out') return 'Logged-out users only'
    if (item?.visibility === 'role') return `Role: ${item.role ?? 'any'}`
    if (item?.visibility === 'group') return `Group: ${item.group ?? 'any'}`
    return ''
  }
  const actionAccess = (prefix: 'secondary' | 'cta') => ({
    newTab: p[`${prefix}NewTab`],
    visibility: p[`${prefix}Visibility`] ?? 'everyone',
    role: p[`${prefix}Role`] ?? 'any',
    group: p[`${prefix}Group`] ?? 'any',
  })

  return (
    <div className="container pnav">
      {p.logoImage ? (
        <Pick path="logoImage" className="brand">
          <img src={p.logoImage} alt={p.logoText ?? ''} className="brand-logo" />
        </Pick>
      ) : (
        <Pick path="logoImage" className="brand" as="div">
          <span className="brand-mark">
            <Ph_ name={p.logoIcon ?? 'Sparkle'} size={15} weight="fill" />
          </span>
          <Ed path="logoText" />
        </Pick>
      )}
      <nav className="pnav-links">
        {arr(p.links).map((item, i) => {
          const base = `links[${i}]`
          if (item?.dropdown) {
            const isOpen = open === i
            return (
              <div
                key={i}
                className={`pnav-item pnav-dropdown ${isOpen ? 'open' : ''}`}
                onMouseEnter={() => interactive && setOpen(i)}
                onMouseLeave={() => interactive && setOpen(null)}
              >
                <button
                  type="button"
                  className="navlink pnav-dropdown-trigger"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => interactive && setOpen(isOpen ? null : i)}
                >
                  <Ed path={`${base}.label`} />
                  <Ph_ name="CaretDown" size={11} className="pnav-caret" />
                  {editing && restricted(item) && <span className="pnav-access" title={accessTitle(item)}><Ph_ name="LockKey" size={11} /></span>}
                </button>
                {isOpen && (
                  <div className="pnav-menu" role="menu">
                    {arr(item.children).map((child, j) => (
                      <a
                        key={j}
                        className="pnav-menu-item"
                        href={child.href || '#'}
                        target={child.newTab ? '_blank' : '_self'}
                        rel={child.newTab ? 'noreferrer' : undefined}
                        onClick={(e) => editing && e.preventDefault()}
                      >
                        <Ed path={`${base}.children[${j}].label`} />
                        {child.newTab && <Ph_ name="ArrowSquareOut" size={12} />}
                        {editing && restricted(child) && <span className="pnav-access" title={accessTitle(child)}><Ph_ name="LockKey" size={11} /></span>}
                      </a>
                    ))}
                    {!arr(item.children).length && <span className="pnav-menu-empty">No dropdown items</span>}
                  </div>
                )}
              </div>
            )
          }
          return (
            <a
              key={i}
              className="pnav-item-link"
              href={item?.href || '#'}
              target={item?.newTab ? '_blank' : '_self'}
              rel={item?.newTab ? 'noreferrer' : undefined}
              onClick={(e) => editing && e.preventDefault()}
            >
              <Ed path={`${base}.label`} className="navlink" />
              {item?.newTab && <Ph_ name="ArrowSquareOut" size={11} />}
              {editing && restricted(item) && <span className="pnav-access" title={accessTitle(item)}><Ph_ name="LockKey" size={11} /></span>}
            </a>
          )
        })}
      </nav>
      <div className="pnav-actions">
        {p.showSecondary && (
          <a
            className="pnav-action-link"
            href={p.secondaryLabelHref || '#'}
            target={p.secondaryNewTab ? '_blank' : '_self'}
            rel={p.secondaryNewTab ? 'noreferrer' : undefined}
            onClick={(e) => editing && e.preventDefault()}
          >
            <Ed path="secondaryLabel" className="navlink pnav-login" />
            {p.secondaryNewTab && <Ph_ name="ArrowSquareOut" size={11} />}
            {editing && restricted(actionAccess('secondary')) && <span className="pnav-access" title={accessTitle(actionAccess('secondary'))}><Ph_ name="LockKey" size={11} /></span>}
          </a>
        )}
        {p.showCta && (
          <a
            className="pnav-action-link"
            href={p.ctaLabelHref || '#'}
            target={p.ctaNewTab ? '_blank' : '_self'}
            rel={p.ctaNewTab ? 'noreferrer' : undefined}
            onClick={(e) => editing && e.preventDefault()}
          >
            <Ed path="ctaLabel" className="btn btn-primary btn-sm btn-pill" />
            {p.ctaNewTab && <Ph_ name="ArrowSquareOut" size={11} />}
            {editing && restricted(actionAccess('cta')) && <span className="pnav-access" title={accessTitle(actionAccess('cta'))}><Ph_ name="LockKey" size={11} /></span>}
          </a>
        )}
      </div>
    </div>
  )
}

/* =================================================================== hero */

function HeroLogos({ p, center = false }: { p: P; center?: boolean }) {
  if (!p.showLogos) return null
  return (
    <div className={`phero-logos ${center ? 'center' : ''}`}>
      <Ed path="logoHeading" as="p" className="phero-logos-title" />
      <div className="phero-logos-row">
        {arr(p.logos).map((it, i) => <Logo key={i} base={`logos[${i}]`} it={it} />)}
      </div>
    </div>
  )
}

/** Layered portal windows — the product, not a stock illustration. */
function PortalArt({ p }: { p: P }) {
  return (
    <div className="part">
      <div className="part-window part-main">
        <div className="part-bar"><i /><i /><i /><span className="part-url">{String(p.productName ?? '').toLowerCase()}.dev/portal</span></div>
        <div className="part-body">
          <div className="part-side">
            <span className="part-logo"><Ph_ name={p.logoIcon ?? 'Sparkle'} size={12} weight="fill" /></span>
            {[72, 54, 64, 44, 58].map((w, i) => <Skel key={i} w={w} className={i === 1 ? 'on' : ''} />)}
          </div>
          <div className="part-content">
            <div className="part-title-row">
              <span className="method m-post">POST</span>
              <span className="part-path">/v1/payments</span>
            </div>
            <Skel w={80} /><Skel w={62} />
            <div className="part-chart">
              {[38, 56, 44, 70, 52, 84, 66, 92].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </div>
      </div>

      <div className="part-card part-req">
        <div className="part-card-h"><span className="method m-get">GET</span><span className="part-path">/accounts</span></div>
        <div className="part-ok"><Ph_ name="CheckCircle" size={13} weight="fill" /> 200 OK</div>
        <Skel w={70} /><Skel w={48} />
        <span className="part-try"><Ph_ name="Play" size={10} weight="fill" /> Try it</span>
      </div>

      <div className="part-card part-key">
        <span className="part-key-icon"><Ph_ name="ShieldCheck" size={18} weight="fill" /></span>
        <div>
          <b>Production key</b>
          <span className="part-mono">sk_live_••••••••</span>
        </div>
      </div>

      <div className="part-card part-code">
        <Ph_ name="Code" size={20} weight="bold" />
      </div>
    </div>
  )
}

/** The centred hero's product shot: a docs window with floating capability cards. */
function ProductMock({ p }: { p: P }) {
  const slug = String(p.productName ?? 'portal').toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="pm">
      <div className="pm-float pm-f1">
        <span className="pm-f-icon"><Ph_ name="Lightning" size={18} weight="fill" /></span>
        <div className="pm-f-copy">
          <b>Fast &amp; reliable APIs</b>
          <svg viewBox="0 0 120 28" className="pm-spark" aria-hidden="true">
            <polyline points="2,22 30,16 54,18 80,9 118,3" />
            {[[2, 22], [30, 16], [54, 18], [80, 9]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.6" />)}
          </svg>
          <span className="pm-accent">99.9% uptime</span>
        </div>
      </div>

      <div className="pm-window">
        <div className="pm-bar"><i /><i /><i /></div>
        <div className="pm-nav">
          <Ed path="productName" className="pm-logo" />
          <span className="pm-nav-links"><span>Docs</span><span className="on">APIs</span><span>Guides</span></span>
        </div>
        <div className="pm-head">
          <span className="pm-glyph">&lt;/&gt;</span>
          <span className="pm-skels"><Skel w={70} /><Skel w={46} /></span>
          <span className="pm-try"><Ph_ name="Play" size={12} /> Try it out</span>
        </div>
        <div className="pm-cols">
          <div className="pm-code">
            <div className="pm-code-h"><span className="pm-verb">GET</span> /v1/accounts</div>
            {[['200', 'OK'], ['201', 'Created'], ['400', 'Bad Request'], ['401', 'Unauthorized'], ['500', 'Internal Server Error']].map(([c, t], i) => (
              <div key={c} className="pm-code-row">
                <span>{c}</span> {t} {i === 0 && <Ph_ name="Check" size={11} weight="bold" className="pm-tick" />}
              </div>
            ))}
          </div>
          <div className="pm-params">
            <Skel w={76} />
            <div className="pm-param"><span className="pm-chip">Authorization</span><Skel w={40} /></div>
            <div className="pm-param"><span className="pm-chip">Content-Type</span><Skel w={40} /></div>
            <Skel w={86} /><Skel w={70} />
          </div>
        </div>
      </div>

      <div className="pm-float pm-f2">
        <span className="pm-f-icon"><Ph_ name="BracketsCurly" size={18} weight="bold" /></span>
        <div className="pm-f-copy">
          <b>Built for developers</b>
          <Skel w={90} /><Skel w={60} />
        </div>
      </div>

      <div className="pm-float pm-f3">
        <b>Sandbox</b>
        <span className="pm-muted">Test your integration</span>
        <span className="pm-cube"><Ph_ name="Cube" size={46} weight="duotone" /></span>
      </div>

      <div className="pm-float pm-sdk">
        <div className="pm-sdk-h">Install SDK <Ph_ name="Copy" size={13} /></div>
        <code>npm install {slug}-sdk</code>
      </div>
    </div>
  )
}

export function PortalHero({ p, variant }: { p: P; variant: string }) {
  if (variant === 'centered') {
    return (
      <div className="phero-c">
        <div className="phero-grid" aria-hidden="true" />
        <div className="container phero-c-inner">
          <div className="phero-copy center">
            {p.showEyebrow && <Ed path="eyebrow" className="phero-eyebrow accent" />}
            <Ed path="headline" as="h1" className="phero-title" multiline />
            <Ed path="sub" as="p" className="phero-sub" multiline />
            <div className="btn-row center">
              {p.showSecondary && <Ed path="secondaryCta" as="button" className="btn btn-ghost btn-pill phero-ghost" />}
              {p.showPrimary && <Ed path="primaryCta" as="button" className="btn btn-primary btn-pill" />}
            </div>
          </div>
          {p.image ? <Img path="image" className="phero-shot" label="Product image" /> : <Pick path="image"><ProductMock p={p} /></Pick>}
          <HeroLogos p={p} center />
        </div>
      </div>
    )
  }

  return (
    <div className="container phero-split">
      <div className="phero-copy">
        {p.showEyebrow && <Ed path="eyebrow" className="phero-eyebrow" />}
        <Ed path="headline" as="h1" className="phero-title" multiline />
        <Ed path="sub" as="p" className="phero-sub" multiline />
        <div className="btn-row">
          {p.showSecondary && <Btn path="secondaryCta" kind="link" />}
          {p.showPrimary && <Ed path="primaryCta" as="button" className="btn btn-primary btn-pill" />}
        </div>
        <HeroLogos p={p} />
      </div>
      <div className="phero-art">
        {p.image ? <Img path="image" className="phero-img" label="Hero image" /> : <Pick path="image"><PortalArt p={p} /></Pick>}
      </div>
    </div>
  )
}

/* ================================================================= awards */

function AwardsTable({ p, max }: { p: P; max?: number }) {
  return (
    <div className="aw-table">
      <Ed path="listTitle" as="h3" className="aw-table-title" />
      <div className="aw-rows">
        {arr(p.awards).slice(0, max).map((_, i) => (
          <div className="aw-row" key={i}>
            <Ed path={`awards[${i}].year`} className="aw-year" />
            <Ed path={`awards[${i}].name`} className="aw-name" />
            <Ed path={`awards[${i}].org`} className="aw-org" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Medal({ p }: { p: P }) {
  return (
    <Pick path="image" className="aw-medal">
      {p.image ? (
        <img src={p.image} alt="" />
      ) : (
        <>
          <Ph_ name="Sparkle" size={30} weight="fill" className="aw-spark s1" />
          <Ph_ name="Sparkle" size={20} weight="fill" className="aw-spark s2" />
          <Ph_ name="Sparkle" size={24} weight="fill" className="aw-spark s3" />
          <span className="aw-ribbon" />
          <span className="aw-disc"><Ph_ name="Star" size={62} weight="fill" /></span>
        </>
      )}
    </Pick>
  )
}

/** A wall of frosted tiles with the award marks across the middle row. */
function LogoWall({ p, vertical = false }: { p: P; vertical?: boolean }) {
  const logos = arr(p.logos).slice(0, 3)
  return (
    <div className={`aw-wall ${vertical ? 'vertical' : ''}`}>
      {Array.from({ length: 9 }).map((_, t) => {
        const mid = vertical ? t % 3 === 1 : t >= 3 && t < 6
        const idx = vertical ? (t - 1) / 3 : t - 3
        const it = mid ? logos[idx] : undefined
        return (
          <span key={t} className={`aw-tile ${mid ? 'mid' : ''} ${mid && idx === 1 ? 'dark' : ''}`}>
            {it && <Logo base={`logos[${idx}]`} it={it} className="aw-tile-logo" />}
          </span>
        )
      })}
    </div>
  )
}

function NetworkArt({ flow = false }: { flow?: boolean }) {
  if (flow) {
    return (
      <div className="aw-art aw-flow">
        {['Payments processing', 'Account & ledger APIs', 'Compliance & controls'].map((t) => (
          <span key={t} className="aw-flow-pill">{t}</span>
        ))}
        <span className="aw-flow-hub"><Ph_ name="Bank" size={20} /></span>
      </div>
    )
  }
  return (
    <div className="aw-art aw-network">
      <span className="aw-node n1"><Ph_ name="CreditCard" size={11} /></span>
      <span className="aw-node n2"><Ph_ name="Receipt" size={11} /></span>
      <span className="aw-node n3"><Ph_ name="ChatText" size={11} /></span>
      <span className="aw-hub"><Ph_ name="Bank" size={22} /></span>
    </div>
  )
}

function Highlight({ p, i, wide = false, logoPanel = false }: { p: P; i: number; wide?: boolean; logoPanel?: boolean }) {
  const h = arr(p.highlights)[i] ?? {}
  const copy = (
    <div className="aw-hl-copy">
      <Ed path={`highlights[${i}].category`} className="aw-cat" />
      <Ed path={`highlights[${i}].title`} as="h3" className="aw-hl-title" multiline />
      <Ed path={`highlights[${i}].body`} as="p" className="aw-hl-body" multiline />
      {wide && h.org && (
        <div className="aw-org-line">
          {!logoPanel && <span className="aw-org-dot" />}
          <div>
            <Ed path={`highlights[${i}].org`} as="div" className="aw-org-name" />
            <Ed path={`highlights[${i}].orgDetail`} as="div" className="aw-org-detail" />
          </div>
        </div>
      )}
    </div>
  )
  if (!wide) {
    return (
      <div className="aw-hl card">
        {h.image ? <Img path={`highlights[${i}].image`} className="aw-art" /> : <Pick path={`highlights[${i}].image`}><NetworkArt flow={i % 2 === 1} /></Pick>}
        {copy}
      </div>
    )
  }
  return (
    <div className="aw-hl aw-hl-wide card">
      {h.image ? <Img path={`highlights[${i}].image`} className="aw-wall" /> : <Pick path={`highlights[${i}].image`}><LogoWall p={p} vertical={i % 2 === 0} /></Pick>}
      {copy}
    </div>
  )
}

export function Awards({ p, variant }: { p: P; variant: string }) {
  if (variant === 'cards') {
    return (
      <div className="container pad">
        <Head p={p} />
        <div className="aw-cards">
          <div className="aw-cards-row"><Highlight p={p} i={0} /><Highlight p={p} i={1} wide /></div>
          <div className="aw-cards-row flip"><Highlight p={p} i={2} wide /><Highlight p={p} i={3} /></div>
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    const h = arr(p.highlights)
    return (
      <div className="container pad">
        <Head p={p} />
        <div className="aw-tbl-layout">
          <div className="aw-col">
            <div className="aw-logo-strip card">
              {arr(p.logos).slice(0, 4).map((it, i) => (
                <span key={i} className={`aw-logo-tile ${i === 0 ? 'dark' : ''}`}>
                  <Logo base={`logos[${i}]`} it={it} />
                </span>
              ))}
            </div>
            {h[0] && (
              <div className="aw-hl card">
                <div className="aw-hl-copy">
                  <Ed path="highlights[0].category" className="aw-cat" />
                  <Ed path="highlights[0].title" as="h3" className="aw-hl-title big" multiline />
                  <Ed path="highlights[0].body" as="p" className="aw-hl-body" multiline />
                </div>
              </div>
            )}
          </div>
          {h[1] && (
            <div className="aw-hl card aw-hl-feature">
              <div className="aw-feature-mark">
                {arr(p.logos)[1] && <Logo base="logos[1]" it={arr(p.logos)[1]} />}
              </div>
              <div className="aw-hl-copy">
                <Ed path="highlights[1].category" className="aw-cat" />
                <Ed path="highlights[1].title" as="h3" className="aw-hl-title big" multiline />
                <Ed path="highlights[1].body" as="p" className="aw-hl-body" multiline />
              </div>
            </div>
          )}
          <div className="card aw-table-card"><AwardsTable p={p} max={10} /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container pad-sm">
      <div className="aw-spot">
        <div className="aw-spot-card tint">
          <Ed path="title" as="h2" className="ph2" />
          <div className="aw-spot-body">
            <Ed path="sub" as="p" className="aw-spot-sub" multiline />
            <Medal p={p} />
          </div>
        </div>
        <div className="aw-side">
          <div className="aw-logos card">
            {arr(p.logos).slice(0, 3).map((it, i) => <Logo key={i} base={`logos[${i}]`} it={it} className="serif" />)}
          </div>
          <div className="card aw-table-card"><AwardsTable p={p} max={5} /></div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================== featured APIs */

function ApiCard({ i }: { i: number }) {
  return (
    <div className="api-card">
      <div className="api-band surface surf-brand">
        <span className="band-lines" aria-hidden="true" />
        <UsedBy />
      </div>
      <div className="api-body">
        <Ed path={`apis[${i}].category`} className="api-cat" />
        <Ed path={`apis[${i}].name`} as="h3" className="api-name" />
        <Ed path={`apis[${i}].desc`} as="p" className="api-desc" multiline />
        <span className="api-link"><Ed path={`apis[${i}].cta`} /> <Ph_ name="ArrowRight" size={12} /></span>
      </div>
    </div>
  )
}

function ApiIntro({ p }: { p: P }) {
  return (
    <div className="api-intro soft">
      <Ed path="eyebrow" className="ptag" />
      <Ed path="title" as="h2" className="ph2" multiline />
      <Ed path="sub" as="p" className="psub" multiline />
      <div className="api-cats">
        {arr(p.categories).slice(0, 6).map((_, i) => (
          <div className={`api-cat-tile ${i === 0 ? 'on' : ''}`} key={i}>
            <Ico path={`categories[${i}].icon`} size={26} weight="light" />
            <Ed path={`categories[${i}].label`} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EndpointCard({ p, i }: { p: P; i: number }) {
  const lines = String(arr(p.apis)[i]?.endpoints ?? '').split('\n').filter(Boolean).slice(0, 4)
  return (
    <div className="ep-card">
      <div className="ep-copy soft">
        <Ed path={`apis[${i}].category`} className="api-cat" />
        <Ed path={`apis[${i}].name`} as="h3" className="api-name" />
        <Ed path={`apis[${i}].desc`} as="p" className="api-desc" multiline />
        <span className="api-link"><Ed path={`apis[${i}].cta`} /> <Ph_ name="ArrowRight" size={12} /></span>
      </div>
      <div className="ep-panel surface surf-brand">
        <span className="band-lines" aria-hidden="true" />
        <div className="ep-list">
          {lines.map((l, k) => {
            const [m, ...rest] = l.trim().split(/\s+/)
            return (
              <div className="ep-row" key={k} style={{ opacity: 1 - k * 0.24 }}>
                <span className={`method m-${m.toLowerCase()}`}>{m}</span>
                <span className="ep-path">{rest.join(' ')}</span>
              </div>
            )
          })}
        </div>
        <UsedBy />
      </div>
    </div>
  )
}

export function FeaturedApis({ p, variant }: { p: P; variant: string }) {
  const { interactive = true } = useSection()
  const [tab, setTab] = useState(0)
  const apis = arr(p.apis)

  if (variant === 'tabs') {
    return (
      <div className="container pad">
        <Head p={p} />
        <div className="api-tabs" role="tablist">
          {arr(p.categories).map((c, i) =>
            interactive ? (
              <button key={i} role="tab" className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>{c.label}</button>
            ) : (
              // A thumbnail can't nest a <button> inside the card that's
              // already clickable — same look, no interactive element.
              <span key={i} role="tab" className={tab === i ? 'on' : ''}>{c.label}</span>
            ),
          )}
        </div>
        <div className="grid g3 api-tab-cards">
          {apis.slice(0, 3).map((_, i) => <ApiCard key={i} i={i} />)}
        </div>
        <Arrows />
      </div>
    )
  }

  if (variant === 'split') {
    return (
      <div className="container pad">
        <div className="api-layout">
          <ApiIntro p={p} />
          <div className="ep-stack">
            {apis.slice(0, 2).map((_, i) => <EndpointCard key={i} p={p} i={i} />)}
          </div>
        </div>
        <Arrows />
      </div>
    )
  }

  return (
    <div className="container pad">
      <div className="api-layout">
        <ApiIntro p={p} />
        <div className="grid g2">
          {apis.slice(0, 4).map((_, i) => <ApiCard key={i} i={i} />)}
        </div>
      </div>
      <Arrows />
    </div>
  )
}

/* ============================================================ marketplace */

function TryOut({ p }: { p: P }) {
  return (
    <div className="tryout">
      <div className="tryout-h">
        <span>Try it out</span>
        <span className="tryout-icons"><Ph_ name="Copy" size={15} /><Ph_ name="DownloadSimple" size={15} /></span>
      </div>
      <div className="tryout-block">
        <div className="tryout-bh">
          <span>Request</span>
          <span className="tryout-tools">
            <span className="tryout-select"><Ed path="language" /> <Ph_ name="CaretDown" size={11} /></span>
            <Ph_ name="Copy" size={14} />
            <span className="tryout-run"><Ph_ name="Play" size={11} weight="fill" /></span>
          </span>
        </div>
        <Code text={p.requestCode} path="requestCode" />
      </div>
      <div className="tryout-block">
        <div className="tryout-bh">
          <span>Response</span>
          <span className="tryout-status"><i /> <Ed path="responseStatus" /> <Ph_ name="CaretDown" size={11} /></span>
        </div>
        <Code text={p.responseCode} path="responseCode" />
      </div>
    </div>
  )
}

export function Marketplace({ p, variant }: { p: P; variant: string }) {
  const { interactive = true } = useSection()
  const [active, setActive] = useState(0)
  const features = arr(p.features)

  if (variant === 'carousel') {
    const i = Math.min(active, Math.max(features.length - 1, 0))
    return (
      <div className="container pad">
        <div className="mk-carousel">
          <div className="mk-intro-wrap">
            <div className="mk-intro soft">
              <Ed path="eyebrow" className="ptag" />
              <Ed path="title" as="h2" className="ph2" multiline />
              <Ed path="sub" as="p" className="psub" multiline />
              {features[i] && (
                <div className="mk-active card">
                  <Ico path={`features[${i}].icon`} size={20} wrapper="mk-ficon" />
                  <Ed path={`features[${i}].title`} as="h3" className="mk-active-title" />
                  <Ed path={`features[${i}].body`} as="p" className="mk-active-body" multiline />
                </div>
              )}
            </div>
            <div className="mk-dots">
              {features.map((_, k) =>
                interactive ? (
                  <button key={k} className={k === i ? 'on' : ''} onClick={() => setActive(k)} aria-label={`Feature ${k + 1}`} />
                ) : (
                  <span key={k} className={k === i ? 'on' : ''} aria-hidden="true" />
                ),
              )}
            </div>
          </div>
          <div className="mk-deck">
            <span className="mk-deck-back b3" /><span className="mk-deck-back b2" /><span className="mk-deck-back b1" />
            <div className="mk-deck-front"><TryOut p={p} /></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <Head p={p} />
      <div className="mk-list">
        <div className="mk-features">
          {features.map((_, i) => (
            <div key={i} className={`mk-feature ${active === i ? 'on' : ''}`} onClick={() => setActive(i)}>
              <Ico path={`features[${i}].icon`} size={17} wrapper="mk-ficon" />
              <div>
                <Ed path={`features[${i}].title`} as="h3" className="mk-ftitle" />
                <Ed path={`features[${i}].body`} as="p" className="mk-fbody" multiline />
              </div>
            </div>
          ))}
        </div>
        <div className="mk-stage surface surf-brand"><TryOut p={p} /></div>
      </div>
    </div>
  )
}

/* ======================================================== getting started */

function SignupMock() {
  return (
    <div className="mock mock-form">
      <div className="mock-2">
        <label>First name *<span className="mock-input">John</span></label>
        <label>Last name *<span className="mock-input">Doe</span></label>
      </div>
      <label>Email address *<span className="mock-input">john.doe@company.com</span></label>
      <span className="mock-check"><i /> <span><b>I agree to the Terms of Service</b><br />By creating an account, you agree to our terms</span></span>
      <span className="mock-btn">Sign up</span>
      <span className="mock-foot">Already have an account? <b>Sign in here</b></span>
    </div>
  )
}

function KeysMock() {
  return (
    <div className="mock mock-keys">
      <div className="mock-row-between">
        <div><b>API key management</b><span className="mock-sub">Manage your API authentication keys</span></div>
        <span className="mock-btn sm"><Ph_ name="Plus" size={9} weight="bold" /> Create key</span>
      </div>
      {[['Production API key', 'sk_live_'], ['Development API key', 'sk_dev_']].map(([name, prefix]) => (
        <div className="mock-key" key={name}>
          <div className="mock-row-between"><span><b>{name}</b> <span className="mock-badge">Active</span></span><Ph_ name="Eye" size={11} /></div>
          <span className="mock-sub">Created on Jan 15, 2026 · Last used 2 hours ago</span>
          <span className="mock-input mono">{prefix}••••••••••••••••••••</span>
          <span className="mock-links"><b>Regenerate</b> · <b className="danger">Delete</b></span>
        </div>
      ))}
    </div>
  )
}

function DocsMock() {
  return (
    <div className="mock mock-docs">
      <div className="mock-docs-l">
        <div className="mock-ep"><span className="method m-post">POST</span> <b>Create payment</b></div>
        <span className="mock-sub">Update the payment details by the company</span>
        <span className="mock-label">PATH PARAMS</span>
        <div className="mock-param"><b>company_id</b> <span className="mock-sub">string</span><Skel w={30} /></div>
        <span className="mock-label">BODY PARAMS</span>
        <div className="mock-param"><b>title</b> <span className="mock-sub">string</span><Skel w={30} /></div>
      </div>
      <div className="mock-docs-r">
        <span className="mock-label">Try out</span>
        <div className="mock-term">
          <span>curl --request POST \</span><span>--url https://api.example.com</span><span>--header 'accept: json' \</span><span>--data '{`{`}"amount": 2500{`}`}'</span>
        </div>
        <span className="mock-label">RESPONSE BODY</span>
        <span className="mock-code-chip">201</span>
      </div>
    </div>
  )
}

function UsageMock() {
  return (
    <div className="mock mock-usage">
      <div className="mock-chart-card">
        <b>API response time (ms)</b>
        <svg viewBox="0 0 220 60" className="mock-chart" aria-hidden="true">
          <polyline points="0,44 20,40 36,46 52,38 70,42 90,36 108,40 126,34 140,38 150,8 156,40 176,36 196,40 220,34" />
        </svg>
        <span className="mock-tip">99% · Jan 12, 2026</span>
      </div>
      <div className="mock-rate">
        {[['ArrowsLeftRight', 'Total calls', '234'], ['CurrencyDollar', 'Revenue', ''], ['Gauge', 'Charging model', ''], ['HandCoins', 'Additional fee', '']].map(([icon, label, val]) => (
          <div className="mock-rate-row" key={label}>
            <span className="mock-rate-icon"><Ph_ name={icon} size={11} /></span>
            <span><span className="mock-sub">{label}</span>{val ? <b>{val}</b> : <Skel w={70} />}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const STEP_MOCKS = [SignupMock, KeysMock, DocsMock, UsageMock]
const StepMock = ({ i }: { i: number }) => {
  const M = STEP_MOCKS[i % STEP_MOCKS.length]
  return <M />
}

function StepLabel({ i }: { i: number }) {
  return (
    <span className="gs-step">
      <Ico path={`steps[${i}].icon`} size={15} />
      STEP {i + 1}
    </span>
  )
}

export function GettingStarted({ p, variant }: { p: P; variant: string }) {
  const [active, setActive] = useState(0)
  const steps = arr(p.steps)

  if (variant === 'split') {
    const i = Math.min(active, Math.max(steps.length - 1, 0))
    return (
      <div className="container pad">
        <div className="gs-split">
          <div className="gs-split-l">
            <Head p={p} center={false} className="tight" />
            <Ed path="cta" as="button" className="btn btn-primary gs-cta" />
            <div className="gs-list">
              {steps.map((_, k) => (
                <div key={k} className={`gs-item ${k === i ? 'on' : ''}`} onClick={() => setActive(k)}>
                  <span className="gs-num">{String(k + 1).padStart(2, '0')}</span>
                  <div>
                    <Ed path={`steps[${k}].title`} as="h3" className="gs-item-title" />
                    <Ed path={`steps[${k}].short`} as="p" className="gs-item-body" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {steps[i] && (
            <div className="gs-detail tint">
              <StepLabel i={i} />
              <Ed path={`steps[${i}].title`} as="h3" className="gs-detail-title" />
              <Ed path={`steps[${i}].body`} as="p" className="gs-detail-body" multiline />
              <div className="gs-detail-mock"><StepMock i={i} /></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="container pad">
        <Head p={p} center={false} className="tight" />
        <Ed path="cta" as="button" className="btn btn-ghost gs-cta" />
        <div className="gs-grid">
          {steps.slice(0, 4).map((_, i) => (
            <div className="gs-cell" key={i}>
              <StepLabel i={i} />
              <Ed path={`steps[${i}].title`} as="h3" className="gs-detail-title" />
              <Ed path={`steps[${i}].body`} as="p" className="gs-detail-body" multiline />
              <div className="gs-cell-mock"><StepMock i={i} /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <Head p={p} center={false} className="tight" />
      <span className="gs-cta-wrap">
        <Ed path="cta" as="button" className="btn btn-ghost gs-cta" />
      </span>
      <div className="gs-cards">
        {steps.slice(0, 4).map((_, i) => (
          <div className="gs-card card" key={i}>
            <div className="gs-card-top">
              <StepLabel i={i} />
              <Ed path={`steps[${i}].badge`} className={`gs-badge ${i > 1 ? 'alt' : ''}`} />
            </div>
            <Ed path={`steps[${i}].title`} as="h3" className="gs-card-title" />
            <Ed path={`steps[${i}].tagline`} as="p" className="gs-tagline" />
            <Ed path={`steps[${i}].body`} as="p" className="gs-card-body" multiline />
            <div className="gs-card-mock"><StepMock i={i} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =============================================================== solution */

function FlowArt({ label }: { label: string }) {
  return (
    <div className="flow surface surf-brand">
      <span className="flow-arc" aria-hidden="true" />
      <span className="flow-timer"><Ph_ name="Timer" size={22} weight="bold" /><small>Real-time</small></span>
      <span className="flow-actor left"><Ph_ name="User" size={26} weight="fill" /></span>
      <span className="flow-pill left">Accept</span>
      <div className="flow-gw">
        <div className="flow-gw-bar"><i /><i /><i /></div>
        <b>{label}</b>
        <span className="flow-shield"><Ph_ name="ShieldCheck" size={34} weight="fill" /></span>
        <span className="flow-lines"><Skel w={70} /><Skel w={50} /></span>
      </div>
      <span className="flow-pill right">Settle</span>
      <span className="flow-actor right"><Ph_ name="Bank" size={26} weight="fill" /></span>
      <span className="flow-foot"><Ph_ name="Lock" size={12} weight="fill" /> Secure · Reliable · Compliant</span>
    </div>
  )
}

function IndustryList({ p, active, setActive, icons = false }: { p: P; active: number; setActive: (i: number) => void; icons?: boolean }) {
  return (
    <div className="ind-list">
      {arr(p.industries).map((_, i) => (
        <div key={i} className={`ind ${i === active ? 'on' : ''} ${icons ? 'with-icon' : ''}`} onClick={() => setActive(i)}>
          {icons && <Ico path={`industries[${i}].icon`} size={18} />}
          <div>
            <Ed path={`industries[${i}].name`} as="div" className="ind-name" />
            <Ed path={`industries[${i}].tagline`} as="div" className="ind-tagline" />
          </div>
        </div>
      ))}
    </div>
  )
}

function RecipeCard({ i, className = '' }: { i: number; className?: string }) {
  return (
    <div className={`sol-recipe card ${className}`}>
      <Ed path={`recipes[${i}].title`} as="h3" className="sol-recipe-title" />
      <Ed path={`recipes[${i}].body`} as="p" className="sol-recipe-body" multiline />
      <span className="sol-recipe-link"><Ed path={`recipes[${i}].cta`} /> <Ph_ name="ArrowRight" size={12} /></span>
    </div>
  )
}

export function Solution({ p }: { p: P; variant: string }) {
  const [active, setActive] = useState(0)
  const industries = arr(p.industries)
  const i = Math.min(active, Math.max(industries.length - 1, 0))
  const ind = industries[i]
  return (
    <div className="container pad">
      <Head p={p} />
      <div className="sol">
        <IndustryList p={p} active={i} setActive={setActive} />
        <div className="sol-main">
          {ind && (
            <>
              <Ed path={`industries[${i}].headline`} as="h3" className="sol-headline" />
              <Ed path={`industries[${i}].body`} as="p" className="sol-body" multiline />
            </>
          )}
          <div className="sol-grid">
            {p.image ? <Img path="image" className="sol-art" label="Illustration" /> : <Pick path="image" className="sol-art"><FlowArt label={ind?.name ?? 'Payment gateway'} /></Pick>}
            <div className="sol-featured">
              <Ed path="featuredLabel" className="sol-featured-label" />
              {arr(p.recipes).slice(0, 3).map((_, k) => <RecipeCard key={k} i={k} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ========================================================= why choose us */

function SecurityArt() {
  return (
    <div className="sec-art surface surf-brand">
      <div className="sec-phone">
        <span className="sec-phone-notch" />
        <span className="sec-finger"><Ph_ name="Fingerprint" size={40} /></span>
        <Skel w={70} /><Skel w={50} />
        <span className="sec-lock"><Ph_ name="LockKey" size={56} weight="fill" /></span>
      </div>
      <span className="sec-float f1"><Ph_ name="Key" size={18} weight="fill" /></span>
      <span className="sec-float f2"><Ph_ name="EnvelopeSimple" size={20} weight="fill" /></span>
      <span className="sec-float f3"><Ph_ name="FolderSimpleLock" size={22} weight="fill" /></span>
    </div>
  )
}

function WhyCard({ i, className = '' }: { i: number; className?: string }) {
  return (
    <div className={`why-card soft ${className}`}>
      <Ico path={`items[${i}].icon`} size={20} wrapper="why-icon" />
      <Ed path={`items[${i}].title`} as="h3" className="why-title" />
      <Ed path={`items[${i}].body`} as="p" className="why-body" multiline />
    </div>
  )
}

export function WhyChooseUs({ p, variant }: { p: P; variant: string }) {
  const [active, setActive] = useState(0)

  if (variant === 'bento') {
    const items = arr(p.items)
    const st = arr(p.statements)
    const feat = (i: number, tone: 'tint' | 'brand' = 'tint') =>
      items[i] ? (
        <div className={`bento-cell feat ${tone === 'brand' ? 'surface surf-brand brand' : 'tint'}`}>
          {tone === 'brand' && <span className="bento-orb" aria-hidden="true" />}
          <Ico path={`items[${i}].icon`} size={tone === 'brand' ? 26 : 24} wrapper={tone === 'brand' ? 'bento-icon-circle' : 'bento-icon'} weight={tone === 'brand' ? 'regular' : 'bold'} />
          <Ed path={`items[${i}].title`} as="h3" className="bento-title" />
          <Ed path={`items[${i}].body`} as="p" className="bento-body" multiline />
        </div>
      ) : <div className="bento-cell" />
    const stmt = (k: number) => (
      <div className="bento-cell stmt">
        {st[k] ? <Ed path={`statements[${k}].text`} as="p" className="bento-stmt" multiline /> : null}
      </div>
    )
    return (
      <div className="container pad">
        <Head p={p} />
        <div className="bento3">
          {feat(0)}{stmt(0)}{feat(1, 'brand')}
          {stmt(1)}{feat(2)}{stmt(2)}
          {stmt(3)}{stmt(4)}{feat(3)}
        </div>
      </div>
    )
  }

  if (variant === 'usecases') {
    return (
      <div className="container pad">
        <Head p={p} />
        <div className="uc">
          <IndustryList p={p} active={active} setActive={setActive} icons />
          <div>
            <Ed path="featuredLabel" as="div" className="uc-label" />
            <div className="grid g2 uc-grid">
              {arr(p.recipes).slice(0, 4).map((_, k) => <RecipeCard key={k} i={k} className="uc-recipe" />)}
            </div>
          </div>
        </div>
        <div className="uc-stats soft">
          <Pick path="logoImage" className="uc-mark">
            {p.logoImage ? <img src={p.logoImage} alt="" /> : <Ph_ name={p.logoIcon ?? 'Sparkle'} size={34} weight="fill" />}
          </Pick>
          <div className="uc-stats-copy">
            <Ed path="statsTitle" as="div" className="uc-stats-title" />
            <Ed path="statsSub" as="div" className="uc-stats-sub" />
          </div>
          {arr(p.stats).map((_, k) => (
            <div className="uc-stat" key={k}>
              <Ed path={`stats[${k}].value`} as="div" className="uc-stat-value" />
              <Ed path={`stats[${k}].label`} as="div" className="uc-stat-label" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <Head p={p} />
      <div className="why3">
        <div className="why-col"><WhyCard i={0} /><WhyCard i={1} /></div>
        <div className="why-center">
          {p.image ? <Img path="image" className="why-img" label="Illustration" /> : <Pick path="image" className="why-img"><SecurityArt /></Pick>}
          <Ed path="cta" as="button" className="btn btn-ghost btn-pill why-cta" />
        </div>
        <div className="why-col"><WhyCard i={2} /><WhyCard i={3} /></div>
      </div>
    </div>
  )
}

/* =============================================================== contact */

export function PortalContact({ p }: { p: P; variant: string }) {
  return (
    <div className="container pad ct">
      <div className="ct-copy">
        <Ed path="title" as="h2" className="ct-title" multiline />
        <Ed path="sub" as="p" className="ct-sub" multiline />
        <Ed path="cta" as="button" className="btn btn-ghost btn-pill" />
      </div>
      <div className="ct-form">
        <Ed path="formTitle" as="h3" className="ct-form-title" />
        <Ed path="formSub" as="p" className="ct-form-sub" />
        {arr(p.fields).map((f, i) => (
          <div className="ct-field" key={i}>
            <Ed path={`fields[${i}].label`} as="label" />
            <div className={`ct-input ${f.multiline ? 'multi' : ''}`}>
              <Ico path={`fields[${i}].icon`} size={14} />
              <span>{f.placeholder}</span>
            </div>
          </div>
        ))}
        <Ed path="submitLabel" as="button" className="btn btn-primary ct-submit" />
        <div className="ct-legal"><Ph_ name="CheckCircle" size={15} weight="fill" /><Ed path="legal" /></div>
      </div>
    </div>
  )
}

/* ============================================================= resources */

const POST_ART = ['Scales', 'ClipboardText', 'ChartBar', 'Buildings']

function PostMedia({ p, i, className = '' }: { p: P; i: number; className?: string }) {
  const post = arr(p.posts)[i] ?? {}
  if (post.image) return <Img path={`posts[${i}].image`} className={`post-media ${className}`} />
  return (
    <Pick path={`posts[${i}].image`} className={`post-media post-art ${className}`}>
      <Ph_ name={POST_ART[i % POST_ART.length]} size={72} weight="duotone" />
    </Pick>
  )
}

function Post({ p, i, wide = false }: { p: P; i: number; wide?: boolean }) {
  const post = arr(p.posts)[i]
  if (!post) return <div />
  return (
    <article className={`post card ${wide ? 'wide' : ''}`}>
      <PostMedia p={p} i={i} />
      <div className="post-copy">
        <Ed path={`posts[${i}].category`} className="post-cat" />
        <Ed path={`posts[${i}].title`} as="h3" className="post-title" multiline />
        {(wide || i === 3) && <Ed path={`posts[${i}].excerpt`} as="p" className="post-excerpt" multiline />}
        {wide && (
          <div className="post-author">
            <Ed path={`posts[${i}].author`} as="div" className="post-author-name" />
            <Ed path={`posts[${i}].role`} as="div" className="post-author-role" />
          </div>
        )}
      </div>
    </article>
  )
}

export function Resources({ p }: { p: P; variant: string }) {
  return (
    <div className="container pad">
      <Head p={p} />
      <div className="posts">
        <div className="posts-row"><Post p={p} i={0} /><Post p={p} i={1} wide /></div>
        <div className="posts-row flip"><Post p={p} i={2} wide /><Post p={p} i={3} /></div>
      </div>
      <div className="posts-cta"><Ed path="cta" as="button" className="btn btn-primary" /></div>
    </div>
  )
}

/* ============================================================== partners */

export function Partners({ p }: { p: P; variant: string }) {
  return (
    <div className="container pad-sm partners">
      <Ed path="title" as="p" className="partners-title" />
      <div className="partners-row">
        {arr(p.logos).map((it, i) => <Logo key={i} base={`logos[${i}]`} it={it} className="lg" />)}
      </div>
    </div>
  )
}

/* ================================================================ footer */

export function PortalFooter({ p }: { p: P; variant: string }) {
  const legalLinks = arr(p.legalLinks)
  return (
    <div className="container pfoot">
      <div className="pfoot-top">
        <div className="pfoot-about">
          <Ed path="aboutTitle" as="h4" className="pfoot-h" />
          <Ed path="tagline" as="p" className="pfoot-text" multiline />
          <div className="pfoot-social">
            {arr(p.socials).map((_, i) => <Ico key={i} path={`socials[${i}].icon`} size={18} wrapper="pfoot-social-link" />)}
          </div>
        </div>
        {arr(p.columns).map((c, i) => (
          <div className="pfoot-col" key={i}>
            <Ed path={`columns[${i}].title`} as="h4" className="pfoot-h" />
            {arr(c.links).map((_, j) => (
              <Ed key={j} path={`columns[${i}].links[${j}].label`} as="a" className="pfoot-link" />
            ))}
          </div>
        ))}
      </div>
      <div className="pfoot-bottom">
        <Ed path="legal" className="pfoot-legal" />
        <span className="pfoot-rule" />
        <div className="pfoot-legal-links">
          {legalLinks.map((_, i) => (
            <span key={i}>
              {i > 0 && <span className="pfoot-sep"> · </span>}
              <Ed path={`legalLinks[${i}].label`} as="a" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================ references */

function Phone({ p, dark = false }: { p: P; dark?: boolean }) {
  return (
    <div className={`phone ${dark ? 'dark' : ''}`}>
      <span className="phone-notch" />
      <div className="phone-status">
        <span>9:41</span>
        <span className="phone-sig"><Ph_ name="CellSignalFull" size={11} weight="fill" /><Ph_ name="WifiHigh" size={11} weight="bold" /><Ph_ name="BatteryFull" size={13} weight="fill" /></span>
      </div>
      <div className="phone-hello">
        <span className="phone-av">{String(p.userName ?? 'D').slice(0, 1)}</span>
        <div><b>Hello {p.userName}!</b><span>Welcome back</span></div>
        <Ph_ name="Bell" size={13} />
      </div>
      <div className="phone-balance">
        <div className="phone-balance-top"><span>Your balance</span><Ph_ name="ArrowUpRight" size={12} /></div>
        <b>{p.balance}</b>
        <div className="phone-actions">
          {[['ArrowDown', 'Withdraw'], ['ArrowUp', 'Transfer'], ['PiggyBank', 'Invest'], ['CreditCard', 'Top up']].map(([icon, label]) => (
            <span key={label}><i><Ph_ name={icon} size={12} /></i>{label}</span>
          ))}
        </div>
      </div>
      <div className="phone-tx-title">Recent transactions</div>
      {arr(p.transactions).slice(0, 3).map((t, i) => (
        <div className="phone-tx" key={i}>
          <i><Ph_ name={t.icon} size={13} weight="fill" /></i>
          <span className="phone-tx-name"><b>{t.name}</b><span>{t.meta}</span></span>
          <span className="phone-tx-amt"><b>{t.amount}</b><span>{t.date}</span></span>
        </div>
      ))}
    </div>
  )
}

export function References({ p, variant }: { p: P; variant: string }) {
  if (variant === 'showcase') {
    return (
      <div className="container ref-show">
        <div className="ref-show-copy">
          <Ed path="title" as="h2" className="ct-title" multiline />
          <Ed path="sub" as="p" className="ct-sub" multiline />
          <Ed path="cta" as="button" className="btn btn-primary btn-pill" />
        </div>
        <div className="ref-stage">
          <div className="ref-steps">
            {arr(p.steps).map((_, i) => (
              <span key={i} className="ref-step-wrap">
                {i === 1 && <span className="ref-step-plus"><Ph_ name="Plus" size={11} weight="bold" /></span>}
                <Ed path={`steps[${i}].label`} className="ref-step" />
              </span>
            ))}
          </div>
          <div className="ref-code">
            <div className="ref-code-bar"><i /><i /><i /></div>
            <Code text={p.specCode} path="specCode" numbered={false} className="dark" />
          </div>
          <Phone p={p} dark />
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <div className="ref-banner">
        <div className="ref-banner-l surface surf-brand">
          <span className="ref-orb o1" /><span className="ref-orb o2" />
          <Ed path="title" as="h2" className="ref-banner-title" multiline />
          <div className="ref-banner-phone"><Phone p={p} /></div>
        </div>
        <div className="ref-banner-r tint">
          <Ed path="panelTitle" as="h3" className="ref-panel-title" />
          <Ed path="sub" as="p" className="ref-panel-body" multiline />
          <span className="ref-cta"><Ed path="cta" as="button" className="btn btn-primary" /></span>
        </div>
      </div>
    </div>
  )
}

/* =================================================================== faq */

export function PortalFaq({ p }: { p: P; variant: string }) {
  const [open, setOpen] = useState(1)
  return (
    <div className="container pad">
      <Head p={p} />
      <div className="fq">
        {arr(p.items).map((_, i) => {
          const on = open === i
          return (
            <div key={i} className={`fq-row ${on ? 'on' : ''}`} onClick={() => setOpen(on ? -1 : i)}>
              <span className="fq-n">{String(i + 1).padStart(2, '0')}</span>
              <div className="fq-body">
                <Ed path={`items[${i}].q`} as="h3" className="fq-q" multiline />
                {on && <Ed path={`items[${i}].a`} as="p" className="fq-a" multiline />}
              </div>
              <Ph_ name={on ? 'Minus' : 'Plus'} size={22} weight="light" className="fq-toggle" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
