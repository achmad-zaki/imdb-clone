import { redirect } from "next/navigation";

export default function MovieRedirectPage() {
    redirect("/movies");
}
