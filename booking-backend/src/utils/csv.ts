// RFC 4180-style escaping: quote any field containing a comma, quote, or newline,
// doubling embedded quotes.
function csvEscape(value: string): string {
    if (/[",\n\r]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export function toCsv(rows: Record<string, string>[], columns: string[]): string {
    const header = columns.map(csvEscape).join(',');
    const lines = rows.map((row) => columns.map((col) => csvEscape(row[col] ?? '')).join(','));
    return [header, ...lines].join('\r\n');
}
