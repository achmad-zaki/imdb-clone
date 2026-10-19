import Link from "next/link";
import { RiFilmFill } from "@remixicon/react";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-12 text-zinc-500">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-8 sm:text-left">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-300">
                        <RiFilmFill className="size-4" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-zinc-300">
                        CINEVA
                    </span>
                    <span className="text-xs text-zinc-600">|</span>
                    <span className="text-xs text-zinc-500">
                        Minimalist Movie Platform
                    </span>
                </div>

                <p className="text-xs text-zinc-500">
                    Data bersumber dari{" "}
                    <a
                        href="https://www.themoviedb.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2"
                    >
                        TMDb API
                    </a>
                    . Didesain dengan estetika sinematik minimalis.
                </p>

                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <Link href="/" className="hover:text-zinc-300 transition">
                        Beranda
                    </Link>
                    <a href="#jelajahi-film" className="hover:text-zinc-300 transition">
                        Pencarian
                    </a>
                </div>
            </div>
        </footer>
    );
}
