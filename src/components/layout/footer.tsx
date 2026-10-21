import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-border/60 bg-card py-12 text-muted-foreground transition-colors duration-300">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-8 sm:text-left">
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-block transition-opacity hover:opacity-85"
                        aria-label="CINEVA Home"
                    >
                        {/* Dark mode logo (white text) */}
                        <Image
                            src="/images/logo-light.png"
                            alt="CINEVA"
                            width={124}
                            height={31}
                            className="hidden dark:block h-7 w-auto object-contain"
                        />
                        {/* Light mode logo (dark text) */}
                        <Image
                            src="/images/logo-dark.png"
                            alt="CINEVA"
                            width={124}
                            height={31}
                            className="block dark:hidden h-7 w-auto object-contain"
                        />
                    </Link>
                    <span className="text-xs text-border hidden sm:inline">|</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
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
                    <Link href="/movies" className="hover:text-foreground transition-colors">
                        Movies
                    </Link>
                    <Link href="/tv" className="hover:text-foreground transition-colors">
                        TV Series
                    </Link>
                </div>
            </div>
        </footer>
    );
}
