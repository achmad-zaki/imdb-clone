export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function getPersonUrl(id: number | string, name?: string): string {
    if (!name) return `/person/${id}`;
    const slug = slugify(name);
    return slug ? `/person/${id}-${slug}` : `/person/${id}`;
}

export function parseEntityId(param: string): string {
    const match = param.match(/^(\d+)/);
    return match ? match[1] : param;
}
