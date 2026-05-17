"use client";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: 145, background: "#e8f4ea", borderRadius: 12 }}
      className="flex items-center justify-center text-sm text-gray-500"
    >
      Loading map...
    </div>
  ),
});

interface MapPreviewProps {
  lat: number;
  lng: number;
  name: string;
}

export default function MapPreview({ lat, lng, name }: MapPreviewProps) {
  const wazeUrl = `waze://?ll=${lat},${lng}&navigate=yes`;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="w-full flex flex-col gap-2">
      <LeafletMap lat={lat} lng={lng} name={name} />
      <div className="flex gap-2">
        <a
          href={wazeUrl}
          className="flex-1 flex items-center justify-center gap-1 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded-xl transition"
        >
          🚗 Waze
        </a>
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition"
        >
          📍 Google Maps
        </a>
      </div>
    </div>
  );
}
