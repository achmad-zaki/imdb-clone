import { getMovieVideos, getTVVideos } from "@/lib/tmdb";
import { Video } from "@/types/movie";
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
        if (mediaType === "tv") {
            videos = await getTVVideos(movieId);
            if (videos.length === 0) {
                videos = await getMovieVideos(movieId);
            }
        } else {
            videos = await getMovieVideos(movieId);
            if (videos.length === 0) {
                videos = await getTVVideos(movieId);
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
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Gagal mengambil data video", details: String(err) },
            { status: 500 }
        );
    }
}
