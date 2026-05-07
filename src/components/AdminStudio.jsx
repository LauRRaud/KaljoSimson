"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ArtistPortrait from "@/components/ArtistPortrait";
import ArtworkFrame from "@/components/ArtworkFrame";
import { saveContentAction } from "@/app/admin/actions";
import {
  cloneContent,
  createEmptyArtist,
  createEmptyArtwork,
  getCopy,
} from "@/lib/content-helpers";
import { artworkPresets, portraitPresets } from "@/lib/visuals";

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

export default function AdminStudio({ initialContent, demoContent }) {
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const portraitInputs = useRef({});
  const artworkInputs = useRef({});

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

  function updateNote(index, locale, value) {
    setDraft((current) => {
      const notes = [...current.notes];
      notes[index] = {
        ...notes[index],
        [locale]: value,
      };

      return {
        ...current,
        notes,
      };
    });
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
    setDraft((current) => {
      const artists = [...current.artists];
      const artworks = [...artists[artistIndex].artworks];
      artworks[artworkIndex] = {
        ...artworks[artworkIndex],
        [field]: value,
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

  function handleReset() {
    const confirmed = window.confirm(
      "Kas taastada demoandmed? Praegused muutused kirjutatakse üle.",
    );

    if (!confirmed) {
      return;
    }

    setDraft(cloneContent(demoContent));
    setStatus("Demoandmed taastatud. Salvesta, kui soovid need faili kirjutada.");
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

  return (
    <div className="admin-grid">
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
          <button
            className="button button--ghost"
            onClick={handleReset}
            type="button"
          >
            Taasta demo
          </button>
        </div>

        <div className="admin-toolbar__meta">
          <LocaleSwitch locale={editorLocale} onChange={setEditorLocale} />
          <p className="admin-status">
            {status || `Muudad praegu ${editorLocale.toUpperCase()} sisu.`}
          </p>
        </div>
      </div>

      <article className="admin-panel admin-panel--compact">
        <div className="section-heading">
          <p className="eyebrow">Üldseaded</p>
          <h2>Leht ja kontakt</h2>
          <p className="admin-note">
            Tõlkeid muudad ühe keele kaupa. Andmestruktuur jääb ET ja EN jaoks
            alles, kuid korraga on nähtav ainult valitud keel.
          </p>
        </div>

        <div className="admin-form-grid">
          <div className="form-field">
            <label htmlFor="site-title">Lehe nimi</label>
            <input
              className="input"
              id="site-title"
              onChange={(event) => updateSite("title", event.target.value)}
              value={draft.site.title}
            />
          </div>
          <div className="form-field">
            <label htmlFor="site-domain">Domeen</label>
            <input
              className="input"
              id="site-domain"
              onChange={(event) => updateSite("domain", event.target.value)}
              value={draft.site.domain}
            />
          </div>
          <div className="form-field">
            <label htmlFor="contact-email">E-post</label>
            <input
              className="input"
              id="contact-email"
              onChange={(event) => updateContact("email", event.target.value)}
              value={draft.contact.email}
            />
          </div>
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

        <div className="admin-form-grid admin-form-grid--full">
          <LocalizedField
            label="Tagline"
            locale={editorLocale}
            onChange={(locale, value) => updateSiteText("tagline", locale, value)}
            value={draft.site.tagline}
          />
          <LocalizedField
            label="Hero pealkiri"
            locale={editorLocale}
            onChange={(locale, value) => updateSiteText("heroTitle", locale, value)}
            value={draft.site.heroTitle}
          />
          <LocalizedField
            label="Hero tekst"
            locale={editorLocale}
            multiline
            onChange={(locale, value) => updateSiteText("heroText", locale, value)}
            value={draft.site.heroText}
          />
          <LocalizedField
            label="Kontseptsiooni pealkiri"
            locale={editorLocale}
            onChange={(locale, value) => updateSiteText("aboutTitle", locale, value)}
            value={draft.site.aboutTitle}
          />
          <LocalizedField
            label="Kontseptsiooni tekst"
            locale={editorLocale}
            multiline
            onChange={(locale, value) => updateSiteText("aboutText", locale, value)}
            value={draft.site.aboutText}
          />
          <LocalizedField
            label="Kontakti pealkiri"
            locale={editorLocale}
            onChange={(locale, value) => updateSiteText("contactTitle", locale, value)}
            value={draft.site.contactTitle}
          />
          <LocalizedField
            label="Kontakti tekst"
            locale={editorLocale}
            multiline
            onChange={(locale, value) => updateSiteText("contactText", locale, value)}
            value={draft.site.contactText}
          />
        </div>

        <div className="admin-divider" />

        <div className="admin-note-grid">
          {draft.notes.map((note, index) => (
            <LocalizedField
              key={`note-${index}`}
              label={`Märksõna ${index + 1}`}
              locale={editorLocale}
              onChange={(locale, value) => updateNote(index, locale, value)}
              value={note}
            />
          ))}
        </div>
      </article>

      <article className="admin-panel admin-panel--compact">
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
                    <div className="admin-artist-layout">
                      <div className="admin-stack">
                        <div className="admin-form-grid">
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
                          <div className="form-field">
                            <label>Praktika algus</label>
                            <input
                              className="input"
                              onChange={(event) =>
                                updateArtist(
                                  artistIndex,
                                  "practiceSince",
                                  event.target.value,
                                )
                              }
                              value={artist.practiceSince}
                            />
                          </div>
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
                          <div className="form-field">
                            <label>Portree preset</label>
                            <select
                              className="select"
                              onChange={(event) =>
                                updateArtist(
                                  artistIndex,
                                  "portraitPresetId",
                                  event.target.value,
                                )
                              }
                              value={artist.portraitPresetId}
                            >
                              {portraitPresets.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                  {preset.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-field form-field--full">
                            <label>Portreepildi URL</label>
                            <input
                              className="input"
                              onChange={(event) =>
                                updateArtist(artistIndex, "portraitImage", event.target.value)
                              }
                              value={artist.portraitImage}
                            />
                          </div>
                        </div>

                        <LocalizedField
                          label="Roll"
                          locale={editorLocale}
                          onChange={(locale, value) =>
                            updateArtistText(artistIndex, "role", locale, value)
                          }
                          value={artist.role}
                        />
                        <LocalizedField
                          label="Lühitutvustus"
                          locale={editorLocale}
                          multiline
                          onChange={(locale, value) =>
                            updateArtistText(artistIndex, "shortBio", locale, value)
                          }
                          value={artist.shortBio}
                        />
                        <LocalizedField
                          label="Biograafia"
                          locale={editorLocale}
                          multiline
                          onChange={(locale, value) =>
                            updateArtistText(artistIndex, "biography", locale, value)
                          }
                          value={artist.biography}
                        />
                        <LocalizedField
                          label="Statement"
                          locale={editorLocale}
                          multiline
                          onChange={(locale, value) =>
                            updateArtistText(artistIndex, "statement", locale, value)
                          }
                          value={artist.statement}
                        />
                        <LocalizedField
                          label="Galerii sissejuhatus"
                          locale={editorLocale}
                          multiline
                          onChange={(locale, value) =>
                            updateArtistText(artistIndex, "galleryIntro", locale, value)
                          }
                          value={artist.galleryIntro}
                        />
                      </div>

                      <aside className="admin-media-card">
                        <div className="admin-media-card__preview admin-media-card__preview--portrait">
                          <ArtistPortrait artist={artist} />
                        </div>
                        <div className="admin-actions-inline">
                          <button
                            className="admin-preview-button"
                            onClick={() => portraitInputs.current[artistIndex]?.click()}
                            type="button"
                          >
                            {busyTarget === `portrait-${artistIndex}`
                              ? "Laen üles..."
                              : "Laadi portree"}
                          </button>
                          <button
                            className="admin-preview-button"
                            onClick={() => updateArtist(artistIndex, "portraitImage", "")}
                            type="button"
                          >
                            Kasuta presetit
                          </button>
                        </div>
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
                      </aside>
                    </div>

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
                                        <label>Pildi preset</label>
                                        <select
                                          className="select"
                                          onChange={(event) =>
                                            updateArtwork(
                                              artistIndex,
                                              artworkIndex,
                                              "visualPresetId",
                                              event.target.value,
                                            )
                                          }
                                          value={artwork.visualPresetId}
                                        >
                                          {artworkPresets.map((preset) => (
                                            <option key={preset.id} value={preset.id}>
                                              {preset.name}
                                            </option>
                                          ))}
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
                                      <button
                                        className="admin-preview-button"
                                        onClick={() =>
                                          updateArtwork(
                                            artistIndex,
                                            artworkIndex,
                                            "image",
                                            "",
                                          )
                                        }
                                        type="button"
                                      >
                                        Kasuta presetit
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
      </article>
    </div>
  );
}
