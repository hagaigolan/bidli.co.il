/**
 * טבלת השוואה נגללת. columns — כותרות העמודות, rows — שורות שבהן התא הראשון הוא שם השורה.
 * highlightColumn — אינדקס עמודה להדגשה (0 = עמודת השמות).
 */
export default function ComparisonTable({ columns, rows, highlightColumn = -1, caption }) {
  return (
    <div className="mt-6">
      {caption && <p className="mb-3 text-sm text-gray-500">{caption}</p>}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full min-w-[760px] border-collapse text-right text-sm">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col, i) => (
                <th key={i} scope="col"
                  className={`border-b border-gray-200 px-4 py-3 font-black text-gray-900 ${i === highlightColumn ? "bg-[#e5893d14]" : ""}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 ? "bg-gray-50/40" : "bg-white"}>
                {row.map((cell, ci) => (
                  <td key={ci}
                    className={`px-4 py-3 align-top leading-7 ${ri === rows.length - 1 ? "" : "border-b border-gray-100"} ${
                      ci === 0 ? "font-bold text-gray-900" : "text-gray-700"
                    } ${ci === highlightColumn ? "bg-[#e5893d08]" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}