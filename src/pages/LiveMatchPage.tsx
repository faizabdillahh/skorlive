// pages/LiveMatchPage.tsx — Halaman scoreboard live pertandingan

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Pause, Play, StopCircle, RotateCcw, ChevronRight,
  Maximize2, ArrowLeft, Clock,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { getSportConfig, getEventLabel, getPeriodLabel } from '@/lib/sports-config';
import TeamAvatar from '@/components/ui/TeamAvatar';
import StatusBadge from '@/components/ui/StatusBadge';
import { SportIcon } from '@/components/icons/SportIcons';
import { formatTime } from '@/lib/utils';

export default function LiveMatchPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayMode, setDisplayMode] = useState(false);
  const [lastScored, setLastScored] = useState<'home' | 'away' | null>(null);

  const match = useAppStore((s) =>
    s.matches.find((m) => m.id === matchId) ?? null,
  );
  const {
    startMatch,
    pauseMatch,
    resumeMatch,
    finishMatch,
    addScoreEvent,
    undoLastEvent,
    advancePeriod,
    setUi,
  } = useAppStore();

  // Timer tick
  useEffect(() => {
    if (!match) return;
    if (match.timerState.isRunning) {
      timerRef.current = setInterval(() => {
        useAppStore.getState().tickTimer(matchId!);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match?.timerState.isRunning, matchId]);

  if (!match) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Pertandingan tidak ditemukan.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const sportConfig = getSportConfig(match.sport);
  const isLive = match.status === 'live';
  const isPaused = match.status === 'paused';
  const isFinished = match.status === 'finished';

  const timerDisplay =
    sportConfig.timerMode === 'countdown'
      ? formatTime(
          Math.max(
            0,
            match.timerState.totalSeconds - match.timerState.elapsedSeconds,
          ),
        )
      : formatTime(match.timerState.elapsedSeconds);

  function handleScore(teamId: string, points: number, type: string, period: number) {
    addScoreEvent(matchId!, {
      teamId,
      points,
      type: type as import('@/types/core').ScoreEventType,
      period,
    });
    setLastScored(teamId === match!.teamHome.id ? 'home' : 'away');
    setTimeout(() => setLastScored(null), 600);
  }

  function handleFinish() {
    setUi({
      confirmDialog: {
        title: 'Selesaikan Pertandingan?',
        message: 'Pertandingan akan ditandai selesai dan tidak bisa dilanjutkan.',
        variant: 'warning',
        onConfirm: () => {
          finishMatch(matchId!);
          navigate(`/matches/${matchId}`);
        },
      },
    });
  }

  function handleUndo() {
    setUi({
      confirmDialog: {
        title: 'Hapus Skor Terakhir?',
        message: 'Event skor terakhir akan dihapus (undo). Aksi ini tidak bisa dibatalkan.',
        variant: 'warning',
        onConfirm: () => undoLastEvent(matchId!),
      },
    });
  }

  const scoreboardContent = (
    <div
      style={{
        background: displayMode ? 'var(--bg-base)' : undefined,
        minHeight: displayMode ? '100dvh' : undefined,
        display: displayMode ? 'flex' : undefined,
        flexDirection: displayMode ? 'column' : undefined,
        alignItems: displayMode ? 'center' : undefined,
        justifyContent: displayMode ? 'center' : undefined,
        padding: displayMode ? '2rem' : undefined,
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      {!displayMode && (
        <div className="flex items-center gap-3 mb-6">
          <button
            className="btn btn-ghost"
            style={{ minHeight: 'auto', padding: '0.375rem' }}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2" style={{ flex: 1 }}>
            <SportIcon sport={match.sport} size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {sportConfig.label}
            </span>
          </div>
          <StatusBadge status={match.status} />
          <button
            className="btn btn-ghost"
            style={{ minHeight: 'auto', padding: '0.375rem' }}
            onClick={() => setDisplayMode(true)}
            title="Mode layar penuh"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      )}

      {/* Main scoreboard */}
      <div className="scoreboard-main mb-6" style={{ position: 'relative' }}>
        {displayMode && (
          <button
            onClick={() => setDisplayMode(false)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              zIndex: 10,
            }}
          >
            Keluar
          </button>
        )}

        {/* Period & timer */}
        <div
          className="flex items-center justify-center gap-4 mb-6"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
            }}
          >
            {getPeriodLabel(match.sport, match.currentPeriod)}
          </span>
          <span
            className="timer-display"
            style={{
              color: isLive ? 'var(--text-primary)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Clock size={18} />
            {timerDisplay}
          </span>
          {isFinished && (
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.9rem',
                color: 'var(--success)',
                letterSpacing: '0.08em',
              }}
            >
              SELESAI
            </span>
          )}
        </div>

        {/* Teams & Score */}
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
          {/* Home team */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <TeamAvatar team={match.teamHome} size={displayMode ? 80 : 56} />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: displayMode ? '1.5rem' : '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.03em',
                }}
              >
                <span className="hidden sm:inline">{match.teamHome.name}</span>
                <span className="sm:hidden">{match.teamHome.shortName}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOME</div>
            </div>
          </div>

          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="score-display"
              style={{
                color: 'var(--score-home)',
                transform:
                  lastScored === 'home' ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {match.totalScoreHome}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                color: 'var(--text-muted)',
              }}
            >
              :
            </span>
            <span
              className="score-display"
              style={{
                color: 'var(--score-away)',
                transform:
                  lastScored === 'away' ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {match.totalScoreAway}
            </span>
          </div>

          {/* Away team */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <TeamAvatar team={match.teamAway} size={displayMode ? 80 : 56} />
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: displayMode ? '1.5rem' : '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.03em',
                }}
              >
                <span className="hidden sm:inline">{match.teamAway.name}</span>
                <span className="sm:hidden">{match.teamAway.shortName}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AWAY</div>
            </div>
          </div>
        </div>

        {/* Per-period score for multi-period sports */}
        {match.periods.length > 1 && (
          <div
            className="flex items-center justify-center gap-4 mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border)', position: 'relative', zIndex: 1 }}
          >
            {match.periods.map((period) => (
              <div
                key={period.number}
                style={{
                  textAlign: 'center',
                  opacity: period.number === match.currentPeriod ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {sportConfig.periodLabel[0]}{period.number}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {period.scoreHome}–{period.scoreAway}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls — hidden in display mode */}
      {!displayMode && !isFinished && (
        <>
          {/* Timer controls */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {match.status === 'scheduled' && (
              <button
                className="btn btn-primary"
                style={{ minWidth: 140 }}
                onClick={() => startMatch(matchId!)}
                id="start-match-live-btn"
              >
                <Play size={16} /> Mulai
              </button>
            )}
            {isLive && (
              <button
                className="btn btn-secondary"
                style={{ minWidth: 140 }}
                onClick={() => pauseMatch(matchId!)}
                id="pause-match-btn"
              >
                <Pause size={16} /> Jeda
              </button>
            )}
            {isPaused && (
              <button
                className="btn btn-primary"
                style={{ minWidth: 140 }}
                onClick={() => resumeMatch(matchId!)}
                id="resume-match-btn"
              >
                <Play size={16} /> Lanjut
              </button>
            )}
            {(isLive || isPaused) && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => advancePeriod(matchId!)}
                  id="advance-period-btn"
                  title={`Akhiri ${sportConfig.periodLabel}`}
                >
                  <ChevronRight size={16} />
                  {sportConfig.periodLabel} Berikutnya
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={handleUndo}
                  id="undo-btn"
                  title="Undo skor terakhir"
                >
                  <RotateCcw size={16} /> Undo
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleFinish}
                  id="finish-match-btn"
                >
                  <StopCircle size={16} /> Selesai
                </button>
              </>
            )}
          </div>

          {/* Score buttons */}
          {(isLive || isPaused) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              {/* Home score buttons */}
              <div>
                <div
                  className="label text-center mb-3"
                  style={{ color: 'var(--score-home)' }}
                >
                  {match.teamHome.shortName}
                </div>
                <div className="flex flex-col gap-2">
                  {sportConfig.scoreButtons.map((btn) => (
                    <button
                      key={`home-${btn.eventType}`}
                      className="btn-score btn-score-home"
                      style={{ width: '100%' }}
                      id={`score-home-${btn.eventType}`}
                      onClick={() =>
                        handleScore(
                          match.teamHome.id,
                          btn.points,
                          btn.eventType,
                          match.currentPeriod,
                        )
                      }
                      disabled={!isLive}
                    >
                      <span style={{ fontWeight: 700 }}>+{btn.points}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {btn.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Away score buttons */}
              <div>
                <div
                  className="label text-center mb-3"
                  style={{ color: 'var(--score-away)' }}
                >
                  {match.teamAway.shortName}
                </div>
                <div className="flex flex-col gap-2">
                  {sportConfig.scoreButtons.map((btn) => (
                    <button
                      key={`away-${btn.eventType}`}
                      className="btn-score btn-score-away"
                      style={{ width: '100%' }}
                      id={`score-away-${btn.eventType}`}
                      onClick={() =>
                        handleScore(
                          match.teamAway.id,
                          btn.points,
                          btn.eventType,
                          match.currentPeriod,
                        )
                      }
                      disabled={!isLive}
                    >
                      <span style={{ fontWeight: 700 }}>+{btn.points}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {btn.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Finished state */}
      {isFinished && (
        <div
          className="card text-center mb-6"
          style={{ padding: '1.5rem', borderColor: 'var(--success)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              color: 'var(--success)',
              marginBottom: 8,
            }}
          >
            PERTANDINGAN SELESAI
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {match.winner === 'draw'
              ? 'Hasil Seri'
              : match.winner === 'home'
              ? `${match.teamHome.name} Menang!`
              : `${match.teamAway.name} Menang!`}
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate(`/matches/${matchId}`)}
          >
            Lihat Detail
          </button>
        </div>
      )}

      {/* Event timeline */}
      {!displayMode && match.events.length > 0 && (
        <div className="card" style={{ padding: '1rem' }}>
          <div
            className="label mb-3"
            style={{ fontSize: '0.75rem' }}
          >
            TIMELINE EVENT
          </div>
          <div
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: 4,
            }}
          >
            {[...match.events].reverse().map((event) => {
              const isHome = event.teamId === match.teamHome.id;
              const teamName = isHome ? match.teamHome.shortName : match.teamAway.shortName;
              return (
                <div
                  key={event.id}
                  className="event-item"
                  style={{
                    justifyContent: isHome ? 'flex-start' : 'flex-end',
                    color: isHome ? 'var(--score-home)' : 'var(--score-away)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    {new Date(event.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span style={{ fontWeight: 600 }}>{teamName}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {getEventLabel(event.type)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
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

  if (displayMode) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'var(--bg-base)',
        }}
      >
        {scoreboardContent}
      </div>
    );
  }

  return scoreboardContent;
}
