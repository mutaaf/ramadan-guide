// ── Curated Content (static JSON) ──

export interface Scholar {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
  links: { youtube?: string; website?: string };
}

export interface Series {
  id: string;
  scholarId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  tags: string[];
  episodeCount: number;
  totalDuration: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface SeriesIndex {
  scholars: Scholar[];
  series: Series[];
  lastUpdated: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  episodeNumber: number;
  title: string;
  duration: string;
  youtubeUrl?: string;
  publishedAt?: string;
  status?: "draft" | "published"; // undefined = published (backwards compat)
}

export interface DiscussionQuestion {
  question: string;
  context?: string;
}

export interface GlossaryTerm {
  term: string;
  arabic?: string;
  definition: string;
  context: string;
}

export interface RecommendedResource {
  title: string;
  type: "book" | "article" | "video" | "tafsir" | "hadith-collection";
  description?: string;
  url?: string;
}

export interface CrossEpisodeConnection {
  episodeId: string;
  episodeTitle: string;
  connection: string;
}

export interface CompanionGuide {
  episodeId: string;
  generatedAt: string;
  summary: string;
  hadiths: ExtractedHadith[];
  verses: ExtractedVerse[];
  keyQuotes: KeyQuote[];
  actionItems: ActionItem[];
  nextSteps: string[];
  themes: string[];
  relatedEpisodes?: string[];
  discussionQuestions?: DiscussionQuestion[];
  glossary?: GlossaryTerm[];
  recommendedResources?: RecommendedResource[];
  crossEpisodeConnections?: CrossEpisodeConnection[];
}

export interface ExtractedHadith {
  text: string;
  source: string;
  narrator?: string;
  context: string;
}

export interface ExtractedVerse {
  arabic?: string;
  translation: string;
  reference: string;
  context: string;
}

export interface KeyQuote {
  text: string;
  timestamp?: string;
}

export interface ActionItem {
  text: string;
  category: "spiritual" | "practical" | "social" | "study";
}

export interface SavedActionItem {
  id: string;           // "{seriesId}:{episodeId}:{index}"
  text: string;
  category: "spiritual" | "practical" | "social" | "study";
  episodeId: string;
  seriesId: string;
  completed: boolean;
  savedAt: number;
}

// Per-series file: public/data/series/{id}/episodes.json
export interface SeriesEpisodeData {
  seriesId: string;
  episodes: Episode[];
  companions: Record<string, CompanionGuide>;
}

// ── User Data (Zustand store) ──

export interface SeriesUserData {
  completedEpisodes: Record<string, boolean>;
  bookmarkedEpisodes: Record<string, boolean>;
  episodeNotes: Record<string, string>;
  lastViewed: { seriesId: string; episodeId: string; timestamp: number } | null;
  seriesProgress: Record<string, { startedAt: number; lastEpisodeId: string }>;
  savedActionItems: Record<string, SavedActionItem>;
}

export const createDefaultSeriesUserData = (): SeriesUserData => ({
  completedEpisodes: {},
  bookmarkedEpisodes: {},
  episodeNotes: {},
  lastViewed: null,
  seriesProgress: {},
  savedActionItems: {},
});

// ── Admin Types ──

export interface AdminGenerationStatus {
  episodeId: string;
  status: "pending" | "transcribing" | "analyzing" | "complete" | "error";
  progress: number;
  error?: string;
  transcript?: string;
  companion?: CompanionGuide;
}
