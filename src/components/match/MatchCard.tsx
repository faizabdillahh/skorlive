// components/match/MatchCard.tsx — Card preview pertandingan

import { useNavigate } from 'react-router';
import { Calendar, ChevronRight } from 'lucide-react';
import type { Match } from '@/types/core';
import { getSportConfig } from '@/lib/sports-config';
import { formatDate } from '@/lib/utils';
import TeamAvatar from '@/components/ui/TeamAvatar';
import StatusBadge from '@/components/ui/StatusBadge';
import { SportIcon } from '@/components/icons/SportIcons';

interface Props {
  match: Match;
}

export default function MatchCard({ match }: Props) {
  const navigate = useNavigate();
  const sportConfig = getSportConfig(match.sport);

  function handleClick() {
    if (match.status === 'live' || match.status === 'paused') {
      navigate(`/matches/${match.id}/live`);
    } else {
      navigate(`/matches/${match.id}`);
    }
  }

  const isLive = match.status === 'live' || match.status === 'paused';

  return (
    <button
      className="card w-full text-left hover:scale-[1.01] transition-transform"
      style={{
        cursor: 'pointer',
        borderColor: isLive ? 'var(--danger)' : undefined,
        boxShadow: isLive
          ? '0 0 20px color-mix(in srgb, var(--danger) 15%, transparent)'
          : undefined,
      }}
      onClick={handleClick}
      id={`match-card-${match.id}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <SportIcon sport={match.sport} size={16} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {sportConfig.label}
          </span>
          {match.tournamentId && (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--accent)',
                background: 'var(--accent-muted)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              Turnamen
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <TeamAvatar team={match.teamHome} size={40} />
          <div className="min-w-0">
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {match.teamHome.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Home
            </div>
          </div>
        </div>

        {/* Score */}
        <div
          className="flex items-center gap-3 flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 500,
              color: 'var(--score-home)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {match.totalScoreHome}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>:</span>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 500,
              color: 'var(--score-away)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {match.totalScoreAway}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <div className="min-w-0 text-right">
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {match.teamAway.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Away
            </div>
          </div>
          <TeamAvatar team={match.teamAway} size={40} />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-2 mt-3 pt-3"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
        }}
      >
        <Calendar size={12} />
        <span>{formatDate(match.createdAt)}</span>
        {match.currentPeriod > 0 && (
          <>
            <span>·</span>
            <span>
              {sportConfig.periodLabel} {match.currentPeriod}
            </span>
          </>
        )}
      </div>
    </button>
  );
}
