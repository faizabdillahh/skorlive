// pages/NewTournamentPage.tsx — Form buat turnamen baru

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { SportIcon } from '@/components/icons/SportIcons';
import TeamAvatar from '@/components/ui/TeamAvatar';
import type { SportType, TournamentFormat, Team } from '@/types/core';
// utils tidak dipakai langsung di page ini

const SPORTS: { value: SportType; label: string }[] = [
  { value: 'football', label: 'Sepak Bola' },
  { value: 'basketball', label: 'Basket' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'volleyball', label: 'Voli' },
  { value: 'badminton', label: 'Badminton' },
];

const FORMATS: { value: TournamentFormat; label: string; desc: string }[] = [
  { value: 'round_robin', label: 'Round Robin', desc: 'Semua tim bertemu semua tim. Cocok untuk 4–8 tim.' },
  { value: 'single_elimination', label: 'Single Eliminasi', desc: 'Kalah langsung gugur. Butuh 4, 8, atau 16 tim.' },
  { value: 'group_then_knockout', label: 'Grup + Knockout', desc: 'Fase grup lalu eliminasi. Cocok untuk turnamen besar.' },
];

const PRESET_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce',
  '#805ad5', '#d53f8c', '#2d3748', '#e2e8f0', '#f6e05e',
];

export default function NewTournamentPage() {
  const navigate = useNavigate();
  const savedTeams = useAppStore((s) => s.teams);
  const addTeamToStore = useAppStore((s) => s.addTeam);
  const { createTournament, generateMatches, setActiveTournament } = useAppStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sport, setSport] = useState<SportType>('football');
  const [format, setFormat] = useState<TournamentFormat>('round_robin');
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  // Quick add team
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#3182ce');
  const [showAddTeam, setShowAddTeam] = useState(false);

  function addSavedTeam(team: Team) {
    if (selectedTeams.find((t) => t.id === team.id)) return;
    setSelectedTeams((prev) => [...prev, team]);
  }

  function addNewTeam() {
    if (!newTeamName.trim()) return;
    const team = addTeamToStore({
      name: newTeamName.trim(),
      shortName: newTeamName.trim().slice(0, 4).toUpperCase(),
      colorPrimary: newTeamColor,
      colorSecondary: '#2d3748',
    });
    setSelectedTeams((prev) => [...prev, team]);
    setNewTeamName('');
    setShowAddTeam(false);
  }

  function removeTeam(id: string) {
    setSelectedTeams((prev) => prev.filter((t) => t.id !== id));
  }

  function handleCreate() {
    if (!name.trim() || selectedTeams.length < 2) return;
    const tournament = createTournament({
      name: name.trim(),
      sport,
      format,
      description: description.trim() || undefined,
      teams: selectedTeams,
    });
    generateMatches(tournament.id);
    setActiveTournament(tournament.id);
    navigate(`/tournaments/${tournament.id}`);
  }

  const availableTeams = savedTeams.filter(
    (t) => !selectedTeams.find((s) => s.id === t.id),
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
        BUAT TURNAMEN
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Isi detail turnamen, pilih tim, dan generate jadwal otomatis
      </p>

      {/* Basic info */}
      <div className="card mb-5">
        <div className="label mb-3">INFORMASI TURNAMEN</div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="label">Nama Turnamen *</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Turnamen RT 07 Cup 2026"
              maxLength={100}
              id="tournament-name"
            />
          </div>
          <div>
            <label className="label">Deskripsi (opsional)</label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi turnamen, lokasi, hadiah, dll."
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Sport */}
      <div className="card mb-5">
        <div className="label mb-3">CABANG OLAHRAGA</div>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
        >
          {SPORTS.map((s) => (
            <button
              key={s.value}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: sport === s.value ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: sport === s.value ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                color: sport === s.value ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
              onClick={() => setSport(s.value)}
            >
              <SportIcon sport={s.value} size={26} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="card mb-5">
        <div className="label mb-3">FORMAT TURNAMEN</div>
        <div className="flex flex-col gap-3">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              style={{
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: format === f.value ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: format === f.value ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
              }}
              onClick={() => setFormat(f.value)}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: format === f.value ? 'var(--accent)' : 'var(--text-primary)',
                  marginBottom: 4,
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.95rem',
                }}
              >
                {f.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {f.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="label" style={{ margin: 0 }}>
            TIM PESERTA ({selectedTeams.length})
          </div>
          <button
            className="btn btn-secondary"
            style={{ minHeight: 32, fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
            onClick={() => setShowAddTeam((v) => !v)}
          >
            <Plus size={14} /> Tim Baru
          </button>
        </div>

        {/* Quick add form */}
        {showAddTeam && (
          <div
            className="flex gap-3 mb-4 p-3 rounded-lg"
            style={{ background: 'var(--bg-elevated)', flexWrap: 'wrap' }}
          >
            <input
              className="input"
              style={{ flex: 1, minWidth: 160 }}
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Nama tim..."
              onKeyDown={(e) => e.key === 'Enter' && addNewTeam()}
            />
            <div className="flex gap-2 items-center">
              {PRESET_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c}
                  onClick={() => setNewTeamColor(c)}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: c,
                    border: newTeamColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <button className="btn btn-primary" style={{ minHeight: 40 }} onClick={addNewTeam} disabled={!newTeamName.trim()}>
              Tambah
            </button>
          </div>
        )}

        {/* Pick from saved teams */}
        {availableTeams.length > 0 && (
          <div className="mb-4">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Tim tersimpan:
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTeams.map((team) => (
                <button
                  key={team.id}
                  className="flex items-center gap-2"
                  style={{
                    padding: '0.375rem 0.625rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    transition: 'all 150ms',
                  }}
                  onClick={() => addSavedTeam(team)}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      background: team.colorPrimary,
                    }}
                  />
                  {team.name}
                  <Plus size={12} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected teams */}
        {selectedTeams.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedTeams.map((team, i) => (
              <div
                key={team.id}
                className="flex items-center gap-3"
                style={{
                  padding: '0.625rem 0.75rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', width: 20 }}>
                  {i + 1}
                </span>
                <TeamAvatar team={team} size={32} />
                <span style={{ flex: 1, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {team.name}
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '0.25rem', minHeight: 'auto', color: 'var(--danger)' }}
                  onClick={() => removeTeam(team.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.875rem' }}>
            <Users size={32} strokeWidth={1} style={{ margin: '0 auto 0.5rem' }} />
            Tambah minimal 2 tim peserta
          </div>
        )}
      </div>

      {/* Create button */}
      <button
        className="btn btn-primary w-full"
        style={{ fontSize: '1rem', minHeight: 56, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}
        onClick={handleCreate}
        disabled={!name.trim() || selectedTeams.length < 2}
        id="create-tournament-btn"
      >
        BUAT & GENERATE JADWAL
      </button>

      {selectedTeams.length < 2 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
          Minimal 2 tim diperlukan untuk membuat turnamen
        </p>
      )}
    </div>
  );
}
