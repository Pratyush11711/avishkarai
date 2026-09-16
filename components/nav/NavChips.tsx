export const NAV_CHIPS = [
  {
    label: "Work",
    href: "#work",
    color: "#5CE1E6",
    icon: "folder" as const,
  },
  {
    label: "Studio",
    href: "#studio",
    color: "#3DDC97",
    icon: "stack" as const,
  },
  {
    label: "Capabilities",
    href: "#capabilities",
    color: "#C084FC",
    icon: "peak" as const,
  },
  {
    label: "Process",
    href: "#process",
    color: "#F5C542",
    icon: "file" as const,
  },
] as const;

export type NavChipIcon = (typeof NAV_CHIPS)[number]["icon"];

export function ChipGlyph({
  icon,
  color,
  size = 16,
}: {
  icon: NavChipIcon;
  color: string;
  size?: number;
}) {
  const shade = `color-mix(in srgb, ${color} 62%, #0b1220)`;
  return (
    <span className="lh-hud-glyph" style={{ width: size, height: size }}>
      {icon === "folder" ? (
        <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
          <path fill={color} d="M2.2 4.4c0-.8.6-1.4 1.4-1.4h3.1l.9 1.1h5.2c.8 0 1.4.6 1.4 1.4v6.7c0 .8-.6 1.4-1.4 1.4H3.6c-.8 0-1.4-.6-1.4-1.4V4.4Z" />
          <path fill={shade} d="M3.2 7.1h9.6v5.5c0 .4-.3.7-.7.7H3.9c-.4 0-.7-.3-.7-.7V7.1Z" />
        </svg>
      ) : null}
      {icon === "stack" ? (
        <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
          <rect x="2.2" y="4.2" width="11.6" height="8.2" rx="1.4" fill={color} />
          <rect x="3.4" y="2.8" width="9.2" height="2" rx="0.7" fill={shade} />
        </svg>
      ) : null}
      {icon === "peak" ? (
        <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
          <path fill={color} d="M8 2.4 14.4 13H1.6L8 2.4Z" />
          <path fill={shade} d="M8 6.2 12.4 13H3.6L8 6.2Z" />
        </svg>
      ) : null}
      {icon === "file" ? (
        <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
          <path fill={color} d="M4.1 1.8h5.2L13 5.6v8.6c0 .6-.5 1-1 1H4.1c-.6 0-1-.4-1-1V2.8c0-.6.4-1 1-1Z" />
          <path fill={shade} d="M9.2 1.8v3.4c0 .4.3.8.8.8H13" />
        </svg>
      ) : null}
    </span>
  );
}
