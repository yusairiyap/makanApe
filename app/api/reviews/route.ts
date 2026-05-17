import { NextRequest, NextResponse } from "next/server";

export interface Review {
  author: string;
  rating: number;
  text: string;
  time: string;
  photoUrl: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!name || !lat || !lng) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 503 });
  }

  const findUrl =
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
    `?input=${encodeURIComponent(name)}` +
    `&inputtype=textquery` +
    `&locationbias=circle:500@${lat},${lng}` +
    `&fields=place_id` +
    `&key=${apiKey}`;

  const findRes = await fetch(findUrl);
  const findData = await findRes.json();
  const placeId: string | undefined = findData.candidates?.[0]?.place_id;

  if (!placeId) {
    return NextResponse.json({ reviews: [] });
  }

  const detailsUrl =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}` +
    `&fields=reviews` +
    `&reviews_sort=newest` +
    `&language=en` +
    `&key=${apiKey}`;

  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: Review[] = (detailsData.result?.reviews ?? []).slice(0, 5).map((r: any) => ({
    author: r.author_name,
    rating: r.rating,
    text: r.text,
    time: r.relative_time_description,
    photoUrl: r.profile_photo_url,
  }));

  return NextResponse.json({ reviews });
}
