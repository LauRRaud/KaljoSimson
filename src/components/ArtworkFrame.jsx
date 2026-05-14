/* eslint-disable @next/next/no-img-element */

import { getCopy } from "@/lib/content-helpers";
import { getArtworkPreset } from "@/lib/visuals";

function normalizeCaptionValue(value) {
  return String(value ?? "").trim().toLocaleLowerCase("et-EE");
}

function getCaptionYear(year, locale) {
  const normalizedYear = normalizeCaptionValue(year);

  if (!normalizedYear || normalizedYear === "dateerimata" || normalizedYear === "undated") {
    return locale === "en" ? "Year" : "Aasta";
  }

  return year;
}

function getCaptionSize(size, locale) {
  const normalizedSize = normalizeCaptionValue(size);

  if (
    !normalizedSize ||
    normalizedSize === "mõõdud täpsustamisel" ||
    normalizedSize === "dimensions to be confirmed" ||
    normalizedSize === "size to be confirmed"
  ) {
    return locale === "en" ? "Dimensions" : "Mõõtmed";
  }

  return size;
}

export default function ArtworkFrame({
  artwork,
  imageFetchPriority,
  imageLoading = "eager",
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
                  decoding="async"
                  fetchPriority={imageFetchPriority}
                  loading={imageLoading}
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
              <span className="artwork-frame__caption-title">
                {getCopy(artwork.title, locale)}
              </span>
              {artwork.artistName ? (
                <span className="artwork-frame__caption-artist">
                  {artwork.artistName}
                </span>
              ) : null}
              <span className="artwork-frame__caption-meta">
                {getCaptionYear(artwork.year, locale)}
              </span>
              <span className="artwork-frame__caption-meta">
                {getCaptionSize(artwork.size, locale)}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}
