"use client";

import Link from "next/link";
import { useState } from "react";
import FramePresetSwitch from "@/components/FramePresetSwitch";
import GalleryClient from "@/components/GalleryClient";

const roomSpeedOptions = [
  {
    id: "slow",
    label: {
      et: "Aeglasem liikumine",
      en: "Slower movement",
    },
    displayLabel: {
      et: "Aeglasem",
      en: "Slower",
    },
  },
  {
    id: "normal",
    label: {
      et: "Keskmine liikumine",
      en: "Medium movement",
    },
    displayLabel: {
      et: "Keskmine",
      en: "Medium",
    },
  },
  {
    id: "fast",
    label: {
      et: "Kiirem liikumine",
      en: "Faster movement",
    },
    displayLabel: {
      et: "Kiirem",
      en: "Faster",
    },
  },
];

function isRoomSpeed(value) {
  return roomSpeedOptions.some((option) => option.id === value);
}

function getSpeedLabel(speed, locale) {
  return speed.label[locale] || speed.label.et;
}

function getSpeedDisplayLabel(speed, locale) {
  return speed.displayLabel[locale] || speed.displayLabel.et;
}

export default function GalleryRoomExperience({
  artist,
  backHref,
  backLabel,
  defaultFramePreset = "bronze",
  defaultRoomSpeed = "normal",
  locale = "et",
}) {
  const initialRoomSpeed = isRoomSpeed(defaultRoomSpeed) ? defaultRoomSpeed : "normal";
  const [roomSpeed, setRoomSpeed] = useState(initialRoomSpeed);

  return (
    <>
      <div className="gallery-room-page__topbar">
        <Link className="gallery-room-page__back" href={backHref}>
          {backLabel}
        </Link>

        <div className="gallery-room-page__control-group">
          <div
            aria-label={locale === "en" ? "Movement speed" : "Liikumise kiirus"}
            className="gallery-room-speed"
            role="group"
          >
            {roomSpeedOptions.map((speed) => {
              const active = roomSpeed === speed.id;
              const label = getSpeedLabel(speed, locale);

              return (
                <button
                  aria-label={label}
                  aria-pressed={active}
                  className={`gallery-room-speed__button${
                    active ? " gallery-room-speed__button--active" : ""
                  }`}
                  key={speed.id}
                  onClick={() => setRoomSpeed(speed.id)}
                  title={label}
                  type="button"
                >
                  {getSpeedDisplayLabel(speed, locale)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* raamivärvi valik elab all paremas nurgas, oma sildiga */}
      <div className="gallery-room-page__frame-picker">
        <span className="gallery-room-page__frame-picker-label">
          {locale === "en" ? "Frame colour" : "Raami värv"}
        </span>
        <FramePresetSwitch defaultPreset={defaultFramePreset} locale={locale} />
      </div>

      <GalleryClient
        artist={artist}
        locale={locale}
        roomSpeed={roomSpeed}
        variant="room"
      />
    </>
  );
}
