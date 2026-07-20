import Image from "next/image";

export default function ArtistPortrait({ artist, priority = false }) {
  return (
    <div
      className="portrait-shell portrait-shell--image"
      style={{
        "--portrait-position": artist.portraitPosition || "center center",
      }}
    >
      <div className="portrait-shell__frame">
        <div className="portrait-shell__window">
          <Image
            alt={artist.name}
            className="portrait-shell__image"
            fill
            loading={priority ? "eager" : undefined}
            priority={priority}
            sizes="(max-width: 1100px) 100vw, 40vw"
            src={artist.portraitImage}
          />
        </div>
      </div>
    </div>
  );
}
