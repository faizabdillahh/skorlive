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

      // Award points for byes
      if (match.teamHome.id === 'team-bye') {
        if (away) {
          away.played++;
          away.won++;
          away.points += 3;
        }
        return;
      }
      if (match.teamAway.id === 'team-bye') {
        if (home) {
          home.played++;
          home.won++;
          home.points += 3;
        }
        return;
      }

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

// ─── Round-robin schedule generator (Berger Table / Circle Method) ───

function generateRoundRobinMatches(
  tournamentId: string,
  sport: SportType,
  teams: Team[],
): Match[] {
  const matches: Match[] = [];
  const now = nowISO();
  const list = [...teams];
  
  const isOdd = list.length % 2 !== 0;
  const byeTeam: Team = {
    id: 'team-bye',
    name: 'BYE',
    shortName: 'BYE',
    colorPrimary: '#4a5568',
    colorSecondary: '#718096',
    createdAt: now,
  };
  
  if (isOdd) {
    list.push(byeTeam);
  }

  const numTeams = list.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  let matchNumber = 1;

  for (let round = 0; round < numRounds; round++) {
    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const homeIdx = (round + matchIdx) % (numTeams - 1);
      let awayIdx = (round - matchIdx + numTeams - 1) % (numTeams - 1);

      if (matchIdx === 0) {
        awayIdx = numTeams - 1;
      }

      const homeTeam = list[homeIdx]!;
      const awayTeam = list[awayIdx]!;

      if (homeTeam.id === 'team-bye' && awayTeam.id === 'team-bye') continue;

      const actualHome = (round % 2 === 0 && matchIdx === 0) ? awayTeam : homeTeam;
      const actualAway = (round % 2 === 0 && matchIdx === 0) ? homeTeam : awayTeam;

      let status: MatchStatus = 'scheduled';
      let winner: 'home' | 'away' | 'draw' | undefined = undefined;

      if (actualHome.id === 'team-bye') {
        status = 'finished';
        winner = 'away';
      } else if (actualAway.id === 'team-bye') {
        status = 'finished';
        winner = 'home';
      }

      matches.push({
        id: generateId(),
        sport,
        tournamentId,
        round: round + 1,
        matchNumber: matchNumber++,
        teamHome: actualHome,
        teamAway: actualAway,
        status,
        winner,
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

// ─── Single elimination bracket generator ───────────────────────────

function generateSingleEliminationMatches(
  tournamentId: string,
  sport: SportType,
  teams: Team[],
): Match[] {
  const matches: Match[] = [];
  const now = nowISO();
  const size = Math.pow(2, Math.ceil(Math.log2(teams.length)));
  
  const byeTeam: Team = {
    id: 'team-bye',
    name: 'BYE',
    shortName: 'BYE',
    colorPrimary: '#4a5568',
    colorSecondary: '#718096',
    createdAt: now,
  };

  const paddedTeams: (Team | null)[] = [
    ...teams,
    ...Array(size - teams.length).fill(null),
  ];

  const makePlaceholderTeam = (matchNum: number): Team => ({
    id: `placeholder-winner-m${matchNum}`,
    name: `Pemenang M${matchNum}`,
    shortName: `PM${matchNum}`,
    colorPrimary: '#4a5568',
    colorSecondary: '#718096',
    createdAt: now,
  });

  const matchMap = new Map<number, Match>();

  let currentRound = 1;
  let matchesInRound = size / 2;
  let roundStartMatch = 1;

  for (let matchNum = 1; matchNum < size; matchNum++) {
    if (matchNum >= roundStartMatch + matchesInRound) {
      roundStartMatch += matchesInRound;
      matchesInRound /= 2;
      currentRound++;
    }

    let teamHome: Team;
    let teamAway: Team;
    let status: MatchStatus = 'scheduled';
    let winner: 'home' | 'away' | 'draw' | undefined = undefined;

    if (currentRound === 1) {
      const idxHome = (matchNum - 1) * 2;
      const idxAway = (matchNum - 1) * 2 + 1;
      
      const tHome = paddedTeams[idxHome];
      const tAway = paddedTeams[idxAway];

      if (!tHome && !tAway) {
        teamHome = byeTeam;
        teamAway = byeTeam;
        status = 'cancelled';
      } else if (tHome && !tAway) {
        teamHome = tHome;
        teamAway = byeTeam;
        status = 'finished';
        winner = 'home';
      } else if (!tHome && tAway) {
        teamHome = byeTeam;
        teamAway = tAway;
        status = 'finished';
        winner = 'away';
      } else {
        teamHome = tHome!;
        teamAway = tAway!;
      }
    } else {
      const prevRoundOffset = roundStartMatch - (matchesInRound * 2);
      const relativeMatchIdx = matchNum - roundStartMatch;
      const leftMatchNum = prevRoundOffset + relativeMatchIdx * 2;
      const rightMatchNum = prevRoundOffset + relativeMatchIdx * 2 + 1;

      const leftMatch = matchMap.get(leftMatchNum);
      const rightMatch = matchMap.get(rightMatchNum);

      let resolvedHome: Team | null = null;
      let resolvedAway: Team | null = null;

      if (leftMatch && leftMatch.status === 'finished') {
        resolvedHome = leftMatch.winner === 'home' ? leftMatch.teamHome : leftMatch.teamAway;
      }
      if (rightMatch && rightMatch.status === 'finished') {
        resolvedAway = rightMatch.winner === 'home' ? rightMatch.teamHome : rightMatch.teamAway;
      }

      teamHome = resolvedHome || makePlaceholderTeam(leftMatchNum);
      teamAway = resolvedAway || makePlaceholderTeam(rightMatchNum);

      if (resolvedHome?.id === 'team-bye' && resolvedAway?.id === 'team-bye') {
        status = 'cancelled';
      } else if (resolvedHome && resolvedAway?.id === 'team-bye') {
        status = 'finished';
        winner = 'home';
      } else if (resolvedHome?.id === 'team-bye' && resolvedAway) {
        status = 'finished';
        winner = 'away';
      }
    }

    const match: Match = {
      id: generateId(),
      sport,
      tournamentId,
      round: currentRound,
      matchNumber: matchNum,
      teamHome,
      teamAway,
      status,
      winner,
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
    };

    matchMap.set(matchNum, match);
    matches.push(match);
  }

  return matches;
}

// ─── Helpers to sync matches ────────────────────────────────────────

function updateMatchHelper(state: any, matchId: string, updater: (m: Match) => void) {
  const m = state.matches.find((x: any) => x.id === matchId);
  if (m) {
    updater(m);
    if (m.tournamentId) {
      const t = state.tournaments.find((x: any) => x.id === m.tournamentId);
      if (t) {
        const tm = t.matches.find((x: any) => x.id === matchId);
        if (tm) {
          updater(tm);
        }
      }
    }
  }
}

function propagateWinnerSingleElimination(state: any, tournament: Tournament, finishedMatch: Match) {
  const winnerTeam = finishedMatch.winner === 'away' ? finishedMatch.teamAway : finishedMatch.teamHome;
  if (!winnerTeam || winnerTeam.id === 'team-bye') return;

  const placeholderId = `placeholder-winner-m${finishedMatch.matchNumber}`;
  
  const nextTMatch = tournament.matches.find(
    (x) => x.teamHome.id === placeholderId || x.teamAway.id === placeholderId
  );

  if (nextTMatch) {
    if (nextTMatch.teamHome.id === placeholderId) {
      nextTMatch.teamHome = winnerTeam;
    } else {
      nextTMatch.teamAway = winnerTeam;
    }

    const nextGMatch = state.matches.find((x: any) => x.id === nextTMatch.id);
    if (nextGMatch) {
      nextGMatch.teamHome = nextTMatch.teamHome;
      nextGMatch.teamAway = nextTMatch.teamAway;
    }

    if (nextTMatch.teamHome.id === 'team-bye' || nextTMatch.teamAway.id === 'team-bye') {
      nextTMatch.status = 'finished';
      nextTMatch.winner = nextTMatch.teamHome.id === 'team-bye' ? 'away' : 'home';
      nextTMatch.finishedAt = nowISO();
      nextTMatch.updatedAt = nowISO();

      if (nextGMatch) {
        nextGMatch.status = nextTMatch.status;
        nextGMatch.winner = nextTMatch.winner;
        nextGMatch.finishedAt = nextTMatch.finishedAt;
        nextGMatch.updatedAt = nextTMatch.updatedAt;
      }

      propagateWinnerSingleElimination(state, tournament, nextTMatch);
    }
  }
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
          const now = nowISO();
          updateMatchHelper(state, id, (m) => {
            m.status = 'live';
            m.startedAt = now;
            m.timerState.isRunning = true;
            m.timerState.lastStartedAt = now;
            m.updatedAt = now;
          });
          const m = state.matches.find((x) => x.id === id);
          if (m) state.activeMatchId = id;
        }),
      pauseMatch: (id) =>
        set((state) => {
          const now = nowISO();
          updateMatchHelper(state, id, (m) => {
            m.status = 'paused';
            m.timerState.isRunning = false;
            m.updatedAt = now;
          });
        }),
      resumeMatch: (id) =>
        set((state) => {
          const now = nowISO();
          updateMatchHelper(state, id, (m) => {
            m.status = 'live';
            m.timerState.isRunning = true;
            m.timerState.lastStartedAt = now;
            m.updatedAt = now;
          });
        }),
      finishMatch: (id) =>
        set((state) => {
          const now = nowISO();
          updateMatchHelper(state, id, (m) => {
            m.status = 'finished';
            m.timerState.isRunning = false;
            m.finishedAt = now;
            m.updatedAt = now;
            recalcTotals(m);
            m.winner = determineWinner(m);
          });
          const m = state.matches.find((x) => x.id === id);
          if (m && state.activeMatchId === id) state.activeMatchId = null;
          if (m && m.tournamentId) {
            const t = state.tournaments.find((x) => x.id === m.tournamentId);
            if (t) {
              if (t.format === 'single_elimination') {
                propagateWinnerSingleElimination(state, t, m);
              }

              const standings = calculateStandings(t);
              const allDone = t.matches.every(
                (match) => match.status === 'finished' || match.status === 'cancelled',
              );
              if (allDone && standings.length > 0) {
                t.champion = standings[0]!.team;
                t.status = 'finished';
                t.finishedAt = now;
              }
            }
          }
        }),
      cancelMatch: (id) =>
        set((state) => {
          const now = nowISO();
          updateMatchHelper(state, id, (m) => {
            m.status = 'cancelled';
            m.timerState.isRunning = false;
            m.updatedAt = now;
          });
          const m = state.matches.find((x) => x.id === id);
          if (m && state.activeMatchId === id) state.activeMatchId = null;
        }),

      addScoreEvent: (matchId, eventData) =>
        set((state) => {
          const mGlobal = state.matches.find((x) => x.id === matchId);
          if (!mGlobal || mGlobal.status !== 'live') return;

          const now = nowISO();
          const eventId = generateId();

          updateMatchHelper(state, matchId, (m) => {
            const event: ScoreEvent = {
              ...eventData,
              id: eventId,
              timestamp: now,
            };
            m.events.push(event);

            // Update current period score
            const period = m.periods.find((p) => p.number === m.currentPeriod);
            if (period) {
              if (eventData.teamId === m.teamHome.id) {
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
            m.updatedAt = now;
          });
        }),

      undoLastEvent: (matchId) =>
        set((state) => {
          const mGlobal = state.matches.find((x) => x.id === matchId);
          if (!mGlobal || mGlobal.events.length === 0) return;

          const lastIdx = [...mGlobal.events].reverse().findIndex(
            (e) => e.type !== 'correction',
          );
          if (lastIdx === -1) return;
          const realIdx = mGlobal.events.length - 1 - lastIdx;
          const removed = mGlobal.events[realIdx]!;

          const now = nowISO();

          updateMatchHelper(state, matchId, (m) => {
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
            m.updatedAt = now;
          });
        }),

      advancePeriod: (matchId) =>
        set((state) => {
          const mGlobal = state.matches.find((x) => x.id === matchId);
          if (!mGlobal) return;
          const config = sportsConfig[mGlobal.sport];
          const now = nowISO();

          updateMatchHelper(state, matchId, (m) => {
            const currentPeriod = m.periods.find((p) => p.number === m.currentPeriod);
            if (currentPeriod) currentPeriod.endedAt = now;

            if (config.setsToWin) {
              recalcTotals(m);
              if (
                m.totalScoreHome >= config.setsToWin ||
                m.totalScoreAway >= config.setsToWin
              ) {
                m.status = 'finished';
                m.finishedAt = now;
                m.timerState.isRunning = false;
                m.winner = determineWinner(m);
                return;
              }
            }

            if (m.currentPeriod < config.periods) {
              m.currentPeriod++;
              const nextPeriod = m.periods.find((p) => p.number === m.currentPeriod);
              if (nextPeriod) nextPeriod.startedAt = now;
              m.timerState.elapsedSeconds = 0;
              m.timerState.lastStartedAt = now;
            }
            m.updatedAt = now;
          });

          const updatedM = state.matches.find((x) => x.id === matchId);
          if (updatedM && updatedM.status === 'finished') {
            if (state.activeMatchId === matchId) state.activeMatchId = null;
            
            if (updatedM.tournamentId) {
              const t = state.tournaments.find((x) => x.id === updatedM.tournamentId);
              if (t) {
                if (t.format === 'single_elimination') {
                  propagateWinnerSingleElimination(state, t, updatedM);
                }

                const standings = calculateStandings(t);
                const allDone = t.matches.every(
                  (match) => match.status === 'finished' || match.status === 'cancelled',
                );
                if (allDone && standings.length > 0) {
                  t.champion = standings[0]!.team;
                  t.status = 'finished';
                  t.finishedAt = now;
                }
              }
            }
          }
        }),

      setActiveMatch: (id) =>
        set((state) => {
          state.activeMatchId = id;
        }),

      tickTimer: (matchId) =>
        set((state) => {
          updateMatchHelper(state, matchId, (m) => {
            if (!m.timerState.isRunning) return;
            if (m.timerState.mode === 'stopwatch') {
              m.timerState.elapsedSeconds++;
            } else {
              if (m.timerState.elapsedSeconds < m.timerState.totalSeconds) {
                m.timerState.elapsedSeconds++;
              } else {
                m.timerState.isRunning = false;
              }
            }
          });
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

          state.matches.push(...matches);
        }),
      setActiveTournament: (id) =>
        set((state) => {
          state.activeTournamentId = id;
        }),
      updateTournamentStandings: (tournamentId) => {
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

