
"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { RiMoonLine, RiSunLine } from "@remixicon/react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );

    function handleThemeToggle() {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
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
