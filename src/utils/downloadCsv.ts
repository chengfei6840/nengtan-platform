/** 下载 CSV（带 BOM，便于 Excel 打开中文） */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
) {
  const escape = (cell: string | number | boolean | null | undefined) => {
    const raw = cell == null ? '' : String(cell)
    if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`
    return raw
  }
  const lines = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
