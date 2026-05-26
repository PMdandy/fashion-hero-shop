"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductForm {
  name: string;
  price: string;
  category: string;
  description: string;
  tags: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  sizes: string[];
  images: string[];
}

interface MyProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  status: "Aktywny" | "Wstrzymany";
  sold: number;
  form: ProductForm;
}

// ── Scoring ────────────────────────────────────────────────────────────────

interface ScoreParam {
  key: string;
  label: string;
  points: number;
  icon: string;
  check: (f: ProductForm) => boolean;
  hint: string;
}

const SCORE_PARAMS: ScoreParam[] = [
  {
    key: "images",
    label: "Zdjęcia produktu (min. 2)",
    points: 20,
    icon: "📷",
    check: (f) => f.images.length >= 2,
    hint: "Dodaj co najmniej 2 zdjęcia",
  },
  {
    key: "name",
    label: "Nazwa (min. 5 znaków)",
    points: 10,
    icon: "🏷️",
    check: (f) => f.name.trim().length >= 5,
    hint: "Wpisz pełną nazwę produktu",
  },
  {
    key: "price",
    label: "Cena",
    points: 10,
    icon: "💰",
    check: (f) => Number(f.price) > 0,
    hint: "Ustaw cenę produktu",
  },
  {
    key: "category",
    label: "Kategoria",
    points: 5,
    icon: "📂",
    check: (f) => f.category !== "",
    hint: "Wybierz kategorię",
  },
  {
    key: "description",
    label: "Opis (min. 100 znaków)",
    points: 20,
    icon: "📝",
    check: (f) => f.description.trim().length >= 100,
    hint: "Napisz szczegółowy opis produktu",
  },
  {
    key: "tags",
    label: "Tagi (min. 3)",
    points: 10,
    icon: "🔖",
    check: (f) => f.tags.split(",").filter((t) => t.trim()).length >= 3,
    hint: "Dodaj minimum 3 tagi oddzielone przecinkami",
  },
  {
    key: "dimensions",
    label: "Wymiary i waga",
    points: 10,
    icon: "📏",
    check: (f) => [f.length, f.width, f.height, f.weight].every((v) => v !== ""),
    hint: "Uzupełnij wszystkie pola wymiarów",
  },
  {
    key: "sizes",
    label: "Warianty rozmiarów (min. 3)",
    points: 15,
    icon: "👟",
    check: (f) => f.sizes.length >= 3,
    hint: "Zaznacz minimum 3 dostępne rozmiary",
  },
];

function calcScore(form: ProductForm): number {
  return SCORE_PARAMS.reduce((acc, p) => acc + (p.check(form) ? p.points : 0), 0);
}

function scoreInfo(score: number) {
  if (score < 40) return { label: "Słaba", color: "text-red-500", barColor: "bg-red-400", bgColor: "bg-red-50", borderColor: "border-red-200" };
  if (score < 70) return { label: "Przeciętna", color: "text-amber-500", barColor: "bg-amber-400", bgColor: "bg-amber-50", borderColor: "border-amber-200" };
  return { label: "Mocna", color: "text-green-600", barColor: "bg-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" };
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: MyProduct[] = [
  {
    id: "1",
    name: "Cloud Runner",
    price: 479,
    images: ["/images/products/product-1.jpg", "/images/products/product-9.jpg"],
    status: "Aktywny",
    sold: 48,
    form: {
      name: "Cloud Runner",
      price: "479",
      category: "Buty",
      description:
        "Lekki but do biegania z oddychającą cholewką z siateczki i amortyzowaną podeszwą. Stworzony dla komfortu przez cały dzień. Idealny do joggingu, spacerów i codziennego noszenia.",
      tags: "oddychający, lekki, do prania, jogging",
      length: "28",
      width: "11",
      height: "8",
      weight: "280",
      sizes: ["40", "41", "42", "43", "44"],
      images: ["/images/products/product-1.jpg", "/images/products/product-9.jpg"],
    },
  },
  {
    id: "2",
    name: "Trail Pacer",
    price: 559,
    images: ["/images/products/product-3.jpg"],
    status: "Aktywny",
    sold: 23,
    form: {
      name: "Trail Pacer",
      price: "559",
      category: "Buty",
      description: "Terenowy but trekkingowy.",
      tags: "teren, outdoor",
      length: "",
      width: "",
      height: "",
      weight: "",
      sizes: ["42"],
      images: ["/images/products/product-3.jpg"],
    },
  },
  {
    id: "3",
    name: "Urban Slip",
    price: 399,
    images: [
      "/images/products/product-5.jpg",
      "/images/products/product-2.jpg",
      "/images/products/product-6.jpg",
    ],
    status: "Wstrzymany",
    sold: 61,
    form: {
      name: "Urban Slip",
      price: "399",
      category: "Buty",
      description:
        "Miejski wsuwany but z wulkanizowaną podeszwą. Minimalistyczny design, maksymalny komfort. Idealny do codziennych stylizacji w mieście i na co dzień. Wykonany z wegańskich materiałów.",
      tags: "miejski, wsuwany, casual, minimalizm, vegan",
      length: "26",
      width: "10",
      height: "7",
      weight: "220",
      sizes: ["38", "39", "40", "41", "42", "43"],
      images: [
        "/images/products/product-5.jpg",
        "/images/products/product-2.jpg",
        "/images/products/product-6.jpg",
      ],
    },
  },
];

const ALL_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const CATEGORIES = ["Buty", "Odzież", "Akcesoria", "Skarpety"];

// ── Toast ──────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 bg-charcoal text-white text-[13px] px-5 py-3 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      <span className="text-green-400 text-[16px] leading-none">✓</span>
      {message}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function OfferStrengthBar({ score, className }: { score: number; className?: string }) {
  const { barColor } = scoreInfo(score);
  return (
    <div className={cn("w-full h-1.5 bg-black/8 rounded-full overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", barColor)}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function ProductCard({ product, onEdit }: { product: MyProduct; onEdit: (p: MyProduct) => void }) {
  const score = calcScore(product.form);
  const { label, color } = scoreInfo(score);

  return (
    <div className="bg-white border border-black/8 rounded-xl overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span
          className={cn(
            "absolute top-2.5 right-2.5 text-[10px] font-medium px-2 py-0.5 rounded-full",
            product.status === "Aktywny"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          )}
        >
          {product.status}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[14px] font-medium text-charcoal">{product.name}</h3>
        <p className="text-[13px] text-warm-gray mt-0.5 mb-4">{product.price} zł</p>

        {/* Offer strength */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-warm-gray">Siła oferty</span>
            <span className={cn("text-[12px] font-semibold tabular-nums", color)}>
              {score}<span className="font-normal text-warm-gray">/100</span>
              <span className="ml-1.5">{label}</span>
            </span>
          </div>
          <OfferStrengthBar score={score} />
        </div>

        <button
          onClick={() => onEdit(product)}
          className="mt-4 w-full text-[12px] font-medium border border-charcoal/30 text-charcoal py-2.5 rounded-sm hover:bg-charcoal hover:text-white hover:border-charcoal transition-colors"
        >
          Dowiedz się więcej
        </button>
      </div>
    </div>
  );
}

function LiveForecast({ form }: { form: ProductForm }) {
  const score = calcScore(form);
  const { label, color, barColor } = scoreInfo(score);

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.8px] text-charcoal mb-4">
        Prognoza parametrów live
      </h3>

      {/* Score gauge */}
      <div className="rounded-xl border border-black/8 bg-white p-4 mb-4 text-center">
        <p className={cn("text-5xl font-light leading-none mb-1 tabular-nums", color)}>{score}</p>
        <p className="text-[11px] text-warm-gray">/ 100 pkt</p>
        <p className={cn("text-[13px] font-semibold mt-2", color)}>{label}</p>
        <div className="mt-3">
          <OfferStrengthBar score={score} />
        </div>
        <div className="flex justify-between text-[9px] text-warm-gray mt-1 px-0.5">
          <span>Słaba</span>
          <span>Przeciętna</span>
          <span>Mocna</span>
        </div>
      </div>

      {/* Parameter checklist */}
      <p className="text-[10px] uppercase tracking-wider text-warm-gray mb-2">
        Punkty do zdobycia
      </p>
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
        {SCORE_PARAMS.map((param) => {
          const done = param.check(form);
          return (
            <div
              key={param.key}
              className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-colors",
                done ? "border-green-200 bg-green-50/60" : "border-black/8 bg-white"
              )}
            >
              <span className="text-[14px] leading-none mt-0.5 shrink-0">{param.icon}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-[11px] font-medium leading-tight",
                    done ? "text-green-700 line-through opacity-70" : "text-charcoal"
                  )}
                >
                  {param.label}
                </p>
                {!done && (
                  <p className="text-[10px] text-warm-gray mt-0.5 leading-tight">{param.hint}</p>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] font-bold shrink-0 leading-none mt-0.5",
                  done ? "text-green-600" : "text-amber-500"
                )}
              >
                {done ? "✓" : `+${param.points}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PLACEHOLDER_IMAGES = [
  "/images/products/product-7.jpg",
  "/images/products/product-8.jpg",
  "/images/products/product-10.jpg",
  "/images/products/product-4.jpg",
];

function EditPanel({ product, onClose, onSave }: { product: MyProduct; onClose: () => void; onSave: (form: ProductForm) => void }) {
  const [form, setForm] = useState<ProductForm>({ ...product.form });
  const [showUploadModal, setShowUploadModal] = useState(false);

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleSize = (size: string) =>
    set(
      "sizes",
      form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]
    );

  const handleAddPhoto = () => {
    const next = PLACEHOLDER_IMAGES.find((img) => !form.images.includes(img))
      ?? PLACEHOLDER_IMAGES[0];
    set("images", [...form.images, next]);
    setShowUploadModal(true);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showUploadModal) setShowUploadModal(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, showUploadModal]);

  // Prevent body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const parsedTags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-5xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
          <div>
            <h2 className="text-[15px] font-medium text-charcoal">{product.name}</h2>
            <p className="text-[12px] text-warm-gray">Tryb edycji produktu</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-warm-gray hover:text-charcoal transition-colors text-[18px]"
          >
            ✕
          </button>
        </div>

        {/* Body: form + forecast */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: form ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

            {/* Images */}
            <section>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-3">
                Zdjęcia produktu
              </label>
              <div className="flex gap-2 flex-wrap">
                {form.images.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-lg border border-black/10 overflow-hidden group"
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                    <button
                      onClick={() => set("images", form.images.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[18px] leading-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-black/20 flex flex-col items-center justify-center text-warm-gray hover:border-charcoal hover:text-charcoal transition-colors gap-0.5"
                  onClick={handleAddPhoto}
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-[9px]">Dodaj</span>
                </button>
              </div>
            </section>

            {/* Name + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-1.5">
                  Nazwa produktu
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full border border-black/15 rounded-lg px-3 py-2 text-[13px] text-charcoal focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="np. Cloud Runner"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-1.5">
                  Cena (zł)
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className="w-full border border-black/15 rounded-lg px-3 py-2 text-[13px] text-charcoal focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-1.5">
                Kategoria
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2 text-[13px] text-charcoal focus:outline-none focus:border-charcoal transition-colors bg-white"
              >
                <option value="">Wybierz kategorię...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-1.5">
                Opis produktu
                <span className={cn(
                  "ml-2 font-normal normal-case",
                  form.description.trim().length >= 100 ? "text-green-600" : "text-warm-gray"
                )}>
                  {form.description.trim().length}/100 min. znaków
                </span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                className="w-full border border-black/15 rounded-lg px-3 py-2 text-[13px] text-charcoal focus:outline-none focus:border-charcoal transition-colors resize-none"
                placeholder="Opisz szczegółowo swój produkt — materiały, zastosowanie, unikalne cechy..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-1.5">
                Tagi
                <span className="ml-2 font-normal normal-case text-warm-gray">
                  oddziel przecinkami
                </span>
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                className="w-full border border-black/15 rounded-lg px-3 py-2 text-[13px] text-charcoal focus:outline-none focus:border-charcoal transition-colors"
                placeholder="np. lekki, oddychający, sportowy, wegański"
              />
              {parsedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-neutral-100 text-charcoal px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-3">
                Wymiary i waga
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(
                  [
                    ["length", "Długość (cm)"],
                    ["width", "Szerokość (cm)"],
                    ["height", "Wysokość (cm)"],
                    ["weight", "Waga (g)"],
                  ] as [keyof ProductForm, string][]
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-[10px] text-warm-gray mb-1">{label}</label>
                    <input
                      type="number"
                      value={form[key] as string}
                      onChange={(e) => set(key, e.target.value)}
                      className="w-full border border-black/15 rounded-lg px-2.5 py-2 text-[13px] text-charcoal focus:outline-none focus:border-charcoal transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Size variants */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.7px] text-charcoal mb-3">
                Warianty rozmiarów
                <span className={cn(
                  "ml-2 font-normal normal-case",
                  form.sizes.length >= 3 ? "text-green-600" : "text-warm-gray"
                )}>
                  {form.sizes.length} zaznaczonych
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => {
                  const selected = form.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "w-11 h-11 text-[13px] rounded-lg border transition-colors",
                        selected
                          ? "bg-charcoal text-white border-charcoal"
                          : "bg-white text-charcoal border-black/20 hover:border-charcoal"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: live forecast ───────────────────────── */}
          <div className="w-72 xl:w-80 shrink-0 border-l border-black/8 px-5 py-6 bg-neutral-50/60 overflow-y-auto flex flex-col">
            <LiveForecast form={form} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8 shrink-0">
          <button
            onClick={onClose}
            className="text-[12px] text-warm-gray hover:text-charcoal transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={() => onSave(form)}
            className="btn-cta text-[12px] px-6 py-2.5"
          >
            Zapisz zmiany
          </button>
        </div>
      </div>

      {/* Upload coming-soon modal */}
      {showUploadModal && (
        <>
          <div
            className="fixed inset-0 z-[70] bg-black/30"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-[16px] font-semibold text-charcoal mb-2">
                Funkcjonalność niebawem dostępna
              </h3>
              <p className="text-[13px] text-warm-gray mb-6 leading-relaxed">
                Przesyłanie zdjęć będzie możliwe w kolejnej wersji aplikacji.
                Na razie doliczono <span className="font-semibold text-green-600">+20 pkt</span> do siły oferty.
              </p>
              <button
                onClick={() => setShowUploadModal(false)}
                className="btn-cta text-[12px] px-8 py-2.5 w-full"
              >
                Rozumiem
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MyProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<MyProduct[]>(MOCK_PRODUCTS);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [editingProduct, setEditingProduct] = useState<MyProduct | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.push("/account/login");
  }, [user, router]);

  const handleSave = (form: ProductForm) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct!.id
          ? { ...p, name: form.name, price: Number(form.price), images: form.images.length ? form.images : p.images, form }
          : p
      )
    );
    setEditingProduct(null);
    setToastMessage("Zmiany zostały zapisane!");
  };

  if (!user) return null;

  const filtered = products.filter((p) => {
    if (filter === "active") return p.status === "Aktywny";
    if (filter === "paused") return p.status === "Wstrzymany";
    return true;
  });

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-[11px] text-warm-gray mb-8 tracking-wide">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/account" className="hover:text-charcoal transition-colors">Account</Link>
          <span className="mx-1.5">/</span>
          <span className="text-charcoal">Moje produkty</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-charcoal mb-1">Moje produkty</h1>
            <p className="text-[13px] text-warm-gray">
              {products.length} produktów · Kliknij kafelek, by edytować i poprawić siłę oferty
            </p>
          </div>
          <button className="btn-cta text-[11px] px-5 py-2.5">+ Dodaj produkt</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-5 mb-8 border-b border-black/10">
          {(["all", "active", "paused"] as const).map((f) => {
            const label = f === "all" ? "Wszystkie" : f === "active" ? "Aktywne" : "Wstrzymane";
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[12px] pb-3 tracking-wide transition-colors border-b-2 -mb-px",
                  filter === f
                    ? "border-charcoal text-charcoal font-medium"
                    : "border-transparent text-warm-gray hover:text-charcoal"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-[13px] text-warm-gray py-12 text-center">
            Brak produktów w tej kategorii.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={setEditingProduct}
              />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/account"
            className="text-[12px] text-warm-gray underline hover:text-charcoal transition-colors"
          >
            ← Powrót do konta
          </Link>
        </div>
      </div>

      {editingProduct && (
        <EditPanel
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSave}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}
    </>
  );
}
