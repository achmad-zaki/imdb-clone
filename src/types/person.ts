export type KnownFor = {
    id: number;
    title?: string;
    name?: string;
    media_type?: string;
    release_date?: string;
    first_air_date?: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    vote_average?: number;
};

export type Person = {
    id: number;
    name: string;
    original_name?: string;
    media_type?: string;
    adult?: boolean;
    popularity: number;
    gender?: number;
    known_for_department?: string;
    profile_path: string | null;
    known_for?: KnownFor[];
};

export type PersonResponse = {
    page: number;
    results: Person[];
    total_pages: number;
    total_results: number;
};
