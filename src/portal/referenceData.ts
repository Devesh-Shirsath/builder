/**
 * The reference tree and endpoint content, matching the Framer reference
 * screen. Group/item names come from that design; the endpoint prose is
 * carried over from the dvsh prototype.
 */

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface Endpoint {
  id: string
  label: string
  group: string
  method: Method
  path: string
  lede: string
}

export interface TreeGroup {
  title: string
  /** Leading groups in the Figma tree are plain collapsible rows. */
  collapsible?: boolean
  items: { id: string; label: string; method?: Method }[]
}

const lede = (what: string) =>
  `${what} Returns bill details including amount due, due date and billing period. Required before initiating a bill payment transaction.`

export const TREE: TreeGroup[] = [
  {
    title: 'Path',
    items: [
      { id: 'fetch-bill-request', label: 'Fetch Bill Request' },
      { id: 'fetch-bill-status', label: 'Fetch Bill Status' },
      { id: 'fetch-biller-info', label: 'Fetch Biller Info' },
      { id: 'fetch-categories', label: 'Fetch Categories' },
    ],
  },
  {
    title: 'Payment',
    items: [
      { id: 'create-bill-payment', label: 'Create Bill Payment' },
      { id: 'validate-payment', label: 'Validate Payment', method: 'POST' },
      { id: 'check-payment-status', label: 'Check Payment Status', method: 'POST' },
      { id: 'cancel-payment', label: 'Cancel Payment', method: 'GET' },
      { id: 'transaction-report', label: 'Transaction Report', method: 'GET' },
      { id: 'refund-payment', label: 'Refund Payment', method: 'POST' },
    ],
  },
  {
    title: 'Biller',
    items: [
      { id: 'biller-search', label: 'Biller Search', method: 'GET' },
      { id: 'biller-details', label: 'Biller Details', method: 'GET' },
      { id: 'biller-categories', label: 'Biller Categories' },
      { id: 'biller-validation', label: 'Biller Validation', method: 'POST' },
      { id: 'biller-config', label: 'Biller Config', method: 'PUT' },
      { id: 'agent-biller-map', label: 'Agent Biller Map' },
    ],
  },
  {
    title: 'Report',
    items: [
      { id: 'transaction-history', label: 'Transaction History', method: 'GET' },
      { id: 'payment-report', label: 'Payment Report', method: 'GET' },
      { id: 'settlement-report', label: 'Settlement Report' },
      { id: 'dispute-report', label: 'Dispute Report', method: 'DELETE' },
      { id: 'agent-report', label: 'Agent Report' },
      { id: 'reconciliation', label: 'Reconciliation' },
    ],
  },
  {
    title: 'Heartbeat',
    items: [
      { id: 'health-check', label: 'Health Check', method: 'GET' },
      { id: 'service-status', label: 'Service Status', method: 'GET' },
      { id: 'ping', label: 'Ping' },
      { id: 'webhook-status', label: 'Webhook Status' },
      { id: 'bill-fetch-callback', label: 'Bill Fetch Callback', method: 'POST' },
    ],
  },
]

const PATHS: Record<string, string> = {
  'fetch-bill-request': '/api/v2/bbps/bills/fetch/request',
  'fetch-bill-status': '/api/v2/bbps/bills/fetch/status',
  'fetch-biller-info': '/api/v2/bbps/billers/{id}',
  'fetch-categories': '/api/v2/bbps/categories',
  'create-bill-payment': '/api/v2/bbps/payments',
  'validate-payment': '/api/v2/bbps/payments/validate',
  'check-payment-status': '/api/v2/bbps/payments/status',
  'cancel-payment': '/api/v2/bbps/payments/{id}/cancel',
  'transaction-report': '/api/v2/bbps/reports/transactions',
  'refund-payment': '/api/v2/bbps/payments/{id}/refund',
}

export const ENDPOINTS: Record<string, Endpoint> = Object.fromEntries(
  TREE.flatMap((group) =>
    group.items.map((item) => [
      item.id,
      {
        id: item.id,
        label: item.label,
        group: group.title === 'Path' ? 'BBPS' : group.title,
        method: item.method ?? 'GET',
        path: PATHS[item.id] ?? `/api/v2/bbps/${item.id.replace(/-/g, '/')}`,
        lede: lede(`Initiates a ${item.label.toLowerCase()} against a BBPS-registered biller.`),
      } satisfies Endpoint,
    ]),
  ),
)

/** The far-left icon rail, per the Figma. Customise opens the builder. */
export const RAIL: { id: string; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'Gauge' },
  { id: 'guides', label: 'Guides', icon: 'BookOpen' },
  { id: 'references', label: 'References', icon: 'CodeSimple' },
  { id: 'categories', label: 'Categories', icon: 'Graph' },
  { id: 'recipes', label: 'Recipes', icon: 'Cube' },
  { id: 'organisation', label: 'Organisation', icon: 'UsersThree' },
  { id: 'api-access', label: 'API Access', icon: 'SignIn' },
  { id: 'apps', label: 'Apps', icon: 'SquaresFour' },
  { id: 'customise', label: 'Customise', icon: 'Palette' },
]
