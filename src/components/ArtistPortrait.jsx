/* eslint-disable @next/next/no-img-element */

// Tavaline img (mitte next/image fill): raam kohandub pildi külgsuhtega
// ja portreed ei lõigata, ükskõik mis formaadis fail üles laaditakse.
export default function ArtistPortrait({ artist, priority = false }) {
  return (
    <div className="portrait-shell portrait-shell--image">
      <div className="portrait-shell__frame">
        <div className="portrait-shell__window">
          <img
            alt={artist.name}
            className="portrait-shell__image"
            fetchPriority={priority ? "high" : undefined}
            loading={priority ? "eager" : "lazy"}
            src={artist.portraitImage}
          />
        </div>
      </div>
    </div>
  );
}
