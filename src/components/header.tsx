"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SearchIcon, UserIcon, CartIcon, MenuIcon, CloseIcon, HeartIcon } from "./icons";
import { SearchModal } from "./search-modal";
import { MegaMenuNav, MobileMegaMenuContent } from "./mega-menu";
import { useAuth } from "./auth-provider";

const secondaryLinks = [
  { label: "About", href: "/about" },
];

interface HeaderProps {
  onCartOpen?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

export function Header({ onCartOpen, cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [userMenuOpen]);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-black/5">
      <nav className="mx-auto flex h-14 items-center px-4 lg:px-8 relative">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-1 mr-3"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Logo */}
        <Link href="/" className="mr-8">
          <span className="text-xl font-semibold italic tracking-tight text-charcoal">
            FashionHero
          </span>
        </Link>

        {/* Desktop nav with mega menu */}
        <MegaMenuNav />

        {/* Right side icons */}
        <div className="flex items-center gap-3 ml-auto">
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden lg:block text-[12px] text-charcoal hover:opacity-60 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
          <button
            aria-label="Search"
            className="p-1 hover:opacity-60 transition-opacity"
            onClick={() => setSearchOpen(true)}
          >
            <SearchIcon />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden sm:block p-1 hover:opacity-60 transition-opacity relative"
          >
            <HeartIcon className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          {user ? (
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-label="Menu konta"
                className="p-1 hover:opacity-70 transition-opacity flex items-center justify-center"
              >
                <span className="w-5 h-5 rounded-full bg-charcoal text-white text-[11px] font-medium flex items-center justify-center">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-black/10 shadow-xl rounded-xl py-1.5 z-50">
                  {/* User info */}
                  <div className="px-3.5 py-2.5 border-b border-black/8">
                    <p className="text-[12px] font-medium text-charcoal">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-warm-gray truncate">{user.email}</p>
                  </div>

                  {/* Links */}
                  <Link
                    href="/account/my-products"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-charcoal hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-[15px]">🛍️</span>
                    Moje produkty
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-charcoal hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-[15px]">👤</span>
                    Moje konto
                  </Link>

                  {/* Sign out */}
                  <div className="border-t border-black/8 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        router.push("/");
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2 text-[13px] text-warm-gray hover:text-charcoal hover:bg-neutral-50 transition-colors"
                    >
                      <span className="text-[15px]">↩</span>
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/account/login"
              aria-label="Account"
              className="hidden sm:flex p-1 hover:opacity-60 transition-opacity items-center justify-center"
            >
              <UserIcon />
            </Link>
          )}
          <button
            aria-label="View Cart"
            className="p-1 hover:opacity-60 transition-opacity relative"
            onClick={onCartOpen}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-charcoal text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <div className="px-4 py-4 space-y-1 border-t border-black/5">
          <MobileMegaMenuContent onLinkClick={() => setMobileMenuOpen(false)} />
          {secondaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
