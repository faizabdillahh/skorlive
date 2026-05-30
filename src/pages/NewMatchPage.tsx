// pages/NewMatchPage.tsx — Form buat pertandingan baru

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { sportsConfig } from '@/lib/sports-config';
import { SportIcon } from '@/components/icons/SportIcons';
import TeamAvatar from '@/components/ui/TeamAvatar';
import type { SportType, Team } from '@/types/core';
import { getContrastColor } from '@/lib/utils';

const SPORT_LIST: SportType[] = ['football', 'basketball', 'futsal', 'volleyball', 'badminton'];

const PRESET_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce',
  '#805ad5', '#d53f8c', '#2d3748', '#e2e8f0', '#f6e05e',
];

function TeamPicker({
  label,
  value,
  onChange,
  savedTeams,
  excludeId,
}: {
  label: string;
  value: Team | null;
  onChange: (t: Team) => void;
  savedTeams: Team[];
  excludeId?: string;
}) {
  const [mode, setMode] = useState<'pick' | 'create'>('pick');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [colorPrimary, setColorPrimary] = useState('#3182ce');
  const [colorSecondary, setColorSecondary] = useState('#2d3748');
  const addTeam = useAppStore((s) => s.addTeam);

  function handleCreate() {
    if (!name.trim()) return;
    const team = addTeam({
      name: name.trim(),
      shortName: shortName.trim().toUpperCase().slice(0, 4) || name.trim().slice(0, 4).toUpperCase(),
      colorPrimary,
      colorSecondary,
    });
    onChange(team);
    setMode('pick');
  }

  const available = savedTeams.filter((t) => t.id !== excludeId);

  return (
    <div
      className="card"
    >
      <div className="label" style={{ marginBottom: '0.75rem' }}>{label}</div>

      {value && (
        <div
          className="flex items-center gap-3 mb-4 p-3 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)' }}
        >
          <TeamAvatar team={value} size={44} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{value.shortName}</div>
          </div>
          <button
            className="btn btn-ghost ml-auto"
            style={{ fontSize: '0.8rem', minHeight: 'auto', padding: '0.25rem 0.625rem' }}
            onClick={() => onChange(null as unknown as Team)}
          >
            Ganti
          </button>
        </div>
      )}

      {!value && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              className={`btn ${mode === 'pick' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, minHeight: 36, fontSize: '0.8125rem' }}
              onClick={() => setMode('pick')}
            >
              <Users size={14} /> Pilih Tim
            </button>
            <button
              className={`btn ${mode === 'create' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, minHeight: 36, fontSize: '0.8125rem' }}
              onClick={() => setMode('create')}
            >
              <Plus size={14} /> Buat Baru
            </button>
          </div>

          {mode === 'pick' && (
            <div className="flex flex-col gap-2">
              {available.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                  Belum ada tim tersimpan. Buat tim baru.
                </p>
              )}
              {available.map((team) => (
                <button
                  key={team.id}
                  className="flex items-center gap-3"
                  style={{
                    padding: '0.625rem',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'border-color 150ms',
                  }}
                  onClick={() => onChange(team)}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <TeamAvatar team={team} size={36} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{team.name}</span>
                </button>
              ))}
            </div>
          )}

          {mode === 'create' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Nama Tim</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!shortName) {
                      setShortName(e.target.value.slice(0, 4).toUpperCase());
                    }
                  }}
                  placeholder="Contoh: Garuda FC"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="label">Nama Singkat (maks 4 huruf)</label>
                <input
                  className="input"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="GRDA"
                  maxLength={4}
                />
              </div>
              <div>
                <label className="label">Warna Primer</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColorPrimary(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: c,
                        border: colorPrimary === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={colorPrimary}
                    onChange={(e) => setColorPrimary(e.target.value)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0 }}
                    title="Pilih warna custom"
                  />
                </div>
              </div>
              <div>
                <label className="label">Warna Sekunder</label>
                <input
                  type="color"
                  value={colorSecondary}
                  onChange={(e) => setColorSecondary(e.target.value)}
                  style={{ width: 40, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0 }}
                />
              </div>

              {/* Preview */}
              {name && (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: colorPrimary,
                      color: getContrastColor(colorPrimary),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      border: `2px solid ${colorSecondary}`,
                    }}
                  >
                    {shortName || name.slice(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview</div>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!name.trim()}
              >
                <Plus size={14} /> Buat Tim
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function NewMatchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createMatch = useAppStore((s) => s.createMatch);
  const startMatch = useAppStore((s) => s.startMatch);
  const teams = useAppStore((s) => s.teams);

  const [sport, setSport] = useState<SportType>(
    (location.state as { sport?: SportType } | null)?.sport ?? 'football',
  );
  const [teamHome, setTeamHome] = useState<Team | null>(null);
  const [teamAway, setTeamAway] = useState<Team | null>(null);

  function handleStart() {
    if (!teamHome || !teamAway) return;
    const match = createMatch({ sport, teamHome, teamAway });
    startMatch(match.id);
    navigate(`/matches/${match.id}/live`);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Back */}
      <button
        className="btn btn-ghost mb-6"
        style={{ minHeight: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
          marginBottom: '0.5rem',
        }}
      >
        PERTANDINGAN BARU
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Pilih cabang olahraga dan tim yang bertanding
      </p>

      {/* Sport selector */}
      <div className="card mb-6">
        <div className="label" style={{ marginBottom: '0.75rem' }}>Cabang Olahraga</div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
        >
          {SPORT_LIST.map((s) => {
            const config = sportsConfig[s];
            const isSelected = sport === s;
            return (
              <button
                key={s}
                id={`sport-btn-${s}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--accent)' : '2px solid var(--border)',
                  background: isSelected ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
                onClick={() => setSport(s)}
              >
                <SportIcon sport={s} size={28} />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team pickers */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <TeamPicker
          label="Tim Home"
          value={teamHome}
          onChange={setTeamHome}
          savedTeams={teams}
          excludeId={teamAway?.id}
        />
        <TeamPicker
          label="Tim Away"
          value={teamAway}
          onChange={setTeamAway}
          savedTeams={teams}
          excludeId={teamHome?.id}
        />
      </div>

      {/* Start button */}
      <button
        className="btn btn-primary w-full"
        style={{ fontSize: '1rem', minHeight: 56, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}
        onClick={handleStart}
        disabled={!teamHome || !teamAway}
        id="start-match-btn"
      >
        MULAI PERTANDINGAN
      </button>

      {(!teamHome || !teamAway) && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
          Pilih tim home dan away terlebih dahulu
        </p>
      )}
    </div>
  );
}
