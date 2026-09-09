const SRS_DECK_PREFIX = "egyptian_lms_srs_vocab_deck";

export const LEGACY_SRS_DECK_STORAGE_KEY = SRS_DECK_PREFIX;

export interface SrsVocabCardData {
  id: string;
  word: string;
  phonics: string;
  arabicMeaning: string;
  exampleSentence: string;
  category: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string;
}

const DEFAULT_CONNECT_VOCAB: Array<
  Omit<SrsVocabCardData, "intervalDays" | "repetitions" | "easeFactor" | "dueDate">
> = [
  {
    id: "vocab-1",
    word: "Busy Bee",
    phonics: "/b/ sound & double /ee/",
    arabicMeaning: "النحلة النشيطة (شخصية المنهج المحبوبة)",
    exampleSentence: "Look at the Busy Bee flying to the flower!",
    category: "Connect Characters 🐝",
  },
  {
    id: "vocab-2",
    word: "Book",
    phonics: "Short /oo/ sound",
    arabicMeaning: "كتاب مدرسي",
    exampleSentence: "Open your book to page 10, please.",
    category: "School Objects 📚",
  },
  {
    id: "vocab-3",
    word: "Bag",
    phonics: "Short /æ/ sound",
    arabicMeaning: "حقيبة مدرسية",
    exampleSentence: "Put your pencil inside your blue bag.",
    category: "School Objects 🎒",
  },
  {
    id: "vocab-4",
    word: "Hello",
    phonics: "/h/ sound",
    arabicMeaning: "مرحباً / أهلاً",
    exampleSentence: "Hello! My name is Hany.",
    category: "Greetings 👋",
  },
  {
    id: "vocab-5",
    word: "Shake hands",
    phonics: "/sh/ sound & silent e",
    arabicMeaning: "يتصافح بالأيدي (آداب السلوك)",
    exampleSentence: "When you meet a new friend, shake hands.",
    category: "Good Manners 🤝",
  },
];

export function getSrsDeckStorageKey(userId?: string | null): string | null {
  const normalizedUserId = userId?.trim();
  return normalizedUserId
    ? `${SRS_DECK_PREFIX}:${encodeURIComponent(normalizedUserId)}`
    : null;
}

export function buildDefaultSrsDeck(): SrsVocabCardData[] {
  const dueDate = new Date().toISOString();
  return DEFAULT_CONNECT_VOCAB.map((card) => ({
    ...card,
    intervalDays: 1,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate,
  }));
}

export function mergeSrsDeckWithDefaults(savedDeck: unknown): SrsVocabCardData[] {
  const storedCards = Array.isArray(savedDeck)
    ? savedDeck.filter(
        (card): card is SrsVocabCardData =>
          Boolean(card) &&
          typeof card === "object" &&
          typeof (card as { id?: unknown }).id === "string" &&
          typeof (card as { word?: unknown }).word === "string"
      )
    : [];
  const storedIds = new Set(storedCards.map((card) => card.id));

  return [
    ...storedCards,
    ...buildDefaultSrsDeck().filter((card) => !storedIds.has(card.id)),
  ];
}
