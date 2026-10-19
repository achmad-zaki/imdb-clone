import Link from "next/link";
import { RiFilmFill } from "@remixicon/react";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-border/60 bg-card py-12 text-muted-foreground transition-colors duration-300">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-8 sm:text-left">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                        <RiFilmFill className="size-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-foreground">
                        CINEVA
                    </span>
                    <span className="text-xs text-border">|</span>
                    <span className="text-xs text-muted-foreground">
                        Cinema Explorer Platform
                    </span>
                </div>

                <p className="text-xs text-muted-foreground">
                    Data powered by{" "}
                    <a
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground hover:text-primary underline underline-offset-2 transition-colors"
                    >
                        TMDb API
                    </a>
                    . Designed with modern cinematic aesthetics.
                </p>

                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                    </Link>
                    <a href="#popular-movies" className="hover:text-foreground transition-colors">
                        Popular Movies
                    </a>
                </div>
            </div>
        </footer>
    );
}
