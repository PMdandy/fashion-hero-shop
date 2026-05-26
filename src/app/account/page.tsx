"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const mockOrders = [
  { id: "SF-10042", date: "March 15, 2026", status: "Delivered", total: 592 },
  { id: "SF-10038", date: "February 22, 2026", status: "Delivered", total: 940 },
  { id: "SF-10031", date: "January 8, 2026", status: "Delivered", total: 480 },
];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/account/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      {/* Breadcrumb */}
      <nav className="text-[11px] text-warm-gray mb-8 tracking-wide">
        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal">Account</span>
      </nav>

      <h1 className="text-2xl font-light text-charcoal mb-2">
        Hello, {user.firstName}
      </h1>
      <p className="text-[13px] text-warm-gray mb-10">
        Welcome back to your FashionHero account.
      </p>

      {/* My Products */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal">
            Moje produkty
          </h2>
          <Link
            href="/account/my-products"
            className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors"
          >
            Zobacz wszystkie
          </Link>
        </div>
        <p className="text-[13px] text-charcoal/70">
          Zarządzaj swoimi wystawionymi produktami i śledź sprzedaż.
        </p>
        <Link
          href="/account/my-products"
          className="inline-block mt-3 text-[12px] font-medium text-charcoal border border-charcoal/30 px-4 py-2 hover:border-charcoal transition-colors"
        >
          Przejdź do moich produktów →
        </Link>
      </section>

      {/* Order History */}
      <section className="mb-10">
        <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal mb-4 pb-2 border-b border-black/10">
          Order History
        </h2>
        <div className="space-y-3">
          {mockOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-black/5">
              <div>
                <p className="text-[13px] font-medium text-charcoal">{order.id}</p>
                <p className="text-[12px] text-warm-gray">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-medium text-charcoal">{order.total.toFixed(0)} zl</p>
                <p className="text-[11px] text-green-700 font-medium">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Account Details */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal">
            Account Details
          </h2>
          <button className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors">
            Edit
          </button>
        </div>
        <div className="space-y-1.5 text-[13px] text-charcoal/80">
          <p>{user.firstName} {user.lastName}</p>
          <p>{user.email}</p>
        </div>
      </section>

      {/* Saved Addresses */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-black/10">
          <h2 className="text-[12px] font-medium uppercase tracking-[0.8px] text-charcoal">
            Saved Addresses
          </h2>
          <button className="text-[11px] text-warm-gray underline hover:text-charcoal transition-colors">
            Add Address
          </button>
        </div>
        <div className="text-[13px] text-charcoal/80 space-y-0.5">
          <p className="font-medium text-charcoal">{user.firstName} {user.lastName}</p>
          <p>123 Sustainable Ave</p>
          <p>San Francisco, CA 94110</p>
          <p>United States</p>
        </div>
      </section>

      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="btn-cta-outline text-[12px] w-full"
      >
        SIGN OUT
      </button>
    </div>
  );
}
