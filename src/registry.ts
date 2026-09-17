import type { SectionDef, SectionType, Section } from './types'
import { PORTAL_REGISTRY } from './registry.portal'

export const uid = () => Math.random().toString(36).slice(2, 9)

const link = (label: string) => ({ label, href: '#' })

/* Section types used by the guides, reference, recipes and sign-in pages. The
   marketing / home catalogue lives in registry.portal.ts. */
const BASE: Partial<Record<SectionType, SectionDef>> = {
  /* ------------------------------------------------------------------ cta */
  cta: {
    type: 'cta',
    label: 'Call to action',
    description: 'A closing nudge',
    icon: 'ArrowRight',
    defaultSurface: 'brand',
    variants: [
      { id: 'centered', label: 'Centered' },
      { id: 'split', label: 'Text and buttons' },
      { id: 'card', label: 'Inset card' },
    ],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Subtitle', multiline: true },
      { kind: 'toggle', path: 'showPrimary', label: 'Show primary button' },
      { kind: 'text', path: 'primaryCta', label: 'Primary button' },
      { kind: 'toggle', path: 'showSecondary', label: 'Show secondary button' },
      { kind: 'text', path: 'secondaryCta', label: 'Secondary button' },
    ],
    defaults: () => ({
      title: 'Start building this afternoon',
      sub: 'Fourteen days of everything, no card, no call with a rep.',
      showPrimary: true,
      primaryCta: 'Create a workspace',
      showSecondary: true,
      secondaryCta: 'Read the docs',
    }),
  },

  /* ----------------------------------------------------------------- auth */
  auth: {
    type: 'auth',
    label: 'Sign in',
    description: 'Credentials and providers beside product imagery',
    icon: 'SignIn',
    defaultSurface: 'page',
    variants: [
      { id: 'split-right', label: 'Form left, art right' },
      { id: 'split-left', label: 'Art left, form right' },
      { id: 'centered', label: 'Centered card' },
    ],
    fields: [
      { kind: 'text', path: 'logoText', label: 'Brand name' },
      { kind: 'image', path: 'logoImage', label: 'Logo' },
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Subtitle', multiline: true },

      { kind: 'divider', label: 'Credentials' },
      {
        kind: 'toggle', path: 'showCredentials', label: 'Email sign-in',
        children: [
          { kind: 'text', path: 'emailLabel', label: 'Email label' },
          { kind: 'text', path: 'emailPlaceholder', label: 'Email placeholder' },
          { kind: 'text', path: 'continueLabel', label: 'Continue button' },
        ],
      },
      {
        kind: 'toggle', path: 'showPassword', label: 'Password field',
        children: [{ kind: 'text', path: 'passwordLabel', label: 'Password label' }],
      },
      {
        kind: 'toggle', path: 'showForgot', label: 'Forgot password link',
        children: [
          { kind: 'text', path: 'forgotLabel', label: 'Link text' },
          { kind: 'text', path: 'forgotHref', label: 'Link', placeholder: 'https:// or /path' },
        ],
      },

      { kind: 'divider', label: 'Other ways to sign in' },
      { kind: 'text', path: 'dividerLabel', label: 'Divider label' },
      {
        kind: 'list', path: 'methods', label: 'Providers', itemTitle: 'label',
        addLabel: 'Add provider',
        itemFields: [
          { kind: 'text', path: 'label', label: 'Button label' },
          { kind: 'icon', path: 'icon', label: 'Icon' },
          {
            kind: 'select', path: 'style', label: 'Style', options: [
              { value: 'outline', label: 'Outlined' },
              { value: 'solid', label: 'Solid' },
              { value: 'ghost', label: 'Text only' },
            ],
          },
          { kind: 'toggle', path: 'wide', label: 'Full width' },
        ],
        // Premade options so an admin adds "Sign in with GitHub" in one click.
        presets: [
          { label: 'Google', make: () => ({ label: 'Continue with Google', icon: 'GoogleLogo', style: 'outline', wide: true }) },
          { label: 'GitHub', make: () => ({ label: 'Continue with GitHub', icon: 'GithubLogo', style: 'outline', wide: true }) },
          { label: 'Microsoft', make: () => ({ label: 'Continue with Microsoft', icon: 'MicrosoftOutlookLogo', style: 'outline', wide: true }) },
          { label: 'GitLab', make: () => ({ label: 'Continue with GitLab', icon: 'GitlabLogo', style: 'outline', wide: true }) },
          { label: 'SAML SSO', hint: 'Enterprise identity provider', make: () => ({ label: 'Single sign-on (SAML)', icon: 'Buildings', style: 'outline', wide: true }) },
          { label: 'Okta', make: () => ({ label: 'Continue with Okta', icon: 'ShieldCheck', style: 'outline', wide: true }) },
          { label: 'Magic link', hint: 'Passwordless email', make: () => ({ label: 'Email me a magic link', icon: 'MagicWand', style: 'outline', wide: true }) },
          { label: 'API key', hint: 'For machine clients', make: () => ({ label: 'Sign in with API key', icon: 'Key', style: 'outline', wide: true }) },
          { label: 'LDAP', make: () => ({ label: 'Continue with LDAP', icon: 'TreeStructure', style: 'outline', wide: true }) },
          { label: 'Blank', hint: 'Start from scratch', make: () => ({ label: 'Continue with…', icon: 'Plugs', style: 'outline', wide: true }) },
        ],
        template: () => ({ label: 'Continue with…', icon: 'Plugs', style: 'outline', wide: true }),
      },

      { kind: 'divider', label: 'Footer' },
      { kind: 'text', path: 'legal', label: 'Legal line', multiline: true },
      { kind: 'text', path: 'switchText', label: 'Switch prompt' },
      { kind: 'text', path: 'switchLink', label: 'Switch link text' },
      { kind: 'text', path: 'switchLinkHref', label: 'Switch link', placeholder: 'https:// or /path' },

      { kind: 'divider', label: 'Artwork' },
      { kind: 'image', path: 'image', label: 'Product image' },
      {
        kind: 'toggle', path: 'showArtCaption', label: 'Artwork caption',
        children: [
          { kind: 'text', path: 'artTitle', label: 'Caption' },
          { kind: 'text', path: 'artBody', label: 'Body', multiline: true },
        ],
      },
    ],
    defaults: () => ({
      logoText: 'Northwind',
      logoIcon: 'Sparkle',
      title: 'Sign in to the developer portal',
      sub: 'Use your work account to get your API keys and sandbox access.',
      showCredentials: true,
      emailLabel: 'Work email',
      emailPlaceholder: 'you@company.com',
      showPassword: false,
      passwordLabel: 'Password',
      continueLabel: 'Continue',
      showForgot: false,
      forgotLabel: 'Forgot your password?',
      dividerLabel: 'or continue with',
      methods: [
        { label: 'Continue with Google', icon: 'GoogleLogo', style: 'outline', wide: true },
        { label: 'Continue with GitHub', icon: 'GithubLogo', style: 'outline', wide: true },
        { label: 'Single sign-on (SAML)', icon: 'Buildings', style: 'outline', wide: true },
      ],
      legal: 'By continuing you agree to the Terms of Service and Privacy Policy.',
      switchText: 'Don’t have an account?',
      switchLink: 'Request access',
      image: '',
      artTitle: 'Ship your first call in minutes',
      artBody: 'Sandbox keys, ready-made recipes and a reference you can actually search.',
      showArtCaption: true,
    }),
  },

  /* ----------------------------------------------------------- signupForm */
  signupForm: {
    type: 'signupForm',
    label: 'Sign-up form',
    description: 'Step two — the custom fields collected after Continue',
    icon: 'ListChecks',
    defaultSurface: 'page',
    variants: [
      { id: 'card', label: 'Centered card' },
      { id: 'split', label: 'Copy beside form' },
      { id: 'plain', label: 'Plain, full width' },
    ],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Subtitle', multiline: true },
      {
        kind: 'toggle', path: 'showSteps', label: 'Step indicator',
        children: [{ kind: 'text', path: 'stepLabel', label: 'Step label' }],
      },
      { kind: 'divider', label: 'Fields' },
      {
        kind: 'list', path: 'fields', label: 'Form fields', itemTitle: 'label',
        addLabel: 'Add field',
        itemFields: [
          { kind: 'text', path: 'label', label: 'Label' },
          { kind: 'text', path: 'placeholder', label: 'Placeholder' },
          {
            kind: 'select', path: 'type', label: 'Type', options: [
              { value: 'text', label: 'Single line' },
              { value: 'email', label: 'Email' },
              { value: 'textarea', label: 'Paragraph' },
              { value: 'select', label: 'Dropdown' },
              { value: 'checkbox', label: 'Checkbox' },
              { value: 'radio', label: 'Radio group' },
              { value: 'number', label: 'Number' },
              { value: 'date', label: 'Date' },
            ],
          },
          { kind: 'text', path: 'options', label: 'Choices (comma separated)' },
          { kind: 'text', path: 'help', label: 'Helper text' },
          { kind: 'toggle', path: 'required', label: 'Required' },
          { kind: 'toggle', path: 'wide', label: 'Full width' },
        ],
        presets: [
          { label: 'Full name', make: () => ({ label: 'Full name', placeholder: 'Ada Lovelace', type: 'text', options: '', help: '', required: true, wide: false }) },
          { label: 'Work email', make: () => ({ label: 'Work email', placeholder: 'you@company.com', type: 'email', options: '', help: '', required: true, wide: false }) },
          { label: 'Company', make: () => ({ label: 'Company', placeholder: 'Acme Inc.', type: 'text', options: '', help: '', required: false, wide: false }) },
          { label: 'Role dropdown', make: () => ({ label: 'Your role', placeholder: 'Select a role', type: 'select', options: 'Developer, Architect, Product manager, Other', help: '', required: true, wide: false }) },
          { label: 'Use case', make: () => ({ label: 'What are you building?', placeholder: 'A couple of sentences is plenty.', type: 'textarea', options: '', help: '', required: false, wide: true }) },
          { label: 'Expected volume', make: () => ({ label: 'Expected monthly calls', placeholder: '10000', type: 'number', options: '', help: 'A rough estimate is fine.', required: false, wide: false }) },
          { label: 'Terms checkbox', make: () => ({ label: 'I agree to the API terms of use', placeholder: '', type: 'checkbox', options: '', help: '', required: true, wide: true }) },
          { label: 'Environment radio', make: () => ({ label: 'Which environment?', placeholder: '', type: 'radio', options: 'Sandbox, Production', help: '', required: true, wide: true }) },
          { label: 'Blank field', make: () => ({ label: 'New field', placeholder: '', type: 'text', options: '', help: '', required: false, wide: false }) },
        ],
        template: () => ({ label: 'New field', placeholder: '', type: 'text', options: '', help: '', required: false, wide: false }),
      },
      { kind: 'divider', label: 'Actions' },
      { kind: 'text', path: 'submitLabel', label: 'Submit button' },
      {
        kind: 'toggle', path: 'showBack', label: 'Back button',
        children: [{ kind: 'text', path: 'backLabel', label: 'Label' }],
      },
      { kind: 'text', path: 'footnote', label: 'Footnote', multiline: true },
    ],
    defaults: () => ({
      title: 'Tell us about your integration',
      sub: 'This helps us pick the right rate limits and sandbox data for you.',
      showSteps: true,
      stepLabel: 'Step 2 of 2',
      fields: [
        { label: 'Full name', placeholder: 'Ada Lovelace', type: 'text', options: '', help: '', required: true, wide: false },
        { label: 'Company', placeholder: 'Acme Inc.', type: 'text', options: '', help: '', required: true, wide: false },
        { label: 'Your role', placeholder: 'Select a role', type: 'select', options: 'Developer, Architect, Product manager, Other', help: '', required: true, wide: false },
        { label: 'Expected monthly calls', placeholder: '10000', type: 'number', options: '', help: 'A rough estimate is fine.', required: false, wide: false },
        { label: 'What are you building?', placeholder: 'A couple of sentences is plenty.', type: 'textarea', options: '', help: '', required: false, wide: true },
        { label: 'I agree to the API terms of use', placeholder: '', type: 'checkbox', options: '', help: '', required: true, wide: true },
      ],
      submitLabel: 'Create account',
      showBack: true,
      backLabel: 'Back',
      footnote: 'You can change any of this later in workspace settings.',
    }),
  },

  /* ------------------------------------------------------------ docsIndex */
  docsIndex: {
    type: 'docsIndex',
    label: 'Guides index',
    description: 'Categories and articles for the guides page',
    icon: 'BookOpen',
    defaultSurface: 'page',
    variants: [
      { id: 'cards', label: 'Category cards' },
      { id: 'sidebar', label: 'Sidebar and list' },
      { id: 'list', label: 'Plain list' },
    ],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Subtitle', multiline: true },
      { kind: 'toggle', path: 'showSearch', label: 'Show search box' },
      { kind: 'text', path: 'searchPlaceholder', label: 'Search placeholder' },
      {
        kind: 'list', path: 'groups', label: 'Categories', itemTitle: 'title',
        addLabel: 'Add category',
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'desc', label: 'Description', multiline: true },
          {
            kind: 'list', path: 'links', label: 'Articles', itemTitle: 'label', addLabel: 'Add article',
            itemFields: [
              { kind: 'text', path: 'label', label: 'Title' },
              { kind: 'text', path: 'meta', label: 'Meta (read time, tag)' },
            ],
            template: () => ({ label: 'New article', meta: '3 min' }),
          },
        ],
        template: () => ({ icon: 'BookOpen', title: 'New category', desc: 'What this group covers.', links: [{ label: 'New article', meta: '3 min' }] }),
      },
    ],
    defaults: () => ({
      title: 'Guides',
      sub: 'Task-shaped walkthroughs, from your first call to production rollout.',
      showSearch: true,
      searchPlaceholder: 'Search the guides…',
      groups: [
        {
          icon: 'Rocket', title: 'Getting started', desc: 'Go from zero to a working call.',
          links: [
            { label: 'Create your first API key', meta: '3 min' },
            { label: 'Make an authenticated request', meta: '5 min' },
            { label: 'Understand the sandbox', meta: '4 min' },
          ],
        },
        {
          icon: 'Key', title: 'Authentication', desc: 'Keys, OAuth and rotating secrets.',
          links: [
            { label: 'OAuth 2.0 authorisation code flow', meta: '8 min' },
            { label: 'Rotate a key without downtime', meta: '4 min' },
            { label: 'Scopes and permissions', meta: '6 min' },
          ],
        },
        {
          icon: 'Webhooks', title: 'Webhooks', desc: 'Receive events reliably.',
          links: [
            { label: 'Register an endpoint', meta: '3 min' },
            { label: 'Verify signatures', meta: '5 min' },
            { label: 'Replay failed deliveries', meta: '4 min' },
          ],
        },
      ],
    }),
  },

  /* --------------------------------------------------------- apiReference */
  apiReference: {
    type: 'apiReference',
    label: 'API reference',
    description: 'Endpoint list with a navigation rail',
    icon: 'Code',
    defaultSurface: 'page',
    variants: [
      { id: 'sidebar', label: 'Rail and endpoints' },
      { id: 'grouped', label: 'Grouped cards' },
      { id: 'list', label: 'Flat list' },
    ],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Subtitle', multiline: true },
      { kind: 'text', path: 'baseUrl', label: 'Base URL' },
      { kind: 'toggle', path: 'showBaseUrl', label: 'Show base URL' },
      { kind: 'text', path: 'railTitle', label: 'Rail heading' },
      {
        kind: 'list', path: 'groups', label: 'Resources', itemTitle: 'title',
        addLabel: 'Add resource',
        itemFields: [
          { kind: 'text', path: 'title', label: 'Resource name' },
          { kind: 'text', path: 'desc', label: 'Description', multiline: true },
          {
            kind: 'list', path: 'endpoints', label: 'Endpoints', itemTitle: 'path', addLabel: 'Add endpoint',
            itemFields: [
              {
                kind: 'select', path: 'method', label: 'Method', options: [
                  { value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' }, { value: 'PATCH', label: 'PATCH' },
                  { value: 'DELETE', label: 'DELETE' },
                ],
              },
              { kind: 'text', path: 'path', label: 'Path' },
              { kind: 'text', path: 'summary', label: 'Summary' },
            ],
            template: () => ({ method: 'GET', path: '/v1/resource', summary: 'Describe the endpoint.' }),
          },
        ],
        template: () => ({ title: 'New resource', desc: '', endpoints: [{ method: 'GET', path: '/v1/resource', summary: 'Describe the endpoint.' }] }),
      },
    ],
    defaults: () => ({
      title: 'API reference',
      sub: 'Every endpoint, its parameters and a copyable example.',
      baseUrl: 'https://api.northwind.co',
      showBaseUrl: true,
      railTitle: 'Resources',
      groups: [
        {
          title: 'Customers', desc: 'Create and manage customer records.',
          endpoints: [
            { method: 'GET', path: '/v1/customers', summary: 'List customers' },
            { method: 'POST', path: '/v1/customers', summary: 'Create a customer' },
            { method: 'GET', path: '/v1/customers/{id}', summary: 'Retrieve a customer' },
            { method: 'DELETE', path: '/v1/customers/{id}', summary: 'Delete a customer' },
          ],
        },
        {
          title: 'Payments', desc: 'Charge, refund and reconcile.',
          endpoints: [
            { method: 'POST', path: '/v1/payments', summary: 'Create a payment' },
            { method: 'POST', path: '/v1/payments/{id}/refund', summary: 'Refund a payment' },
            { method: 'GET', path: '/v1/payments', summary: 'List payments' },
          ],
        },
        {
          title: 'Webhooks', desc: 'Subscribe to platform events.',
          endpoints: [
            { method: 'GET', path: '/v1/webhooks', summary: 'List endpoints' },
            { method: 'POST', path: '/v1/webhooks', summary: 'Register an endpoint' },
          ],
        },
      ],
    }),
  },

  /* -------------------------------------------------------------- recipes */
  recipes: {
    type: 'recipes',
    label: 'Product recipes',
    description: 'Copy-paste solutions to common jobs',
    icon: 'CookingPot',
    defaultSurface: 'page',
    variants: [
      { id: 'grid', label: 'Recipe cards' },
      { id: 'featured', label: 'Featured plus grid' },
      { id: 'list', label: 'Detailed list' },
    ],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Subtitle', multiline: true },
      {
        kind: 'list', path: 'items', label: 'Recipes', itemTitle: 'title',
        addLabel: 'Add recipe',
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'desc', label: 'Description', multiline: true },
          { kind: 'text', path: 'tag', label: 'Tag' },
          { kind: 'text', path: 'meta', label: 'Meta (time, language)' },
          { kind: 'text', path: 'cta', label: 'Link label' },
        ],
        template: () => ({ icon: 'Code', title: 'New recipe', desc: 'What this recipe solves.', tag: 'General', meta: '5 min', cta: 'View recipe' }),
      },
    ],
    defaults: () => ({
      title: 'Product recipes',
      sub: 'Short, complete solutions you can lift straight into your codebase.',
      items: [
        { icon: 'CreditCard', title: 'Take a first payment', desc: 'Tokenise a card, charge it and handle the failure cases properly.', tag: 'Payments', meta: '12 min · Node', cta: 'View recipe' },
        { icon: 'ArrowsClockwise', title: 'Sync customers nightly', desc: 'A resumable batch job using cursors and idempotency keys.', tag: 'Customers', meta: '15 min · Python', cta: 'View recipe' },
        { icon: 'Webhooks', title: 'Verify webhook signatures', desc: 'Validate the signing header and reject replays safely.', tag: 'Webhooks', meta: '8 min · Go', cta: 'View recipe' },
        { icon: 'ShieldCheck', title: 'Rotate keys with zero downtime', desc: 'Overlap two live keys, migrate traffic, then revoke.', tag: 'Security', meta: '10 min · Any', cta: 'View recipe' },
        { icon: 'Gauge', title: 'Handle rate limits gracefully', desc: 'Read the headers and back off without dropping work.', tag: 'Reliability', meta: '7 min · Node', cta: 'View recipe' },
        { icon: 'Bug', title: 'Debug a failed request', desc: 'Trace a request id from your logs to ours.', tag: 'Support', meta: '6 min · Any', cta: 'View recipe' },
      ],
    }),
  },
}

export const REGISTRY = { ...BASE, ...PORTAL_REGISTRY } as Record<SectionType, SectionDef>

export function createSection(type: SectionType, variant?: string): Section {
  const def = REGISTRY[type]
  const v = def.variants.find((x) => x.id === variant) ?? def.variants[0]
  return {
    id: uid(),
    type,
    variant: v.id,
    surface: v.surface ?? def.defaultSurface,
    props: def.defaults(),
  }
}
