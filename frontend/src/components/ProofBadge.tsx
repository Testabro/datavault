import { useState } from "react";
import type { ZKProof } from "../lib/api";

interface ProofBadgeProps {
  proof: ZKProof | null;
  size?: "sm" | "md";
}

export default function ProofBadge({ proof, size = "sm" }: ProofBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const small = size === "sm";

  if (!proof) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 text-gray-500 ${
          small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        }`}
      >
        <svg
          className={small ? "h-3 w-3" : "h-4 w-4"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        Unverified
      </span>
    );
  }

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 ${
          small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
        }`}
      >
        <svg
          className={small ? "h-3 w-3" : "h-4 w-4"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Verified
      </span>

      {showTooltip && (
        <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-300 shadow-xl">
          <span className="block font-medium text-emerald-400">ZK Proof</span>
          <span className="block font-mono text-gray-500">
            {proof.proof_hash.slice(0, 16)}...{proof.proof_hash.slice(-8)}
          </span>
        </span>
      )}
    </span>
  );
}
