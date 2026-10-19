
"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { RiMoonLine, RiSunLine } from "@remixicon/react";

type ViewTransitionDocument = Document & {
    startViewTransition?: (callback: () => void) => {
        finished: Promise<void>;
    };
};

const emptySubscribe = () => () => {};

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );

    function handleThemeToggle(
        event: React.MouseEvent<HTMLButtonElement>,
    ) {
        const nextTheme =
            resolvedTheme === "dark" ? "light" : "dark";

        const doc = typeof document !== "undefined" ? (document as ViewTransitionDocument) : null;

        // Fallback jika browser belum mendukung View Transition API.
        if (
            !doc?.startViewTransition ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
            setTheme(nextTheme);
            return;
        }

        const x = event.clientX;
        const y = event.clientY;

        document.documentElement.style.setProperty("--ripple-x", `${x}px`);
        document.documentElement.style.setProperty("--ripple-y", `${y}px`);

        try {
            doc.startViewTransition(() => {
                setTheme(nextTheme);
            });
        } catch {
            setTheme(nextTheme);
        }
    }

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="icon"
                disabled
                aria-label="Mengubah tema"
            >
                <RiSunLine className="size-4" />
            </Button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            aria-label={isDark ? "Aktifkan light mode" : "Aktifkan dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            {isDark ? (
                <RiSunLine className="size-4" />
            ) : (
                <RiMoonLine className="size-4" />
            )}
        </Button>
    );
}
