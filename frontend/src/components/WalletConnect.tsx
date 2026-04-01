import { useState } from "react";
import { truncateAddress } from "../lib/api";

const MOCK_ADDRESS =
  "addr1qxck5yg8ngt6ckp7f5e2mnkylce04wrt8j4ny0q7w7lkzsnxhclrfhp9f6x3pyzegvq5";

export default function WalletConnect() {
  const [connected, setConnected] = useState(false);

  if (connected) {
    return (
      <button
        onClick={() => setConnected(false)}
        className="group flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300 transition-all hover:border-violet-500/50 hover:bg-violet-500/20"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="font-mono">{truncateAddress(MOCK_ADDRESS, 6)}</span>
        <svg
          className="h-4 w-4 text-gray-500 transition-colors group-hover:text-violet-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={() => setConnected(true)}
      className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 active:scale-95"
    >
      Connect Wallet
    </button>
  );
}
