import { getMovieCredits, getMovieVideos, getTVCredits, getTVVideos } from "@/lib/tmdb";
import { CastMember, Video } from "@/types/movie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");
    const mediaType = searchParams.get("type") || searchParams.get("mediaType");

    if (!movieId) {
        return NextResponse.json({ error: "movieId parameter is required" }, { status: 400 });
    }

    try {
        let videos: Video[] = [];
        let cast: CastMember[] = [];

        if (mediaType === "tv") {
            const [vids, credits] = await Promise.all([
                getTVVideos(movieId),
                getTVCredits(movieId),
            ]);
            videos = vids;
            cast = credits;
            if (videos.length === 0) {
                videos = await getMovieVideos(movieId);
            }
            if (cast.length === 0) {
                cast = await getMovieCredits(movieId);
            }
        } else {
            const [vids, credits] = await Promise.all([
                getMovieVideos(movieId),
                getMovieCredits(movieId),
            ]);
            videos = vids;
            cast = credits;
            if (videos.length === 0) {
                videos = await getTVVideos(movieId);
            }
            if (cast.length === 0) {
                cast = await getTVCredits(movieId);
            }
        }

        const trailer =
            videos.find((v) => v.type === "Trailer" && v.official) ||
            videos.find((v) => v.type === "Trailer") ||
            videos[0] ||
            null;

        return NextResponse.json({
            videos,
            trailer,
            cast: cast.slice(0, 15),
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Gagal mengambil data video", details: String(err) },
            { status: 500 }
        );
    }
}
