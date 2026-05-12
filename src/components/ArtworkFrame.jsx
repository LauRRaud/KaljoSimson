/* eslint-disable @next/next/no-img-element */

import { getCopy } from "@/lib/content-helpers";
import { getArtworkPreset } from "@/lib/visuals";

export default function ArtworkFrame({
  artwork,
  interactive = false,
  locale = "et",
  onClick,
  showCaption = true,
}) {
  const preset = getArtworkPreset(artwork.visualPresetId);
  const isIvory = artwork.frame === "ivory";
  const Wrapper = interactive ? "button" : "article";
  const wrapperProps = interactive
    ? {
        type: "button",
        onClick,
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={interactive ? "artwork-frame--button" : "artwork-frame"}
    >
      <div className="artwork-frame__assembly">
        <div
          className={`artwork-frame__window ${
            isIvory ? "artwork-frame__window--ivory" : "artwork-frame__window--obsidian"
          }`}
        >
          <div
            className={`artwork-frame__mount ${
              isIvory ? "artwork-frame__mount--ivory" : ""
            }`}
          >
            <div
              className="artwork-frame__surface"
              style={
                artwork.image ? undefined : { backgroundImage: preset.background }
              }
            >
              {artwork.image ? (
                <img
                  alt={artwork.altText || getCopy(artwork.title, locale)}
                  className="artwork-frame__image"
                  src={artwork.image}
                />
              ) : null}
              <span
                className="artwork-frame__glaze"
                style={{ backgroundImage: preset.glaze }}
              />
            </div>
          </div>
        </div>

        {showCaption ? (
          <div className="artwork-frame__caption">
            <p>
              <span>{getCopy(artwork.title, locale)}</span>
              <span>{artwork.year}</span>
              <span>{artwork.size}</span>
            </p>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}
