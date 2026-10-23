import { buttonSecondary } from "./styles";

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;

  const from = (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gold/30 px-4 py-3 text-sm sm:flex-row">
      <p className="text-navy-dark/70">
        Showing {from} to {to} of {meta.total}
      </p>
      <div className="flex items-center gap-3">
        <button type="button" className={buttonSecondary} disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </button>
        <span className="font-semibold text-navy">
          Page {meta.page} of {meta.totalPages}
        </span>
        <button type="button" className={buttonSecondary} disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
