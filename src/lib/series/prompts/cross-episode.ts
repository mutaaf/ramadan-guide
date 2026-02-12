interface CrossEpisodeInput {
  currentEpisode: {
    episodeId: string;
    episodeTitle: string;
    themes: string[];
    summary: string;
  };
  otherEpisodes: {
    episodeId: string;
    episodeTitle: string;
    themes: string[];
    summary: string;
  }[];
  seriesTitle: string;
  scholarName: string;
}

export function buildCrossEpisodePrompts(input: CrossEpisodeInput) {
  const systemPrompt = `You are an Islamic studies assistant that identifies thematic connections between episodes in a lecture series. Given the current episode's themes and summary, find meaningful connections to other episodes in the same series.

Only identify genuine thematic connections — shared topics, progressive arguments, complementary concepts, or direct references. Do not force connections where none exist.

Respond in JSON format:
{
  "connections": [
    {
      "episodeId": "the connected episode's ID",
      "episodeTitle": "the connected episode's title",
      "connection": "1-2 sentence description of how the episodes connect thematically"
    }
  ]
}

Return an empty connections array if no meaningful connections exist. Maximum 3 connections.`;

  const otherEpisodesSummary = input.otherEpisodes
    .map(
      (ep) =>
        `- "${ep.episodeTitle}" (${ep.episodeId}): Themes: ${ep.themes.join(", ")}. ${ep.summary}`
    )
    .join("\n");

  const userPrompt = `Series: "${input.seriesTitle}" by ${input.scholarName}

Current episode: "${input.currentEpisode.episodeTitle}" (${input.currentEpisode.episodeId})
Themes: ${input.currentEpisode.themes.join(", ")}
Summary: ${input.currentEpisode.summary}

Other episodes in the series:
${otherEpisodesSummary}

Identify meaningful thematic connections between the current episode and the other episodes.`;

  return { systemPrompt, userPrompt };
}
