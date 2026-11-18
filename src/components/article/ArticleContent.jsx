import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/;

const splitCells = (line) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());

// ניקוי סימוני מרקדאון בתאי טבלה (התאים מוצגים כטקסט פשוט)
const cleanCell = (cell) => cell.replace(/\*\*/g, "").replace(/`/g, "");

/**
 * מפצל את גוף המאמר לבלוקים: מרקדאון וטבלאות.
 * מרקדאון רגיל מציג טבלאות כשורות טקסט, ולכן טבלאות נבנות כרכיב אמיתי.
 * כמו כן מוסרת כותרת H1 כפולה — הכותרת כבר מוצגת בראש העמוד, וגוגל דורש H1 אחד בלבד.
 */
function toBlocks(markdown) {
  const lines = (markdown || "").split("\n");

  const firstLine = lines.findIndex(l => l.trim() !== "");
  if (firstLine !== -1 && /^#\s+/.test(lines[firstLine])) lines.splice(firstLine, 1);

  const blocks = [];
  let buffer = [];
  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) blocks.push({ type: "md", text });
    buffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    if (TABLE_ROW.test(lines[i]) && TABLE_SEP.test(lines[i + 1] || "")) {
      flush();
      const header = splitCells(lines[i]).map(cleanCell);
      const rows = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        rows.push(splitCells(lines[i]).map(cleanCell));
        i++;
      }
      i--;
      blocks.push({ type: "table", header, rows });
    } else {
      buffer.push(lines[i]);
    }
  }

  flush();
  return blocks;
}

const linkClass = "font-bold text-[#c9722c] underline decoration-[#e5893d66] decoration-2 underline-offset-2 hover:decoration-[#e5893d] transition-colors";

const components = {
  h1: ({ node, ...props }) => (
    <h2 className="mt-10 mb-4 border-r-4 border-[#e5893d] pr-3 text-[22px] font-black leading-snug text-gray-900 md:text-2xl" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mt-10 mb-4 border-r-4 border-[#e5893d] pr-3 text-[22px] font-black leading-snug text-gray-900 md:text-2xl" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="mt-7 mb-2.5 text-lg font-bold leading-snug text-[#2d4f68]" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="mt-5 mb-2 text-base font-bold text-gray-900" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-4 text-[15px] leading-8 text-gray-700 md:text-base" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-5 list-disc space-y-2 pr-6 text-[15px] leading-8 text-gray-700 marker:text-[#e5893d]" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-5 list-decimal space-y-2 pr-6 text-[15px] leading-8 text-gray-700 marker:font-bold marker:text-[#3e6b8a]" {...props} />
  ),
  li: ({ node, ...props }) => <li className="pr-1" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="my-6 rounded-xl border-r-4 border-[#3e6b8a] bg-[#3e6b8a0a] px-4 py-3 text-[15px] leading-8 text-gray-700 [&>p:last-child]:mb-0" {...props} />
  ),
  hr: () => <hr className="my-8 border-gray-100" />,
  img: ({ node, ...props }) => <img className="my-6 w-full rounded-xl" loading="lazy" {...props} />,
  code: ({ node, ...props }) => <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[13px] text-[#2d4f68]" {...props} />,
  a: ({ node, href = "", children, ...props }) => {
    if (href.startsWith("/")) {
      return <Link to={href} className={linkClass}>{children}</Link>;
    }
    if (href.startsWith("#")) {
      return <a href={href} className={linkClass}>{children}</a>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass} {...props}>
        {children}
      </a>
    );
  },
};

function DataTable({ header, rows }) {
  return (
    <div className="my-6 overflow-x-auto rounded-2xl border border-gray-200">
      <table className="w-full min-w-[420px] text-right text-sm">
        <thead>
          <tr className="bg-gray-50">
            {header.map((cell, i) => (
              <th key={i} className="whitespace-nowrap border-b border-gray-200 px-4 py-3 font-black text-gray-900">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 ? "bg-gray-50/50" : "bg-white"}>
              {row.map((cell, ci) => (
                <td key={ci} className={`px-4 py-3 leading-7 text-gray-700 ${ri === rows.length - 1 ? "" : "border-b border-gray-100"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ArticleContent({ content }) {
  const blocks = useMemo(() => toBlocks(content), [content]);

  return (
    <div dir="rtl" className="max-w-none">
      {blocks.map((block, i) =>
        block.type === "table" ? (
          <DataTable key={i} header={block.header} rows={block.rows} />
        ) : (
          <ReactMarkdown key={i} components={components}>
            {block.text}
          </ReactMarkdown>
        )
      )}
    </div>
  );
}