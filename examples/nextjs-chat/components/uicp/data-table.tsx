/**
 * DataTable UICP Component
 */

interface DataTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
  striped?: boolean;
  compact?: boolean;
}

export function DataTable({
  title,
  headers,
  rows,
  striped = true,
  compact = false,
}: DataTableProps) {
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="my-4">
      {title && (
        <h3 className="text-lg font-semibold text-gray-100 mb-3">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`${cellPadding} text-left text-sm font-semibold text-gray-200`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={
                  striped && rowIndex % 2 === 1
                    ? 'bg-gray-800/50'
                    : 'bg-gray-900/50'
                }
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`${cellPadding} text-sm text-gray-300`}
                  >
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

