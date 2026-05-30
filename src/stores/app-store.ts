// stores/app-store.ts — Zustand store utama dengan persist middleware

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { generateId, nowISO } from '@/lib/utils';
import { sportsConfig, getSetWinner } from '@/lib/sports-config';
import type {
  Team,
  Match,
  Tournament,
  AppSettings,
  ScoreEvent,
  MatchPeriod,
  MatchStatus,
  CreateMatchConfig,
  CreateTournamentConfig,
  ConfirmDialogState,
  TeamStanding,
  SportType,
} from '@/types/core';

// ─── Default values ───────────────────────────────────────────────

const defaultSettings: AppSettings = {
  theme: 'stadium',
  accentColor: '#2ea043',
  displayMode: 'normal',
  animationsEnabled: true,
  soundEnabled: false,
  timerFormat: 'elapsed',
  defaultSport: 'football',
  language: 'id',
};

// ─── Store interface ───────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  activeView: 'scoreboard' | 'matches' | 'tournaments' | 'history' | 'teams' | 'settings';
  confirmDialog: ConfirmDialogState | null;
}

interface AppStore {
  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Teams
  teams: Team[];
  addTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Team;
  updateTeam: (id: string, partial: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Matches
  matches: Match[];
  activeMatchId: string | null;
  createMatch: (config: CreateMatchConfig) => Match;
  startMatch: (id: string) => void;
  pauseMatch: (id: string) => void;
  resumeMatch: (id: string) => void;
  finishMatch: (id: string) => void;
  cancelMatch: (id: string) => void;
  addScoreEvent: (matchId: string, event: Omit<ScoreEvent, 'id' | 'timestamp'>) => void;
  undoLastEvent: (matchId: string) => void;
  advancePeriod: (matchId: string) => void;
  setActiveMatch: (id: string | null) => void;

  // Timer
  tickTimer: (matchId: string) => void;

  // Tournaments
  tournaments: Tournament[];
  activeTournamentId: string | null;
  createTournament: (config: CreateTournamentConfig) => Tournament;
  generateMatches: (tournamentId: string) => void;
  setActiveTournament: (id: string | null) => void;
  updateTournamentStandings: (tournamentId: string) => void;
  finishTournament: (tournamentId: string) => void;

  // UI State (tidak di-persist)
  ui: UIState;
  setUi: (partial: Partial<UIState>) => void;

  // Export
  exportMatchToJSON: (matchId: string) => void;
  exportTournamentToJSON: (tournamentId: string) => void;

  // Reset
  clearAllData: () => void;
}

// ─── Helper: build initial periods ────────────────────────────────

function buildInitialPeriods(sport: SportType): MatchPeriod[] {
  const config = sportsConfig[sport];
  return Array.from({ length: config.periods }, (_, i) => ({
    number: i + 1,
    label: `${config.periodLabel} ${i + 1}`,
    durationSeconds: config.defaultTimerSeconds || undefined,
    scoreHome: 0,
    scoreAway: 0,
  }));
}

// ─── Helper: recalculate totals ─────────────────────────────────

function recalcTotals(match: Match): void {
  // For set-based sports (voli, badminton): count sets won
  const config = sportsConfig[match.sport];
  if (config.setsToWin) {
    let homeSets = 0;
    let awaySets = 0;
    match.periods.forEach((p) => {
      const winner = getSetWinner(p.scoreHome, p.scoreAway);
      if (winner === 'home') homeSets++;
      if (winner === 'away') awaySets++;
    });
    match.totalScoreHome = homeSets;
    match.totalScoreAway = awaySets;
  } else {
    match.totalScoreHome = match.periods.reduce((s, p) => s + p.scoreHome, 0);
    match.totalScoreAway = match.periods.reduce((s, p) => s + p.scoreAway, 0);
  }
}

// ─── Helper: determine match winner ─────────────────────────────

function determineWinner(match: Match): 'home' | 'away' | 'draw' | undefined {
  if (match.totalScoreHome > match.totalScoreAway) return 'home';
  if (match.totalScoreAway > match.totalScoreHome) return 'away';
  // No draw in set-based sports
  const config = sportsConfig[match.sport];
  if (config.setsToWin) return undefined;
  return 'draw';
}

// ─── Round-robin standings ────────────────────────────────────────

export function calculateStandings(tournament: Tournament): TeamStanding[] {
  const standings = new Map<string, TeamStanding>();

  tournament.teams.forEach((team) => {
    standings.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  tournament.matches
    .filter((m) => m.status === 'finished')
    .forEach((match) => {
      const home = standings.get(match.teamHome.id);
      const away = standings.get(match.teamAway.id);
      if (!home || !away) return;

      home.played++;
      away.played++;
      home.goalsFor += match.totalScoreHome;
      home.goalsAgainst += match.totalScoreAway;
      away.goalsFor += match.totalScoreAway;
      away.goalsAgainst += match.totalScoreHome;

      if (match.winner === 'home') {
        home.won++; home.points += 3;
        away.lost++;
      } else if (match.winner === 'away') {
        away.won++; away.points += 3;
        home.lost++;
      } else if (match.winner === 'draw') {
        home.drawn++; home.points += 1;
        away.drawn++; away.points += 1;
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    });

  return Array.from(standings.values()).sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor,
  );
}

// ─── Round-robin schedule generator ─────────────────────────────

function generateRoundRobinMatches(
  tournamentId: string,
  sport: SportType,
  teams: Team[],
): Match[] {
  const matches: Match[] = [];
  const now = nowISO();
  let matchNumber = 1;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const homeTeam = teams[i]!;
      const awayTeam = teams[j]!;
      matches.push({
        id: generateId(),
        sport,
        tournamentId,
        round: Math.floor(matchNumber / 2) + 1,
        matchNumber: matchNumber++,
        teamHome: homeTeam,
        teamAway: awayTeam,
        status: 'scheduled' as MatchStatus,
        events: [],
        periods: buildInitialPeriods(sport),
        currentPeriod: 1,
        timerState: {
          mode: sportsConfig[sport].timerMode,
          totalSeconds: sportsConfig[sport].defaultTimerSeconds,
          elapsedSeconds: 0,
          isRunning: false,
        },
        totalScoreHome: 0,
        totalScoreAway: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return matches;
}

// Single elimination bracket
function generateSingleEliminationMatches(
  tournamentId: string,
  sport: SportType,
  teams: Team[],
): Match[] {
  const matches: Match[] = [];
  const now = nowISO();
  // Pad to next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(teams.length)));
  const paddedTeams: (Team | null)[] = [
    ...teams,
    ...Array(size - teams.length).fill(null),
  ];

  let matchNumber = 1;
  let round = 1;
  let currentRound = paddedTeams;

  while (currentRound.length > 1) {
    for (let i = 0; i < currentRound.length; i += 2) {
      const t1 = currentRound[i];
      const t2 = currentRound[i + 1];
      if (t1 && t2) {
        matches.push({
          id: generateId(),
          sport,
          tournamentId,
          round,
          matchNumber: matchNumber++,
          teamHome: t1,
          teamAway: t2,
          status: 'scheduled' as MatchStatus,
          events: [],
          periods: buildInitialPeriods(sport),
          currentPeriod: 1,
          timerState: {
            mode: sportsConfig[sport].timerMode,
            totalSeconds: sportsConfig[sport].defaultTimerSeconds,
            elapsedSeconds: 0,
            isRunning: false,
          },
          totalScoreHome: 0,
          totalScoreAway: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    // Next round akan diisi manual saat pertandingan selesai
    currentRound = Array(currentRound.length / 2).fill(null);
    round++;
  }

  return matches;
}

// ─── Store definition ──────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get) => ({
      // ── Settings ──
      settings: defaultSettings,
      updateSettings: (partial) =>
        set((state) => {
          Object.assign(state.settings, partial);
        }),

      // ── Teams ──
      teams: [],
      addTeam: (teamData) => {
        const team: Team = {
          ...teamData,
          id: generateId(),
          createdAt: nowISO(),
        };
        set((state) => {
          state.teams.push(team);
        });
        return team;
      },
      updateTeam: (id, partial) =>
        set((state) => {
          const idx = state.teams.findIndex((t) => t.id === id);
          if (idx !== -1) Object.assign(state.teams[idx]!, partial);
        }),
      deleteTeam: (id) =>
        set((state) => {
          state.teams = state.teams.filter((t) => t.id !== id);
        }),

      // ── Matches ──
      matches: [],
      activeMatchId: null,
      createMatch: (config) => {
        const now = nowISO();
        const match: Match = {
          id: generateId(),
          sport: config.sport,
          tournamentId: config.tournamentId,
          round: config.round,
          matchNumber: config.matchNumber,
          teamHome: config.teamHome,
          teamAway: config.teamAway,
          status: 'scheduled',
          events: [],
          periods: buildInitialPeriods(config.sport),
          currentPeriod: 1,
          timerState: {
            mode: sportsConfig[config.sport].timerMode,
            totalSeconds: sportsConfig[config.sport].defaultTimerSeconds,
            elapsedSeconds: 0,
            isRunning: false,
          },
          totalScoreHome: 0,
          totalScoreAway: 0,
          scheduledAt: config.scheduledAt,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.matches.push(match);
        });
        return match;
      },
      startMatch: (id) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === id);
          if (!m) return;
          m.status = 'live';
          m.startedAt = nowISO();
          m.timerState.isRunning = true;
          m.timerState.lastStartedAt = nowISO();
          m.updatedAt = nowISO();
          state.activeMatchId = id;
        }),
      pauseMatch: (id) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === id);
          if (!m) return;
          m.status = 'paused';
          m.timerState.isRunning = false;
          m.updatedAt = nowISO();
        }),
      resumeMatch: (id) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === id);
          if (!m) return;
          m.status = 'live';
          m.timerState.isRunning = true;
          m.timerState.lastStartedAt = nowISO();
          m.updatedAt = nowISO();
        }),
      finishMatch: (id) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === id);
          if (!m) return;
          m.status = 'finished';
          m.timerState.isRunning = false;
          m.finishedAt = nowISO();
          m.updatedAt = nowISO();
          recalcTotals(m);
          m.winner = determineWinner(m);
          if (state.activeMatchId === id) state.activeMatchId = null;
        }),
      cancelMatch: (id) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === id);
          if (!m) return;
          m.status = 'cancelled';
          m.timerState.isRunning = false;
          m.updatedAt = nowISO();
          if (state.activeMatchId === id) state.activeMatchId = null;
        }),

      addScoreEvent: (matchId, eventData) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === matchId);
          if (!m || m.status !== 'live') return;

          const event: ScoreEvent = {
            ...eventData,
            id: generateId(),
            timestamp: nowISO(),
          };
          m.events.push(event);

          // Update current period score
          const period = m.periods.find((p) => p.number === m.currentPeriod);
          if (period) {
            if (eventData.teamId === m.teamHome.id) {
              // own_goal scores for opponent
              if (eventData.type === 'own_goal') {
                period.scoreAway += eventData.points;
              } else {
                period.scoreHome += eventData.points;
              }
            } else {
              if (eventData.type === 'own_goal') {
                period.scoreHome += eventData.points;
              } else {
                period.scoreAway += eventData.points;
              }
            }
          }

          recalcTotals(m);
          m.updatedAt = nowISO();
        }),

      undoLastEvent: (matchId) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === matchId);
          if (!m || m.events.length === 0) return;

          // Remove last non-correction event
          const lastIdx = [...m.events].reverse().findIndex(
            (e) => e.type !== 'correction',
          );
          if (lastIdx === -1) return;
          const realIdx = m.events.length - 1 - lastIdx;
          const removed = m.events[realIdx]!;

          // Revert score
          const period = m.periods.find((p) => p.number === removed.period);
          if (period) {
            if (removed.teamId === m.teamHome.id) {
              if (removed.type === 'own_goal') {
                period.scoreAway = Math.max(0, period.scoreAway - removed.points);
              } else {
                period.scoreHome = Math.max(0, period.scoreHome - removed.points);
              }
            } else {
              if (removed.type === 'own_goal') {
                period.scoreHome = Math.max(0, period.scoreHome - removed.points);
              } else {
                period.scoreAway = Math.max(0, period.scoreAway - removed.points);
              }
            }
          }

          m.events.splice(realIdx, 1);
          recalcTotals(m);
          m.updatedAt = nowISO();
        }),

      advancePeriod: (matchId) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === matchId);
          if (!m) return;
          const config = sportsConfig[m.sport];

          // Mark current period as ended
          const currentPeriod = m.periods.find((p) => p.number === m.currentPeriod);
          if (currentPeriod) currentPeriod.endedAt = nowISO();

          // For set-based sports, check if someone won enough sets
          if (config.setsToWin) {
            recalcTotals(m);
            if (
              m.totalScoreHome >= config.setsToWin ||
              m.totalScoreAway >= config.setsToWin
            ) {
              m.status = 'finished';
              m.finishedAt = nowISO();
              m.timerState.isRunning = false;
              m.winner = determineWinner(m);
              if (state.activeMatchId === m.id) state.activeMatchId = null;
              m.updatedAt = nowISO();
              return;
            }
          }

          if (m.currentPeriod < config.periods) {
            m.currentPeriod++;
            const nextPeriod = m.periods.find((p) => p.number === m.currentPeriod);
            if (nextPeriod) nextPeriod.startedAt = nowISO();
            // Reset timer for next period
            m.timerState.elapsedSeconds = 0;
            m.timerState.lastStartedAt = nowISO();
          }
          m.updatedAt = nowISO();
        }),

      setActiveMatch: (id) =>
        set((state) => {
          state.activeMatchId = id;
        }),

      // ── Timer tick (dipanggil dari useEffect interval) ──
      tickTimer: (matchId) =>
        set((state) => {
          const m = state.matches.find((x) => x.id === matchId);
          if (!m || !m.timerState.isRunning) return;
          if (m.timerState.mode === 'stopwatch') {
            m.timerState.elapsedSeconds++;
          } else {
            if (m.timerState.elapsedSeconds < m.timerState.totalSeconds) {
              m.timerState.elapsedSeconds++;
            } else {
              m.timerState.isRunning = false;
            }
          }
        }),

      // ── Tournaments ──
      tournaments: [],
      activeTournamentId: null,
      createTournament: (config) => {
        const tournament: Tournament = {
          id: generateId(),
          name: config.name,
          sport: config.sport,
          format: config.format,
          description: config.description,
          teams: config.teams,
          matches: [],
          status: 'upcoming',
          createdAt: nowISO(),
        };
        set((state) => {
          state.tournaments.push(tournament);
        });
        return tournament;
      },
      generateMatches: (tournamentId) =>
        set((state) => {
          const t = state.tournaments.find((x) => x.id === tournamentId);
          if (!t) return;

          let matches: Match[] = [];
          if (t.format === 'round_robin' || t.format === 'group_then_knockout') {
            matches = generateRoundRobinMatches(tournamentId, t.sport, t.teams);
          } else {
            matches = generateSingleEliminationMatches(tournamentId, t.sport, t.teams);
          }

          t.matches = matches;
          t.status = 'ongoing';
          t.startedAt = nowISO();

          // Also add to global matches array
          state.matches.push(...matches);
        }),
      setActiveTournament: (id) =>
        set((state) => {
          state.activeTournamentId = id;
        }),
      updateTournamentStandings: (tournamentId) => {
        // Standings dihitung secara derived via calculateStandings()
        // Store ini hanya update champion jika semua match selesai
        const state = get();
        const t = state.tournaments.find((x) => x.id === tournamentId);
        if (!t) return;

        const allDone = t.matches.every(
          (m) => m.status === 'finished' || m.status === 'cancelled',
        );
        if (allDone) {
          const standings = calculateStandings(t);
          if (standings.length > 0) {
            set((s) => {
              const tour = s.tournaments.find((x) => x.id === tournamentId);
              if (tour) {
                tour.champion = standings[0]!.team;
                tour.status = 'finished';
                tour.finishedAt = nowISO();
              }
            });
          }
        }
      },
      finishTournament: (tournamentId) =>
        set((state) => {
          const t = state.tournaments.find((x) => x.id === tournamentId);
          if (!t) return;
          t.status = 'finished';
          t.finishedAt = nowISO();
          const standings = calculateStandings(t);
          if (standings.length > 0) t.champion = standings[0]!.team;
        }),

      // ── UI State ──
      ui: {
        sidebarOpen: false,
        activeView: 'scoreboard',
        confirmDialog: null,
      },
      setUi: (partial) =>
        set((state) => {
          Object.assign(state.ui, partial);
        }),

      // ── Export ──
      exportMatchToJSON: (matchId) => {
        const { matches } = get();
        const match = matches.find((m) => m.id === matchId);
        if (!match) return;
        const blob = new Blob([JSON.stringify(match, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `match-${match.teamHome.shortName}-vs-${match.teamAway.shortName}-${match.id.slice(0, 6)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      exportTournamentToJSON: (tournamentId) => {
        const { tournaments } = get();
        const tournament = tournaments.find((t) => t.id === tournamentId);
        if (!tournament) return;
        const blob = new Blob([JSON.stringify(tournament, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tournament-${tournament.name}-${tournament.id.slice(0, 6)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      // ── Reset ──
      clearAllData: () =>
        set((state) => {
          state.matches = [];
          state.tournaments = [];
          state.teams = [];
          state.activeMatchId = null;
          state.activeTournamentId = null;
          state.settings = defaultSettings;
        }),
    })),
    {
      name: 'skorlive-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        matches: state.matches,
        tournaments: state.tournaments,
        teams: state.teams,
        settings: state.settings,
      }),
      version: 1,
      migrate: (persistedState: unknown, _version: number) => {
        return persistedState;
      },
    },
  ),
);

// ─── Selector hooks ───────────────────────────────────────────────

export const useSettings = () => useAppStore((s) => s.settings);
export const useTeams = () => useAppStore((s) => s.teams);
export const useMatches = () => useAppStore((s) => s.matches);
export const useActiveMatch = () => {
  const id = useAppStore((s) => s.activeMatchId);
  const matches = useAppStore((s) => s.matches);
  return id ? matches.find((m) => m.id === id) ?? null : null;
};
export const useTournaments = () => useAppStore((s) => s.tournaments);
export const useActiveTournament = () => {
  const id = useAppStore((s) => s.activeTournamentId);
  const tournaments = useAppStore((s) => s.tournaments);
  return id ? tournaments.find((t) => t.id === id) ?? null : null;
};
export const useUI = () => useAppStore((s) => s.ui);
export const useMatchById = (id: string) =>
  useAppStore((s) => s.matches.find((m) => m.id === id) ?? null);
export const useTournamentById = (id: string) =>
  useAppStore((s) => s.tournaments.find((t) => t.id === id) ?? null);
export const useMatchesBySport = (sport: SportType) =>
  useAppStore((s) => s.matches.filter((m) => m.sport === sport));
export const useFinishedMatches = () =>
  useAppStore((s) => s.matches.filter((m) => m.status === 'finished'));

