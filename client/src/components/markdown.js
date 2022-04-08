import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

const ExternalLink = ({ node, children, ...props }) => {
  return (
    <a {...props} rel="external noopener noreferrer" target="_blank">
      {children}
    </a>
  );
};

export const Markdown = (props) => {
  const { children } = props;

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
