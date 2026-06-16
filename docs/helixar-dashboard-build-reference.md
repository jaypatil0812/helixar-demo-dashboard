# Helixar Dashboard Build Reference

This document captures the current Helixar dashboard build: product intent, onboarding flow, page structure, visible copy, demo data, controls, and supporting UI elements.

Last reviewed from:

- App entry: `src/App.tsx`
- Demo data: `src/lib/demoData.ts`
- UI primitives: `src/components/DashboardPrimitives.tsx`
- Styles: `src/styles.css`
- Local app: `http://127.0.0.1:5173/`

## Product Intent

Helixar is a founder-led LinkedIn and X posting and engagement workspace.

The dashboard is built around these jobs:

- Convert founder, company, website, Slack, Telegram, LinkedIn, and X context into posts, threads, replies, and relationship memory.
- Help teams review, schedule, publish, and track LinkedIn and X content.
- Track people who react, comment, reply, or repeatedly engage, then convert them into relationship cards.
- Keep the system focused on source-backed content instead of generic AI social copy.
- Keep approval and founder review clear before high-risk replies, quote posts, or product claims.

The current build is a frontend prototype with local React state, hardcoded demo data, simulated loading states, and toast feedback. There is no real backend integration yet.

## Routing

The app uses an internal route map based on `window.location.pathname`.

Visible routes:

| Route | Navigation Label | Page Title | Subtitle |
| --- | --- | --- | --- |
| `/onboarding` | Not in sidebar | Onboarding | Initial setup flow |
| `/dashboard` | Dashboard | Dashboard | Overview |
| `/copilot` | Copilot | Copilot | Ask your agent |
| `/flows` | Agent | Engagement Agent | Replies and rules. |
| `/flows/founder-led` | Not in sidebar | Founder-led Content | Sequence builder |
| `/audience` | Relationships | Relationships | People and memory. |
| `/queue` | Queue | Queue | Review and publish. |
| `/files` | Files | Files | Assets and proof. |
| `/sources` | Sources | Sources | Source data. |
| `/insights` | Insights | Insights | Performance. |
| `/settings` | Settings | Settings | Account and billing. |

Route behavior:

- `/` redirects to `/onboarding`.
- `/onboarding` shows the onboarding flow.
- Unknown paths currently fall back to `/dashboard`.
- Finishing onboarding pushes the user to `/dashboard`.

## Global Shell

The main app shell appears after onboarding.

Sidebar navigation:

- Brand button: `H`
- Dashboard
- Copilot
- Agent
- Relationships
- Queue
- Files
- Sources
- Insights
- Settings
- Help
- Credits
- User avatar: `V`

Top bar:

- Page title and subtitle from `routeMeta`
- Search input with placeholder: `Search`
- Notifications icon button
- Primary button: `Create`

Global interactions:

- `Create` opens the `Create pack` modal.
- Source rows can open the source drawer.
- Reply rows can open the reply drawer.
- Toasts show short feedback such as `Settings saved`, `Draft generated`, `Context refreshed`, and `Reply approved`.

## Onboarding

The onboarding is a four-step setup with a start screen. It is designed to gather enough founder, company, channel, and voice context before entering the dashboard.

### Onboarding Start

Primary copy:

- Pill: `Helixar setup`
- Heading: `Helixar system, let's get started.`
- Body: `Give Helixar the founder, company, and channel context it needs to write, post, and engage in your voice.`
- Button: `Get started`

Behavior:

- Clicking `Get started` moves to Step 1.

### Progress Indicator

Steps shown:

- 1
- 2
- 3
- 4

Completed steps show a check icon.

### Step 1: Connect Context

Step label:

- `Step 1 of 4`

Primary copy:

- Heading: `Connect your context`
- Body: `LinkedIn, X, and your website are enough to build the first draft.`

Website field:

- Label: `Website`
- Placeholder: `https://yourcompany.com`

Website analysis preview:

- `Analyzing {website}`
- `Positioning, product, audience, proof`

LinkedIn connect card:

- Title: `Connect LinkedIn account`
- State copy when idle: `For posts and comments`
- State copy when connected: `Connected`
- Bullets:
  - `Posts and comments`
  - `Relationship memory`
  - `Review before engagement`
- Button:
  - Idle: `Connect LinkedIn`
  - Connected: `LinkedIn connected`

X connect card:

- Title: `Connect X account`
- State copy when idle: `For posts and replies`
- State copy when connected: `Connected`
- Bullets:
  - `Posts and threads`
  - `Reply suggestions`
  - `Daily limits`
- Button:
  - Idle: `Connect X`
  - Connected: `X connected`

Footer:

- Back: `Previous`
- Left note: `Connect later`
- Primary button: `Review draft`

Connection modal:

- Dialog label: `Connecting to {account}`
- Header: `Connect {account} account`
- Close button: `x`
- Heading: `Connecting to {account}`
- Body: `Please wait while Helixar checks account access and prepares the workspace context.`

Accounts supported by modal:

- LinkedIn
- X
- Slack
- Telegram

### Step 2: Company Context Review

Step label:

- `Step 2 of 4`

Pill:

- `Scraped draft`

Primary copy:

- Heading: `What Helixar understood`
- Body: `Edit the draft or add context in the agent panel.`

Summary cards:

- `Founder`
- Founder name
- Founder role
- `Company`
- Company name
- Website

Editable fields:

- `Name`
- `Role`
- `Company`
- `Website`
- `Company summary`
- `Product or offer`
- `Custom notes`

Default profile values:

- Name: `Jay Patil`
- Company: `Helixar`
- Website: blank until user enters it
- Role: `Founder`
- Company summary: `Helixar helps founder-led teams turn customer notes, market signals, and social activity into LinkedIn and X content that can be reviewed, scheduled, and posted from one workspace.`
- Product focus: `LinkedIn posting, X posting, and engagement workflows for founder-led content.`
- Custom notes: blank

Footer:

- Back: `Previous`
- Primary button: `Answer voice questions`

Agent side panel:

- Header: `Helixar Agent`
- Subcopy: `Talk through the missing context`
- Question buttons:
  - `Who do you sell to?`
  - `What should posts repeat?`
  - `What should Helixar avoid?`
  - `When should it ask you?`
- Input label: `Answer here`
- Textarea placeholder: `Type naturally. Add audience, tone, boundaries, examples...`
- Icon button: microphone
- Send button: `Send`

Current behavior:

- The agent panel is visual only. It does not yet persist chat answers into profile fields.

### Step 3: Review Voice Rules

Step label:

- `Step 3 of 4`

Pill:

- `Review`

Primary copy:

- Heading: `Review voice rules`
- Body: `Edit anything before Helixar enters the dashboard.`

Voice card:

- Label: `Voice`
- Main value: `Direct, useful, founder-led`
- Body: `Specific pain, clear opinions, practical proof.`

Sources card:

- Label: `Sources`
- Main value: company name
- Bullets:
  - `LinkedIn posts`
  - `X posts and replies`
  - `Website context`

Voice question cards:

- `Core message`
- `Repeated opinions`
- `Avoid saying`
- `Ask before`

Each question card contains:

- Textarea placeholder: `Edit the rule...`
- Button: `Audio`

Footer:

- Back: `Previous`
- Left note: `Editable later`
- Primary button: `Connect team channels`

### Step 4: Connect Team Channels

Step label:

- `Step 4 of 4`

Pill:

- `Team context`

Primary copy:

- Heading: `Connect team channels`
- Body: `Slack and Telegram add live context.`

Slack card:

- Title: `Connect Slack`
- State copy when idle: `Customer notes`
- State copy when connected: `Connected`
- Bullets:
  - `Customer phrasing`
  - `Content ideas`
  - `Review mode`
- Button:
  - Idle: `Connect Slack`
  - Connected: `Slack connected`

Telegram card:

- Title: `Connect Telegram`
- State copy when idle: `Founder notes`
- State copy when connected: `Connected`
- Bullets:
  - `Quick notes`
  - `Draft context`
  - `Relationship memory`
- Button:
  - Idle: `Connect Telegram`
  - Connected: `Telegram connected`

Footer:

- Back: `Previous`
- Left note: `You can connect these later`
- Primary button: `Enter dashboard`

Completion:

- `Enter dashboard` routes to `/dashboard`.

## Dashboard Page

Route:

- `/dashboard`

Page purpose:

- High-level overview of channel status, output, relationship growth, activity graph, agent updates, and customer signals.

Welcome header:

- `Welcome back`
- Time filters:
  - `7 days`
  - `30 days`
  - `3 months`
  - `This month`
- Default filter: `30 days`

Summary cards:

Channels:

- Status: `Connected`
- Label: `Channels`
- Value: `2`
- Detail: `Slack and Telegram`
- Channels:
  - `Slack Connected`
  - `Telegram Connected`

Output:

- Status: `Active`
- Label: `Output`
- Value: calculated from content flows: drafts + published + replies
- Detail: `Posts and replies`
- Foot values:
  - `{draft count} drafts`
  - `{reply count} replies`

Relationships:

- Status: `Rising`
- Label: `Relationships`
- Value: total warm people from content flows
- Detail: `Warm people`
- Button: `Open`
- Fit detail: `{voiceMatch}% fit`

Activity chart:

- Eyebrow: `Activity Overview`
- Heading: `Actions`
- Platform toggles:
  - `X`
  - `LI`
- Range badge: active time filter
- Metrics:
  - `Actions`
  - `Content`
  - `Replies`
- Inspector card:
  - Total: `{totalActions} total`
  - Peak: `Peak: {peakDate} with {peakActions}`
  - Active day values for Actions, Content, Replies

Activity graph data:

- `7 days`: Jun 5 to Jun 11, with natural bumps and drop-off.
- `30 days`: May 12 to Jun 11, mostly quiet until early June, then spikes and decay.
- `3 months`: weekly Apr to Jun values.
- `This month`: Jun 1 to Jun 11.

Agent updates panel:

- Eyebrow: `Agents`
- Heading: `Agent updates`
- Status: `Live`
- Rows use first four content flows:
  - `Founder-led Content`
  - `Launch Repurposing`
  - `Customer Insight Engine`
  - `Post Performance Loop`
- Row shows sources, published count, and flow status.

Customer signals panel:

- Eyebrow: `Segments`
- Heading: `Customer signals`
- Button: `View More`
- Shows first four relationship/audience records:
  - Maya Ren
  - Jonah Vale
  - Leah Moreno
  - Ishan Rao
- Each row shows role, company, signal, and score.

## Copilot Page

Route:

- `/copilot`

Page purpose:

- Chat-like command surface for post analysis, improvement, missing context, and engagement analysis.

Hero:

- Heading: `Ask your agent`
- Body: `Review post performance, improve drafts, or analyze LinkedIn and X engagement.`
- Connected context badges:
  - LinkedIn
  - X
  - Slack
  - Telegram

Input:

- Textarea aria label: `Ask your agent`
- Placeholder: `Send a message to your agent`
- Left action: attach source
- Right status text: `Agent ready`
- Voice button toggles a voice waveform.
- Send button:
  - Idle: `Send`
  - Loading: `Thinking`

Suggested prompts:

- Section label: `Suggested for you`
- `Show me my post performance`
  - Detail: `Compare LinkedIn and X posts by reach, replies, and relationship signals.`
- `How can I make my next post better?`
  - Detail: `Review hook, proof, structure, and missing context before publishing.`
- `What context is missing before I post?`
  - Detail: `Find customer proof, voice samples, or source notes that would improve the draft.`
- `Analyze my LinkedIn and X engagement`
  - Detail: `Show which reactions, comments, and replies are creating relationships.`

Loading response:

- Eyebrow: `Agent`
- Heading: `Reading workspace context`
- Status: `Working`

Generated response:

- Eyebrow: `Agent response`
- Heading: prompt text, or `Ready to help with your next workflow`
- Status: `Ready`
- Body: `I can work from your connected sources and keep the result tied to agent actions, customer segment movement, and reply-ready context.`
- Response actions:
  - `Save context`
  - `Open queue`
  - `Create reply pack`

Response cards use the first three copilot outputs:

- `LinkedIn Post`
- `X Thread`
- `LinkedIn Reply`

## Engagement Agent Page

Route:

- `/flows`

Page purpose:

- Control center for AI engagement actions, relationship-building replies, account connections, and rules.

Tabs:

- `Insights`
- `Activity`
- `Accounts`
- `Rules`

### Engagement Insights

Metric cards:

- `Impressions`
  - Value: `135.6k`
  - Detail: `+18% in 30 days`
- `People reached`
  - Value: `99.7k`
  - Detail: `10k saw top comments`
- `Engagement`
  - Value: `6,482`
  - Detail: `Replies, likes, saves`
- `Tweets replied to`
  - Value: `426`
  - Detail: `60/day cap active`

Graph filters:

- `7 days`
- `30 days`
- `3 months`
- `This month`

Main graph:

- Uses the same `ActivityChart` component as the dashboard.
- Inspector is hidden on this page.

Top signals card:

- Eyebrow: `Top signals`
- Heading: `What changed`
- Status: `Live`
- Rows:
  - `Operator threads are compounding`
    - `Replies on founder-led distribution posts created the strongest reach lift.`
    - `+18%`
  - `Customer proof is pulling saves`
    - `Proof-led comments are more likely to be saved or revisited.`
    - `34%`
  - `X reply cap is nearly full`
    - `The agent used 52 of 60 daily reply/comment actions.`
    - `52/60`

### Engagement Activity

Toolbar:

- Button: `All Activity`
- Count: `63 events`

Table columns:

- `Type`
- `Contact / Signal`
- `Result`
- `Date`

Rows:

- Lead Discovery | Lookalike match: Similar to your ideal lead | 7 leads analyzed | 7 matched | 4 hours ago
- Engagement | Replied to founder-led distribution thread | 10k potential reach | 1 warm reply | 5 hours ago
- Lead Discovery | Hiring right now | 25 leads analyzed | 18 matched | 6 hours ago
- Reply Draft | Customer proof comment for Maya Ren | High ICP fit | Review needed | 8 hours ago
- Lead Discovery | Lookalike match: Similar to your ideal lead | 8 leads analyzed | 8 matched | 10 hours ago
- Signal | `"founder led marketing"` | 20 leads analyzed | 0 matched | 12 hours ago
- Engagement | Acknowledged CMO post about approval rhythm | LinkedIn comment | Postable | 16 hours ago
- Lead Discovery | Social content automation | 26 leads analyzed | 1 matched | a day ago
- Lead Discovery | Hiring right now | 176 leads analyzed | 26 matched | a day ago

### Engagement Accounts

Header:

- Eyebrow: `Accounts`
- Heading: `Social Connections`
- Body: `Manage the accounts this agent can read from and engage through.`
- Button: `Add account`

Account rows:

- First account
  - Channel: LinkedIn
  - Owner: `Jay .`
  - Status: `Not connected`
  - Detail: `Connection link ready`
- Second account
  - Channel: LinkedIn
  - Owner: `Backup profile`
  - Status: `Not connected`
  - Detail: `Needs permission review`
- Primary X account
  - Channel: X
  - Owner: `Founder voice`
  - Status: `Connected`
  - Detail: `60 replies/comments daily cap`

Row actions:

- `Settings & Limits`
- `Copy connection link`
- `Connect`

### Engagement Rules

Review mode card:

- Eyebrow: `Review mode`
- Heading: `Approval behavior`
- Toggle options:
  - `Yes, review first`
  - `No, follow limits`

Agent instructions textarea:

```text
- Prioritize founders, C-suite, and operators.
- Engage with useful replies, acknowledgements, and comments before pitching.
- Avoid political, sensitive, competitor-attack, or low-fit agency threads.
- Ask for review before quote posts, LinkedIn comments, or high-risk replies.
- Update relationship memory after every meaningful engagement.
```

Limits card:

- Heading: `Limits`
- `X replies/comments`: `60/day`
- `LinkedIn comments`: `25/day`
- `Quote posts`: `Review only`

Voice card:

- Heading: `Voice`
- Body: `Warm, useful, founder-aware. Use Hinglish on X when natural; keep LinkedIn English and specific.`
- Button: `Save voice`

Narrative card:

- Heading: `Narrative`
- Body: `Founder Trust, Customer Proof, Product Education, and Category POV are the active engagement narratives.`
- Button: `Save narrative`

## Founder-led Content Flow

Route:

- `/flows/founder-led`

Page purpose:

- Sequence builder for the Founder-led Content flow.

Header:

- Eyebrow: `Flow`
- Heading: `Founder-led Content`
- Detail: next run from flow data, currently `Today 4:30 PM`
- Status: flow status, currently `Live`

Tabs:

- `Overview`
- `Flow`
- `Queue`
- `Activity`
- `Settings`

Entry source card:

- Eyebrow: `Entry`
- Heading: `Sources`
- Body: `Qualified signals enter flow`
- Sources:
  - Slack
  - Telegram
  - LinkedIn
  - X

Timeline steps:

- `Detect Angles`
  - Count: `13 signals`
  - Status: `Active`
  - Items: `Pain points`, `Product updates`, `ICP objections`
- `Create drafts`
  - Count: `18 drafts`
  - Status: `Ready`
  - Items: `LinkedIn post`, `X thread`, `Comment reply`, `Relationship note`
- `Review`
  - Count: `3 checks`
  - Status: `Queued`
  - Items: `Founder voice check`, `Claims check`, `ICP fit`
- `Publish`
  - Count: `42 live`
  - Status: `Queued`
  - Items: `LinkedIn`, `X`, `Schedule`, `Track reactions`
- `Engage`
  - Count: `14 replies`
  - Status: `Queued`
  - Items: `Monitor replies`, `Draft responses`, `Update warm ICPs`

Each step includes an `Edit` button.

End card:

- `Flow Complete`
- `Learning updates Content Brain`
- Status: `Learning`

## Relationships Page

Route:

- `/audience`

Page purpose:

- Relationship memory and customer lifecycle tracking for people who engage with LinkedIn/X posts or replies.

Main tabs:

- `Relationship Memory`
- `Customer Lifecycle`

### Relationship Memory

Metric cards:

- `ICP-fit` | `126` | `+16%`
- `Repeat` | `74` | `+9%`
- `Warm` | `32` | `+14%`
- `Waiting` | `11` | `Follow-up`
- `Founder action` | `5` | `Review`

Table card:

- Eyebrow: `Relationship Memory`
- Heading: `Tracked people`

Actions:

- `Add person`
- `Import`
- `Export`

Stage filters:

- `All`
- `Warm`
- `Needs follow-up`
- `Awaiting response`
- `Discovered`

Table columns:

- `Person`
- `Platform`
- `Engaged`
- `ICP fit`
- `Intent`
- `Stage`
- `Action`
- `Actions`

Relationship rows:

- Viraj Sharma | D2C growth studio | LinkedIn | 9x | 94% | High | Warm | Founder follow-up
- Ananya Rao | Northline Brands | LinkedIn | 6x | 88% | Medium | Awaiting response | Wait two days
- Rohan Mehta | OperatorLoop | X | 4x | 81% | Medium | Discovered | Engage once
- Neha Kapoor | House of Loom | LinkedIn | 8x | 92% | High | Needs follow-up | Review draft
- Karan Malhotra | ScaleShelf | X | 11x | 96% | High | Warm | Founder reply

Row actions:

- `View`
- `Draft Reply`
- More actions icon

Relationship drawer sections:

- Profile summary
- Platform badge
- Intent badge
- Engagement count
- `Who they are`
- `What the agent remembers`
- `Suggested next action`
- Buttons:
  - `Keep in nurture`
  - `Draft reply`

### Customer Lifecycle

Header:

- Eyebrow: `Customer Lifecycle`
- Heading: `Lifecycle groups`
- Body: `Choose which lifecycle model to track.`

Lifecycle model toggle:

- `Brand / D2C`
- `Solo founder`

Brand / D2C groups:

- `Before purchase`: 18 people, `Asking about proof, outcomes, or workflow clarity.`
- `During purchase`: 6 people, `Comparing publishing tools and approval paths.`
- `After purchase`: 4 people, `Likely to share proof or workflow snapshots.`
- `Upset customers`: 2 people, `Need human review before the agent engages.`
- `UGC/proof opportunities`: 7 people, `Reusable positive screenshots or comments.`
- `Repeat purchase opportunities`: 3 people, `Showing renewed interest in add-on support.`

Solo founder groups:

- `Cold audience`: 420 people, `People with one light engagement.`
- `Warm audience`: 32 people, `Repeat or high-intent engagement.`
- `High-value accounts`: 11 people, `Founders, CMOs, and operators to monitor.`
- `Collaborators`: 5 people, `Creators worth relationship-building.`
- `Prospects`: 9 people, `Asking implementation or workflow questions.`

Each lifecycle card includes:

- Count
- Label: `people`
- Button: `Open segment`

## Queue Page

Route:

- `/queue`

Page purpose:

- Review, schedule, publish, and manage drafts, scheduled posts, replies, published posts, and calendar placement.

Top mode tabs:

- `Queue`
- `Calendar`

### Queue Mode

Alert:

- `{readyCount} ready`
- `Next publish window`
- Button: `Open calendar`

Queue tabs:

- `Drafts` with count 4
- `Scheduled` with count 4
- `Replies` with count 4
- `Published` with count 3

Table metadata:

- Active tab status badge
- Row count

Drafts table columns:

- `Content`
- `Channel`
- `Segment`
- `Score`
- `Status`
- `Actions`

Scheduled table columns:

- `Content`
- `Channel`
- `Scheduled`
- `Score`
- `Status`
- `Actions`

Replies table columns:

- `ICP`
- `Suggested Reply`
- `Window`
- `Score`
- `Status`
- `Actions`

Published table columns:

- `Content`
- `Channel`
- `Published`
- `Score`
- `Status`
- `Actions`

Queue row action:

- `Preview`

### Queue Items

Drafts:

- `LinkedIn post from customer call`
  - Channel: LinkedIn
  - Source: Slack
  - Segment: AI SaaS
  - Status: Review
  - Score: 94
  - Body: `Turn customer notes into founder-led posts with proof and context.`
  - Fit: Excellent
  - Source context: `3 customer call clips.`
- `X thread from launch note`
  - Channel: X
  - Source: Website
  - Segment: AI SaaS
  - Status: Ready
  - Score: 89
  - Body: `1/ Turn warm launch notes into posts, threads, and replies.`
  - Fit: Strong
  - Source context: `Launch page and Telegram notes.`
- `X reply from market question`
  - Channel: X
  - Source: X
  - Segment: B2B SaaS
  - Status: Review
  - Score: 81
  - Body: `Reuse real notes instead of blank prompts.`
  - Fit: Moderate
  - Source context: `X thread with buyer intent.`
- `LinkedIn post from product update`
  - Channel: LinkedIn
  - Source: Telegram
  - Segment: Product Marketing
  - Status: Draft
  - Score: 86
  - Body: `Tie the update to pain, workflow change, and one reason to reply.`
  - Fit: Strong
  - Source context: `Product update and founder notes.`

Scheduled posts:

- `Why founder content stalls` | LinkedIn | Today 5:15 PM | Scheduled | 93
- `Launch note teardown` | X | Tomorrow 8:40 AM | Queued | 86
- `Relationship signal recap` | LinkedIn | Tomorrow 10:00 AM | Ready | 89
- `Source context thread` | X | Fri 1:00 PM | Review | 81

Suggested replies:

- `Reply to Maya Ren`
  - Original: `Most AI writing tools lose the source and sound generic.`
  - Reply: `Agree. Keep source context attached so the reply still sounds founder-led.`
  - Window: Now
  - Score: 94
  - Status: Pending
- `Reply to Sofia Bennett`
  - Original: `Post reactions are everywhere. Replies are still manual.`
  - Reply: `Separate signal capture from reply drafting. Keep account context attached.`
  - Window: Today 2:20 PM
  - Score: 87
  - Status: Draft
- `Reply to Elliot Shin`
  - Original: `Scaling founder content without brand sludge is hard.`
  - Reply: `Start with voice, proof, and timing instead of a blank prompt.`
  - Window: Today 4:10 PM
  - Score: 82
  - Status: Ready
- `Reply to Amina Cho`
  - Original: `Any tools that use internal source material?`
  - Reply: `The differentiator is whether the tool reuses actual source material.`
  - Window: Tomorrow 9:30 AM
  - Score: 76
  - Status: Review

Published posts:

- `Content systems start with signals` | LinkedIn | Yesterday 9:15 AM | Published | 95
- `ICP reaction loop` | X | Mon 8:20 AM | Published | 88
- `Source context for GTM teams` | LinkedIn | Fri 12:05 PM | Published | 84

### Preview Panel

Panel labels:

- Eyebrow: `Preview`
- Reply content label: `Original`
- Draft/reply label: `Draft` or `Reply`

Metadata:

- Source
- Fit
- Segment
- Window or Published

Actions:

- `Edit`
- Reply item: `Skip`
- Non-reply item: `Schedule`
- Reply primary: `Approve`
- Non-reply primary: `Publish`

### Calendar Mode

Header:

- Eyebrow: `Calendar`
- Heading: `Publishing calendar`
- Body: `Scheduled posts`
- Button: `Back to queue`

Calendar days:

- Mon, Jun 8
- Tue, Jun 9
- Wed, Jun 10
- Thu, Jun 11
- Fri, Jun 12
- Sat, Jun 13
- Sun, Jun 14

Empty day copy:

- `Open slot`

Unscheduled strip:

- Eyebrow: `Unscheduled`
- `{count} need dates`

Calendar item cards show:

- Time
- Title
- Body
- Channel
- Status

## Files Page

Route:

- `/files`

Page purpose:

- Manage images, videos, documents, and data files used as proof, context, or assets for LinkedIn/X drafts.

Toolbar:

- Ownership tabs:
  - `Mine`
  - `Shared with me`
- Search placeholder: `Search files`
- Filters icon button

Filter panel:

- Eyebrow: `Type`
- Type filters:
  - `All`
  - `Images`
  - `Videos`
  - `Documents`
  - `Data`
- Status selector:
  - `All statuses`
  - `Approved`
  - `Needs info`
  - `In review`

Upload strip:

- Eyebrow: `Add assets`
- Heading: `Upload assets`
- Body: `Images, clips, proof.`
- Upload options:
  - `Computer`
  - `Google Drive`
  - `Dropbox`

Summary cards:

- `Total`: 9
- `Images`: 5
- `Videos`: 2
- `Needs info`: 2

Library card:

- Eyebrow: `Assets`
- Heading: active ownership, usually `Mine`
- Count: `{filteredAssets.length} files`
- Button: `Upload asset`

Empty state:

- `No files found`
- `Try a different search or filter.`

Asset detail panel:

- Eyebrow: asset kind
- Title: asset name
- Description
- Status
- Usage
- Source
- Detail fields:
  - Owner
  - Updated
  - Size
  - Used
  - Channels
- Actions:
  - `Download`
  - `Attach`

File assets:

- `Customer review screenshot`
  - Kind: Image
  - Owner: Mine
  - Source: LinkedIn
  - Status: Approved
  - Usage: Unused
  - Updated: Today 10:24 AM
  - Size: 1.8 MB
  - Extension: PNG
  - Description: `Proof screenshot for trust-led posts.`
  - Tags: Customer Proof, LinkedIn, Trust
  - Used in: Proof posts
  - Platform fit: LinkedIn high
- `Founder photo`
  - Kind: Image
  - Owner: Mine
  - Source: Slack
  - Status: Approved
  - Usage: Used recently
  - Updated: Yesterday 4:12 PM
  - Size: 3.2 MB
  - Extension: JPG
  - Description: `Founder image for lessons and hiring posts.`
  - Tags: Founder Trust, Hiring, Profile
  - Used in: Founder content
  - Platform fit: LinkedIn high
- `Product education carousel`
  - Kind: Image
  - Owner: Mine
  - Source: Telegram
  - Status: Needs info
  - Usage: Unused
  - Updated: Jun 10 6:40 PM
  - Size: 8.4 MB
  - Extension: PDF
  - Description: `Carousel on the agent workflow.`
  - Tags: Product Education, Carousel, Review
  - Used in: Needs info
  - Platform fit: LinkedIn high
- `Customer testimonial video`
  - Kind: Video
  - Owner: Shared with me
  - Source: Slack
  - Status: Approved
  - Usage: Unused
  - Updated: Jun 9 1:18 PM
  - Size: 42 MB
  - Extension: MP4
  - Duration: 01:18
  - Description: `Short customer proof clip.`
  - Tags: Video, Customer Proof, Proof
  - Used in: Proof posts
  - Platform fit: LinkedIn high
- `UGC screenshot`
  - Kind: Image
  - Owner: Shared with me
  - Source: X
  - Status: Approved
  - Usage: Unused
  - Updated: Jun 8 11:05 AM
  - Size: 960 KB
  - Extension: PNG
  - Description: `Audience language from X.`
  - Tags: UGC, Market Signal, X
  - Used in: X thread
  - Platform fit: X high
- `Comparison graphic`
  - Kind: Image
  - Owner: Mine
  - Source: LinkedIn
  - Status: Approved
  - Usage: Used before
  - Updated: Jun 7 3:32 PM
  - Size: 2.6 MB
  - Extension: SVG
  - Description: `Single control-center graphic.`
  - Tags: Category POV, Graphic, LinkedIn
  - Used in: Performance post
  - Platform fit: LinkedIn medium, X medium
- `Customer call clips pack`
  - Kind: Video
  - Owner: Mine
  - Source: Telegram
  - Status: In review
  - Usage: Unused
  - Updated: Jun 6 5:46 PM
  - Size: 128 MB
  - Extension: MP4
  - Duration: 08:42
  - Description: `Customer clips on review bottlenecks.`
  - Tags: Voice Notes, Pain, Review
  - Used in: Customer-call post
  - Platform fit: Proof snippets
- `Launch repurposing brief`
  - Kind: Document
  - Owner: Mine
  - Source: Telegram
  - Status: Approved
  - Usage: Used recently
  - Updated: Jun 6 9:14 AM
  - Size: 420 KB
  - Extension: DOC
  - Description: `Brief for launch posts and replies.`
  - Tags: Launch, Brief, Repurpose
  - Used in: Launch teardown
  - Platform fit: All channels
- `ICP signal export`
  - Kind: Data
  - Owner: Shared with me
  - Source: LinkedIn
  - Status: Needs info
  - Usage: Unused
  - Updated: Jun 5 8:20 AM
  - Size: 740 KB
  - Extension: CSV
  - Description: `Warm people and reply priority.`
  - Tags: Relationships, Signals, Accounts
  - Used in: Unassigned
  - Platform fit: Scoring

## Sources Page

Route:

- `/sources`

Page purpose:

- Editable source of truth for onboarding/website/company/voice context.

Header:

- Eyebrow: `Context`
- Heading: `Context`
- Body: `Edit what Helixar uses.`
- Buttons:
  - `Refresh` or `Refreshing`
  - `Save`

Context fields:

- `Name`: `Jay Patil`
- `Designation`: `Founder`
- `Company name`: `Helixar`
- `Website`: `https://helixar.ai`
- `What the company does`: `Helixar helps founder-led teams turn customer notes, Slack and Telegram notes, and social engagement into LinkedIn and X posts, replies, and relationship memory.`
- `Product or offer focus`: `LinkedIn posting, X posting, engagement tracking, and relationship building from reactions, comments, and replies.`
- `Custom notes`: `Prioritize useful founder-led content. Ask before high-risk replies, strong claims, or anything that needs founder approval.`

Voice question section:

- Eyebrow: `Voice questions`
- Heading: `Answers from onboarding`

Voice fields:

- `What should people understand after reading your posts?`
  - `People should understand that Helixar keeps context attached to every post and reply, instead of generating generic social copy.`
- `Which topics, claims, or phrases should Helixar avoid?`
  - `Avoid guaranteed growth claims, fake urgency, and generic AI productivity language.`
- `When should the agent ask before posting or replying?`
  - `Ask for review before publishing quote posts, replying to important prospects, or making product claims.`

## Insights Page

Route:

- `/insights`

Page purpose:

- Gojiberry-style performance matrix showing lead/signal performance by day and AI agent.

Controls:

- Start Date: `2026-05-12`
- End Date: `2026-06-11`

KPI cards:

- `Total leads`: 672, detail `selected period`
- `Avg leads/day`: 22, detail `daily average`
- `Active signals`: 1, detail `generating leads`

Daily performance card:

- Heading: `Daily Performance Overview`
- Body: `Leads generated by agent and day.`

Matrix columns:

- `AI Agent`
- `JUN 11 Thu`
- `JUN 10 Wed`
- `JUN 9 Tue`
- `JUN 8 Mon`
- `JUN 7 Sun`
- `JUN 6 Sat`
- `JUN 5 Fri`
- `JUN 4 Thu`

Matrix agents:

- `Lookalike source discovery`
- `Outreach campaign name`

Launch card examples:

- `Lookalike source disc...`
- `Lookalike match: S...`
- `Autopilot`
- `Recently changed j...`
- `Hiring right now`
- `"founder led marketin...`
- `Engagement & Inte...`
- `"social content auto...`
- `"content ops"`
- `+ {count} more launches`

Signal performance card:

- Heading: `Signal performance`
- Body: `Leads by signal`
- Filter label: `Filter by AI Agent`
- Agent options:
  - `Lookalike source discovery`
  - `Outreach campaign name`

Signal performance table columns:

- `Signal`
- `Type`
- `Leads`

Rows for Lookalike source discovery:

- Signal: `Lookalike source discovery`
- Type: `Lookalike match: Similar to your ideal lead`
- Leads: 58

Rows for Outreach campaign name:

- `Autopilot` | `Hiring right now` | 129
- `"social content automation"` | `Engagement & Interest` | 4
- `"founder led marketing"` | `Engagement & Interest` | 3
- `"content ops"` | `Engagement & Interest` | 2

## Settings Page

Route:

- `/settings`

Page purpose:

- Focused account, channels, billing, and basic preference settings.

Header:

- Eyebrow: `Account`
- Heading: `Settings`
- Button: `Save`

Tabs:

- `Account`
- `Channels`
- `Billing`
- `Preferences`

### Account Tab

Card header:

- Eyebrow: `Account`
- Heading: `Workspace account`
- Status: `Owner`

Fields:

- `Workspace name`: `Helixar`
- `Owner name`: `Jay Patil`
- `Owner email`: `jay@helixar.ai`
- `Timezone`: `Asia/Kolkata`

Actions:

- `Copy invite link`
- `Save account`

### Channels Tab

Card:

- Eyebrow: `Channels`
- Heading: `Connected accounts`
- Status badge: `4 items`

Table columns:

- `Channel`
- `Status`
- `Limits`
- `Actions`

Rows:

- LinkedIn | Connected | 24 posts/mo | Settings
- X | Connected | 60 posts/mo | Settings
- Slack | Connected | Context source | Settings
- Telegram | Connected | Context source | Settings

### Billing Tab

Card header:

- Eyebrow: `Billing`
- Heading: `Starter plan`
- Button: `Upgrade`

Stats:

- `Posts generated`: 146
- `Relationships tracked`: 384
- `Seats`: 3
- `Credits left`: 8,420

Upgrade note:

- `Need more posting volume?`
- `Upgrade for more LinkedIn and X drafts, relationship tracking, and team seats.`

### Preferences Tab

Card header:

- Eyebrow: `Preferences`
- Heading: `Review and posting defaults`
- Status: `Review on`

Fields:

- `Default review mode`: `Ask before posting`
- `Default posting window`: `Weekdays, 10 AM - 6 PM`
- `LinkedIn reply limit`: `25 comments/day`
- `X reply limit`: `60 replies/day`
- `Notification preference`: `Notify when a high-fit person reacts, comments, replies, or becomes a relationship card.`
- `Approval preference`: `Auto-save drafts, but ask before publishing posts, quote posts, and important replies.`

## Create Pack Modal

Opened from the global `Create` button.

Modal title:

- `Create pack`

Subtitle:

- `Content`

Stepper:

- `Source`
- `ICP`
- `Draft`
- `Review`

Fields:

- `Channel`
  - LinkedIn
  - X
- `ICP`
  - Founders
  - GTM
  - Product

Flow card:

- Step: `Draft`
- Title: `3 assets`
- Detail: `LinkedIn post, X post, and reply.`
- Status: `Ready`

Actions:

- `Cancel`
- `Create`
- Loading label: `Generating`

Success toast:

- `Draft generated`
- `3 assets created`

## Source Drawer

Triggered by source rows where wired.

Drawer title:

- Source name, fallback `Source`

Subtitle:

- Source type, fallback `Source`

Stat cards:

- `Rows`
- `Health`

Details:

- `Status`
- `Fresh`
- `Type`

Next step card:

- Step: `Next`
- Title: `Map signals`
- Detail: source description or `Source signals ready.`
- Status: `Ready`

## Reply Drawer

Triggered by reply selection where wired.

Drawer title:

- Reply title, fallback `Reply`

Subtitle:

- Reply segment, fallback `ICP inbox`

Preview:

- Eyebrow: source
- Heading: channel
- Body: `Proof, question, CTA.`

Textarea:

- Aria label: `Reply draft`

Actions:

- `Save`
- `Send`

## Data Sources

Demo sources:

- Slack | Messages | Synced | 4m ago | 4,286 rows | 98 health
  - `Customer language, launch questions, objection patterns, and team notes.`
- Slack | Call transcripts | Synced | 11m ago | 342 rows | 94 health
  - `Slack threads, Telegram notes, onboarding notes, and founder voice snippets.`
- LinkedIn | Social | Syncing | 18m ago | 2,184 rows | 91 health
  - `Founder posts, ICP reactions, job changes, and account-level engagement signals.`
- X | Social | Synced | 26m ago | 1,740 rows | 88 health
  - `Market chatter, competitor mentions, founder threads, and product reactions.`
- Telegram | Messages | Synced | 1h ago | 624 rows | 90 health
  - `Community questions, customer proof, founder notes, and content requests.`
- Website | Owned | Synced | 2h ago | 118 rows | 97 health
  - `Landing pages, changelog copy, docs, use cases, and launch announcements.`
- Telegram | Knowledge | Queued | 5h ago | 286 rows | 84 health
  - `Messaging docs, release notes, ICP research, customer stories, and product briefs.`
- LinkedIn | Pipeline | Synced | 9m ago | 932 rows | 96 health
  - `Accounts, opportunities, objections, stages, owner notes, and next-best actions.`

Demo metrics:

- Drafts ready: 46
- Posts published: 128
- Warm ICPs: 384
- Replies ready: 23
- Active sources: 7
- Voice match: 92
- Content generated: 684
- Average drafts per day: 6.8

## Content Flows

Founder-led Content:

- Status: Live
- Drafts: 18
- Published: 42
- Warm ICPs: 116
- Replies: 14
- Sources: LinkedIn, Slack, Slack
- Next run: Today 4:30 PM
- Steps: Ingest voice, Find signals, Draft thread, Approve, Publish

Launch Repurposing:

- Status: Queued
- Drafts: 11
- Published: 27
- Warm ICPs: 82
- Replies: 9
- Sources: Website, Telegram, LinkedIn
- Next run: Tomorrow 9:00 AM
- Steps: Parse launch, Extract claims, Create variants, Schedule, Track

Customer Insight Engine:

- Status: Live
- Drafts: 9
- Published: 31
- Warm ICPs: 94
- Replies: 18
- Sources: Slack, Slack, LinkedIn
- Next run: Today 6:00 PM
- Steps: Cluster notes, Tag pain, Find proof, Draft posts, Draft replies

Post Performance Loop:

- Status: Review
- Drafts: 7
- Published: 19
- Warm ICPs: 53
- Replies: 4
- Sources: LinkedIn, X, Telegram
- Next run: Fri 10:00 AM
- Steps: Read reactions, Find weak hooks, Rewrite post, Review, Track

Relationship Tracking:

- Status: Draft
- Drafts: 5
- Published: 9
- Warm ICPs: 39
- Replies: 6
- Sources: LinkedIn, X, Slack
- Next run: Mon 11:30 AM
- Steps: Detect reaction, Score person, Save memory, Draft reply, Route

## Audience And ICP Data

Audience signal examples:

- Engaged with founder-led post
- Visited pricing page
- Commented on competitor post
- Mentioned content automation
- Replied to launch thread
- Matched customer lookalike

ICP audience rows:

- Maya Ren | Founder | Northbeam Studio | AI SaaS | Austin, TX | Posted about stalled content ops | 96 | LinkedIn | Hot | Reply drafted | Excellent | Problem aware
- Jonah Vale | VP Marketing | CircuitGrid | Devtools | San Francisco, CA | Hiring content lead | 94 | LinkedIn | Hot | Added to warm list | Excellent | Expansion
- Leah Moreno | Head of Growth | TrellisPay | Fintech | New York, NY | Commented on compliance messaging | 91 | LinkedIn | Hot | Thread queued | Excellent | Category research
- Ishan Rao | CEO | LayerForge | Infrastructure | Bengaluru, India | New funding announcement | 89 | Website | Active | Launch note parsed | Strong | Launch
- Nora Ellis | Product Marketing Lead | BrightCart | Commerce | Seattle, WA | Asked for launch examples | 87 | Slack | Active | Call clipped | Strong | Evaluation
- Theo Park | Co-founder | FieldSignal | Vertical SaaS | Denver, CO | Shared customer quote | 85 | Slack | Warm | Insight saved | Strong | Customer proof
- Amina Cho | Growth Manager | NovaDesk | B2B SaaS | Toronto, Canada | Compared three AI writing tools | 84 | X | Warm | Competitor response drafted | Strong | Comparison
- Elliot Shin | Founder | Dockline AI | AI SaaS | Los Angeles, CA | Asked how to scale founder content | 82 | X | Warm | Added to reply queue | Strong | Problem aware
- Sofia Bennett | Director of Demand | ArcLedger | Fintech | Chicago, IL | Pipeline notes mention low reply rate | 80 | LinkedIn | Warm | LinkedIn reply drafted | Strong | Pipeline acceleration
- Mateo Silva | Founder | OpsHarbor | Operations | Miami, FL | Published hiring plan | 78 | LinkedIn | Active | Account enriched | Moderate | Growth
- Claire Okafor | Content Lead | PulseMetric | Analytics | London, UK | Changelog traffic spike | 77 | Website | Active | LinkedIn post drafted | Moderate | Search demand
- Ravi Kapoor | Head of Revenue | TerraStack | Climate SaaS | Boston, MA | Call raised objection about consistency | 75 | Slack | Review | Voice check requested | Moderate | Objection
- Hana Wells | Product Marketer | CobaltWorks | Security | Portland, OR | Asked for competitor teardown | 74 | Telegram | Review | Research clipped | Moderate | Comparison
- Dina Farrow | CEO | MintPath | HR Tech | Atlanta, GA | Announced beta launch | 72 | X | New | Signal captured | Moderate | Launch
- Owen Fletcher | Founder | BeaconOps | Services | Nashville, TN | Asked about AI reply quality | 71 | X | New | Reply suggested | Moderate | Education
- Mei Laurent | Growth Lead | VersePilot | Creator Tools | Paris, France | Shared a content backlog problem | 69 | Slack | New | Added to monitor | Moderate | Problem aware
- Caleb Stone | Marketing Ops | PrismScale | Data | Phoenix, AZ | Requested relationship tracking examples | 68 | LinkedIn | New | Relationship tracked | Moderate | Workflow
- Zara Lin | Founder | Kitefield | Edtech | Singapore | Published founder essay | 66 | LinkedIn | Review | Voice sample saved | Low | Voice
- Hugo Marin | Product Lead | RelayNorth | Logistics | Madrid, Spain | Docs page updated | 64 | Website | Review | Brief queued | Low | Search demand
- Tessa Bloom | Founder | FrameKit | Design Tools | Brooklyn, NY | Mentioned inconsistent posting | 62 | X | New | Monitor added | Low | Awareness

## Copilot Demo Data

Copilot suggestion data in `demoData.ts`:

- `Turn latest call into posts`
  - `Extract customer language from the newest transcript and create three channel-ready drafts.`
  - Source: Slack
  - Priority: High
  - Confidence: 93
  - Action: Create drafts
- `Create founder-led thread`
  - `Use the latest founder voice samples and hot ICP signals to draft a concise LinkedIn thread.`
  - Source: LinkedIn
  - Priority: High
  - Confidence: 91
  - Action: Draft thread
- `Find ICP reactions`
  - `Scan recent social reactions and identify warm accounts with reply-ready context.`
  - Source: LinkedIn
  - Priority: Medium
  - Confidence: 86
  - Action: Find accounts
- `Repurpose launch note`
  - `Turn the launch page into LinkedIn and X posts with follow-up replies.`
  - Source: Website
  - Priority: High
  - Confidence: 89
  - Action: Repurpose
- `Draft replies to warm ICPs`
  - `Use post reactions and public signals to create short replies for the warm audience queue.`
  - Source: LinkedIn
  - Priority: High
  - Confidence: 88
  - Action: Draft replies
- `Create relationship cards`
  - `Find people who reacted, commented, or replied and add them to relationship memory.`
  - Source: LinkedIn
  - Priority: Medium
  - Confidence: 82
  - Action: Track people

Copilot context:

- Slack: `12 updates`
- Telegram: `3 note threads`
- LinkedIn: `46 engagements`
- Website: `18 ICP visits`

Copilot output cards:

- LinkedIn Post
  - Preview: `Founder-led content does not scale from blank prompts. It scales when call notes, Slack updates, ICP reactions, and product proof stay attached to the draft from the first line.`
  - Segment: AI SaaS founders
  - Source: Slack
  - Confidence: 94
  - Voice match: 96
- X Thread
  - Preview: `1/ The best content systems start with signals, not topics. Pull the call, map the ICP, find the objection, then draft in the founder's voice.`
  - Segment: Devtools
  - Source: LinkedIn
  - Confidence: 88
  - Voice match: 92
- LinkedIn Reply
  - Preview: `Exactly. The difference is whether the system remembers the source context and the relationship history before suggesting the reply.`
  - Segment: B2B SaaS
  - Source: LinkedIn
  - Confidence: 82
  - Voice match: 89
- X Reply
  - Preview: `The best posting systems do not stop at publishing. They track who reacts, who replies, and who keeps coming back.`
  - Segment: Product marketing
  - Source: X
  - Confidence: 86
  - Voice match: 91

## UI Primitives

Shared primitives:

- `MetricCard`
- `StatusBadge`
- `SourceBadge`
- `ChannelPill`
- `ScoreBadge`
- `DataTable`
- `EmptyState`
- `Drawer`
- `Modal`
- `ProgressStepper`
- `FlowStepCard`
- `OpenButton`

Source badges support:

- LinkedIn
- Notes
- Web
- Website
- Slack
- Telegram
- X

Channel pills support:

- LinkedIn
- X
- Slack
- Telegram

Status badge tone logic:

- Success-like: ready, live, approved, synced, replied, healthy, published
- Warning-like: review, queued, draft, warm, pending
- Danger-like: blocked, risk, late
- Accent-like: new, hot, active
- Neutral fallback: everything else

Score badge tone logic:

- Success: score >= 82
- Warning: score >= 68
- Neutral: score < 68

## Simulated Toasts And Actions

Common toast titles:

- `Agent response ready`
- `Workspace context applied`
- `Context refreshed`
- `Website and onboarding context updated`
- `Context saved`
- `Posting context updated`
- `Connection queued`
- `Invite link ready`
- `Opened settings`
- `Invite link copied`
- `Connect flow opened`
- `Voice saved`
- `Agent voice updated`
- `Narrative saved`
- `Agent rules updated`
- `Settings saved`
- `Reply approved`
- `Draft generated`
- `CSV exported`
- `Source connected`
- `ICPs imported`
- `Person added`
- `Manual relationship ready`
- `Segment opened`
- `Preview selected`
- `Upload ready`
- `Google Drive opened`
- `Dropbox opened`
- `Download started`
- `Opened draft`
- `Saved`
- `Opened`

Most actions are currently frontend-only simulations. They update local state or show toast feedback.

## Known Product Scope

In scope for the current build:

- LinkedIn posting
- X posting
- LinkedIn/X replies and comments
- Relationship memory
- Customer lifecycle groups
- Slack and Telegram as context sources
- Website context
- Files/assets for proof and posts
- Review mode and approval behavior
- Basic billing and account settings

Out of scope or intentionally removed from visible navigation:

- Gmail
- Reddit-specific workflows
- SEO/GEO sections
- MCP/API/developer settings in the visible settings page
- Blocklist as a visible tab

Note: Some old helper components still exist in code but are not currently routed or shown from the visible `Settings` tabs, such as `MembersSettings`, `SettingsSources`, `SecuritySettings`, `ContentTemplatesSettings`, `DeveloperAccessSettings`, `DeveloperConnectionSettings`, and `SafetyListSettings`.

## Implementation Notes

- The build is a React/Vite prototype.
- Main UI implementation is concentrated in `src/App.tsx`.
- Demo data is concentrated in `src/lib/demoData.ts`.
- Styling is centralized in `src/styles.css`.
- The old port `3000` dashboard was shut down; the current dashboard runs on port `5173`.
- Current branch when this document was created: `codex/helixar-dashboard-refresh`.
- The previously pushed draft PR is `jaypatil0812/helixar-demo-dashboard#1`.
