"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ArtistPortrait from "@/components/ArtistPortrait";
import ArtworkFrame from "@/components/ArtworkFrame";
import LivingPaint from "@/components/home/LivingPaint";
import { DEFAULT_PALETTE } from "@/lib/paint-palettes";

const BRAND_Z = -620;
const TAGLINE_Z = -710;
const FIRST_ROOM_Z = -2100;
const ROOM_DEPTH = 1500;
const REST_OFFSET = 320;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function fadeIn(rel, from, to) {
  return clamp01((rel - from) / (to - from));
}

function fadeOut(rel, from, to) {
  return 1 - clamp01((rel - from) / (to - from));
}

// Iga ruum elab AINULT omas lõigus: ta hakkab ilmuma alles siis, kui
// eelmine ruum (1500px eespool) on kaamerani jõudnud, ja hajub kiiresti
// pärast möödumist. Nii ei paista intro ajal brändi taga midagi ega
// kattu naaberruumid kunagi täies jõus.
function envelopeFor(env, rel) {
  if (env === "brand") {
    return fadeOut(rel, -80, 360);
  }

  if (env === "finale") {
    return fadeIn(rel, -1450, -850);
  }

  return fadeIn(rel, -1500, -900) * fadeOut(rel, 260, 640);
}

// Osa WebKit-versioone (iOS Safari) lamendab pesastatud preserve-3d sisu:
// translateZ ei renderdu ja kõik plaanid joonistuvad täissuuruses üksteise
// peale. Mõõdame proovikehaga, kas perspektiiv päriselt skaleerib — kui ei,
// kasutame lamedat varupaigutust.
function perspectiveWorks(dolly) {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:absolute;left:0;top:0;width:100px;height:100px;" +
    "transform:translateZ(-1100px);visibility:hidden;pointer-events:none;";
  dolly.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width < 80;
}

export default function FlightScene({ intro, rooms, finale, labels, locale }) {
  const viewportRef = useRef(null);
  const dollyRef = useRef(null);
  const brandRef = useRef(null);
  const markerRef = useRef(null);
  const markerIdxRef = useRef(null);
  const markerNameRef = useRef(null);
  const router = useRouter();
  const [flat, setFlat] = useState(false);
  const [introReveal, setIntroReveal] = useState(true);
  const [flightSpeed, setFlightSpeed] = useState(1.2);
  const paletteControlRef = useRef(null);

  const roomCount = rooms.length;
  const finaleZ = FIRST_ROOM_Z - roomCount * ROOM_DEPTH;
  const maxCam = Math.abs(finaleZ) - REST_OFFSET;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dolly = dollyRef.current;
    const broken3d = dolly ? !perspectiveWorks(dolly) : false;

    function update() {
      setFlat(reduced.matches || broken3d);
    }

    update();
    reduced.addEventListener("change", update);
    return () => reduced.removeEventListener("change", update);
  }, []);

  // Kaamera liigub kerimise kohta kiiremini kui 1:1 — lend on "lühem",
  // ilma et stseeni geomeetria muutuks. Mobiilis (rohkem sõrmetööd)
  // veel veidi kiiremini kui desktopis.
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 720px)");

    function update() {
      setFlightSpeed(compact.matches ? 1.35 : 1.2);
    }

    update();
    compact.addEventListener("change", update);
    return () => compact.removeEventListener("change", update);
  }, []);

  // Sisenemisel lastakse taustaruumide sisu sujuvalt kohale (üleminek), mitte
  // tõksti — pärast lühikest akent eemaldame ülemineku, et lend jääks terav.
  useEffect(() => {
    const id = window.setTimeout(() => setIntroReveal(false), 1400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (flat) {
      document.body.classList.add("bfl-header-return");
      return () => document.body.classList.remove("bfl-header-return");
    }

    const viewport = viewportRef.current;
    const dolly = dollyRef.current;
    const brand = brandRef.current;

    if (!viewport || !dolly) {
      return undefined;
    }

    const planes = Array.from(dolly.querySelectorAll("[data-z]")).map((el) => {
      const z = Number(el.dataset.z);
      // Sügavusjärjekord on KONSTANTNE — kõik plaanid liiguvad sama --cam
      // võrra, seega suurema z-ga plaan on alati eespool. z-index määratakse
      // ÜKS kord z järgi. Varem arvutati see igal kaadril rel-ist, mis
      // sundis teksti pidevalt ümber joonistama (võbelemine).
      el.style.zIndex = String(Math.round(z / 4) + 4000);
      return {
        el,
        z,
        env: el.dataset.env || "room",
        interactive: el.tagName === "A" || el.dataset.interactive === "1",
        lastO: -1,
      };
    });

    const marker = markerRef.current;
    const markerIdx = markerIdxRef.current;
    const markerName = markerNameRef.current;
    const roomNames = rooms.map((room) => room.name);

    const cueEl = viewport.querySelector(".bfl-cue");
    const roomHrefs = rooms.map((room) => room.href);
    const roomPalettes = rooms.map((room) => room.palette || DEFAULT_PALETTE);

    let currentActiveRoom = -1;
    let frame = null;
    let cam = 0;
    let lastCue = -1;
    let lastHdr = -1;
    let lastHeaderBack = null;
    let lastMarker = -2;
    let running = false;
    let suppressClickUntil = 0;
    const tap = { active: false, x: 0, y: 0 };

    function tick() {
      const target = clamp(window.scrollY * flightSpeed, 0, maxCam);

      cam += (target - cam) * 0.11;

      if (Math.abs(target - cam) < 0.2) {
        cam = target;
      }

      // Kaamera liigub CSS-muutujana: iga plaan arvutab oma sügavuse ise
      // (translateZ(calc(--z + --cam))). Nii ei sõltu lend pesastatud
      // preserve-3d toest, mis WebKitis on habras.
      dolly.style.setProperty("--cam", `${cam.toFixed(2)}px`);

      for (const plane of planes) {
        const rel = plane.z + cam;

        // Aken järgib ümbrikke (fadeIn algab -1500, fadeOut lõpeb 640):
        // nähtamatut plaani ei komposiitita hiigelskaalas edasi.
        if (rel < -1600 || rel > 680) {
          if (plane.el.style.visibility !== "hidden") {
            plane.el.style.visibility = "hidden";
            plane.lastO = -1;
          }
          continue;
        }

        if (plane.el.style.visibility !== "visible") {
          plane.el.style.visibility = "visible";
        }

        // Läbipaistvus kirjutatakse ainult tegeliku muutuse korral — muidu
        // sunniks iga kaadri stiiliümberarvutus teksti võbelema.
        const opacity = envelopeFor(plane.env, rel);

        if (Math.abs(opacity - plane.lastO) > 0.002) {
          plane.lastO = opacity;
          plane.el.style.setProperty("--o", opacity.toFixed(3));
        }

        if (plane.interactive) {
          const clickable = opacity > 0.15 && rel >= -2050 && rel <= 160;
          plane.el.style.pointerEvents = clickable ? "auto" : "none";
        }
      }

      if (brand) {
        brand.style.setProperty("--split", clamp01(cam / 680).toFixed(3));
      }

      const cue = clamp01(1 - window.scrollY / 240);

      if (Math.abs(cue - lastCue) > 0.01) {
        lastCue = cue;
        viewport.style.setProperty("--cue-o", cue.toFixed(2));

        if (cueEl) {
          cueEl.style.pointerEvents = cue < 0.05 ? "none" : "auto";
        }
      }

      const headerBack = cam > maxCam - 220;

      if (headerBack !== lastHeaderBack) {
        lastHeaderBack = headerBack;
        document.body.classList.toggle("bfl-header-return", headerBack);
      }

      // Menüü on lennu ajal fikseeritud ja hajub kerima asudes — nii ei
      // saa ta iOS-is stseeni pealt "lahti rebeneda" ega väreleda.
      const hdr = headerBack ? 1 : cue;

      if (Math.abs(hdr - lastHdr) > 0.01) {
        lastHdr = hdr;
        document.body.style.setProperty("--hdr-o", hdr.toFixed(2));
        document.body.style.setProperty(
          "--hdr-v",
          hdr < 0.05 ? "hidden" : "visible",
        );
      }

      // Marker näitab ruumi, mis on parasjagu KOHAL: nimi ilmub, kui ruum on
      // täielikult nähtavale ilmunud, ja vahetub alles siis, kui selle raam
      // on kaamerast läbi lennanud (rel > 520).
      let activeRoom = -1;

      for (let i = 0; i < roomNames.length; i += 1) {
        const rel = FIRST_ROOM_Z - i * ROOM_DEPTH + cam;

        if (rel >= -1480 && rel <= 520) {
          activeRoom = i;
          break;
        }
      }

      currentActiveRoom = activeRoom;

      if (activeRoom !== lastMarker) {
        lastMarker = activeRoom;
        // Palett läheb OTSE LivingPainti (ref), mitte React state'i kaudu —
        // nii ei toimu igal ruumipiiril kogu stseeni uuesti-renderdamist.
        if (paletteControlRef.current) {
          paletteControlRef.current(
            activeRoom >= 0 ? roomPalettes[activeRoom] : DEFAULT_PALETTE,
          );
        }

        if (marker) {
          marker.classList.toggle("bfl-marker--on", activeRoom >= 0);
        }

        if (activeRoom >= 0 && markerIdx && markerName) {
          markerIdx.textContent = `${String(activeRoom + 1).padStart(2, "0")} / ${String(roomNames.length).padStart(2, "0")}`;
          markerName.textContent = roomNames[activeRoom];
        }
      }

      const settled = cam === target;

      if (settled) {
        running = false;
        frame = null;
        return;
      }

      frame = window.requestAnimationFrame(tick);
    }

    function wake() {
      if (!running) {
        running = true;
        frame = window.requestAnimationFrame(tick);
      }
    }

    function sleep() {
      running = false;

      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    }

    function handleScroll() {
      wake();
    }

    function handleVisibility() {
      if (document.hidden) {
        sleep();
      } else {
        wake();
      }
    }

    function handleFocusIn(event) {
      if (!event.target.matches(":focus-visible")) {
        return;
      }

      const anchor = event.target.closest("[data-cam]");

      if (anchor) {
        window.scrollTo({
          top: Number(anchor.dataset.cam) / flightSpeed,
          behavior: "auto",
        });
      }
    }

    // Menüü "Kontakt" viib OTSE lõppu — ilma kogu lendu läbi mängimata.
    function jumpToContactHash() {
      if (window.location.hash !== "#contact") {
        return;
      }

      window.scrollTo({ top: maxCam / flightSpeed, behavior: "auto" });
      cam = maxCam;
      wake();
    }

    // Klikk töötab ka lennu ajal: navigeerime selle järgi, mis on kursori
    // all LAHTILASKMISE hetkel — kaamera triiv ei tühista enam vajutust.
    function handlePointerDown(event) {
      if (event.button !== 0) {
        return;
      }

      tap.active = true;
      tap.x = event.clientX;
      tap.y = event.clientY;
    }

    function handlePointerUp(event) {
      if (!tap.active || event.button !== 0) {
        return;
      }

      tap.active = false;

      const dx = event.clientX - tap.x;
      const dy = event.clientY - tap.y;

      if (dx * dx + dy * dy > 144) {
        return;
      }

      // Menüü, kerimisvihje ja finaali lingid käituvad tavapäraselt.
      const target = event.target;

      if (
        target &&
        target.closest &&
        target.closest(".site-header, .bfl-cue, .bfl-contactframe")
      ) {
        return;
      }

      // 1) Täpne DOM-tabamus, kui brauser selle annab.
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const link = hit && hit.closest ? hit.closest("a[href]") : null;

      if (link && viewport.contains(link) && link.closest("[data-z]")) {
        const href = link.getAttribute("href");

        if (href && href.startsWith("/")) {
          suppressClickUntil = performance.now() + 420;
          router.push(href);
          return;
        }

        return;
      }

      if (link) {
        return;
      }

      // 2) Varulahendus: kui oleme kunstniku juures, on kogu lava klikitav —
      // 3D-tabamustuvastuse ebakindlus ei sega enam kunagi.
      if (currentActiveRoom >= 0 && roomHrefs[currentActiveRoom]) {
        suppressClickUntil = performance.now() + 420;
        router.push(roomHrefs[currentActiveRoom]);
      }
    }

    function handleClickCapture(event) {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("pointerup", handlePointerUp, true);
    window.addEventListener("click", handleClickCapture, true);
    window.addEventListener("hashchange", jumpToContactHash);
    document.addEventListener("visibilitychange", handleVisibility);
    viewport.addEventListener("focusin", handleFocusIn);
    // Dekodeeri kõigi ruumide pildid intro ajal ette — esimene läbilend
    // ei maksa siis dekodeerimis-/üleslaadimispausi (hakkimist).
    const warmImages = window.setTimeout(() => {
      dolly.querySelectorAll("img").forEach((img) => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {});
        }
      });
    }, 700);

    jumpToContactHash();
    wake();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("pointerup", handlePointerUp, true);
      window.removeEventListener("click", handleClickCapture, true);
      window.removeEventListener("hashchange", jumpToContactHash);
      document.removeEventListener("visibilitychange", handleVisibility);
      viewport.removeEventListener("focusin", handleFocusIn);
      window.clearTimeout(warmImages);
      document.body.classList.remove("bfl-header-return");
      document.body.style.removeProperty("--hdr-o");
      document.body.style.removeProperty("--hdr-v");
      sleep();
    };
  }, [flat, maxCam, flightSpeed, rooms, router]);

  return (
    <section
      className={`bfl ${flat ? "bfl--flat" : ""} ${
        introReveal ? "bfl--intro" : ""
      }`}
    >
      <div className="bfl-viewport" ref={viewportRef}>
        <div aria-hidden="true" className="bfl-veil" />

        {flat ? null : (
          <LivingPaint
            intensity={0.75}
            palette={DEFAULT_PALETTE}
            paletteControlRef={paletteControlRef}
          />
        )}

        <div className="bfl-dolly" ref={dollyRef}>
          <header
            className="bfl-brand"
            data-env="brand"
            data-z={BRAND_Z}
            ref={brandRef}
            style={{ "--z": `${BRAND_Z}px` }}
          >
            <h1 aria-label={intro.title} className="bfl-brand__title">
              <span
                aria-hidden="true"
                className="bfl-brand__word bfl-brand__word--beyond"
              >
                {intro.brandWords[0]}
              </span>
              {intro.brandWords[1] ? (
                <span
                  aria-hidden="true"
                  className="bfl-brand__word bfl-brand__word--frames"
                >
                  {intro.brandWords[1]}
                </span>
              ) : null}
            </h1>
          </header>

          <p
            aria-label={intro.tagline}
            className="bfl-tagline"
            data-env="brand"
            data-z={TAGLINE_Z}
            style={{ "--z": `${TAGLINE_Z}px` }}
          >
            {intro.tagline.split(/\s+/).map((word, index) => (
              <span
                aria-hidden="true"
                className="bfl-tagline__word"
                key={`${word}-${index}`}
                style={{ "--wi": index }}
              >
                {word}
              </span>
            ))}
          </p>

          {rooms.map((room, index) => {
            const z = FIRST_ROOM_Z - index * ROOM_DEPTH;

            return (
              <Link
                aria-label={`${room.name} — ${labels.roomAria}`}
                className={`bfl-room ${
                  index % 2 === 0 ? "bfl-room--even" : "bfl-room--odd"
                }`}
                data-cam={Math.abs(z) - 850}
                data-env="room"
                data-z={z}
                href={room.href}
                key={room.slug}
                style={{ "--z": `${z}px` }}
              >
                {room.artwork ? (
                  <span aria-hidden="true" className="bfl-work">
                    <ArtworkFrame
                      artwork={room.artwork}
                      imageLoading="eager"
                      locale={locale}
                      showCaption={false}
                    />
                  </span>
                ) : null}

                <span className="bfl-persona">
                  <span aria-hidden="true" className="bfl-author">
                    <ArtistPortrait
                      artist={room.artist}
                      priority={index === 0}
                    />
                  </span>
                  <span className="bfl-nameplate">
                    <strong className="bfl-nameplate__name">
                      {room.name}
                    </strong>
                    <span className="bfl-nameplate__meta">
                      {room.role}
                      {room.countLabel ? (
                        <em className="bfl-nameplate__count">
                          {room.countLabel}
                        </em>
                      ) : null}
                    </span>
                    <span className="bfl-profile-btn">
                      {labels.profileButton}
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}

          <div
            className="bfl-finale"
            data-env="finale"
            data-z={finaleZ}
            style={{ "--z": `${finaleZ}px` }}
          >
            <div className="bfl-finale__inner" data-cam={maxCam}>
              <div className="bfl-contactframe">
                <div className="bfl-contactframe__mat">
                  <p aria-hidden="true" className="bfl-contactframe__brand">
                    <span>{intro.brandWords[0]}</span>
                    {intro.brandWords[1] ? (
                      <span className="bfl-contactframe__brand-second">
                        {intro.brandWords[1]}
                      </span>
                    ) : null}
                  </p>
                  <a
                    className="bfl-contactframe__mail"
                    href={`mailto:${finale.email}`}
                  >
                    {finale.email}
                  </a>
                  <a
                    className="bfl-contactframe__line"
                    href={`tel:${finale.phone.replace(/\s+/g, "")}`}
                  >
                    {finale.phone}
                  </a>
                  <span className="bfl-contactframe__byline">
                    2026 · L. Raudsoo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a
          aria-label={labels.scrollCueAria}
          className="bfl-cue"
          href="#artists-stop"
        >
          <span aria-hidden="true" className="bfl-cue__line" />
          {labels.scrollCue}
        </a>

        <div aria-hidden="true" className="bfl-marker" ref={markerRef}>
          <span className="bfl-marker__idx" ref={markerIdxRef} />
          <em className="bfl-marker__name" ref={markerNameRef} />
        </div>

        <div aria-hidden="true" className="bfl-grain" />
      </div>

      <div
        aria-hidden="true"
        className="bfl-track"
        style={{ height: `calc(100vh + ${Math.round(maxCam / flightSpeed)}px)` }}
      >
        <span
          className="bfl-anchor"
          id="artists-stop"
          style={{
            top: `${Math.round((Math.abs(FIRST_ROOM_Z) - 900) / flightSpeed)}px`,
          }}
        />
        <span
          className="bfl-anchor"
          id="contact"
          style={{ top: `${Math.round(maxCam / flightSpeed)}px` }}
        />
      </div>
    </section>
  );
}
