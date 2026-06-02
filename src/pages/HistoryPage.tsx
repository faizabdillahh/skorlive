// pages/HistoryPage.tsx — Halaman histori semua pertandingan

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, History } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import MatchCard from '@/components/match/MatchCard';
import { getSportConfig } from '@/lib/sports-config';
import type { SportType, MatchStatus } from '@/types/core';

const SPORT_OPTIONS: { value: SportType | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Olahraga' },
  { value: 'football', label: 'Sepak Bola' },
  { value: 'basketball', label: 'Basket' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'volleyball', label: 'Voli' },
  { value: 'badminton', label: 'Badminton' },
];

const STATUS_OPTIONS: { value: MatchStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'live', label: 'Live' },
  { value: 'finished', label: 'Selesai' },
  { value: 'scheduled', label: 'Terjadwal' },
  { value: 'paused', label: 'Jeda' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const matches = useAppStore((s) => s.matches);

  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState<SportType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all');

  const filtered = [...matches]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter((m) => {
      if (sportFilter !== 'all' && m.sport !== sportFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !m.teamHome.name.toLowerCase().includes(q) &&
          !m.teamAway.name.toLowerCase().includes(q) &&
          !getSportConfig(m.sport).label.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

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
            HISTORI
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {matches.length} pertandingan tercatat
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/matches/new')}
        >
          Pertandingan Baru
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div style={{ position: 'relative' }} className="w-full sm:flex-1">
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Cari tim atau olahraga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="history-search"
          />
        </div>
        <select
          className="select w-full sm:w-[180px]"
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value as SportType | 'all')}
          id="history-sport-filter"
        >
          {SPORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          className="select w-full sm:w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MatchStatus | 'all')}
          id="history-status-filter"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
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
          <History size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: 8 }}>
            {matches.length === 0 ? 'Belum Ada Histori' : 'Tidak Ada Hasil'}
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: 300, margin: '0 auto' }}>
            {matches.length === 0
              ? 'Mulai pertandingan pertama untuk melihat histori di sini.'
              : 'Coba ubah filter pencarian.'}
          </p>
        </div>
      )}
    </div>
  );
}
