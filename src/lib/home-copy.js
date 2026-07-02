export const homeCopy = {
  scrollCue: {
    et: "Keri sisse",
    en: "Scroll in",
  },
  scrollCueAria: {
    et: "Keri kunstnikeni",
    en: "Scroll to the artists",
  },
  roomAria: {
    et: "Ava kunstniku profiil",
    en: "Open the artist's profile",
  },
  viewProfile: {
    et: "Vaata profiili",
    en: "View profile",
  },
  profileButton: {
    et: "Profiil",
    en: "Profile",
  },
  worksOne: {
    et: "1 teos",
    en: "1 work",
  },
  doorLabel: {
    et: "Galerii",
    en: "Gallery",
  },
  doorHint: {
    et: "Astu läbi — kõik teosed ühes ruumis",
    en: "Step through — all works in one room",
  },
  progressStart: {
    et: "Algus",
    en: "Start",
  },
  progressEnd: {
    et: "Galerii uks",
    en: "Gallery door",
  },
};

export function getWorksCountLabel(count, locale) {
  if (locale === "en") {
    return count === 1 ? "1 work" : `${count} works`;
  }

  return count === 1 ? "1 teos" : `${count} teost`;
}
