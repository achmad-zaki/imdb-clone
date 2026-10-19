"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    RiArrowDownSLine,
    RiArrowLeftLine,
    RiBuildingLine,
    RiCheckLine,
    RiCloseLine,
    RiFilmLine,
    RiFireLine,
    RiGlobalLine,
    RiHashtag,
    RiLoader4Line,
    RiSearchLine,
    RiStarFill,
    RiTvLine,
    RiUserStarLine,
} from "@remixicon/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";

export type SearchCategory =
    | "all"
    | "titles"
    | "tv"
    | "celebs"
    | "companies"
    | "keywords";

export type SearchResultItem = {
    id: number;
    type: "movie" | "tv" | "person" | "company" | "keyword";
    title: string;
    subtitle?: string | null;
    year?: string | null;
    rating?: number | null;
    image?: string | null;
    overview?: string | null;
    badge: string;
    extra?: string | null;
};

export type CategoryOption = {
    id: SearchCategory;
    label: string;
    description: string;
    placeholder: string;
    icon: typeof RiGlobalLine;
};

export const SEARCH_CATEGORIES: CategoryOption[] = [
    {
        id: "all",
        label: "All",
        description: "Semua Kategori",
        placeholder: "Cari di CINEVA (Film, TV, Artis...)",
        icon: RiGlobalLine,
    },
    {
        id: "titles",
        label: "Titles",
        description: "Film & Serial",
        placeholder: "Cari judul film & serial...",
        icon: RiFilmLine,
    },
    {
        id: "tv",
        label: "TV Episodes",
        description: "Episode & Serial TV",
        placeholder: "Cari episode & serial TV...",
        icon: RiTvLine,
    },
    {
        id: "celebs",
        label: "Celebs",
        description: "Aktor, Aktris & Kru",
        placeholder: "Cari aktor, aktris, sutradara...",
        icon: RiUserStarLine,
    },
    {
        id: "companies",
        label: "Companies",
        description: "Studio & Perusahaan",
        placeholder: "Cari studio & rumah produksi...",
        icon: RiBuildingLine,
    },
    {
        id: "keywords",
        label: "Keywords",
        description: "Kata Kunci & Topik",
        placeholder: "Cari topik atau kata kunci...",
        icon: RiHashtag,
    },
];

const POPULAR_SEARCHES = [
    "Interstellar",
    "Dune",
    "Oppenheimer",
    "Spider-Man",
    "The Dark Knight",
    "Avengers",
    "Inception",
    "Avatar",
];

const emptySubscribe = () => () => {};

export function useIsClient() {
    return useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );
}

function formatRating(rating: number | undefined | null) {
    if (typeof rating !== "number" || rating <= 0) return null;
    return rating.toFixed(1);
}

function ItemThumbnail({
    image,
    title,
    type,
    className,
}: {
    image?: string | null;
    title: string;
    type: SearchResultItem["type"];
    className?: string;
}) {
    const [hasError, setHasError] = useState(false);

    if (!image || hasError) {
        return (
            <div
                className={cn(
                    "flex shrink-0 items-center justify-center bg-muted/80 text-muted-foreground",
                    type === "person" ? "rounded-full" : "rounded-md",
                    className,
                )}
            >
                {type === "person" ? (
                    <RiUserStarLine className="size-4 opacity-60" />
                ) : type === "company" ? (
                    <RiBuildingLine className="size-4 opacity-60" />
                ) : type === "keyword" ? (
                    <RiHashtag className="size-4 opacity-60" />
                ) : type === "tv" ? (
                    <RiTvLine className="size-4 opacity-60" />
                ) : (
                    <RiFilmLine className="size-4 opacity-60" />
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "relative shrink-0 overflow-hidden bg-muted",
                type === "person" ? "rounded-full" : "rounded-md",
                className,
            )}
        >
            <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 80px, 60px"
                className={cn(
                    "object-cover transition-transform duration-300 group-hover:scale-105",
                    type === "company" && "object-contain p-1 bg-white/5",
                )}
                onError={() => setHasError(true)}
            />
        </div>
    );
}

export function useMovieSearch() {
    const [category, setCategory] = useState<SearchCategory>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [fetchedResults, setFetchedResults] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Results is empty when query is empty, otherwise uses fetchedResults
    const results = debouncedQuery ? fetchedResults : [];

    // Debounce query input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 280);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch live TMDB results based on query & category
    useEffect(() => {
        if (!debouncedQuery) {
            return;
        }

        let ignore = false;
        const controller = new AbortController();

        fetch(
            `/api/search?q=${encodeURIComponent(debouncedQuery)}&cat=${category}`,
            {
                signal: controller.signal,
            },
        )
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("Gagal mengambil data dari server");
                }
                return res.json();
            })
            .then((data) => {
                if (!ignore) {
                    setFetchedResults(data.results || []);
                    setError(null);
                    setIsLoading(false);
                }
            })
            .catch((err: unknown) => {
                if ((err as Error)?.name !== "AbortError" && !ignore) {
                    setError("Gagal memuat hasil pencarian. Coba lagi.");
                    setIsLoading(false);
                }
            });

        return () => {
            ignore = true;
            controller.abort();
        };
    }, [debouncedQuery, category]);

    const handleQueryChange = useCallback((val: string) => {
        setSearchQuery(val);
        if (val.trim()) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
            setFetchedResults([]);
            setError(null);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery("");
        setDebouncedQuery("");
        setFetchedResults([]);
        setError(null);
        setIsLoading(false);
    }, []);

    const selectPopularSearch = useCallback((term: string) => {
        setSearchQuery(term);
        setDebouncedQuery(term);
        setIsLoading(true);
    }, []);

    const isSearching =
        (searchQuery.trim() !== "" && searchQuery.trim() !== debouncedQuery) ||
        isLoading;

    const currentCategoryOption =
        SEARCH_CATEGORIES.find((c) => c.id === category) || SEARCH_CATEGORIES[0];

    return {
        category,
        setCategory,
        currentCategoryOption,
        searchQuery,
        debouncedQuery,
        results,
        isLoading,
        isSearching,
        error,
        handleQueryChange,
        clearSearch,
        selectPopularSearch,
    };
}

/**
 * Desktop Navbar Search Bar with IMDb-style Category Selector & Live Dropdown
 */
export function MovieSearchDesktop() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const categoryMenuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const isClient = useIsClient();

    const {
        category,
        setCategory,
        currentCategoryOption,
        searchQuery,
        debouncedQuery,
        results,
        isSearching,
        error,
        handleQueryChange,
        clearSearch,
        selectPopularSearch,
    } = useMovieSearch();

    // Reset selection index when results change
    const [prevResults, setPrevResults] = useState(results);
    if (results !== prevResults) {
        setPrevResults(results);
        setSelectedIndex(-1);
    }

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                containerRef.current &&
                !containerRef.current.contains(target) &&
                (!categoryMenuRef.current || !categoryMenuRef.current.contains(target))
            ) {
                setIsSearchOpen(false);
                setIsCategoryOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Global shortcut: ⌘K or Ctrl+K or / to focus search
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
                setIsSearchOpen(true);
            } else if (
                e.key === "/" &&
                document.activeElement?.tagName !== "INPUT" &&
                document.activeElement?.tagName !== "TEXTAREA"
            ) {
                e.preventDefault();
                inputRef.current?.focus();
                setIsSearchOpen(true);
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () =>
            window.removeEventListener("keydown", handleGlobalKeyDown);
    }, []);

    const handleClose = useCallback(() => {
        setIsSearchOpen(false);
        setIsCategoryOpen(false);
        setSelectedIndex(-1);
    }, []);

    const handleSelectResult = useCallback(
        (item: SearchResultItem) => {
            if (item.type === "movie" || item.type === "tv") {
                router.push(`/movie/${item.id}`);
                handleClose();
                inputRef.current?.blur();
            } else if (item.type === "keyword") {
                // If user clicks a keyword, search for it under titles or all
                setCategory("titles");
                handleQueryChange(item.title);
                inputRef.current?.focus();
            } else if (item.type === "person" || item.type === "company") {
                // Search for that person's or company's works
                handleQueryChange(item.title);
                inputRef.current?.focus();
            }
        },
        [router, handleClose, setCategory, handleQueryChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            e.preventDefault();
            handleClose();
            inputRef.current?.blur();
            return;
        }

        if (!isSearchOpen) {
            setIsSearchOpen(true);
        }

        if (results.length > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < results.length - 1 ? prev + 1 : 0,
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : results.length - 1,
                );
            } else if (e.key === "Enter") {
                e.preventDefault();
                const target =
                    selectedIndex >= 0 ? results[selectedIndex] : results[0];
                if (target) {
                    handleSelectResult(target);
                }
            }
        }
    };

    const isMac =
        isClient &&
        typeof navigator !== "undefined" &&
        /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);

    const CurrentCategoryIcon = currentCategoryOption.icon;

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input Bar with integrated IMDb-like Category Dropdown */}
            <div
                className={cn(
                    "group relative flex h-10 w-full items-center rounded-full border border-border/70 bg-muted/40 text-sm transition-all duration-200",
                    "hover:border-border hover:bg-muted/60",
                    "focus-within:border-primary/70 focus-within:bg-background focus-within:ring-3 focus-within:ring-primary/20",
                    isSearchOpen &&
                        "border-primary/70 bg-background ring-3 ring-primary/20 shadow-md",
                )}
            >
                {/* Category Button (Dropdown Trigger) */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCategoryOpen((prev) => !prev);
                        if (isSearchOpen) setIsSearchOpen(false);
                    }}
                    className={cn(
                        "flex h-full shrink-0 items-center gap-1.5 rounded-l-full pl-3.5 pr-2.5 text-xs font-semibold text-foreground/90 transition-colors",
                        "hover:bg-muted hover:text-foreground active:scale-95",
                        isCategoryOpen && "bg-muted text-primary",
                    )}
                    aria-label="Pilih kategori pencarian"
                    aria-expanded={isCategoryOpen}
                >
                    <CurrentCategoryIcon className="size-3.5 text-primary" />
                    <span className="whitespace-nowrap">
                        {currentCategoryOption.label}
                    </span>
                    <RiArrowDownSLine
                        className={cn(
                            "size-3.5 text-muted-foreground transition-transform duration-200",
                            isCategoryOpen && "rotate-180 text-foreground",
                        )}
                    />
                </button>

                {/* Subtle vertical separator */}
                <div className="h-4 w-px shrink-0 bg-border/80" />

                {/* Search icon / loader */}
                <div className="flex shrink-0 items-center pl-2.5">
                    {isSearching ? (
                        <RiLoader4Line className="size-4 animate-spin text-primary" />
                    ) : (
                        <RiSearchLine className="size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    )}
                </div>

                {/* Search Text Input */}
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    value={searchQuery}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onFocus={() => {
                        setIsSearchOpen(true);
                        setIsCategoryOpen(false);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={currentCategoryOption.placeholder}
                    aria-label="Cari film"
                    aria-expanded={isSearchOpen}
                    aria-controls="desktop-search-dropdown"
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                />

                {/* Clear Button or Keyboard Shortcut */}
                <div className="flex shrink-0 items-center pr-3">
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => {
                                clearSearch();
                                inputRef.current?.focus();
                            }}
                            className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="Hapus pencarian"
                        >
                            <RiCloseLine className="size-3.5" />
                        </button>
                    ) : (
                        <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border border-border/80 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-xs lg:inline-flex">
                            {isMac ? "⌘K" : "Ctrl+K"}
                        </kbd>
                    )}
                </div>
            </div>

            {/* Category Dropdown Menu */}
            <AnimatePresence>
                {isCategoryOpen && (
                    <motion.div
                        ref={categoryMenuRef}
                        key="desktop-category-dropdown"
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border/80 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Kategori Pencarian
                        </div>
                        <div className="space-y-0.5">
                            {SEARCH_CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = cat.id === category;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setCategory(cat.id);
                                            setIsCategoryOpen(false);
                                            inputRef.current?.focus();
                                            setIsSearchOpen(true);
                                        }}
                                        className={cn(
                                            "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                                            isSelected
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-foreground hover:bg-muted/70",
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className={cn(
                                                    "flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground",
                                                )}
                                            >
                                                <Icon className="size-3.5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {cat.label}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    {cat.description}
                                                </div>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <RiCheckLine className="size-4 shrink-0 text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Dropdown Menu */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        id="desktop-search-dropdown"
                        key="desktop-search-dropdown"
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 z-50 mt-2 flex max-h-[480px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-xl"
                    >
                        {/* Quick Category Chips bar inside dropdown */}
                        <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/20 px-3 py-2 overflow-x-auto no-scrollbar">
                            <span className="text-[11px] font-medium text-muted-foreground shrink-0 pr-1">
                                Filter:
                            </span>
                            {SEARCH_CATEGORIES.map((cat) => {
                                const isSelected = cat.id === category;
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => {
                                            setCategory(cat.id);
                                            inputRef.current?.focus();
                                        }}
                                        className={cn(
                                            "flex items-center gap-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                                            isSelected
                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="size-3" />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            {/* State 1: Belum ada input kata kunci -> Pencarian Populer */}
                            {!searchQuery.trim() && (
                                <div className="p-2 space-y-2.5">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        <RiFireLine className="size-3.5 text-primary" />
                                        <span>Pencarian Populer</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {POPULAR_SEARCHES.map((term) => (
                                            <button
                                                key={term}
                                                type="button"
                                                onClick={() => {
                                                    selectPopularSearch(term);
                                                    inputRef.current?.focus();
                                                }}
                                                className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95"
                                            >
                                                <RiSearchLine className="size-3 text-muted-foreground" />
                                                <span>{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* State 2: Sedang mencari awal */}
                            {isSearching && results.length === 0 && (
                                <div className="space-y-2 p-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <RiLoader4Line className="size-3.5 animate-spin text-primary" />
                                        <span>
                                            Mencari di {currentCategoryOption.label}...
                                        </span>
                                    </div>
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex animate-pulse items-center gap-3 rounded-xl p-2"
                                        >
                                            <div className="h-14 w-10 shrink-0 rounded-md bg-muted" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3.5 w-3/4 rounded bg-muted" />
                                                <div className="h-3 w-1/3 rounded bg-muted/70" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* State 3: Ada hasil pencarian */}
                            {results.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground">
                                        <span>
                                            Hasil untuk {currentCategoryOption.label} (
                                            {results.length})
                                        </span>
                                        {isSearching && (
                                            <span className="flex items-center gap-1 text-primary">
                                                <RiLoader4Line className="size-3 animate-spin" />
                                                Memperbarui...
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col space-y-0.5">
                                        {results.map((item, index) => {
                                            const rating = formatRating(item.rating);
                                            const isSelected =
                                                selectedIndex === index;

                                            const isLinkable =
                                                item.type === "movie" || item.type === "tv";

                                            const content = (
                                                <div
                                                    onMouseEnter={() =>
                                                        setSelectedIndex(index)
                                                    }
                                                    onClick={() =>
                                                        handleSelectResult(item)
                                                    }
                                                    className={cn(
                                                        "group flex cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors",
                                                        isSelected
                                                            ? "bg-accent text-accent-foreground"
                                                            : "hover:bg-muted/60",
                                                    )}
                                                >
                                                    <ItemThumbnail
                                                        image={item.image}
                                                        title={item.title}
                                                        type={item.type}
                                                        className={cn(
                                                            item.type === "person"
                                                                ? "size-12 rounded-full border border-border/60"
                                                                : item.type === "company"
                                                                  ? "size-12 rounded-lg border border-border/50"
                                                                  : item.type === "keyword"
                                                                    ? "size-10 rounded-lg border border-border/50"
                                                                    : "h-14 w-10 rounded-md border border-border/50 shadow-xs",
                                                        )}
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {item.title}
                                                            </p>
                                                            <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                                {item.badge}
                                                            </span>
                                                        </div>

                                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            {item.year && (
                                                                <span>{item.year}</span>
                                                            )}
                                                            {item.year && rating && (
                                                                <span>·</span>
                                                            )}
                                                            {rating && (
                                                                <span className="flex items-center gap-1 font-medium text-amber-500">
                                                                    <RiStarFill className="size-3" />
                                                                    {rating}
                                                                </span>
                                                            )}
                                                            {item.subtitle && (
                                                                <span>
                                                                    {item.subtitle}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {item.extra && (
                                                            <p className="mt-0.5 line-clamp-1 text-xs text-primary/80">
                                                                {item.extra}
                                                            </p>
                                                        )}

                                                        {item.overview && (
                                                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground/80">
                                                                {item.overview}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );

                                            if (isLinkable) {
                                                return (
                                                    <Link
                                                        key={`${item.type}-${item.id}`}
                                                        href={`/movie/${item.id}`}
                                                        onClick={handleClose}
                                                    >
                                                        {content}
                                                    </Link>
                                                );
                                            }

                                            return (
                                                <div key={`${item.type}-${item.id}`}>
                                                    {content}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* State 4: Tidak ada hasil */}
                            {!isSearching &&
                                debouncedQuery &&
                                results.length === 0 &&
                                !error && (
                                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                        <RiFilmLine className="mb-2 size-8 opacity-60" />
                                        <p className="text-sm font-medium text-foreground">
                                            Tidak ditemukan di {currentCategoryOption.label}
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Tidak ada hasil untuk &ldquo;
                                            {debouncedQuery}&rdquo;. Coba ganti
                                            kategori ke &ldquo;All&rdquo; atau gunakan kata
                                            kunci lain.
                                        </p>
                                    </div>
                                )}

                            {/* State 5: Error */}
                            {error && (
                                <div className="p-4 text-center text-xs text-destructive">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                            <span>Tekan ↑ ↓ untuk memilih, ↵ untuk membuka</span>
                            <kbd className="rounded border border-border/70 bg-background px-1.5 py-0.5 font-mono text-[10px]">
                                ESC
                            </kbd>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Mobile Search Trigger and Fullscreen Modal with Category Chips
 */
export function MovieSearchMobile() {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isClient = useIsClient();
    const router = useRouter();

    const {
        category,
        setCategory,
        currentCategoryOption,
        searchQuery,
        debouncedQuery,
        results,
        isSearching,
        error,
        handleQueryChange,
        clearSearch,
        selectPopularSearch,
    } = useMovieSearch();

    // Body scroll lock & Escape key
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = useCallback(() => {
        setIsOpen(false);
        clearSearch();
    }, [clearSearch]);

    const handleSelectPopular = (term: string) => {
        selectPopularSearch(term);
        inputRef.current?.focus();
    };

    const handleSelectResult = (item: SearchResultItem) => {
        if (item.type === "movie" || item.type === "tv") {
            router.push(`/movie/${item.id}`);
            handleClose();
        } else if (item.type === "keyword") {
            setCategory("titles");
            handleQueryChange(item.title);
        } else if (item.type === "person" || item.type === "company") {
            handleQueryChange(item.title);
        }
    };

    return (
        <>
            {/* Mobile search trigger button */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Buka pencarian film"
                onClick={handleOpen}
                className="size-9 rounded-xl md:hidden"
            >
                <RiSearchLine className="size-4.5" />
            </Button>

            {/* Portal modal to avoid backdrop-blur containing block bug */}
            {isClient &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                key="mobile-search-modal"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 flex flex-col bg-background text-foreground md:hidden"
                            >
                                {/* Header Bar */}
                                <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 px-3 backdrop-blur-md">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleClose}
                                        aria-label="Tutup pencarian"
                                        className="size-9 shrink-0 rounded-xl"
                                    >
                                        <RiArrowLeftLine className="size-5" />
                                    </Button>

                                    <div className="flex h-10 flex-1 items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 focus-within:border-primary/70 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20">
                                        <RiSearchLine className="size-4 shrink-0 text-muted-foreground" />
                                        <input
                                            ref={inputRef}
                                            autoFocus
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) =>
                                                handleQueryChange(e.target.value)
                                            }
                                            placeholder={currentCategoryOption.placeholder}
                                            aria-label="Cari di CINEVA"
                                            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                                        />

                                        {isSearching ? (
                                            <RiLoader4Line className="size-4 shrink-0 animate-spin text-primary" />
                                        ) : searchQuery ? (
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                                                aria-label="Hapus teks"
                                            >
                                                <RiCloseLine className="size-3.5" />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Category Filter Chips (All, Titles, TV Episodes, Celebs, Companies, Keywords) */}
                                <div className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-2.5 overflow-x-auto no-scrollbar">
                                    {SEARCH_CATEGORIES.map((cat) => {
                                        const isSelected = cat.id === category;
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setCategory(cat.id)}
                                                className={cn(
                                                    "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                                                )}
                                            >
                                                <Icon className="size-3.5" />
                                                <span>{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Content Body */}
                                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                                    {/* State 1: Belum ada input -> Pencarian Populer */}
                                    {!searchQuery.trim() && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                <RiFireLine className="size-3.5 text-primary" />
                                                <span>Pencarian Populer</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {POPULAR_SEARCHES.map((term) => (
                                                    <button
                                                        key={term}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectPopular(term)
                                                        }
                                                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary active:scale-95"
                                                    >
                                                        <RiSearchLine className="size-3 text-muted-foreground" />
                                                        <span>{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* State 2: Sedang mencari */}
                                    {isSearching && results.length === 0 && (
                                        <div className="space-y-3">
                                            <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <RiLoader4Line className="size-3.5 animate-spin text-primary" />
                                                <span>
                                                    Mencari di {currentCategoryOption.label}...
                                                </span>
                                            </p>
                                            {Array.from({ length: 4 }).map(
                                                (_, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex animate-pulse items-center gap-3 rounded-xl border border-border/40 p-2.5"
                                                    >
                                                        <div className="h-16 w-11 shrink-0 rounded-lg bg-muted" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-3.5 w-3/4 rounded bg-muted" />
                                                            <div className="h-3 w-1/3 rounded bg-muted/70" />
                                                            <div className="h-2.5 w-1/2 rounded bg-muted/50" />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}

                                    {/* State 3: Hasil pencarian */}
                                    {results.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between pb-1 text-xs text-muted-foreground">
                                                <span>
                                                    Hasil untuk {currentCategoryOption.label} (
                                                    {results.length})
                                                </span>
                                                {isSearching && (
                                                    <span className="flex items-center gap-1 text-primary">
                                                        <RiLoader4Line className="size-3 animate-spin" />
                                                        Memperbarui...
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1.5">
                                                {results.map((item) => {
                                                    const rating = formatRating(
                                                        item.rating,
                                                    );
                                                    const isLinkable =
                                                        item.type === "movie" ||
                                                        item.type === "tv";

                                                    const card = (
                                                        <div
                                                            onClick={() =>
                                                                handleSelectResult(
                                                                    item,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-card/60 p-2.5 transition-all active:scale-[0.99] active:bg-accent"
                                                        >
                                                            <ItemThumbnail
                                                                image={item.image}
                                                                title={item.title}
                                                                type={item.type}
                                                                className={cn(
                                                                    item.type ===
                                                                        "person"
                                                                        ? "size-12 rounded-full border border-border/60"
                                                                        : item.type ===
                                                                            "company"
                                                                          ? "size-12 rounded-lg border border-border/50"
                                                                          : item.type ===
                                                                              "keyword"
                                                                            ? "size-10 rounded-lg border border-border/50"
                                                                            : "h-16 w-11 rounded-lg border border-border/50 shadow-xs",
                                                                )}
                                                            />

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                                        {item.title}
                                                                    </p>
                                                                    <span className="shrink-0 rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                                        {item.badge}
                                                                    </span>
                                                                </div>

                                                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                    {item.year && (
                                                                        <span>
                                                                            {item.year}
                                                                        </span>
                                                                    )}
                                                                    {item.year &&
                                                                        rating && (
                                                                            <span>
                                                                                ·
                                                                            </span>
                                                                        )}
                                                                    {rating && (
                                                                        <span className="flex items-center gap-1 font-medium text-amber-500">
                                                                            <RiStarFill className="size-3" />
                                                                            {rating}
                                                                        </span>
                                                                    )}
                                                                    {item.subtitle && (
                                                                        <span>
                                                                            {
                                                                                item.subtitle
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {item.extra && (
                                                                    <p className="mt-0.5 line-clamp-1 text-xs text-primary/80">
                                                                        {item.extra}
                                                                    </p>
                                                                )}

                                                                {item.overview && (
                                                                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground/80">
                                                                        {item.overview}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );

                                                    if (isLinkable) {
                                                        return (
                                                            <Link
                                                                key={`${item.type}-${item.id}`}
                                                                href={`/movie/${item.id}`}
                                                                onClick={handleClose}
                                                            >
                                                                {card}
                                                            </Link>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={`${item.type}-${item.id}`}
                                                        >
                                                            {card}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* State 4: Tidak ada hasil */}
                                    {!isSearching &&
                                        debouncedQuery &&
                                        results.length === 0 &&
                                        !error && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                                <RiFilmLine className="mb-2 size-10 opacity-50" />
                                                <p className="text-sm font-semibold text-foreground">
                                                    Tidak ditemukan di {currentCategoryOption.label}
                                                </p>
                                                <p className="mt-1 max-w-xs text-xs">
                                                    Tidak ada hasil untuk &ldquo;
                                                    {debouncedQuery}&rdquo;. Coba
                                                    kategori &ldquo;All&rdquo; atau kata
                                                    kunci lain.
                                                </p>
                                            </div>
                                        )}

                                    {/* State 5: Error */}
                                    {error && (
                                        <div className="p-4 text-center text-xs text-destructive">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
