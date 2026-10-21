import Link from "next/link";
import Image from "next/image";
import {
    RiHome5Line,
    RiMovie2Line,
    RiTvLine,
} from "@remixicon/react";

export default function NotFound() {
    return (
        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            {/* Ambient Background Glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
            >
                <div className="size-96 rounded-full bg-primary/10 blur-3xl" />
            </div>

            <div className="mx-auto max-w-md">
                {/* Icon Badge */}
                <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-border/80 bg-card/80 p-3 shadow-xl shadow-primary/5 backdrop-blur-sm">
                    <Image
                        src="/images/logo.png"
                        alt="CINEVA Logo"
                        width={56}
                        height={56}
                        className="size-14 object-contain"
                    />
                </div>

                {/* 404 & Heading */}
                <span className="mt-6 inline-block font-mono text-sm font-semibold uppercase tracking-widest text-primary">
                    Error 404
                </span>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Halaman Tidak Ditemukan
                </h1>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Maaf, halaman, film, serial TV, atau tokoh yang Anda cari tidak tersedia,
                    sudah dihapus, atau tautan yang Anda tuju salah.
                </p>

                {/* CTA Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                    >
                        <RiHome5Line className="size-4" />
                        <span>Ke Beranda</span>
                    </Link>
                    <Link
                        href="/movies"
                        className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/50 hover:bg-muted active:scale-95"
                    >
                        <RiMovie2Line className="size-4" />
                        <span>Jelajahi Film</span>
                    </Link>
                    <Link
                        href="/tv"
                        className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-5 py-2.5 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/50 hover:bg-muted active:scale-95"
                    >
                        <RiTvLine className="size-4" />
                        <span>Serial TV</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
