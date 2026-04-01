import { NavLink, Outlet } from "react-router-dom";
import WalletConnect from "./WalletConnect";

const NAV_LINKS = [
  { to: "/", label: "Browse" },
  { to: "/upload", label: "Upload" },
  { to: "/dashboard", label: "Dashboard" },
] as const;

function ShieldIcon() {
  return (
    <svg
      className="h-7 w-7 text-violet-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-colors hover:text-violet-300"
          >
            <ShieldIcon />
            <span>
              Data<span className="text-violet-400">Vault</span>
            </span>
          </NavLink>

          {/* Nav links (centered) */}
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-violet-500/15 text-violet-300"
                      : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Wallet */}
          <WalletConnect />
        </nav>

        {/* Mobile nav */}
        <div className="flex border-t border-gray-800/50 sm:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `flex-1 py-2.5 text-center text-xs font-medium transition-all ${
                  isActive
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-gray-500 hover:text-gray-300"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-xs text-gray-600">
        DataVault &mdash; Privacy-preserving AI data marketplace on Cardano
        Midnight
      </footer>
    </div>
  );
}
