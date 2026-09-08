import { clsx } from "clsx";

interface PlaceholderFieldProps {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

export function PlaceholderField({
  children,
  className,
  inline = false,
}: PlaceholderFieldProps) {
  if (inline) {
    return (
      <span
        className={clsx(
          "inline-block border border-dashed border-ash opacity-70 px-1.5 rounded-md font-mono text-slate type-caption",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      className={clsx(
        "border border-dashed border-ash opacity-70 rounded-lg px-2 py-1 font-mono text-slate type-caption",
        className
      )}
    >
      {children}
    </div>
  );
}
