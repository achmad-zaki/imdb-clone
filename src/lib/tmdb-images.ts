const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const NOT_FOUND_IMAGE = "/images/not-found.png";
export const FALLBACK_POSTER = NOT_FOUND_IMAGE;
export const FALLBACK_BACKDROP = NOT_FOUND_IMAGE;
export const FALLBACK_PROFILE = NOT_FOUND_IMAGE;

export function getPosterUrl(
    path: string | null | undefined,
    size = "w500",
) {
    return path
        ? `${IMAGE_BASE_URL}/${size}${path}`
        : NOT_FOUND_IMAGE;
}

export function getBackdropUrl(
    path: string | null | undefined,
    size = "original",
) {
    return path
        ? `${IMAGE_BASE_URL}/${size}${path}`
        : NOT_FOUND_IMAGE;
}

export function getProfileUrl(
    path: string | null | undefined,
    size = "w185",
) {
    return path
        ? `${IMAGE_BASE_URL}/${size}${path}`
        : NOT_FOUND_IMAGE;
}