// pages/MatchDetailPage.tsx — Detail & ringkasan pertandingan

import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Download, Play, Calendar, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { getSportConfig, getEventLabel } from '@/lib/sports-config';
import TeamAvatar from '@/components/ui/TeamAvatar';
import StatusBadge from '@/components/ui/StatusBadge';
import { SportIcon } from '@/components/icons/SportIcons';
import { formatDate, formatTime } from '@/lib/utils';

export default function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const match = useAppStore((s) => s.matches.find((m) => m.id === matchId) ?? null);
  const exportMatchToJSON = useAppStore((s) => s.exportMatchToJSON);

  if (!match) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Pertandingan tidak ditemukan.</p>
        <button className="btn btn-ghost mt-4" onClick={() => navigate('/')}>
          Kembali
        </button>
      </div>
    );
  }

  const sportConfig = getSportConfig(match.sport);
  const isLive = match.status === 'live' || match.status === 'paused';

  const duration = match.startedAt && match.finishedAt
    ? Math.round(
        (new Date(match.finishedAt).getTime() -
          new Date(match.startedAt).getTime()) /
          1000,
      )
    : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <button
          className="btn btn-ghost"
          style={{ minHeight: 'auto', padding: '0.375rem' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <SportIcon sport={match.sport} size={16} />
            {sportConfig.label}
          </div>
        </div>
        <StatusBadge status={match.status} />
        {isLive && (
          <button
            className="btn btn-primary"
            style={{ minHeight: 36, fontSize: '0.875rem' }}
            onClick={() => navigate(`/matches/${matchId}/live`)}
          >
            <Play size={14} /> Lanjut Live
          </button>
        )}
        <button
          className="btn btn-secondary"
          style={{ minHeight: 36, fontSize: '0.875rem' }}
          onClick={() => exportMatchToJSON(matchId!)}
          id="export-match-json"
        >
          <Download size={14} /> Export JSON
        </button>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard-main mb-6">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <TeamAvatar team={match.teamHome} size={64} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
                <span className="hidden sm:inline">{match.teamHome.name}</span>
                <span className="sm:hidden">{match.teamHome.shortName}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>HOME</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="score-display"
              style={{ color: 'var(--score-home)', fontSize: 'clamp(3rem, 10vw, 6rem)' }}
            >
              {match.totalScoreHome}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', color: 'var(--text-muted)' }}>:</span>
            <span
              className="score-display"
              style={{ color: 'var(--score-away)', fontSize: 'clamp(3rem, 10vw, 6rem)' }}
            >
              {match.totalScoreAway}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <TeamAvatar team={match.teamAway} size={64} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
                <span className="hidden sm:inline">{match.teamAway.name}</span>
                <span className="sm:hidden">{match.teamAway.shortName}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AWAY</div>
            </div>
          </div>
        </div>

        {/* Winner */}
        {match.winner && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              padding: '0.75rem',
              background: 'var(--accent-muted)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              color: 'var(--accent)',
              letterSpacing: '0.05em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {match.winner === 'draw'
              ? 'HASIL SERI'
              : match.winner === 'home'
              ? `🏆 ${match.teamHome.name} MENANG`
              : `🏆 ${match.teamAway.name} MENANG`}
          </div>
        )}
      </div>

      {/* Match info */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card-elevated">
          <div className="label" style={{ marginBottom: 4 }}>Dimulai</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            {match.startedAt ? formatDate(match.startedAt) : '—'}
          </div>
        </div>
        <div className="card-elevated">
          <div className="label" style={{ marginBottom: 4 }}>Durasi</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            {duration ? formatTime(duration) : '—'}
          </div>
        </div>
        <div className="card-elevated">
          <div className="label" style={{ marginBottom: 4 }}>Total Event</div>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
            {match.events.length} event
          </div>
        </div>
      </div>

      {/* Period breakdown */}
      {match.periods.length > 1 && (
        <div className="card mb-6">
          <div className="label mb-3">SKOR PER {sportConfig.periodLabel.toUpperCase()}</div>
          <div className="flex flex-col gap-2">
            {match.periods.map((period) => (
              <div
                key={period.number}
                className="flex items-center justify-between"
                style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  opacity: period.scoreHome === 0 && period.scoreAway === 0 && period.number > match.currentPeriod ? 0.4 : 1,
                }}
              >
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {period.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--score-home)' }}>{period.scoreHome}</span>
                  <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>–</span>
                  <span style={{ color: 'var(--score-away)' }}>{period.scoreAway}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event timeline */}
      {match.events.length > 0 && (
        <div className="card">
          <div className="label mb-3">TIMELINE EVENT</div>
          <div className="flex flex-col gap-2">
            {[...match.events].reverse().map((event) => {
              const isHome = event.teamId === match.teamHome.id;
              return (
                <div
                  key={event.id}
                  className="event-item"
                  style={{
                    justifyContent: isHome ? 'flex-start' : 'flex-end',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(event.timestamp).toLocaleTimeString('id-ID')}
                  </span>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: isHome ? 'var(--score-home)' : 'var(--score-away)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: isHome ? 'var(--score-home)' : 'var(--score-away)' }}>
                    {isHome ? match.teamHome.shortName : match.teamAway.shortName}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {getEventLabel(event.type)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginLeft: 'auto' }}>
                    +{event.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
