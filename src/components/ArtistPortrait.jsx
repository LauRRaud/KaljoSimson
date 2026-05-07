import Image from "next/image";
import { getPortraitPreset } from "@/lib/visuals";

const portraitVariants = {
  dawn: {
    aura: "M56 112C88 38 157 10 214 16c60 7 106 47 122 118 11 50 2 92-25 130-41 56-107 87-171 81-77-7-138-61-147-145-4-34 2-70 21-88Z",
    garment: "M71 430c8-66 24-118 51-157 27-39 66-60 113-60 42 0 73 15 95 46 29 39 42 95 30 171H71Z",
    neck: "M184 227c-2-13 2-29 10-42h38c8 14 11 28 8 42-9 12-19 18-29 18-11 0-20-6-27-18Z",
    face: "M173 95c36-11 73 7 91 44 17 36 8 77-19 105-29 29-74 35-108 14-33-21-49-66-37-103 11-33 38-52 73-60Z",
    hairBack: "M133 119c17-38 52-66 92-71 30-4 64 7 88 28 34 28 56 76 53 129-2 48-22 94-56 126-14-48-33-87-64-111-25-20-51-33-87-29-18 2-34 8-48 16-6-31-1-61 22-88Z",
    hairFront: "M135 154c8-21 29-41 58-52 18-7 45-8 61-3-20 22-36 47-35 86 0 39 17 76 37 105-18 16-45 28-67 29-33 2-62-10-82-34-34-40-30-92-7-131 9 1 24 1 35 0Z",
    profile: "M218 150c13 7 23 17 29 31 6 15 5 33-4 49-7 12-18 23-31 29-15 6-32 7-47 3",
  },
  ember: {
    aura: "M34 136c20-80 80-120 158-120 90 0 149 47 153 126 3 53-18 92-61 115-35 20-72 25-124 24-55-1-98-10-123-44-22-30-24-61-3-101Z",
    garment: "M58 430c14-72 33-124 62-157 26-31 60-47 103-47 49 0 84 16 107 49 29 42 37 92 31 155H58Z",
    neck: "M191 233c1-16 6-28 16-39h31c5 12 7 25 4 39-7 10-15 15-24 15-11 0-20-5-27-15Z",
    face: "M159 102c29-16 72-10 99 14 31 27 41 73 22 109-17 34-56 58-98 54-37-4-68-33-75-67-8-38 12-86 52-110Z",
    hairBack: "M139 113c17-51 57-82 111-82 47 0 91 23 113 62 29 49 24 112-5 158-16 25-39 45-69 57 2-31-3-61-17-90-13-27-32-48-59-62-32-16-54-15-88-8-2-11 2-25 14-35Z",
    hairFront: "M150 121c30-11 65-11 94 3 13 6 24 14 33 24-19 8-39 29-49 50-12 24-15 52-10 80-25 20-56 31-88 29-33-2-65-19-82-47-19-31-19-75 3-108 22-15 62-28 99-31Z",
    profile: "M228 155c14 8 24 21 27 37 4 15 0 31-8 43-9 12-23 22-39 26-15 4-31 2-44-4",
  },
  tide: {
    aura: "M54 138c13-63 44-108 92-124 48-15 115-7 162 30 45 34 64 82 51 145-13 59-53 95-110 112-39 12-86 13-131-1-71-23-82-92-64-162Z",
    garment: "M82 430c4-61 15-111 40-152 31-50 80-75 127-75 40 0 73 12 99 36 35 31 55 88 55 191H82Z",
    neck: "M193 222c0-12 4-23 13-34h28c6 11 8 24 7 36-9 10-19 15-28 15-8 0-15-6-20-17Z",
    face: "M169 93c31-13 71-5 97 18 28 23 40 62 29 98-13 43-54 69-99 70-39 1-73-26-84-61-11-37 8-92 57-125Z",
    hairBack: "M122 114c20-45 63-76 113-78 40-2 80 14 108 44 38 42 51 110 26 169-17 42-50 75-95 93 6-48 4-88-13-121-15-31-39-53-68-67-23-11-45-17-65-17-11 0-19 1-28 4-2-10 5-20 22-27Z",
    hairFront: "M140 128c31-13 70-13 100 1 16 8 28 18 39 32-19 11-36 31-44 57-10 30-5 65 9 97-18 17-40 30-68 35-47 8-99-13-125-50-19-29-23-66-10-102 15-30 49-57 99-70Z",
    profile: "M224 149c13 8 23 20 27 35 5 15 3 31-5 44-8 13-21 22-35 28-13 5-30 7-46 4",
  },
};

export default function ArtistPortrait({ artist, priority = false }) {
  const preset = getPortraitPreset(artist.portraitPresetId);
  const variant = portraitVariants[preset.id] || portraitVariants.dawn;

  if (artist.portraitImage) {
    return (
      <div className="portrait-shell" style={{ "--portrait-bg": preset.background }}>
        <Image
          alt={artist.name}
          className="portrait-shell__image"
          fill
          loading={priority ? "eager" : undefined}
          priority={priority}
          sizes="(max-width: 1100px) 100vw, 33vw"
          src={artist.portraitImage}
        />
      </div>
    );
  }

  return (
    <div className="portrait-shell" style={{ "--portrait-bg": preset.background }}>
      <svg
        aria-label={`${artist.name} portree`}
        className="portrait-shell__art"
        role="img"
        viewBox="0 0 420 500"
      >
        <defs>
          <linearGradient id={`${preset.id}-garment`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={preset.garment} />
            <stop offset="100%" stopColor={preset.garmentShade} />
          </linearGradient>
          <linearGradient id={`${preset.id}-face`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={preset.skin} />
            <stop offset="100%" stopColor={preset.skinShade} />
          </linearGradient>
          <radialGradient id={`${preset.id}-halo`} cx="50%" cy="36%" r="54%">
            <stop offset="0%" stopColor={preset.halo} stopOpacity="0.75" />
            <stop offset="100%" stopColor={preset.halo} stopOpacity="0" />
          </radialGradient>
          <filter id={`${preset.id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        <ellipse
          cx="210"
          cy="104"
          fill={`url(#${preset.id}-halo)`}
          rx="136"
          ry="118"
        />
        <path
          d={variant.aura}
          fill={preset.aura}
          filter={`url(#${preset.id}-blur)`}
          opacity="0.65"
        />
        <path d={variant.hairBack} fill={preset.hair} opacity="0.96" />
        <path d={variant.garment} fill={`url(#${preset.id}-garment)`} />
        <path d={variant.neck} fill={`url(#${preset.id}-face)`} opacity="0.95" />
        <path d={variant.face} fill={`url(#${preset.id}-face)`} />
        <path d={variant.hairFront} fill={preset.hairShade} opacity="0.95" />
        <path
          d={variant.profile}
          fill="none"
          opacity="0.55"
          stroke={preset.ink}
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M118 428c19-58 44-100 75-126 30-26 70-40 118-45"
          fill="none"
          opacity="0.08"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth="24"
        />
      </svg>
    </div>
  );
}
