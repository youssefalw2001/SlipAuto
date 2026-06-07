import type { ComponentType, CSSProperties, ReactNode } from "react";

type IconProps = { size?: number; className?: string; style?: CSSProperties; strokeWidth?: number };

/**
 * PremiumIcon — Koinara-style tinted, glassy icon container.
 * Replaces emoji avatars across the app with a consistent, premium
 * lucide-icon treatment. Color is passed as `tone` and drives the
 * border, fill wash and outer glow.
 */
export default function PremiumIcon({
  icon: Icon,
  tone,
  size = 48,
  iconSize,
  rounded = 16,
  glow = true,
  className = "",
  style,
}: {
  icon: ComponentType<IconProps>;
  tone: string;
  size?: number;
  iconSize?: number;
  rounded?: number;
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        border: `1px solid ${tone}66`,
        background: `${tone}18`,
        boxShadow: glow ? `0 0 24px ${tone}26, inset 0 1px 0 rgba(255,255,255,0.10)` : undefined,
        ...style,
      }}
    >
      {/* top-down sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.16), transparent 60%)" }}
      />
      <Icon size={iconSize ?? Math.round(size * 0.5)} style={{ color: tone, position: "relative", zIndex: 1 }} strokeWidth={2.2} />
    </div>
  );
}

/** Small inline tonal chip — for badges/labels that previously used emoji. */
export function ToneChip({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em]"
      style={{ background: `${tone}14`, border: `1px solid ${tone}38`, color: tone }}
    >
      {children}
    </span>
  );
}
