"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function startNavigationProgress() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cineva:navigation-start"));
    }
}

export function stopNavigationProgress() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cineva:navigation-stop"));
    }
}

function NavigationProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [state, setState] = useState<{
        active: boolean;
        progress: number;
        visible: boolean;
    }>({
        active: false,
        progress: 0,
        visible: false,
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const completeTimerRef = useRef<NodeJS.Timeout | null>(null);

    const start = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (completeTimerRef.current) clearTimeout(completeTimerRef.current);

        setState({
            active: true,
            progress: 25,
            visible: true,
        });

        // Secara bertahap menambah persentase selagi halaman memuat data
        timerRef.current = setInterval(() => {
            setState((prev) => {
                if (!prev.active) return prev;
                if (prev.progress >= 85) return prev;
                const increment = Math.max(1.5, (85 - prev.progress) * 0.2);
                return {
                    ...prev,
                    progress: Math.min(85, prev.progress + increment),
                };
            });
        }, 120);
    };

    const finish = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setState((prev) => {
            if (!prev.visible) return prev;
            return {
                active: false,
                progress: 100,
                visible: true,
            };
        });

        // Berikan waktu visual agar progress mencapai 100% sebelum memudar
        completeTimerRef.current = setTimeout(() => {
            setState({
                active: false,
                progress: 0,
                visible: false,
            });
        }, 350);
    };

    // Saat rute selesai berpindah (pathname atau searchParams berubah), selesaikan progress bar
    useEffect(() => {
        finish();
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Ambil elemen <a> terdekat
            const anchor = (e.target as HTMLElement)?.closest?.("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href) return;

            // Lewati anchor halaman saat ini, tab baru, download, atau tombol kombinasi
            if (
                href.startsWith("#") ||
                anchor.target === "_blank" ||
                anchor.hasAttribute("download") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey ||
                e.altKey
            ) {
                return;
            }

            try {
                const targetUrl = new URL(anchor.href, window.location.href);
                const currentUrl = new URL(window.location.href);

                // Jika navigasi ke rute atau query yang berbeda
                if (
                    targetUrl.origin === currentUrl.origin &&
                    (targetUrl.pathname !== currentUrl.pathname ||
                        targetUrl.search !== currentUrl.search)
                ) {
                    start();
                }
            } catch {
                // Abaikan jika parsing URL gagal
            }
        };

        const handleCustomStart = () => {
            start();
        };

        const handleCustomStop = () => {
            finish();
        };

        const handlePopState = () => {
            start();
        };

        document.addEventListener("click", handleClick, { capture: true });
        window.addEventListener("cineva:navigation-start", handleCustomStart);
        window.addEventListener("cineva:navigation-stop", handleCustomStop);
        window.addEventListener("popstate", handlePopState);

        return () => {
            document.removeEventListener("click", handleClick, { capture: true });
            window.removeEventListener("cineva:navigation-start", handleCustomStart);
            window.removeEventListener("cineva:navigation-stop", handleCustomStop);
            window.removeEventListener("popstate", handlePopState);
            if (timerRef.current) clearInterval(timerRef.current);
            if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
        };
    }, []);

    if (!state.visible && state.progress === 0) return null;

    return (
        <div
            className="pointer-events-none fixed top-0 left-0 right-0 z-50 h-[3px] overflow-hidden"
            style={{
                opacity: state.visible ? 1 : 0,
                transition: "opacity 300ms ease-out",
            }}
            aria-hidden="true"
        >
            <div
                className="h-full bg-gradient-to-r from-amber-500 via-primary to-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.9)]"
                style={{
                    width: `${state.progress}%`,
                    transition: state.active
                        ? "width 280ms cubic-bezier(0.16, 1, 0.3, 1)"
                        : "width 200ms ease-out",
                }}
            />
        </div>
    );
}

export default function NavigationProgress() {
    return (
        <Suspense fallback={null}>
            <NavigationProgressBar />
        </Suspense>
    );
}
