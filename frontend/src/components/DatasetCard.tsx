import { useNavigate } from "react-router-dom";
import type { Listing } from "../lib/api";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  lovelaceToAda,
  truncateAddress,
} from "../lib/api";
import ProofBadge from "./ProofBadge";

interface DatasetCardProps {
  listing: Listing;
}

export default function DatasetCard({ listing }: DatasetCardProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/listing/${listing.id}`)}
      className="group flex w-full flex-col rounded-xl border border-gray-800 bg-gray-900 p-5 text-left transition-all hover:border-violet-500/40 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-violet-500/5"
    >
      {/* Header: title + category */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-100 transition-colors group-hover:text-violet-300">
          {listing.title}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            CATEGORY_COLORS[listing.category]
          }`}
        >
          {CATEGORY_LABELS[listing.category]}
        </span>
      </div>

      {/* Description snippet */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
        {listing.description}
      </p>

      {/* Metadata row */}
      <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          {listing.metadata.row_count.toLocaleString()} rows
        </span>
        <span className="flex items-center gap-1">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
            />
          </svg>
          {listing.metadata.column_count} cols
        </span>
        <ProofBadge proof={listing.proof} size="sm" />
      </div>

      {/* Footer: price + provider */}
      <div className="mt-auto flex items-center justify-between border-t border-gray-800 pt-3">
        <span className="text-lg font-bold text-amber-400">
          {lovelaceToAda(listing.price_lovelace)}{" "}
          <span className="text-xs font-normal text-amber-400/60">ADA</span>
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-mono">
            {truncateAddress(listing.provider_address, 6)}
          </span>
          {listing.reputation_score > 0 && (
            <span className="flex items-center gap-0.5 text-amber-500">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {listing.reputation_score.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
