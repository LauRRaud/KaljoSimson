/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useTransition } from "react";
import { saveContentAction } from "@/app/admin/actions";

// Üks vorm kogu lehe sisu jaoks: tekstid (ET/EN), kontakt, kunstniku
// profiil ja teosed koos piltide üleslaadimisega. Salvestus kirjutab
// serveris content/site-content.local.json.

function setDeep(object, pathKeys, value) {
  const next = structuredClone(object);
  let cursor = next;

  for (let i = 0; i < pathKeys.length - 1; i += 1) {
    cursor = cursor[pathKeys[i]];
  }

  cursor[pathKeys[pathKeys.length - 1]] = value;
  return next;
}

function LocalizedField({ label, value, onChange, multiline = false }) {
  const Input = multiline ? "textarea" : "input";

  return (
    <div className="admin-field admin-field--localized">
      <span className="admin-field__label">{label}</span>
      <div className="admin-field__pair">
        <label className="admin-field__lang">
          <span>ET</span>
          <Input
            className="admin-input"
            onChange={(event) => onChange({ ...value, et: event.target.value })}
            rows={multiline ? 5 : undefined}
            value={value?.et || ""}
          />
        </label>
        <label className="admin-field__lang">
          <span>EN</span>
          <Input
            className="admin-input"
            onChange={(event) => onChange({ ...value, en: event.target.value })}
            rows={multiline ? 5 : undefined}
            value={value?.en || ""}
          />
        </label>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, hint }) {
  return (
    <label className="admin-field">
      <span className="admin-field__label">{label}</span>
      <input
        className="admin-input"
        onChange={(event) => onChange(event.target.value)}
        value={value || ""}
      />
      {hint ? <span className="admin-field__hint">{hint}</span> : null}
    </label>
  );
}

function ImageField({ label, value, onChange, onStatus }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Üleslaadimine ebaõnnestus.");
      }

      onChange(payload.url);
      onStatus?.({ ok: true, message: "Pilt laaditi üles. Salvesta muudatused." });
    } catch (error) {
      onStatus?.({
        ok: false,
        message: error instanceof Error ? error.message : "Üleslaadimine ebaõnnestus.",
      });
    } finally {
      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="admin-field">
      <span className="admin-field__label">{label}</span>
      <div className="admin-image-field">
        {value ? (
          <img alt="" className="admin-image-field__preview" src={value} />
        ) : (
          <span className="admin-image-field__empty">Pilti ei ole</span>
        )}
        <label className="admin-upload">
          <input
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleFile}
            ref={inputRef}
            type="file"
          />
          <span className="cta cta--ghost admin-upload__button">
            {busy ? "Laadin…" : "Vali uus pilt"}
          </span>
        </label>
      </div>
    </div>
  );
}

export default function AdminPanel({ initialContent, logoutAction }) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState(null);
  const [pending, startTransition] = useTransition();

  function update(pathKeys, value) {
    setContent((current) => setDeep(current, pathKeys, value));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveContentAction(JSON.stringify(content));
      setStatus(result);
    });
  }

  function addArtwork() {
    setContent((current) => {
      const next = structuredClone(current);
      const index = next.artist.artworks.length;

      next.artist.artworks.push({
        slug: `uus-teos-${index + 1}`,
        title: { et: "", en: "" },
        year: "",
        medium: { et: "", en: "" },
        size: "",
        status: { et: "Küsi saadavust", en: "Availability on request" },
        frame: "obsidian",
        visualPresetId: "ember-mist",
        image: "",
        showInGallery: true,
        galleryOrder: index,
        description: { et: "", en: "" },
      });

      return next;
    });
  }

  function removeArtwork(index) {
    setContent((current) => {
      const next = structuredClone(current);
      next.artist.artworks.splice(index, 1);
      return next;
    });
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Kaljo Simson</p>
          <h1>Sisu haldus</h1>
        </div>
        <div className="admin-topbar__actions">
          <button
            className="cta cta--primary"
            disabled={pending}
            onClick={handleSave}
            type="button"
          >
            {pending ? "Salvestan…" : "Salvesta muudatused"}
          </button>
          <form action={logoutAction}>
            <button className="cta cta--ghost" type="submit">
              Logi välja
            </button>
          </form>
        </div>
      </header>

      {status ? (
        <p className={`admin-status ${status.ok ? "admin-status--ok" : "admin-status--error"}`}>
          {status.message}
        </p>
      ) : null}

      <section className="admin-section">
        <h2>Avaleht ja üldtekstid</h2>
        <LocalizedField
          label="Alapealkiri (roll)"
          onChange={(value) => update(["site", "tagline"], value)}
          value={content.site.tagline}
        />
        <LocalizedField
          label="Avalehe tutvustuslause"
          multiline
          onChange={(value) => update(["site", "heroLead"], value)}
          value={content.site.heroLead}
        />
        <LocalizedField
          label="Teoste ploki tutvustus"
          multiline
          onChange={(value) => update(["site", "worksIntro"], value)}
          value={content.site.worksIntro}
        />
        <LocalizedField
          label="Kontakti tekst"
          multiline
          onChange={(value) => update(["site", "contactText"], value)}
          value={content.site.contactText}
        />
      </section>

      <section className="admin-section">
        <h2>Kontaktandmed</h2>
        <div className="admin-grid-2">
          <TextField
            label="E-post"
            onChange={(value) => update(["contact", "email"], value)}
            value={content.contact.email}
          />
          <TextField
            label="Telefon"
            onChange={(value) => update(["contact", "phone"], value)}
            value={content.contact.phone}
          />
          <TextField
            hint="Kuvatakse ainult siis, kui mõlemad väljad on täidetud."
            label="Instagrami nimi"
            onChange={(value) => update(["contact", "instagram"], value)}
            value={content.contact.instagram}
          />
          <TextField
            label="Instagrami link"
            onChange={(value) => update(["contact", "instagramUrl"], value)}
            value={content.contact.instagramUrl}
          />
        </div>
      </section>

      <section className="admin-section">
        <h2>Kunstnik</h2>
        <ImageField
          label="Avalehe portree"
          onChange={(value) => update(["artist", "heroImage"], value)}
          onStatus={setStatus}
          value={content.artist.heroImage}
        />
        <ImageField
          label="Kunstniku lehe portree"
          onChange={(value) => update(["artist", "portraitImage"], value)}
          onStatus={setStatus}
          value={content.artist.portraitImage}
        />
        <LocalizedField
          label="Lühitutvustus"
          multiline
          onChange={(value) => update(["artist", "shortBio"], value)}
          value={content.artist.shortBio}
        />
        <LocalizedField
          label="Biograafia (tühi rida = uus lõik)"
          multiline
          onChange={(value) => update(["artist", "biography"], value)}
          value={content.artist.biography}
        />
        <LocalizedField
          label="Tsitaat avalehel"
          multiline
          onChange={(value) => update(["artist", "statement"], value)}
          value={content.artist.statement}
        />
        <LocalizedField
          label="Galerii tutvustus"
          multiline
          onChange={(value) => update(["artist", "galleryIntro"], value)}
          value={content.artist.galleryIntro}
        />
      </section>

      <section className="admin-section">
        <div className="admin-section__heading">
          <h2>Teosed</h2>
          <button className="cta cta--ghost" onClick={addArtwork} type="button">
            + Lisa uus teos
          </button>
        </div>

        {content.artist.artworks.map((artwork, index) => (
          <article className="admin-artwork" key={index}>
            <div className="admin-artwork__head">
              <h3>
                {index + 1}. {artwork.title?.et || "Nimetu teos"}
              </h3>
              <button
                className="admin-remove"
                onClick={() => removeArtwork(index)}
                type="button"
              >
                Eemalda
              </button>
            </div>

            <ImageField
              label="Teose pilt"
              onChange={(value) =>
                update(["artist", "artworks", index, "image"], value)
              }
              onStatus={setStatus}
              value={artwork.image}
            />
            <LocalizedField
              label="Pealkiri"
              onChange={(value) =>
                update(["artist", "artworks", index, "title"], value)
              }
              value={artwork.title}
            />
            <LocalizedField
              label="Kirjeldus"
              multiline
              onChange={(value) =>
                update(["artist", "artworks", index, "description"], value)
              }
              value={artwork.description}
            />
            <div className="admin-grid-2">
              <TextField
                label="Aasta"
                onChange={(value) =>
                  update(["artist", "artworks", index, "year"], value)
                }
                value={artwork.year}
              />
              <TextField
                label="Mõõdud"
                onChange={(value) =>
                  update(["artist", "artworks", index, "size"], value)
                }
                value={artwork.size}
              />
            </div>
            <LocalizedField
              label="Tehnika"
              onChange={(value) =>
                update(["artist", "artworks", index, "medium"], value)
              }
              value={artwork.medium}
            />
            <label className="admin-check">
              <input
                checked={Boolean(artwork.showInGallery)}
                onChange={(event) =>
                  update(
                    ["artist", "artworks", index, "showInGallery"],
                    event.target.checked,
                  )
                }
                type="checkbox"
              />
              <span>Näita galeriiruumis</span>
            </label>
          </article>
        ))}
      </section>

      <footer className="admin-footer">
        <button
          className="cta cta--primary"
          disabled={pending}
          onClick={handleSave}
          type="button"
        >
          {pending ? "Salvestan…" : "Salvesta muudatused"}
        </button>
        {status ? (
          <span
            className={`admin-status ${status.ok ? "admin-status--ok" : "admin-status--error"}`}
          >
            {status.message}
          </span>
        ) : null}
      </footer>
    </div>
  );
}
