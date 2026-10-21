"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import {
    RiMenuLine,
    RiCloseLine,
} from "@remixicon/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../theme-toggle";
import { MovieSearchDesktop, MovieSearchMobile } from "./movie-search";
import { NavLinks, NavLinksFallback, MobileNavLinks } from "./nav-links";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
                {/* Left: Logo & Nav Links */}
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center transition-transform active:scale-95"
                        aria-label="CINEVA Home"
                    >
                        {/* Dark mode logo (white text) */}
                        <Image
                            src="/images/logo-light.png"
                            alt="CINEVA Cinema Explorer"
                            width={144}
                            height={36}
                            priority
                            className="hidden dark:block h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                        />
                        {/* Light mode logo (dark text) */}
                        <Image
                            src="/images/logo-dark.png"
                            alt="CINEVA Cinema Explorer"
                            width={144}
                            height={36}
                            priority
                            className="block dark:hidden h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
                        />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <Suspense fallback={<NavLinksFallback />}>
                        <NavLinks />
                    </Suspense>
                </div>

                {/* Center / Desktop Search */}
                <div className="hidden md:flex flex-1 max-w-md mx-2">
                    <MovieSearchDesktop />
                </div>

                {/* Right Actions */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <MovieSearchMobile />
                    <ThemeToggle />
                    {/* Mobile Menu Button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        className="size-9 rounded-xl md:hidden"
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    >
                        {mobileMenuOpen ? (
                            <RiCloseLine className="size-4.5" />
                        ) : (
                            <RiMenuLine className="size-4.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 md:hidden"
                    >
                        <Suspense fallback={null}>
                            <MobileNavLinks onClose={() => setMobileMenuOpen(false)} />
                        </Suspense>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
