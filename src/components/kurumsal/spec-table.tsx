/**
 * Kurumsal künye tablosu: etiket solda, değer mono — teknik föy hissi.
 * Değeri olmayan satır gösterilmez (uydurma alan yok).
 */
export default function SpecTable({ rows }: { rows: { label: string; value: string | null | undefined }[] }) {
  const visible = rows.filter((r) => r.value)
  if (visible.length === 0) return null
  return (
    <dl className="border-t border-[var(--foreground)]">
      {visible.map((r) => (
        <div key={r.label} className="grid grid-cols-12 gap-4 border-b border-[var(--rule)] py-3">
          <dt className="col-span-4 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--muted)]">
            {r.label}
          </dt>
          <dd className="col-span-8 font-mono text-[13px] leading-relaxed text-[var(--foreground)]">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
