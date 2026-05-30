// pages/DashboardPage.tsx — Halaman utama / dashboard

import { useNavigate } from 'react-router';
import { Plus, Play, Trophy, Activity, Users, Clock } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import MatchCard from '@/components/match/MatchCard';
import { SportIcon } from '@/components/icons/SportIcons';
import { getSportConfig } from '@/lib/sports-config';
import type { SportType } from '@/types/core';

const SPORTS: SportType[] = ['football', 'basketball', 'futsal', 'volleyball', 'badminton'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const matches = useAppStore((s) => s.matches);
  const tournaments = useAppStore((s) => s.tournaments);
  const teams = useAppStore((s) => s.teams);

  const liveMatches = matches.filter(
    (m) => m.status === 'live' || m.status === 'paused',
  );
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: 'Pertandingan',
      value: matches.length,
      icon: <Activity size={20} />,
      color: 'var(--score-home)',
    },
    {
      label: 'Turnamen',
      value: tournaments.length,
      icon: <Trophy size={20} />,
      color: 'var(--accent)',
    },
    {
      label: 'Tim',
      value: teams.length,
      icon: <Users size={20} />,
      color: 'var(--score-away)',
    },
    {
      label: 'Live',
      value: liveMatches.length,
      icon: <Clock size={20} />,
      color: 'var(--danger)',
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.01em',
              color: 'var(--text-primary)',
            }}
          >
            DASHBOARD
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Kelola pertandingan dan turnamen olahraga
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/matches/new')}
          id="dashboard-new-match"
        >
          <Plus size={16} />
          Pertandingan Baru
        </button>
      </div>

      {/* Stats grid */}
      <div
        className="grid gap-4 mb-12"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card-elevated"
            style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-base)',
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  marginTop: '0.25rem',
                }}
              >
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              LIVE SEKARANG
            </h2>
            <span className="badge badge-live">LIVE</span>
          </div>
          <div className="flex flex-col gap-4">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Sport selector shortcuts */}
      <section className="mb-12">
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
          }}
        >
          MULAI PERTANDINGAN
        </h2>
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
        >
          {SPORTS.map((sport) => {
            const config = getSportConfig(sport);
            return (
              <button
                key={sport}
                className="card-elevated"
                style={{
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 200ms ease',
                  background: 'var(--bg-elevated)',
                }}
                id={`start-${sport}`}
                onClick={() =>
                  navigate('/matches/new', { state: { sport } })
                }
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--accent-muted)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'var(--bg-elevated)';
                }}
              >
                <div style={{ color: 'var(--accent)' }}>
                  <SportIcon sport={sport} size={32} />
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.03em',
                  }}
                >
                  {config.label}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    color: 'var(--accent)',
                    fontSize: '0.8rem',
                  }}
                >
                  <Play size={12} />
                  <span>Mulai</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              PERTANDINGAN TERBARU
            </h2>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8125rem', minHeight: 'auto', padding: '0.375rem 0.75rem' }}
              onClick={() => navigate('/history')}
            >
              Lihat Semua
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {matches.length === 0 && (
        <div
          style={{
            padding: '3rem 2rem',
            marginTop: '1rem',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            background: 'color-mix(in srgb, var(--bg-elevated) 50%, transparent)',
          }}
        >
          <div
            style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}
          >
            <Activity size={48} strokeWidth={1} style={{ margin: '0 auto' }} />
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              marginBottom: 8,
            }}
          >
            Belum Ada Pertandingan
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem', maxWidth: 300, margin: '0 auto 1.5rem' }}>
            Mulai catat skor pertandingan pertama kamu!
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/matches/new')}
          >
            <Plus size={16} />
            Buat Pertandingan
          </button>
        </div>
      )}
    </div>
  );
}
