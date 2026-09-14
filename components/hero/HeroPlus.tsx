export function HeroPlus({ className = "" }: { className?: string }) {
  return <span className={`lh-plus ${className}`} aria-hidden="true" />;
}
