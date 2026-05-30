// lib/sports-config.ts — Konfigurasi spesifik per cabang olahraga
// Ikon olahraga dirender via SportIcon component (src/components/icons/SportIcons.tsx)

import type { SportConfig, SportType } from '@/types/core';

export const sportsConfig: Record<SportType, SportConfig> = {
  football: {
    type: 'football',
    label: 'Sepak Bola',
    periods: 2,
    periodLabel: 'Babak',
    timerMode: 'stopwatch',
    defaultTimerSeconds: 45 * 60,
    scoreButtons: [
      { label: 'Gol', points: 1, eventType: 'goal', color: 'primary' },
      { label: 'Bunuh Diri', points: 1, eventType: 'own_goal', color: 'secondary' },
      { label: 'Penalti', points: 1, eventType: 'penalty_goal', color: 'accent' },
    ],
  },
  basketball: {
    type: 'basketball',
    label: 'Basket',
    periods: 4,
    periodLabel: 'Quarter',
    timerMode: 'countdown',
    defaultTimerSeconds: 10 * 60,
    scoreButtons: [
      { label: '+1 Free Throw', points: 1, eventType: 'free_throw', color: 'secondary' },
      { label: '+2 Field Goal', points: 2, eventType: 'field_goal_2', color: 'primary' },
      { label: '+3 Three Point', points: 3, eventType: 'field_goal_3', color: 'accent' },
    ],
  },
  futsal: {
    type: 'futsal',
    label: 'Futsal',
    periods: 2,
    periodLabel: 'Babak',
    timerMode: 'countdown',
    defaultTimerSeconds: 20 * 60,
    scoreButtons: [
      { label: 'Gol', points: 1, eventType: 'goal', color: 'primary' },
      { label: 'Bunuh Diri', points: 1, eventType: 'own_goal', color: 'secondary' },
      { label: 'Penalti', points: 1, eventType: 'penalty_goal', color: 'accent' },
    ],
  },
  volleyball: {
    type: 'volleyball',
    label: 'Voli',
    periods: 5,
    periodLabel: 'Set',
    timerMode: 'stopwatch',
    defaultTimerSeconds: 0,
    maxScore: 25,
    setsToWin: 3,
    scoreButtons: [
      { label: 'Poin', points: 1, eventType: 'point', color: 'primary' },
      { label: 'Service Ace', points: 1, eventType: 'service_ace', color: 'accent' },
    ],
  },
  badminton: {
    type: 'badminton',
    label: 'Badminton',
    periods: 3,
    periodLabel: 'Set',
    timerMode: 'stopwatch',
    defaultTimerSeconds: 0,
    maxScore: 21,
    setsToWin: 2,
    scoreButtons: [
      { label: 'Poin', points: 1, eventType: 'point', color: 'primary' },
    ],
  },
};

export function getSportConfig(sport: SportType): SportConfig {
  return sportsConfig[sport];
}

export function getSportLabel(sport: SportType): string {
  return sportsConfig[sport].label;
}

// Ikon olahraga: gunakan SportIcon component dari src/components/icons/SportIcons.tsx

export function getEventLabel(eventType: string): string {
  const labels: Record<string, string> = {
    goal: 'Gol',
    own_goal: 'Gol Bunuh Diri',
    penalty_goal: 'Gol Penalti',
    field_goal_2: 'Field Goal (+2)',
    field_goal_3: 'Three Point (+3)',
    free_throw: 'Free Throw (+1)',
    point: 'Poin',
    service_ace: 'Service Ace',
    correction: 'Koreksi/Undo',
  };
  return labels[eventType] ?? eventType;
}

export function getPeriodLabel(sport: SportType, period: number): string {
  const config = sportsConfig[sport];
  return `${config.periodLabel} ${period}`;
}

// Cek apakah set/babak sudah selesai (untuk voli/badminton)
export function isPeriodComplete(
  sport: SportType,
  scoreHome: number,
  scoreAway: number,
): boolean {
  const config = sportsConfig[sport];
  if (!config.maxScore) return false;

  const maxScore = config.maxScore;
  const minDiff = 2;

  // Set selesai jika salah satu mencapai maxScore dengan selisih ≥2
  // atau jika mencapai maxScore+2 (untuk deuce situation)
  if (scoreHome >= maxScore && scoreHome - scoreAway >= minDiff) return true;
  if (scoreAway >= maxScore && scoreAway - scoreHome >= minDiff) return true;
  return false;
}

// Cek pemenang pertandingan voli/badminton
export function getSetWinner(
  scoreHome: number,
  scoreAway: number,
): 'home' | 'away' | null {
  if (scoreHome > scoreAway) return 'home';
  if (scoreAway > scoreHome) return 'away';
  return null;
}
