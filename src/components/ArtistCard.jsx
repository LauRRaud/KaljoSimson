import Link from "next/link";
import ArtistPortrait from "@/components/ArtistPortrait";
import { getCopy } from "@/lib/content-helpers";

export default function ArtistCard({
  artist,
  className = "",
  href = null,
  locale = "et",
  onClick,
  priority = false,
  showLocation = true,
  type = "button",
}) {
  const classes = `artist-card ${className}`.trim();

  const content = (
    <>
      <ArtistPortrait artist={artist} priority={priority} />

      <div className="artist-card__meta">
        {showLocation ? (
          <span className="artist-card__location">{artist.location}</span>
        ) : null}
        <h3>{artist.name}</h3>
        <p className="artist-card__role">{getCopy(artist.role, locale)}</p>
        <p className="artist-card__bio">{getCopy(artist.shortBio, locale)}</p>
      </div>

      <div className="pill-row">
        {artist.focus.map((focus) => (
          <span className="pill" key={focus}>
            {focus}
          </span>
        ))}
      </div>
    </>
  );

  if (href) {
    return (
      <Link className={classes} href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} type={type}>
      {content}
    </button>
  );
}
