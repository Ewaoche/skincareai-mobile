import { AnalysisScores } from '@/lib/api/analysis-api';

type ScoreKey = keyof AnalysisScores;

const scoreLabels: Record<ScoreKey, string> = {
  acne: 'Acne',
  pigmentation: 'Pigmentation',
  skinTone: 'Skin Tone',
  pores: 'Pores',
  moisture: 'Moisture',
  oiliness: 'Oiliness',
  wrinkles: 'Wrinkles',
};

export function getAverageScore(scores: AnalysisScores): number {
  const values = Object.values(scores);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getOverallGrade(scores: AnalysisScores): string {
  const average = getAverageScore(scores);

  if (average >= 85) {
    return 'A';
  }
  if (average >= 70) {
    return 'B';
  }
  if (average >= 55) {
    return 'C';
  }
  if (average >= 40) {
    return 'D';
  }

  return 'E';
}

export function getScoreNarrative(scores: AnalysisScores): string {
  const average = getAverageScore(scores);

  if (average >= 85) {
    return 'Your current score set looks strong overall, with only light refinement needed across the measured concerns.';
  }
  if (average >= 70) {
    return 'Your analysis suggests a generally healthy profile with a few areas worth closer routine support.';
  }
  if (average >= 55) {
    return 'Your skin profile looks mixed right now, with several concerns that could benefit from a more targeted routine.';
  }
  if (average >= 40) {
    return 'This result suggests noticeable room for improvement across multiple concerns, especially in the weaker score bands.';
  }

  return 'This result suggests your skin needs focused support across several concern areas right now.';
}

export function getWeakestConcerns(
  scores: AnalysisScores,
  limit = 3,
): Array<{ key: ScoreKey; label: string; score: number }> {
  return (Object.entries(scores) as Array<[ScoreKey, number]>)
    .sort((left, right) => left[1] - right[1])
    .slice(0, limit)
    .map(([key, score]) => ({
      key,
      label: scoreLabels[key],
      score,
    }));
}
