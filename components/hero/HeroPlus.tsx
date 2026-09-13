export function HeroPlus({ className = "" }: { className?: string }) {
  return <span className={`lh-plus ${className}`} aria-hidden="true" />;
}

export function HeroPlusRow({ count = 5 }: { count?: number }) {
  return (
    <div className="lh-plus-row" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <HeroPlus key={i} />
      ))}
    </div>
  );
}
