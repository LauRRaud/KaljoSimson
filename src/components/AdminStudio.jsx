"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ArtistPortrait from "@/components/ArtistPortrait";
import ArtworkFrame from "@/components/ArtworkFrame";
import ThemeToggle from "@/components/ThemeToggle";
import { saveContentAction } from "@/app/admin/actions";
import {
  cloneContent,
  createEmptyArtist,
  createEmptyArtwork,
  getCopy,
} from "@/lib/content-helpers";

function LocaleSwitch({ locale, onChange }) {
  return (
    <div className="locale-switch" role="tablist" aria-label="Redaktori keel">
      {["et", "en"].map((entry) => (
        <button
          aria-selected={locale === entry}
          className={`locale-switch__button ${
            locale === entry ? "locale-switch__button--active" : ""
          }`}
          key={entry}
          onClick={() => onChange(entry)}
          role="tab"
          type="button"
        >
          {entry.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function LocalizedField({
  label,
  locale,
  value,
  onChange,
  multiline = false,
  placeholderEt = "",
  placeholderEn = "",
}) {
  const FieldTag = multiline ? "textarea" : "input";
  const className = multiline ? "textarea" : "input";

  return (
    <div className="form-field form-field--localized">
      <div className="localized-field__header">
        <span className="form-field__label">{label}</span>
        <span className="localized-field__locale">{locale.toUpperCase()}</span>
      </div>
      <FieldTag
        className={className}
        onChange={(event) => onChange(locale, event.target.value)}
        placeholder={locale === "et" ? placeholderEt : placeholderEn}
        value={value?.[locale] ?? ""}
      />
    </div>
  );
}

function LinkButton({ href, children }) {
  return (
    <a className="button button--ghost" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function renderContactCopy(copy) {
  const noBreakTerm = "e-posti";

  if (!copy.includes(noBreakTerm)) {
    return copy;
  }

  const [before, ...after] = copy.split(noBreakTerm);

  return (
    <>
      {before}
      <span className="text-nowrap">{noBreakTerm}</span>
      {after.join(noBreakTerm)}
    </>
  );
}

function AdminSectionActions({ isPending, onExport, onSave, status, editorLocale }) {
  return (
    <div className="admin-section-actions">
      <div className="admin-toolbar__group">
        <button className="button" disabled={isPending} onClick={onSave} type="button">
          {isPending ? "Salvestan..." : "Salvesta"}
        </button>
        <button className="button button--ghost" onClick={onExport} type="button">
          Ekspordi
        </button>
      </div>

      <p className="admin-status">
        {status || `Muudad praegu ${editorLocale.toUpperCase()} sisu.`}
      </p>
    </div>
  );
}

export default function AdminStudio({ initialContent }) {
  const [draft, setDraft] = useState(() => cloneContent(initialContent));
  const [status, setStatus] = useState("");
  const [busyTarget, setBusyTarget] = useState("");
  const [editorLocale, setEditorLocale] = useState("et");
  const [expandedArtists, setExpandedArtists] = useState(() =>
    Object.fromEntries(
      initialContent.artists.map((artist, index) => [artist.slug || index, index === 0]),
    ),
  );
  const [expandedArtworks, setExpandedArtworks] = useState({});
  const [scrollToArtistKey, setScrollToArtistKey] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const artistCardRefs = useRef({});
  const portraitInputs = useRef({});
  const artworkInputs = useRef({});

  useEffect(() => {
    if (!scrollToArtistKey) {
      return;
    }

    artistCardRefs.current[scrollToArtistKey]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    const resetScrollTarget = window.requestAnimationFrame(() => {
      setScrollToArtistKey("");
    });

    return () => {
      window.cancelAnimationFrame(resetScrollTarget);
    };
  }, [scrollToArtistKey]);

  function getArtistKey(artist, index) {
    return artist.slug || `artist-${index}`;
  }

  function getArtworkKey(artistIndex, artwork, artworkIndex) {
    return `${artistIndex}-${artwork.slug || artworkIndex}`;
  }

  function toggleArtist(artist, index) {
    const key = getArtistKey(artist, index);
    setExpandedArtists((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function toggleArtwork(artistIndex, artwork, artworkIndex) {
    const key = getArtworkKey(artistIndex, artwork, artworkIndex);
    setExpandedArtworks((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function updateSite(field, value) {
    setDraft((current) => ({
      ...current,
      site: {
        ...current.site,
        [field]: value,
      },
    }));
  }

  function updateFramePreset(framePreset) {
    updateSite("framePreset", framePreset);
  }

  function updateSiteText(field, locale, value) {
    setDraft((current) => ({
      ...current,
      site: {
        ...current.site,
        [field]: {
          ...current.site[field],
          [locale]: value,
        },
      },
    }));
  }

  function updateContact(field, value) {
    setDraft((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  }

  function updateArtist(index, field, value) {
    setDraft((current) => {
      const artists = [...current.artists];
      artists[index] = {
        ...artists[index],
        [field]: value,
      };

      return {
        ...current,
        artists,
      };
    });
  }

  function updateArtistText(index, field, locale, value) {
    setDraft((current) => {
      const artists = [...current.artists];
      artists[index] = {
        ...artists[index],
        [field]: {
          ...artists[index][field],
          [locale]: value,
        },
      };

      return {
        ...current,
        artists,
      };
    });
  }

  function updateArtwork(artistIndex, artworkIndex, field, value) {
    updateArtworkFields(artistIndex, artworkIndex, {
      [field]: value,
    });
  }

  function updateArtworkFields(artistIndex, artworkIndex, fields) {
    setDraft((current) => {
      const artists = [...current.artists];
      const artworks = [...artists[artistIndex].artworks];
      artworks[artworkIndex] = {
        ...artworks[artworkIndex],
        ...fields,
      };
      artists[artistIndex] = {
        ...artists[artistIndex],
        artworks,
      };

      return {
        ...current,
        artists,
      };
    });
  }

  function toggleArtworkGallery(artistIndex, artworkIndex, checked) {
    const artwork = draft.artists[artistIndex].artworks[artworkIndex];
    const selectedCount = draft.artists.flatMap((artist) => artist.artworks).filter(
      (entry) => entry.showInGallery,
    ).length;

    updateArtworkFields(artistIndex, artworkIndex, {
      showInGallery: checked,
      galleryOrder: checked ? artwork.galleryOrder ?? selectedCount : artwork.galleryOrder,
    });
  }

  function updateArtworkText(artistIndex, artworkIndex, field, locale, value) {
    setDraft((current) => {
      const artists = [...current.artists];
      const artworks = [...artists[artistIndex].artworks];
      artworks[artworkIndex] = {
        ...artworks[artworkIndex],
        [field]: {
          ...artworks[artworkIndex][field],
          [locale]: value,
        },
      };
      artists[artistIndex] = {
        ...artists[artistIndex],
        artworks,
      };

      return {
        ...current,
        artists,
      };
    });
  }

  function addArtist() {
    const nextIndex = draft.artists.length;
    const newArtist = createEmptyArtist(nextIndex);

    setDraft((current) => ({
      ...current,
      artists: [...current.artists, newArtist],
    }));
    setExpandedArtists((current) => ({
      ...current,
      [getArtistKey(newArtist, nextIndex)]: true,
    }));
    setScrollToArtistKey(getArtistKey(newArtist, nextIndex));
  }

  function removeArtist(index) {
    setDraft((current) => ({
      ...current,
      artists: current.artists.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function addArtwork(artistIndex) {
    const artist = draft.artists[artistIndex];
    const nextArtworkIndex = artist.artworks.length;
    const newArtwork = createEmptyArtwork(artistIndex, nextArtworkIndex);

    setDraft((current) => {
      const artists = [...current.artists];
      artists[artistIndex] = {
        ...artists[artistIndex],
        artworks: [...artists[artistIndex].artworks, newArtwork],
      };

      return {
        ...current,
        artists,
      };
    });
    setExpandedArtworks((current) => ({
      ...current,
      [getArtworkKey(artistIndex, newArtwork, nextArtworkIndex)]: true,
    }));
  }

  function removeArtwork(artistIndex, artworkIndex) {
    setDraft((current) => {
      const artists = [...current.artists];
      artists[artistIndex] = {
        ...artists[artistIndex],
        artworks: artists[artistIndex].artworks.filter(
          (_, currentIndex) => currentIndex !== artworkIndex,
        ),
      };

      return {
        ...current,
        artists,
      };
    });
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Pildi üleslaadimine ebaõnnestus.");
    }

    return payload.url;
  }

  async function handlePortraitUpload(artistIndex, file) {
    if (!file) {
      return;
    }

    const target = `portrait-${artistIndex}`;
    setBusyTarget(target);
    setStatus("Laen portreepildi üles...");

    try {
      const url = await uploadFile(file);
      updateArtist(artistIndex, "portraitImage", url);
      setStatus("Portreepilt lisatud.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload ebaõnnestus.");
    } finally {
      setBusyTarget("");
    }
  }

  async function handleArtworkUpload(artistIndex, artworkIndex, file) {
    if (!file) {
      return;
    }

    const target = `artwork-${artistIndex}-${artworkIndex}`;
    setBusyTarget(target);
    setStatus("Laen teose pildi üles...");

    try {
      const url = await uploadFile(file);
      updateArtwork(artistIndex, artworkIndex, "image", url);
      setStatus("Teose pilt lisatud.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload ebaõnnestus.");
    } finally {
      setBusyTarget("");
    }
  }

  function handleSave() {
    setStatus("Salvestan muudatusi...");

    startTransition(async () => {
      const result = await saveContentAction(JSON.stringify(draft));
      setStatus(result.message);

      if (result.ok) {
        router.refresh();
      }
    });
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "beyondframes-content.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const siteTagline = getCopy(draft.site.tagline, editorLocale).trim();
  const siteHeroText = getCopy(draft.site.heroText, editorLocale);
  const siteContactTitle = getCopy(draft.site.contactTitle, editorLocale);
  const siteContactText = getCopy(draft.site.contactText, editorLocale);
  const galleryCandidates = draft.artists.flatMap((artist, artistIndex) =>
    artist.artworks.map((artwork, artworkIndex) => ({
      artist,
      artistIndex,
      artwork,
      artworkIndex,
    })),
  );
  const selectedGalleryCount = galleryCandidates.filter(
    ({ artwork }) => artwork.showInGallery,
  ).length;

  return (
    <div className="admin-grid">
      <nav className="site-nav admin-topbar" aria-label="Sisuhalduse navigeerimine">
        <div className="site-nav__links admin-topbar__links">
          <a href="#admin-site">Leht</a>
          <a href="#admin-gallery">Galerii</a>
          <a href="#admin-artists">Kunstnikud</a>
        </div>

        <div className="site-nav__controls admin-topbar__controls">
          <div className="admin-topbar__locale">
            <span className="admin-topbar__locale-copy">
              {editorLocale === "en" ? "Editing EN" : `Muudad ${editorLocale.toUpperCase()}`}
            </span>
            <LocaleSwitch locale={editorLocale} onChange={setEditorLocale} />
          </div>
          <ThemeToggle locale={editorLocale} />
        </div>
      </nav>

      <div className="admin-toolbar">
        <div className="admin-toolbar__group">
          <button className="button" disabled={isPending} onClick={handleSave} type="button">
            {isPending ? "Salvestan..." : "Salvesta"}
          </button>
          <button
            className="button button--ghost"
            onClick={handleExport}
            type="button"
          >
            Ekspordi
          </button>
        </div>

        <div className="admin-toolbar__meta">
          <p className="admin-status">
            {status || `Muudad praegu ${editorLocale.toUpperCase()} sisu.`}
          </p>
        </div>
      </div>

      <article className="admin-panel admin-panel--compact admin-home-editor" id="admin-site">
        <div className="section-heading">
          <p className="eyebrow">Avaleht</p>
          <h2>Leht ja kontakt</h2>
          <p className="admin-note">
            Siin näed avalehe esimest osa samas järjestuses nagu see päriselt välja
            renderdub. Muuda iga nähtava ploki all vastavat sisu.
          </p>
          <div className="admin-frame-preset" aria-label="Raamide stiil" role="group">
            <span>Raamide stiil</span>
            <button
              aria-pressed={(draft.site.framePreset || "silver") === "silver"}
              className={
                (draft.site.framePreset || "silver") === "silver"
                  ? "admin-frame-preset__button admin-frame-preset__button--active"
                  : "admin-frame-preset__button"
              }
              onClick={() => updateFramePreset("silver")}
              type="button"
            >
              Hõbe
            </button>
            <button
              aria-pressed={draft.site.framePreset === "gold"}
              className={
                draft.site.framePreset === "gold"
                  ? "admin-frame-preset__button admin-frame-preset__button--active"
                  : "admin-frame-preset__button"
              }
              onClick={() => updateFramePreset("gold")}
              type="button"
            >
              Kuld
            </button>
          </div>
        </div>

        <div className="admin-home-editor__canvas">
          <div className="admin-home-editor__hero">
            <div className="admin-home-editor__block admin-home-editor__block--title">
              <h1 className="home-title__brand admin-home-editor__brand">{draft.site.title}</h1>
              <div className="admin-home-editor__control">
                <div className="form-field">
                  <label htmlFor="site-title">Lehe nimi</label>
                  <input
                    className="input"
                    id="site-title"
                    onChange={(event) => updateSite("title", event.target.value)}
                    value={draft.site.title}
                  />
                </div>
              </div>
            </div>

            <div className="admin-home-editor__block admin-home-editor__block--tagline">
              {siteTagline ? (
                <p className="home-title__tagline admin-home-editor__tagline">{siteTagline}</p>
              ) : (
                <p className="admin-home-editor__ghost-label">
                  Tagline kuvatakse siin, kui see pole tühi.
                </p>
              )}
              <div className="admin-home-editor__control">
                <LocalizedField
                  label="Tagline"
                  locale={editorLocale}
                  onChange={(locale, value) => updateSiteText("tagline", locale, value)}
                  value={draft.site.tagline}
                />
              </div>
            </div>

            <div className="admin-home-editor__block admin-home-editor__block--hero-copy">
              <div className="home-title__story admin-home-editor__story">
                <p className="home-title__copy admin-home-editor__copy">{siteHeroText}</p>
              </div>
              <div className="admin-home-editor__control">
                <LocalizedField
                  label="Hero tekst"
                  locale={editorLocale}
                  multiline
                  onChange={(locale, value) => updateSiteText("heroText", locale, value)}
                  value={draft.site.heroText}
                />
              </div>
            </div>
          </div>

          <section className="admin-home-editor__contact" aria-label="Kontakti eelvaade">
            <div className="admin-home-editor__block">
              <h2>{siteContactTitle}</h2>
              <div className="admin-home-editor__control">
                <LocalizedField
                  label="Kontakti pealkiri"
                  locale={editorLocale}
                  onChange={(locale, value) => updateSiteText("contactTitle", locale, value)}
                  value={draft.site.contactTitle}
                />
              </div>
            </div>

            <div className="admin-home-editor__block">
              <p className="section-copy admin-home-editor__contact-copy">
                {renderContactCopy(siteContactText)}
              </p>
              <div className="admin-home-editor__control">
                <LocalizedField
                  label="Kontakti tekst"
                  locale={editorLocale}
                  multiline
                  onChange={(locale, value) => updateSiteText("contactText", locale, value)}
                  value={draft.site.contactText}
                />
              </div>
            </div>

            <div className="contact-inline admin-home-editor__contact-lines">
              <div className="admin-home-editor__line-group">
                <a className="contact-inline__line" href={`mailto:${draft.contact.email}`}>
                  {draft.contact.email}
                </a>
                <div className="admin-home-editor__control">
                  <div className="form-field">
                    <label htmlFor="contact-email">E-post</label>
                    <input
                      className="input"
                      id="contact-email"
                      onChange={(event) => updateContact("email", event.target.value)}
                      value={draft.contact.email}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-home-editor__line-group">
                <a
                  className="contact-inline__line"
                  href={`tel:${draft.contact.phone.replace(/\s+/g, "")}`}
                >
                  {draft.contact.phone}
                </a>
                <div className="admin-home-editor__control">
                  <div className="form-field">
                    <label htmlFor="contact-phone">Telefon</label>
                    <input
                      className="input"
                      id="contact-phone"
                      onChange={(event) => updateContact("phone", event.target.value)}
                      value={draft.contact.phone}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <AdminSectionActions
          editorLocale={editorLocale}
          isPending={isPending}
          onExport={handleExport}
          onSave={handleSave}
          status={status}
        />
      </article>

      <article className="admin-panel admin-panel--compact" id="admin-gallery">
        <div className="section-heading">
          <p className="eyebrow">Galerii</p>
          <h2>Galerii valik</h2>
          <p className="admin-note">
            Ühine galerii kasutab kunstnike all juba lisatud teoseid. Märgi siit,
            millised tööd ilmuvad avalikul galerii lehel.
          </p>
        </div>

        <p className="admin-status">
          {selectedGalleryCount} / {galleryCandidates.length} teost valitud.
        </p>

        {galleryCandidates.length ? (
          <div className="admin-gallery-select-grid">
            {galleryCandidates.map(({ artist, artistIndex, artwork, artworkIndex }) => {
              const title = getCopy(artwork.title, editorLocale) || "Pealkiri puudub";
              const selected = Boolean(artwork.showInGallery);

              return (
                <article
                  className={`admin-gallery-select-card ${
                    selected ? "admin-gallery-select-card--active" : ""
                  }`}
                  key={`${artist.slug}-${artwork.slug}-${artworkIndex}`}
                >
                  <div className="admin-gallery-select-card__thumb">
                    <ArtworkFrame artwork={artwork} showCaption={false} />
                  </div>

                  <div className="admin-gallery-select-card__body">
                    <p className="eyebrow">{artist.name}</p>
                    <h3>{title}</h3>
                    <p className="admin-note">
                      {artwork.image ? "Pilt lisatud" : "Pilt puudub"}
                    </p>
                  </div>

                  <div className="admin-gallery-select-card__controls">
                    <label className="admin-checkline">
                      <input
                        checked={selected}
                        disabled={!artwork.image}
                        onChange={(event) =>
                          toggleArtworkGallery(
                            artistIndex,
                            artworkIndex,
                            event.target.checked,
                          )
                        }
                        type="checkbox"
                      />
                      Näita galeriis
                    </label>

                    <div className="form-field form-field--tight">
                      <label>Järjekord</label>
                      <input
                        className="input"
                        disabled={!selected}
                        min="0"
                        onChange={(event) =>
                          updateArtwork(
                            artistIndex,
                            artworkIndex,
                            "galleryOrder",
                            Number.parseInt(event.target.value || "0", 10),
                          )
                        }
                        type="number"
                        value={artwork.galleryOrder ?? 0}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="admin-note">
            Galeriisse valimiseks lisa esmalt kunstniku alla vähemalt üks teos.
          </p>
        )}
        <AdminSectionActions
          editorLocale={editorLocale}
          isPending={isPending}
          onExport={handleExport}
          onSave={handleSave}
          status={status}
        />
      </article>

      <article className="admin-panel admin-panel--compact" id="admin-artists">
        <div className="section-heading">
          <p className="eyebrow">Kunstnikud</p>
          <h2>Profiilid ja galeriid</h2>
          <p className="admin-note">
            Iga kunstnik ja teos avaneb eraldi plokina. Thumbnail jääb nähtavale,
            kuid vorm ise on kompaktsem ja ühe keele põhiselt muudetav.
          </p>
        </div>

        <div className="admin-actions-inline">
          <button className="button" onClick={addArtist} type="button">
            Lisa kunstnik
          </button>
        </div>

        <div className="admin-artist-grid">
          {draft.artists.map((artist, artistIndex) => {
            const artistKey = getArtistKey(artist, artistIndex);
            const artistExpanded = Boolean(expandedArtists[artistKey]);

            return (
              <article
                className={`admin-artist-card ${
                  artistExpanded ? "admin-artist-card--open" : ""
                }`}
                key={`${artist.slug}-${artistIndex}`}
                ref={(element) => {
                  artistCardRefs.current[artistKey] = element;
                }}
              >
                <div className="admin-card-header">
                  <div className="admin-card-heading">
                    <div className="admin-card-thumb admin-card-thumb--portrait">
                      <ArtistPortrait artist={artist} />
                    </div>
                    <div className="admin-card-heading__copy">
                      <p className="eyebrow">Kunstnik {artistIndex + 1}</p>
                      <h3>{artist.name || "Uus kunstnik"}</h3>
                      <p className="admin-note">
                        {artist.location || "Asukoht määramata"}
                      </p>
                    </div>
                  </div>

                  <div className="admin-actions-inline">
                    <button
                      className="button button--ghost"
                      onClick={() => toggleArtist(artist, artistIndex)}
                      type="button"
                    >
                      {artistExpanded ? "Peida" : "Ava"}
                    </button>
                    <LinkButton href={`/artists/${artist.slug}`}>Profiil</LinkButton>
                    <button
                      className="button button--ghost"
                      onClick={() => removeArtist(artistIndex)}
                      type="button"
                    >
                      Eemalda
                    </button>
                  </div>
                </div>

                {artistExpanded ? (
                  <div className="admin-card-body">
                    <section className="admin-artist-editor profile-hero">
                      <div className="profile-nav admin-artist-editor__meta">
                        <div className="admin-form-grid">
                          <div className="form-field">
                            <label>Slug</label>
                            <input
                              className="input"
                              onChange={(event) =>
                                updateArtist(artistIndex, "slug", event.target.value)
                              }
                              value={artist.slug}
                            />
                            <span className="field-hint">
                              URL: /artists/{artist.slug}
                            </span>
                          </div>
                          <div className="form-field">
                            <label>Asukoht</label>
                            <input
                              className="input"
                              onChange={(event) =>
                                updateArtist(artistIndex, "location", event.target.value)
                              }
                              value={artist.location}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="admin-artist-editor__portrait">
                        <ArtistPortrait artist={artist} />
                        <div className="admin-artist-editor__control">
                          <div className="form-field">
                            <label>Portreepildi URL</label>
                            <input
                              className="input"
                              onChange={(event) =>
                                updateArtist(artistIndex, "portraitImage", event.target.value)
                              }
                              value={artist.portraitImage}
                            />
                          </div>
                          <button
                            className="admin-preview-button"
                            onClick={() => portraitInputs.current[artistIndex]?.click()}
                            type="button"
                          >
                            {busyTarget === `portrait-${artistIndex}`
                              ? "Laen üles..."
                              : "Laadi portree"}
                          </button>
                          <input
                            accept="image/*"
                            className="hidden-input"
                            onChange={(event) =>
                              handlePortraitUpload(artistIndex, event.target.files?.[0])
                            }
                            ref={(element) => {
                              portraitInputs.current[artistIndex] = element;
                            }}
                            type="file"
                          />
                        </div>
                      </div>

                      <div className="profile-copy admin-artist-editor__copy">
                        <div className="admin-artist-editor__block">
                          <h1>{artist.name || "Uus kunstnik"}</h1>
                          <div className="admin-artist-editor__control">
                            <div className="form-field">
                              <label>Nimi</label>
                              <input
                                className="input"
                                onChange={(event) =>
                                  updateArtist(artistIndex, "name", event.target.value)
                                }
                                value={artist.name}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="admin-artist-editor__block">
                          <p className="profile-copy__lead">
                            {getCopy(artist.role, editorLocale)}
                          </p>
                          <div className="admin-artist-editor__control">
                            <LocalizedField
                              label="Roll"
                              locale={editorLocale}
                              onChange={(locale, value) =>
                                updateArtistText(artistIndex, "role", locale, value)
                              }
                              value={artist.role}
                            />
                          </div>
                        </div>

                        <div className="admin-artist-editor__block">
                          <p className="section-copy">
                            {getCopy(artist.shortBio, editorLocale)}
                          </p>
                          <div className="admin-artist-editor__control">
                            <LocalizedField
                              label="Lühitutvustus"
                              locale={editorLocale}
                              multiline
                              onChange={(locale, value) =>
                                updateArtistText(artistIndex, "shortBio", locale, value)
                              }
                              value={artist.shortBio}
                            />
                          </div>
                        </div>

                        <div className="profile-tags-actions admin-artist-editor__tags">
                          <div className="pill-row">
                            {artist.focus.map((focus) => (
                              <span className="pill" key={focus}>
                                {focus}
                              </span>
                            ))}
                          </div>
                          <div className="profile-actions">
                            <span className="button button--ghost">
                              {editorLocale === "en" ? "Ask about works" : "Küsi teoste kohta"}
                            </span>
                          </div>
                        </div>

                        <div className="admin-artist-editor__control">
                          <div className="form-field">
                            <label>Fookusmärksõnad</label>
                            <input
                              className="input"
                              onChange={(event) =>
                                updateArtist(
                                  artistIndex,
                                  "focus",
                                  event.target.value
                                    .split(",")
                                    .map((item) => item.trim())
                                    .filter(Boolean),
                                )
                              }
                              value={artist.focus.join(", ")}
                            />
                            <span className="field-hint">Eralda komadega.</span>
                          </div>
                        </div>
                      </div>

                      <div className="profile-biography admin-artist-editor__biography">
                        <p className="eyebrow">
                          {editorLocale === "en" ? "Biography" : "Biograafia"}
                        </p>
                        {getCopy(artist.biography, editorLocale)
                          .split(/\n\s*\n/)
                          .map((paragraph) => paragraph.trim())
                          .filter(Boolean)
                          .map((paragraph) => (
                            <p className="section-copy" key={paragraph}>
                              {paragraph}
                            </p>
                          ))}
                        <div className="admin-artist-editor__control">
                          <LocalizedField
                            label="Biograafia"
                            locale={editorLocale}
                            multiline
                            onChange={(locale, value) =>
                              updateArtistText(artistIndex, "biography", locale, value)
                            }
                            value={artist.biography}
                          />
                        </div>
                      </div>
                    </section>

                    <div className="admin-divider" />

                    <div className="section-heading section-heading--inline">
                      <div>
                        <p className="eyebrow">Teosed</p>
                        <h3>{artist.artworks.length} tööd</h3>
                      </div>
                      <div className="admin-actions-inline">
                        <button
                          className="button"
                          onClick={() => addArtwork(artistIndex)}
                          type="button"
                        >
                          Lisa teos
                        </button>
                      </div>
                    </div>

                    <div className="admin-artwork-stack">
                      {artist.artworks.map((artwork, artworkIndex) => {
                        const artworkKey = getArtworkKey(
                          artistIndex,
                          artwork,
                          artworkIndex,
                        );
                        const artworkExpanded = Boolean(expandedArtworks[artworkKey]);

                        return (
                          <article
                            className={`admin-artwork-card ${
                              artworkExpanded ? "admin-artwork-card--open" : ""
                            }`}
                            key={`${artwork.slug}-${artworkIndex}`}
                          >
                            <div className="admin-card-header">
                              <div className="admin-card-heading">
                                <div className="admin-card-thumb admin-card-thumb--artwork">
                                  <ArtworkFrame artwork={artwork} />
                                </div>
                                <div className="admin-card-heading__copy">
                                  <p className="eyebrow">Teos {artworkIndex + 1}</p>
                                  <h4 className="admin-card-title">
                                    {getCopy(artwork.title) || "Uus teos"}
                                  </h4>
                                  <p className="admin-note">
                                    {artwork.year || "Aasta määramata"}
                                  </p>
                                </div>
                              </div>

                              <div className="admin-actions-inline">
                                <button
                                  className="button button--ghost"
                                  onClick={() =>
                                    toggleArtwork(artistIndex, artwork, artworkIndex)
                                  }
                                  type="button"
                                >
                                  {artworkExpanded ? "Peida" : "Ava"}
                                </button>
                                <button
                                  className="button button--ghost"
                                  onClick={() => removeArtwork(artistIndex, artworkIndex)}
                                  type="button"
                                >
                                  Eemalda
                                </button>
                              </div>
                            </div>

                            {artworkExpanded ? (
                              <div className="admin-card-body">
                                <div className="admin-artwork-layout">
                                  <div className="admin-stack">
                                    <div className="admin-form-grid">
                                      <div className="form-field">
                                        <label>Slug</label>
                                        <input
                                          className="input"
                                          onChange={(event) =>
                                            updateArtwork(
                                              artistIndex,
                                              artworkIndex,
                                              "slug",
                                              event.target.value,
                                            )
                                          }
                                          value={artwork.slug}
                                        />
                                      </div>
                                      <div className="form-field">
                                        <label>Aasta</label>
                                        <input
                                          className="input"
                                          onChange={(event) =>
                                            updateArtwork(
                                              artistIndex,
                                              artworkIndex,
                                              "year",
                                              event.target.value,
                                            )
                                          }
                                          value={artwork.year}
                                        />
                                      </div>
                                      <div className="form-field">
                                        <label>Mõõt</label>
                                        <input
                                          className="input"
                                          onChange={(event) =>
                                            updateArtwork(
                                              artistIndex,
                                              artworkIndex,
                                              "size",
                                              event.target.value,
                                            )
                                          }
                                          value={artwork.size}
                                        />
                                      </div>
                                      <div className="form-field">
                                        <label>Raam</label>
                                        <select
                                          className="select"
                                          onChange={(event) =>
                                            updateArtwork(
                                              artistIndex,
                                              artworkIndex,
                                              "frame",
                                              event.target.value,
                                            )
                                          }
                                          value={artwork.frame}
                                        >
                                          <option value="obsidian">
                                            {editorLocale === "en" ? "Dark" : "Tume"}
                                          </option>
                                          <option value="ivory">
                                            {editorLocale === "en" ? "Light" : "Hele"}
                                          </option>
                                        </select>
                                      </div>
                                      <div className="form-field">
                                        <label>Pildi URL</label>
                                        <input
                                          className="input"
                                          onChange={(event) =>
                                            updateArtwork(
                                              artistIndex,
                                              artworkIndex,
                                              "image",
                                              event.target.value,
                                            )
                                          }
                                          value={artwork.image}
                                        />
                                      </div>
                                    </div>

                                    <LocalizedField
                                      label="Pealkiri"
                                      locale={editorLocale}
                                      onChange={(locale, value) =>
                                        updateArtworkText(
                                          artistIndex,
                                          artworkIndex,
                                          "title",
                                          locale,
                                          value,
                                        )
                                      }
                                      value={artwork.title}
                                    />
                                    <LocalizedField
                                      label="Meedium"
                                      locale={editorLocale}
                                      onChange={(locale, value) =>
                                        updateArtworkText(
                                          artistIndex,
                                          artworkIndex,
                                          "medium",
                                          locale,
                                          value,
                                        )
                                      }
                                      value={artwork.medium}
                                    />
                                    <LocalizedField
                                      label="Staatus"
                                      locale={editorLocale}
                                      onChange={(locale, value) =>
                                        updateArtworkText(
                                          artistIndex,
                                          artworkIndex,
                                          "status",
                                          locale,
                                          value,
                                        )
                                      }
                                      value={artwork.status}
                                    />
                                    <LocalizedField
                                      label="Kirjeldus"
                                      locale={editorLocale}
                                      multiline
                                      onChange={(locale, value) =>
                                        updateArtworkText(
                                          artistIndex,
                                          artworkIndex,
                                          "description",
                                          locale,
                                          value,
                                        )
                                      }
                                      value={artwork.description}
                                    />
                                  </div>

                                  <aside className="admin-media-card">
                                    <div className="admin-media-card__preview admin-media-card__preview--artwork">
                                      <ArtworkFrame artwork={artwork} />
                                    </div>
                                    <div className="admin-actions-inline">
                                      <button
                                        className="admin-preview-button"
                                        onClick={() =>
                                          artworkInputs.current[
                                            `${artistIndex}-${artworkIndex}`
                                          ]?.click()
                                        }
                                        type="button"
                                      >
                                        {busyTarget ===
                                        `artwork-${artistIndex}-${artworkIndex}`
                                          ? "Laen üles..."
                                          : "Laadi pilt"}
                                      </button>
                                    </div>
                                    <input
                                      accept="image/*"
                                      className="hidden-input"
                                      onChange={(event) =>
                                        handleArtworkUpload(
                                          artistIndex,
                                          artworkIndex,
                                          event.target.files?.[0],
                                        )
                                      }
                                      ref={(element) => {
                                        artworkInputs.current[
                                          `${artistIndex}-${artworkIndex}`
                                        ] = element;
                                      }}
                                      type="file"
                                    />
                                  </aside>
                                </div>
                              </div>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
        <AdminSectionActions
          editorLocale={editorLocale}
          isPending={isPending}
          onExport={handleExport}
          onSave={handleSave}
          status={status}
        />
      </article>
    </div>
  );
}

