"use client";

import { RiFilmFill } from "@remixicon/react";
import Link from "next/link";
import { ThemeToggle } from "../theme-toogle";
import { MovieSearchDesktop, MovieSearchMobile } from "./movie-search";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
                {/* Left: Logo & Search directly adjacent */}
                <div className="flex flex-1 items-center gap-4 sm:gap-6 min-w-0">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center gap-2.5 transition-transform active:scale-95"
                        aria-label="CINEVA Home"
                    >
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                            <RiFilmFill className="size-5 transition-transform group-hover:rotate-12" />
                        </div>

                        <div className="flex flex-col">
                            <span className="text-base font-bold tracking-tight text-foreground">
                                CINEVA
                            </span>
                            <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                                Cinema Explorer
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Search (Bersebelahan langsung dengan logo) */}
                    <div className="hidden md:flex flex-1 max-w-xl">
                        <MovieSearchDesktop />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <MovieSearchMobile />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
