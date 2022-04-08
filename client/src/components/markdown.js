import ReactMarkdown from "react-markdown";

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
      components={{
        a: ExternalLink,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};
