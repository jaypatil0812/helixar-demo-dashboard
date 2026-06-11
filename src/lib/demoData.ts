export type SourceStatus = "Synced" | "Syncing" | "Review" | "Queued" | "Blocked";

export type DemoSource = {
  id: string;
  name: string;
  type: string;
  status: SourceStatus;
  lastSynced: string;
  itemsSynced: number;
  health: number;
  description: string;
};

export type DemoMetrics = {
  draftsReady: number;
  postsPublished: number;
  warmICPs: number;
  repliesReady: number;
  activeSources: number;
  voiceMatch: number;
  contentGenerated: number;
  avgDraftsPerDay: number;
};

export type IcpStatus = "Hot" | "Warm" | "Active" | "New" | "Review";
export type IcpFit = "Excellent" | "Strong" | "Moderate" | "Low";

export type IcpAudienceMember = {
  id: string;
  name: string;
  title: string;
  company: string;
  segment: string;
  location: string;
  signal: string;
  score: number;
  source: string;
  status: IcpStatus;
  lastAction: string;
  fit: IcpFit;
  intentType: string;
  notes: string;
};

export type ContentFlow = {
  id: string;
  name: string;
  status: "Live" | "Draft" | "Queued" | "Review";
  drafts: number;
  published: number;
  warmICPs: number;
  replies: number;
  sources: string[];
  nextRun: string;
  steps: string[];
};

export type QueueItem = {
  id: string;
  type: "draft" | "scheduled" | "reply" | "published";
  channel: string;
  title: string;
  source: string;
  segment: string;
  status: "Draft" | "Review" | "Ready" | "Queued" | "Scheduled" | "Pending" | "Published";
  scheduledFor: string;
  confidence: number;
  body: string;
  icpName?: string;
  signal?: string;
  original?: string;
  icpFit?: string;
  sourceContext?: string;
};

export type PerformanceInsight = {
  id: string;
  name: string;
  volume: number;
  conversion: number;
  trend: number;
  status: "Rising" | "Stable" | "Watch";
};

export type InsightMetric = {
  id: string;
  label: string;
  value: string;
};

export type DailyPerformanceDate = {
  id: string;
  label: string;
};

export type DailyPerformanceCell = {
  dateId: string;
  signals: number;
  warmIcps: number;
};

export type DailyPerformanceRow = {
  id: string;
  flow: string;
  cells: DailyPerformanceCell[];
};

export type SignalPerformanceSummary = {
  id: string;
  signal: string;
  type: string;
  drafts: number;
  warmIcps: number;
  replies: number;
  volume: "High" | "Medium" | "Low";
};

export type SourcePerformanceSummary = {
  id: string;
  source: string;
  itemsSynced: number;
  drafts: number;
  warmIcps: number;
  lastSync: string;
  health: number;
};

export type DemoInsights = {
  metrics: InsightMetric[];
  dateFilters: string[];
  dailyPerformance: {
    dates: DailyPerformanceDate[];
    rows: DailyPerformanceRow[];
  };
  signalPerformance: SignalPerformanceSummary[];
  sourcePerformance: SourcePerformanceSummary[];
};

export type CopilotSuggestion = {
  id: string;
  title: string;
  description: string;
  source: string;
  priority: "High" | "Medium" | "Low";
  confidence: number;
  action: string;
};

export type CopilotContextItem = {
  id: string;
  source: string;
  detail: string;
};

export type CopilotOutputCard = {
  id: string;
  title: string;
  channel: string;
  preview: string;
  segment: string;
  source: string;
  confidence: number;
  voiceMatch: number;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  detail?: string;
};

export type ActivitySeries = {
  id: string;
  label: string;
  color: string;
  values: number[];
};

export type DemoDashboard = {
  welcomeTitle: string;
  metrics: DashboardMetric[];
  timeFilters: string[];
  defaultTimeFilter: string;
  activityOverview: ActivitySeries[];
};

export type SourceSignalRow = {
  id: string;
  name: string;
  warmIcpsFound: number;
  volume: "High" | "Medium" | "Low";
  nextRun: string;
};

export type SourceInstructionCard = {
  id: string;
  title: string;
  detail: string;
};

export type SourceLookalikeIcp = {
  id: string;
  name: string;
  title: string;
  company: string;
  score: number;
};

export type AudienceSignalExample = {
  id: string;
  signal: string;
};

export type DemoSourceDiscovery = {
  badges: string[];
  stats: {
    signalsFound: number;
    newThisWeek: number;
  };
  icpChips: string[];
  signals: SourceSignalRow[];
  importTabs: string[];
  instructionCards: SourceInstructionCard[];
  lookalikes: SourceLookalikeIcp[];
};

export const demoSources: DemoSource[] = [
  {
    id: "source-slack",
    name: "Slack",
    type: "Messages",
    status: "Synced",
    lastSynced: "4m ago",
    itemsSynced: 4286,
    health: 98,
    description: "Customer language, launch questions, objection patterns, and team notes.",
  },
  {
    id: "source-meet",
    name: "Google Meet",
    type: "Call transcripts",
    status: "Synced",
    lastSynced: "11m ago",
    itemsSynced: 342,
    health: 94,
    description: "Discovery calls, demos, onboarding notes, and founder interview transcripts.",
  },
  {
    id: "source-linkedin",
    name: "LinkedIn",
    type: "Social",
    status: "Syncing",
    lastSynced: "18m ago",
    itemsSynced: 2184,
    health: 91,
    description: "Founder posts, ICP reactions, job changes, and account-level engagement signals.",
  },
  {
    id: "source-x",
    name: "X",
    type: "Social",
    status: "Synced",
    lastSynced: "26m ago",
    itemsSynced: 1740,
    health: 88,
    description: "Market chatter, competitor mentions, founder threads, and product reactions.",
  },
  {
    id: "source-reddit",
    name: "Reddit",
    type: "Community",
    status: "Review",
    lastSynced: "1h ago",
    itemsSynced: 624,
    health: 76,
    description: "Subreddit pain points, comparison threads, buying questions, and category language.",
  },
  {
    id: "source-website",
    name: "Website",
    type: "Owned",
    status: "Synced",
    lastSynced: "2h ago",
    itemsSynced: 118,
    health: 97,
    description: "Landing pages, changelog copy, docs, use cases, and launch announcements.",
  },
  {
    id: "source-notion",
    name: "Notion",
    type: "Knowledge",
    status: "Queued",
    lastSynced: "5h ago",
    itemsSynced: 286,
    health: 84,
    description: "Messaging docs, release notes, ICP research, customer stories, and product briefs.",
  },
  {
    id: "source-crm",
    name: "CRM",
    type: "Pipeline",
    status: "Synced",
    lastSynced: "9m ago",
    itemsSynced: 932,
    health: 96,
    description: "Accounts, opportunities, objections, stages, owner notes, and next-best actions.",
  },
];

export const demoMetrics: DemoMetrics = {
  draftsReady: 46,
  postsPublished: 128,
  warmICPs: 384,
  repliesReady: 23,
  activeSources: 7,
  voiceMatch: 92,
  contentGenerated: 684,
  avgDraftsPerDay: 6.8,
};

export const demoDashboard: DemoDashboard = {
  welcomeTitle: "Welcome back",
  metrics: [
    { id: "next-actions", label: "Next actions", value: "12", detail: "7 drafts, 5 replies" },
    { id: "drafts", label: "Drafts", value: "18" },
    { id: "published", label: "Published", value: "42" },
    { id: "warm-icps", label: "Warm ICPs", value: "146" },
    { id: "replies", label: "Replies", value: "23" },
    { id: "voice-match", label: "Voice Match", value: "94%" },
  ],
  timeFilters: ["7 days", "30 days", "3 months", "This month"],
  defaultTimeFilter: "30 days",
  activityOverview: [
    { id: "content-generated", label: "Content generated", color: "#FF6B3D", values: [28, 34, 31, 44, 48, 56, 62, 59] },
    { id: "posts-published", label: "Posts published", color: "#2563EB", values: [9, 14, 13, 18, 21, 26, 29, 32] },
    { id: "icp-engagements", label: "ICP engagements", color: "#16A34A", values: [18, 21, 27, 29, 37, 41, 46, 54] },
    { id: "replies-sent", label: "Replies sent", color: "#F59E0B", values: [6, 9, 11, 13, 15, 18, 20, 23] },
  ],
};

export const demoSourceDiscovery: DemoSourceDiscovery = {
  badges: ["AI", "Active"],
  stats: {
    signalsFound: 190,
    newThisWeek: 37,
  },
  icpChips: ["Founder", "CEO", "Marketing", "B2B SaaS", "DevTools", "AI", "North America"],
  signals: [
    { id: "signal-founder-content", name: "founder-led content", warmIcpsFound: 42, volume: "High", nextRun: "Today 2:30 PM" },
    { id: "signal-content-automation", name: "content automation", warmIcpsFound: 38, volume: "High", nextRun: "Today 4:00 PM" },
    { id: "signal-pricing-objections", name: "pricing objections", warmIcpsFound: 27, volume: "Medium", nextRun: "Tomorrow 9:00 AM" },
    { id: "signal-competitor-comments", name: "competitor comments", warmIcpsFound: 31, volume: "Medium", nextRun: "Tomorrow 11:30 AM" },
    { id: "signal-return-visits", name: "website return visits", warmIcpsFound: 24, volume: "Low", nextRun: "Fri 10:00 AM" },
    { id: "signal-launch-reactions", name: "launch reactions", warmIcpsFound: 28, volume: "Medium", nextRun: "Fri 2:00 PM" },
  ],
  importTabs: ["Event", "Search", "SalesNav", "Connections", "Post Likers & Commenters", "CSV Upload", "Manual ICP"],
  instructionCards: [
    { id: "instruction-open", title: "Open source", detail: "Use a saved search, post, event, profile, or CSV list." },
    { id: "instruction-capture", title: "Capture signals", detail: "Helixar maps visible context into source-ready ICP rows." },
    { id: "instruction-import", title: "Import audience", detail: "Review matched people, segments, and warm-intent signals." },
  ],
  lookalikes: [
    { id: "lookalike-001", name: "Mira Chen", title: "Founder", company: "SignalNest", score: 94 },
    { id: "lookalike-002", name: "Adam Reyes", title: "CEO", company: "LaunchLayer", score: 91 },
    { id: "lookalike-003", name: "Priya Shah", title: "Marketing Lead", company: "VectorLoop", score: 88 },
    { id: "lookalike-004", name: "Ben Holloway", title: "Co-founder", company: "OrbitDesk", score: 84 },
    { id: "lookalike-005", name: "Nina Brooks", title: "Growth", company: "Northstar API", score: 81 },
  ],
};

export const demoAudienceSignals: AudienceSignalExample[] = [
  { id: "audience-signal-founder-post", signal: "Engaged with founder-led post" },
  { id: "audience-signal-pricing", signal: "Visited pricing page" },
  { id: "audience-signal-competitor", signal: "Commented on competitor post" },
  { id: "audience-signal-automation", signal: "Mentioned content automation" },
  { id: "audience-signal-launch", signal: "Replied to launch thread" },
  { id: "audience-signal-lookalike", signal: "Matched customer lookalike" },
];

export const demoIcpAudience: IcpAudienceMember[] = [
  {
    id: "icp-001",
    name: "Maya Ren",
    title: "Founder",
    company: "Northbeam Studio",
    segment: "AI SaaS",
    location: "Austin, TX",
    signal: "Posted about stalled content ops",
    score: 96,
    source: "LinkedIn",
    status: "Hot",
    lastAction: "Reply drafted",
    fit: "Excellent",
    intentType: "Problem aware",
    notes: "Needs a repeatable founder-led content workflow before launch week.",
  },
  {
    id: "icp-002",
    name: "Jonah Vale",
    title: "VP Marketing",
    company: "CircuitGrid",
    segment: "Devtools",
    location: "San Francisco, CA",
    signal: "Hiring content lead",
    score: 94,
    source: "CRM",
    status: "Hot",
    lastAction: "Added to warm list",
    fit: "Excellent",
    intentType: "Expansion",
    notes: "Strong need for repurposing technical launches into social and SEO assets.",
  },
  {
    id: "icp-003",
    name: "Leah Moreno",
    title: "Head of Growth",
    company: "TrellisPay",
    segment: "Fintech",
    location: "New York, NY",
    signal: "Commented on compliance messaging",
    score: 91,
    source: "LinkedIn",
    status: "Hot",
    lastAction: "Thread queued",
    fit: "Excellent",
    intentType: "Category research",
    notes: "Likely cares about approval workflows and consistent voice across channels.",
  },
  {
    id: "icp-004",
    name: "Ishan Rao",
    title: "CEO",
    company: "LayerForge",
    segment: "Infrastructure",
    location: "Bengaluru, India",
    signal: "New funding announcement",
    score: 89,
    source: "Website",
    status: "Active",
    lastAction: "Launch note parsed",
    fit: "Strong",
    intentType: "Launch",
    notes: "Fresh announcement can become founder POV, customer note, and technical brief.",
  },
  {
    id: "icp-005",
    name: "Nora Ellis",
    title: "Product Marketing Lead",
    company: "BrightCart",
    segment: "Commerce",
    location: "Seattle, WA",
    signal: "Asked for launch examples",
    score: 87,
    source: "Slack",
    status: "Active",
    lastAction: "Call clipped",
    fit: "Strong",
    intentType: "Evaluation",
    notes: "Good candidate for launch repurposing and voice-match proof points.",
  },
  {
    id: "icp-006",
    name: "Theo Park",
    title: "Co-founder",
    company: "FieldSignal",
    segment: "Vertical SaaS",
    location: "Denver, CO",
    signal: "Shared customer quote",
    score: 85,
    source: "Google Meet",
    status: "Warm",
    lastAction: "Insight saved",
    fit: "Strong",
    intentType: "Customer proof",
    notes: "Customer language is rich enough for testimonial snippets and reply drafts.",
  },
  {
    id: "icp-007",
    name: "Amina Cho",
    title: "Growth Manager",
    company: "NovaDesk",
    segment: "B2B SaaS",
    location: "Toronto, Canada",
    signal: "Compared three AI writing tools",
    score: 84,
    source: "Reddit",
    status: "Warm",
    lastAction: "Competitor response drafted",
    fit: "Strong",
    intentType: "Comparison",
    notes: "Needs positioning around source-aware generation instead of generic writing.",
  },
  {
    id: "icp-008",
    name: "Elliot Shin",
    title: "Founder",
    company: "Dockline AI",
    segment: "AI SaaS",
    location: "Los Angeles, CA",
    signal: "Asked how to scale founder content",
    score: 82,
    source: "X",
    status: "Warm",
    lastAction: "Added to reply queue",
    fit: "Strong",
    intentType: "Problem aware",
    notes: "Prioritize concise proof and a low-friction workflow comparison.",
  },
  {
    id: "icp-009",
    name: "Sofia Bennett",
    title: "Director of Demand",
    company: "ArcLedger",
    segment: "Fintech",
    location: "Chicago, IL",
    signal: "Pipeline notes mention low reply rate",
    score: 80,
    source: "CRM",
    status: "Warm",
    lastAction: "Email drafted",
    fit: "Strong",
    intentType: "Pipeline acceleration",
    notes: "Tie content generation to warm-audience reply management.",
  },
  {
    id: "icp-010",
    name: "Mateo Silva",
    title: "Founder",
    company: "OpsHarbor",
    segment: "Operations",
    location: "Miami, FL",
    signal: "Published hiring plan",
    score: 78,
    source: "LinkedIn",
    status: "Active",
    lastAction: "Account enriched",
    fit: "Moderate",
    intentType: "Growth",
    notes: "Message around founder leverage and daily drafting cadence.",
  },
  {
    id: "icp-011",
    name: "Claire Okafor",
    title: "Content Lead",
    company: "PulseMetric",
    segment: "Analytics",
    location: "London, UK",
    signal: "Changelog traffic spike",
    score: 77,
    source: "Website",
    status: "Active",
    lastAction: "SEO brief created",
    fit: "Moderate",
    intentType: "Search demand",
    notes: "Good target for SEO/GEO engine workflow using owned source material.",
  },
  {
    id: "icp-012",
    name: "Ravi Kapoor",
    title: "Head of Revenue",
    company: "TerraStack",
    segment: "Climate SaaS",
    location: "Boston, MA",
    signal: "Call raised objection about consistency",
    score: 75,
    source: "Google Meet",
    status: "Review",
    lastAction: "Voice check requested",
    fit: "Moderate",
    intentType: "Objection",
    notes: "Needs trust-building around voice match and approval controls.",
  },
  {
    id: "icp-013",
    name: "Hana Wells",
    title: "Product Marketer",
    company: "CobaltWorks",
    segment: "Security",
    location: "Portland, OR",
    signal: "Asked for competitor teardown",
    score: 74,
    source: "Notion",
    status: "Review",
    lastAction: "Research clipped",
    fit: "Moderate",
    intentType: "Comparison",
    notes: "Competitor response flow can create a precise, source-backed asset pack.",
  },
  {
    id: "icp-014",
    name: "Dina Farrow",
    title: "CEO",
    company: "MintPath",
    segment: "HR Tech",
    location: "Atlanta, GA",
    signal: "Announced beta launch",
    score: 72,
    source: "X",
    status: "New",
    lastAction: "Signal captured",
    fit: "Moderate",
    intentType: "Launch",
    notes: "Potential launch repurposing fit after more account enrichment.",
  },
  {
    id: "icp-015",
    name: "Owen Fletcher",
    title: "Founder",
    company: "BeaconOps",
    segment: "Services",
    location: "Nashville, TN",
    signal: "Asked about AI reply quality",
    score: 71,
    source: "Reddit",
    status: "New",
    lastAction: "Reply suggested",
    fit: "Moderate",
    intentType: "Education",
    notes: "Keep reply practical; avoid heavy platform language.",
  },
  {
    id: "icp-016",
    name: "Mei Laurent",
    title: "Growth Lead",
    company: "VersePilot",
    segment: "Creator Tools",
    location: "Paris, France",
    signal: "Shared a content backlog problem",
    score: 69,
    source: "Slack",
    status: "New",
    lastAction: "Added to monitor",
    fit: "Moderate",
    intentType: "Problem aware",
    notes: "May need lighter-weight content queue positioning.",
  },
  {
    id: "icp-017",
    name: "Caleb Stone",
    title: "Marketing Ops",
    company: "PrismScale",
    segment: "Data",
    location: "Phoenix, AZ",
    signal: "Requested CRM enrichment examples",
    score: 68,
    source: "CRM",
    status: "New",
    lastAction: "Source mapped",
    fit: "Moderate",
    intentType: "Workflow",
    notes: "Relevant for source ingestion and account-level signal tracking.",
  },
  {
    id: "icp-018",
    name: "Zara Lin",
    title: "Founder",
    company: "Kitefield",
    segment: "Edtech",
    location: "Singapore",
    signal: "Published founder essay",
    score: 66,
    source: "LinkedIn",
    status: "Review",
    lastAction: "Voice sample saved",
    fit: "Low",
    intentType: "Voice",
    notes: "Strong voice sample, but buying urgency is unclear.",
  },
  {
    id: "icp-019",
    name: "Hugo Marin",
    title: "Product Lead",
    company: "RelayNorth",
    segment: "Logistics",
    location: "Madrid, Spain",
    signal: "Docs page updated",
    score: 64,
    source: "Website",
    status: "Review",
    lastAction: "Brief queued",
    fit: "Low",
    intentType: "Search demand",
    notes: "Could become SEO/GEO brief after more ICP evidence.",
  },
  {
    id: "icp-020",
    name: "Tessa Bloom",
    title: "Founder",
    company: "FrameKit",
    segment: "Design Tools",
    location: "Brooklyn, NY",
    signal: "Mentioned inconsistent posting",
    score: 62,
    source: "X",
    status: "New",
    lastAction: "Monitor added",
    fit: "Low",
    intentType: "Awareness",
    notes: "Better nurture candidate than immediate reply target.",
  },
];

export const demoContentFlows: ContentFlow[] = [
  {
    id: "flow-founder-led-content",
    name: "Founder-led Content",
    status: "Live",
    drafts: 18,
    published: 42,
    warmICPs: 116,
    replies: 14,
    sources: ["LinkedIn", "Slack", "Google Meet"],
    nextRun: "Today 4:30 PM",
    steps: ["Ingest voice", "Find signals", "Draft thread", "Approve", "Publish"],
  },
  {
    id: "flow-launch-repurposing",
    name: "Launch Repurposing",
    status: "Queued",
    drafts: 11,
    published: 27,
    warmICPs: 82,
    replies: 9,
    sources: ["Website", "Notion", "CRM"],
    nextRun: "Tomorrow 9:00 AM",
    steps: ["Parse launch", "Extract claims", "Create variants", "Schedule", "Track"],
  },
  {
    id: "flow-customer-insight-engine",
    name: "Customer Insight Engine",
    status: "Live",
    drafts: 9,
    published: 31,
    warmICPs: 94,
    replies: 18,
    sources: ["Google Meet", "Slack", "CRM"],
    nextRun: "Today 6:00 PM",
    steps: ["Cluster calls", "Tag pain", "Find proof", "Draft posts", "Draft replies"],
  },
  {
    id: "flow-seo-geo-engine",
    name: "SEO/GEO Engine",
    status: "Review",
    drafts: 7,
    published: 19,
    warmICPs: 53,
    replies: 4,
    sources: ["Website", "Notion", "Reddit"],
    nextRun: "Fri 10:00 AM",
    steps: ["Find questions", "Map keywords", "Draft brief", "Generate page", "Review"],
  },
  {
    id: "flow-competitor-response",
    name: "Competitor Response",
    status: "Draft",
    drafts: 5,
    published: 9,
    warmICPs: 39,
    replies: 6,
    sources: ["X", "Reddit", "CRM"],
    nextRun: "Mon 11:30 AM",
    steps: ["Detect mention", "Score intent", "Pull proof", "Draft response", "Route"],
  },
];

export const demoQueue: {
  drafts: QueueItem[];
  scheduledPosts: QueueItem[];
  suggestedReplies: QueueItem[];
  publishedPosts: QueueItem[];
} = {
  drafts: [
    {
      id: "draft-001",
      type: "draft",
      channel: "LinkedIn",
      title: "LinkedIn post from customer call",
      source: "Google Meet",
      segment: "AI SaaS",
      status: "Review",
      scheduledFor: "Unscheduled",
      confidence: 94,
      body: "Teams do not need more generic content prompts. They need a way to turn actual customer calls into founder-led posts that preserve the pain, the proof, and the ICP context.",
      icpFit: "Excellent",
      sourceContext: "Pulled from 3 customer call clips about generic AI copy and slow founder review cycles.",
    },
    {
      id: "draft-002",
      type: "draft",
      channel: "X",
      title: "X thread from launch note",
      source: "Website",
      segment: "AI SaaS",
      status: "Ready",
      scheduledFor: "Unscheduled",
      confidence: 89,
      body: "1/ Launch notes should not die on the changelog. The strongest launches become founder posts, short threads, replies, and search briefs while the market signal is still warm.",
      icpFit: "Strong",
      sourceContext: "Repurposed from the launch page, Notion release notes, and 18 recent website visits.",
    },
    {
      id: "draft-003",
      type: "draft",
      channel: "Reddit",
      title: "Reddit reply from market question",
      source: "Reddit",
      segment: "B2B SaaS",
      status: "Review",
      scheduledFor: "Unscheduled",
      confidence: 81,
      body: "If the concern is generic AI copy, look for whether the workflow can reuse your real calls, launch notes, and customer language across channels instead of starting from a blank prompt.",
      icpFit: "Moderate",
      sourceContext: "Based on a market question in a content operations thread with buying-intent comments.",
    },
    {
      id: "draft-004",
      type: "draft",
      channel: "SEO/GEO",
      title: "SEO/GEO brief from product update",
      source: "Notion",
      segment: "Product Marketing",
      status: "Draft",
      scheduledFor: "Unscheduled",
      confidence: 86,
      body: "Brief: source-aware content generation for technical founders. Cover source ingestion, ICP scoring, founder voice matching, publishing approval, and warm reply management.",
      icpFit: "Strong",
      sourceContext: "Created from the latest product update, website copy, and Notion positioning notes.",
    },
  ],
  scheduledPosts: [
    {
      id: "scheduled-001",
      type: "scheduled",
      channel: "LinkedIn",
      title: "Why founder content stalls",
      source: "Slack",
      segment: "Founders",
      status: "Scheduled",
      scheduledFor: "Today 5:15 PM",
      confidence: 93,
      body: "A short founder-led post about turning internal context into reliable daily drafts.",
      icpFit: "Excellent",
      sourceContext: "Slack launch notes plus recent founder voice examples.",
    },
    {
      id: "scheduled-002",
      type: "scheduled",
      channel: "X",
      title: "Launch note teardown",
      source: "Website",
      segment: "AI SaaS",
      status: "Queued",
      scheduledFor: "Tomorrow 8:40 AM",
      confidence: 86,
      body: "A compact thread repurposing the latest launch note into market-facing proof points.",
      icpFit: "Strong",
      sourceContext: "Website launch note and ICP reactions from LinkedIn.",
    },
    {
      id: "scheduled-003",
      type: "scheduled",
      channel: "Email",
      title: "ICP signal recap",
      source: "CRM",
      segment: "Revenue",
      status: "Ready",
      scheduledFor: "Tomorrow 10:00 AM",
      confidence: 89,
      body: "A pipeline-friendly email that highlights hot accounts, objections, and suggested replies.",
      icpFit: "Strong",
      sourceContext: "CRM opportunities and warm audience changes from the last 24 hours.",
    },
    {
      id: "scheduled-004",
      type: "scheduled",
      channel: "Blog",
      title: "Source ingestion playbook",
      source: "Notion",
      segment: "Product Marketing",
      status: "Review",
      scheduledFor: "Fri 1:00 PM",
      confidence: 81,
      body: "A practical article on turning source material into ICP-aware content workflows.",
      icpFit: "Moderate",
      sourceContext: "Notion playbook notes and customer onboarding questions.",
    },
  ],
  suggestedReplies: [
    {
      id: "reply-001",
      type: "reply",
      channel: "LinkedIn",
      title: "Reply to Maya Ren",
      source: "LinkedIn",
      segment: "AI SaaS",
      status: "Pending",
      scheduledFor: "Now",
      confidence: 94,
      body: "Totally agree. The unlock is keeping source context attached through the whole draft and reply workflow, so the output sounds like the founder and still maps to the ICP signal.",
      icpName: "Maya Ren",
      signal: "Commented on founder-led post",
      original: "This is exactly where most AI writing tools fall down: they lose the source and end up sounding generic.",
      icpFit: "Excellent",
      sourceContext: "LinkedIn comment on founder-led content post, plus 2 prior profile visits.",
    },
    {
      id: "reply-002",
      type: "reply",
      channel: "Email",
      title: "Reply to Sofia Bennett",
      source: "CRM",
      segment: "Fintech",
      status: "Draft",
      scheduledFor: "Today 2:20 PM",
      confidence: 87,
      body: "The quickest win is usually separating signal capture from reply drafting. Helixar can turn those CRM notes into specific replies without losing the account context.",
      icpName: "Sofia Bennett",
      signal: "Asked about reply workflow",
      original: "We have CRM notes everywhere, but converting them into timely replies is still manual.",
      icpFit: "Strong",
      sourceContext: "CRM note from active opportunity and recent pricing-page return visit.",
    },
    {
      id: "reply-003",
      type: "reply",
      channel: "X",
      title: "Reply to Elliot Shin",
      source: "X",
      segment: "AI SaaS",
      status: "Ready",
      scheduledFor: "Today 4:10 PM",
      confidence: 82,
      body: "Founder-led content scales better when the system starts with voice samples, customer proof, and ICP timing instead of a blank prompt.",
      icpName: "Elliot Shin",
      signal: "Mentioned content automation",
      original: "Trying to scale founder-led content without turning it into brand sludge is harder than it looks.",
      icpFit: "Strong",
      sourceContext: "X post with category pain language and two competitor mentions.",
    },
    {
      id: "reply-004",
      type: "reply",
      channel: "Reddit",
      title: "Reply to Amina Cho",
      source: "Reddit",
      segment: "B2B SaaS",
      status: "Review",
      scheduledFor: "Tomorrow 9:30 AM",
      confidence: 76,
      body: "If the issue is generic AI copy, the differentiator to look for is whether the tool can cite and reuse your actual source material across channels.",
      icpName: "Amina Cho",
      signal: "Asked market question",
      original: "Any tools that actually use internal source material instead of just producing more generic content?",
      icpFit: "Moderate",
      sourceContext: "Reddit thread about AI content workflows with high reply velocity.",
    },
  ],
  publishedPosts: [
    {
      id: "published-001",
      type: "published",
      channel: "LinkedIn",
      title: "Content systems start with signals",
      source: "Slack",
      segment: "Founders",
      status: "Published",
      scheduledFor: "Yesterday 9:15 AM",
      confidence: 95,
      body: "The best founder content systems begin with market signals, not empty calendars. Calls, Slack notes, website visits, and replies tell you what to say next.",
      icpFit: "Excellent",
      sourceContext: "Published from Founder-led Content flow after voice and claims review.",
    },
    {
      id: "published-002",
      type: "published",
      channel: "X",
      title: "ICP reaction loop",
      source: "LinkedIn",
      segment: "Devtools",
      status: "Published",
      scheduledFor: "Mon 8:20 AM",
      confidence: 88,
      body: "A short thread on turning ICP reactions into the next source-aware content angle.",
      icpFit: "Strong",
      sourceContext: "Published from 46 LinkedIn engagements and recent X category discussion.",
    },
    {
      id: "published-003",
      type: "published",
      channel: "Blog",
      title: "Source ingestion for GTM teams",
      source: "Notion",
      segment: "Product Marketing",
      status: "Published",
      scheduledFor: "Fri 12:05 PM",
      confidence: 84,
      body: "A search-ready brief covering source ingestion, signal scoring, approval, publishing, and reply management.",
      icpFit: "Strong",
      sourceContext: "Published from SEO/GEO Engine after Notion and Website source review.",
    },
  ],
};

export const demoInsights: DemoInsights = {
  metrics: [
    { id: "metric-content-generated", label: "Content Generated", value: "146" },
    { id: "metric-avg-drafts", label: "Avg Drafts/Day", value: "5" },
    { id: "metric-warm-icps", label: "Warm ICPs", value: "64" },
    { id: "metric-active-signals", label: "Active Signals", value: "13" },
    { id: "metric-reply-rate", label: "Reply Rate", value: "18%" },
  ],
  dateFilters: ["7 days", "30 days", "This month"],
  dailyPerformance: {
    dates: [
      { id: "jun-03", label: "Jun 03" },
      { id: "jun-04", label: "Jun 04" },
      { id: "jun-05", label: "Jun 05" },
      { id: "jun-06", label: "Jun 06" },
      { id: "jun-07", label: "Jun 07" },
      { id: "jun-08", label: "Jun 08" },
      { id: "jun-09", label: "Jun 09" },
    ],
    rows: [
      {
        id: "daily-founder-led",
        flow: "Founder-led Content",
        cells: [
          { dateId: "jun-03", signals: 14, warmIcps: 6 },
          { dateId: "jun-04", signals: 18, warmIcps: 8 },
          { dateId: "jun-05", signals: 16, warmIcps: 7 },
          { dateId: "jun-06", signals: 21, warmIcps: 9 },
          { dateId: "jun-07", signals: 15, warmIcps: 5 },
          { dateId: "jun-08", signals: 24, warmIcps: 11 },
          { dateId: "jun-09", signals: 19, warmIcps: 8 },
        ],
      },
      {
        id: "daily-launch-repurposing",
        flow: "Launch Repurposing",
        cells: [
          { dateId: "jun-03", signals: 9, warmIcps: 3 },
          { dateId: "jun-04", signals: 12, warmIcps: 4 },
          { dateId: "jun-05", signals: 17, warmIcps: 6 },
          { dateId: "jun-06", signals: 14, warmIcps: 5 },
          { dateId: "jun-07", signals: 11, warmIcps: 4 },
          { dateId: "jun-08", signals: 18, warmIcps: 7 },
          { dateId: "jun-09", signals: 16, warmIcps: 6 },
        ],
      },
      {
        id: "daily-customer-insight",
        flow: "Customer Insight Engine",
        cells: [
          { dateId: "jun-03", signals: 13, warmIcps: 5 },
          { dateId: "jun-04", signals: 15, warmIcps: 6 },
          { dateId: "jun-05", signals: 19, warmIcps: 8 },
          { dateId: "jun-06", signals: 22, warmIcps: 10 },
          { dateId: "jun-07", signals: 17, warmIcps: 7 },
          { dateId: "jun-08", signals: 20, warmIcps: 9 },
          { dateId: "jun-09", signals: 23, warmIcps: 10 },
        ],
      },
      {
        id: "daily-seo-geo",
        flow: "SEO/GEO Engine",
        cells: [
          { dateId: "jun-03", signals: 7, warmIcps: 2 },
          { dateId: "jun-04", signals: 8, warmIcps: 2 },
          { dateId: "jun-05", signals: 10, warmIcps: 3 },
          { dateId: "jun-06", signals: 12, warmIcps: 4 },
          { dateId: "jun-07", signals: 9, warmIcps: 3 },
          { dateId: "jun-08", signals: 14, warmIcps: 5 },
          { dateId: "jun-09", signals: 13, warmIcps: 4 },
        ],
      },
      {
        id: "daily-competitor-response",
        flow: "Competitor Response",
        cells: [
          { dateId: "jun-03", signals: 6, warmIcps: 2 },
          { dateId: "jun-04", signals: 9, warmIcps: 3 },
          { dateId: "jun-05", signals: 8, warmIcps: 3 },
          { dateId: "jun-06", signals: 11, warmIcps: 4 },
          { dateId: "jun-07", signals: 10, warmIcps: 4 },
          { dateId: "jun-08", signals: 13, warmIcps: 5 },
          { dateId: "jun-09", signals: 12, warmIcps: 4 },
        ],
      },
    ],
  },
  signalPerformance: [
    { id: "signal-founder-led-content", signal: "founder-led content", type: "Social", drafts: 34, warmIcps: 18, replies: 9, volume: "High" },
    { id: "signal-content-automation", signal: "content automation", type: "Intent", drafts: 28, warmIcps: 14, replies: 7, volume: "High" },
    { id: "signal-pricing-objection", signal: "pricing objection", type: "Objection", drafts: 15, warmIcps: 8, replies: 5, volume: "Medium" },
    { id: "signal-competitor-comments", signal: "competitor comments", type: "Market", drafts: 19, warmIcps: 11, replies: 6, volume: "Medium" },
    { id: "signal-launch-reactions", signal: "launch reactions", type: "Launch", drafts: 23, warmIcps: 12, replies: 8, volume: "High" },
    { id: "signal-geo-content", signal: "GEO content", type: "Search", drafts: 12, warmIcps: 5, replies: 3, volume: "Low" },
    { id: "signal-website-return-visits", signal: "website return visits", type: "Owned", drafts: 18, warmIcps: 10, replies: 4, volume: "Medium" },
  ],
  sourcePerformance: [
    { id: "source-perf-slack", source: "Slack", itemsSynced: 4286, drafts: 31, warmIcps: 14, lastSync: "4m ago", health: 98 },
    { id: "source-perf-calls", source: "Calls", itemsSynced: 342, drafts: 24, warmIcps: 12, lastSync: "11m ago", health: 94 },
    { id: "source-perf-linkedin", source: "LinkedIn", itemsSynced: 2184, drafts: 36, warmIcps: 18, lastSync: "18m ago", health: 91 },
    { id: "source-perf-x", source: "X", itemsSynced: 1740, drafts: 18, warmIcps: 8, lastSync: "26m ago", health: 88 },
    { id: "source-perf-reddit", source: "Reddit", itemsSynced: 624, drafts: 14, warmIcps: 6, lastSync: "1h ago", health: 76 },
    { id: "source-perf-website", source: "Website", itemsSynced: 118, drafts: 12, warmIcps: 4, lastSync: "2h ago", health: 97 },
    { id: "source-perf-notion", source: "Notion", itemsSynced: 286, drafts: 11, warmIcps: 2, lastSync: "5h ago", health: 84 },
  ],
};

export const demoCopilotSuggestions: CopilotSuggestion[] = [
  {
    id: "copilot-call-to-posts",
    title: "Turn latest call into posts",
    description: "Extract customer language from the newest transcript and create three channel-ready drafts.",
    source: "Google Meet",
    priority: "High",
    confidence: 93,
    action: "Create drafts",
  },
  {
    id: "copilot-founder-thread",
    title: "Create founder-led thread",
    description: "Use the latest founder voice samples and hot ICP signals to draft a concise LinkedIn thread.",
    source: "LinkedIn",
    priority: "High",
    confidence: 91,
    action: "Draft thread",
  },
  {
    id: "copilot-icp-reactions",
    title: "Find ICP reactions",
    description: "Scan recent social reactions and identify warm accounts with reply-ready context.",
    source: "LinkedIn",
    priority: "Medium",
    confidence: 86,
    action: "Find accounts",
  },
  {
    id: "copilot-launch-note",
    title: "Repurpose launch note",
    description: "Turn the launch page into social posts, an email variant, and a search brief.",
    source: "Website",
    priority: "High",
    confidence: 89,
    action: "Repurpose",
  },
  {
    id: "copilot-warm-replies",
    title: "Draft replies to warm ICPs",
    description: "Use CRM notes and public signals to create short replies for the warm audience queue.",
    source: "CRM",
    priority: "High",
    confidence: 88,
    action: "Draft replies",
  },
  {
    id: "copilot-geo-brief",
    title: "Generate SEO/GEO brief",
    description: "Cluster category questions and generate a brief from website, Notion, and Reddit sources.",
    source: "Notion",
    priority: "Medium",
    confidence: 82,
    action: "Create brief",
  },
];

export const demoCopilotContext: CopilotContextItem[] = [
  { id: "context-slack", source: "Slack", detail: "12 updates" },
  { id: "context-calls", source: "Calls", detail: "3 transcripts" },
  { id: "context-linkedin", source: "LinkedIn", detail: "46 engagements" },
  { id: "context-website", source: "Website", detail: "18 ICP visits" },
];

export const demoCopilotOutputs: CopilotOutputCard[] = [
  {
    id: "output-linkedin-post",
    title: "LinkedIn Post",
    channel: "LinkedIn",
    preview:
      "Founder-led content does not scale from blank prompts. It scales when call notes, Slack updates, ICP reactions, and product proof stay attached to the draft from the first line.",
    segment: "AI SaaS founders",
    source: "Google Meet",
    confidence: 94,
    voiceMatch: 96,
  },
  {
    id: "output-x-thread",
    title: "X Thread",
    channel: "X",
    preview:
      "1/ The best content systems start with signals, not topics. Pull the call, map the ICP, find the objection, then draft in the founder's voice.",
    segment: "Devtools",
    source: "LinkedIn",
    confidence: 88,
    voiceMatch: 92,
  },
  {
    id: "output-reddit-reply",
    title: "Reddit Reply",
    channel: "Reddit",
    preview:
      "If the pain is generic AI copy, look for whether the workflow can reuse your actual calls, launch notes, and customer language instead of asking for another prompt.",
    segment: "B2B SaaS",
    source: "Reddit",
    confidence: 82,
    voiceMatch: 89,
  },
  {
    id: "output-seo-geo-brief",
    title: "SEO/GEO Brief",
    channel: "SEO/GEO",
    preview:
      "Brief: source-aware content generation for technical founders. Include sections on signal ingestion, ICP scoring, voice matching, approval, and reply management.",
    segment: "Product marketing",
    source: "Website",
    confidence: 86,
    voiceMatch: 91,
  },
];

export const demoData = {
  dashboard: demoDashboard,
  audienceSignals: demoAudienceSignals,
  sourceDiscovery: demoSourceDiscovery,
  sources: demoSources,
  metrics: demoMetrics,
  icpAudience: demoIcpAudience,
  contentFlows: demoContentFlows,
  queue: demoQueue,
  insights: demoInsights,
  copilotSuggestions: demoCopilotSuggestions,
  copilotContext: demoCopilotContext,
  copilotOutputs: demoCopilotOutputs,
};
