// Simple username profanity filter — no external deps
const BLOCKED = [
  "fuck", "fuk", "f_ck", "sh1t", "shit", "ass", "bitch", "cunt", "dick",
  "cock", "pussy", "nigger", "nigga", "faggot", "fag", "retard", "whore",
  "slut", "bastard", "asshole", "prick", "twat", "wank", "dildo", "penis",
  "vagina", "anus", "tits", "boob", "porn", "sex", "nazi", "hitler",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return BLOCKED.some((word) => lower.includes(word));
}
