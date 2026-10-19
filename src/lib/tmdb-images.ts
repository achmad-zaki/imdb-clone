const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const FALLBACK_POSTER =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22500%22%20height%3D%22750%22%20viewBox%3D%220%200%20500%20750%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%2318181b%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%2371717a%22%20font-family%3D%22system-ui%2C%20sans-serif%22%20font-size%3D%2220%22%3ENo%20Poster%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";

const FALLBACK_BACKDROP =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221920%22%20height%3D%221080%22%20viewBox%3D%220%200%201920%201080%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%2309090b%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%2352525b%22%20font-family%3D%22system-ui%2C%20sans-serif%22%20font-size%3D%2228%22%3ENo%20Backdrop%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";

const FALLBACK_PROFILE =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22450%22%20viewBox%3D%220%200%20300%20450%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%2318181b%22%2F%3E%3Ccircle%20cx%3D%22150%22%20cy%3D%22160%22%20r%3D%2260%22%20fill%3D%22%233f3f46%22%2F%3E%3Cpath%20d%3D%22M70%20340c0-44.183%2035.817-80%2080-80s80%2035.817%2080%2080%22%20fill%3D%22%233f3f46%22%2F%3E%3C%2Fsvg%3E";

export function getPosterUrl(
    path: string | null | undefined,
    size = "w500",
) {
    return path
        ? `${IMAGE_BASE_URL}/${size}${path}`
        : FALLBACK_POSTER;
}

export function getBackdropUrl(
    path: string | null | undefined,
    size = "original",
) {
    return path
        ? `${IMAGE_BASE_URL}/${size}${path}`
        : FALLBACK_BACKDROP;
}

export function getProfileUrl(
    path: string | null | undefined,
    size = "w185",
) {
    return path
        ? `${IMAGE_BASE_URL}/${size}${path}`
        : FALLBACK_PROFILE;
}