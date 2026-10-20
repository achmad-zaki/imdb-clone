"use client";

import MovieCard, { MediaCardItem } from "@/components/movie/movie-card";
import TrailerModal from "@/components/movie/trailer-modal";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Movie } from "@/types/movie";
import { TVShow } from "@/types/tv";
import {
    RiArrowDownSLine,
    RiArrowUpDownLine,
    RiBroadcastLine,
    RiCalendarLine,
    RiCloseLine,
    RiFilter3Line,
    RiFireLine,
    RiLoader4Line,
    RiRestartLine,
    RiStarLine,
    RiTvLine,
} from "@remixicon/react";
import { format, isValid, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

const ALL_TV_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 99, name: "Documentary" },
    { id: 18, name: "Drama" },
    { id: 10751, name: "Family" },
    { id: 10762, name: "Kids" },
    { id: 9648, name: "Mystery" },
    { id: 10763, name: "News" },
    { id: 10764, name: "Reality" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 10766, name: "Soap" },
    { id: 10767, name: "Talk" },
    { id: 10768, name: "War & Politics" },
    { id: 37, name: "Western" },
];

const SORT_OPTIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "popular", label: "Popular", icon: RiFireLine },
    { id: "top_rated", label: "Top Rated", icon: RiStarLine },
    { id: "on_the_air", label: "On The Air", icon: RiBroadcastLine },
];

type TVCatalogViewProps = {
    initialShows: TVShow[];
    currentPage: number;
    totalPages: number;
    currentSort: string;
    currentGenre?: string;
    currentFromDate?: string;
    currentToDate?: string;
    totalResults: number;
};

// Date Picker component using Shadcn Calendar & Popover
function DatePickerField({
    id,
    label,
    value,
    onChange,
    fallbackMonthDate,
    placeholder = "Pick a date",
}: {
    id: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    fallbackMonthDate?: string;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);

    const parsedDate = useMemo(() => {
        if (!value) return undefined;
        try {
            const d = parseISO(value);
            return isValid(d) ? d : undefined;
        } catch {
            return undefined;
        }
    }, [value]);

    const defaultMonth = useMemo(() => {
        if (parsedDate) return parsedDate;
        if (fallbackMonthDate) {
            try {
                const fb = parseISO(fallbackMonthDate);
                if (isValid(fb)) return fb;
            } catch {
                // Ignore parse errors
            }
        }
        return undefined;
    }, [parsedDate, fallbackMonthDate]);

    return (
        <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        id={id}
                        type="button"
                        className={cn(
                            "flex w-full items-center justify-between rounded-xl border border-border/80 bg-background/90 px-3 py-2 text-xs font-medium transition-all hover:border-border focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs cursor-pointer text-left",
                            !value ? "text-muted-foreground" : "text-foreground"
                        )}
                    >
                        <span className="flex items-center gap-2 truncate">
                            <RiCalendarLine className="size-3.5 shrink-0 text-primary" />
                            <span>{parsedDate ? format(parsedDate, "dd MMM yyyy") : placeholder}</span>
                        </span>
                        <RiArrowDownSLine className="size-3.5 shrink-0 text-muted-foreground" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-2 border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl rounded-2xl z-50"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={parsedDate}
                        defaultMonth={defaultMonth}
                        onSelect={(date) => {
                            if (date) {
                                onChange(format(date, "yyyy-MM-dd"));
                            } else {
                                onChange("");
                            }
                            setOpen(false);
                        }}
                    />
                    {value && (
                        <div className="border-t border-border/60 p-2 pt-2 flex justify-between items-center text-xs">
                            <span className="text-muted-foreground text-[11px]">
                                Selected: {parsedDate ? format(parsedDate, "dd MMM yyyy") : ""}
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setOpen(false);
                                }}
                                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default function TVCatalogView({
    initialShows,
    currentPage,
    totalPages,
    currentSort,
    currentGenre = "0",
    currentFromDate = "",
    currentToDate = "",
    totalResults,
}: TVCatalogViewProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Parse comma-separated genre IDs from props
    const parsedGenreIds = useMemo<number[]>(() => {
        if (!currentGenre || currentGenre === "0") return [];
        return currentGenre
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n) && n > 0);
    }, [currentGenre]);

    // Local form state
    const [selectedSort, setSelectedSort] = useState<string>(currentSort || "popular");
    const [selectedGenreIds, setSelectedGenreIds] = useState<number[]>(parsedGenreIds);
    const [fromDate, setFromDate] = useState<string>(currentFromDate || "");
    const [toDate, setToDate] = useState<string>(currentToDate || "");
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);

    // Track previous props to sync state during render (React-recommended pattern, no useEffect needed)
    const [prevProps, setPrevProps] = useState({
        currentSort,
        currentGenre,
        currentFromDate,
        currentToDate,
    });

    if (
        prevProps.currentSort !== currentSort ||
        prevProps.currentGenre !== currentGenre ||
        prevProps.currentFromDate !== currentFromDate ||
        prevProps.currentToDate !== currentToDate
    ) {
        setPrevProps({ currentSort, currentGenre, currentFromDate, currentToDate });
        setSelectedSort(currentSort || "popular");
        setSelectedGenreIds(parsedGenreIds);
        setFromDate(currentFromDate || "");
        setToDate(currentToDate || "");
    }

    // Normalize TVShow to MediaCardItem
    const normalizedShows = useMemo<MediaCardItem[]>(() => {
        return (initialShows || []).map((tv) => ({
            id: tv.id,
            title: tv.name || tv.original_name || "Untitled",
            overview: tv.overview || "",
            poster_path: tv.poster_path,
            backdrop_path: tv.backdrop_path,
            release_date: tv.first_air_date || "",
            vote_average: tv.vote_average || 0,
            vote_count: tv.vote_count || 0,
            genre_ids: tv.genre_ids || [],
            popularity: tv.popularity || 0,
            media_type: "tv" as const,
        }));
    }, [initialShows]);

    // Format human readable date helper
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            const d = parseISO(dateStr);
            return isValid(d) ? format(d, "dd MMM yyyy") : dateStr;
        } catch {
            return dateStr;
        }
    };

    // URL builder
    const buildUrl = (
        page: number,
        sort: string = currentSort,
        genreIds: number[] = selectedGenreIds,
        from: string = fromDate || currentFromDate || "",
        to: string = toDate || currentToDate || ""
    ) => {
        const params = new URLSearchParams();
        if (page > 1) params.set("page", page.toString());
        if (sort && sort !== "popular") params.set("sort", sort);
        if (genreIds.length > 0) params.set("genre", genreIds.join(","));
        if (from && from.trim() !== "") params.set("from", from.trim());
        if (to && to.trim() !== "") params.set("to", to.trim());
        const query = params.toString();
        return query ? `/tv?${query}` : "/tv";
    };

    // Apply filters
    const handleApplyFilters = (
        newGenres = selectedGenreIds,
        newFrom = fromDate,
        newTo = toDate,
        newSort = selectedSort
    ) => {
        const targetUrl = buildUrl(1, newSort, newGenres, newFrom, newTo);
        startTransition(() => {
            router.push(targetUrl);
        });
        setIsMobileFiltersOpen(false);
    };

    // Toggle multi-select genre (applies immediately)
    const toggleGenre = (genreId: number) => {
        const nextGenres = selectedGenreIds.includes(genreId)
            ? selectedGenreIds.filter((id) => id !== genreId)
            : [...selectedGenreIds, genreId];
        setSelectedGenreIds(nextGenres);
        handleApplyFilters(nextGenres, fromDate, toDate, selectedSort);
    };

    // Clear all selected genres
    const handleClearGenres = () => {
        setSelectedGenreIds([]);
        handleApplyFilters([], fromDate, toDate, selectedSort);
    };

    // Active filters evaluation
    const isSortActive = (selectedSort || currentSort || "popular") !== "popular";
    const isGenreActive = selectedGenreIds.length > 0;
    const isDateActive = Boolean(fromDate || toDate || currentFromDate || currentToDate);
    const hasActiveFilters = isSortActive || isGenreActive || isDateActive;
    const activeFiltersCount =
        (isSortActive ? 1 : 0) + selectedGenreIds.length + (isDateActive ? 1 : 0);

    // Handle sort change from Shadcn Select
    const handleSortChange = (newSort: string) => {
        setSelectedSort(newSort);
        handleApplyFilters(selectedGenreIds, fromDate, toDate, newSort);
    };

    const handleResetSort = () => {
        setSelectedSort("popular");
        handleApplyFilters(selectedGenreIds, fromDate, toDate, "popular");
    };

    // Reset all filters
    const handleResetAll = () => {
        setSelectedGenreIds([]);
        setFromDate("");
        setToDate("");
        setSelectedSort("popular");
        const targetUrl = buildUrl(1, "popular", [], "", "");
        startTransition(() => {
            router.push(targetUrl);
        });
        setIsMobileFiltersOpen(false);
    };

    // Remove single genre from active filters
    const handleRemoveSingleGenre = (genreIdToRemove: number) => {
        const nextGenres = selectedGenreIds.filter((id) => id !== genreIdToRemove);
        setSelectedGenreIds(nextGenres);
        handleApplyFilters(nextGenres, fromDate, toDate, selectedSort);
    };

    const handleRemoveDate = () => {
        setFromDate("");
        setToDate("");
        handleApplyFilters(selectedGenreIds, "", "", selectedSort);
    };

    // Quick year presets
    const handleQuickPreset = (year: number) => {
        const from = `${year}-01-01`;
        const to = `${year}-12-31`;
        setFromDate(from);
        setToDate(to);
        handleApplyFilters(selectedGenreIds, from, to);
    };

    // Page numbers calculation
    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];
        const maxShown = 5;

        if (totalPages <= maxShown + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            if (start > 2) pages.push("...");
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    }, [currentPage, totalPages]);

    // Reusable Filter Form Card
    const renderFilterCardContent = (isMobile = false) => (
        <div className="space-y-5">
            {/* Header in sidebar */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                    <RiFilter3Line className="size-4 text-primary" />
                    <span>Filter TV Series</span>
                    {hasActiveFilters && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleResetAll}
                        disabled={isPending}
                        className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <RiRestartLine className="size-3" />
                        <span>Reset</span>
                    </button>
                )}
            </div>

            {/* Filter 1: Sort By using Shadcn Select */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-wide">
                        <RiArrowUpDownLine className="size-3.5 text-primary" />
                        <span>Sort By</span>
                    </label>
                    {isSortActive && (
                        <button
                            type="button"
                            onClick={handleResetSort}
                            className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </div>

                <Select value={selectedSort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full rounded-xl border border-border/80 bg-background/90 px-3 py-2 text-xs font-medium hover:border-border focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer">
                        <SelectValue placeholder="Sort TV series" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="p-1">
                        {SORT_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            return (
                                <SelectItem
                                    key={opt.id}
                                    value={opt.id}
                                    className="cursor-pointer rounded-lg py-2 text-xs font-medium focus:bg-accent focus:text-accent-foreground"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon className="size-3.5 text-primary shrink-0" />
                                        <span>{opt.label}</span>
                                    </span>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            {/* Filter 2: Genre Badges with Flex Wrap (Multi-select) */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-wide">
                        <RiTvLine className="size-3.5 text-primary" />
                        <span>Genres</span>
                        {selectedGenreIds.length > 0 && (
                            <span className="text-[11px] font-normal text-primary">
                                ({selectedGenreIds.length} selected)
                            </span>
                        )}
                    </label>
                    {selectedGenreIds.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearGenres}
                            className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Badges container with flex wrap */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {ALL_TV_GENRES.map((g) => {
                        const isSelected = selectedGenreIds.includes(g.id);
                        return (
                            <button
                                key={g.id}
                                type="button"
                                onClick={() => toggleGenre(g.id)}
                                className={cn(
                                    "inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer select-none",
                                    isSelected
                                        ? "border-primary bg-primary text-primary-foreground shadow-xs shadow-primary/25"
                                        : "border-border/80 bg-background/80 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                <span>{g.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filter 3: Air Date Range using Shadcn Calendar */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground tracking-wide">
                        <RiCalendarLine className="size-3.5 text-primary" />
                        <span>First Air Date (Calendar)</span>
                    </label>
                    {(fromDate || toDate) && (
                        <button
                            type="button"
                            onClick={() => {
                                setFromDate("");
                                setToDate("");
                            }}
                            className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                            Clear dates
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    {/* From date with Shadcn Calendar */}
                    <DatePickerField
                        id={isMobile ? "mobile-tv-date-from" : "desktop-tv-date-from"}
                        label="From (Dari)"
                        value={fromDate}
                        onChange={setFromDate}
                        placeholder="Pick start date"
                    />

                    {/* To date with Shadcn Calendar */}
                    <DatePickerField
                        id={isMobile ? "mobile-tv-date-to" : "desktop-tv-date-to"}
                        label="To (Sampai)"
                        value={toDate}
                        onChange={setToDate}
                        fallbackMonthDate={fromDate}
                        placeholder="Pick end date"
                    />
                </div>

                {/* Quick Year Shortcuts */}
                <div className="pt-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Quick Presets
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {[2025, 2024, 2023, 2022].map((year) => (
                            <button
                                key={year}
                                type="button"
                                onClick={() => handleQuickPreset(year)}
                                className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                                    fromDate === `${year}-01-01` && toDate === `${year}-12-31`
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => handleApplyFilters()}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow-xs shadow-primary/25 hover:bg-primary/90 active:scale-98 transition-all disabled:opacity-60 cursor-pointer"
                >
                    {isPending ? (
                        <>
                            <RiLoader4Line className="size-4 animate-spin" />
                            <span>Applying...</span>
                        </>
                    ) : (
                        <>
                            <RiFilter3Line className="size-4" />
                            <span>Apply Filter</span>
                        </>
                    )}
                </button>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleResetAll}
                        disabled={isPending}
                        className="w-full rounded-xl border border-border/80 bg-muted/40 py-2 px-4 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all text-center cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative mx-auto w-full max-w-6xl min-w-0 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
            {/* Breadcrumb navigation */}
            <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
                <Link href="/" className="hover:text-foreground transition-colors">
                    Home
                </Link>
                <span>/</span>
                <span className="font-medium text-foreground">TV Series</span>
            </nav>

            {/* Header: Title */}
            <div className="border-b border-border/60 pb-6">
                <div className="flex items-center gap-2.5">
                    <div className="h-6 w-1 rounded-full bg-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Explore TV Series
                    </h1>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground pl-3.5">
                    Discover thousands of titles with genre, air date, and sorting filters
                </p>
            </div>

            {/* Mobile Filter Toggle Bar (Visible on mobile/tablet < lg) */}
            <div className="lg:hidden mt-4">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-3 backdrop-blur-xs">
                    <button
                        type="button"
                        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                        className="flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all active:scale-95 cursor-pointer"
                    >
                        <RiFilter3Line className="size-4" />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {activeFiltersCount}
                            </span>
                        )}
                        <RiArrowDownSLine
                            className={`size-4 transition-transform duration-200 ${
                                isMobileFiltersOpen ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* Quick active summary */}
                    <div className="flex items-center gap-2 overflow-hidden text-xs text-muted-foreground">
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="text-xs text-primary font-medium hover:underline cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        ) : (
                            <span className="truncate text-[11px]">Select genres & dates</span>
                        )}
                    </div>
                </div>

                {/* Collapsible Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFiltersOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3 rounded-2xl border border-border/80 bg-card p-4 shadow-md backdrop-blur-md">
                                {renderFilterCardContent(true)}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Content Layout: Left Sidebar + Right Show Grid */}
            <div className="mt-6 sm:mt-8 flex flex-col lg:flex-row gap-8 items-start">
                {/* LEFT SIDEBAR: Desktop Filter Panel */}
                <aside className="hidden lg:block w-72 shrink-0 sticky top-24">
                    <div className="rounded-2xl border border-border/80 bg-card p-5 backdrop-blur-md">
                        {renderFilterCardContent(false)}
                    </div>
                </aside>

                {/* RIGHT CONTENT: Show Grid, Active Filter Chips & Pagination */}
                <section className="flex-1 min-w-0 w-full">
                    {/* Active Filter Chips Bar */}
                    {hasActiveFilters && (
                        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs">
                            <span className="text-muted-foreground font-medium pl-1">Active:</span>

                            {/* Sort Chip */}
                            {isSortActive && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                    <RiArrowUpDownLine className="size-3" />
                                    <span>
                                        Sort:{" "}
                                        {SORT_OPTIONS.find((s) => s.id === (selectedSort || currentSort))?.label ||
                                            (selectedSort || currentSort)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleResetSort}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                                        aria-label="Reset sort to Popular"
                                    >
                                        <RiCloseLine className="size-3.5" />
                                    </button>
                                </span>
                            )}

                            {/* Genre Chips - Individual chip for each selected genre */}
                            {selectedGenreIds.map((gId) => {
                                const genreObj = ALL_TV_GENRES.find((g) => g.id === gId);
                                const label = genreObj ? genreObj.name : `Genre #${gId}`;
                                return (
                                    <span
                                        key={`active-chip-${gId}`}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                                    >
                                        <RiTvLine className="size-3" />
                                        <span>{label}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSingleGenre(gId)}
                                            className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                                            aria-label={`Remove ${label} filter`}
                                        >
                                            <RiCloseLine className="size-3.5" />
                                        </button>
                                    </span>
                                );
                            })}

                            {/* Date Chip */}
                            {isDateActive && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                    <RiCalendarLine className="size-3" />
                                    <span>
                                        {(fromDate || currentFromDate) && (toDate || currentToDate)
                                            ? `${formatDisplayDate(fromDate || currentFromDate || "")} → ${formatDisplayDate(toDate || currentToDate || "")}`
                                            : (fromDate || currentFromDate)
                                                ? `From ${formatDisplayDate(fromDate || currentFromDate || "")}`
                                                : `Until ${formatDisplayDate(toDate || currentToDate || "")}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveDate}
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors cursor-pointer"
                                        aria-label="Remove date filter"
                                    >
                                        <RiCloseLine className="size-3.5" />
                                    </button>
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors pr-1 cursor-pointer"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Results Count & Current Page Summary */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <p>
                            Showing <span className="font-semibold text-foreground">{normalizedShows.length}</span> titles
                            on Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
                            <span className="font-semibold text-foreground">{totalPages.toLocaleString()}</span>
                            {totalResults > 0 && (
                                <span className="ml-1 text-muted-foreground">
                                    ({totalResults.toLocaleString()} total)
                                </span>
                            )}
                        </p>
                        {isPending && (
                            <div className="flex items-center gap-1.5 text-primary">
                                <RiLoader4Line className="size-3.5 animate-spin" />
                                <span>Updating...</span>
                            </div>
                        )}
                    </div>

                    {/* TV Shows Grid / Empty State */}
                    <div className={`transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
                        <AnimatePresence mode="wait">
                            {normalizedShows.length > 0 ? (
                                <motion.div
                                    key={`${currentSort}-${currentGenre}-${currentFromDate}-${currentToDate}-${currentPage}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                    className="w-full"
                                >
                                    <div className="grid grid-cols-2 gap-x-3.5 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full min-w-0">
                                        {normalizedShows.map((tv, index) => (
                                            <MovieCard
                                                key={tv.id}
                                                movie={tv}
                                                priority={index < 4}
                                                onPlayTrailer={(m) => setActiveTrailerMovie(m)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty-state"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center"
                                >
                                    <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <RiTvLine className="size-6" />
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold text-foreground">
                                        No TV series found
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                        We couldn&apos;t find any TV series matching your selected genres or air date
                                        criteria. Try adjusting your filters.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResetAll}
                                        className="mt-5 rounded-full border border-border/80 bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 shadow-xs cursor-pointer"
                                    >
                                        Reset All Filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="mt-12 sm:mt-16 flex flex-col items-center justify-center gap-4 border-t border-border/60 pt-8">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {/* Prev Button */}
                                {currentPage > 1 ? (
                                    <Link
                                        href={buildUrl(currentPage - 1, currentSort, parsedGenreIds, currentFromDate, currentToDate)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-primary active:scale-95"
                                        aria-label="Previous page"
                                    >
                                        <FaChevronLeft className="size-3" />
                                        <span className="hidden sm:inline">Prev</span>
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 text-xs font-medium text-muted-foreground/50 cursor-not-allowed opacity-50"
                                        aria-label="Previous page (disabled)"
                                    >
                                        <FaChevronLeft className="size-3" />
                                        <span className="hidden sm:inline">Prev</span>
                                    </button>
                                )}

                                {/* Page Number Pills */}
                                <div className="flex items-center gap-1">
                                    {pageNumbers.map((p, idx) => {
                                        if (typeof p === "string") {
                                            return (
                                                <span
                                                    key={`ellipsis-${idx}`}
                                                    className="flex h-9 w-7 items-center justify-center text-xs text-muted-foreground"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }

                                        const isCurrent = p === currentPage;
                                        return isCurrent ? (
                                            <span
                                                key={p}
                                                className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20"
                                                aria-current="page"
                                            >
                                                {p}
                                            </span>
                                        ) : (
                                            <Link
                                                key={p}
                                                href={buildUrl(p, currentSort, parsedGenreIds, currentFromDate, currentToDate)}
                                                className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-95"
                                            >
                                                {p}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Next Button */}
                                {currentPage < totalPages ? (
                                    <Link
                                        href={buildUrl(currentPage + 1, currentSort, parsedGenreIds, currentFromDate, currentToDate)}
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/80 bg-card px-3 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted hover:text-primary active:scale-95"
                                        aria-label="Next page"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <FaChevronRight className="size-3" />
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/40 bg-muted/40 px-3 text-xs font-medium text-muted-foreground/50 cursor-not-allowed opacity-50"
                                        aria-label="Next page (disabled)"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <FaChevronRight className="size-3" />
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                                <span className="font-medium text-foreground">{totalPages.toLocaleString()}</span>
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Trailer Modal */}
            <TrailerModal
                movie={activeTrailerMovie}
                isOpen={!!activeTrailerMovie}
                onClose={() => setActiveTrailerMovie(null)}
            />
        </div>
    );
}
