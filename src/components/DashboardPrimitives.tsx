import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Circle,
  DatabaseZap,
  FileText,
  Inbox,
  Linkedin,
  Mail,
  MessageSquareText,
  RadioTower,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type Tone = "neutral" | "success" | "warning" | "danger" | "accent" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "tone-neutral",
  success: "tone-success",
  warning: "tone-warning",
  danger: "tone-danger",
  accent: "tone-accent",
  info: "tone-info",
};

const sourceIcons: Record<string, ReactNode> = {
  LinkedIn: <Linkedin size={13} aria-hidden />,
  Email: <Mail size={13} aria-hidden />,
  Notes: <FileText size={13} aria-hidden />,
  Web: <Search size={13} aria-hidden />,
  Website: <Search size={13} aria-hidden />,
  CRM: <DatabaseZap size={13} aria-hidden />,
  Slack: <MessageSquareText size={13} aria-hidden />,
  Calls: <MessageSquareText size={13} aria-hidden />,
  "Google Meet": <MessageSquareText size={13} aria-hidden />,
  X: <RadioTower size={13} aria-hidden />,
  Reddit: <MessageSquareText size={13} aria-hidden />,
  Notion: <FileText size={13} aria-hidden />,
};

const channelIcons: Record<string, ReactNode> = {
  LinkedIn: <Linkedin size={13} aria-hidden />,
  Email: <Mail size={13} aria-hidden />,
  X: <RadioTower size={13} aria-hidden />,
  Blog: <FileText size={13} aria-hidden />,
  Reddit: <MessageSquareText size={13} aria-hidden />,
};

export function MetricCard({
  label,
  value,
  delta,
  icon,
  tone = "accent",
}: {
  label: string;
  value: string;
  delta: string;
  icon: ReactNode;
  tone?: Tone;
}) {
  return (
    <section className="metric-card">
      <div className={`metric-icon ${toneClass[tone]}`}>{icon}</div>
      <div>
        <p className="eyebrow">{label}</p>
        <div className="metric-row">
          <strong>{value}</strong>
          <span>{delta}</span>
        </div>
      </div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  let tone: Tone = "neutral";

  if (["ready", "live", "approved", "synced", "replied", "healthy", "published"].some((key) => normalized.includes(key))) {
    tone = "success";
  } else if (["review", "queued", "draft", "warm", "pending"].some((key) => normalized.includes(key))) {
    tone = "warning";
  } else if (["blocked", "risk", "late"].some((key) => normalized.includes(key))) {
    tone = "danger";
  } else if (["new", "hot", "active"].some((key) => normalized.includes(key))) {
    tone = "accent";
  }

  return <span className={`status-badge ${toneClass[tone]}`}>{status}</span>;
}

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="source-badge">
      {sourceIcons[source] ?? <Circle size={10} aria-hidden />}
      {source}
    </span>
  );
}

export function ChannelPill({ channel }: { channel: string }) {
  return (
    <span className="channel-pill">
      {channelIcons[channel] ?? <RadioTower size={13} aria-hidden />}
      {channel}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 82 ? "success" : score >= 68 ? "warning" : "neutral";

  return (
    <span className={`score-badge ${toneClass[tone]}`}>
      <span>{score}</span>
    </span>
  );
}

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T, index: number) => ReactNode);
  width?: string;
  align?: "left" | "right" | "center";
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} style={{ width: column.width, textAlign: column.align ?? "left" }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={onRowClick ? "clickable-row" : undefined}
              onClick={() => onRowClick?.(row)}
              onKeyDown={(event) => {
                if (!onRowClick || (event.key !== "Enter" && event.key !== " ")) return;
                event.preventDefault();
                onRowClick(row);
              }}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {columns.map((column) => {
                const value =
                  typeof column.accessor === "function" ? column.accessor(row, rowIndex) : (row[column.accessor] as ReactNode);

                return (
                  <td key={column.header} style={{ textAlign: column.align ?? "left" }}>
                    {value}
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

export function EmptyState({
  icon,
  title,
  detail,
  action,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  action: ReactNode;
}) {
  return (
    <section className="empty-state">
      <div className="empty-icon">{icon}</div>
      <strong>{title}</strong>
      <p>{detail}</p>
      {action}
    </section>
  );
}

export function Drawer({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="overlay drawer-overlay" role="presentation" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="surface-header">
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" title="Close" aria-label="Close drawer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export function Modal({
  open,
  title,
  subtitle,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="surface-header">
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" title="Close" aria-label="Close modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ProgressStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="progress-stepper" aria-label="Progress">
      {steps.map((step, index) => {
        const complete = index < current;
        const active = index === current;

        return (
          <li key={step} className={complete ? "complete" : active ? "active" : undefined}>
            <span>{complete ? <Check size={13} /> : index + 1}</span>
            <p>{step}</p>
            {index < steps.length - 1 ? <ChevronRight size={14} aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function FlowStepCard({
  step,
  title,
  detail,
  status,
  action,
  icon,
}: {
  step: string;
  title: string;
  detail: string;
  status: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <article className="flow-step-card">
      <div className="flow-step-top">
        <div className="flow-step-icon">{icon ?? <Sparkles size={16} />}</div>
        <span>{step}</span>
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
      <div className="flow-step-footer">
        <StatusBadge status={status} />
        {action}
      </div>
    </article>
  );
}

export function OpenButton({ label = "Open", onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button className="open-button" type="button" onClick={onClick}>
      {label}
      <ArrowUpRight size={13} aria-hidden />
    </button>
  );
}
