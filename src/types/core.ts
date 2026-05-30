// types/core.ts — Core types untuk Sistem Skor Olahraga Multi-Cabang

export type SportType = 'football' | 'basketball' | 'futsal' | 'volleyball' | 'badminton';

export type MatchStatus = 'scheduled' | 'live' | 'paused' | 'finished' | 'cancelled';

export type TournamentFormat = 'round_robin' | 'single_elimination' | 'double_elimination' | 'group_then_knockout';

export interface Team {
  id: string;
  name: string;
  shortName: string; // maks 4 karakter untuk display skor kompak
  colorPrimary: string; // hex
  colorSecondary: string; // hex
  logoDataUrl?: string; // base64 dari upload lokal
  createdAt: string; // ISO 8601
}

export interface ScoreEvent {
  id: string;
  timestamp: string; // ISO 8601
  teamId: string;
  type: ScoreEventType;
  points: number;
  period: number;
  note?: string;
}

export type ScoreEventType =
  // Football & Futsal
  | 'goal' | 'own_goal' | 'penalty_goal'
  // Basketball
  | 'field_goal_2' | 'field_goal_3' | 'free_throw'
  // Volleyball
  | 'point' | 'service_ace'
  // Badminton
  // 'point' sudah ada di atas
  // Universal
  | 'correction';

export interface MatchPeriod {
  number: number;
  label: string; // "Babak 1", "Quarter 2", "Set 3", dll
  durationSeconds?: number;
  startedAt?: string;
  endedAt?: string;
  scoreHome: number;
  scoreAway: number;
}

export interface Match {
  id: string;
  sport: SportType;
  tournamentId?: string;
  round?: number;
  matchNumber?: number;
  teamHome: Team;
  teamAway: Team;
  status: MatchStatus;
  events: ScoreEvent[];
  periods: MatchPeriod[];
  currentPeriod: number;
  timerState: TimerState;
  totalScoreHome: number;
  totalScoreAway: number;
  winner?: 'home' | 'away' | 'draw';
  scheduledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TimerState {
  mode: 'stopwatch' | 'countdown';
  totalSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  lastStartedAt?: string;
}

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  format: TournamentFormat;
  teams: Team[];
  matches: Match[];
  status: 'upcoming' | 'ongoing' | 'finished';
  champion?: Team;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  description?: string;
}

export type ThemeName = 'stadium' | 'court' | 'night_game' | 'retro_pitch' | 'minimal_sport';

export interface AppSettings {
  theme: ThemeName;
  accentColor: string;
  displayMode: 'normal' | 'scoreboard';
  animationsEnabled: boolean;
  soundEnabled: boolean;
  timerFormat: '24h' | 'elapsed';
  defaultSport: SportType;
  language: 'id';
}

export interface CreateMatchConfig {
  sport: SportType;
  teamHome: Team;
  teamAway: Team;
  tournamentId?: string;
  round?: number;
  matchNumber?: number;
  scheduledAt?: string;
}

export interface CreateTournamentConfig {
  name: string;
  sport: SportType;
  format: TournamentFormat;
  description?: string;
  teams: Team[];
}

export interface ConfirmDialogState {
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

// Sport-specific config
export interface SportConfig {
  type: SportType;
  label: string;
  // icon: dirender via SportIcon component di components/icons/SportIcons.tsx
  periods: number;
  periodLabel: string; // "Babak", "Quarter", "Set"
  timerMode: 'stopwatch' | 'countdown';
  defaultTimerSeconds: number; // 0 = tanpa batas
  scoreButtons: ScoreButton[];
  maxScore?: number; // untuk badminton/voli per set
  setsToWin?: number; // untuk voli/badminton
}

export interface ScoreButton {
  label: string;
  points: number;
  eventType: ScoreEventType;
  color: 'primary' | 'secondary' | 'accent';
}

// Standing untuk round-robin
export interface TeamStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
