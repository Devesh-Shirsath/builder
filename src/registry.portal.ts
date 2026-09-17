import type { Field, SectionDef, SectionType } from './types'

/* The developer-portal section catalogue, one entry per row of the Figma
   (Common Template Layout Variants). Variant ids are stable — saved documents
   refer to them. `surface` on a variant is the background it was designed on;
   switching to that layout applies it. */

const link = (label: string) => ({ label, href: '#' })

/* The eyebrow's switch heads the field it governs. */
const eyebrow: Field[] = [
  { kind: 'toggle', path: 'showEyebrow', label: 'Eyebrow tag', children: [{ kind: 'text', path: 'eyebrow', label: 'Tag text' }] },
]
const heading: Field[] = [
  ...eyebrow,
  { kind: 'text', path: 'title', label: 'Title', multiline: true },
  { kind: 'text', path: 'sub', label: 'Description', multiline: true },
]

const buttonFields = (path: string): Field[] => [
  { kind: 'text', path, label: 'Label' },
  { kind: 'text', path: `${path}Href`, label: 'Link', placeholder: 'https:// or /path' },
]
/** A button: its label and where it goes, grouped. */
const button = (path: string, label: string): Field => ({ kind: 'group', label, children: buttonFields(path) })
/** A button the admin can switch off. */
const optionalButton = (toggle: string, path: string, label: string): Field => ({
  kind: 'toggle', path: toggle, label, children: buttonFields(path),
})

const logoList = (path: string, label: string): Field => ({
  kind: 'list', path, label, itemTitle: 'name', addLabel: 'Add logo',
  itemFields: [
    { kind: 'text', path: 'name', label: 'Name' },
    { kind: 'image', path: 'image', label: 'Logo' },
  ],
  template: () => ({ name: 'Company', icon: 'Circle', image: '' }),
})

const PARTNERS = [
  { name: 'Meridian', icon: 'Globe', image: '' },
  { name: 'Payvault', icon: 'Vault', image: '' },
  { name: 'Ledgerly', icon: 'Stack', image: '' },
  { name: 'Coreline', icon: 'Hexagon', image: '' },
]

const industries = () => [
  { icon: 'CreditCard', name: 'Payment gateways', tagline: 'Accept, move & settle funds in real time', headline: 'Accept, move & settle funds in real time', body: 'Our payment APIs handle the full money-movement lifecycle — collections, transfers, disbursements and real-time notifications — so your product can go live without building banking infrastructure from scratch.' },
  { icon: 'HandCoins', name: 'Lending companies', tagline: 'Accelerate credit decisions & disbursements', headline: 'Decide and disburse credit in minutes', body: 'Score applicants, originate loans and disburse funds straight to a borrower’s account, with repayments reconciled automatically.' },
  { icon: 'Truck', name: 'Logistics', tagline: 'Automate COD collections & driver payouts', headline: 'Collect on delivery, pay drivers the same day', body: 'Reconcile cash-on-delivery collections and push instant payouts to driver wallets as each route closes.' },
  { icon: 'ShoppingCart', name: 'E-commerce', tagline: 'Power checkouts, refunds & recurring billing', headline: 'Checkouts, refunds and subscriptions in one stack', body: 'Offer every local payment method at checkout, refund in a single call and run recurring billing without a separate provider.' },
  { icon: 'Umbrella', name: 'Insurance', tagline: 'Streamline premium collection & claims payouts', headline: 'Collect premiums and settle claims faster', body: 'Automate premium debits and send approved claims payouts in real time, with a full audit trail for every movement.' },
]

const recipes = () => [
  { title: 'Send funds via local transfer', body: 'Real-time fund movement with automated webhook transaction updates.', cta: 'Explore recipe' },
  { title: 'QR code collections', body: 'Dynamic QR generation for seamless in-store and online payment flows.', cta: 'Explore recipe' },
  { title: 'Settlement reports', body: 'Automated end-of-day settlement summaries and reconciliation exports.', cta: 'Explore recipe' },
  { title: 'Bulk payout automation', body: 'Automate vendor, employee and partner payouts at scale.', cta: 'Explore recipe' },
]

export const PORTAL_REGISTRY: Partial<Record<SectionType, SectionDef>> = {
  /* ------------------------------------------------------------------ nav */
  nav: {
    type: 'nav',
    label: 'Navigation Bar',
    description: 'Logo, product links and sign-in actions',
    icon: 'Layout',
    defaultSurface: 'muted',
    variants: [{ id: 'portal', label: 'Centered links' }],
    fields: [
      { kind: 'text', path: 'logoText', label: 'Brand name' },
      { kind: 'image', path: 'logoImage', label: 'Logo' },
      { kind: 'divider', label: 'Links' },
      {
        kind: 'list', path: 'links', label: 'Nav links', itemTitle: 'label', addLabel: 'Add link', max: 7,
        itemFields: [
          { kind: 'text', path: 'label', label: 'Label' },
          { kind: 'text', path: 'href', label: 'Link' },
        ],
        template: () => link('New link'),
      },
      { kind: 'divider', label: 'Actions' },
      optionalButton('showSecondary', 'secondaryLabel', 'Login link'),
      optionalButton('showCta', 'ctaLabel', 'Sign-up button'),
    ],
    defaults: () => ({
      logoText: 'Northwind',
      logoIcon: 'Sparkle',
      links: [link('API Products'), link('Solutions'), link('Get Started'), link('References'), link('About Us'), link('Book a Meeting')],
      showSecondary: true,
      secondaryLabel: 'Login',
      secondaryLabelHref: '/login',
      showCta: true,
      ctaLabel: 'Sign Up',
      ctaLabelHref: '/signup',
    }),
  },

  /* ----------------------------------------------------------------- hero */
  hero: {
    type: 'hero',
    label: 'Hero',
    description: 'The opening statement of the portal',
    icon: 'AppWindow',
    defaultSurface: 'brand',
    variants: [
      { id: 'split', label: 'Split with artwork', surface: 'brand' },
      { id: 'centered', label: 'Centered with product', surface: 'page' },
    ],
    fields: [
      ...eyebrow,
      { kind: 'text', path: 'headline', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Description', multiline: true },
      { kind: 'divider', label: 'Buttons' },
      optionalButton('showPrimary', 'primaryCta', 'Primary button'),
      optionalButton('showSecondary', 'secondaryCta', 'Secondary button'),
      { kind: 'divider', label: 'Artwork' },
      { kind: 'image', path: 'image', label: 'Image' },
      { kind: 'text', path: 'productName', label: 'Product name in the artwork' },
      { kind: 'divider', label: 'Logos' },
      {
        kind: 'toggle', path: 'showLogos', label: 'Partner logos',
        children: [
          { kind: 'text', path: 'logoHeading', label: 'Heading' },
          logoList('logos', 'Logos'),
        ],
      },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Developer Platform',
      headline: 'Build the Future of Embedded Banking',
      sub: 'Discover, assemble and operate embedded banking solutions — from payments and accounts to lending and beyond — through secure, modular APIs.',
      showPrimary: true,
      primaryCta: 'View Documentation',
      showSecondary: true,
      secondaryCta: 'Book a Meeting',
      image: '',
      productName: 'Northwind',
      showLogos: true,
      logoHeading: 'Our Proud Partners',
      logos: PARTNERS.map((l) => ({ ...l })),
    }),
  },

  /* --------------------------------------------------------------- awards */
  awards: {
    type: 'awards',
    label: 'Awards & Recognition',
    description: 'Awards, publications and industry recognition',
    icon: 'Medal',
    defaultSurface: 'page',
    variants: [
      { id: 'spotlight', label: 'Spotlight with award list', surface: 'page' },
      { id: 'cards', label: 'Highlight cards', surface: 'muted' },
      { id: 'table', label: 'Cards with award table', surface: 'page' },
    ],
    fields: [
      ...heading,
      { kind: 'image', path: 'image', label: 'Image (spotlight)' },
      logoList('logos', 'Publication logos'),
      { kind: 'divider', label: 'Award list' },
      { kind: 'text', path: 'listTitle', label: 'List title' },
      {
        kind: 'list', path: 'awards', label: 'Awards', itemTitle: 'name', addLabel: 'Add award',
        itemFields: [
          { kind: 'text', path: 'year', label: 'Award year' },
          { kind: 'text', path: 'name', label: 'Award name' },
          { kind: 'text', path: 'org', label: 'Award category / body' },
          { kind: 'text', path: 'link', label: 'Award link' },
        ],
        template: () => ({ year: '2026', name: 'New award', org: 'Awarding body', link: '#' }),
      },
      { kind: 'divider', label: 'Highlights' },
      {
        kind: 'list', path: 'highlights', label: 'Highlight cards', itemTitle: 'title', addLabel: 'Add highlight', max: 4,
        itemFields: [
          { kind: 'text', path: 'category', label: 'Category' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
          { kind: 'text', path: 'org', label: 'Awarded by' },
          { kind: 'text', path: 'orgDetail', label: 'Award programme' },
          { kind: 'image', path: 'image', label: 'Image' },
        ],
        template: () => ({ category: 'Category', title: 'New highlight', body: 'Describe the recognition.', org: '', orgDetail: '', image: '' }),
      },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Awards & Recognition',
      title: 'Awards & Recognition',
      sub: 'Global banking experts recognised Northwind for excellence in digital banking.',
      image: '',
      logos: [
        { name: 'Global Banking Review', icon: 'Globe', image: '' },
        { name: 'FinTech Awards', icon: 'Trophy', image: '' },
        { name: 'The Digital Banker', icon: 'Bank', image: '' },
        { name: 'Asia Finance', icon: 'ChartLineUp', image: '' },
      ],
      listTitle: 'Awards',
      awards: [
        { year: '2026', name: 'Best Mobile Banking App', org: 'Global Banking Review', link: '#' },
        { year: '2026', name: 'Best Bank for SMEs', org: 'FinTech Awards', link: '#' },
        { year: '2026', name: 'Most Innovative Use of AI in Banking', org: 'Asia Finance', link: '#' },
        { year: '2025', name: 'Best Digital Bank', org: 'The Digital Banker', link: '#' },
        { year: '2025', name: 'Best Online Payments Solution', org: 'Global Banking Review', link: '#' },
        { year: '2025', name: 'Best Information Security & Fraud Management', org: 'FinTech Awards', link: '#' },
        { year: '2025', name: 'Best Digital-Only Bank (Consumer)', org: 'Asia Finance', link: '#' },
        { year: '2025', name: 'Best in Transformation', org: 'Global Banking Review', link: '#' },
        { year: '2024', name: 'Banking Excellence Award', org: 'The Digital Banker', link: '#' },
        { year: '2024', name: 'Best Digital Bank in the Region', org: 'FinTech Awards', link: '#' },
      ],
      highlights: [
        { category: 'Launch regulated services faster', title: 'Faster Market Expansion', body: 'Use our licensed banking infrastructure to enter new financial use cases quickly while reducing compliance overhead and time to market.', org: '', orgDetail: '', image: '' },
        { category: 'Digital excellence', title: 'Best Bank for Digital', body: 'Recognised as the best bank for digital, marking our leadership in banking innovation and inclusive technology.', org: 'Global Banking Review', orgDetail: 'Awards for Excellence 2026', image: '' },
        { category: 'Innovation & SME focus', title: 'Best SME Product of the Year', body: 'Our business bundle won at the Retail Banking Innovation Awards for excellence in SME-focused integrated financial solutions.', org: 'By The Digital Banker', orgDetail: 'Retail Banking Innovation Awards 2026', image: '' },
        { category: 'Handle volume without friction', title: 'Scalable Transaction Growth', body: 'Integrate high-throughput banking services to support growing transaction volumes and scale with confidence.', org: '', orgDetail: '', image: '' },
      ],
    }),
  },

  /* -------------------------------------------------------- featured APIs */
  featuredApis: {
    type: 'featuredApis',
    label: 'Featured APIs',
    description: 'API categories and the most-used APIs',
    icon: 'ChartBar',
    defaultSurface: 'page',
    variants: [
      { id: 'grid', label: 'Categories with API cards' },
      { id: 'tabs', label: 'Tabbed API cards' },
      { id: 'split', label: 'Categories with endpoints' },
    ],
    fields: [
      ...heading,
      {
        kind: 'list', path: 'categories', label: 'Categories', itemTitle: 'label', addLabel: 'Add category', max: 6,
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'label', label: 'Label' },
        ],
        template: () => ({ icon: 'Cube', label: 'Category' }),
      },
      {
        kind: 'list', path: 'apis', label: 'APIs', itemTitle: 'name', addLabel: 'Add API',
        itemFields: [
          { kind: 'text', path: 'category', label: 'Category' },
          { kind: 'text', path: 'name', label: 'Name' },
          { kind: 'text', path: 'desc', label: 'Description', multiline: true },
          { kind: 'text', path: 'cta', label: 'Link label' },
          { kind: 'text', path: 'href', label: 'Link', placeholder: 'https:// or /path' },
          { kind: 'text', path: 'endpoints', label: 'Endpoints (one per line: METHOD /path)', multiline: true },
        ],
        template: () => ({ category: 'Payments API', name: 'New API', desc: 'Describe what this API does.', cta: 'View API reference', endpoints: 'GET /v1/resource' }),
      },
      { kind: 'divider', label: 'Usage badge' },
      { kind: 'text', path: 'usedByLabel', label: 'Label' },
      { kind: 'text', path: 'usedByCount', label: 'Count' },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Featured APIs',
      title: 'Comprehensive Banking APIs at Your Fingertips',
      sub: 'Access a full suite of production-ready APIs designed for rapid integration. Explore specialised API modules to streamline your operations and enhance your product.',
      categories: [
        { icon: 'CreditCard', label: 'Payments' },
        { icon: 'ArrowsLeftRight', label: 'Transfers' },
        { icon: 'HandCoins', label: 'Loans' },
        { icon: 'IdentificationCard', label: 'KYC AML' },
        { icon: 'Wallet', label: 'Accounts' },
        { icon: 'ShieldCheck', label: 'Fraud' },
      ],
      apis: [
        { category: 'Payments API', name: 'International Transfer', desc: 'Move money securely between accounts, banks or wallets with real-time processing, transaction tracking and webhook status updates.', cta: 'View API reference', endpoints: 'POST /payments/transfers\nGET /payments/transfers/{transferId}\nPATCH /payments/{paymentId}\nGET /payments/p2p/{paymentId}' },
        { category: 'Accounts API', name: 'Domestic Transfer', desc: 'Send local transfers instantly with account validation, idempotent retries and end-to-end status tracking.', cta: 'View API reference', endpoints: 'POST /accounts/transfers\nGET /accounts/{accountId}/balance\nPATCH /accounts/{accountId}\nGET /accounts/{accountId}/history' },
        { category: 'Payments API', name: 'Bulk Payroll Transfer', desc: 'Pay hundreds of employees in one batch with per-line validation, partial retries and reconciliation files.', cta: 'View API reference', endpoints: 'POST /payroll/batches\nGET /payroll/batches/{batchId}' },
        { category: 'Payments API', name: 'View Payment History', desc: 'Query every payment by status, date or counterparty with cursor pagination and exportable statements.', cta: 'View API reference', endpoints: 'GET /payments\nGET /payments/{paymentId}' },
      ],
      usedByLabel: 'Used by',
      usedByCount: '+1K developers',
    }),
  },

  /* ---------------------------------------------------------- marketplace */
  marketplace: {
    type: 'marketplace',
    label: 'Marketplace & Features',
    description: 'Portal capabilities beside a live try-out',
    icon: 'Storefront',
    defaultSurface: 'page',
    variants: [
      { id: 'list', label: 'Feature list with try-out' },
      { id: 'carousel', label: 'Feature carousel' },
    ],
    fields: [
      ...heading,
      {
        kind: 'list', path: 'features', label: 'Features', itemTitle: 'title', addLabel: 'Add feature',
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
        ],
        template: () => ({ icon: 'Cube', title: 'New feature', body: 'Describe the feature.' }),
      },
      { kind: 'divider', label: 'Try-out panel' },
      { kind: 'text', path: 'language', label: 'Language label' },
      { kind: 'text', path: 'requestCode', label: 'Request', multiline: true },
      { kind: 'text', path: 'responseStatus', label: 'Response status' },
      { kind: 'text', path: 'responseCode', label: 'Response', multiline: true },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Marketplace',
      title: 'API Marketplace Features',
      sub: 'Everything you need to build, test and scale. The developer portal provides the essential toolkit to turn your financial roadmap into reality.',
      features: [
        { icon: 'Cube', title: 'API Sandbox', body: 'Use simulated data to test your integration logic before hitting production.' },
        { icon: 'Notebook', title: 'API Reference', body: 'Explore detailed endpoint specifications, authentication protocols and step-by-step tutorials.' },
        { icon: 'BookOpenText', title: 'API Guides', body: 'Understand API use cases with guides that share the entire context.' },
        { icon: 'Package', title: 'Ready-to-use SDKs', body: 'Spend less time on boilerplate and more time on core features.' },
        { icon: 'Flask', title: 'Integration Recipes', body: 'Follow ready-made integration examples that help you implement APIs faster.' },
      ],
      language: 'cURL',
      requestCode: 'curl -X POST "https://api.northwind.dev/v1/transfers" \\\n  -H "Authorization: Bearer <ACCESS_TOKEN>" \\\n  -H "Content-Type: application/json" \\\n  --data \'{\n    "amount": 2509,\n    "currency": "USD",\n    "counterparty_id": "cpa_6f6c8a7b0a6d",\n    "description": "Order #78421",\n    "speed": "standard"\n  }\'',
      responseStatus: '200 OK',
      responseCode: '{\n  "id": "trf_3c6f2c7a9f5b40dc",\n  "status": "queued",\n  "amount": 2509,\n  "currency": "USD"\n}',
    }),
  },

  /* ------------------------------------------------------ getting started */
  gettingStarted: {
    type: 'gettingStarted',
    label: 'Getting Started',
    description: 'The onboarding journey, step by step',
    icon: 'GitBranch',
    defaultSurface: 'muted',
    variants: [
      { id: 'cards', label: 'Step cards', surface: 'muted' },
      { id: 'split', label: 'Step list with detail', surface: 'page' },
      { id: 'grid', label: 'Two-by-two steps', surface: 'muted' },
    ],
    fields: [
      ...heading,
      button('cta', 'Button'),
      {
        kind: 'list', path: 'steps', label: 'Steps', itemTitle: 'title', addLabel: 'Add step', max: 4,
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'tagline', label: 'Tagline' },
          { kind: 'text', path: 'short', label: 'Short description' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
          { kind: 'text', path: 'badge', label: 'Badge' },
        ],
        template: () => ({ icon: 'Circle', title: 'New step', tagline: 'Tagline', short: 'Short description', body: 'Describe this step.', badge: 'Self service' }),
      },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Getting Started',
      title: 'Get Started with the Developer Portal',
      sub: 'A guided onboarding flow designed to get you from account creation to your first production transaction with zero friction.',
      cta: 'Explore',
      steps: [
        { icon: 'FileArrowUp', title: 'Discover', tagline: 'Browse the API catalogue', short: 'Create your developer account in under 2 minutes.', body: 'Create your developer account to unlock the full marketplace. Set up your workspace to manage applications, team members and credentials in one place.', badge: 'Self service' },
        { icon: 'Binoculars', title: 'Sandbox', tagline: 'Build & test freely', short: 'Use the interactive sandbox to simulate real banking flows.', body: 'Get instant sandbox credentials on registration. Simulate transfers, QR payments and KYC flows with mock data in a fully isolated environment.', badge: 'Self service' },
        { icon: 'Code', title: 'Test', tagline: 'Validate with real flows', short: 'Follow the guides and reference docs to integrate quickly.', body: 'Promote to the test environment with near-real transaction data. Run end-to-end tests, configure webhooks and get sign-off before going live.', badge: 'Assisted' },
        { icon: 'RocketLaunch', title: 'Production', tagline: 'Go live with confidence', short: 'Pass the security review and launch your product.', body: 'Once certified, deploy to production with enterprise-grade SLAs, dedicated support, real-time monitoring and audit trails from day one.', badge: 'Assisted' },
      ],
    }),
  },

  /* ------------------------------------------------------------- solution */
  solution: {
    type: 'solution',
    label: 'Solution',
    description: 'Recommended API stacks by industry',
    icon: 'Sparkle',
    defaultSurface: 'muted',
    variants: [{ id: 'sidebar', label: 'Industry sidebar', surface: 'muted' }],
    fields: [
      ...heading,
      {
        kind: 'list', path: 'industries', label: 'Industries', itemTitle: 'name', addLabel: 'Add industry',
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'name', label: 'Name' },
          { kind: 'text', path: 'tagline', label: 'Tagline' },
          { kind: 'text', path: 'headline', label: 'Headline' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
        ],
        template: () => ({ icon: 'Buildings', name: 'Industry', tagline: 'Tagline', headline: 'Headline', body: 'Describe the solution.' }),
      },
      { kind: 'image', path: 'image', label: 'Illustration (replaces the flow artwork)' },
      { kind: 'text', path: 'featuredLabel', label: 'Featured label' },
      {
        kind: 'list', path: 'recipes', label: 'Featured recipes', itemTitle: 'title', addLabel: 'Add recipe',
        itemFields: [
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
          { kind: 'text', path: 'cta', label: 'Link label' },
          { kind: 'text', path: 'href', label: 'Link', placeholder: 'https:// or /path' },
        ],
        template: () => ({ title: 'New recipe', body: 'Describe the recipe.', cta: 'Explore recipe' }),
      },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Solution',
      title: 'Explore Solutions by Industry',
      sub: 'Select a business vertical to see the recommended API stack and how it powers real-world fintech products.',
      industries: industries(),
      image: '',
      featuredLabel: 'Featured solution',
      recipes: recipes(),
    }),
  },

  /* ------------------------------------------------------- why choose us */
  whyChooseUs: {
    type: 'whyChooseUs',
    label: 'Why Choose Us',
    description: 'Reasons to build on your platform',
    icon: 'Sparkle',
    defaultSurface: 'page',
    variants: [
      { id: 'illustrated', label: 'Cards around artwork' },
      { id: 'bento', label: 'Bento grid' },
      { id: 'usecases', label: 'Use cases with stats' },
    ],
    fields: [
      ...heading,
      {
        kind: 'list', path: 'items', label: 'Reasons', itemTitle: 'title', addLabel: 'Add reason', max: 4,
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
        ],
        template: () => ({ icon: 'Wrench', title: 'New reason', body: 'Describe the reason.' }),
      },
      { kind: 'divider', label: 'Cards around artwork' },
      { kind: 'image', path: 'image', label: 'Illustration' },
      button('cta', 'Button'),
      { kind: 'divider', label: 'Bento grid' },
      {
        kind: 'list', path: 'statements', label: 'Statements', itemTitle: 'text', addLabel: 'Add statement', max: 5,
        itemFields: [{ kind: 'text', path: 'text', label: 'Statement', multiline: true }],
        template: () => ({ text: 'A short supporting statement.' }),
      },
      { kind: 'divider', label: 'Use cases with stats' },
      {
        kind: 'list', path: 'industries', label: 'Industries', itemTitle: 'name', addLabel: 'Add industry', max: 5,
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'name', label: 'Name' },
          { kind: 'text', path: 'tagline', label: 'Tagline' },
        ],
        template: () => ({ icon: 'Buildings', name: 'Industry', tagline: 'Tagline' }),
      },
      { kind: 'text', path: 'featuredLabel', label: 'Featured label' },
      {
        kind: 'list', path: 'recipes', label: 'Recipes', itemTitle: 'title', addLabel: 'Add recipe', max: 4,
        itemFields: [
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'body', label: 'Description', multiline: true },
          { kind: 'text', path: 'cta', label: 'Link label' },
          { kind: 'text', path: 'href', label: 'Link', placeholder: 'https:// or /path' },
        ],
        template: () => ({ title: 'New recipe', body: 'Describe the recipe.', cta: 'Explore recipe' }),
      },
      { kind: 'image', path: 'logoImage', label: 'Stats logo' },
      { kind: 'text', path: 'statsTitle', label: 'Stats title' },
      { kind: 'text', path: 'statsSub', label: 'Stats subtitle' },
      {
        kind: 'list', path: 'stats', label: 'Stats', itemTitle: 'label', addLabel: 'Add stat', max: 4,
        itemFields: [
          { kind: 'text', path: 'value', label: 'Value' },
          { kind: 'text', path: 'label', label: 'Label' },
        ],
        template: () => ({ value: '00', label: 'Stat' }),
      },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Why Choose Us',
      title: 'Built for Scale, Trust, and Growth',
      sub: 'Get scalable infrastructure, modular APIs, governance rigour and embedded finance expertise designed for reliable long-term partnerships.',
      items: [
        { icon: 'Lightning', title: 'Launch faster with APIs', body: 'Accelerate integration with modular APIs, clear onboarding flows and infrastructure designed for enterprise-scale experiences.' },
        { icon: 'Handshake', title: 'A banking partner you can trust', body: 'Backed by deep banking expertise, regulatory alignment and dependable operational standards for secure innovation.' },
        { icon: 'ShieldCheck', title: 'Banking built for reliability', body: 'Deliver consistent customer experiences with scalable systems, high availability and dependable API performance.' },
        { icon: 'RocketLaunch', title: 'Designed to support growth', body: 'Unlock new revenue opportunities, expand faster and create embedded finance experiences.' },
      ],
      image: '',
      cta: 'Learn more',
      statements: [
        { text: 'Production-grade performance, scalability and optimisation for the demands of your fintech ecosystem.' },
        { text: 'Seamless platform integration, production-ready reliability and solutions tailored to banking and fintech.' },
        { text: 'Scalable, and crafted specifically for the growing financial technology environment.' },
        { text: 'APIs that fit your use cases, with production-ready solutions engineered for the fintech landscape.' },
        { text: 'Built to complement your platform’s style — scalable, production-ready and optimised for your sector.' },
      ],
      industries: industries().slice(0, 4),
      featuredLabel: 'Featured solution',
      recipes: recipes(),
      logoIcon: 'Sparkle',
      statsTitle: 'Why businesses choose our API',
      statsSub: 'Built for performance, availability and scale.',
      stats: [
        { value: '16', label: 'Recipes' },
        { value: '40+', label: 'Banking APIs' },
        { value: '99%', label: 'Platform availability' },
      ],
    }),
  },

  /* -------------------------------------------------------------- contact */
  contact: {
    type: 'contact',
    label: 'Contact Us',
    description: 'A closing pitch beside an enquiry form',
    icon: 'EnvelopeSimple',
    defaultSurface: 'brand',
    variants: [{ id: 'cta-form', label: 'Pitch with form', surface: 'brand' }],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'sub', label: 'Description', multiline: true },
      button('cta', 'Button'),
      { kind: 'divider', label: 'Form' },
      { kind: 'text', path: 'formTitle', label: 'Form title' },
      { kind: 'text', path: 'formSub', label: 'Form subtitle' },
      {
        kind: 'list', path: 'fields', label: 'Fields', itemTitle: 'label', addLabel: 'Add field',
        itemFields: [
          { kind: 'text', path: 'label', label: 'Label' },
          { kind: 'text', path: 'placeholder', label: 'Placeholder' },
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'toggle', path: 'multiline', label: 'Multi-line' },
        ],
        template: () => ({ label: 'New field', placeholder: '', icon: 'TextT', multiline: false }),
      },
      { kind: 'text', path: 'submitLabel', label: 'Submit button' },
      { kind: 'text', path: 'legal', label: 'Consent line' },
    ],
    defaults: () => ({
      title: 'Start building today',
      sub: 'Explore the full API catalogue and see how our digital infrastructure can power your next project. Sign up to unlock specifications, interactive consoles and production keys.',
      cta: 'View API Reference',
      formTitle: 'Reach out to us',
      formSub: 'Let’s build the future of banking, together.',
      fields: [
        { label: 'Name', placeholder: 'Full name', icon: 'User', multiline: false },
        { label: 'Email', placeholder: 'Work email', icon: 'EnvelopeSimple', multiline: false },
        { label: 'Company', placeholder: 'Company name', icon: 'Buildings', multiline: false },
        { label: 'Message', placeholder: 'Your message', icon: 'ChatText', multiline: true },
      ],
      submitLabel: 'Book a meeting',
      legal: 'By clicking, you agree to our Terms and Conditions.',
    }),
  },

  /* ------------------------------------------------------------ resources */
  resources: {
    type: 'resources',
    label: 'Resources',
    description: 'Blogs, guides and tutorials',
    icon: 'BookOpen',
    defaultSurface: 'muted',
    variants: [{ id: 'bento', label: 'Article grid', surface: 'muted' }],
    fields: [
      ...heading,
      {
        kind: 'list', path: 'posts', label: 'Articles', itemTitle: 'title', addLabel: 'Add article', max: 4,
        itemFields: [
          { kind: 'text', path: 'category', label: 'Category' },
          { kind: 'text', path: 'title', label: 'Title' },
          { kind: 'text', path: 'excerpt', label: 'Excerpt', multiline: true },
          { kind: 'text', path: 'author', label: 'Author' },
          { kind: 'text', path: 'role', label: 'Author role' },
          { kind: 'image', path: 'image', label: 'Cover image' },
        ],
        template: () => ({ category: 'Guide', title: 'New article', excerpt: 'A short excerpt.', author: 'Author name', role: 'Role', image: '' }),
      },
      button('cta', 'Button'),
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'Resources',
      title: 'Blogs, Guides, Tutorials and Articles',
      sub: 'Everything you need to explore our APIs, ship integrations quickly and scale your apps reliably.',
      posts: [
        { category: 'Banking', title: 'Inside our API security programme with the CTO', excerpt: '', author: '', role: '', image: '' },
        { category: 'Loans', title: 'Unpaid Loans: Understanding Your Rights, Remedies and Responsibilities', excerpt: 'Quick take: what really happens when a digital loan goes unpaid, and how lenders should design fair collections.', author: 'Maya Santos', role: 'Senior Architect', image: '' },
        { category: 'Loans', title: 'How to Apply for and Get a Multi-Purpose Loan', excerpt: 'Prepaid cards offer control and convenience. Discover how they help you manage daily spending without overshooting your budget.', author: 'Daniel Reyes', role: 'Product Lead', image: '' },
        { category: 'Fintech', title: 'Online Business Funding', excerpt: 'Vlogging, online selling and virtual tutoring — funding options for the new wave of online businesses.', author: '', role: '', image: '' },
      ],
      cta: 'View all',
    }),
  },

  /* ------------------------------------------------------------- partners */
  partners: {
    type: 'partners',
    label: 'Trusted Partners',
    description: 'A row of partner logos',
    icon: 'Handshake',
    defaultSurface: 'page',
    variants: [{ id: 'row', label: 'Logo row' }],
    fields: [
      { kind: 'text', path: 'title', label: 'Logo heading' },
      logoList('logos', 'Logos'),
    ],
    defaults: () => ({
      title: 'Our Proud Partners',
      logos: PARTNERS.map((l) => ({ ...l })),
    }),
  },

  /* --------------------------------------------------------------- footer */
  footer: {
    type: 'footer',
    label: 'Footer',
    description: 'About, link columns and legal',
    icon: 'PictureInPicture',
    defaultSurface: 'page',
    variants: [{ id: 'about', label: 'About with link columns' }],
    fields: [
      { kind: 'text', path: 'aboutTitle', label: 'About title' },
      { kind: 'text', path: 'tagline', label: 'About text', multiline: true },
      {
        kind: 'list', path: 'socials', label: 'Social icons', itemTitle: 'label', addLabel: 'Add icon',
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'label', label: 'Label' },
        ],
        template: () => ({ icon: 'Globe', label: 'Link' }),
      },
      {
        kind: 'list', path: 'columns', label: 'Link columns', itemTitle: 'title', addLabel: 'Add column', max: 4,
        itemFields: [
          { kind: 'text', path: 'title', label: 'Column title' },
          {
            kind: 'list', path: 'links', label: 'Links', itemTitle: 'label', addLabel: 'Add link',
            itemFields: [
              { kind: 'text', path: 'label', label: 'Label' },
              { kind: 'text', path: 'href', label: 'Link' },
            ],
            template: () => link('New link'),
          },
        ],
        template: () => ({ title: 'Column', links: [link('New link')] }),
      },
      { kind: 'text', path: 'legal', label: 'Legal line' },
      {
        kind: 'list', path: 'legalLinks', label: 'Legal links', itemTitle: 'label', addLabel: 'Add link',
        itemFields: [{ kind: 'text', path: 'label', label: 'Label' }],
        template: () => ({ label: 'Policy' }),
      },
    ],
    defaults: () => ({
      aboutTitle: 'About Northwind',
      tagline: 'Northwind Bank, established in 1994, is one of the fastest-growing banks in the region, serving consumers, middle-market corporates and the mass affluent.',
      socials: [
        { icon: 'XLogo', label: 'X' },
        { icon: 'FacebookLogo', label: 'Facebook' },
        { icon: 'InstagramLogo', label: 'Instagram' },
        { icon: 'GithubLogo', label: 'GitHub' },
      ],
      columns: [
        { title: 'Company', links: [link('About'), link('Features'), link('Works'), link('Careers')] },
        { title: 'Help', links: [link('Customer support'), link('Delivery details'), link('Terms & conditions'), link('Privacy policy')] },
        { title: 'Resources', links: [link('Free eBooks'), link('Development tutorial'), link('How-to blog')] },
      ],
      legal: '© 2026 northwind.dev',
      legalLinks: [{ label: 'Privacy statement' }, { label: 'Terms & conditions' }, { label: 'Policies' }],
    }),
  },

  /* ----------------------------------------------------------- references */
  references: {
    type: 'references',
    label: 'References',
    description: 'A call to explore the API reference',
    icon: 'Code',
    defaultSurface: 'page',
    variants: [
      { id: 'split-banner', label: 'Split banner', surface: 'page' },
      { id: 'showcase', label: 'Showcase with app', surface: 'brand' },
    ],
    fields: [
      { kind: 'text', path: 'title', label: 'Title', multiline: true },
      { kind: 'text', path: 'panelTitle', label: 'Panel title (split banner)' },
      { kind: 'text', path: 'sub', label: 'Description', multiline: true },
      button('cta', 'Button'),
      { kind: 'divider', label: 'App preview' },
      { kind: 'text', path: 'userName', label: 'User name' },
      { kind: 'text', path: 'balance', label: 'Balance' },
      {
        kind: 'list', path: 'transactions', label: 'Transactions', itemTitle: 'name', addLabel: 'Add transaction', max: 3,
        itemFields: [
          { kind: 'icon', path: 'icon', label: 'Icon' },
          { kind: 'text', path: 'name', label: 'Name' },
          { kind: 'text', path: 'meta', label: 'Detail' },
          { kind: 'text', path: 'amount', label: 'Amount' },
          { kind: 'text', path: 'date', label: 'Date' },
        ],
        template: () => ({ icon: 'Receipt', name: 'Merchant', meta: 'Payment', amount: '$0.00', date: 'Today' }),
      },
      { kind: 'divider', label: 'Showcase' },
      {
        kind: 'list', path: 'steps', label: 'Steps', itemTitle: 'label', addLabel: 'Add step', max: 3,
        itemFields: [{ kind: 'text', path: 'label', label: 'Label' }],
        template: () => ({ label: 'Step' }),
      },
      { kind: 'text', path: 'specCode', label: 'Code window', multiline: true },
    ],
    defaults: () => ({
      title: 'Start building on our API platform today.',
      panelTitle: 'Built to Fuel Your Growth',
      sub: 'Explore the full API catalogue and see how our digital infrastructure can power your next project. Sign up to unlock specifications, interactive consoles and production keys.',
      cta: 'View API Reference',
      userName: 'David',
      balance: '$41,379.00',
      transactions: [
        { icon: 'YoutubeLogo', name: 'YouTube', meta: 'Subscription payment', amount: '$14.00', date: '16 May 2026' },
        { icon: 'CreditCard', name: 'Stripe', meta: 'Monthly paycheck', amount: '$3,500', date: '15 May 2026' },
        { icon: 'GooglePlayLogo', name: 'Google Play', meta: 'E-book purchase', amount: '$134.00', date: '14 May 2026' },
      ],
      steps: [{ label: 'Try out' }, { label: 'Integrate' }, { label: 'Track' }],
      specCode: 'openapi: 3.0.3\ninfo:\n  title: Northwind Payments\n  description: |-\n    Move money between accounts,\n    banks and wallets in real time.\n  version: 1.4.0\nservers:\n  - url: https://api.northwind.dev\npaths:\n  /v1/transfers:\n    post:\n      summary: Create a transfer',
    }),
  },

  /* ------------------------------------------------------------------ faq */
  faq: {
    type: 'faq',
    label: 'FAQ',
    description: 'Numbered questions and answers',
    icon: 'Question',
    defaultSurface: 'page',
    variants: [{ id: 'numbered', label: 'Numbered accordion' }],
    fields: [
      ...heading,
      {
        kind: 'list', path: 'items', label: 'Questions', itemTitle: 'q', addLabel: 'Add question',
        itemFields: [
          { kind: 'text', path: 'q', label: 'Question', multiline: true },
          { kind: 'text', path: 'a', label: 'Answer', multiline: true },
        ],
        template: () => ({ q: 'New question?', a: 'And the answer.' }),
      },
    ],
    defaults: () => ({
      showEyebrow: true,
      eyebrow: 'FAQs',
      title: 'Your Queries. Answered.',
      sub: 'Find answers to frequently asked questions about our APIs, platform features and how to get the most out of our developer resources.',
      items: [
        { q: 'How do I generate an API key?', a: 'Sign in, open Applications and choose Create key. Sandbox keys are issued instantly; production keys follow the security review.' },
        { q: 'How do I get started with the payment processing APIs?', a: 'Create a sandbox application, authenticate with OAuth 2.0 client credentials, then follow the “Take a first payment” recipe. Most teams make their first successful call within an hour.' },
        { q: 'Is there a way to download the SDK for an API?', a: 'Yes. Every API reference page links to official SDKs for Node, Python, Java and Go, and you can download the OpenAPI file to generate your own.' },
        { q: 'How do I handle errors and exceptions?', a: 'Errors return a consistent JSON body with a machine-readable code, a message and a request id you can quote to support.' },
        { q: 'What are the rate limits?', a: 'Sandbox allows 100 requests per minute per key. Production limits are set per contract and returned in the X-RateLimit headers.' },
        { q: 'What authentication methods are supported by the API?', a: 'OAuth 2.0 client credentials for server-to-server calls, and authorisation code with PKCE for customer-consented flows.' },
        { q: 'Can I use the SDK with multiple programming languages?', a: 'Yes — the SDKs share one interface across languages, so examples translate directly between them.' },
      ],
    }),
  },
}

/** The Home page's section types, in the Figma's order. */
export const HOME_TYPES: SectionType[] = [
  'hero', 'awards', 'featuredApis', 'marketplace', 'gettingStarted', 'solution',
  'whyChooseUs', 'contact', 'resources', 'partners', 'references', 'faq',
]
