import type { ReactNode } from "react";

export const Link = (props: {
  href: string;
  children: ReactNode;
}): ReactNode => {
  return (
    <a
      target="_blank"
      href={props.href}
      rel="noopener noreferrer"
      aria-label={`${props.children} (opens in new tab)`}
      className="bg-accent hover:bg-accent-hover text-theme-main flex items-center px-3 py-3 font-heading font-medium transition-colors"
      style={{ borderRadius: 'var(--button-radius)' }}
    >
      {props.children}
    </a>
  );
};
