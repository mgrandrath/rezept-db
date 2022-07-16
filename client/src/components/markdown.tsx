import { type AnchorHTMLAttributes, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  node: unknown;
  children: ReactNode;
}

const ExternalLink = (props: ExternalLinkProps) => {
  const { node, children, ...linkProps } = props;
  return (
    <a {...linkProps} rel="external noopener noreferrer" target="_blank">
      {children}
    </a>
  );
};

interface MarkdownProps {
  children: string | undefined;
}

export const Markdown = (props: MarkdownProps) => {
  const { children = "" } = props;

  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      components={{
        a: ExternalLink,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
