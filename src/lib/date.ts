/**
 * Utility functions for date formatting.
 */

export const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

export type FormatDateOptions = {
    /** Format as full month name ("January") or 3-letter abbreviation ("Jan") */
    monthFormat?: "long" | "short";
    /** Output month name in lowercase (e.g. "01 january 1973") */
    lowercaseMonth?: boolean;
};

/**
 * Format date string (e.g. "YYYY-MM-DD") into "DD Month YYYY".
 * Example: "1973-01-08" -> "08 January 1973"
 *
 * Designed to be timezone-independent to prevent day shifting on pure date strings.
 */
export function formatDate(
    dateString?: string | null,
    options?: FormatDateOptions
): string {
    if (!dateString) return "";

    const clean = dateString.trim().split("T")[0];
    const parts = clean.split("-");

    if (parts.length === 3) {
        const year = parts[0];
        const monthNum = parseInt(parts[1], 10);
        const dayNum = parseInt(parts[2], 10);

        if (!isNaN(monthNum) && !isNaN(dayNum) && monthNum >= 1 && monthNum <= 12) {
            const day = String(dayNum).padStart(2, "0");
            let month = MONTH_NAMES[monthNum - 1] as string;

            if (options?.monthFormat === "short") {
                month = month.slice(0, 3);
            }
            if (options?.lowercaseMonth) {
                month = month.toLowerCase();
            }

            return `${day} ${month} ${year}`;
        }
    }

    // Fallback parsing for other date string formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    let month = MONTH_NAMES[date.getMonth()] as string;

    if (options?.monthFormat === "short") {
        month = month.slice(0, 3);
    }
    if (options?.lowercaseMonth) {
        month = month.toLowerCase();
    }
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
}
