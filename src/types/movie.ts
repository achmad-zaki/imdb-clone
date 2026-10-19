export type Movie = {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count?: number;
    genre_ids?: number[];
    popularity?: number;
    original_title?: string;
    original_language?: string;
};

export type MovieResponse = {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
};

export type Video = {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
};

export type VideoResponse = {
    id: number;
    results: Video[];
};

export type Genre = {
    id: number;
    name: string;
};

export type MovieDetail = Movie & {
    genres: Genre[];
    runtime: number;
    tagline: string;
    status: string;
    budget: number;
    revenue: number;
};