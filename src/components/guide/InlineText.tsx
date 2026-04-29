import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

const PATTERN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

/**
 * Renders text with inline support for:
 *   [label](/internal-or-external)  -> <Link> (internal) or <a> (external)
 *   **bold**                        -> <strong>
 */
export function InlineText({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  PATTERN.lastIndex = 0;

  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[1] && match[2]) {
      const label = match[1];
      const href = match[2];
      const isExternal = /^https?:\/\//.test(href);
      parts.push(
        isExternal ? (
          <a
            key={parts.length}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            {label}
          </a>
        ) : (
          <Link
            key={parts.length}
            to={href}
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            {label}
          </Link>
        ),
      );
    } else if (match[3]) {
      parts.push(<strong key={parts.length}>{match[3]}</strong>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}
