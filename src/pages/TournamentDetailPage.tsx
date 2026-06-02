// pages/TournamentDetailPage.tsx — Detail & manajemen turnamen

import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Download, Play, CheckCircle } from 'lucide-react';
import { useAppStore, calculateStandings } from '@/stores/app-store';
import { getSportConfig } from '@/lib/sports-config';
import { SportIcon } from '@/components/icons/SportIcons';
import TeamAvatar from '@/components/ui/TeamAvatar';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function TournamentDetailPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const tournament = useAppStore((s) =>
    s.tournaments.find((t) => t.id === tournamentId) ?? null,
  );
  const { startMatch, exportTournamentToJSON, finishTournament, setUi } = useAppStore();

  if (!tournament) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Turnamen tidak ditemukan.</p>
        <button className="btn btn-ghost mt-4" onClick={() => navigate('/tournaments')}>
          Kembali
        </button>
      </div>
    );
  }

  const sportConfig = getSportConfig(tournament.sport);
  const standings = calculateStandings(tournament);
  const isRoundRobin =
    tournament.format === 'round_robin' || tournament.format === 'group_then_knockout';
  const finishedMatches = tournament.matches.filter((m) => m.status === 'finished').length;
  const totalMatches = tournament.matches.length;

  function handleStartMatch(matchId: string) {
    startMatch(matchId);
    navigate(`/matches/${matchId}/live`);
  }

  function handleFinish() {
    setUi({
      confirmDialog: {
        title: 'Selesaikan Turnamen?',
        message: 'Turnamen akan ditandai selesai dan juara ditetapkan.',
        variant: 'warning',
        onConfirm: () => {
          finishTournament(tournamentId!);
        },
      },
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back + actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="btn btn-ghost"
          style={{ minHeight: 'auto', padding: '0.375rem' }}
          onClick={() => navigate('/tournaments')}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div
            className="flex items-center gap-2"
            style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
          >
            <SportIcon sport={tournament.sport} size={16} />
            {sportConfig.label}
          </div>
        </div>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color:
              tournament.status === 'ongoing'
                ? 'var(--danger)'
                : tournament.status === 'finished'
                ? 'var(--text-muted)'
                : 'var(--accent)',
          }}
        >
          {tournament.status === 'upcoming'
            ? 'Akan Datang'
            : tournament.status === 'ongoing'
            ? 'Berlangsung'
            : 'Selesai'}
        </span>
        {tournament.status === 'ongoing' && (
          <button
            className="btn btn-danger"
            style={{ minHeight: 36, fontSize: '0.875rem' }}
            onClick={handleFinish}
          >
            <CheckCircle size={14} /> Selesaikan
          </button>
        )}
        <button
          className="btn btn-secondary"
          style={{ minHeight: 36, fontSize: '0.875rem' }}
          onClick={() => exportTournamentToJSON(tournamentId!)}
          id="export-tournament-json"
        >
          <Download size={14} /> Export JSON
        </button>
      </div>

      {/* Tournament info */}
      <div className="card mb-6">
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0.01em',
            marginBottom: 8,
          }}
        >
          {tournament.name}
        </h1>
        {tournament.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: '0.9rem' }}>
            {tournament.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <span>{tournament.teams.length} tim</span>
          <span>·</span>
          <span>
            {tournament.format === 'round_robin'
              ? 'Round Robin'
              : tournament.format === 'single_elimination'
              ? 'Single Eliminasi'
              : 'Grup + Knockout'}
          </span>
          <span>·</span>
          <span>
            {finishedMatches}/{totalMatches} pertandingan selesai
          </span>
          <span>·</span>
          <span>Dibuat {formatDate(tournament.createdAt)}</span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              height: 4,
              background: 'var(--border)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: totalMatches > 0 ? `${(finishedMatches / totalMatches) * 100}%` : '0%',
                background: 'var(--accent)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 500ms ease',
              }}
            />
          </div>
        </div>

        {/* Champion */}
        {tournament.champion && (
          <div
            className="flex items-center gap-3 mt-4 p-3 rounded-lg"
            style={{ background: 'var(--accent-muted)', border: '1px solid var(--border-accent)' }}
          >
            <Trophy size={20} style={{ color: 'var(--warning)' }} />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JUARA</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                {tournament.champion.name}
              </div>
            </div>
            <TeamAvatar team={tournament.champion} size={40} className="ml-auto" />
          </div>
        )}
      </div>

      {/* Standings (round robin) */}
      {isRoundRobin && standings.length > 0 && (
        <div className="card mb-6">
          <div className="label mb-3">KLASEMEN</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600, width: 32 }}>#</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tim</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem 0.375rem', color: 'var(--text-muted)', fontWeight: 600 }}>M</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem 0.375rem', color: 'var(--text-muted)', fontWeight: 600 }}>W</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem 0.375rem', color: 'var(--text-muted)', fontWeight: 600 }}>D</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem 0.375rem', color: 'var(--text-muted)', fontWeight: 600 }}>L</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem 0.375rem', color: 'var(--text-muted)', fontWeight: 600 }}>GD</th>
                  <th style={{ textAlign: 'center', padding: '0.5rem 0.75rem', color: 'var(--accent)', fontWeight: 700 }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr
                    key={s.team.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: i === 0 ? 'var(--accent-muted)' : undefined,
                    }}
                  >
                    <td style={{ padding: '0.625rem 0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {i === 0 ? '🏆' : i + 1}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <div className="flex items-center gap-2">
                        <TeamAvatar team={s.team} size={28} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.team.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 0.375rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{s.played}</td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 0.375rem', fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>{s.won}</td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 0.375rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.drawn}</td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 0.375rem', fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>{s.lost}</td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 0.375rem', fontFamily: 'var(--font-mono)', color: s.goalDifference >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {s.goalDifference >= 0 ? '+' : ''}{s.goalDifference}
                    </td>
                    <td style={{ textAlign: 'center', padding: '0.625rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Matches */}
      <div className="card">
        <div className="label mb-3">JADWAL PERTANDINGAN</div>
        <div className="flex flex-col gap-3">
          {tournament.matches.map((match) => {
            const isLive = match.status === 'live' || match.status === 'paused';
            return (
              <div
                key={match.id}
                style={{
                  padding: '0.875rem 1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: isLive ? '1px solid var(--danger)' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Round info */}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 20 }}>
                  R{match.round ?? 1}
                </span>

                 {/* Teams + score */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                  <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span className="hidden sm:inline">{match.teamHome.name}</span>
                      <span className="sm:hidden">{match.teamHome.shortName}</span>
                    </span>
                    <TeamAvatar team={match.teamHome} size={28} />
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {match.status === 'scheduled' ? '—' : `${match.totalScoreHome} : ${match.totalScoreAway}`}
                  </span>

                  <div className="flex items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
                    <TeamAvatar team={match.teamAway} size={28} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span className="hidden sm:inline">{match.teamAway.name}</span>
                      <span className="sm:hidden">{match.teamAway.shortName}</span>
                    </span>
                  </div>
                </div>

                {/* Status & action */}
                <div className="flex items-center gap-2">
                  <StatusBadge status={match.status} />
                  {match.status === 'scheduled' && (
                    <button
                      className="btn btn-primary"
                      style={{ minHeight: 32, fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                      onClick={() => handleStartMatch(match.id)}
                    >
                      <Play size={12} /> Mulai
                    </button>
                  )}
                  {isLive && (
                    <button
                      className="btn btn-ghost"
                      style={{ minHeight: 32, fontSize: '0.75rem', padding: '0.25rem 0.625rem', color: 'var(--danger)' }}
                      onClick={() => navigate(`/matches/${match.id}/live`)}
                    >
                      Live →
                    </button>
                  )}
                  {match.status === 'finished' && (
                    <button
                      className="btn btn-ghost"
                      style={{ minHeight: 32, fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}
                      onClick={() => navigate(`/matches/${match.id}`)}
                    >
                      Detail →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
