import type { Section } from '../types'
import { Ph_ } from '../ui/Phosphor'
import { Btn, Ed, Ico, Pick, useSection } from '../canvas/Bits'
import {
  Awards, FeaturedApis, GettingStarted, Marketplace, Partners, PortalContact,
  PortalFaq, PortalFooter, PortalHero, PortalNav, References, Resources, Solution, WhyChooseUs,
} from './portal'

type P = Record<string, any>

/* ------------------------------------------------------- shared header */

function SecHead({ p, center = false }: { p: P; center?: boolean }) {
  return (
    <div className={`sec-head ${center ? 'center' : ''}`}>
      {p.showEyebrow && <Ed path="eyebrow" className="eyebrow" />}
      <Ed path="title" as="h2" className="h2" multiline />
      {p.sub !== undefined && (
        <Ed path="sub" as="p" className={`lead ${center ? 'measure-c' : 'measure'}`} multiline />
      )}
    </div>
  )
}

/* ================================================================== cta */

function CtaBody({ p, center }: { p: P; center: boolean }) {
  return (
    <>
      <Ed path="title" as="h2" className="h2" multiline />
      <Ed path="sub" as="p" className={`lead ${center ? 'measure-c' : 'measure'}`} multiline />
    </>
  )
}

function Cta({ p, variant }: { p: P; variant: string }) {
  const buttons = (
    <div className="btn-row">
      {p.showPrimary && <Btn path="primaryCta" kind="primary" />}
      {p.showSecondary && <Btn path="secondaryCta" kind="ghost" />}
    </div>
  )

  if (variant === 'split') {
    return (
      <div className="container pad">
        <div className="hero-split" style={{ gridTemplateColumns: '1.4fr auto' }}>
          <div className="stack" style={{ gap: 14 }}>
            <CtaBody p={p} center={false} />
          </div>
          {buttons}
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className="container pad">
        <div className="card surf-brand surface" style={{ padding: 56, textAlign: 'center' }}>
          <div className="stack center" style={{ gap: 16 }}>
            <CtaBody p={p} center />
            <div style={{ marginTop: 8 }}>{buttons}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <div className="stack center" style={{ gap: 16 }}>
        <CtaBody p={p} center />
        <div style={{ marginTop: 8 }}>{buttons}</div>
      </div>
    </div>
  )
}

/* ================================================================= auth */

function AuthForm({ p }: { p: P }) {
  const methods: any[] = p.methods ?? []
  return (
    <div className="auth-form">
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

      <div className="stack" style={{ gap: 8, marginTop: 28 }}>
        <Ed path="title" as="h1" className="h2" style={{ fontSize: '1.75rem' }} multiline />
        <Ed path="sub" as="p" className="body" multiline />
      </div>

      {p.showCredentials && (
        <div className="stack" style={{ gap: 14, marginTop: 26 }}>
          <div className="field">
            <Ed path="emailLabel" as="label" />
            <input className="input" placeholder={p.emailPlaceholder} readOnly />
          </div>
          {p.showPassword && (
            <div className="field">
              <Ed path="passwordLabel" as="label" />
              <input className="input" type="password" placeholder="••••••••" readOnly />
            </div>
          )}
          {p.showForgot && (
            <Ed path="forgotLabel" as="a" className="tiny" style={{ color: 'var(--accent)' }} />
          )}
          <Ed path="continueLabel" as="button" className="btn btn-primary" style={{ width: '100%' }} />
        </div>
      )}

      {methods.length > 0 && (
        <>
          {p.showCredentials && (
            <div className="auth-divider">
              <span />
              <Ed path="dividerLabel" className="tiny" />
              <span />
            </div>
          )}
          <div className="auth-methods">
            {methods.map((m, i) => (
              // Not a <button>: the icon and the label each need to be
              // separately clickable so either can open its own editor.
              <div
                key={i}
                className={`btn auth-method btn-${m.style === 'solid' ? 'primary' : m.style === 'ghost' ? 'link' : 'ghost'}`}
                style={{ width: m.wide === false ? 'auto' : '100%' }}
              >
                <Ico path={`methods[${i}].icon`} size={17} />
                <Ed path={`methods[${i}].label`} />
              </div>
            ))}
          </div>
        </>
      )}

      <div className="stack" style={{ gap: 10, marginTop: 26 }}>
        <div className="auth-switch">
          <Ed path="switchText" className="tiny" />
          <Ed path="switchLink" as="a" className="tiny" style={{ color: 'var(--accent)', fontWeight: 600 }} />
        </div>
        <Ed path="legal" as="p" className="tiny" multiline />
      </div>
    </div>
  )
}

function AuthArt({ p }: { p: P }) {
  const { props } = useSection()
  return (
    <div className="auth-art">
      <Pick path="image" className="auth-art-media">
        {props.image ? <img src={props.image} alt="" /> : <div className="auth-art-fallback" />}
      </Pick>
      {p.showArtCaption && (
        <div className="auth-art-caption">
          <Ed path="artTitle" as="h3" className="h3" />
          <Ed path="artBody" as="p" className="body" multiline />
        </div>
      )}
    </div>
  )
}

function Auth({ p, variant }: { p: P; variant: string }) {
  if (variant === 'centered') {
    return (
      <div className="auth-centered">
        <AuthArt p={p} />
        <div className="auth-centered-card">
          <AuthForm p={p} />
        </div>
      </div>
    )
  }
  const flip = variant === 'split-left'
  return (
    <div className={`auth-split ${flip ? 'flip' : ''}`}>
      <div className="auth-pane">
        <AuthForm p={p} />
      </div>
      <AuthArt p={p} />
    </div>
  )
}

/* ========================================================== signup form */

function FormField({ p, i }: { p: P; i: number }) {
  const f = (p.fields ?? [])[i] ?? {}
  const choices = String(f.options ?? '').split(',').map((s: string) => s.trim()).filter(Boolean)

  const control = () => {
    switch (f.type) {
      case 'textarea':
        return <textarea className="textarea" placeholder={f.placeholder} readOnly />
      case 'select':
        return (
          <select className="input" disabled defaultValue="">
            <option value="">{f.placeholder || 'Select…'}</option>
            {choices.map((c: string) => <option key={c}>{c}</option>)}
          </select>
        )
      case 'checkbox':
        return (
          <label className="check-row">
            <input type="checkbox" disabled />
            <Ed path={`fields[${i}].label`} />
          </label>
        )
      case 'radio':
        return (
          <div className="radio-row">
            {choices.map((c: string) => (
              <label className="check-row" key={c}>
                <input type="radio" disabled name={`r${i}`} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        )
      case 'number':
        return <input className="input" inputMode="numeric" placeholder={f.placeholder} readOnly />
      case 'date':
        return <input className="input" placeholder={f.placeholder || 'dd / mm / yyyy'} readOnly />
      default:
        return <input className="input" placeholder={f.placeholder} readOnly />
    }
  }

  return (
    <div className={`field ${f.wide ? 'wide' : ''}`}>
      {f.type !== 'checkbox' && (
        <label>
          <Ed path={`fields[${i}].label`} />
          {f.required && <span className="req"> *</span>}
        </label>
      )}
      {control()}
      {f.help ? <Ed path={`fields[${i}].help`} className="tiny" /> : null}
    </div>
  )
}

function SignupForm({ p, variant }: { p: P; variant: string }) {
  const fields: any[] = p.fields ?? []

  const form = (
    <>
      <div className="form-grid">
        {fields.map((_, i) => <FormField key={i} p={p} i={i} />)}
      </div>
      <div className="btn-row" style={{ marginTop: 22 }}>
        {p.showBack && <Ed path="backLabel" as="button" className="btn btn-ghost" />}
        <Ed path="submitLabel" as="button" className="btn btn-primary" />
      </div>
      {p.footnote ? <Ed path="footnote" as="p" className="tiny" style={{ marginTop: 14 }} multiline /> : null}
    </>
  )

  const head = (
    <div className="stack" style={{ gap: 10 }}>
      {p.showSteps && <Ed path="stepLabel" className="eyebrow" />}
      <Ed path="title" as="h1" className="h2" multiline />
      <Ed path="sub" as="p" className="lead" multiline />
    </div>
  )

  if (variant === 'split') {
    return (
      <div className="container pad">
        <div className="contact-split">
          {head}
          <div className="card">{form}</div>
        </div>
      </div>
    )
  }

  if (variant === 'plain') {
    return (
      <div className="container pad">
        <div style={{ maxWidth: 720 }}>
          {head}
          <div style={{ marginTop: 30 }}>{form}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <div className="signup-card">
        {head}
        <div style={{ marginTop: 28 }}>{form}</div>
      </div>
    </div>
  )
}

/* ============================================================ docs index */

function DocsIndex({ p, variant }: { p: P; variant: string }) {
  const groups: any[] = p.groups ?? []

  const search = p.showSearch ? (
    <div className="docs-search">
      <Ph_ name="MagnifyingGlass" size={17} />
      <input className="input" placeholder={p.searchPlaceholder} readOnly />
    </div>
  ) : null

  if (variant === 'sidebar') {
    return (
      <div className="container pad">
        <div className="docs-shell">
          <aside className="docs-rail">
            {groups.map((g, i) => (
              <div className="rail-group" key={i}>
                <Ed path={`groups[${i}].title`} as="h4" />
                {(g.links ?? []).map((_: any, j: number) => (
                  <Ed key={j} path={`groups[${i}].links[${j}].label`} as="a" className="rail-link" />
                ))}
              </div>
            ))}
          </aside>
          <div>
            <div className="sec-head">
              <Ed path="title" as="h2" className="h2" multiline />
              <Ed path="sub" as="p" className="lead" multiline />
              {search}
            </div>
            {groups.map((g, i) => (
              <div key={i} style={{ marginBottom: 34 }}>
                <div className="doc-group-head">
                  <Ico path={`groups[${i}].icon`} size={18} wrapper="iconbox" />
                  <div>
                    <Ed path={`groups[${i}].title`} as="h3" className="h3" />
                    <Ed path={`groups[${i}].desc`} as="p" className="tiny" multiline />
                  </div>
                </div>
                <div className="doc-rows">
                  {(g.links ?? []).map((_: any, j: number) => (
                    <div className="doc-row" key={j}>
                      <Ed path={`groups[${i}].links[${j}].label`} />
                      <Ed path={`groups[${i}].links[${j}].meta`} className="tiny" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="container pad">
        <div className="sec-head">
          <Ed path="title" as="h2" className="h2" multiline />
          <Ed path="sub" as="p" className="lead" multiline />
          {search}
        </div>
        {groups.map((g, i) => (
          <div key={i} style={{ marginBottom: 30 }}>
            <Ed path={`groups[${i}].title`} as="h3" className="h3" style={{ marginBottom: 10 }} />
            <div className="doc-rows">
              {(g.links ?? []).map((_: any, j: number) => (
                <div className="doc-row" key={j}>
                  <Ed path={`groups[${i}].links[${j}].label`} />
                  <Ed path={`groups[${i}].links[${j}].meta`} className="tiny" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="container pad">
      <div className="sec-head">
        <Ed path="title" as="h2" className="h2" multiline />
        <Ed path="sub" as="p" className="lead" multiline />
        {search}
      </div>
      <div className="grid g3">
        {groups.map((g, i) => (
          <div className="card stack" key={i} style={{ gap: 14, alignItems: 'flex-start' }}>
            <Ico path={`groups[${i}].icon`} size={19} wrapper="iconbox" />
            <div>
              <Ed path={`groups[${i}].title`} as="h3" className="h3" />
              <Ed path={`groups[${i}].desc`} as="p" className="tiny" style={{ marginTop: 4 }} multiline />
            </div>
            <div className="stack" style={{ gap: 9, width: '100%' }}>
              {(g.links ?? []).map((_: any, j: number) => (
                <div className="doc-link" key={j}>
                  <Ed path={`groups[${i}].links[${j}].label`} />
                  <Ph_ name="ArrowRight" size={14} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ========================================================= api reference */

function MethodBadge({ method }: { method: string }) {
  return <span className={`method m-${String(method).toLowerCase()}`}>{method}</span>
}

function EndpointRow({ p, gi, ei }: { p: P; gi: number; ei: number }) {
  const e = ((p.groups ?? [])[gi]?.endpoints ?? [])[ei] ?? {}
  return (
    <div className="endpoint">
      <Pick path={`groups[${gi}].endpoints[${ei}].method`}>
        <MethodBadge method={e.method ?? 'GET'} />
      </Pick>
      <Ed path={`groups[${gi}].endpoints[${ei}].path`} className="mono" />
      <Ed path={`groups[${gi}].endpoints[${ei}].summary`} className="tiny endpoint-summary" />
    </div>
  )
}

function ApiReference({ p, variant }: { p: P; variant: string }) {
  const groups: any[] = p.groups ?? []

  const head = (
    <div className="sec-head">
      <Ed path="title" as="h2" className="h2" multiline />
      <Ed path="sub" as="p" className="lead" multiline />
      {p.showBaseUrl && (
        <div className="baseurl">
          <span className="tiny">Base URL</span>
          <Ed path="baseUrl" className="mono" />
        </div>
      )}
    </div>
  )

  if (variant === 'grouped') {
    return (
      <div className="container pad">
        {head}
        <div className="grid g2">
          {groups.map((g, i) => (
            <div className="card" key={i}>
              <Ed path={`groups[${i}].title`} as="h3" className="h3" />
              <Ed path={`groups[${i}].desc`} as="p" className="tiny" style={{ marginTop: 4 }} multiline />
              <div className="endpoints" style={{ marginTop: 16 }}>
                {(g.endpoints ?? []).map((_: any, j: number) => (
                  <EndpointRow key={j} p={p} gi={i} ei={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div className="container pad">
        {head}
        <div className="endpoints">
          {groups.flatMap((g, i) =>
            (g.endpoints ?? []).map((_: any, j: number) => <EndpointRow key={`${i}-${j}`} p={p} gi={i} ei={j} />),
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <div className="docs-shell">
        <aside className="docs-rail">
          <Ed path="railTitle" as="h4" />
          {groups.map((g, i) => (
            <div className="rail-group" key={i}>
              <Ed path={`groups[${i}].title`} as="a" className="rail-link rail-link-strong" />
              {(g.endpoints ?? []).slice(0, 4).map((e: any, j: number) => (
                <span className="rail-endpoint" key={j}>
                  <MethodBadge method={e.method ?? 'GET'} />
                  <Ed path={`groups[${i}].endpoints[${j}].path`} className="mono" />
                </span>
              ))}
            </div>
          ))}
        </aside>
        <div>
          {head}
          {groups.map((g, i) => (
            <div key={i} style={{ marginBottom: 34 }}>
              <Ed path={`groups[${i}].title`} as="h3" className="h3" />
              <Ed path={`groups[${i}].desc`} as="p" className="tiny" style={{ marginTop: 4 }} multiline />
              <div className="endpoints" style={{ marginTop: 14 }}>
                {(g.endpoints ?? []).map((_: any, j: number) => (
                  <EndpointRow key={j} p={p} gi={i} ei={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================== recipes */

function RecipeCard({ p, i, big = false }: { p: P; i: number; big?: boolean }) {
  return (
    <div className={`card recipe ${big ? 'recipe-big' : ''}`}>
      <div className="recipe-head">
        <Ico path={`items[${i}].icon`} size={19} wrapper="iconbox" />
        <Ed path={`items[${i}].tag`} className="chip" />
      </div>
      <Ed path={`items[${i}].title`} as="h3" className={big ? 'h2' : 'h3'} style={big ? { fontSize: '1.7rem' } : undefined} />
      <Ed path={`items[${i}].desc`} as="p" className="body" multiline />
      <div className="recipe-foot">
        <Ed path={`items[${i}].meta`} className="tiny" />
        <span className="recipe-cta">
          <Ed path={`items[${i}].cta`} />
          <Ph_ name="ArrowRight" size={14} />
        </span>
      </div>
    </div>
  )
}

function Recipes({ p, variant }: { p: P; variant: string }) {
  const items: any[] = p.items ?? []

  if (variant === 'list') {
    return (
      <div className="container pad">
        <SecHead p={p} />
        <div className="stack" style={{ gap: 0 }}>
          {items.map((_, i) => (
            <div className="recipe-row" key={i}>
              <Ico path={`items[${i}].icon`} size={19} wrapper="iconbox" />
              <div style={{ flex: 1 }}>
                <Ed path={`items[${i}].title`} as="h3" className="h3" />
                <Ed path={`items[${i}].desc`} as="p" className="tiny" style={{ marginTop: 4 }} multiline />
              </div>
              <Ed path={`items[${i}].meta`} className="tiny" />
              <Ed path={`items[${i}].tag`} className="chip" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'featured' && items.length) {
    return (
      <div className="container pad">
        <SecHead p={p} center />
        <div style={{ marginBottom: 22 }}>
          <RecipeCard p={p} i={0} big />
        </div>
        <div className="grid g3">
          {items.slice(1).map((_, k) => <RecipeCard key={k + 1} p={p} i={k + 1} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="container pad">
      <SecHead p={p} center />
      <div className="grid g3">
        {items.map((_, i) => <RecipeCard key={i} p={p} i={i} />)}
      </div>
    </div>
  )
}

/* ================================================================ entry */

export function SectionBody({ section }: { section: Section }) {
  const p = section.props
  const v = section.variant
  switch (section.type) {
    case 'nav': return <PortalNav p={p} />
    case 'hero': return <PortalHero p={p} variant={v} />
    case 'awards': return <Awards p={p} variant={v} />
    case 'featuredApis': return <FeaturedApis p={p} variant={v} />
    case 'marketplace': return <Marketplace p={p} variant={v} />
    case 'gettingStarted': return <GettingStarted p={p} variant={v} />
    case 'solution': return <Solution p={p} variant={v} />
    case 'whyChooseUs': return <WhyChooseUs p={p} variant={v} />
    case 'contact': return <PortalContact p={p} variant={v} />
    case 'resources': return <Resources p={p} variant={v} />
    case 'partners': return <Partners p={p} variant={v} />
    case 'references': return <References p={p} variant={v} />
    case 'faq': return <PortalFaq p={p} variant={v} />
    case 'footer': return <PortalFooter p={p} variant={v} />
    case 'cta': return <Cta p={p} variant={v} />
    case 'auth': return <Auth p={p} variant={v} />
    case 'signupForm': return <SignupForm p={p} variant={v} />
    case 'docsIndex': return <DocsIndex p={p} variant={v} />
    case 'apiReference': return <ApiReference p={p} variant={v} />
    case 'recipes': return <Recipes p={p} variant={v} />
    default: return null
  }
}
