import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CATEGORY_LABELS,
  fetchProviderListings,
  fetchProviderStats,
  lovelaceToAda,
  truncateAddress,
} from "../lib/api";
import type { Listing, ProviderStats } from "../lib/api";

type Tab = "listings" | "purchases";

export default function Dashboard() {
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("listings");

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["providerStats", submittedAddress],
    queryFn: () => fetchProviderStats(submittedAddress),
    enabled: !!submittedAddress,
  });

  const {
    data: listings,
    isLoading: listingsLoading,
  } = useQuery({
    queryKey: ["providerListings", submittedAddress],
    queryFn: () => fetchProviderListings(submittedAddress),
    enabled: !!submittedAddress,
  });

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      setSubmittedAddress(address.trim());
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
        Dashboard
      </h1>
      <p className="mb-8 text-gray-500">
        View your listings, purchases, and marketplace activity.
      </p>

      {/* Address input */}
      <form onSubmit={handleLookup} className="mb-8">
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          Wallet Address
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="addr1..."
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={!address.trim()}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Lookup
          </button>
        </div>
      </form>

      {!submittedAddress && (
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-400">
            Enter your wallet address
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Look up your listings and activity on the marketplace.
          </p>
        </div>
      )}

      {submittedAddress && (
        <>
          {/* Stats cards */}
          <StatsBar
            stats={stats ?? null}
            loading={statsLoading}
            address={submittedAddress}
          />

          {/* Tabs */}
          <div className="mb-6 mt-8 flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("listings")}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-all ${
                activeTab === "listings"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition-all ${
                activeTab === "purchases"
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              My Purchases
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "listings" && (
            <ListingsTable
              listings={listings ?? []}
              loading={listingsLoading}
            />
          )}

          {activeTab === "purchases" && (
            <PurchasesPlaceholder address={submittedAddress} />
          )}
        </>
      )}
    </div>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────

function StatsBar({
  stats,
  loading,
  address,
}: {
  stats: ProviderStats | null;
  loading: boolean;
  address: string;
}) {
  if (loading) {
    return (
      <div className="grid animate-pulse gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <div className="h-3 w-16 rounded bg-gray-800" />
            <div className="mt-2 h-7 w-24 rounded bg-gray-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-xs text-gray-500">Address</p>
        <p className="mt-1 font-mono text-sm text-violet-300">
          {truncateAddress(address, 8)}
        </p>
      </div>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-xs text-gray-500">Active Listings</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {stats?.active_listings ?? 0}
        </p>
      </div>
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <p className="text-xs text-gray-500">Total Value</p>
        <p className="mt-1 text-2xl font-bold text-amber-400">
          {lovelaceToAda(stats?.total_value_lovelace ?? 0)}{" "}
          <span className="text-sm font-normal text-amber-400/60">ADA</span>
        </p>
      </div>
    </div>
  );
}

// ── Listings table ─────────────────────────────────────────────────

function ListingsTable({
  listings,
  loading,
}: {
  listings: Listing[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-900" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
        <p className="text-gray-500">No listings found for this address.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-right">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50 bg-gray-900/50">
          {listings.map((listing) => (
            <tr
              key={listing.id}
              className="transition-colors hover:bg-gray-900"
            >
              <td className="px-4 py-3">
                <Link
                  to={`/listing/${listing.id}`}
                  className="font-medium text-gray-200 hover:text-violet-300"
                >
                  {listing.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-400">
                {CATEGORY_LABELS[listing.category]}
              </td>
              <td className="px-4 py-3 text-right font-mono text-amber-400">
                {lovelaceToAda(listing.price_lovelace)} ADA
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={listing.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(listing.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Purchases placeholder ──────────────────────────────────────────

function PurchasesPlaceholder({ address }: { address: string }) {
  // The backend doesn't expose a "purchases by buyer" endpoint yet,
  // so we show a placeholder that communicates this clearly.
  void address;
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
      <svg
        className="mx-auto mb-4 h-12 w-12 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
        />
      </svg>
      <p className="text-gray-400">
        Purchase history will appear here once the escrow system is live.
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Purchases are tracked on-chain via Midnight smart contracts.
      </p>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    sold: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    delisted: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    disputed: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? styles.pending
      }`}
    >
      {status}
    </span>
  );
}
