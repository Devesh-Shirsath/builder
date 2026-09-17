import { useState } from 'react'
import { useStore } from '../store'
import { Ph_ } from '../ui/Phosphor'
import { ENDPOINTS } from './referenceData'

interface Param {
  name: string
  type: string
  required?: boolean
  desc: string
  chips?: string[]
}

const HEADER_PARAMS: Param[] = [
  {
    name: 'X-Setu-Product-Instance-ID',
    type: 'string',
    required: true,
    desc: 'Unique product instance ID assigned during BBPS onboarding by Setu. Required for all API calls.',
    chips: ['format: uuid'],
  },
  {
    name: 'Authorization',
    type: 'string',
    required: true,
    desc: 'Bearer token for authenticating API requests. Obtain from /auth/token before calling this endpoint.',
    chips: ['format: jwt'],
  },
  {
    name: 'Content-Type',
    type: 'string',
    required: true,
    desc: 'MIME type of the request payload. Must be set to application/json for all API calls.',
  },
]

const BODY_PARAMS: Param[] = [
  {
    name: 'customerIdentifiers',
    type: 'array',
    required: true,
    desc: 'Array of customer identifier objects. Each object has attributeName (e.g. mobileNumber) and attributeValue matching the customer.',
  },
  {
    name: 'billerIds',
    type: 'array',
    required: true,
    desc: 'BBPS biller IDs identifying which biller(s) to fetch bills from, e.g. MAHA00000ELEC001.',
    chips: ['min: 1', 'max: 20'],
  },
  {
    name: 'fetchRequirement',
    type: 'string',
    required: true,
    desc: 'Specifies fetch type. BILLS returns all pending bills; PENDING_BILLS returns only overdue bills.',
    chips: ['enum: BILLS | PENDING_BILLS'],
  },
  {
    name: 'paymentInfo',
    type: 'object',
    desc: 'Optional payment context. Contains an info array of key-value pairs for payment metadata.',
  },
]

function ParamRow({ param }: { param: Param }) {
  return (
    <div className="param">
      <div className="param__head">
        <span className="param__name">{param.name}</span>
        <span className="param__type">{param.type}</span>
        {param.required && <span className="param__required">Required</span>}
      </div>
      <p className="param__desc">{param.desc}</p>
      {param.chips?.map((chip) => (
        <span key={chip} className="chip-fmt">{chip}</span>
      ))}
    </div>
  )
}

type Line = [kind: 'plain' | 'str' | 'key', text: string]

const REQUEST: Line[] = [
  ['plain', 'curl --location \\'],
  ['str', "  'https://sandbox.setu.co/api/v2/bbps/bills/fetch/request' \\"],
  ['plain', "  --header 'Content-Type: application/json' \\"],
  ['plain', "  --header 'X-Setu-Product-Instance-ID: \\"],
  ['str', "    prod-instance-xxxx-xxxx' \\"],
  ['plain', "  --header 'Authorization: Bearer \\"],
  ['str', "    eyJhbGciOiJIUzI1NiJ9...' \\"],
  ['plain', "  --data '{"],
  ['key', '    "customerIdentifiers": ['],
  ['plain', '      {'],
  ['key', '        "attributeName": "mobileNumber",'],
  ['str', '        "attributeValue": "9876543210"'],
  ['plain', '      }'],
  ['plain', '    ],'],
  ['key', '    "billerIds": ['],
  ['str', '      "MAHA00000ELEC001"'],
  ['plain', '    ],'],
  ['key', '    "fetchRequirement": "BILLS"'],
  ['plain', "  }'"],
]

const RESPONSE: Line[] = [
  ['plain', '{'],
  ['key', '  "status": 200,'],
  ['key', '  "success": true,'],
  ['key', '  "data": {'],
  ['key', '    "refId": '],
  ['str', '      "BBPS20240127001",'],
  ['key', '    "billerResponse": {'],
  ['str', '      "billDate": "2024-01-04",'],
  ['str', '      "billDueDate": "2024-01-27",'],
  ['key', '      "billAmount": 254900,'],
  ['str', '      "customerName": "A. Fernandes"'],
  ['plain', '    }'],
  ['plain', '  }'],
  ['plain', '}'],
]

function CodeBlock({
  title,
  lines,
  lang,
  status,
}: {
  title: string
  lines: Line[]
  lang?: string
  status?: string
}) {
  return (
    <div className="code">
      <div className="code__head">
        <span className="code__title">{title}</span>
        {status ? (
          <span className="code__status">
            <span className="code__dot is-ok" />
            {status}
          </span>
        ) : (
          <span className="code__actions">
            <button className="code__lang">
              {lang}
              <Ph_ name="CaretDown" size={11} />
            </button>
            <button className="code__icon" title="Copy"><Ph_ name="Copy" size={14} /></button>
            <button className="code__icon" title="Download"><Ph_ name="DownloadSimple" size={14} /></button>
          </span>
        )}
      </div>
      <div className="code__body">
        <div className="code__gutter">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <div className="code__lines">
          {lines.map(([kind, text], i) => (
            <div key={i} className={kind === 'plain' ? undefined : `code__${kind}`}>
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ReferenceDoc() {
  const appearance = useStore((s) => s.doc.theme.appearance)
  const endpointId = useStore((s) => s.endpointId)
  const [tab, setTab] = useState<'view' | 'tryout'>('view')

  const endpoint = ENDPOINTS[endpointId] ?? ENDPOINTS['cancel-payment']

  return (
    <div className="doc-root p-scroll" data-appearance={appearance}>
      <main className="doc">
        <div>
          <div className="crumbs">
            <span>Setu BillPay</span>
            <span className="crumbs__sep">›</span>
            <span>{endpoint.group}</span>
          </div>

          <h1 className="doc__title">{endpoint.label}</h1>
          <p className="doc__lede">{endpoint.lede}</p>

          <div className="endpoint">
            <span className={`method m-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span>
            <span className="endpoint__path">{endpoint.path}</span>
          </div>

          <div className="doc__toolbar">
            <button className="doc-btn"><Ph_ name="Copy" size={13} /> Copy Page</button>
            <button className="doc-btn"><Ph_ name="ArrowSquareOut" size={13} /> Open in Claude</button>
            <button className="doc-btn"><Ph_ name="DownloadSimple" size={13} /> Download</button>
            <span className="doc__toolbar-spacer" />
            <div className="segmented" role="group" aria-label="View mode">
              <button className="segmented__btn" aria-pressed={tab === 'view'} onClick={() => setTab('view')}>
                View
              </button>
              <button className="segmented__btn" aria-pressed={tab === 'tryout'} onClick={() => setTab('tryout')}>
                Tryout
              </button>
            </div>
          </div>

          <div className="doc-card">
            <div>
              <div className="doc-card__title">
                <Ph_ name="HardDrives" size={17} />
                Host
              </div>
              <div className="doc-card__sub">Select the host environment</div>
            </div>
            <button className="doc-select">
              <span>
                <span className="doc-select__value" style={{ display: 'block' }}>Sandbox</span>
                <span className="doc-select__hint">https://sandbox.setu.co</span>
              </span>
              <Ph_ name="CaretDown" size={14} />
            </button>
          </div>

          <div className="callout">
            <div className="callout__body">
              <strong>Note</strong> — sandbox bill fetches are simulated. Use biller ID{' '}
              <a className="doc-link" href="#">MAHA00000ELEC001</a> to receive a deterministic response.
            </div>
          </div>

          <section className="doc-section">
            <h2 className="doc-section__title">
              <span className="doc-section__icon"><Ph_ name="Diamond" size={16} weight="fill" /></span>
              Header Parameters
            </h2>
            <p className="doc-section__note">
              The domain name or IP address of the server that provides the API and receives client requests.
            </p>
            {HEADER_PARAMS.map((p) => <ParamRow key={p.name} param={p} />)}
          </section>

          <section className="doc-section">
            <h2 className="doc-section__title">
              <span className="doc-section__icon"><Ph_ name="Diamond" size={16} weight="fill" /></span>
              Request Body
            </h2>
            <p className="doc-section__note">
              Request body for initiating a BBPS bill fetch. customerIdentifiers, billerIds and
              fetchRequirement are required.
            </p>
            {BODY_PARAMS.map((p) => <ParamRow key={p.name} param={p} />)}
          </section>
        </div>

        <aside className="doc__aside">
          <CodeBlock title="Endpoint" lines={REQUEST} lang="Java" />
          <CodeBlock title="Response" lines={RESPONSE} status="200 OK" />
        </aside>
      </main>
    </div>
  )
}
