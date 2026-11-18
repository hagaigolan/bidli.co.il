import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { useMemo } from "react";

const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
// שורה שהיא כולה הדגשה (בלי קישור) — בפועל משמשת ככותרת משנה במאמרים
const BOLD_LINE = /^\*\*[^*[\]]+\*\*:?$/;

const splitCells = (line) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(c => c.trim());

const cleanCell = (cell) => cell.replace(/\*\*/g, "").replace(/`/g, "");

/**
 * מנרמל את מבנה הכותרות בגוף המאמר:
 * מאמרים כתובים לעיתים כולם ברמת ### (כותרת משנית בלבד), ואז אין היררכיה.
 * לכן הכותרת הגבוהה ביותר במאמר הופכת לכותרת ראשית (H2), הבאה אחריה ל-H3,
 * ושורות הדגשה שעומדות לבדן הופכות לכותרת משנה.
 */
function normalizeLines(lines) {
  const prepared = lines.map((line) => {
    const t = line.trim();
    if (BOLD_LINE.test(t)) {
      return `##### ${t.replace(/^\*\*/, "").replace(/\*\*:?$/, "").trim()}`;
    }
    return line;
  });

  const levels = prepared
    .map(l => l.match(HEADING))
    .filter(Boolean)
    .map(m => m[1].length);

  const minLevel = levels.length ? Math.min(...levels) : 2;
  const shift = 2 - minLevel;

  return prepared.map((line) => {
    const m = line.match(HEADING);
    if (!m) return line;
    const level = Math.min(6, Math.max(2, m[1].length + shift));
    return `${"#".repeat(level)} ${m[2]}`;
  });
}

/** מפצל את גוף המאמר לבלוקים: מרקדאון וטבלאות (טבלאות מרקדאון רגיל אינן נתמכות). */
function toBlocks(markdown) {
  const lines = (markdown || "").split("\n");

  const firstLine = lines.findIndex(l => l.trim() !== "");
  if (firstLine !== -1 && /^#\s+/.test(lines[firstLine])) lines.splice(firstLine, 1);

  const normalized = normalizeLines(lines);

  const blocks = [];
  let buffer = [];
  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) blocks.push({ type: "md", text });
    buffer = [];
  };

  for (let i = 0; i < normalized.length; i++) {
    if (TABLE_ROW.test(normalized[i]) && TABLE_SEP.test(normalized[i + 1] || "")) {
      flush();
      const header = splitCells(normalized[i]).map(cleanCell);
      const rows = [];
      i += 2;
      while (i < normalized.length && TABLE_ROW.test(normalized[i])) {
        rows.push(splitCells(normalized[i]).map(cleanCell));
        i++;
      }
      i--;
      blocks.push({ type: "table", header, rows });
    } else {
      buffer.push(normalized[i]);
    }
  }

  flush();
  return blocks;
}

const linkClass = "font-bold text-[#c9722c] underline decoration-[#e5893d66] decoration-2 underline-offset-2 hover:decoration-[#e5893d] transition-colors";

const components = {
  // כותרת ראשית — הגדולה והבולטת, עם פס הדגשה וקו מפריד מעל
  h2: ({ node, ...props }) => (
    <h2
      className="mt-12 mb-5 scroll-mt-24 border-r-4 border-[#e5893d] pr-3 text-[23px] font-black leading-tight text-gray-900 first:mt-0 md:text-[27px]"
      {...props}
    />
  ),
  // כותרת משנית
  h3: ({ node, ...props }) => (
    <h3 className="mt-9 mb-3 text-[19px] font-bold leading-snug text-[#2d4f68] md:text-xl" {...props} />
  ),
  // כותרת שלישית — קטנה ובולטת
  h4: ({ node, ...props }) => (
    <h4 className="mt-7 mb-2 border-r-2 border-[#3e6b8a] pr-2.5 text-[16px] font-bold leading-snug text-gray-900 md:text-[17px]" {...props} />
  ),
  h5: ({ node, ...props }) => (
    <h5 className="mt-6 mb-2 border-r-2 border-[#3e6b8a] pr-2.5 text-[15px] font-bold leading-snug text-gray-900" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <h6 className="mt-6 mb-2 text-[15px] font-bold text-gray-800" {...props} />
  ),
  h1: ({ node, ...props }) => (
    <h2 className="mt-12 mb-5 border-r-4 border-[#e5893d] pr-3 text-[23px] font-black leading-tight text-gray-900 first:mt-0 md:text-[27px]" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-5 text-[15.5px] leading-[1.95] text-gray-700 md:text-base" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mb-6 list-disc space-y-2.5 pr-6 text-[15.5px] leading-[1.9] text-gray-700 marker:text-[#e5893d]" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-6 list-decimal space-y-2.5 pr-6 text-[15.5px] leading-[1.9] text-gray-700 marker:font-bold marker:text-[#3e6b8a]" {...props} />
  ),
  li: ({ node, ...props }) => <li className="pr-1" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote className="my-6 rounded-xl border-r-4 border-[#3e6b8a] bg-[#3e6b8a0a] px-4 py-3 text-[15.5px] leading-[1.9] text-gray-700 [&>p:last-child]:mb-0" {...props} />
  ),
  hr: () => <hr className="my-10 border-gray-100" />,
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
    <div className="my-7 overflow-x-auto rounded-2xl border border-gray-200">
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