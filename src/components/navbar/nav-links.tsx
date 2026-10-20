"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    RiHome5Line,
    RiMovie2Line,
    RiTvLine,
} from "@remixicon/react";
import { cn } from "@/lib/utils";

export function NavLinksFallback() {
    return (
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <Link
                href="/movies"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
            >
                <RiMovie2Line className="size-3.5" />
                <span>Movies</span>
            </Link>
            <Link
                href="/tv"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200"
            >
                <RiTvLine className="size-3.5" />
                <span>TV Series</span>
            </Link>
        </nav>
    );
}

export function NavLinks() {
    const pathname = usePathname();
    const isMoviesActive = pathname === "/movies" || pathname.startsWith("/movie");
    const isTvActive = pathname.startsWith("/tv");

    return (
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <Link
                href="/movies"
                className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    isMoviesActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
            >
                <RiMovie2Line className="size-3.5" />
                <span>Movies</span>
            </Link>
            <Link
                href="/tv"
                className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    isTvActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
            >
                <RiTvLine className="size-3.5" />
                <span>TV Series</span>
            </Link>
        </nav>
    );
}

export function MobileNavLinks({ onClose }: { onClose: () => void }) {
    const pathname = usePathname();
    const isMoviesActive = pathname === "/movies" || pathname.startsWith("/movie");
    const isTvActive = pathname.startsWith("/tv");

    return (
        <div className="space-y-1">
            <Link
                href="/"
                onClick={onClose}
                className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/"
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
            >
                <RiHome5Line className="size-4" />
                <span>Home</span>
            </Link>
            <Link
                href="/movies"
                onClick={onClose}
                className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isMoviesActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
            >
                <RiMovie2Line className="size-4" />
                <span>Movies</span>
            </Link>
            <Link
                href="/tv"
                onClick={onClose}
                className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isTvActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
            >
                <RiTvLine className="size-4" />
                <span>TV Series</span>
            </Link>
        </div>
    );
}
