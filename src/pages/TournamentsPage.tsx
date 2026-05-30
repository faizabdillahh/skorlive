// pages/TournamentsPage.tsx — Daftar turnamen

import { useNavigate } from 'react-router';
import { Trophy, Plus, Calendar } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { getSportConfig } from '@/lib/sports-config';
import { SportIcon } from '@/components/icons/SportIcons';
import { formatDate } from '@/lib/utils';

const statusLabel = {
  upcoming: 'Akan Datang',
  ongoing: 'Berlangsung',
  finished: 'Selesai',
};

const statusColor = {
  upcoming: 'var(--accent)',
  ongoing: 'var(--danger)',
  finished: 'var(--text-muted)',
};

export default function TournamentsPage() {
  const navigate = useNavigate();
  const tournaments = useAppStore((s) => s.tournaments);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            TURNAMEN
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {tournaments.length} turnamen
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/tournaments/new')}
          id="new-tournament-btn"
        >
          <Plus size={16} /> Buat Turnamen
        </button>
      </div>

      {tournaments.length > 0 ? (
        <div className="flex flex-col gap-4">
          {[...tournaments]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((t) => (
              <button
                key={t.id}
                className="card w-full text-left"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tournaments/${t.id}`)}
                id={`tournament-card-${t.id}`}
              >
                <div className="flex items-start gap-4">
                  {/* Sport icon */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  >
                    <SportIcon sport={t.sport} size={24} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {t.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: statusColor[t.status],
                          flexShrink: 0,
                        }}
                      >
                        {statusLabel[t.status]}
                      </span>
                    </div>

                    <div
                      className="flex flex-wrap gap-3"
                      style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}
                    >
                      <span>{getSportConfig(t.sport).label}</span>
                      <span>·</span>
                      <span>{t.teams.length} tim</span>
                      <span>·</span>
                      <span>
                        {t.format === 'round_robin'
                          ? 'Round Robin'
                          : t.format === 'single_elimination'
                          ? 'Single Eliminasi'
                          : t.format === 'double_elimination'
                          ? 'Double Eliminasi'
                          : 'Grup + Knockout'}
                      </span>
                    </div>

                    {t.champion && (
                      <div
                        style={{
                          marginTop: 8,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: 'var(--warning)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        <Trophy size={14} />
                        Juara: {t.champion.name}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--text-muted)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Calendar size={12} />
                      {formatDate(t.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      ) : (
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
          <Trophy size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: 8 }}>
            Belum Ada Turnamen
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: 300, margin: '0 auto 1.5rem' }}>
            Buat turnamen pertamamu dan generate jadwal otomatis!
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/tournaments/new')}>
            <Plus size={16} /> Buat Turnamen
          </button>
        </div>
      )}
    </div>
  );
}
