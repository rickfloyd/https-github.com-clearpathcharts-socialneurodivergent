import React from "react";
import { isBlockedContent } from "../../lib/security/contentGate";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export default function SafeExternalLink({
  href,
  children,
  className,
  onClick
}: Props) {

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isBlockedContent(href)) {
      e.preventDefault();
      alert("This content is not available within ClearPath.");
      return;
    }
    if (onClick) onClick(e);
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
