import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import {
  BadgeHelp,
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Coins,
  DatabaseZap,
  Download,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Linkedin,
  LoaderCircle,
  MessageSquareReply,
  Mic,
  MoreHorizontal,
  Paperclip,
  PenLine,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Target,
  Twitter,
  Upload,
  UserPlus,
  UserRoundCheck,
  UsersRound,
  Video,
  Workflow,
} from "lucide-react";
import {
  ChannelPill,
  DataTable,
  Drawer,
  FlowStepCard,
  MetricCard,
  Modal,
  OpenButton,
  ProgressStepper,
  ScoreBadge,
  SourceBadge,
  StatusBadge,
} from "./components/DashboardPrimitives";
import {
  demoContentFlows,
  demoAudienceSignals,
  demoCopilotOutputs,
  demoDashboard,
  demoData,
  demoIcpAudience,
  demoInsights,
  demoMetrics,
  demoQueue,
  demoSourceDiscovery,
  demoSources,
  type DemoSource,
  type IcpAudienceMember,
  type QueueItem,
} from "./lib/demoData";

const routes = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/copilot", label: "Copilot", icon: Sparkles },
  { path: "/flows", label: "Agent", icon: Workflow },
  { path: "/audience", label: "Relationships", icon: UsersRound },
  { path: "/queue", label: "Queue", icon: Inbox },
  { path: "/files", label: "Files", icon: FolderOpen },
  { path: "/sources", label: "Sources", icon: DatabaseZap },
  { path: "/insights", label: "Insights", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },
];

const routeMeta: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview" },
  "/copilot": { title: "Copilot", subtitle: "Ask your agent" },
  "/flows": { title: "Engagement Agent", subtitle: "Replies and rules." },
  "/flows/founder-led": { title: "Founder-led Content", subtitle: "Sequence builder" },
  "/audience": { title: "Relationships", subtitle: "People and memory." },
  "/queue": { title: "Queue", subtitle: "Review and publish." },
  "/files": { title: "Files", subtitle: "Assets and proof." },
  "/sources": { title: "Sources", subtitle: "Source data." },
  "/insights": { title: "Insights", subtitle: "Performance." },
  "/settings": { title: "Settings", subtitle: "Account and billing." },
};

type OnboardingGoal = "sales" | "brand" | "consistency" | "agency";

type VoicePreset =
  | "sharp-founder"
  | "professional-operator"
  | "educational-expert"
  | "direct-sales-led"
  | "custom";

type CommandChannel = "slack" | "telegram" | null;

type OnboardingTarget = {
  id: string;
  value: string;
  type: "linkedin" | "x" | "domain" | "name" | "unknown";
};

type OnboardingBenchmark = {
  id: string;
  value: string;
  type: "linkedin" | "x" | "brand" | "name" | "unknown";
};

type FirstQueuePost = {
  id: string;
  platform: "LinkedIn" | "X";
  hook: string;
  preview: string;
  whyCreated: string;
  targetAudience: string;
  contentPillar: string;
  sourceSignal: string;
  status: "Needs approval" | "Approved" | "Edited" | "Regenerated";
  publishState: "Approval only" | "Ready to schedule" | "Needs publishing connection";
};

type OnboardingState = {
  started: boolean;
  completed: boolean;
  currentStep: number;
  goal: OnboardingGoal | null;
  website: string;
  companyDescription: string;
  targetCustomer: string;
  mainOffer: string;
  voicePreset: VoicePreset | null;
  voiceSample: string;
  bannedWords: string;
  targets: OnboardingTarget[];
  benchmarks: OnboardingBenchmark[];
  topics: string[];
  commandChannel: CommandChannel;
  connectedChannels: {
    slack: boolean;
    telegram: boolean;
    linkedin: boolean;
    x: boolean;
  };
  firstQueueGenerated: boolean;
  firstQueueSent: boolean;
  firstPostApproved: boolean;
  firstQueue: FirstQueuePost[];
};

type ActivationEvent = {
  eventName: string;
  timestamp: number;
  payload?: Record<string, unknown>;
};

const onboardingStorageKey = "helixar:onboarding:v1";
const firstQueueStorageKey = "helixar:firstQueue:v1";
const activationStorageKey = "helixar:activation:v1";

const onboardingSteps = ["Welcome", "Goal", "Company", "Voice", "Audience", "Channels", "First queue"];
const onboardingPhases = ["Setup", "Context", "Channels", "Queue"];

const defaultOnboardingState: OnboardingState = {
  started: false,
  completed: false,
  currentStep: 0,
  goal: null,
  website: "",
  companyDescription: "",
  targetCustomer: "",
  mainOffer: "",
  voicePreset: null,
  voiceSample: "",
  bannedWords: "",
  targets: [],
  benchmarks: [],
  topics: [],
  commandChannel: null,
  connectedChannels: {
    slack: false,
    telegram: false,
    linkedin: false,
    x: false,
  },
  firstQueueGenerated: false,
  firstQueueSent: false,
  firstPostApproved: false,
  firstQueue: [],
};

const goalOptions: {
  id: OnboardingGoal;
  title: string;
  outcome: string;
  preview: string;
  primary?: boolean;
  disabled?: boolean;
}[] = [
  {
    id: "sales",
    title: "Sales / demand generation",
    outcome: "Warm up target accounts and create qualified conversations.",
    preview: "Market warm-up dashboard",
    primary: true,
  },
  {
    id: "brand",
    title: "Personal brand / audience growth",
    outcome: "Build authority and stay visible consistently.",
    preview: "Authority growth dashboard",
    primary: true,
  },
  {
    id: "consistency",
    title: "Consistent posting / engagement",
    outcome: "Keep content and reply opportunities moving without manual effort.",
    preview: "Market presence dashboard",
  },
  {
    id: "agency",
    title: "Agency / client delivery",
    outcome: "Manage content workflows for multiple clients.",
    preview: "Client delivery dashboard - later",
    disabled: true,
  },
];

const voicePresetOptions: { id: VoicePreset; title: string; preview: string }[] = [
  {
    id: "sharp-founder",
    title: "Sharp founder voice",
    preview: "Clear POV, direct claims, practical stakes.",
  },
  {
    id: "professional-operator",
    title: "Professional operator",
    preview: "Calm, structured, useful for teams.",
  },
  {
    id: "educational-expert",
    title: "Educational expert",
    preview: "Explains patterns and teaches without fluff.",
  },
  {
    id: "direct-sales-led",
    title: "Direct sales-led",
    preview: "Buyer pain, outcomes, and next steps.",
  },
  {
    id: "custom",
    title: "Custom",
    preview: "Use your sample and avoid-list more heavily.",
  },
];

type ToastKind = "success" | "info";

type DemoToast = {
  id: number;
  title: string;
  detail?: string;
  kind: ToastKind;
};

type ToastHandler = (title: string, detail?: string, kind?: ToastKind) => void;

function readJsonFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadActivationEvents(): ActivationEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(activationStorageKey);
    return stored ? (JSON.parse(stored) as ActivationEvent[]) : [];
  } catch {
    return [];
  }
}

function recordActivationEvent(eventName: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const timestamp = Date.now();
  const events = loadActivationEvents();
  const startedAt = events.find((event) => event.eventName === "onboarding_started")?.timestamp;
  const timingPayload =
    startedAt && eventName === "first_queue_generated"
      ? { ...payload, time_to_first_queue_generated: timestamp - startedAt }
      : startedAt && eventName === "first_post_approved"
        ? { ...payload, time_to_first_post_approved: timestamp - startedAt }
        : payload;

  window.localStorage.setItem(
    activationStorageKey,
    JSON.stringify([...events, { eventName, timestamp, payload: timingPayload }]),
  );
}

function loadOnboardingState(): OnboardingState {
  const stored = readJsonFromStorage<Partial<OnboardingState>>(onboardingStorageKey, {});
  const firstQueue = readJsonFromStorage<FirstQueuePost[]>(firstQueueStorageKey, []);

  return {
    ...defaultOnboardingState,
    ...stored,
    connectedChannels: {
      ...defaultOnboardingState.connectedChannels,
      ...stored.connectedChannels,
    },
    targets: stored.targets ?? [],
    benchmarks: stored.benchmarks ?? [],
    topics: stored.topics ?? [],
    firstQueue: stored.firstQueue?.length ? stored.firstQueue : firstQueue,
  };
}

function saveOnboardingState(state: OnboardingState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(onboardingStorageKey, JSON.stringify(state));
  window.localStorage.setItem(firstQueueStorageKey, JSON.stringify(state.firstQueue));
}

function resetOnboardingState() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(onboardingStorageKey);
  window.localStorage.removeItem(firstQueueStorageKey);
  window.localStorage.removeItem(activationStorageKey);
}

function inferEntryType(value: string): OnboardingTarget["type"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("linkedin.com")) return "linkedin";
  if (normalized.includes("x.com") || normalized.includes("twitter.com")) return "x";
  if (normalized.includes(".") && !normalized.includes(" ")) return "domain";
  if (value.trim()) return "name";
  return "unknown";
}

function inferBenchmarkType(value: string): OnboardingBenchmark["type"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("linkedin.com")) return "linkedin";
  if (normalized.includes("x.com") || normalized.includes("twitter.com")) return "x";
  if (normalized.includes(".") && !normalized.includes(" ")) return "brand";
  if (value.trim()) return "name";
  return "unknown";
}

function getGoalLabel(goal: OnboardingGoal | null) {
  return goalOptions.find((option) => option.id === goal)?.title ?? "Not selected";
}

function getVoicePresetLabel(voicePreset: VoicePreset | null) {
  return voicePresetOptions.find((option) => option.id === voicePreset)?.title ?? "Not selected";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeDraftText(text: string, bannedWords: string) {
  const words = bannedWords
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  return words.reduce((draft, word) => draft.replace(new RegExp(escapeRegExp(word), "gi"), "practical"), text);
}

function getVoiceOpening(state: OnboardingState) {
  if (state.voicePreset === "professional-operator") return "The teams that win are not louder. They are more consistent.";
  if (state.voicePreset === "educational-expert") return "A useful content system starts with signals, not blank pages.";
  if (state.voicePreset === "direct-sales-led") return "Your buyers are already telling you what they care about.";
  if (state.voicePreset === "custom") return "The best posts sound like the person who actually does the work.";
  return "Most teams do not have a content problem. They have a signal-to-execution problem.";
}

function getFirstQueueVariants(state: OnboardingState): FirstQueuePost[] {
  const targetAudience = state.targetCustomer || "your target customers";
  const offer = state.mainOffer || "turn market signals into content people can approve and publish";
  const companyContext = state.companyDescription || state.website || "your company context";
  const publishingConnected = state.connectedChannels.linkedin || state.connectedChannels.x;
  const sourceSignal = state.goal === "brand" ? "Company context + benchmark patterns" : "Company context + selected goal";

  const salesPosts: FirstQueuePost[] = [
    {
      id: "first-post-1",
      platform: "LinkedIn",
      hook: "Most teams do not have a demand problem. They have a follow-through problem.",
      preview: `${companyContext} becomes more useful when every customer signal turns into a reviewed post, reply, or account touch. That is where ${offer} matters.`,
      whyCreated: "Your audience cares about sales-relevant conversations and workflow gaps.",
      targetAudience,
      contentPillar: "Market execution systems",
      sourceSignal,
      status: "Needs approval",
      publishState: publishingConnected ? "Ready to schedule" : "Needs publishing connection",
    },
    {
      id: "first-post-2",
      platform: "X",
      hook: "A warm lead usually starts before the sales call.",
      preview: `It starts when someone reacts to a useful post, asks a sharp question, or shows up around the same problem twice. Track the signal. Draft the follow-up. Ask before anything goes live.`,
      whyCreated: "Sales mode should turn public engagement into qualified conversation starters.",
      targetAudience,
      contentPillar: "Buyer conversations",
      sourceSignal: "Goal selection + target customer",
      status: "Needs approval",
      publishState: state.connectedChannels.x ? "Ready to schedule" : "Needs publishing connection",
    },
    {
      id: "first-post-3",
      platform: "LinkedIn",
      hook: "The best market signal is often hiding inside the work your team already did.",
      preview: `Customer notes, Slack updates, founder opinions, and repeated questions can become posts that sound specific because they came from real work.`,
      whyCreated: "Your setup points to source-driven content, not generic writing prompts.",
      targetAudience,
      contentPillar: "Content from real signals",
      sourceSignal: "Company context + command channel",
      status: "Needs approval",
      publishState: state.connectedChannels.linkedin ? "Ready to schedule" : "Needs publishing connection",
    },
  ];

  const brandPosts: FirstQueuePost[] = [
    {
      id: "first-post-1",
      platform: "LinkedIn",
      hook: "Authority is built by repeating the right idea before the market is ready.",
      preview: `${offer} is not just a product message. It is a point of view ${targetAudience} can recognize, remember, and trust over time.`,
      whyCreated: "Brand mode should create a founder POV that can compound.",
      targetAudience,
      contentPillar: "Founder point of view",
      sourceSignal,
      status: "Needs approval",
      publishState: state.connectedChannels.linkedin ? "Ready to schedule" : "Needs publishing connection",
    },
    {
      id: "first-post-2",
      platform: "X",
      hook: "The market remembers useful repetition.",
      preview: `One sharp idea, shown through customer pain, lessons, examples, and replies, can do more than ten disconnected posts.`,
      whyCreated: "Your goal is audience growth through consistent topic ownership.",
      targetAudience,
      contentPillar: "Topic ownership",
      sourceSignal: "Goal selection + voice preset",
      status: "Needs approval",
      publishState: state.connectedChannels.x ? "Ready to schedule" : "Needs publishing connection",
    },
    {
      id: "first-post-3",
      platform: "LinkedIn",
      hook: getVoiceOpening(state),
      preview: `The strongest content systems start with what the founder already sees: buyer hesitation, workflow pain, proof, and small lessons from the field.`,
      whyCreated: "This turns your voice calibration into a post format.",
      targetAudience,
      contentPillar: "Founder lessons",
      sourceSignal: "Voice preset + company context",
      status: "Needs approval",
      publishState: state.connectedChannels.linkedin ? "Ready to schedule" : "Needs publishing connection",
    },
  ];

  const consistencyPosts: FirstQueuePost[] = [
    {
      id: "first-post-1",
      platform: "LinkedIn",
      hook: "Consistency gets easier when the system starts before the blank page.",
      preview: `A useful post can come from one customer note, one team update, or one repeated objection. The workflow matters more than waiting for inspiration.`,
      whyCreated: "Consistency mode should make publishing feel operational, not heroic.",
      targetAudience,
      contentPillar: "Always-on market presence",
      sourceSignal,
      status: "Needs approval",
      publishState: state.connectedChannels.linkedin ? "Ready to schedule" : "Needs publishing connection",
    },
    {
      id: "first-post-2",
      platform: "X",
      hook: "Your market presence should not depend on remembering to post.",
      preview: `Capture signal. Draft from context. Review in Slack or Telegram. Publish only after approval.`,
      whyCreated: "Your setup prioritizes regular posting with a review loop.",
      targetAudience,
      contentPillar: "Approval workflow",
      sourceSignal: "Command channel + goal selection",
      status: "Needs approval",
      publishState: state.connectedChannels.x ? "Ready to schedule" : "Needs publishing connection",
    },
    {
      id: "first-post-3",
      platform: "LinkedIn",
      hook: "A content calendar is only useful if it keeps learning from the market.",
      preview: `${companyContext} should turn replies, reactions, and repeated questions into the next useful draft.`,
      whyCreated: "You added consistency as the operating goal.",
      targetAudience,
      contentPillar: "Learning loop",
      sourceSignal: "Company context + topics",
      status: "Needs approval",
      publishState: state.connectedChannels.linkedin ? "Ready to schedule" : "Needs publishing connection",
    },
  ];

  const posts = state.goal === "brand" ? brandPosts : state.goal === "consistency" ? consistencyPosts : salesPosts;

  return posts.map((post) => ({
    ...post,
    hook: sanitizeDraftText(post.hook, state.bannedWords),
    preview: sanitizeDraftText(post.preview, state.bannedWords),
  }));
}

function generateFirstQueue(state: OnboardingState) {
  return getFirstQueueVariants(state);
}

function regenerateQueuePost(state: OnboardingState, post: FirstQueuePost): FirstQueuePost {
  const targetAudience = state.targetCustomer || post.targetAudience;
  const alternateHooks: Record<FirstQueuePost["platform"], string> = {
    LinkedIn: "The useful content is already inside the customer conversation.",
    X: "Turn the market signal into the next approved post.",
  };

  return {
    ...post,
    hook: sanitizeDraftText(alternateHooks[post.platform], state.bannedWords),
    preview: sanitizeDraftText(
      `For ${targetAudience}, the work is not more posting for the sake of posting. It is capturing a real signal, drafting from context, and approving before anything goes live.`,
      state.bannedWords,
    ),
    whyCreated: "Regenerated from the same onboarding context with a tighter angle.",
    status: "Regenerated",
  };
}

function canContinueFromStep(step: number, state: OnboardingState) {
  if (step === 0) return true;
  if (step === 1) return Boolean(state.goal && state.goal !== "agency");
  if (step === 2) return Boolean((state.website.trim() || state.companyDescription.trim()) && state.targetCustomer.trim());
  if (step === 3) return Boolean(state.voicePreset);
  if (step === 5) return Boolean(state.connectedChannels.slack || state.connectedChannels.telegram);
  if (step === 6) return state.firstQueueGenerated && state.firstQueue.length > 0;
  return true;
}

function getMissingRequirements(step: number, state: OnboardingState) {
  if (step === 1) return "Choose Sales, Personal Brand, or Consistency to continue.";
  if (step === 2) return "Add a website or company description, plus the target customer.";
  if (step === 3) return "Choose a voice preset.";
  if (step === 5) return "Choose Slack or Telegram to receive your first approval queue.";
  if (step === 6) return "Generate the first queue before entering the dashboard.";
  return "";
}

function getNextStep(step: number) {
  return Math.min(step + 1, onboardingSteps.length - 1);
}

function getPreviousStep(step: number) {
  return Math.max(step - 1, 0);
}

function getOnboardingPhase(activeStep: number) {
  if (activeStep <= 1) return 0;
  if (activeStep <= 4) return 1;
  if (activeStep === 5) return 2;
  return 3;
}

function normalizePath(pathname: string) {
  if (pathname === "/" || pathname === "" || pathname === "/onboarding") return "/onboarding";
  if (routeMeta[pathname]) return pathname;
  return "/dashboard";
}

export function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const [selectedSource, setSelectedSource] = useState<DemoSource | null>(null);
  const [selectedReply, setSelectedReply] = useState<QueueItem | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [toast, setToast] = useState<DemoToast | null>(null);

  useEffect(() => {
    const handlePop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.history.replaceState({}, "", "/onboarding");
    }
  }, []);

  const activePath = normalizePath(path);
  const meta = routeMeta[activePath] ?? routeMeta["/dashboard"];

  const navigate = (nextPath: string) => {
    const normalized = normalizePath(nextPath);
    window.history.pushState({}, "", normalized);
    setPath(normalized);
  };

  const showToast: ToastHandler = (title, detail, kind = "success") => {
    const id = Date.now();
    setToast({ id, title, detail, kind });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  };

  const completeOnboarding = () => {
    window.history.pushState({}, "", "/dashboard");
    setPath("/dashboard");
  };

  if (activePath === "/onboarding") {
    return <OnboardingPage onComplete={completeOnboarding} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activePath={activePath} onNavigate={navigate} />

      <main className="workspace">
        <div className="content-container">
          <TopBar title={meta.title} subtitle={meta.subtitle} onGenerate={() => setGenerateOpen(true)} />
          <PageRouter
            path={activePath}
            onNavigate={navigate}
            onGenerate={() => setGenerateOpen(true)}
            onSelectSource={setSelectedSource}
            onSelectReply={setSelectedReply}
            onToast={showToast}
          />
        </div>
      </main>

      <DemoToastView toast={toast} />
      <SourceDrawer source={selectedSource} onClose={() => setSelectedSource(null)} />
      <ReplyDrawer reply={selectedReply} onClose={() => setSelectedReply(null)} onToast={showToast} />
      <GenerateModal open={generateOpen} onClose={() => setGenerateOpen(false)} onToast={showToast} />
    </div>
  );
}

function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [state, setState] = useState<OnboardingState>(() => loadOnboardingState());
  const [connectingAccount, setConnectingAccount] = useState<"LinkedIn" | "X" | "Slack" | "Telegram" | null>(null);
  const [targetEntry, setTargetEntry] = useState("");
  const [benchmarkEntry, setBenchmarkEntry] = useState("");
  const [topicEntry, setTopicEntry] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [toast, setToast] = useState<DemoToast | null>(null);

  useEffect(() => {
    saveOnboardingState(state);
  }, [state]);

  useEffect(() => {
    if (state.currentStep === 6 && !state.firstQueueGenerated) {
      const firstQueue = generateFirstQueue(state);
      setState((current) => ({ ...current, firstQueue, firstQueueGenerated: true }));
      recordActivationEvent("first_queue_generated", { goal: state.goal, postCount: firstQueue.length });
    }
  }, [state.currentStep, state.firstQueueGenerated, state.goal]);

  const showOnboardingToast: ToastHandler = (title, detail, kind = "success") => {
    const id = Date.now();
    setToast({ id, title, detail, kind });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  };

  const updateState = (patch: Partial<OnboardingState>) => {
    setState((current) => ({ ...current, ...patch }));
  };

  const startSetup = () => {
    const nextState = { ...state, started: true, currentStep: 1 };
    setState(nextState);
    saveOnboardingState(nextState);
    recordActivationEvent("onboarding_started");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (step: number) => {
    setState((current) => ({ ...current, currentStep: step }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (!canContinueFromStep(state.currentStep, state)) {
      showOnboardingToast("Finish this step", getMissingRequirements(state.currentStep, state), "info");
      return;
    }

    if (state.currentStep === 2) recordActivationEvent("company_context_completed", { hasWebsite: Boolean(state.website.trim()) });
    if (state.currentStep === 6) {
      finishOnboarding();
      return;
    }

    goToStep(getNextStep(state.currentStep));
  };

  const goBack = () => {
    goToStep(getPreviousStep(state.currentStep));
  };

  const chooseGoal = (goal: OnboardingGoal) => {
    if (goal === "agency") {
      showOnboardingToast("Agency mode is coming later", "Choose Sales, Personal Brand, or Consistency for this setup.", "info");
      return;
    }

    updateState({ goal });
    recordActivationEvent("goal_selected", { goal });
  };

  const chooseVoicePreset = (voicePreset: VoicePreset) => {
    updateState({ voicePreset });
    recordActivationEvent("voice_preset_selected", { voicePreset });
  };

  const connectAccount = (account: "LinkedIn" | "X" | "Slack" | "Telegram") => {
    setConnectingAccount(account);
    window.setTimeout(() => {
      setState((current) => {
        const connectedChannels = {
          ...current.connectedChannels,
          slack: account === "Slack" ? true : current.connectedChannels.slack,
          telegram: account === "Telegram" ? true : current.connectedChannels.telegram,
          linkedin: account === "LinkedIn" ? true : current.connectedChannels.linkedin,
          x: account === "X" ? true : current.connectedChannels.x,
        };
        const commandChannel =
          account === "Slack" ? "slack" : account === "Telegram" ? "telegram" : current.commandChannel;

        return { ...current, connectedChannels, commandChannel };
      });

      if (account === "Slack" || account === "Telegram") {
        recordActivationEvent("command_channel_connected", { account });
      } else {
        recordActivationEvent("publishing_channel_connected", { account });
      }

      setConnectingAccount(null);
      showOnboardingToast(`${account} connected`, "Nothing goes live without your approval.");
    }, 1100);
  };

  const addTarget = () => {
    const value = targetEntry.trim();
    if (!value || state.targets.length >= 3) return;

    const target: OnboardingTarget = { id: `target-${Date.now()}`, value, type: inferEntryType(value) };
    updateState({ targets: [...state.targets, target] });
    setTargetEntry("");
    recordActivationEvent("targets_or_benchmarks_added", { type: "target" });
  };

  const addBenchmark = () => {
    const value = benchmarkEntry.trim();
    if (!value || state.benchmarks.length >= 3) return;

    const benchmark: OnboardingBenchmark = { id: `benchmark-${Date.now()}`, value, type: inferBenchmarkType(value) };
    updateState({ benchmarks: [...state.benchmarks, benchmark] });
    setBenchmarkEntry("");
    recordActivationEvent("targets_or_benchmarks_added", { type: "benchmark" });
  };

  const addTopic = () => {
    const value = topicEntry.trim();
    if (!value || state.topics.length >= 3) return;

    updateState({ topics: [...state.topics, value] });
    setTopicEntry("");
    recordActivationEvent("targets_or_benchmarks_added", { type: "topic" });
  };

  const removeTarget = (id: string) => {
    updateState({ targets: state.targets.filter((target) => target.id !== id) });
  };

  const removeBenchmark = (id: string) => {
    updateState({ benchmarks: state.benchmarks.filter((benchmark) => benchmark.id !== id) });
  };

  const removeTopic = (topic: string) => {
    updateState({ topics: state.topics.filter((currentTopic) => currentTopic !== topic) });
  };

  const approvePost = (postId: string) => {
    updateState({
      firstPostApproved: true,
      firstQueue: state.firstQueue.map((post) => (post.id === postId ? { ...post, status: "Approved" } : post)),
    });
    recordActivationEvent("first_post_approved", { postId });
    showOnboardingToast("First post approved", "Approval captured. Nothing goes live without your approval.");
  };

  const startEditingPost = (post: FirstQueuePost) => {
    setEditingPostId(post.id);
    setEditingDraft(post.preview);
  };

  const savePostEdit = () => {
    if (!editingPostId) return;

    updateState({
      firstQueue: state.firstQueue.map((post) =>
        post.id === editingPostId ? { ...post, preview: editingDraft, status: "Edited" } : post,
      ),
    });
    setEditingPostId(null);
    setEditingDraft("");
    showOnboardingToast("Draft updated");
  };

  const regeneratePost = (post: FirstQueuePost) => {
    updateState({
      firstQueue: state.firstQueue.map((currentPost) =>
        currentPost.id === post.id ? regenerateQueuePost(state, currentPost) : currentPost,
      ),
    });
    showOnboardingToast("Draft regenerated");
  };

  const sendQueue = () => {
    const channel = state.commandChannel === "telegram" ? "Telegram" : "Slack";
    updateState({ firstQueueSent: true });
    recordActivationEvent("first_queue_sent", { channel });
    showOnboardingToast(`Queue sent to ${channel}`, "Review and approval are ready.");
  };

  const finishOnboarding = (patch: Partial<OnboardingState> = {}) => {
    const completedState = {
      ...state,
      ...patch,
      completed: true,
      started: true,
      firstQueueGenerated: true,
      firstQueue: patch.firstQueue ?? (state.firstQueue.length ? state.firstQueue : generateFirstQueue(state)),
    };
    saveOnboardingState(completedState);
    recordActivationEvent("onboarding_completed", {
      goal: completedState.goal,
      commandChannel: completedState.commandChannel,
      firstPostApproved: completedState.firstPostApproved,
    });
    onComplete();
  };

  const sendQueueAndComplete = () => {
    const channel = state.commandChannel === "telegram" ? "Telegram" : "Slack";
    if (!state.firstQueueSent) {
      recordActivationEvent("first_queue_sent", { channel });
      showOnboardingToast(`Queue sent to ${channel}`, "Review and approval are ready.");
    }
    finishOnboarding({ firstQueueSent: true });
  };

  const sharedFooter = (
    <OnboardingFooter
      currentStep={state.currentStep}
      onBack={goBack}
      onNext={goNext}
      nextLabel={state.currentStep === 5 ? "Generate first queue" : "Next step"}
      disabled={!canContinueFromStep(state.currentStep, state)}
      helperText={!canContinueFromStep(state.currentStep, state) ? getMissingRequirements(state.currentStep, state) : undefined}
    />
  );

  return (
    <OnboardingCanvas>
      <OnboardingBrand />
      <OnboardingProgress activeStep={state.currentStep} />
      {state.currentStep === 0 ? <WelcomeStep onStart={startSetup} /> : null}
      {state.currentStep === 1 ? (
        <GoalSelectStep state={state} onChooseGoal={chooseGoal} footer={sharedFooter} />
      ) : null}
      {state.currentStep === 2 ? (
        <CompanyContextStep state={state} onChange={updateState} footer={sharedFooter} />
      ) : null}
      {state.currentStep === 3 ? (
        <VoiceCalibrationStep state={state} onChange={updateState} onChooseVoice={chooseVoicePreset} footer={sharedFooter} />
      ) : null}
      {state.currentStep === 4 ? (
        <TargetsStep
          state={state}
          targetEntry={targetEntry}
          benchmarkEntry={benchmarkEntry}
          topicEntry={topicEntry}
          onTargetEntryChange={setTargetEntry}
          onBenchmarkEntryChange={setBenchmarkEntry}
          onTopicEntryChange={setTopicEntry}
          onAddTarget={addTarget}
          onAddBenchmark={addBenchmark}
          onAddTopic={addTopic}
          onRemoveTarget={removeTarget}
          onRemoveBenchmark={removeBenchmark}
          onRemoveTopic={removeTopic}
          footer={sharedFooter}
        />
      ) : null}
      {state.currentStep === 5 ? (
        <ConnectChannelsStep state={state} onConnect={connectAccount} footer={sharedFooter} />
      ) : null}
      {state.currentStep === 6 ? (
        <FirstQueueStep
          state={state}
          editingPostId={editingPostId}
          editingDraft={editingDraft}
          onEditingDraftChange={setEditingDraft}
          onBack={goBack}
          onApprove={approvePost}
          onEdit={startEditingPost}
          onSaveEdit={savePostEdit}
          onCancelEdit={() => setEditingPostId(null)}
          onRegenerate={regeneratePost}
          onSendQueue={sendQueue}
          onComplete={finishOnboarding}
          onSendAndComplete={sendQueueAndComplete}
        />
      ) : null}
      {connectingAccount ? <ConnectionModal account={connectingAccount} /> : null}
      <DemoToastView toast={toast} />
    </OnboardingCanvas>
  );
}

function OnboardingCanvas({ children }: { children: ReactNode }) {
  return (
    <main className="onboarding-canvas phase-one-onboarding">
      <div className="onboarding-bg-mark left" />
      <div className="onboarding-bg-mark right" />
      <div className="onboarding-content">{children}</div>
    </main>
  );
}

function OnboardingBrand() {
  return (
    <div className="onboarding-brand" aria-label="Helixar">
      <span className="helixar-mark">
        <img src="/assets/helixar-logo.png" alt="" />
      </span>
      <strong>helixar</strong>
    </div>
  );
}

function OnboardingProgress({ activeStep }: { activeStep: number }) {
  const activePhase = getOnboardingPhase(activeStep);

  return (
    <div className="onboarding-progress" aria-label="Onboarding progress">
      {onboardingPhases.map((label, index) => (
        <div className="onboarding-progress-item" key={label}>
          <span className={index < activePhase ? "done" : index === activePhase ? "active" : undefined}>
            {index < activePhase ? <Check size={14} /> : index + 1}
          </span>
          <small>{label}</small>
          {index < onboardingPhases.length - 1 ? <i /> : null}
        </div>
      ))}
    </div>
  );
}

function OnboardingCard({
  children,
  className = "",
  stepLabel,
}: {
  children: ReactNode;
  className?: string;
  stepLabel: string;
}) {
  return (
    <section className={`onboarding-card ${className}`}>
      <span className="onboarding-step-label">{stepLabel}</span>
      {children}
    </section>
  );
}

function OnboardingFooter({
  currentStep,
  onBack,
  onNext,
  nextLabel = "Next step",
  helperText,
  disabled,
}: {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  helperText?: string;
  disabled?: boolean;
}) {
  return (
    <div className="onboarding-footer">
      <button className="onboarding-back" type="button" onClick={onBack} disabled={currentStep === 0}>
        <ChevronLeft size={15} />
        Previous
      </button>
      <div>
        {helperText ? <span>{helperText}</span> : null}
        <button className="onboarding-primary" type="button" onClick={onNext} disabled={disabled}>
          {nextLabel}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <section className="onboarding-start-card phase-one-welcome">
      <span className="onboarding-ai-pill">
        <Sparkles size={14} />
        Helixar setup
      </span>
      <h1>Set up your Helixar Agent</h1>
      <p>Connect the context Helixar needs to draft your first LinkedIn and X queue for approval.</p>
      <button className="onboarding-primary" type="button" onClick={onStart}>
        Start setup
        <ChevronRight size={17} />
      </button>
    </section>
  );
}

function GoalSelectStep({
  state,
  onChooseGoal,
  footer,
}: {
  state: OnboardingState;
  onChooseGoal: (goal: OnboardingGoal) => void;
  footer: ReactNode;
}) {
  return (
    <OnboardingCard className="wide-step goal-step" stepLabel="Step 1 of 4">
      <div className="onboarding-card-heading">
        <h1>What should Helixar optimize for?</h1>
        <p>Pick the first operating mode. You can change it later.</p>
      </div>
      <div className="goal-card-grid">
        {goalOptions.map((option) => (
          <button
            className={`goal-card ${state.goal === option.id ? "active" : ""} ${option.primary ? "primary-goal" : ""}`}
            type="button"
            key={option.id}
            onClick={() => onChooseGoal(option.id)}
            aria-pressed={state.goal === option.id}
          >
            <span>{option.disabled ? "Later" : option.primary ? "Primary" : "Mode"}</span>
            <strong>{option.title}</strong>
            <p>{option.outcome}</p>
            <small>{option.preview}</small>
          </button>
        ))}
      </div>
      {footer}
    </OnboardingCard>
  );
}

function CompanyContextStep({
  state,
  onChange,
  footer,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  footer: ReactNode;
}) {
  const hasDraftSeed = Boolean((state.companyDescription || state.mainOffer) && state.targetCustomer);

  return (
    <div className="onboarding-split-screen">
      <OnboardingCard className="company-context-step" stepLabel="Step 2 of 4">
        <div className="onboarding-card-heading">
          <h1>Tell Helixar what your company does</h1>
          <p>Minimum context for useful drafts.</p>
        </div>
        <div className="onboarding-form-grid single">
          <label className="onboarding-field">
            <span>Website URL</span>
            <input value={state.website} onChange={(event) => onChange({ website: event.target.value })} placeholder="https://yourcompany.com" />
          </label>
          {state.website.trim() ? <WebsiteAnalysisPreview website={state.website} /> : null}
          <label className="onboarding-field">
            <span>What do you sell?</span>
            <textarea
              value={state.companyDescription}
              onChange={(event) => onChange({ companyDescription: event.target.value })}
              placeholder="We help ______ do ______."
            />
          </label>
          <label className="onboarding-field">
            <span>Who do you sell to?</span>
            <input
              value={state.targetCustomer}
              onChange={(event) => onChange({ targetCustomer: event.target.value })}
              placeholder="B2B founders, marketing teams, agencies..."
            />
          </label>
          <label className="onboarding-field">
            <span>Main offer</span>
            <textarea
              value={state.mainOffer}
              onChange={(event) => onChange({ mainOffer: event.target.value })}
              placeholder="What do you want people to buy, book, or understand?"
            />
          </label>
        </div>
        {footer}
      </OnboardingCard>
      <AgentMemoryPanel
        title="Agent Memory being created"
        rows={[
          ["Company context", state.website || state.companyDescription ? "added" : "pending"],
          ["Offer", state.mainOffer ? "added" : "pending"],
          ["Audience", state.targetCustomer ? "added" : "pending"],
          ["Voice", "pending"],
          ["Channels", "pending"],
          ["First queue", "not generated yet"],
        ]}
      >
        {hasDraftSeed ? (
          <div className="memory-preview-card">
            <span>Draft seed</span>
            <strong>Helixar can now draft posts around:</strong>
            <p>{state.mainOffer || "your offer"} for {state.targetCustomer}</p>
          </div>
        ) : null}
      </AgentMemoryPanel>
    </div>
  );
}

function WebsiteAnalysisPreview({ website }: { website: string }) {
  return (
    <div className="website-analysis-card" aria-label="Website analysis preview">
      <div>
        <span className="analysis-pulse" />
        <strong>Understanding {website}</strong>
        <p>Positioning, product, audience, proof</p>
      </div>
      <div className="analysis-lines" aria-hidden>
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function VoiceCalibrationStep({
  state,
  onChange,
  onChooseVoice,
  footer,
}: {
  state: OnboardingState;
  onChange: (patch: Partial<OnboardingState>) => void;
  onChooseVoice: (voicePreset: VoicePreset) => void;
  footer: ReactNode;
}) {
  const handleVoiceSampleChange = (value: string) => {
    if (!state.voiceSample.trim() && value.trim()) recordActivationEvent("voice_sample_added");
    onChange({ voiceSample: value });
  };

  return (
    <div className="onboarding-split-screen">
      <OnboardingCard className="voice-calibration-step" stepLabel="Step 2 of 4">
        <div className="onboarding-card-heading">
          <h1>How should Helixar sound?</h1>
          <p>The goal is content you would actually post.</p>
        </div>
        <div className="voice-preset-grid">
          {voicePresetOptions.map((option) => (
            <button
              className={`voice-preset-card ${state.voicePreset === option.id ? "active" : ""}`}
              type="button"
              key={option.id}
              onClick={() => onChooseVoice(option.id)}
            >
              <strong>{option.title}</strong>
              <span>{option.preview}</span>
            </button>
          ))}
        </div>
        <label className="onboarding-field">
          <span>Writing sample</span>
          <textarea value={state.voiceSample} onChange={(event) => handleVoiceSampleChange(event.target.value)} placeholder="Paste a short sample here..." />
        </label>
        <label className="onboarding-field">
          <span>Words or phrases to avoid</span>
          <input
            value={state.bannedWords}
            onChange={(event) => onChange({ bannedWords: event.target.value })}
            placeholder="unlock, leverage, game-changer, revolutionary, AI-powered"
          />
        </label>
        {footer}
      </OnboardingCard>
      <AgentMemoryPanel
        title="Agent Memory"
        rows={[
          ["Voice preset", getVoicePresetLabel(state.voicePreset)],
          ["Writing sample", state.voiceSample ? "added" : "optional"],
          ["Banned words", state.bannedWords ? "added" : "optional"],
          ["Approval rule", "Ask before publishing"],
        ]}
      >
        <div className="memory-preview-card">
          <span>Voice preview</span>
          <strong>{getVoiceOpening(state)}</strong>
          <p>Nothing goes live without your approval.</p>
        </div>
      </AgentMemoryPanel>
    </div>
  );
}

function TargetsStep({
  state,
  targetEntry,
  benchmarkEntry,
  topicEntry,
  onTargetEntryChange,
  onBenchmarkEntryChange,
  onTopicEntryChange,
  onAddTarget,
  onAddBenchmark,
  onAddTopic,
  onRemoveTarget,
  onRemoveBenchmark,
  onRemoveTopic,
  footer,
}: {
  state: OnboardingState;
  targetEntry: string;
  benchmarkEntry: string;
  topicEntry: string;
  onTargetEntryChange: (value: string) => void;
  onBenchmarkEntryChange: (value: string) => void;
  onTopicEntryChange: (value: string) => void;
  onAddTarget: () => void;
  onAddBenchmark: () => void;
  onAddTopic: () => void;
  onRemoveTarget: (id: string) => void;
  onRemoveBenchmark: (id: string) => void;
  onRemoveTopic: (topic: string) => void;
  footer: ReactNode;
}) {
  const isBrand = state.goal === "brand";
  const isConsistency = state.goal === "consistency";
  const entries = isBrand
    ? state.benchmarks.map((benchmark) => ({ id: benchmark.id, value: benchmark.value, tag: benchmark.type }))
    : isConsistency
      ? state.topics.map((topic) => ({ id: topic, value: topic, tag: "topic" }))
      : state.targets.map((target) => ({ id: target.id, value: target.value, tag: target.type }));
  const heading = isBrand
    ? "Whose market behavior should Helixar learn from?"
    : isConsistency
      ? "What should Helixar help you stay consistent around?"
      : "Who should Helixar help you reach?";
  const body = isBrand
    ? "Helixar studies topic patterns, audience response, and positioning. It does not copy content."
    : isConsistency
      ? "Add topics, customer problems, or themes. You can refine this later."
      : "Add people, companies, or customer types you want to warm up.";
  const placeholder = isBrand
    ? "LinkedIn/X profile, founder, competitor, brand..."
    : isConsistency
      ? "Customer problem, theme, or topic..."
      : "LinkedIn profile, X profile, company domain, name...";
  const currentValue = isBrand ? benchmarkEntry : isConsistency ? topicEntry : targetEntry;
  const handleChange = isBrand ? onBenchmarkEntryChange : isConsistency ? onTopicEntryChange : onTargetEntryChange;
  const handleAdd = isBrand ? onAddBenchmark : isConsistency ? onAddTopic : onAddTarget;

  const removeEntry = (id: string) => {
    if (isBrand) onRemoveBenchmark(id);
    else if (isConsistency) onRemoveTopic(id);
    else onRemoveTarget(id);
  };

  return (
    <div className="onboarding-split-screen">
      <OnboardingCard className="targets-step" stepLabel="Step 2 of 4">
        <div className="onboarding-card-heading">
          <h1>{heading}</h1>
          <p>{body}</p>
        </div>
        {state.goal === "agency" ? (
          <div className="onboarding-notice">
            <strong>Agency mode is coming later.</strong>
            <p>Choose Sales, Personal Brand, or Consistency for this setup.</p>
          </div>
        ) : (
          <>
            <div className="target-entry-row">
              <input value={currentValue} onChange={(event) => handleChange(event.target.value)} placeholder={placeholder} />
              <button className="secondary-button" type="button" onClick={handleAdd} disabled={!currentValue.trim() || entries.length >= 3}>
                Add
              </button>
            </div>
            <div className="target-chip-list">
              {entries.length ? (
                entries.map((entry) => (
                  <button type="button" key={entry.id} onClick={() => removeEntry(entry.id)}>
                    <span>{entry.tag}</span>
                    {entry.value}
                    <small>x</small>
                  </button>
                ))
              ) : (
                <span className="muted-chip">Skip for now</span>
              )}
            </div>
            {isBrand ? <p className="onboarding-safe-copy">Studies market patterns, not copy content.</p> : null}
          </>
        )}
        {footer}
      </OnboardingCard>
      <AgentMemoryPanel
        title={isBrand ? "Benchmarks" : isConsistency ? "Topics" : "Targets"}
        rows={[
          [isBrand ? "Benchmarks added" : isConsistency ? "Topics added" : "Targets added", `${entries.length}/3`],
          ["First queue inputs ready", state.targetCustomer ? "yes" : "no"],
          ["Goal", getGoalLabel(state.goal)],
          ["Voice", getVoicePresetLabel(state.voicePreset)],
        ]}
      />
    </div>
  );
}

function ConnectChannelsStep({
  state,
  onConnect,
  footer,
}: {
  state: OnboardingState;
  onConnect: (account: "LinkedIn" | "X" | "Slack" | "Telegram") => void;
  footer: ReactNode;
}) {
  return (
    <div className="onboarding-split-screen">
      <OnboardingCard className="channels-step" stepLabel="Step 3 of 4">
        <div className="onboarding-card-heading">
          <h1>Where should Helixar operate?</h1>
          <p>Operate Helixar from where you already work.</p>
        </div>
        <div className="trust-banner">
          <CheckCircle2 size={16} />
          Nothing goes live without your approval.
        </div>
        <div className="channel-section">
          <span>Choose command channel</span>
          <div className="channel-card-grid">
            <ChannelConnectCard
              icon={<PlatformLogo platform="Slack" />}
              title="Slack"
              description="Approve posts, review replies, and get updates."
              connected={state.connectedChannels.slack}
              buttonLabel={state.connectedChannels.slack ? "Slack connected" : "Connect Slack"}
              onClick={() => onConnect("Slack")}
            />
            <ChannelConnectCard
              icon={<PlatformLogo platform="Telegram" />}
              title="Telegram"
              description="Approve posts, send notes, and receive alerts."
              connected={state.connectedChannels.telegram}
              buttonLabel={state.connectedChannels.telegram ? "Telegram connected" : "Connect Telegram"}
              onClick={() => onConnect("Telegram")}
            />
          </div>
        </div>
        <div className="channel-section">
          <span>Connect publishing channels</span>
          <div className="channel-card-grid">
            <ChannelConnectCard
              icon={<PlatformLogo platform="LinkedIn" />}
              title="LinkedIn"
              description="Publish approved LinkedIn posts."
              connected={state.connectedChannels.linkedin}
              optionalLabel={state.connectedChannels.linkedin ? "Connected" : "Required before publishing"}
              buttonLabel={state.connectedChannels.linkedin ? "LinkedIn connected" : "Connect LinkedIn"}
              onClick={() => onConnect("LinkedIn")}
            />
            <ChannelConnectCard
              icon={<PlatformLogo platform="X" />}
              title="X"
              description="Publish approved X posts and threads."
              connected={state.connectedChannels.x}
              optionalLabel={state.connectedChannels.x ? "Connected" : "Required before publishing"}
              buttonLabel={state.connectedChannels.x ? "X connected" : "Connect X"}
              onClick={() => onConnect("X")}
            />
          </div>
        </div>
        {footer}
      </OnboardingCard>
      <AgentMemoryPanel
        title="Approval path"
        rows={[
          ["Command channel", state.commandChannel ? `${state.commandChannel} connected` : "pending"],
          ["Publishing", state.connectedChannels.linkedin || state.connectedChannels.x ? "connected" : "optional"],
          ["Approval mode", "on"],
          ["First queue", state.connectedChannels.slack || state.connectedChannels.telegram ? "ready to generate" : "pending"],
        ]}
      />
    </div>
  );
}

function ChannelConnectCard({
  icon,
  title,
  description,
  connected,
  buttonLabel,
  optionalLabel,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  connected: boolean;
  buttonLabel: string;
  optionalLabel?: string;
  onClick: () => void;
}) {
  return (
    <article className={`channel-connect-card ${connected ? "connected" : ""}`}>
      <div className="channel-connect-head">
        <span>{icon}</span>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </div>
      <div className="channel-connect-foot">
        <small>{optionalLabel ?? (connected ? "Connected" : "Required")}</small>
        <button className="secondary-button slim" type="button" onClick={onClick} disabled={connected}>
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}

function PlatformLogo({ platform }: { platform: "Slack" | "Telegram" | "LinkedIn" | "X" }) {
  if (platform === "Slack") {
    return (
      <span className="platform-logo platform-slack" aria-label="Slack">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (platform === "Telegram") {
    return (
      <span className="platform-logo platform-telegram" aria-label="Telegram">
        <Send size={18} />
      </span>
    );
  }

  if (platform === "LinkedIn") {
    return (
      <span className="platform-logo platform-linkedin" aria-label="LinkedIn">
        <Linkedin size={19} />
      </span>
    );
  }

  return (
    <span className="platform-logo platform-x" aria-label="X">
      X
    </span>
  );
}

function FirstQueueStep({
  state,
  editingPostId,
  editingDraft,
  onEditingDraftChange,
  onBack,
  onApprove,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onRegenerate,
  onSendQueue,
  onComplete,
  onSendAndComplete,
}: {
  state: OnboardingState;
  editingPostId: string | null;
  editingDraft: string;
  onEditingDraftChange: (value: string) => void;
  onBack: () => void;
  onApprove: (postId: string) => void;
  onEdit: (post: FirstQueuePost) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onRegenerate: (post: FirstQueuePost) => void;
  onSendQueue: () => void;
  onComplete: () => void;
  onSendAndComplete: () => void;
}) {
  const commandChannel = state.commandChannel === "telegram" ? "Telegram" : "Slack";

  return (
    <OnboardingCard className="wide-step first-queue-step" stepLabel="Step 4 of 4">
      <div className="onboarding-card-heading">
        <h1>Your first content queue is ready</h1>
        <p>Approve one, edit one, or ask Helixar to regenerate.</p>
      </div>
      <div className="first-queue-grid">
        {state.firstQueue.map((post) => (
          <article className="first-post-card" key={post.id}>
            <div className="first-post-top">
              <span>{post.platform}</span>
              <StatusBadge status={post.status} />
            </div>
            <h3>{post.hook}</h3>
            {editingPostId === post.id ? (
              <label className="onboarding-field">
                <span>Edit draft</span>
                <textarea value={editingDraft} onChange={(event) => onEditingDraftChange(event.target.value)} />
              </label>
            ) : (
              <p>{post.preview}</p>
            )}
            <div className="first-post-meta">
              <span>Why</span>
              <strong>{post.whyCreated}</strong>
              <span>Audience</span>
              <strong>{post.targetAudience}</strong>
              <span>Pillar</span>
              <strong>{post.contentPillar}</strong>
              <span>Signal</span>
              <strong>{post.sourceSignal}</strong>
              <span>Publishing</span>
              <strong>{post.publishState}</strong>
            </div>
            <div className="first-post-actions">
              {editingPostId === post.id ? (
                <>
                  <button type="button" onClick={onSaveEdit}>Save</button>
                  <button type="button" onClick={onCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => onApprove(post.id)}>Approve</button>
                  <button type="button" onClick={() => onEdit(post)}>Edit</button>
                  <button type="button" onClick={() => onRegenerate(post)}>Regenerate</button>
                  <button type="button" onClick={onSendQueue}>Send to {commandChannel}</button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="onboarding-footer">
        <button className="onboarding-back" type="button" onClick={onBack}>
          <ChevronLeft size={15} />
          Previous
        </button>
        <div>
          <button className="onboarding-back" type="button" onClick={onComplete}>
            Enter dashboard
          </button>
          <button className="onboarding-primary" type="button" onClick={onSendAndComplete}>
            {state.firstQueueSent ? "Enter dashboard" : `Send queue to ${commandChannel}`}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </OnboardingCard>
  );
}

function ConnectionModal({ account }: { account: "LinkedIn" | "X" | "Slack" | "Telegram" }) {
  const accountIcon =
    account === "LinkedIn" ? (
      <Linkedin size={20} />
    ) : account === "X" ? (
      <Twitter size={20} />
    ) : (
      <SourceBadge source={account} />
    );

  return (
    <div className="onboarding-modal-backdrop" role="dialog" aria-modal="true" aria-label={`Connecting ${account}`}>
      <div className="onboarding-connection-modal">
        <div className="modal-title-row">
          <strong>Connect {account}</strong>
          <button type="button" aria-label="Close">
            x
          </button>
        </div>
        <span className={account === "LinkedIn" ? "modal-linkedin-icon" : account === "X" ? "modal-x-icon" : "modal-source-icon"}>{accountIcon}</span>
        <h2>Connecting {account}</h2>
        <p>Helixar checks authorized access and prepares your approval workflow.</p>
        {account === "LinkedIn" || account === "X" ? <p>Publishing only happens after approval.</p> : null}
        <LoaderCircle className="onboarding-loader" size={22} />
      </div>
    </div>
  );
}

function AgentMemoryPanel({
  title,
  rows,
  children,
}: {
  title: string;
  rows: [string, string][];
  children?: ReactNode;
}) {
  return (
    <aside className="memory-panel">
      <div className="agent-panel-head">
        <span>
          <Rocket size={16} />
        </span>
        <div>
          <strong>{title}</strong>
          <p>Live setup state</p>
        </div>
      </div>
      <div className="memory-row-list">
        {rows.map(([label, value]) => (
          <MemoryRow key={label} label={label} value={value} />
        ))}
      </div>
      {children}
    </aside>
  );
}

function MemoryRow({ label, value }: { label: string; value: string }) {
  const isDone = !["pending", "optional", "not generated yet", "no"].includes(value.toLowerCase());

  return (
    <div className={`memory-row ${isDone ? "done" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Sidebar({
  activePath,
  onNavigate,
}: {
  activePath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <aside className="icon-rail" aria-label="Primary navigation">
      <button className="brand-mark" type="button" aria-label="Dashboard" onClick={() => onNavigate("/dashboard")}>
        <img src="/assets/helixar-logo.png" alt="" />
      </button>

      <nav>
        {routes.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path || (item.path === "/flows" && activePath.startsWith("/flows/"));

          return (
            <button
              key={item.path}
              className={isActive ? "active" : undefined}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onNavigate(item.path)}
            >
              <Icon size={19} />
            </button>
          );
        })}
      </nav>

      <div className="rail-bottom">
        <button type="button" title="Help" aria-label="Help">
          <BadgeHelp size={18} />
        </button>
        <button type="button" title="Credits" aria-label="Credits">
          <Coins size={18} />
        </button>
        <button className="user-avatar" type="button" title="Vedant" aria-label="User profile">
          V
        </button>
      </div>
    </aside>
  );
}

function TopBar({
  title,
  subtitle,
  onGenerate,
}: {
  title: string;
  subtitle?: string;
  onGenerate: () => void;
}) {
  return (
    <header className="topbar">
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search size={17} aria-hidden />
          <input aria-label="Search" placeholder="Search" />
        </div>
        <button className="icon-button" type="button" title="Notifications" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="primary-button" type="button" onClick={onGenerate}>
          <Plus size={16} />
          Create
        </button>
      </div>
    </header>
  );
}

function PersistentToast() {
  return (
    <div className="sync-toast" role="status">
      <span>
        <CheckCircle2 size={17} />
      </span>
      <div>
        <strong>Source sync active</strong>
        <p>Slack, Telegram, LinkedIn updated 38s ago</p>
      </div>
    </div>
  );
}

function DemoToastView({ toast }: { toast: DemoToast | null }) {
  if (!toast) return null;

  return (
    <div className={`demo-toast ${toast.kind}`} role="status">
      <span>
        <CheckCircle2 size={17} />
      </span>
      <div>
        <strong>{toast.title}</strong>
        {toast.detail ? <p>{toast.detail}</p> : null}
      </div>
    </div>
  );
}

function ButtonSpinner() {
  return <span className="button-spinner" aria-hidden />;
}

function PageRouter({
  path,
  onNavigate,
  onGenerate,
  onSelectSource,
  onSelectReply,
  onToast,
}: {
  path: string;
  onNavigate: (path: string) => void;
  onGenerate: () => void;
  onSelectSource: (source: DemoSource) => void;
  onSelectReply: (reply: QueueItem) => void;
  onToast: ToastHandler;
}) {
  if (path === "/copilot") return <CopilotPage onToast={onToast} />;
  if (path === "/flows") return <EngagementAgentPage onToast={onToast} />;
  if (path === "/flows/founder-led") return <FounderLedPage onToast={onToast} />;
  if (path === "/audience") return <AudiencePage onToast={onToast} />;
  if (path === "/queue") return <QueuePage onToast={onToast} />;
  if (path === "/files") return <FilesPage onToast={onToast} />;
  if (path === "/sources") return <SourcesPage onSelectSource={onSelectSource} onToast={onToast} />;
  if (path === "/insights") return <InsightsPage />;
  if (path === "/settings") return <SettingsPage onToast={onToast} />;
  return <DashboardPage onNavigate={onNavigate} onGenerate={onGenerate} onSelectSource={onSelectSource} />;
}

function DashboardPage({
  onNavigate,
  onSelectSource,
}: {
  onNavigate: (path: string) => void;
  onGenerate: () => void;
  onSelectSource: (source: DemoSource) => void;
}) {
  const [activeFilter, setActiveFilter] = useState(demoDashboard.defaultTimeFilter);
  const latestWarmIcps = demoIcpAudience.slice(0, 4);
  const agentOutputTotal = demoContentFlows.reduce((sum, flow) => sum + flow.drafts + flow.published + flow.replies, 0);
  const warmIcpTotal = demoContentFlows.reduce((sum, flow) => sum + flow.warmICPs, 0);
  const agentUpdates = demoContentFlows.slice(0, 4);
  const onboardingHandoff = loadOnboardingState();
  const hasOnboardingHandoff = onboardingHandoff.completed || onboardingHandoff.firstQueueGenerated;
  const handoffChannel =
    onboardingHandoff.commandChannel === "telegram"
      ? "Telegram"
      : onboardingHandoff.commandChannel === "slack"
        ? "Slack"
        : "Slack/Telegram";
  const handoffQueueCount = onboardingHandoff.firstQueue.length || 3;
  const handoffPendingActions = [
    !onboardingHandoff.firstPostApproved ? "Approve first post" : "",
    !onboardingHandoff.connectedChannels.linkedin ? "Connect LinkedIn before publishing" : "",
    onboardingHandoff.goal === "sales" && onboardingHandoff.targets.length === 0 ? "Add target accounts" : "",
    onboardingHandoff.goal === "brand" && onboardingHandoff.benchmarks.length === 0 ? "Add benchmarks" : "",
  ].filter(Boolean);

  return (
    <div className="page-stack dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <span>
            <Rocket size={16} />
          </span>
          <h2>{demoDashboard.welcomeTitle}</h2>
        </div>
        <div className="time-filter" aria-label="Time range">
          {demoDashboard.timeFilters.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "active" : undefined}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {hasOnboardingHandoff ? (
        <section className="dashboard-activation-strip" aria-label="Onboarding handoff">
          <article className="activation-card">
            <span>System</span>
            <strong>Helixar is active</strong>
            <p>{getGoalLabel(onboardingHandoff.goal)}</p>
          </article>
          <article className="activation-card">
            <span>Queue</span>
            <strong>{handoffQueueCount} posts drafted</strong>
            <p>{onboardingHandoff.firstQueueSent ? `Sent to ${handoffChannel}` : "Waiting for approval"}</p>
          </article>
          <article className="activation-card">
            <span>Approval</span>
            <strong>Approval mode on</strong>
            <p>Nothing goes live without your approval.</p>
          </article>
          <article className="activation-card">
            <span>Command</span>
            <strong>{handoffChannel} connected</strong>
            <p>{onboardingHandoff.connectedChannels.linkedin || onboardingHandoff.connectedChannels.x ? "Publishing channel ready" : "Publishing connection pending"}</p>
          </article>
          {handoffPendingActions.length ? (
            <div className="activation-pending-list">
              <span>Next actions</span>
              {handoffPendingActions.map((action) => (
                <button key={action} type="button" onClick={() => onNavigate(action.includes("LinkedIn") ? "/settings" : "/queue")}>
                  {action}
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="agent-summary-grid" aria-label="Agent summary">
        <article className="agent-summary-card">
          <div className="agent-summary-top">
            <span className="agent-summary-icon health">
              <CheckCircle2 size={18} />
            </span>
            <StatusBadge status="Connected" />
          </div>
          <p>Channels</p>
          <strong>2</strong>
          <span>Slack and Telegram</span>
          <div className="channel-connection-list">
            <span><SourceBadge source="Slack" /> Connected</span>
            <span><SourceBadge source="Telegram" /> Connected</span>
          </div>
        </article>

        <article className="agent-summary-card">
          <div className="agent-summary-top">
            <span className="agent-summary-icon output">
              <Workflow size={18} />
            </span>
            <StatusBadge status="Active" />
          </div>
          <p>Output</p>
          <strong>{agentOutputTotal}</strong>
          <span>Posts and replies</span>
          <div className="agent-summary-foot">
            <small>{demoQueue.drafts.length} drafts</small>
            <small>{demoQueue.suggestedReplies.length} replies</small>
          </div>
        </article>

        <article className="agent-summary-card">
          <div className="agent-summary-top">
            <span className="agent-summary-icon success">
              <Target size={18} />
            </span>
            <StatusBadge status="Rising" />
          </div>
          <p>Relationships</p>
          <strong>{warmIcpTotal}</strong>
          <span>Warm people</span>
          <div className="agent-summary-foot">
            <button className="link-button" type="button" onClick={() => onNavigate("/audience")}>
              Open
            </button>
            <small>{demoMetrics.voiceMatch}% fit</small>
          </div>
        </article>
      </section>

      <ActivityChart activeFilter={activeFilter} />

      <section className="dashboard-two-column dashboard-updates-grid">
        <article className="surface update-panel">
          <div className="surface-header">
            <div>
              <p className="eyebrow">Agents</p>
              <h2>Agent updates</h2>
            </div>
            <StatusBadge status="Live" />
          </div>
          <div className="agent-update-list">
            {agentUpdates.map((flow) => (
              <button className="agent-update-row" key={flow.id} type="button" onClick={() => onNavigate("/flows")}>
                <div>
                  <strong>{flow.name}</strong>
                  <span>{flow.sources.join(", ")}</span>
                </div>
                <div>
                  <small>{flow.published} published</small>
                  <StatusBadge status={flow.status} />
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="surface update-panel">
          <div className="surface-header">
            <div>
              <p className="eyebrow">Segments</p>
              <h2>Customer signals</h2>
            </div>
            <button className="secondary-button slim" type="button" onClick={() => onNavigate("/audience")}>
              View More
            </button>
          </div>
          <div className="segment-update-list">
            {latestWarmIcps.map((member) => (
              <button className="segment-update-row" key={member.id} type="button" onClick={() => onNavigate("/audience")}>
                <div className="avatar">{member.name.slice(0, 1)}</div>
                <div>
                  <strong>{member.name}</strong>
                  <span>{member.title} - {member.company}</span>
                  <p>{member.signal}</p>
                </div>
                <ScoreBadge score={member.score} />
              </button>
            ))}
          </div>
        </article>
      </section>

    </div>
  );
}

type ActivityMetricKey = "actions" | "generated" | "replies";
type ActivityPlatform = "X" | "LI";

type ActivityDatum = {
  id: string;
  label: string;
  fullLabel: string;
  actions: number;
  generated: number;
  replies: number;
};

type ActivityPoint = {
  x: number;
  y: number;
  value: number;
};

const activityMetricLabels: Record<ActivityMetricKey, string> = {
  actions: "Actions",
  generated: "Content",
  replies: "Replies",
};

const activityMetricColors: Record<ActivityMetricKey, string> = {
  actions: "#F8F7F2",
  generated: "#A8A8A0",
  replies: "#63635D",
};

const activityByRange: Record<string, ActivityDatum[]> = {
  "7 days": [
    { id: "jun-05", label: "Jun 5", fullLabel: "June 5", actions: 52, generated: 14, replies: 6 },
    { id: "jun-06", label: "Jun 6", fullLabel: "June 6", actions: 19, generated: 9, replies: 4 },
    { id: "jun-07", label: "Jun 7", fullLabel: "June 7", actions: 25, generated: 6, replies: 3 },
    { id: "jun-08", label: "Jun 8", fullLabel: "June 8", actions: 34, generated: 4, replies: 3 },
    { id: "jun-09", label: "Jun 9", fullLabel: "June 9", actions: 31, generated: 2, replies: 2 },
    { id: "jun-10", label: "Jun 10", fullLabel: "June 10", actions: 60, generated: 1, replies: 2 },
    { id: "jun-11", label: "Jun 11", fullLabel: "June 11", actions: 2, generated: 0, replies: 0 },
  ],
  "30 days": [
    { id: "may-12", label: "May 12", fullLabel: "May 12", actions: 0, generated: 0, replies: 0 },
    { id: "may-14", label: "May 14", fullLabel: "May 14", actions: 0, generated: 0, replies: 0 },
    { id: "may-16", label: "May 16", fullLabel: "May 16", actions: 0, generated: 0, replies: 0 },
    { id: "may-18", label: "May 18", fullLabel: "May 18", actions: 0, generated: 0, replies: 0 },
    { id: "may-20", label: "May 20", fullLabel: "May 20", actions: 0, generated: 0, replies: 0 },
    { id: "may-22", label: "May 22", fullLabel: "May 22", actions: 0, generated: 0, replies: 0 },
    { id: "may-24", label: "May 24", fullLabel: "May 24", actions: 0, generated: 0, replies: 0 },
    { id: "may-26", label: "May 26", fullLabel: "May 26", actions: 0, generated: 0, replies: 0 },
    { id: "may-28", label: "May 28", fullLabel: "May 28", actions: 0, generated: 0, replies: 0 },
    { id: "may-30", label: "May 30", fullLabel: "May 30", actions: 0, generated: 0, replies: 0 },
    { id: "jun-01", label: "Jun 1", fullLabel: "June 1", actions: 0, generated: 0, replies: 0 },
    { id: "jun-02", label: "Jun 2", fullLabel: "June 2", actions: 3, generated: 1, replies: 0 },
    { id: "jun-03", label: "Jun 3", fullLabel: "June 3", actions: 78, generated: 12, replies: 4 },
    { id: "jun-04", label: "Jun 4", fullLabel: "June 4", actions: 12, generated: 18, replies: 6 },
    { id: "jun-05", label: "Jun 5", fullLabel: "June 5", actions: 53, generated: 14, replies: 5 },
    { id: "jun-06", label: "Jun 6", fullLabel: "June 6", actions: 18, generated: 9, replies: 4 },
    { id: "jun-07", label: "Jun 7", fullLabel: "June 7", actions: 27, generated: 6, replies: 3 },
    { id: "jun-08", label: "Jun 8", fullLabel: "June 8", actions: 37, generated: 4, replies: 3 },
    { id: "jun-09", label: "Jun 9", fullLabel: "June 9", actions: 34, generated: 2, replies: 2 },
    { id: "jun-10", label: "Jun 10", fullLabel: "June 10", actions: 61, generated: 1, replies: 2 },
    { id: "jun-11", label: "Jun 11", fullLabel: "June 11", actions: 2, generated: 0, replies: 0 },
  ],
  "3 months": [
    { id: "apr-w1", label: "Apr W1", fullLabel: "April week 1", actions: 118, generated: 61, replies: 24 },
    { id: "apr-w2", label: "Apr W2", fullLabel: "April week 2", actions: 137, generated: 72, replies: 29 },
    { id: "apr-w3", label: "Apr W3", fullLabel: "April week 3", actions: 129, generated: 69, replies: 27 },
    { id: "apr-w4", label: "Apr W4", fullLabel: "April week 4", actions: 158, generated: 86, replies: 35 },
    { id: "may-w1", label: "May W1", fullLabel: "May week 1", actions: 174, generated: 95, replies: 38 },
    { id: "may-w2", label: "May W2", fullLabel: "May week 2", actions: 163, generated: 88, replies: 35 },
    { id: "may-w3", label: "May W3", fullLabel: "May week 3", actions: 196, generated: 109, replies: 44 },
    { id: "may-w4", label: "May W4", fullLabel: "May week 4", actions: 184, generated: 103, replies: 41 },
    { id: "jun-w1", label: "Jun W1", fullLabel: "June week 1", actions: 231, generated: 132, replies: 53 },
    { id: "jun-w2", label: "Jun W2", fullLabel: "June week 2", actions: 214, generated: 124, replies: 49 },
  ],
  "This month": [
    { id: "jun-01", label: "Jun 1", fullLabel: "June 1", actions: 0, generated: 0, replies: 0 },
    { id: "jun-02", label: "Jun 2", fullLabel: "June 2", actions: 3, generated: 1, replies: 0 },
    { id: "jun-03", label: "Jun 3", fullLabel: "June 3", actions: 78, generated: 12, replies: 4 },
    { id: "jun-04", label: "Jun 4", fullLabel: "June 4", actions: 12, generated: 18, replies: 6 },
    { id: "jun-05", label: "Jun 5", fullLabel: "June 5", actions: 53, generated: 14, replies: 5 },
    { id: "jun-06", label: "Jun 6", fullLabel: "June 6", actions: 18, generated: 9, replies: 4 },
    { id: "jun-07", label: "Jun 7", fullLabel: "June 7", actions: 27, generated: 6, replies: 3 },
    { id: "jun-08", label: "Jun 8", fullLabel: "June 8", actions: 37, generated: 4, replies: 3 },
    { id: "jun-09", label: "Jun 9", fullLabel: "June 9", actions: 34, generated: 2, replies: 2 },
    { id: "jun-10", label: "Jun 10", fullLabel: "June 10", actions: 61, generated: 1, replies: 2 },
    { id: "jun-11", label: "Jun 11", fullLabel: "June 11", actions: 2, generated: 0, replies: 0 },
  ],
};

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildSmoothPath(points: ActivityPoint[]) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

    const previous = points[index - 1];
    const beforePrevious = points[index - 2] ?? previous;
    const next = points[index + 1] ?? point;
    const controlOneX = previous.x + (point.x - beforePrevious.x) / 6;
    const controlTwoX = point.x - (next.x - previous.x) / 6;
    const segmentMinY = Math.min(previous.y, point.y);
    const segmentMaxY = Math.max(previous.y, point.y);
    const controlOneY = clampValue(previous.y + (point.y - beforePrevious.y) / 6, segmentMinY, segmentMaxY);
    const controlTwoY = clampValue(point.y - (next.y - previous.y) / 6, segmentMinY, segmentMaxY);

    return `${path} C ${controlOneX.toFixed(1)} ${controlOneY.toFixed(1)}, ${controlTwoX.toFixed(1)} ${controlTwoY.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }, "");
}

function ActivityChart({ activeFilter, showInspector = true }: { activeFilter: string; showInspector?: boolean }) {
  const [platform, setPlatform] = useState<ActivityPlatform>("LI");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const width = 940;
  const height = 320;
  const padding = { top: 28, right: 34, bottom: 42, left: 46 };
  const rawData = activityByRange[activeFilter] ?? activityByRange["30 days"];
  const multiplier = platform === "LI" ? 1 : 0.72;
  const data = rawData.map((item) => ({
    ...item,
    actions: Math.round(item.actions * multiplier),
    generated: Math.round(item.generated * multiplier),
    replies: Math.round(item.replies * multiplier),
  }));
  const metrics = Object.keys(activityMetricLabels) as ActivityMetricKey[];
  const maxValue = Math.max(...data.flatMap((item) => metrics.map((metric) => item[metric])), 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const activeIndex = hoveredIndex ?? pinnedIndex ?? Math.max(data.length - 2, 0);
  const activeDatum = data[activeIndex] ?? data[data.length - 1];
  const totalActions = data.reduce((sum, item) => sum + item.actions, 0);
  const peak = data.reduce((best, item) => (item.actions > best.actions ? item : best), data[0]);

  const pointsFor = (metric: ActivityMetricKey) =>
    data.map((item, index) => {
      const x = padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth;
      const y = padding.top + (1 - item[metric] / maxValue) * plotHeight;
      return { x, y, value: item[metric] };
    });

  const actionPoints = pointsFor("actions");
  const actionPath = buildSmoothPath(actionPoints);
  const areaPath = actionPoints.length
    ? `${actionPath} L ${actionPoints[actionPoints.length - 1].x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} L ${actionPoints[0].x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} Z`
    : "";
  const yTicks = [maxValue, Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  return (
    <section className={showInspector ? "activity-section" : "activity-section solo"} aria-label="Agent action activity">
      <div className="activity-main surface">
        <div className="activity-heading">
          <div>
            <p className="eyebrow">Activity Overview</p>
            <h2>Actions</h2>
          </div>
          <div className="activity-controls">
            <div className="platform-toggle" aria-label="Platform filter">
              {(["X", "LI"] as ActivityPlatform[]).map((item) => (
                <button
                  key={item}
                  className={platform === item ? "active" : undefined}
                  type="button"
                  aria-pressed={platform === item}
                  onClick={() => setPlatform(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <StatusBadge status={activeFilter} />
          </div>
        </div>

        <div className="chart-wrap" onMouseLeave={() => setHoveredIndex(null)}>
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Agent actions for ${activeFilter}`}>
            <defs>
              <linearGradient id="actions-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={activityMetricColors.actions} stopOpacity="0.22" />
                <stop offset="100%" stopColor={activityMetricColors.actions} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width={width} height={height} fill="transparent" />
            {yTicks.map((tick) => {
              const y = padding.top + (1 - tick / maxValue) * plotHeight;
              return (
                <g key={tick}>
                  <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.12)" />
                  <text x={padding.left - 12} y={y + 4} textAnchor="end" className="chart-axis-label">
                    {formatCompact(tick)}
                  </text>
                </g>
              );
            })}

            {areaPath ? <path d={areaPath} fill="url(#actions-fill)" /> : null}
            {metrics.map((metric) => {
              const points = pointsFor(metric);
              const path = buildSmoothPath(points);
              return (
                <path
                  key={metric}
                  d={path}
                  fill="none"
                  stroke={activityMetricColors[metric]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={metric === "actions" ? 3.5 : 2.5}
                  opacity={metric === "actions" ? 1 : 0.78}
                />
              );
            })}

            {data.map((item, index) => {
              const previousX = actionPoints[index - 1]?.x ?? padding.left;
              const nextX = actionPoints[index + 1]?.x ?? width - padding.right;
              const zoneX = index === 0 ? padding.left : (previousX + actionPoints[index].x) / 2;
              const zoneWidth = index === data.length - 1 ? width - padding.right - zoneX : (nextX + actionPoints[index].x) / 2 - zoneX;
              const isActive = index === activeIndex;

              return (
                <g key={item.id}>
                  {isActive ? (
                    <line
                      x1={actionPoints[index].x}
                      x2={actionPoints[index].x}
                      y1={padding.top}
                      y2={height - padding.bottom}
                      stroke="rgba(255,255,255,0.28)"
                      strokeDasharray="4 7"
                    />
                  ) : null}
                  {isActive ? (
                    <circle cx={actionPoints[index].x} cy={actionPoints[index].y} r="6" fill="#070707" stroke={activityMetricColors.actions} strokeWidth="3" />
                  ) : null}
                  <rect
                    x={zoneX}
                    y={padding.top}
                    width={Math.max(zoneWidth, 1)}
                    height={plotHeight}
                    fill="transparent"
                    tabIndex={0}
                    onClick={() => setPinnedIndex(index)}
                    onFocus={() => setHoveredIndex(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                  />
                </g>
              );
            })}

            {data.map((item, index) => {
              const shouldShow = index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1 || data.length <= 11;
              if (!shouldShow) return null;
              const x = padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth;
              return (
                <text key={`label-${item.id}`} x={x} y={height - 14} textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"} className="chart-axis-label">
                  {item.label}
                </text>
              );
            })}
          </svg>

          <div className="chart-legend">
            {metrics.map((metric) => (
              <span key={metric}>
                <i style={{ background: activityMetricColors[metric] }} />
                {activityMetricLabels[metric]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {showInspector ? (
        <aside className="surface chart-inspector" aria-label="Selected chart values">
          <div>
            <p className="eyebrow">Selected</p>
            <h2>{activeDatum.fullLabel}</h2>
            <span>{platform === "LI" ? "LinkedIn" : "X"}</span>
          </div>
          <div className="inspector-value">
            <strong>{activeDatum.actions}</strong>
            <span>actions</span>
          </div>
          <div className="inspector-breakdown">
            {metrics.map((metric) => (
              <div key={metric}>
                <span>
                  <i style={{ background: activityMetricColors[metric] }} />
                  {activityMetricLabels[metric]}
                </span>
                <strong>{activeDatum[metric]}</strong>
              </div>
            ))}
          </div>
          <div className="inspector-note">
            <strong>{formatCompact(totalActions)} total</strong>
            <span>Peak: {peak.fullLabel} - {peak.actions}</span>
          </div>
        </aside>
      ) : null}
    </section>
  );
}

function CopilotPage({ onToast }: { onToast: ToastHandler }) {
  const [voiceActive, setVoiceActive] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const suggestedPrompts = [
    {
      id: "post-performance",
      title: "Show me my post performance",
      detail: "Compare LinkedIn and X posts by reach, replies, and relationship signals.",
      icon: <BarChart3 size={17} />,
    },
    {
      id: "improve-next-post",
      title: "How can I make my next post better?",
      detail: "Review hook, proof, structure, and missing context before publishing.",
      icon: <Sparkles size={17} />,
    },
    {
      id: "missing-context",
      title: "What context is missing before I post?",
      detail: "Find customer proof, voice samples, or source notes that would improve the draft.",
      icon: <Search size={17} />,
    },
    {
      id: "engagement-analysis",
      title: "Analyze my LinkedIn and X engagement",
      detail: "Show which reactions, comments, and replies are creating relationships.",
      icon: <MessageSquareReply size={17} />,
    },
  ];

  const runGeneration = (nextPrompt?: string) => {
    if (nextPrompt) setPrompt(nextPrompt);
    setIsGenerating(true);
    window.setTimeout(() => {
      setHasOutput(true);
      setIsGenerating(false);
      onToast("Agent response ready", "Workspace context applied");
    }, 850);
  };

  return (
    <div className="copilot-page">
      <section className="copilot-main">
        <div className="copilot-hero">
          <div className="copilot-orb">
            <Sparkles size={22} />
          </div>
          <h2>Ask your agent</h2>
          <p>Review post performance, improve drafts, or analyze LinkedIn and X engagement.</p>
          <div className="copilot-source-strip" aria-label="Connected context">
            <SourceBadge source="LinkedIn" />
            <SourceBadge source="X" />
            <SourceBadge source="Slack" />
            <SourceBadge source="Telegram" />
          </div>
        </div>

        <div className="copilot-input-card">
          <textarea
            aria-label="Ask your agent"
            placeholder="Send a message to your agent"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.shiftKey) return;
              event.preventDefault();
              runGeneration();
            }}
          />
          {voiceActive ? <VoiceWaveform /> : null}
          <div className="copilot-input-actions">
            <div className="composer-left-actions">
              <button className="icon-button" type="button" title="Attach source" aria-label="Attach source">
                <Paperclip size={17} />
              </button>
            </div>
            <div className="composer-right-actions">
              <span>Agent ready</span>
              <button
                className={voiceActive ? "icon-button active" : "icon-button"}
                type="button"
                title="Voice note"
                aria-label="Voice note"
                onClick={() => setVoiceActive((active) => !active)}
              >
                <Mic size={18} />
              </button>
            </div>
            <button className="primary-button" type="button" onClick={() => runGeneration()} disabled={isGenerating}>
              {isGenerating ? <ButtonSpinner /> : <Send size={15} />}
              {isGenerating ? "Thinking" : "Send"}
            </button>
          </div>
        </div>

        <div className="copilot-suggestions">
          <p className="eyebrow">Suggested for you</p>
          <div>
            {suggestedPrompts.map((item) => (
              <button className="copilot-suggestion-row" key={item.id} type="button" onClick={() => runGeneration(item.title)}>
                <span>{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        {isGenerating ? <GeneratingDraftsState /> : null}
        {hasOutput && !isGenerating ? <GeneratedOutput prompt={prompt} onToast={onToast} /> : null}
      </section>
    </div>
  );
}

function GeneratingDraftsState() {
  return (
    <section className="copilot-response loading-output" aria-label="Agent thinking">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Agent</p>
          <h2>Reading workspace context</h2>
        </div>
        <StatusBadge status="Working" />
      </div>
      <div className="copilot-thinking-lines">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

function VoiceWaveform() {
  return (
    <div className="voice-waveform" aria-label="Voice note preview">
      <span>Voice note</span>
      <div>
        {[14, 22, 30, 18, 36, 24, 32, 16, 28, 20, 34, 22].map((height, index) => (
          <i key={`${height}-${index}`} style={{ height }} />
        ))}
      </div>
    </div>
  );
}

function GeneratedOutput({ prompt, onToast }: { prompt: string; onToast: ToastHandler }) {
  const highlights = demoCopilotOutputs.slice(0, 3);

  return (
    <section className="copilot-response" aria-label="Agent response">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Agent response</p>
          <h2>{prompt || "Ready to help with your next workflow"}</h2>
        </div>
        <StatusBadge status="Ready" />
      </div>
      <div className="chat-response-body">
        <p>
          I can work from your connected sources and keep the result tied to agent actions, customer segment movement,
          and reply-ready context.
        </p>
        <div className="chat-response-list">
          {highlights.map((output) => (
            <button key={output.id} type="button" onClick={() => onToast("Opened draft", output.title, "info")}>
              <span>{output.channel}</span>
              <strong>{output.title}</strong>
              <small>{output.segment}</small>
            </button>
          ))}
        </div>
        <div className="copilot-response-actions">
          <button type="button" onClick={() => onToast("Saved", "Added to agent memory")}>Save context</button>
          <button type="button" onClick={() => onToast("Opened", "Queue ready", "info")}>Open queue</button>
          <button type="button" onClick={() => onToast("Draft generated", "Reply pack created")}>Create reply pack</button>
        </div>
      </div>
    </section>
  );
}

type EngagementAgentTab = "Insights" | "Activity" | "Accounts" | "Rules";
type EngagementMetricKey = "impressions" | "people" | "engagement" | "replies";

type EngagementTrendDatum = {
  id: string;
  label: string;
  fullLabel: string;
  impressions: number;
  people: number;
  engagement: number;
  replies: number;
};

const engagementAgentTabs: EngagementAgentTab[] = ["Insights", "Activity", "Accounts", "Rules"];

const engagementMetrics = [
  { id: "impressions", label: "Impressions", value: "135.6k", detail: "+18% in 30 days", icon: <BarChart3 size={18} />, tone: "success" },
  { id: "people", label: "People reached", value: "99.7k", detail: "10k saw top comments", icon: <UserRoundCheck size={18} />, tone: "info" },
  { id: "engagement", label: "Engagement", value: "6,482", detail: "Replies, likes, saves", icon: <CircleDashed size={18} />, tone: "accent" },
  { id: "replies", label: "Tweets replied to", value: "426", detail: "60/day cap active", icon: <MessageSquareReply size={18} />, tone: "warning" },
];

const engagementTrendByRange: Record<string, EngagementTrendDatum[]> = {
  "7 days": [
    { id: "jun-05", label: "Jun 5", fullLabel: "June 5", impressions: 25800, people: 18900, engagement: 1260, replies: 58 },
    { id: "jun-06", label: "Jun 6", fullLabel: "June 6", impressions: 27400, people: 19900, engagement: 1370, replies: 61 },
    { id: "jun-07", label: "Jun 7", fullLabel: "June 7", impressions: 26200, people: 19100, engagement: 1300, replies: 59 },
    { id: "jun-08", label: "Jun 8", fullLabel: "June 8", impressions: 29600, people: 21700, engagement: 1510, replies: 65 },
    { id: "jun-09", label: "Jun 9", fullLabel: "June 9", impressions: 28400, people: 20800, engagement: 1440, replies: 63 },
    { id: "jun-10", label: "Jun 10", fullLabel: "June 10", impressions: 33400, people: 24200, engagement: 1720, replies: 71 },
    { id: "jun-11", label: "Jun 11", fullLabel: "June 11", impressions: 31800, people: 23100, engagement: 1640, replies: 68 },
  ],
  "30 days": [
    { id: "may-12", label: "May 12", fullLabel: "May 12", impressions: 8200, people: 6100, engagement: 330, replies: 18 },
    { id: "may-15", label: "May 15", fullLabel: "May 15", impressions: 11200, people: 8200, engagement: 480, replies: 23 },
    { id: "may-18", label: "May 18", fullLabel: "May 18", impressions: 9800, people: 7300, engagement: 430, replies: 21 },
    { id: "may-21", label: "May 21", fullLabel: "May 21", impressions: 14600, people: 10700, engagement: 660, replies: 32 },
    { id: "may-24", label: "May 24", fullLabel: "May 24", impressions: 13200, people: 9800, engagement: 590, replies: 29 },
    { id: "may-27", label: "May 27", fullLabel: "May 27", impressions: 19100, people: 14100, engagement: 920, replies: 43 },
    { id: "may-30", label: "May 30", fullLabel: "May 30", impressions: 17600, people: 12900, engagement: 820, replies: 39 },
    { id: "jun-02", label: "Jun 2", fullLabel: "June 2", impressions: 23800, people: 17400, engagement: 1160, replies: 53 },
    { id: "jun-05", label: "Jun 5", fullLabel: "June 5", impressions: 25800, people: 18900, engagement: 1260, replies: 58 },
    { id: "jun-08", label: "Jun 8", fullLabel: "June 8", impressions: 29600, people: 21700, engagement: 1510, replies: 65 },
    { id: "jun-11", label: "Jun 11", fullLabel: "June 11", impressions: 31800, people: 23100, engagement: 1640, replies: 68 },
  ],
  "3 months": [
    { id: "apr-w1", label: "Apr W1", fullLabel: "April week 1", impressions: 64200, people: 46200, engagement: 2310, replies: 142 },
    { id: "apr-w2", label: "Apr W2", fullLabel: "April week 2", impressions: 71400, people: 51400, engagement: 2780, replies: 162 },
    { id: "apr-w3", label: "Apr W3", fullLabel: "April week 3", impressions: 68200, people: 49100, engagement: 2510, replies: 150 },
    { id: "apr-w4", label: "Apr W4", fullLabel: "April week 4", impressions: 83600, people: 60400, engagement: 3340, replies: 189 },
    { id: "may-w1", label: "May W1", fullLabel: "May week 1", impressions: 91200, people: 65700, engagement: 3820, replies: 205 },
    { id: "may-w2", label: "May W2", fullLabel: "May week 2", impressions: 87200, people: 63200, engagement: 3590, replies: 196 },
    { id: "may-w3", label: "May W3", fullLabel: "May week 3", impressions: 103400, people: 74800, engagement: 4710, replies: 244 },
    { id: "may-w4", label: "May W4", fullLabel: "May week 4", impressions: 98200, people: 71400, engagement: 4460, replies: 231 },
    { id: "jun-w1", label: "Jun W1", fullLabel: "June week 1", impressions: 123800, people: 90400, engagement: 5920, replies: 307 },
    { id: "jun-w2", label: "Jun W2", fullLabel: "June week 2", impressions: 116600, people: 85800, engagement: 5480, replies: 292 },
  ],
  "This month": [
    { id: "jun-01", label: "Jun 1", fullLabel: "June 1", impressions: 23800, people: 17400, engagement: 1160, replies: 53 },
    { id: "jun-02", label: "Jun 2", fullLabel: "June 2", impressions: 25100, people: 18300, engagement: 1230, replies: 56 },
    { id: "jun-03", label: "Jun 3", fullLabel: "June 3", impressions: 24200, people: 17700, engagement: 1180, replies: 54 },
    { id: "jun-04", label: "Jun 4", fullLabel: "June 4", impressions: 26900, people: 19800, engagement: 1340, replies: 60 },
    { id: "jun-05", label: "Jun 5", fullLabel: "June 5", impressions: 25800, people: 18900, engagement: 1260, replies: 58 },
    { id: "jun-06", label: "Jun 6", fullLabel: "June 6", impressions: 28600, people: 21100, engagement: 1440, replies: 63 },
    { id: "jun-07", label: "Jun 7", fullLabel: "June 7", impressions: 27600, people: 20200, engagement: 1380, replies: 61 },
    { id: "jun-08", label: "Jun 8", fullLabel: "June 8", impressions: 29600, people: 21700, engagement: 1510, replies: 65 },
    { id: "jun-09", label: "Jun 9", fullLabel: "June 9", impressions: 28400, people: 20800, engagement: 1440, replies: 63 },
    { id: "jun-10", label: "Jun 10", fullLabel: "June 10", impressions: 33400, people: 24200, engagement: 1720, replies: 71 },
    { id: "jun-11", label: "Jun 11", fullLabel: "June 11", impressions: 31800, people: 23100, engagement: 1640, replies: 68 },
  ],
};

const engagementSeries: Array<{ key: EngagementMetricKey; label: string; color: string }> = [
  { key: "impressions", label: "Impressions", color: "#14B8A6" },
  { key: "people", label: "People reached", color: "#2563EB" },
  { key: "engagement", label: "Engagement", color: "#F97316" },
  { key: "replies", label: "Replies", color: "#7C3AED" },
];

const engagementSignals = [
  { id: "signal-operator", title: "Operator threads are compounding", detail: "Replies on founder-led distribution posts created the strongest reach lift.", value: "+18%" },
  { id: "signal-proof", title: "Customer proof is pulling saves", detail: "Proof-led comments are more likely to be saved or revisited.", value: "34%" },
  { id: "signal-x", title: "X reply cap is nearly full", detail: "The agent used 52 of 60 daily reply/comment actions.", value: "52/60" },
];

const engagementActivityRows = [
  { id: "activity-001", type: "Lead Discovery", signal: "Lookalike match: Similar to your ideal lead", analyzed: "7 leads analyzed", matched: "7 matched", date: "4 hours ago" },
  { id: "activity-002", type: "Engagement", signal: "Replied to founder-led distribution thread", analyzed: "10k potential reach", matched: "1 warm reply", date: "5 hours ago" },
  { id: "activity-003", type: "Lead Discovery", signal: "Hiring right now", analyzed: "25 leads analyzed", matched: "18 matched", date: "6 hours ago" },
  { id: "activity-004", type: "Reply Draft", signal: "Customer proof comment for Maya Ren", analyzed: "High ICP fit", matched: "Review needed", date: "8 hours ago" },
  { id: "activity-005", type: "Lead Discovery", signal: "Lookalike match: Similar to your ideal lead", analyzed: "8 leads analyzed", matched: "8 matched", date: "10 hours ago" },
  { id: "activity-006", type: "Signal", signal: '"founder led marketing"', analyzed: "20 leads analyzed", matched: "0 matched", date: "12 hours ago" },
  { id: "activity-007", type: "Engagement", signal: "Acknowledged CMO post about approval rhythm", analyzed: "LinkedIn comment", matched: "Postable", date: "16 hours ago" },
  { id: "activity-008", type: "Lead Discovery", signal: "Social content automation", analyzed: "26 leads analyzed", matched: "1 matched", date: "a day ago" },
  { id: "activity-009", type: "Lead Discovery", signal: "Hiring right now", analyzed: "176 leads analyzed", matched: "26 matched", date: "a day ago" },
];

const engagementAccounts = [
  { id: "account-linkedin-first", channel: "LinkedIn", name: "First account", owner: "Jay .", status: "Not connected", detail: "Connection link ready", initials: "J" },
  { id: "account-linkedin-second", channel: "LinkedIn", name: "Second account", owner: "Backup profile", status: "Not connected", detail: "Needs permission review", initials: "S" },
  { id: "account-x-primary", channel: "X", name: "Primary X account", owner: "Founder voice", status: "Connected", detail: "60 replies/comments daily cap", initials: "X" },
];

type RelationshipSection = "Relationship Memory" | "Customer Lifecycle";
type LifecycleModel = "brand" | "founder";

type RelationshipProfile = {
  id: string;
  person: string;
  company: string;
  platform: "LinkedIn" | "X";
  engagements: number;
  icpFit: string;
  intent: "High" | "Medium" | "Low";
  stage: "Warm" | "Needs follow-up" | "Awaiting response" | "Discovered";
  action: string;
  summary: string;
  memory: string;
  suggestedNext: string;
};

const relationshipSections: RelationshipSection[] = ["Relationship Memory", "Customer Lifecycle"];

const relationshipMetrics = [
  { id: "icp-fit", label: "ICP-fit", value: "126", detail: "+16%", icon: <UserRoundCheck size={18} />, tone: "success" },
  { id: "repeat-engagers", label: "Repeat", value: "74", detail: "+9%", icon: <RefreshCw size={18} />, tone: "info" },
  { id: "warm-relationships", label: "Warm", value: "32", detail: "+14%", icon: <UsersRound size={18} />, tone: "accent" },
  { id: "awaiting-response", label: "Waiting", value: "11", detail: "Follow-up", icon: <MessageSquareReply size={18} />, tone: "warning" },
  { id: "founder-action", label: "Founder action", value: "5", detail: "Review", icon: <Target size={18} />, tone: "neutral" },
];

const relationshipRows: RelationshipProfile[] = [
  {
    id: "relationship-viraj",
    person: "Viraj Sharma",
    company: "D2C growth studio",
    platform: "LinkedIn",
    engagements: 9,
    icpFit: "94%",
    intent: "High",
    stage: "Warm",
    action: "Founder follow-up",
    summary: "D2C founder who keeps engaging with proof-led distribution posts.",
    memory: "Responded positively to customer proof framing and asked how approvals are handled.",
    suggestedNext: "Send a founder-led note with one customer proof example.",
  },
  {
    id: "relationship-ananya",
    person: "Ananya Rao",
    company: "Northline Brands",
    platform: "LinkedIn",
    engagements: 6,
    icpFit: "88%",
    intent: "Medium",
    stage: "Awaiting response",
    action: "Wait two days",
    summary: "CMO at a D2C brand with strong interest in consistent LinkedIn output.",
    memory: "Reacted to two founder visibility posts and saved the approval rhythm post.",
    suggestedNext: "Keep in nurture unless she replies.",
  },
  {
    id: "relationship-rohan",
    person: "Rohan Mehta",
    company: "OperatorLoop",
    platform: "X",
    engagements: 4,
    icpFit: "81%",
    intent: "Medium",
    stage: "Discovered",
    action: "Engage once",
    summary: "Founder posting about fragmented social operations.",
    memory: "Liked a post about publishing from five disconnected tools.",
    suggestedNext: "Reply with a practical note, not a pitch.",
  },
  {
    id: "relationship-neha",
    person: "Neha Kapoor",
    company: "House of Loom",
    platform: "LinkedIn",
    engagements: 8,
    icpFit: "92%",
    intent: "High",
    stage: "Needs follow-up",
    action: "Review draft",
    summary: "Co-founder who asked about customer proof workflows.",
    memory: "Asked for examples of proof-led posts that do not sound like ads.",
    suggestedNext: "Share the customer review screenshot example.",
  },
  {
    id: "relationship-karan",
    person: "Karan Malhotra",
    company: "ScaleShelf",
    platform: "X",
    engagements: 11,
    icpFit: "96%",
    intent: "High",
    stage: "Warm",
    action: "Founder reply",
    summary: "Founder repeatedly engaging with category POV posts.",
    memory: "Responded to the idea that audience quality matters more than reach.",
    suggestedNext: "Ask what his team struggles with in LinkedIn approval.",
  },
];

const customerLifecycleGroups = [
  { segment: "Before purchase", count: 18, meaning: "Asking about proof, outcomes, or workflow clarity." },
  { segment: "During purchase", count: 6, meaning: "Comparing publishing tools and approval paths." },
  { segment: "After purchase", count: 4, meaning: "Likely to share proof or workflow snapshots." },
  { segment: "Upset customers", count: 2, meaning: "Need human review before the agent engages." },
  { segment: "UGC/proof opportunities", count: 7, meaning: "Reusable positive screenshots or comments." },
  { segment: "Repeat purchase opportunities", count: 3, meaning: "Showing renewed interest in add-on support." },
];

const founderLifecycleGroups = [
  { segment: "Cold audience", count: 420, meaning: "People with one light engagement." },
  { segment: "Warm audience", count: 32, meaning: "Repeat or high-intent engagement." },
  { segment: "High-value accounts", count: 11, meaning: "Founders, CMOs, and operators to monitor." },
  { segment: "Collaborators", count: 5, meaning: "Creators worth relationship-building." },
  { segment: "Prospects", count: 9, meaning: "Asking implementation or workflow questions." },
];

function EngagementAgentPage({ onToast }: { onToast: ToastHandler }) {
  const [activeTab, setActiveTab] = useState<EngagementAgentTab>("Insights");

  return (
    <div className="page-stack engagement-agent-page">
      <nav className="engagement-tabs" aria-label="Engagement agent sections">
        {engagementAgentTabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : undefined}
            type="button"
            aria-pressed={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Insights" ? <EngagementInsights /> : null}
      {activeTab === "Activity" ? <EngagementActivity /> : null}
      {activeTab === "Accounts" ? <EngagementAccounts onToast={onToast} /> : null}
      {activeTab === "Rules" ? <EngagementCustomize onToast={onToast} /> : null}
    </div>
  );
}

function EngagementInsights() {
  const [activeFilter, setActiveFilter] = useState("30 days");

  return (
    <section className="engagement-tab-panel" aria-label="Engagement insights">
      <div className="engagement-metric-grid">
        {engagementMetrics.map((metric) => (
          <article className="agent-metric-card" key={metric.id}>
            <span className={`agent-metric-icon ${metric.tone}`}>{metric.icon}</span>
            <div>
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
              <span>{metric.detail}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="engagement-graph-filters" aria-label="Graph date filters">
        {demoDashboard.timeFilters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? "active" : undefined}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <ActivityChart activeFilter={activeFilter} showInspector={false} />

      <aside className="important-signals-card compact">
        <div className="surface-header">
          <div>
            <p className="eyebrow">Top signals</p>
            <h2>What changed</h2>
          </div>
          <StatusBadge status="Live" />
        </div>
        <div className="important-signal-list">
          {engagementSignals.map((signal) => (
            <div className="important-signal-row" key={signal.id}>
              <div>
                <strong>{signal.title}</strong>
                <span>{signal.detail}</span>
              </div>
              <b>{signal.value}</b>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

function EngagementTrendChart() {
  const [activeRange, setActiveRange] = useState("30 days");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const width = 760;
  const height = 285;
  const padding = { top: 22, right: 24, bottom: 36, left: 48 };
  const data = engagementTrendByRange[activeRange] ?? engagementTrendByRange["30 days"];
  const maxValue = Math.max(...data.flatMap((item) => engagementSeries.map((series) => item[series.key])), 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const activeIndex = hoveredIndex ?? pinnedIndex ?? Math.max(data.length - 2, 0);
  const activeDatum = data[activeIndex] ?? data[data.length - 1];
  const yTicks = [maxValue, Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  const pointsFor = (metric: EngagementMetricKey) =>
    data.map((item, index) => {
      const x = padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth;
      const y = padding.top + (1 - item[metric] / maxValue) * plotHeight;
      return { x, y, value: item[metric] };
    });

  const impressionPoints = pointsFor("impressions");
  const impressionPath = buildSmoothPath(impressionPoints);
  const areaPath = impressionPoints.length
    ? `${impressionPath} L ${impressionPoints[impressionPoints.length - 1].x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} L ${impressionPoints[0].x.toFixed(1)} ${(height - padding.bottom).toFixed(1)} Z`
    : "";

  return (
    <article className="engagement-chart-card">
      <div className="engagement-chart-head">
        <div>
          <p className="eyebrow">Distribution</p>
          <h2>Engagement lift over time</h2>
          <span>{activeDatum.fullLabel}: {formatCompact(activeDatum.impressions)} impressions, {activeDatum.replies} replies</span>
        </div>
        <div className="engagement-date-filters" aria-label="Graph date filters">
          {demoDashboard.timeFilters.map((filter) => (
            <button
              key={filter}
              className={activeRange === filter ? "active" : undefined}
              type="button"
              aria-pressed={activeRange === filter}
              onClick={() => {
                setActiveRange(filter);
                setHoveredIndex(null);
                setPinnedIndex(null);
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="engagement-chart-wrap" onMouseLeave={() => setHoveredIndex(null)}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Engagement trend for ${activeRange}`}>
          <defs>
            <linearGradient id="engagement-impressions-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={width} height={height} fill="transparent" />
          {yTicks.map((tick) => {
            const y = padding.top + (1 - tick / maxValue) * plotHeight;
            return (
              <g key={tick}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E5E7EB" />
                <text x={padding.left - 12} y={y + 4} textAnchor="end" className="chart-axis-label">
                  {formatCompact(tick)}
                </text>
              </g>
            );
          })}

          {areaPath ? <path d={areaPath} fill="url(#engagement-impressions-fill)" /> : null}
          {engagementSeries.map((series) => (
            <path
              key={series.key}
              d={buildSmoothPath(pointsFor(series.key))}
              fill="none"
              stroke={series.color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={series.key === "impressions" ? 3.5 : 2.6}
              opacity={series.key === "impressions" ? 1 : 0.72}
            />
          ))}

          {data.map((item, index) => {
            const activePoint = impressionPoints[index];
            const previousX = impressionPoints[index - 1]?.x ?? padding.left;
            const nextX = impressionPoints[index + 1]?.x ?? width - padding.right;
            const zoneX = index === 0 ? padding.left : (previousX + activePoint.x) / 2;
            const zoneWidth = index === data.length - 1 ? width - padding.right - zoneX : (nextX + activePoint.x) / 2 - zoneX;
            const isActive = index === activeIndex;

            return (
              <g key={item.id}>
                {isActive ? (
                  <>
                    <line x1={activePoint.x} x2={activePoint.x} y1={padding.top} y2={height - padding.bottom} stroke="#CBD5E1" strokeDasharray="4 7" />
                    <circle cx={activePoint.x} cy={activePoint.y} r="6" fill="#FFFFFF" stroke="#14B8A6" strokeWidth="3" />
                  </>
                ) : null}
                <rect
                  x={zoneX}
                  y={padding.top}
                  width={Math.max(zoneWidth, 1)}
                  height={plotHeight}
                  fill="transparent"
                  tabIndex={0}
                  onClick={() => setPinnedIndex(index)}
                  onFocus={() => setHoveredIndex(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                />
              </g>
            );
          })}

          {data.map((item, index) => {
            const shouldShow = index === 0 || index === Math.floor(data.length / 2) || index === data.length - 1 || data.length <= 8;
            if (!shouldShow) return null;
            const x = padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth;
            return (
              <text key={`engagement-label-${item.id}`} x={x} y={height - 12} textAnchor={index === 0 ? "start" : index === data.length - 1 ? "end" : "middle"} className="chart-axis-label">
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="chart-legend">
        {engagementSeries.map((series) => (
          <span key={series.key}>
            <i style={{ background: series.color }} />
            {series.label}
          </span>
        ))}
      </div>
    </article>
  );
}

function EngagementActivity() {
  return (
    <section className="agent-activity-card">
      <div className="agent-activity-toolbar">
        <button className="secondary-button" type="button">
          All Activity
          <MoreHorizontal size={15} />
        </button>
        <span>63 events</span>
      </div>
      <DataTable
        rows={engagementActivityRows}
        columns={[
          {
            header: "Type",
            accessor: (row) => <span className="agent-type-badge">{row.type}</span>,
            width: "180px",
          },
          {
            header: "Contact / Signal",
            accessor: (row) => <strong>{row.signal}</strong>,
          },
          {
            header: "Result",
            accessor: (row) => (
              <div className="agent-result-cell">
                <span>{row.analyzed}</span>
                <strong>{row.matched}</strong>
              </div>
            ),
            width: "300px",
          },
          { header: "Date", accessor: "date", width: "170px" },
        ]}
      />
    </section>
  );
}

function EngagementAccounts({ onToast }: { onToast: ToastHandler }) {
  return (
    <section className="agent-accounts-card">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Accounts</p>
          <h2>Social Connections</h2>
          <span>Manage the accounts this agent can read from and engage through.</span>
        </div>
        <button className="primary-button" type="button" onClick={() => onToast("Connection queued", "Invite link ready")}>
          <Plus size={16} />
          Add account
        </button>
      </div>

      <div className="agent-account-list">
        {engagementAccounts.map((account) => (
          <article className="agent-account-row" key={account.id}>
            <div className={`agent-account-avatar ${account.channel.toLowerCase()}`}>{account.initials}</div>
            <div className="agent-account-copy">
              <strong>{account.name}</strong>
              <span>{account.owner}</span>
            </div>
            <ChannelPill channel={account.channel} />
            <button className="secondary-button slim" type="button" onClick={() => onToast("Opened settings", account.name, "info")}>
              Settings & Limits
            </button>
            <div className="connection-status">
              <strong>{account.status}</strong>
              <span>{account.detail}</span>
            </div>
            <button className="link-button" type="button" onClick={() => onToast("Invite link copied", account.name)}>
              Copy connection link
            </button>
            <button className="primary-button slim" type="button" onClick={() => onToast("Connect flow opened", account.name, "info")}>
              Connect
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function EngagementCustomize({ onToast }: { onToast: ToastHandler }) {
  return (
    <section className="agent-customize-panel">
      <div className="review-mode-card">
        <div>
          <p className="eyebrow">Review mode</p>
          <h2>Approval behavior</h2>
        </div>
        <div className="review-mode-toggle" aria-label="Review mode">
          <button className="active" type="button">Yes, review first</button>
          <button type="button">No, follow limits</button>
        </div>
      </div>

      <label className="agent-instructions-card">
        <span>Agent instructions</span>
        <textarea
          defaultValue={`- Prioritize founders, C-suite, and operators.
- Engage with useful replies, acknowledgements, and comments before pitching.
- Avoid political, sensitive, competitor-attack, or low-fit agency threads.
- Ask for review before quote posts, LinkedIn comments, or high-risk replies.
- Update relationship memory after every meaningful engagement.`}
        />
      </label>

      <div className="agent-customize-grid">
        <article className="agent-custom-card limits">
          <div className="agent-custom-card-head">
            <SlidersHorizontal size={17} />
            <h3>Limits</h3>
          </div>
          <div className="agent-limit-list">
            <div><span>X replies/comments</span><strong>60/day</strong></div>
            <div><span>LinkedIn comments</span><strong>25/day</strong></div>
            <div><span>Quote posts</span><strong>Review only</strong></div>
          </div>
        </article>

        <article className="agent-custom-card">
          <div className="agent-custom-card-head">
            <Mic size={17} />
            <h3>Voice</h3>
          </div>
          <p>Warm, useful, founder-aware. Use Hinglish on X when natural; keep LinkedIn English and specific.</p>
          <button className="secondary-button slim" type="button" onClick={() => onToast("Voice saved", "Agent voice updated")}>
            Save voice
          </button>
        </article>

        <article className="agent-custom-card">
          <div className="agent-custom-card-head">
            <PenLine size={17} />
            <h3>Narrative</h3>
          </div>
          <p>Founder Trust, Customer Proof, Product Education, and Category POV are the active engagement narratives.</p>
          <button className="secondary-button slim" type="button" onClick={() => onToast("Narrative saved", "Agent rules updated")}>
            Save narrative
          </button>
        </article>
      </div>
    </section>
  );
}

function FounderLedPage({ onToast }: { onToast: ToastHandler }) {
  const flow = demoContentFlows[0];
  const tabs = ["Overview", "Flow", "Queue", "Activity", "Settings"];
  const [activeTab, setActiveTab] = useState("Flow");
  const timelineSteps = [
    {
      id: "detect-angles",
      number: 1,
      title: "Detect Angles",
      items: ["Pain points", "Product updates", "ICP objections"],
      status: "Active",
      count: "13 signals",
    },
    {
      id: "generate-drafts",
      number: 2,
      title: "Create drafts",
      items: ["LinkedIn post", "X thread", "Comment reply", "Relationship note"],
      status: "Ready",
      count: `${flow.drafts} drafts`,
    },
    {
      id: "review",
      number: 3,
      title: "Review",
      items: ["Founder voice check", "Claims check", "ICP fit"],
      status: "Queued",
      count: "3 checks",
    },
    {
      id: "publish",
      number: 4,
      title: "Publish",
      items: ["LinkedIn", "X", "Schedule", "Track reactions"],
      status: "Queued",
      count: `${flow.published} live`,
    },
    {
      id: "engage",
      number: 5,
      title: "Engage",
      items: ["Monitor replies", "Draft responses", "Update warm ICPs"],
      status: "Queued",
      count: `${flow.replies} replies`,
    },
  ];

  return (
    <div className="page-stack founder-flow-page">
      <section className="founder-flow-header">
        <div>
          <p className="eyebrow">Flow</p>
          <h2>Founder-led Content</h2>
          <span>{flow.nextRun}</span>
        </div>
        <StatusBadge status={flow.status} />
      </section>

      <nav className="flow-tabs" aria-label="Flow sections">
        {tabs.map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : undefined} type="button" onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </nav>

      <section className="sequence-builder">
        <div className="sequence-source-card">
          <div>
            <p className="eyebrow">Entry</p>
            <h3>Sources</h3>
            <span>Qualified signals enter flow</span>
          </div>
          <div className="flow-source-row">
            {["Slack", "Telegram", "LinkedIn", "X"].map((source) => (
              <SourceBadge key={source} source={source} />
            ))}
          </div>
        </div>

        <div className="timeline-steps">
          {timelineSteps.map((step) => (
            <article className="timeline-step-card" key={step.id}>
              <div className="timeline-number">{step.number}</div>
              <div className="timeline-card-body">
                <div className="timeline-card-header">
                  <div>
                    <h3>{step.title}</h3>
                    <span>{step.count}</span>
                  </div>
                  <div>
                    <StatusBadge status={step.status} />
                    <button className="secondary-button slim" type="button" onClick={() => onToast("Settings saved", `${step.title} updated`, "info")}>Edit</button>
                  </div>
                </div>
                <div className="timeline-chip-row">
                  {step.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="sequence-end-card">
          <div className="timeline-number complete">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <h3>Flow Complete</h3>
            <span>Learning updates Content Brain</span>
          </div>
          <StatusBadge status="Learning" />
        </div>
      </section>
    </div>
  );
}

function AudiencePage({ onToast }: { onToast: ToastHandler }) {
  const [activeSection, setActiveSection] = useState<RelationshipSection>("Relationship Memory");
  const [activeStage, setActiveStage] = useState<string>("All");
  const [lifecycleModel, setLifecycleModel] = useState<LifecycleModel>("brand");
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipProfile | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const stageFilters = ["All", "Warm", "Needs follow-up", "Awaiting response", "Discovered"];
  const visibleRelationships = activeStage === "All" ? relationshipRows : relationshipRows.filter((row) => row.stage === activeStage);
  const lifecycleGroups = lifecycleModel === "brand" ? customerLifecycleGroups : founderLifecycleGroups;

  const exportCsv = () => {
    const headers = ["Person", "Company", "Platform", "Engagements", "ICP Fit", "Intent", "Stage", "Action"];
    const rows = relationshipRows.map((person) => [
      person.person,
      person.company,
      person.platform,
      person.engagements,
      person.icpFit,
      person.intent,
      person.stage,
      person.action,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).split("\"").join("\"\"")}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "helixar-relationships.csv";
    link.click();
    URL.revokeObjectURL(url);
    onToast("CSV exported", "Relationship memory");
  };

  const importIcps = () => {
    setIsImporting(true);
    window.setTimeout(() => {
      setIsImporting(false);
      onToast("Source connected", "ICPs imported");
    }, 850);
  };

  return (
    <div className="page-stack audience-page relationships-page">
      <nav className="relationship-tabs" aria-label="Relationship sections">
        {relationshipSections.map((section) => (
          <button
            key={section}
            className={activeSection === section ? "active" : undefined}
            type="button"
            aria-pressed={activeSection === section}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      {activeSection === "Relationship Memory" ? (
        <>
          <section className="relationship-metric-grid" aria-label="Relationship metrics">
            {relationshipMetrics.map((metric) => (
              <article className="relationship-metric-card" key={metric.id}>
                <span className={`relationship-metric-icon ${metric.tone}`}>{metric.icon}</span>
                <div>
                  <p>{metric.label}</p>
                  <strong>{metric.value}</strong>
                  <span>{metric.detail}</span>
                </div>
              </article>
            ))}
          </section>

          <section className="surface audience-table-card relationship-table-card">
            <div className="surface-header">
              <div>
                <p className="eyebrow">Relationship Memory</p>
                <h2>Tracked people</h2>
              </div>
              <div className="audience-actions">
                <button className="secondary-button slim" type="button" onClick={() => onToast("Person added", "Manual relationship ready", "info")}>
                  <UserPlus size={15} />
                  Add person
                </button>
                <button className="secondary-button slim" type="button" onClick={importIcps} disabled={isImporting}>
                  {isImporting ? <ButtonSpinner /> : <Upload size={15} />}
                  {isImporting ? "Importing" : "Import"}
                </button>
                <button className="secondary-button slim" type="button" onClick={exportCsv}>
                  <Download size={15} />
                  Export
                </button>
              </div>
            </div>

            <div className="relationship-stage-tabs" aria-label="Relationship stages">
              {stageFilters.map((stage) => (
                <button
                  key={stage}
                  className={activeStage === stage ? "active" : undefined}
                  type="button"
                  aria-pressed={activeStage === stage}
                  onClick={() => setActiveStage(stage)}
                >
                  {stage}
                </button>
              ))}
            </div>

            <DataTable
              rows={visibleRelationships}
              columns={[
                {
                  header: "Person",
                  accessor: (row) => (
                    <div className="audience-icp-cell">
                      <div className="avatar">{row.person.slice(0, 1)}</div>
                      <div>
                        <strong>{row.person}</strong>
                        <span>{row.company}</span>
                      </div>
                    </div>
                  ),
                },
                { header: "Platform", accessor: (row) => <ChannelPill channel={row.platform} />, width: "130px" },
                { header: "Engaged", accessor: (row) => `${row.engagements}x`, width: "92px" },
                { header: "ICP fit", accessor: "icpFit", width: "92px" },
                { header: "Intent", accessor: (row) => <AudienceScoreBadge label={row.intent} />, width: "108px" },
                { header: "Stage", accessor: (row) => <StatusBadge status={row.stage} />, width: "140px" },
                { header: "Action", accessor: "action" },
                {
                  header: "Actions",
                  width: "230px",
                  accessor: (row) => (
                    <div className="audience-row-actions">
                      <button type="button" onClick={() => setSelectedRelationship(row)}>View</button>
                      <button type="button" onClick={() => onToast("Draft generated", `Reply for ${row.person}`)}>
                        Draft Reply
                      </button>
                      <button type="button" aria-label={`More actions for ${row.person}`}>
                        <MoreHorizontal size={15} />
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </section>
        </>
      ) : (
        <section className="relationship-lifecycle-panel">
          <div className="relationship-lifecycle-toolbar">
            <div>
              <p className="eyebrow">Customer Lifecycle</p>
              <h2>Lifecycle groups</h2>
              <span>Choose which lifecycle model to track.</span>
            </div>
            <div className="relationship-model-toggle" aria-label="Lifecycle model">
              <button
                className={lifecycleModel === "brand" ? "active" : undefined}
                type="button"
                aria-pressed={lifecycleModel === "brand"}
                onClick={() => setLifecycleModel("brand")}
              >
                Brand / D2C
              </button>
              <button
                className={lifecycleModel === "founder" ? "active" : undefined}
                type="button"
                aria-pressed={lifecycleModel === "founder"}
                onClick={() => setLifecycleModel("founder")}
              >
                Solo founder
              </button>
            </div>
          </div>

          <div className="relationship-lifecycle-grid">
            {lifecycleGroups.map((group) => (
              <article className="relationship-lifecycle-card" key={group.segment}>
                <div>
                  <h3>{group.segment}</h3>
                  <p>{group.meaning}</p>
                </div>
                <div className="relationship-lifecycle-card-foot">
                  <div>
                    <strong>{group.count}</strong>
                    <span>people</span>
                  </div>
                  <button className="secondary-button slim" type="button" onClick={() => onToast("Segment opened", group.segment, "info")}>
                    Open segment
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <RelationshipDrawer relationship={selectedRelationship} onClose={() => setSelectedRelationship(null)} onToast={onToast} />
    </div>
  );
}

function RelationshipDrawer({
  relationship,
  onClose,
  onToast,
}: {
  relationship: RelationshipProfile | null;
  onClose: () => void;
  onToast: ToastHandler;
}) {
  return (
    <Drawer
      open={Boolean(relationship)}
      title={relationship?.person ?? "Relationship"}
      subtitle={relationship ? `${relationship.company} - ${relationship.stage}` : "Relationship memory"}
      onClose={onClose}
    >
      <div className="audience-drawer-body">
        <div className="audience-drawer-profile">
          <div className="avatar">{relationship?.person.slice(0, 1) ?? "R"}</div>
          <div>
            <h3>{relationship?.person}</h3>
            <span>{relationship?.company}</span>
          </div>
          <StatusBadge status={relationship?.stage ?? "Warm"} />
        </div>
        <div className="drawer-tag-row">
          <ChannelPill channel={relationship?.platform ?? "LinkedIn"} />
          <AudienceScoreBadge label={relationship?.intent ?? "High"} />
          <StatusBadge status={`${relationship?.engagements ?? 0} engagements`} />
        </div>
        <div className="drawer-section">
          <h4>Who they are</h4>
          <p>{relationship?.summary}</p>
        </div>
        <div className="drawer-section">
          <h4>What the agent remembers</h4>
          <p>{relationship?.memory}</p>
        </div>
        <div className="drawer-section">
          <h4>Suggested next action</h4>
          <p>{relationship?.suggestedNext}</p>
          <div className="drawer-section-actions">
            <button className="secondary-button slim" type="button" onClick={() => onToast("Saved", `${relationship?.person} kept in nurture`)}>
              Keep in nurture
            </button>
            <button className="primary-button slim" type="button" onClick={() => onToast("Draft generated", `Reply for ${relationship?.person}`)}>
              Draft reply
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function AudienceScoreBadge({ label }: { label: string }) {
  return <span className={`audience-score-badge ${label.toLowerCase()}`}>{label}</span>;
}

function AudienceDrawer({
  member,
  signal,
  scoreLabel,
  onClose,
  onToast,
}: {
  member: IcpAudienceMember | null;
  signal: string;
  scoreLabel: string;
  onClose: () => void;
  onToast: ToastHandler;
}) {
  const suggestedReply = member
    ? `Appreciate the signal, ${member.name.split(" ")[0]}. We are seeing teams use source-aware content systems to turn market reactions into faster founder-led drafts without losing ICP context. Worth comparing notes?`
    : "";

  return (
    <Drawer open={Boolean(member)} title={member?.name ?? "ICP"} subtitle={member?.company ?? "Warm ICP"} onClose={onClose}>
      <div className="audience-drawer-body">
        <div className="audience-drawer-profile">
          <div className="avatar">{member?.name.slice(0, 1) ?? "I"}</div>
          <div>
            <h3>{member?.name}</h3>
            <span>{member?.title} · {member?.company}</span>
          </div>
          <AudienceScoreBadge label={scoreLabel || "Warm"} />
        </div>
        <div className="drawer-tag-row">
          <SourceBadge source={member?.source ?? "LinkedIn"} />
          <StatusBadge status={member?.status ?? "Warm"} />
        </div>
        <DrawerSection title="Signal">
          <p>{signal}</p>
        </DrawerSection>
        <DrawerSection title="Content Angle">
          <p>{member?.intentType}: connect {member?.segment} pain to proof from founder-led content and recent market signals.</p>
        </DrawerSection>
        <DrawerSection title="Suggested Reply">
          <p>{suggestedReply}</p>
          <div className="drawer-section-actions">
            <button className="secondary-button slim" type="button">Edit</button>
            <button className="primary-button" type="button" onClick={() => onToast("Reply approved", member?.name ?? "Warm ICP")}>
              Approve
            </button>
          </div>
        </DrawerSection>
        <DrawerSection title="Basic Information">
          <div className="drawer-info-grid">
            <span>Location</span><strong>{member?.location}</strong>
            <span>Fit</span><strong>{member?.fit}</strong>
            <span>Intent</span><strong>{member?.intentType}</strong>
            <span>Last action</span><strong>{member?.lastAction}</strong>
          </div>
        </DrawerSection>
        <DrawerSection title="Notes">
          <p>{member?.notes}</p>
        </DrawerSection>
        <DrawerSection title="Activity Logs">
          <ul className="activity-log-list">
            <li>Signal captured from {member?.source}</li>
            <li>ICP score updated to {scoreLabel}</li>
            <li>Reply suggestion generated</li>
          </ul>
        </DrawerSection>
      </div>
    </Drawer>
  );
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="drawer-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function AudienceFiltersModal({ open, onClose, onToast }: { open: boolean; onClose: () => void; onToast: ToastHandler }) {
  const fields = [
    "Content Flow",
    "List",
    "AI Score",
    "Source",
    "Interested",
    "Intent Type",
    "Fit",
    "Status",
    "Date Range",
    "Sort Order",
  ];

  return (
    <Modal open={open} title="Additional Filters" subtitle="Audience" onClose={onClose}>
      <div className="audience-filter-grid">
        {fields.map((field) => (
          <label key={field}>
            <span>{field}</span>
            <select defaultValue="">
              <option value="">Any</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
        ))}
      </div>
      <div className="drawer-actions">
        <button className="secondary-button" type="button">Clear All</button>
        <button className="secondary-button" type="button" onClick={onClose}>Close</button>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            onClose();
            onToast("Settings saved", "Filters applied");
          }}
        >
          Apply
        </button>
      </div>
    </Modal>
  );
}

const queueModeTabs = ["Queue", "Calendar"] as const;
type QueueMode = (typeof queueModeTabs)[number];

const queueCalendarDays = [
  { id: "mon", day: "Mon", date: "Jun 8" },
  { id: "tue", day: "Tue", date: "Jun 9" },
  { id: "wed", day: "Wed", date: "Jun 10" },
  { id: "thu", day: "Thu", date: "Jun 11" },
  { id: "fri", day: "Fri", date: "Jun 12" },
  { id: "sat", day: "Sat", date: "Jun 13" },
  { id: "sun", day: "Sun", date: "Jun 14" },
] as const;

type QueueCalendarDayId = (typeof queueCalendarDays)[number]["id"] | "unscheduled";

function getQueueCalendarPlacement(item: QueueItem): { dayId: QueueCalendarDayId; time: string; order: number } {
  const value = item.scheduledFor.trim();
  const lowered = value.toLowerCase();

  if (lowered === "unscheduled") return { dayId: "unscheduled", time: "Needs a date", order: 900 };
  if (lowered === "now") return { dayId: "thu", time: "Now", order: 0 };
  if (lowered.startsWith("yesterday")) return { dayId: "wed", time: value.replace(/^Yesterday\s*/i, ""), order: 100 };
  if (lowered.startsWith("today")) return { dayId: "thu", time: value.replace(/^Today\s*/i, ""), order: 200 };
  if (lowered.startsWith("tomorrow")) return { dayId: "fri", time: value.replace(/^Tomorrow\s*/i, ""), order: 300 };
  if (lowered.startsWith("fri")) return { dayId: "fri", time: value.replace(/^Fri\s*/i, ""), order: 350 };
  if (lowered.startsWith("mon")) return { dayId: "mon", time: value.replace(/^Mon\s*/i, ""), order: 80 };

  return { dayId: "unscheduled", time: value, order: 950 };
}

function QueuePage({ onToast }: { onToast: ToastHandler }) {
  const queueTabs = [
    { id: "Drafts", count: demoQueue.drafts.length },
    { id: "Scheduled", count: demoQueue.scheduledPosts.length },
    { id: "Replies", count: demoQueue.suggestedReplies.length },
    { id: "Published", count: demoQueue.publishedPosts.length },
  ] as const;
  type QueueTab = (typeof queueTabs)[number]["id"];

  const rowsByTab: Record<QueueTab, QueueItem[]> = {
    Drafts: demoQueue.drafts,
    Scheduled: demoQueue.scheduledPosts,
    Replies: demoQueue.suggestedReplies,
    Published: demoQueue.publishedPosts,
  };

  const [activeTab, setActiveTab] = useState<QueueTab>("Drafts");
  const [activeMode, setActiveMode] = useState<QueueMode>("Queue");
  const [selectedItem, setSelectedItem] = useState<QueueItem>(demoQueue.drafts[0]);
  const readyCount = demoQueue.drafts.length + demoQueue.scheduledPosts.length + demoQueue.suggestedReplies.length;
  const calendarItems = [
    ...demoQueue.drafts,
    ...demoQueue.scheduledPosts,
    ...demoQueue.suggestedReplies,
    ...demoQueue.publishedPosts,
  ];

  const selectTab = (tab: QueueTab) => {
    setActiveTab(tab);
    setSelectedItem(rowsByTab[tab][0]);
  };

  return (
    <div className="page-stack queue-page">
      <div className="queue-mode-bar">
        <nav className="queue-mode-tabs" aria-label="Queue and calendar">
          {queueModeTabs.map((mode) => (
            <button
              key={mode}
              className={activeMode === mode ? "active" : undefined}
              type="button"
              aria-pressed={activeMode === mode}
              onClick={() => setActiveMode(mode)}
            >
              {mode}
            </button>
          ))}
        </nav>
      </div>

      {activeMode === "Queue" ? (
        <>
          <section className="queue-alert" role="status">
            <div className="queue-alert-main">
              <div className="queue-alert-icon">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong>{readyCount} ready</strong>
                <span>Next publish window</span>
              </div>
            </div>
            <button className="secondary-button slim" type="button" onClick={() => setActiveMode("Calendar")}>
              <CalendarDays size={15} />
              Open calendar
            </button>
          </section>

          <section className="queue-workbench">
            <div className="surface queue-main-card">
              <div className="queue-table-header">
                <nav className="queue-tabs" aria-label="Queue views">
                  {queueTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={activeTab === tab.id ? "active" : undefined}
                      type="button"
                      aria-pressed={activeTab === tab.id}
                      onClick={() => selectTab(tab.id)}
                    >
                      {tab.id}
                      <span>{tab.count}</span>
                    </button>
                  ))}
                </nav>
                <div className="queue-table-meta">
                  <StatusBadge status={activeTab} />
                  <span>{rowsByTab[activeTab].length}</span>
                </div>
              </div>

              {activeTab === "Drafts" ? (
                <QueueDraftsTable rows={rowsByTab.Drafts} onSelect={setSelectedItem} />
              ) : null}
              {activeTab === "Scheduled" ? (
                <QueueScheduledTable rows={rowsByTab.Scheduled} onSelect={setSelectedItem} />
              ) : null}
              {activeTab === "Replies" ? (
                <QueueRepliesTable rows={rowsByTab.Replies} onSelect={setSelectedItem} />
              ) : null}
              {activeTab === "Published" ? (
                <QueuePublishedTable rows={rowsByTab.Published} onSelect={setSelectedItem} />
              ) : null}
            </div>

            <QueuePreviewPanel item={selectedItem} onToast={onToast} />
          </section>
        </>
      ) : (
        <QueueCalendarView items={calendarItems} onSelect={setSelectedItem} onToast={onToast} onBack={() => setActiveMode("Queue")} />
      )}
    </div>
  );
}

function QueueDraftsTable({ rows, onSelect }: { rows: QueueItem[]; onSelect: (item: QueueItem) => void }) {
  return (
    <DataTable
      rows={rows}
      onRowClick={onSelect}
      columns={[
        { header: "Content", accessor: (row) => <QueueContentCell item={row} /> },
        { header: "Channel", accessor: (row) => <ChannelPill channel={row.channel} />, width: "122px" },
        { header: "Segment", accessor: "segment", width: "138px" },
        { header: "Score", accessor: (row) => <ScoreBadge score={row.confidence} />, width: "92px" },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "104px" },
        {
          header: "Actions",
          accessor: (row) => <QueuePreviewAction item={row} onPreview={() => onSelect(row)} />,
          width: "112px",
        },
      ]}
    />
  );
}

function QueueScheduledTable({ rows, onSelect }: { rows: QueueItem[]; onSelect: (item: QueueItem) => void }) {
  return (
    <DataTable
      rows={rows}
      onRowClick={onSelect}
      columns={[
        { header: "Content", accessor: (row) => <QueueContentCell item={row} /> },
        { header: "Channel", accessor: (row) => <ChannelPill channel={row.channel} />, width: "122px" },
        { header: "Scheduled", accessor: "scheduledFor", width: "138px" },
        { header: "Score", accessor: (row) => <ScoreBadge score={row.confidence} />, width: "92px" },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "112px" },
        {
          header: "Actions",
          accessor: (row) => <QueuePreviewAction item={row} onPreview={() => onSelect(row)} />,
          width: "112px",
        },
      ]}
    />
  );
}

function QueuePublishedTable({ rows, onSelect }: { rows: QueueItem[]; onSelect: (item: QueueItem) => void }) {
  return (
    <DataTable
      rows={rows}
      onRowClick={onSelect}
      columns={[
        { header: "Content", accessor: (row) => <QueueContentCell item={row} /> },
        { header: "Channel", accessor: (row) => <ChannelPill channel={row.channel} />, width: "122px" },
        { header: "Published", accessor: "scheduledFor", width: "138px" },
        { header: "Score", accessor: (row) => <ScoreBadge score={row.confidence} />, width: "92px" },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "112px" },
        {
          header: "Actions",
          accessor: (row) => <QueuePreviewAction item={row} onPreview={() => onSelect(row)} />,
          width: "112px",
        },
      ]}
    />
  );
}

function QueueRepliesTable({ rows, onSelect }: { rows: QueueItem[]; onSelect: (item: QueueItem) => void }) {
  return (
    <DataTable
      rows={rows}
      onRowClick={onSelect}
      columns={[
        {
          header: "ICP",
          accessor: (row) => (
            <div className="queue-icp-cell">
              <div className="avatar">{(row.icpName ?? row.title).slice(0, 1)}</div>
              <div>
                <strong>{row.icpName ?? row.title.replace("Reply to ", "")}</strong>
                <span>{row.segment}</span>
              </div>
            </div>
          ),
          width: "210px",
        },
        { header: "Suggested Reply", accessor: (row) => <QueueReplyCell item={row} /> },
        { header: "Window", accessor: "scheduledFor", width: "128px" },
        { header: "Score", accessor: (row) => <ScoreBadge score={row.confidence} />, width: "92px" },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "104px" },
        {
          header: "Actions",
          accessor: (row) => <QueuePreviewAction item={row} onPreview={() => onSelect(row)} />,
          width: "112px",
        },
      ]}
    />
  );
}

function QueueContentCell({ item }: { item: QueueItem }) {
  return (
    <div className="queue-content-cell">
      <strong>{item.title}</strong>
      <span>{item.body}</span>
    </div>
  );
}

function QueueReplyCell({ item }: { item: QueueItem }) {
  return (
    <div className="queue-reply-cell">
      <span>{item.original}</span>
      <strong>{item.body}</strong>
    </div>
  );
}

function QueuePreviewAction({ item, onPreview }: { item: QueueItem; onPreview: () => void }) {
  return (
    <div className="queue-row-actions">
      <QueueActionButton icon={<Search size={14} />} onClick={onPreview}>Preview</QueueActionButton>
      <span className="sr-only">{item.id}</span>
    </div>
  );
}

function QueueActionButton({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      className="queue-action-button"
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function QueueCalendarView({
  items,
  onSelect,
  onToast,
  onBack,
}: {
  items: QueueItem[];
  onSelect: (item: QueueItem) => void;
  onToast: ToastHandler;
  onBack: () => void;
}) {
  const scheduledItems = items
    .map((item) => ({ item, placement: getQueueCalendarPlacement(item) }))
    .sort((a, b) => a.placement.order - b.placement.order || a.item.title.localeCompare(b.item.title));
  const unscheduled = scheduledItems.filter(({ placement }) => placement.dayId === "unscheduled");

  const selectCalendarItem = (item: QueueItem) => {
    onSelect(item);
    onToast("Preview selected", item.title, "info");
  };

  return (
    <section className="surface queue-calendar-card" aria-label="Content calendar">
      <div className="queue-calendar-header">
        <div>
          <p className="eyebrow">Calendar</p>
          <h2>Publishing calendar</h2>
          <span>Scheduled posts</span>
        </div>
        <button className="secondary-button slim" type="button" onClick={onBack}>
          Back to queue
        </button>
      </div>

      <div className="queue-calendar-grid">
        {queueCalendarDays.map((day) => {
          const dayItems = scheduledItems.filter(({ placement }) => placement.dayId === day.id);

          return (
            <article className="queue-calendar-day" key={day.id}>
              <div className="queue-calendar-day-head">
                <div>
                  <strong>{day.day}</strong>
                  <span>{day.date}</span>
                </div>
                <StatusBadge status={`${dayItems.length} items`} />
              </div>

              <div className="queue-calendar-items">
                {dayItems.length ? (
                  dayItems.map(({ item, placement }) => (
                    <button className="queue-calendar-item" type="button" key={item.id} onClick={() => selectCalendarItem(item)}>
                      <span className="queue-calendar-time">{placement.time}</span>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                      <div className="queue-calendar-tags">
                        <ChannelPill channel={item.channel} />
                        <StatusBadge status={item.status} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="queue-calendar-empty">
                    <span>Open slot</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {unscheduled.length ? (
        <div className="queue-unscheduled-strip">
          <div>
            <p className="eyebrow">Unscheduled</p>
            <strong>{unscheduled.length} need dates</strong>
          </div>
          <div className="queue-unscheduled-list">
            {unscheduled.map(({ item }) => (
              <button className="queue-unscheduled-item" type="button" key={item.id} onClick={() => selectCalendarItem(item)}>
                <span>{item.title}</span>
                <SourceBadge source={item.source} />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function QueuePreviewPanel({ item, onToast }: { item: QueueItem; onToast: ToastHandler }) {
  const isReply = item.type === "reply";

  return (
    <aside className="surface queue-preview-panel" aria-label="Queue preview">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>{isReply ? item.icpName ?? item.title : item.title}</h2>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="queue-preview-stack">
        <div className="queue-preview-top">
          <ChannelPill channel={item.channel} />
          <SourceBadge source={item.source} />
          <ScoreBadge score={item.confidence} />
        </div>

        {isReply ? (
          <section className="queue-preview-card">
            <p className="eyebrow">Original</p>
            <blockquote>{item.original}</blockquote>
          </section>
        ) : null}

        <section className="queue-preview-card">
          <p className="eyebrow">{isReply ? "Reply" : "Draft"}</p>
          <p className="queue-preview-body">{item.body}</p>
        </section>

        <div className="queue-preview-meta-grid">
          <span>Source</span>
          <strong>{item.sourceContext}</strong>
          <span>Fit</span>
          <strong>{item.icpFit}</strong>
          <span>Segment</span>
          <strong>{item.segment}</strong>
          <span>{item.type === "published" ? "Published" : "Window"}</span>
          <strong>{item.scheduledFor}</strong>
        </div>

        <div className="queue-preview-actions">
          <button className="secondary-button" type="button">
            <PenLine size={15} />
            Edit
          </button>
          {isReply ? (
            <button className="secondary-button" type="button" onClick={() => onToast("Settings saved", "Reply skipped", "info")}>Skip</button>
          ) : (
            <button className="secondary-button" type="button" onClick={() => onToast("Draft generated", `${item.title} scheduled`)}>
              <CircleDashed size={15} />
              Schedule
            </button>
          )}
          <button
            className="primary-button"
            type="button"
            onClick={() => onToast(isReply ? "Reply approved" : "Draft generated", isReply ? item.icpName ?? item.title : `${item.title} published`)}
          >
            <CheckCircle2 size={15} />
            {isReply ? "Approve" : "Publish"}
          </button>
        </div>
      </div>
    </aside>
  );
}

type FileOwnership = "Mine" | "Shared with me";
type FileKind = "Image" | "Video" | "Document" | "Data";
type FileKindFilter = "All" | "Images" | "Videos" | "Documents" | "Data";
type FileStatusFilter = "All statuses" | "Approved" | "Needs info" | "In review";

type FileAsset = {
  id: string;
  name: string;
  kind: FileKind;
  owner: FileOwnership;
  source: string;
  status: "Approved" | "Needs info" | "In review";
  usage: "Unused" | "Used recently" | "Used before";
  updated: string;
  size: string;
  extension: string;
  description: string;
  tags: string[];
  usedIn: string;
  platformFit: string;
  duration?: string;
};

const fileOwnershipTabs = ["Mine", "Shared with me"] as const;
const fileKindTabs: FileKindFilter[] = ["All", "Images", "Videos", "Documents", "Data"];
const fileStatusFilters: FileStatusFilter[] = ["All statuses", "Approved", "Needs info", "In review"];

const fileKindByFilter: Record<Exclude<FileKindFilter, "All">, FileKind> = {
  Images: "Image",
  Videos: "Video",
  Documents: "Document",
  Data: "Data",
};

const demoFileAssets: FileAsset[] = [
  {
    id: "asset-review-screenshot",
    name: "Customer review screenshot",
    kind: "Image",
    owner: "Mine",
    source: "LinkedIn",
    status: "Approved",
    usage: "Unused",
    updated: "Today 10:24 AM",
    size: "1.8 MB",
    extension: "PNG",
    description: "Proof screenshot for trust-led posts.",
    tags: ["Customer Proof", "LinkedIn", "Trust"],
    usedIn: "Proof posts",
    platformFit: "LinkedIn high",
  },
  {
    id: "asset-founder-photo",
    name: "Founder photo",
    kind: "Image",
    owner: "Mine",
    source: "Slack",
    status: "Approved",
    usage: "Used recently",
    updated: "Yesterday 4:12 PM",
    size: "3.2 MB",
    extension: "JPG",
    description: "Founder image for lessons and hiring posts.",
    tags: ["Founder Trust", "Hiring", "Profile"],
    usedIn: "Founder content",
    platformFit: "LinkedIn high",
  },
  {
    id: "asset-product-carousel",
    name: "Product education carousel",
    kind: "Image",
    owner: "Mine",
    source: "Telegram",
    status: "Needs info",
    usage: "Unused",
    updated: "Jun 10 6:40 PM",
    size: "8.4 MB",
    extension: "PDF",
    description: "Carousel on the agent workflow.",
    tags: ["Product Education", "Carousel", "Review"],
    usedIn: "Needs info",
    platformFit: "LinkedIn high",
  },
  {
    id: "asset-testimonial-video",
    name: "Customer testimonial video",
    kind: "Video",
    owner: "Shared with me",
    source: "Slack",
    status: "Approved",
    usage: "Unused",
    updated: "Jun 9 1:18 PM",
    size: "42 MB",
    extension: "MP4",
    duration: "01:18",
    description: "Short customer proof clip.",
    tags: ["Video", "Customer Proof", "Proof"],
    usedIn: "Proof posts",
    platformFit: "LinkedIn high",
  },
  {
    id: "asset-ugc-screenshot",
    name: "UGC screenshot",
    kind: "Image",
    owner: "Shared with me",
    source: "X",
    status: "Approved",
    usage: "Unused",
    updated: "Jun 8 11:05 AM",
    size: "960 KB",
    extension: "PNG",
    description: "Audience language from X.",
    tags: ["UGC", "Market Signal", "X"],
    usedIn: "X thread",
    platformFit: "X high",
  },
  {
    id: "asset-comparison-graphic",
    name: "Comparison graphic",
    kind: "Image",
    owner: "Mine",
    source: "LinkedIn",
    status: "Approved",
    usage: "Used before",
    updated: "Jun 7 3:32 PM",
    size: "2.6 MB",
    extension: "SVG",
    description: "Single control-center graphic.",
    tags: ["Category POV", "Graphic", "LinkedIn"],
    usedIn: "Performance post",
    platformFit: "LinkedIn medium, X medium",
  },
  {
    id: "asset-call-clips",
    name: "Customer call clips pack",
    kind: "Video",
    owner: "Mine",
    source: "Telegram",
    status: "In review",
    usage: "Unused",
    updated: "Jun 6 5:46 PM",
    size: "128 MB",
    extension: "MP4",
    duration: "08:42",
    description: "Customer clips on review bottlenecks.",
    tags: ["Voice Notes", "Pain", "Review"],
    usedIn: "Customer-call post",
    platformFit: "Proof snippets",
  },
  {
    id: "asset-launch-brief",
    name: "Launch repurposing brief",
    kind: "Document",
    owner: "Mine",
    source: "Telegram",
    status: "Approved",
    usage: "Used recently",
    updated: "Jun 6 9:14 AM",
    size: "420 KB",
    extension: "DOC",
    description: "Brief for launch posts and replies.",
    tags: ["Launch", "Brief", "Repurpose"],
    usedIn: "Launch teardown",
    platformFit: "All channels",
  },
  {
    id: "asset-icp-signal-export",
    name: "ICP signal export",
    kind: "Data",
    owner: "Shared with me",
    source: "LinkedIn",
    status: "Needs info",
    usage: "Unused",
    updated: "Jun 5 8:20 AM",
    size: "740 KB",
    extension: "CSV",
    description: "Warm people and reply priority.",
    tags: ["Relationships", "Signals", "Accounts"],
    usedIn: "Unassigned",
    platformFit: "Scoring",
  },
];

function FilesPage({ onToast }: { onToast: ToastHandler }) {
  const [ownership, setOwnership] = useState<FileOwnership>("Mine");
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<FileKindFilter>("All");
  const [statusFilter, setStatusFilter] = useState<FileStatusFilter>("All statuses");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<FileAsset>(demoFileAssets[0]);

  const filteredAssets = demoFileAssets.filter((asset) => {
    const matchesOwner = asset.owner === ownership;
    const matchesKind = kindFilter === "All" || asset.kind === fileKindByFilter[kindFilter];
    const matchesStatus = statusFilter === "All statuses" || asset.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [asset.name, asset.source, asset.description, asset.kind, asset.extension, ...asset.tags].some((value) =>
        value.toLowerCase().includes(query),
      );

    return matchesOwner && matchesKind && matchesStatus && matchesQuery;
  });

  const activeAsset = filteredAssets.find((asset) => asset.id === selectedAsset.id) ?? filteredAssets[0] ?? selectedAsset;
  const imageCount = demoFileAssets.filter((asset) => asset.kind === "Image").length;
  const videoCount = demoFileAssets.filter((asset) => asset.kind === "Video").length;
  const needsMetadata = demoFileAssets.filter((asset) => asset.status === "Needs info").length;

  return (
    <div className="page-stack files-page">
      <section className="files-toolbar">
        <nav className="files-scope-tabs" aria-label="File ownership">
          {fileOwnershipTabs.map((tab) => (
            <button
              key={tab}
              className={ownership === tab ? "active" : undefined}
              type="button"
              aria-pressed={ownership === tab}
              onClick={() => setOwnership(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
        <label className="files-search-box">
          <Search size={17} aria-hidden />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search files"
            aria-label="Search files"
          />
        </label>
        <button
          className={filtersOpen ? "icon-button active" : "icon-button"}
          type="button"
          title="Filters"
          aria-label="Filters"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <SlidersHorizontal size={17} />
        </button>
      </section>

      {filtersOpen ? (
        <section className="surface files-filter-panel">
          <div>
            <p className="eyebrow">Type</p>
            <div className="files-chip-row">
              {fileKindTabs.map((filter) => (
                <button
                  key={filter}
                  className={kindFilter === filter ? "active" : undefined}
                  type="button"
                  aria-pressed={kindFilter === filter}
                  onClick={() => setKindFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as FileStatusFilter)}>
              {fileStatusFilters.map((filter) => (
                <option key={filter}>{filter}</option>
              ))}
            </select>
          </label>
        </section>
      ) : null}

      <section className="surface files-upload-strip" aria-label="Upload assets">
        <div>
          <p className="eyebrow">Add assets</p>
          <h2>Upload assets</h2>
          <span>Images, clips, proof.</span>
        </div>
        <div className="files-upload-actions">
          <input
            id="asset-local-upload"
            className="visually-hidden"
            type="file"
            multiple
            onChange={(event) => {
              const count = event.currentTarget.files?.length ?? 0;
              if (count) onToast("Upload ready", `${count} local file${count === 1 ? "" : "s"} selected`, "info");
            }}
          />
          <label className="secondary-button" htmlFor="asset-local-upload">
            <Upload size={15} />
            Computer
          </label>
          <button className="secondary-button" type="button" onClick={() => onToast("Google Drive opened", "Choose assets to import", "info")}>
            <FolderOpen size={15} />
            Google Drive
          </button>
          <button className="secondary-button" type="button" onClick={() => onToast("Dropbox opened", "Choose assets to import", "info")}>
            <FolderOpen size={15} />
            Dropbox
          </button>
        </div>
      </section>

      <section className="files-summary-grid" aria-label="Files summary">
        <article>
          <span>Total</span>
          <strong>{demoFileAssets.length}</strong>
        </article>
        <article>
          <span>Images</span>
          <strong>{imageCount}</strong>
        </article>
        <article>
          <span>Videos</span>
          <strong>{videoCount}</strong>
        </article>
        <article>
          <span>Needs info</span>
          <strong>{needsMetadata}</strong>
        </article>
      </section>

      <section className="files-layout">
        <div className="surface files-library-card">
          <div className="files-library-head">
            <div>
              <p className="eyebrow">Assets</p>
              <h2>{ownership}</h2>
              <span>{filteredAssets.length} files</span>
            </div>
            <button className="secondary-button slim" type="button" onClick={() => onToast("Upload ready", "Asset upload opened", "info")}>
              <Upload size={15} />
              Upload asset
            </button>
          </div>

          {filteredAssets.length ? (
            <div className="files-asset-grid">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  className={activeAsset.id === asset.id ? "file-asset-card active" : "file-asset-card"}
                  type="button"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className={`file-asset-preview ${asset.kind.toLowerCase()}`}>
                    <FileKindIcon kind={asset.kind} />
                    <span>{asset.extension}</span>
                    {asset.duration ? <small>{asset.duration}</small> : null}
                  </div>
                  <div className="file-asset-body">
                    <div>
                      <strong>{asset.name}</strong>
                    </div>
                    <div className="file-asset-meta">
                      <StatusBadge status={asset.status} />
                      <SourceBadge source={asset.source} />
                    </div>
                    <div className="file-tag-row">
                      {asset.tags.slice(0, 2).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="files-empty-state">
              <FileText size={30} />
              <strong>No files found</strong>
              <span>Try a different search or filter.</span>
            </div>
          )}
        </div>

        <FileAssetDetail asset={activeAsset} onToast={onToast} />
      </section>
    </div>
  );
}

function FileKindIcon({ kind }: { kind: FileKind }) {
  if (kind === "Image") return <ImageIcon size={22} />;
  if (kind === "Video") return <Video size={22} />;
  if (kind === "Data") return <DatabaseZap size={22} />;
  return <FileText size={22} />;
}

function FileAssetDetail({ asset, onToast }: { asset: FileAsset; onToast: ToastHandler }) {
  return (
    <aside className="surface files-detail-panel" aria-label="Selected file">
      <div className="files-detail-hero">
        <div className={`file-asset-preview ${asset.kind.toLowerCase()}`}>
          <FileKindIcon kind={asset.kind} />
          <span>{asset.extension}</span>
          {asset.duration ? <small>{asset.duration}</small> : null}
        </div>
      </div>

      <div className="files-detail-head">
        <p className="eyebrow">{asset.kind}</p>
        <h2>{asset.name}</h2>
        <span>{asset.description}</span>
      </div>

      <div className="files-detail-tags">
        <StatusBadge status={asset.status} />
        <StatusBadge status={asset.usage} />
        <SourceBadge source={asset.source} />
      </div>

      <div className="files-detail-grid">
        <span>Owner</span>
        <strong>{asset.owner}</strong>
        <span>Updated</span>
        <strong>{asset.updated}</strong>
        <span>Size</span>
        <strong>{asset.size}</strong>
          <span>Used</span>
        <strong>{asset.usedIn}</strong>
          <span>Channels</span>
        <strong>{asset.platformFit}</strong>
      </div>

      <div className="file-tag-row detail">
        {asset.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="files-detail-actions">
        <button className="secondary-button" type="button" onClick={() => onToast("Download started", asset.name, "info")}>
          <Download size={15} />
          Download
        </button>
        <button className="primary-button" type="button" onClick={() => onToast("Draft generated", `${asset.name} attached`)}>
          <Plus size={15} />
            Attach
        </button>
      </div>
    </aside>
  );
}

function SourcesPage({ onToast }: { onSelectSource: (source: DemoSource) => void; onToast: ToastHandler }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [context, setContext] = useState({
    name: "Jay Patil",
    designation: "Founder",
    companyName: "Helixar",
    website: "https://helixar.ai",
    companySummary:
      "Helixar helps founder-led teams turn customer notes, Slack and Telegram notes, and social engagement into LinkedIn and X posts, replies, and relationship memory.",
    productFocus: "LinkedIn posting, X posting, engagement tracking, and relationship building from reactions, comments, and replies.",
    customNotes: "Prioritize useful founder-led content. Ask before high-risk replies, strong claims, or anything that needs founder approval.",
    voiceQuestionOne: "People should understand that Helixar keeps context attached to every post and reply, instead of generating generic social copy.",
    voiceQuestionTwo: "Avoid guaranteed growth claims, fake urgency, and generic AI productivity language.",
    voiceQuestionThree: "Ask for review before publishing quote posts, replying to important prospects, or making product claims.",
  });

  const updateContext = (key: keyof typeof context, value: string) => {
    setContext((current) => ({ ...current, [key]: value }));
  };

  const refreshContext = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setIsRefreshing(false);
      onToast("Context refreshed", "Website and onboarding context updated", "info");
    }, 850);
  };

  return (
    <div className="page-stack sources-page">
      <section className="sources-page-header">
        <div>
          <p className="eyebrow">Context</p>
          <h2>Context</h2>
          <span>Edit what Helixar uses.</span>
        </div>
        <div className="source-context-actions">
          <button className="secondary-button" type="button" onClick={refreshContext} disabled={isRefreshing}>
            {isRefreshing ? <ButtonSpinner /> : <RefreshCw size={15} />}
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
          <button className="primary-button" type="button" onClick={() => onToast("Context saved", "Posting context updated")}>
            <CheckCircle2 size={15} />
            Save
          </button>
        </div>
      </section>

      <section className="surface source-context-card">
        <div className="source-context-grid">
          <SettingsField label="Name" defaultValue={context.name} onChange={(value) => updateContext("name", value)} />
          <SettingsField label="Designation" defaultValue={context.designation} onChange={(value) => updateContext("designation", value)} />
          <SettingsField label="Company name" defaultValue={context.companyName} onChange={(value) => updateContext("companyName", value)} />
          <SettingsField label="Website" defaultValue={context.website} onChange={(value) => updateContext("website", value)} />
          <SettingsField
            label="What the company does"
            multiline
            defaultValue={context.companySummary}
            onChange={(value) => updateContext("companySummary", value)}
          />
          <SettingsField
            label="Product or offer focus"
            multiline
            defaultValue={context.productFocus}
            onChange={(value) => updateContext("productFocus", value)}
          />
          <SettingsField
            label="Custom notes"
            multiline
            defaultValue={context.customNotes}
            onChange={(value) => updateContext("customNotes", value)}
          />
        </div>
      </section>

      <section className="surface source-context-card">
        <div className="surface-header">
          <div>
            <p className="eyebrow">Voice questions</p>
            <h2>Answers from onboarding</h2>
          </div>
        </div>
        <div className="source-question-grid">
          <SettingsField
            label="What should people understand after reading your posts?"
            multiline
            defaultValue={context.voiceQuestionOne}
            onChange={(value) => updateContext("voiceQuestionOne", value)}
          />
          <SettingsField
            label="Which topics, claims, or phrases should Helixar avoid?"
            multiline
            defaultValue={context.voiceQuestionTwo}
            onChange={(value) => updateContext("voiceQuestionTwo", value)}
          />
          <SettingsField
            label="When should the agent ask before posting or replying?"
            multiline
            defaultValue={context.voiceQuestionThree}
            onChange={(value) => updateContext("voiceQuestionThree", value)}
          />
        </div>
      </section>
    </div>
  );
}

function ImportSourceModal({ open, onClose, onToast }: { open: boolean; onClose: () => void; onToast: ToastHandler }) {
  const [activeTab, setActiveTab] = useState("Event");
  const [isImporting, setIsImporting] = useState(false);

  const importIcps = () => {
    setIsImporting(true);
    window.setTimeout(() => {
      setIsImporting(false);
      onClose();
      onToast("Source connected", "ICPs imported");
    }, 850);
  };

  return (
    <Modal open={open} title="Import source" subtitle="Manual" onClose={onClose}>
      <div className="import-modal-layout">
        <nav className="import-tabs" aria-label="Import types">
          {demoSourceDiscovery.importTabs.map((tab) => (
            <button key={tab} className={activeTab === tab ? "active" : undefined} type="button" onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>

        <div className="import-instructions">
          <div className="instruction-visual">
            <div />
            <span />
            <span />
            <i />
          </div>
          <div className="instruction-card-grid">
            {demoSourceDiscovery.instructionCards.map((card) => (
              <article key={card.id}>
                <strong>{card.title}</strong>
                <p>{card.detail}</p>
              </article>
            ))}
          </div>
          <div className="import-actions">
            <button className="secondary-button" type="button" onClick={() => onToast("Source connected", "Extension ready")}>Install extension</button>
            <button className="secondary-button" type="button" onClick={() => onToast("Source connected", "LinkedIn source ready")}>Go to LinkedIn</button>
            <button className="secondary-button" type="button" onClick={importIcps} disabled={isImporting}>Import</button>
            <button className="secondary-button" type="button" onClick={importIcps} disabled={isImporting}>Upload CSV</button>
            <button className="primary-button" type="button" onClick={importIcps} disabled={isImporting}>
              {isImporting ? <ButtonSpinner /> : <UserPlus size={15} />}
              {isImporting ? "Importing" : "Add ICP"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function WarmLookalikeModal({ open, onClose, onToast }: { open: boolean; onClose: () => void; onToast: ToastHandler }) {
  const [isCreating, setIsCreating] = useState(false);

  const createSource = () => {
    setIsCreating(true);
    window.setTimeout(() => {
      setIsCreating(false);
      onClose();
      onToast("Source connected", "Lookalike source live");
    }, 900);
  };

  return (
    <Modal open={open} title="Warm Lookalike" subtitle="Automatic" onClose={onClose}>
      <div className="lookalike-modal-body">
        <ProgressStepper steps={["Setup", "Scope", "Preview"]} current={2} />
        <label className="lookalike-input">
          <span>Paste LinkedIn or customer URL</span>
          <input placeholder="https://linkedin.com/in/example" />
        </label>
        <div className="lookalike-preview">
          {demoSourceDiscovery.lookalikes.map((icp) => (
            <div key={icp.id}>
              <div className="avatar">{icp.name.slice(0, 1)}</div>
              <div>
                <strong>{icp.name}</strong>
                <span>{icp.title} · {icp.company}</span>
              </div>
              <ScoreBadge score={icp.score} />
            </div>
          ))}
        </div>
        <div className="drawer-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="button" onClick={createSource} disabled={isCreating}>
            {isCreating ? <ButtonSpinner /> : <Plus size={15} />}
            {isCreating ? "Creating" : "Create source"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

type GojiInsightAgent = "Lookalike source discovery" | "Outreach campaign name";

type GojiLaunch = {
  id: string;
  signal: string;
  agentLine: string;
  leads: number;
  tone?: "lookalike" | "outreach";
};

type GojiInsightRow = {
  agent: GojiInsightAgent;
  status: "Active";
  launches: Record<string, GojiLaunch[]>;
};

const gojiInsightDays = [
  { id: "jun-11", label: "JUN 11", weekday: "Thu" },
  { id: "jun-10", label: "JUN 10", weekday: "Wed" },
  { id: "jun-09", label: "JUN 9", weekday: "Tue" },
  { id: "jun-08", label: "JUN 8", weekday: "Mon" },
  { id: "jun-07", label: "JUN 7", weekday: "Sun" },
  { id: "jun-06", label: "JUN 6", weekday: "Sat" },
  { id: "jun-05", label: "JUN 5", weekday: "Fri" },
  { id: "jun-04", label: "JUN 4", weekday: "Thu" },
] as const;

const gojiInsightRows: GojiInsightRow[] = [
  {
    agent: "Lookalike source discovery",
    status: "Active",
    launches: {
      "jun-11": [
        { id: "ll-11-1", signal: "Lookalike source disc...", agentLine: "Lookalike match: S...", leads: 10, tone: "lookalike" },
      ],
      "jun-10": [
        { id: "ll-10-1", signal: "Lookalike source disc...", agentLine: "Lookalike match: Si...", leads: 7, tone: "lookalike" },
        { id: "ll-10-2", signal: "Lookalike source disc...", agentLine: "Lookalike match: Si...", leads: 8, tone: "lookalike" },
        { id: "ll-10-3", signal: "Lookalike source disc...", agentLine: "Lookalike match: S...", leads: 10, tone: "lookalike" },
        { id: "ll-10-4", signal: "Lookalike source disc...", agentLine: "Lookalike match: Si...", leads: 5, tone: "lookalike" },
      ],
      "jun-09": [],
      "jun-08": [
        { id: "ll-08-1", signal: "Lookalike source disc...", agentLine: "Lookalike match: Si...", leads: 7, tone: "lookalike" },
        { id: "ll-08-2", signal: "Lookalike source disc...", agentLine: "Lookalike match: Si...", leads: 5, tone: "lookalike" },
        { id: "ll-08-3", signal: "Lookalike source disc...", agentLine: "Lookalike match: Si...", leads: 6, tone: "lookalike" },
      ],
      "jun-07": [],
      "jun-06": [],
      "jun-05": [],
      "jun-04": [],
    },
  },
  {
    agent: "Outreach campaign name",
    status: "Active",
    launches: {
      "jun-11": [
        { id: "oc-11-1", signal: "Autopilot", agentLine: "Recently changed j...", leads: 9, tone: "outreach" },
      ],
      "jun-10": [
        { id: "oc-10-1", signal: "Autopilot", agentLine: "Hiring right now", leads: 18, tone: "outreach" },
        { id: "oc-10-2", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-10-3", signal: "\"social content auto...", agentLine: "Engagement & Inter...", leads: 1, tone: "outreach" },
      ],
      "jun-09": [
        { id: "oc-09-1", signal: "Autopilot", agentLine: "Hiring right now", leads: 26, tone: "outreach" },
        { id: "oc-09-2", signal: "Outreach campaign n...", agentLine: "Lookalike match: Si...", leads: 3, tone: "outreach" },
        { id: "oc-09-3", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-09-4", signal: "\"content ops\"", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
      ],
      "jun-08": [
        { id: "oc-08-1", signal: "\"social content auto...", agentLine: "Engagement & Inter...", leads: 1, tone: "outreach" },
        { id: "oc-08-2", signal: "Autopilot", agentLine: "Hiring right now", leads: 19, tone: "outreach" },
        { id: "oc-08-3", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 1, tone: "outreach" },
        { id: "oc-08-4", signal: "\"content ops\"", agentLine: "Engagement & Inter...", leads: 1, tone: "outreach" },
      ],
      "jun-07": [
        { id: "oc-07-1", signal: "\"social content auto...", agentLine: "Engagement & Inter...", leads: 1, tone: "outreach" },
        { id: "oc-07-2", signal: "Autopilot", agentLine: "Hiring right now", leads: 18, tone: "outreach" },
        { id: "oc-07-3", signal: "Outreach campaign n...", agentLine: "Lookalike match: Si...", leads: 8, tone: "outreach" },
        { id: "oc-07-4", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-07-5", signal: "\"content ops\"", agentLine: "Engagement & Inter...", leads: 0, tone: "outreach" },
      ],
      "jun-06": [
        { id: "oc-06-1", signal: "\"social content auto...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-06-2", signal: "Autopilot", agentLine: "Hiring right now", leads: 14, tone: "outreach" },
        { id: "oc-06-3", signal: "Outreach campaign n...", agentLine: "Lookalike match: Si...", leads: 5, tone: "outreach" },
        { id: "oc-06-4", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-06-5", signal: "\"social content auto...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-06-6", signal: "\"content ops\"", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
      ],
      "jun-05": [
        { id: "oc-05-1", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-05-2", signal: "\"social content auto...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-05-3", signal: "Autopilot", agentLine: "Hiring right now", leads: 18, tone: "outreach" },
        { id: "oc-05-4", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
        { id: "oc-05-5", signal: "\"content ops\"", agentLine: "Engagement & Inter...", leads: 1, tone: "outreach" },
        { id: "oc-05-6", signal: "Autopilot", agentLine: "Hiring right now", leads: 34, tone: "outreach" },
      ],
      "jun-04": [
        { id: "oc-04-1", signal: "\"founder led marketin...", agentLine: "Engagement & Inte...", leads: 2, tone: "outreach" },
        { id: "oc-04-2", signal: "Autopilot", agentLine: "Recently changed j...", leads: 11, tone: "outreach" },
        { id: "oc-04-3", signal: "\"content ops\"", agentLine: "Engagement & Inte...", leads: 0, tone: "outreach" },
      ],
    },
  },
];

const gojiSignalRows: Record<GojiInsightAgent, Array<{ id: string; signal: string; type: string; leads: number }>> = {
  "Lookalike source discovery": [
    {
      id: "signal-lookalike",
      signal: "Lookalike source discovery",
      type: "Lookalike match: Similar to your ideal lead",
      leads: 58,
    },
  ],
  "Outreach campaign name": [
    { id: "signal-autopilot", signal: "Autopilot", type: "Hiring right now", leads: 129 },
    { id: "signal-social", signal: "\"social content automation\"", type: "Engagement & Interest", leads: 4 },
    { id: "signal-founder", signal: "\"founder led marketing\"", type: "Engagement & Interest", leads: 3 },
    { id: "signal-content-ops", signal: "\"content ops\"", type: "Engagement & Interest", leads: 2 },
  ],
};

function InsightsPage() {
  const [selectedAgent, setSelectedAgent] = useState<GojiInsightAgent>("Lookalike source discovery");

  return (
    <div className="page-stack insights-page goji-insights-page">
      <section className="goji-insights-controls">
        <div />
        <div className="goji-date-fields">
          <label>
            <span>Start Date</span>
            <input type="date" defaultValue="2026-05-12" />
          </label>
          <label>
            <span>End Date</span>
            <input type="date" defaultValue="2026-06-11" />
          </label>
        </div>
      </section>

      <section className="goji-kpi-grid" aria-label="Lead generation insight metrics">
        <GojiMetricCard label="Total leads" value="672" detail="selected period" tone="info" icon={<FileText size={18} />} />
        <GojiMetricCard label="Avg leads/day" value="22" detail="daily average" tone="success" icon={<BarChart3 size={18} />} />
        <GojiMetricCard label="Active signals" value="1" detail="generating leads" tone="danger" icon={<Target size={18} />} />
      </section>

      <section className="surface goji-performance-card">
        <div className="goji-section-head">
          <h2>Daily Performance Overview</h2>
          <span>Leads generated by agent and day.</span>
        </div>
        <DailyPerformanceMatrix />
      </section>

      <section className="surface goji-signal-card">
        <div className="goji-signal-head">
          <div>
            <h2>Signal performance</h2>
            <span>Leads by signal</span>
          </div>
          <label>
            <span>Filter by AI Agent</span>
            <select value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value as GojiInsightAgent)}>
              {gojiInsightRows.map((row) => (
                <option key={row.agent}>{row.agent}</option>
              ))}
            </select>
          </label>
        </div>
        <SignalsPerformanceTable rows={gojiSignalRows[selectedAgent]} />
      </section>
    </div>
  );
}

function GojiMetricCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone: "info" | "success" | "danger";
}) {
  return (
    <article className="goji-metric-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <i className={`goji-metric-icon ${tone}`}>{icon}</i>
    </article>
  );
}

function DailyPerformanceMatrix() {
  return (
    <div className="goji-matrix-scroll" aria-label="Daily performance matrix">
      <table className="goji-matrix-table">
        <thead>
          <tr>
            <th>AI Agent</th>
            {gojiInsightDays.map((day) => (
              <th key={day.id}>
                <span>{day.label}</span>
                <small>{day.weekday}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gojiInsightRows.map((row) => (
            <tr key={row.agent}>
              <td>
                <div className="goji-agent-cell">
                  <span className="goji-agent-icon">
                    <Target size={15} />
                  </span>
                  <div>
                    <strong>{row.agent}</strong>
                    <small>{row.status}</small>
                  </div>
                </div>
              </td>
              {gojiInsightDays.map((day) => {
                const launches = row.launches[day.id] ?? [];
                const visible = launches.slice(0, 5);
                const hiddenCount = launches.length - visible.length;

                return (
                  <td key={day.id}>
                    {visible.length ? (
                      <div className="goji-launch-stack">
                        {visible.map((launch) => (
                          <GojiLaunchCard key={launch.id} launch={launch} />
                        ))}
                        {hiddenCount > 0 ? <button type="button" className="goji-more-launches">+ {hiddenCount} more launches</button> : null}
                      </div>
                    ) : (
                      <span className="goji-empty-dash">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GojiLaunchCard({ launch }: { launch: GojiLaunch }) {
  return (
    <button className={`goji-launch-card ${launch.tone ?? "outreach"}`} type="button">
      <span>{launch.signal}</span>
      <strong>{launch.agentLine}</strong>
      <b>{launch.leads}</b>
    </button>
  );
}

function SignalsPerformanceTable({ rows }: { rows: Array<{ id: string; signal: string; type: string; leads: number }> }) {
  return (
    <div className="goji-signal-table-shell">
      <table className="goji-signal-table">
        <thead>
          <tr>
            <th>Signal</th>
            <th>Type</th>
            <th>Leads</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.signal}</strong>
              </td>
              <td>
                <span className="goji-signal-type">{row.type}</span>
              </td>
              <td>
                <strong className="goji-leads-cell">{row.leads}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SettingsPage({ onToast }: { onToast: ToastHandler }) {
  const settingsTabs = ["Account", "Channels", "Billing", "Preferences"] as const;
  type SettingsTab = (typeof settingsTabs)[number];
  const [activeTab, setActiveTab] = useState<SettingsTab>("Account");

  const saveSettings = () => {
    onToast("Settings saved", "Preferences updated");
  };

  return (
    <div className="page-stack settings-page">
      <section className="settings-shell">
        <div className="surface-header">
          <div>
            <p className="eyebrow">Account</p>
            <h2>Settings</h2>
          </div>
          <button className="primary-button" type="button" onClick={saveSettings}>
            <CheckCircle2 size={15} />
            Save
          </button>
        </div>

        <nav className="settings-tabs" aria-label="Settings sections">
          {settingsTabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : undefined}
              type="button"
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="settings-tab-panel">
          {activeTab === "Account" ? <AccountSettings onToast={onToast} /> : null}
          {activeTab === "Channels" ? <ChannelsSettings /> : null}
          {activeTab === "Billing" ? <BillingSettings /> : null}
          {activeTab === "Preferences" ? <PreferencesSettings /> : null}
        </div>
      </section>
    </div>
  );
}

function AccountSettings({ onToast }: { onToast: ToastHandler }) {
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">Account</p>
          <h3>Workspace account</h3>
        </div>
        <StatusBadge status="Owner" />
      </div>
      <div className="settings-form-grid">
        <SettingsField label="Workspace name" defaultValue="Helixar" />
        <SettingsField label="Owner name" defaultValue="Jay Patil" />
        <SettingsField label="Owner email" defaultValue="jay@helixar.ai" />
        <SettingsField label="Timezone" defaultValue="Asia/Kolkata" />
      </div>
      <div className="drawer-actions">
        <button className="secondary-button" type="button" onClick={() => onToast("Invite copied", "Share this with your teammate", "info")}>
          Copy invite link
        </button>
        <button className="primary-button" type="button" onClick={() => onToast("Settings saved", "Account updated")}>
          Save account
        </button>
      </div>
    </section>
  );
}

function SettingsField({
  label,
  defaultValue,
  multiline,
  onChange,
}: {
  label: string;
  defaultValue: string;
  multiline?: boolean;
  onChange?: (value: string) => void;
}) {
  const sharedProps = onChange
    ? { value: defaultValue, onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value) }
    : { defaultValue };

  return (
    <label className={multiline ? "settings-field multiline" : "settings-field"}>
      <span>{label}</span>
      {multiline ? <textarea {...sharedProps} /> : <input {...sharedProps} />}
    </label>
  );
}

function MembersSettings({ onToast }: { onToast: ToastHandler }) {
  const members = [
    { id: "member-vedant", name: "Vedant Swami", email: "vedant@helixar.ai", role: "Owner", status: "Active" },
    { id: "member-gtm", name: "Ari Patel", email: "ari@helixar.ai", role: "Admin", status: "Active" },
    { id: "member-content", name: "Noor Ellis", email: "noor@helixar.ai", role: "Editor", status: "Active" },
    { id: "member-revops", name: "Theo Grant", email: "theo@helixar.ai", role: "Viewer", status: "Pending" },
  ];

  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">Team</p>
          <h3>Members</h3>
        </div>
        <StatusBadge status={`${members.length} seats`} />
      </div>
      <div className="invite-row">
        <input aria-label="Invite member" placeholder="name@company.com" />
        <button className="primary-button" type="button" onClick={() => onToast("Settings saved", "Invite queued")}>
          <Plus size={15} />
          Invite
        </button>
      </div>
      <DataTable
        rows={members}
        columns={[
          {
            header: "Member",
            accessor: (row) => (
              <div className="settings-member-cell">
                <div className="avatar">{row.name.slice(0, 1)}</div>
                <div>
                  <strong>{row.name}</strong>
                  <span>{row.email}</span>
                </div>
              </div>
            ),
          },
          { header: "Role", accessor: (row) => <SettingsRoleBadge role={row.role} />, width: "112px" },
          { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "108px" },
          {
            header: "Actions",
            accessor: () => (
              <button className="secondary-button slim" type="button">
                Manage
              </button>
            ),
            width: "120px",
          },
        ]}
      />
    </section>
  );
}

function SettingsRoleBadge({ role }: { role: string }) {
  return <span className={`settings-role-badge ${role.toLowerCase()}`}>{role}</span>;
}

function ChannelsSettings() {
  const channels = [
    { id: "channel-linkedin", channel: "LinkedIn", status: "Connected", limits: "24 posts/mo" },
    { id: "channel-x", channel: "X", status: "Connected", limits: "60 posts/mo" },
    { id: "channel-slack", channel: "Slack", status: "Connected", limits: "Context source" },
    { id: "channel-telegram", channel: "Telegram", status: "Connected", limits: "Context source" },
  ];

  return (
    <SettingsTableCard
      eyebrow="Channels"
      title="Connected accounts"
      rows={channels}
      columns={[
        { header: "Channel", accessor: (row) => <ChannelPill channel={row.channel} /> },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "112px" },
        { header: "Limits", accessor: "limits", width: "150px" },
        {
          header: "Actions",
          accessor: () => (
            <button className="secondary-button slim" type="button">
              Settings
            </button>
          ),
          width: "120px",
        },
      ]}
    />
  );
}

function PreferencesSettings() {
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">Preferences</p>
          <h3>Review and posting defaults</h3>
        </div>
        <StatusBadge status="Review on" />
      </div>
      <div className="settings-form-grid">
        <SettingsField label="Default review mode" defaultValue="Ask before posting" />
        <SettingsField label="Default posting window" defaultValue="Weekdays, 10 AM - 6 PM" />
        <SettingsField label="LinkedIn reply limit" defaultValue="25 comments/day" />
        <SettingsField label="X reply limit" defaultValue="60 replies/day" />
        <SettingsField
          label="Notification preference"
          multiline
          defaultValue="Notify when a high-fit person reacts, comments, replies, or becomes a relationship card."
        />
        <SettingsField
          label="Approval preference"
          multiline
          defaultValue="Auto-save drafts, but ask before publishing posts, quote posts, and important replies."
        />
      </div>
    </section>
  );
}

function SettingsSources() {
  const sources = [
    { id: "source-slack-settings", source: "Slack", status: "Synced", lastSynced: "4m ago" },
    { id: "source-telegram-settings", source: "Telegram", status: "Synced", lastSynced: "11m ago" },
    { id: "source-linkedin-settings", source: "LinkedIn", status: "Queued", lastSynced: "5h ago" },
    { id: "source-x-settings", source: "X", status: "Synced", lastSynced: "9m ago" },
  ];

  return (
    <SettingsTableCard
      eyebrow="Ingestion"
      title="Sources"
      rows={sources}
      columns={[
        { header: "Source", accessor: (row) => <SourceBadge source={row.source} /> },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "112px" },
        { header: "Last Synced", accessor: "lastSynced", width: "132px" },
        {
          header: "Actions",
          accessor: () => (
            <button className="secondary-button slim" type="button">
              <RefreshCw size={14} />
              Reconnect
            </button>
          ),
          width: "142px",
        },
      ]}
    />
  );
}

function SecuritySettings() {
  const securityItems = [
    { id: "security-sso", name: "SSO", status: "Ready", detail: "SAML workspace login" },
    { id: "security-2fa", name: "2FA", status: "Active", detail: "Required for admins" },
    { id: "security-audit", name: "Audit logs", status: "Active", detail: "90 day retention" },
    { id: "security-claims", name: "Claims review", status: "Review", detail: "Founder approval required" },
  ];

  return (
    <div className="settings-grid-two">
      {securityItems.map((item) => (
        <article className="settings-mini-card" key={item.id}>
          <div>
            <h3>{item.name}</h3>
            <span>{item.detail}</span>
          </div>
          <StatusBadge status={item.status} />
        </article>
      ))}
    </div>
  );
}

function ContentTemplatesSettings() {
  const templates = [
    { id: "template-founder-post", name: "Founder post", channel: "LinkedIn", status: "Active" },
    { id: "template-x-thread", name: "X thread", channel: "X", status: "Active" },
    { id: "template-linkedin-reply", name: "LinkedIn reply", channel: "LinkedIn", status: "Review" },
    { id: "template-x-reply", name: "X reply", channel: "X", status: "Active" },
  ];

  return (
    <SettingsTableCard
      eyebrow="Templates"
      title="Content Templates"
      rows={templates}
      columns={[
        { header: "Template", accessor: (row) => <strong>{row.name}</strong> },
        { header: "Channel", accessor: (row) => <ChannelPill channel={row.channel} />, width: "130px" },
        { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "112px" },
        {
          header: "Actions",
          accessor: () => (
            <button className="secondary-button slim" type="button">
              Edit
            </button>
          ),
          width: "100px",
        },
      ]}
    />
  );
}

function BillingSettings() {
  const billingStats = [
    { label: "Posts generated", value: "146" },
    { label: "Relationships tracked", value: "384" },
    { label: "Seats", value: "3" },
    { label: "Credits left", value: "8,420" },
  ];

  return (
    <section className="settings-card billing-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">Billing</p>
          <h3>Starter plan</h3>
        </div>
        <button className="primary-button" type="button">
          <Rocket size={15} />
          Upgrade
        </button>
      </div>
      <div className="billing-stat-grid">
        {billingStats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
      <div className="billing-upgrade-note">
        <strong>Need more posting volume?</strong>
        <span>Upgrade for more LinkedIn and X drafts, relationship tracking, and team seats.</span>
      </div>
    </section>
  );
}

function DeveloperAccessSettings() {
  const webhooks = [
    { id: "webhook-draft-ready", name: "draft.ready", status: "Active", target: "https://api.helixar.ai/hooks/drafts" },
    { id: "webhook-icp-warm", name: "icp.warm", status: "Active", target: "https://api.helixar.ai/hooks/icps" },
    { id: "webhook-source-sync", name: "source.synced", status: "Review", target: "https://api.helixar.ai/hooks/sources" },
  ];

  return (
    <div className="settings-stack">
      <section className="settings-card">
        <div className="settings-card-header">
          <div>
            <p className="eyebrow">Developer</p>
            <h3>Access key</h3>
          </div>
          <StatusBadge status="Masked" />
        </div>
        <div className="api-key-row">
          <code>hx_live_••••••••••••••••••••_9f3a</code>
          <button className="secondary-button slim" type="button">
            Reveal
          </button>
        </div>
      </section>
      <SettingsTableCard
        eyebrow="Events"
        title="Webhooks"
        rows={webhooks}
        columns={[
          { header: "Event", accessor: (row) => <strong>{row.name}</strong> },
          { header: "Target", accessor: "target" },
          { header: "Status", accessor: (row) => <StatusBadge status={row.status} />, width: "112px" },
        ]}
      />
    </div>
  );
}

function DeveloperConnectionSettings({ onToast }: { onToast: ToastHandler }) {
  return (
    <section className="settings-card developer-connection-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">Developer</p>
          <h3>Developer connection</h3>
        </div>
        <StatusBadge status="Connected" />
      </div>
      <div className="developer-connection-grid">
        <div>
          <span>Server</span>
          <strong>connect.helixar.ai</strong>
        </div>
        <div>
          <span>Tools</span>
          <strong>Sources, Drafts, ICPs</strong>
        </div>
        <div>
          <span>Scopes</span>
          <strong>read:signals write:drafts</strong>
        </div>
      </div>
      <div className="drawer-actions">
        <button className="secondary-button" type="button" onClick={() => onToast("Settings saved", "Token rotated")}>Rotate token</button>
        <button className="primary-button" type="button" onClick={() => onToast("Connection ready", "Developer connection refreshed")}>Reconnect</button>
      </div>
    </section>
  );
}

function SafetyListSettings() {
  const groups = [
    { title: "Companies", items: ["Legacy Systems", "Acme Analytics", "Northstar Labs"] },
    { title: "Topics", items: ["Guaranteed revenue", "Medical advice", "Political claims"] },
    { title: "Words", items: ["revolutionary", "overnight", "risk-free"] },
    { title: "People", items: ["Former contractors", "Press contacts"] },
    { title: "ICP exclusions", items: ["Students", "Agencies under 5 seats", "Non-B2B accounts"] },
  ];

  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">Safety</p>
          <h3>Safety list</h3>
        </div>
        <button className="secondary-button slim" type="button">
          <Plus size={14} />
          Add
        </button>
      </div>
      <div className="blocklist-grid">
        {groups.map((group) => (
          <article key={group.title}>
            <h4>{group.title}</h4>
            <div>
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SettingsTableCard<T extends { id: string }>({
  eyebrow,
  title,
  rows,
  columns,
}: {
  eyebrow: string;
  title: string;
  rows: T[];
  columns: Array<{
    header: string;
    accessor: keyof T | ((row: T, index: number) => ReactNode);
    width?: string;
    align?: "left" | "right" | "center";
  }>;
}) {
  return (
    <section className="settings-card">
      <div className="settings-card-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <StatusBadge status={`${rows.length} items`} />
      </div>
      <DataTable rows={rows} columns={columns} />
    </section>
  );
}

function SourcesTable({
  rows,
  onSelectSource,
  compact,
}: {
  rows: DemoSource[];
  onSelectSource: (source: DemoSource) => void;
  compact?: boolean;
}) {
  return (
    <DataTable
      rows={rows}
      onRowClick={onSelectSource}
      columns={[
        {
          header: "Source",
          accessor: (row) => (
            <div className="stacked-cell">
              <SourceBadge source={row.name} />
              <span>{row.type}</span>
            </div>
          ),
        },
        { header: "Rows", accessor: (row) => row.itemsSynced.toLocaleString(), align: "right", width: compact ? "76px" : "92px" },
        { header: "Fresh", accessor: "lastSynced", align: "right", width: "96px" },
        { header: "State", accessor: (row) => <StatusBadge status={row.status} />, width: "98px" },
      ]}
    />
  );
}

function AudienceTable() {
  return (
    <DataTable
      rows={demoIcpAudience}
      columns={[
        {
          header: "Name",
          accessor: (row) => (
            <div className="stacked-cell">
              <strong>{row.name}</strong>
              <span>{row.title} · {row.company}</span>
            </div>
          ),
        },
        { header: "Segment", accessor: "segment" },
        { header: "Source", accessor: (row) => <SourceBadge source={row.source} /> },
        { header: "Score", accessor: (row) => <ScoreBadge score={row.score} />, width: "86px" },
        { header: "State", accessor: (row) => <StatusBadge status={row.status} />, width: "96px" },
      ]}
    />
  );
}

function InsightSurface({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ id: string; name: string; volume: number; conversion: number; trend: number; status: string }>;
}) {
  return (
    <section className="surface insight-surface">
      <div className="surface-header">
        <div>
          <p className="eyebrow">Performance</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="insight-list">
        {rows.map((row) => (
          <div key={row.id}>
            <strong>{row.name}</strong>
            <span>{row.volume.toLocaleString()}</span>
            <ScoreBadge score={row.conversion} />
            <StatusBadge status={row.status} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ScoreLine({ label, value, width, muted }: { label: string; value: number; width: number; muted?: boolean }) {
  return (
    <div className="score-row">
      <span>{label}</span>
      <div className={muted ? "meter muted" : "meter"}><i style={{ width: `${width}%` }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

function SourceDrawer({ source, onClose }: { source: DemoSource | null; onClose: () => void }) {
  return (
    <Drawer open={Boolean(source)} title={source?.name ?? "Source"} subtitle={source?.type ?? "Source"} onClose={onClose}>
      <div className="drawer-body">
        <div className="drawer-stat-grid">
          <MetricCard label="Rows" value={source?.itemsSynced.toLocaleString() ?? "0"} delta="synced" icon={<DatabaseZap size={18} />} />
          <MetricCard label="Health" value={`${source?.health ?? 0}%`} delta="ok" icon={<CircleDashed size={18} />} tone="success" />
        </div>
        <div className="detail-list">
          <div><span>Status</span><StatusBadge status={source?.status ?? "Synced"} /></div>
          <div><span>Fresh</span><strong>{source?.lastSynced ?? "-"}</strong></div>
          <div><span>Type</span><strong>{source?.type ?? "Source"}</strong></div>
        </div>
        <FlowStepCard
          step="Next"
          title="Map signals"
          detail={source?.description ?? "Source signals ready."}
          status="Ready"
          icon={<BookOpenCheck size={16} />}
        />
      </div>
    </Drawer>
  );
}

function ReplyDrawer({ reply, onClose, onToast }: { reply: QueueItem | null; onClose: () => void; onToast: ToastHandler }) {
  return (
    <Drawer open={Boolean(reply)} title={reply?.title ?? "Reply"} subtitle={reply?.segment ?? "ICP inbox"} onClose={onClose}>
      <div className="drawer-body">
        <div className="reply-preview">
          <div className="avatar">{reply?.title.slice(0, 1) ?? "H"}</div>
          <div>
            <p className="eyebrow">{reply?.source ?? "Source"}</p>
            <h3>{reply?.channel ?? "Reply"}</h3>
            <p>Proof, question, CTA.</p>
          </div>
        </div>
        <textarea aria-label="Reply draft" defaultValue={reply?.body ?? ""} />
        <div className="drawer-actions">
          <button className="secondary-button" type="button">Save</button>
          <button
            className="primary-button"
            type="button"
            onClick={() => {
              onClose();
              onToast("Reply approved", reply?.title ?? "Reply");
            }}
          >
            <Send size={15} />
            Send
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function GenerateModal({ open, onClose, onToast }: { open: boolean; onClose: () => void; onToast: ToastHandler }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const createDraft = () => {
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      onClose();
      onToast("Draft generated", "3 assets created");
    }, 850);
  };

  return (
    <Modal open={open} title="Create pack" subtitle="Content" onClose={onClose}>
      <div className="modal-body">
        <ProgressStepper steps={["Source", "ICP", "Draft", "Review"]} current={1} />
        <div className="modal-form-grid">
          <label>
            Channel
            <select defaultValue="LinkedIn">
              <option>LinkedIn</option>
              <option>X</option>
            </select>
          </label>
          <label>
            ICP
            <select defaultValue="Founders">
              <option>Founders</option>
              <option>GTM</option>
              <option>Product</option>
            </select>
          </label>
        </div>
        <FlowStepCard step="Draft" title="3 assets" detail="LinkedIn post, X post, and reply." status="Ready" icon={<Sparkles size={16} />} />
        <div className="drawer-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="button" onClick={createDraft} disabled={isGenerating}>
            {isGenerating ? <ButtonSpinner /> : <Sparkles size={15} />}
            {isGenerating ? "Generating" : "Create"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
