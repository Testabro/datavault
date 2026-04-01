import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProofBadge from "../components/ProofBadge";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  createPurchase,
  fetchListing,
  formatBytes,
  lovelaceToAda,
} from "../lib/api";

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const [buyerAddress, setBuyerAddress] = useState("");
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
  });

  const purchaseMutation = useMutation({
    mutationFn: () => createPurchase(id!, buyerAddress),
    onSuccess: () => {
      setShowPurchaseModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-1/3 rounded bg-gray-800" />
        <div className="h-4 w-2/3 rounded bg-gray-800" />
        <div className="h-64 rounded-xl bg-gray-900" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          className="mb-4 h-16 w-16 text-red-500/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-400">Listing not found</p>
        <Link
          to="/"
          className="mt-4 text-sm text-violet-400 hover:text-violet-300"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  const meta = listing.metadata;
  const proof = listing.proof;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-violet-400">
          Browse
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{listing.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title + category */}
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {listing.title}
              </h1>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  CATEGORY_COLORS[listing.category]
                }`}
              >
                {CATEGORY_LABELS[listing.category]}
              </span>
              <ProofBadge proof={proof} size="md" />
            </div>
            <p className="leading-relaxed text-gray-400">
              {listing.description}
            </p>
          </div>

          {/* Metadata table */}
          <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Dataset Metadata
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Rows</p>
                <p className="text-lg font-bold text-white">
                  {meta.row_count.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Columns</p>
                <p className="text-lg font-bold text-white">
                  {meta.column_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Format</p>
                <p className="text-lg font-bold text-white">
                  {meta.file_format.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Size</p>
                <p className="text-lg font-bold text-white">
                  {formatBytes(meta.size_bytes)}
                </p>
              </div>
            </div>
          </section>

          {/* Column list */}
          <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Columns
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {meta.columns.map((col) => (
                    <tr key={col}>
                      <td className="py-2 pr-4 font-mono text-gray-300">
                        {col}
                      </td>
                      <td className="py-2 text-gray-500">
                        {meta.column_types[col] ?? "unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Statistics table */}
          {Object.keys(meta.sample_stats).length > 0 && (
            <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Column Statistics
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-left text-xs uppercase tracking-wider text-gray-500">
                      <th className="pb-2 pr-4">Column</th>
                      <th className="pb-2 pr-4 text-right">Mean</th>
                      <th className="pb-2 pr-4 text-right">Std</th>
                      <th className="pb-2 pr-4 text-right">Min</th>
                      <th className="pb-2 text-right">Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {Object.entries(meta.sample_stats).map(([col, stats]) => (
                      <tr key={col}>
                        <td className="py-2 pr-4 font-mono text-gray-300">
                          {col}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-gray-400">
                          {stats.mean?.toFixed(2) ?? "-"}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-gray-400">
                          {stats.std?.toFixed(2) ?? "-"}
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-gray-400">
                          {stats.min?.toFixed(2) ?? "-"}
                        </td>
                        <td className="py-2 text-right font-mono text-gray-400">
                          {stats.max?.toFixed(2) ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ZK Proof section */}
          {proof && (
            <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Zero-Knowledge Proof
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Proof Hash</span>
                  <p className="mt-0.5 break-all font-mono text-xs text-gray-300">
                    {proof.proof_hash}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Timestamp</span>
                  <p className="mt-0.5 text-gray-300">
                    {new Date(proof.proof_timestamp).toLocaleString()}
                  </p>
                </div>
                {proof.midnight_tx_hash && (
                  <div>
                    <span className="text-gray-500">Midnight TX</span>
                    <p className="mt-0.5 break-all font-mono text-xs text-gray-300">
                      {proof.midnight_tx_hash}
                    </p>
                  </div>
                )}
                {Object.keys(proof.verified_properties).length > 0 && (
                  <div>
                    <span className="text-gray-500">Verified Properties</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(proof.verified_properties).map(
                        ([key, val]) => (
                          <span
                            key={key}
                            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
                          >
                            {key}: {val}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Price card */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-3xl font-bold text-amber-400">
                {lovelaceToAda(listing.price_lovelace)}
                <span className="ml-1 text-sm font-normal text-amber-400/60">
                  ADA
                </span>
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                {listing.price_lovelace.toLocaleString()} lovelace
              </p>
            </div>

            {listing.status === "active" ? (
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 active:scale-[0.98]"
              >
                Purchase Dataset
              </button>
            ) : (
              <div className="w-full rounded-lg bg-gray-800 py-3 text-center text-sm font-medium text-gray-500">
                {listing.status === "sold" ? "Sold" : "Delisted"}
              </div>
            )}

            {purchaseMutation.isSuccess && (
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-400">
                Purchase initiated! ID:{" "}
                <span className="font-mono text-xs">
                  {purchaseMutation.data.id.slice(0, 12)}...
                </span>
              </div>
            )}
          </div>

          {/* Provider info */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Provider
            </h3>
            <p className="break-all font-mono text-xs text-gray-300">
              {listing.provider_address}
            </p>
            {listing.reputation_score > 0 && (
              <div className="mt-3 flex items-center gap-1 text-sm text-amber-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Reputation: {listing.reputation_score.toFixed(1)}
              </div>
            )}
          </div>

          {/* Encrypted CID */}
          {listing.encrypted_cid && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                IPFS Storage
              </h3>
              <p className="break-all font-mono text-xs text-gray-400">
                {listing.encrypted_cid}
              </p>
            </div>
          )}

          {/* Created date */}
          <div className="text-center text-xs text-gray-600">
            Listed {new Date(listing.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold text-white">
              Purchase Dataset
            </h2>
            <p className="mb-1 text-sm text-gray-400">
              <span className="font-medium text-gray-300">
                {listing.title}
              </span>{" "}
              &mdash;{" "}
              <span className="font-bold text-amber-400">
                {lovelaceToAda(listing.price_lovelace)} ADA
              </span>
            </p>
            <p className="mb-5 text-xs text-gray-600">
              Enter your Cardano wallet address to initiate the purchase.
            </p>

            <label className="mb-1 block text-sm font-medium text-gray-400">
              Buyer Address
            </label>
            <input
              type="text"
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              placeholder="addr1..."
              className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />

            {purchaseMutation.error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {purchaseMutation.error instanceof Error
                  ? purchaseMutation.error.message
                  : "Purchase failed"}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => purchaseMutation.mutate()}
                disabled={
                  !buyerAddress.trim() || purchaseMutation.isPending
                }
                className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {purchaseMutation.isPending
                  ? "Processing..."
                  : "Confirm Purchase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
