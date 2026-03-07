import Filter from "bad-words";

const filter = new Filter();

// Extra slop-specific additions
filter.addWords("slur", "n1gger", "f4ggot");

export function containsProfanity(text: string): boolean {
  try {
    return filter.isProfane(text);
  } catch {
    return false;
  }
}
