import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DatasetCard from "../components/DatasetCard";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  fetchListings,
  fetchStats,
  lovelaceToAda,
} from "../lib/api";
import type { DataCategory } from "../lib/api";

const CATEGORIES: DataCategory[] = [
  "healthcare",
  "finance",
  "nlp",
  "computer_vision",
  "tabular",
  "time_series",
  "other",
];

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="h-5 w-2/3 rounded bg-gray-800" />
        <div className="h-5 w-16 rounded-full bg-gray-800" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-800" />
        <div className="h-3 w-3/4 rounded bg-gray-800" />
      </div>
      <div className="mb-4 flex gap-4">
        <div className="h-3 w-16 rounded bg-gray-800" />
        <div className="h-3 w-12 rounded bg-gray-800" />
        <div className="h-5 w-16 rounded-full bg-gray-800" />
      </div>
      <div className="border-t border-gray-800 pt-3">
        <div className="flex justify-between">
          <div className="h-6 w-20 rounded bg-gray-800" />
          <div className="h-4 w-28 rounded bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  const [selectedCategory, setSelectedCategory] = useState<
    DataCategory | undefined
  >(undefined);

  const {
    data: listings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["listings", selectedCategory],
    queryFn: () => fetchListings(selectedCategory),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          AI Data Marketplace
        </h1>
        <p className="mb-5 text-gray-500">
          Privacy-preserving datasets verified with zero-knowledge proofs on
          Cardano Midnight.
        </p>

        {/* Stats bar */}
        {stats && (
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
                <svg
                  className="h-4.5 w-4.5 text-violet-400"
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
              </div>
              <div>
                <p className="text-lg font-bold text-white">
                  {stats.total_listings}
                </p>
                <p className="text-xs text-gray-500">Datasets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
                <svg
                  className="h-4.5 w-4.5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">
                  {lovelaceToAda(stats.total_value_lovelace)} ADA
                </p>
                <p className="text-xs text-gray-500">Total value</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
            selectedCategory === undefined
              ? "border-violet-500/50 bg-violet-500/20 text-violet-300"
              : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-300"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              setSelectedCategory(selectedCategory === cat ? undefined : cat)
            }
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
              selectedCategory === cat
                ? CATEGORY_COLORS[cat]
                : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-gray-300"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-400">
          <p className="font-medium">Failed to load listings</p>
          <p className="mt-1 text-sm text-red-500">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && listings && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-900 py-20 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-lg font-medium text-gray-400">
            No datasets listed yet
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Be the first to upload a dataset to the marketplace.
          </p>
        </div>
      )}

      {/* Listings grid */}
      {!isLoading && listings && listings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <DatasetCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
