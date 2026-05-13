"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createArtworkAction,
  deleteArtworkAction,
  updateArtworkAction,
} from "@/app/admin/artworks/actions";

function formatBytes(value) {
  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

async function uploadImage(file) {
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

  return payload;
}

function applyUploadedImage(formData, upload) {
  formData.set("imageUrl", upload.imageUrl);
  formData.set("filename", upload.filename);
  formData.set("originalName", upload.originalName);
  formData.set("mimeType", upload.mimeType);
  formData.set("size", String(upload.size));
}

function HiddenImageFields({ artwork }) {
  return (
    <>
      <input name="imageUrl" type="hidden" defaultValue={artwork?.imageUrl || ""} />
      <input name="filename" type="hidden" defaultValue={artwork?.filename || ""} />
      <input
        name="originalName"
        type="hidden"
        defaultValue={artwork?.originalName || ""}
      />
      <input name="mimeType" type="hidden" defaultValue={artwork?.mimeType || ""} />
      <input name="size" type="hidden" defaultValue={artwork?.size || 0} />
    </>
  );
}

function ArtworkForm({
  artwork,
  busy,
  fileInputRef,
  mode,
  onDelete,
  onSubmit,
}) {
  const isCreate = mode === "create";

  return (
    <form className="admin-artwork-edit" onSubmit={onSubmit}>
      {artwork?.id ? <input name="id" type="hidden" value={artwork.id} /> : null}
      <HiddenImageFields artwork={artwork} />

      <div className="admin-form-grid">
        <div className="form-field">
          <label>Pealkiri</label>
          <input
            className="input"
            defaultValue={artwork?.title || ""}
            name="title"
            required
          />
        </div>
        <div className="form-field">
          <label>Slug</label>
          <input className="input" defaultValue={artwork?.slug || ""} name="slug" />
        </div>
        <div className="form-field">
          <label>Järjekord</label>
          <input
            className="input"
            defaultValue={artwork?.sortOrder ?? 0}
            name="sortOrder"
            type="number"
          />
        </div>
        <div className="form-field form-field--checkbox">
          <label>
            <input
              defaultChecked={artwork?.isPublished ?? true}
              name="isPublished"
              type="checkbox"
            />
            Avaldatud
          </label>
        </div>
      </div>

      <div className="admin-form-grid admin-form-grid--full">
        <div className="form-field">
          <label>Alt tekst</label>
          <input
            className="input"
            defaultValue={artwork?.altText || ""}
            name="altText"
          />
        </div>
        <div className="form-field">
          <label>Kirjeldus</label>
          <textarea
            className="textarea"
            defaultValue={artwork?.description || ""}
            name="description"
          />
        </div>
        <div className="form-field">
          <label>Pilt</label>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="input"
            name="file"
            ref={fileInputRef}
            required={isCreate}
            type="file"
          />
          <span className="field-hint">
            Lubatud: jpg, jpeg, png, webp. Maksimaalne suurus 8 MB.
          </span>
        </div>
      </div>

      <div className="admin-actions-inline">
        <button className="button" disabled={busy} type="submit">
          {busy ? "Salvestan..." : isCreate ? "Lisa kunstiteos" : "Salvesta"}
        </button>
        {!isCreate ? (
          <button
            className="button button--ghost"
            disabled={busy}
            onClick={onDelete}
            type="button"
          >
            Kustuta
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function AdminArtworksStudio({ artworks, embedded = false }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [busyTarget, setBusyTarget] = useState("");
  const [isPending, startTransition] = useTransition();
  const createFileRef = useRef(null);
  const editFileRefs = useRef({});

  async function submitArtwork(event, action, target, fileInput) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("Salvestan kunstiteost...");
    setBusyTarget(target);

    try {
      const formData = new FormData(form);
      const file = fileInput?.files?.[0];

      if (file) {
        const upload = await uploadImage(file);
        applyUploadedImage(formData, upload);
      }

      startTransition(async () => {
        try {
          const result = await action(formData);
          setStatus(result.message);
          form.reset();
          router.refresh();
        } catch (error) {
          setStatus(error instanceof Error ? error.message : "Salvestamine ebaõnnestus.");
        } finally {
          setBusyTarget("");
        }
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Salvestamine ebaõnnestus.");
      setBusyTarget("");
    }
  }

  function handleDelete(artwork) {
    const confirmed = window.confirm(`Kas kustutada "${artwork.title}"?`);

    if (!confirmed) {
      return;
    }

    setStatus("Kustutan kunstiteost...");
    setBusyTarget(`delete-${artwork.id}`);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("id", artwork.id);
        const result = await deleteArtworkAction(formData);
        setStatus(result.message);
        router.refresh();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Kustutamine ebaõnnestus.");
      } finally {
        setBusyTarget("");
      }
    });
  }

  const content = (
    <>
      {embedded ? (
        <article className="admin-panel admin-panel--compact">
          <div className="section-heading">
            <p className="eyebrow">Galerii</p>
            <h2>Galerii</h2>
            <p className="admin-note">
              Siin haldad avalehe ja ühise galerii vaates nähtavaid teoseid.
            </p>
          </div>
          <p className="admin-status">
            {status || `${artworks.length} teost andmebaasis.`}
          </p>
          <div className="admin-divider" />
          <div className="section-heading section-heading--inline">
            <div>
              <p className="eyebrow">Uus teos</p>
              <h3>Lisa kunstiteos</h3>
            </div>
          </div>
          <ArtworkForm
            busy={isPending || busyTarget === "create"}
            fileInputRef={createFileRef}
            mode="create"
            onSubmit={(event) =>
              submitArtwork(event, createArtworkAction, "create", createFileRef.current)
            }
          />
        </article>
      ) : (
        <>
          <div className="admin-toolbar">
            <div>
              <p className="eyebrow">Galerii</p>
              <h2>Galerii</h2>
            </div>
            <p className="admin-status">
              {status || `${artworks.length} teost andmebaasis.`}
            </p>
          </div>

          <article className="admin-panel admin-panel--compact">
            <div className="section-heading">
              <p className="eyebrow">Uus teos</p>
              <h3>Lisa kunstiteos</h3>
            </div>
            <ArtworkForm
              busy={isPending || busyTarget === "create"}
              fileInputRef={createFileRef}
              mode="create"
              onSubmit={(event) =>
                submitArtwork(event, createArtworkAction, "create", createFileRef.current)
              }
            />
          </article>
        </>
      )}

      <div className="admin-artwork-stack">
        {artworks.map((artwork) => (
          <article className="admin-artwork-card" key={artwork.id}>
            <div className="admin-card-header">
              <div className="admin-card-heading">
                <div className="admin-card-thumb admin-card-thumb--artwork">
                  {artwork.imageUrl ? (
                    <img
                      alt={artwork.altText || artwork.title}
                      className="admin-upload-preview"
                      src={artwork.imageUrl}
                    />
                  ) : null}
                </div>
                <div className="admin-card-heading__copy">
                  <p className="eyebrow">
                    {artwork.isPublished ? "Avaldatud" : "Peidetud"}
                  </p>
                  <h3>{artwork.title}</h3>
                  <p className="admin-note">
                    {artwork.filename} / {formatBytes(artwork.size)}
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-card-body">
              <ArtworkForm
                artwork={artwork}
                busy={isPending || busyTarget === `edit-${artwork.id}`}
                fileInputRef={(element) => {
                  editFileRefs.current[artwork.id] = element;
                }}
                mode="edit"
                onDelete={() => handleDelete(artwork)}
                onSubmit={(event) =>
                  submitArtwork(
                    event,
                    updateArtworkAction,
                    `edit-${artwork.id}`,
                    editFileRefs.current[artwork.id],
                  )
                }
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );

  return embedded ? content : <div className="admin-grid">{content}</div>;
}
