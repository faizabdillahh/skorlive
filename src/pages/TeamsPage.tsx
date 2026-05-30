// pages/TeamsPage.tsx — Manajemen tim

import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import TeamAvatar from '@/components/ui/TeamAvatar';
import { formatDate, fileToDataUrl } from '@/lib/utils';
import type { Team } from '@/types/core';

const PRESET_COLORS = [
  '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce',
  '#805ad5', '#d53f8c', '#2d3748', '#718096', '#f6e05e',
];

function TeamForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Team>;
  onSave: (data: Omit<Team, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [shortName, setShortName] = useState(initial?.shortName ?? '');
  const [colorPrimary, setColorPrimary] = useState(initial?.colorPrimary ?? '#3182ce');
  const [colorSecondary, setColorSecondary] = useState(initial?.colorSecondary ?? '#2d3748');
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(initial?.logoDataUrl);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const dataUrl = await fileToDataUrl(file);
      setLogoDataUrl(dataUrl);
    }
  }

  function handleSave() {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      shortName: shortName.trim().toUpperCase().slice(0, 4) || name.trim().slice(0, 4).toUpperCase(),
      colorPrimary,
      colorSecondary,
      logoDataUrl,
    });
  }

  const preview: Team = {
    id: 'preview',
    name: name || 'Nama Tim',
    shortName: shortName || name.slice(0, 4).toUpperCase() || 'TIM',
    colorPrimary,
    colorSecondary,
    logoDataUrl,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div className="flex items-center gap-4 mb-5">
        <TeamAvatar team={preview} size={56} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700 }}>
            {name || 'Nama Tim'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Preview</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="label">Nama Tim *</label>
          <input
            className="input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!shortName) setShortName(e.target.value.slice(0, 4).toUpperCase());
            }}
            placeholder="Contoh: Garuda FC"
            maxLength={50}
            id="team-name-input"
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
            id="team-shortname-input"
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
                }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={colorPrimary}
              onChange={(e) => setColorPrimary(e.target.value)}
              style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0 }}
            />
          </div>
        </div>
        <div>
          <label className="label">Warna Sekunder (border avatar)</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={colorSecondary}
              onChange={(e) => setColorSecondary(e.target.value)}
              style={{ width: 40, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0 }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{colorSecondary}</span>
          </div>
        </div>
        <div>
          <label className="label">Logo Tim (opsional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="input"
            style={{ padding: '0.5rem' }}
          />
          {logoDataUrl && (
            <button
              style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setLogoDataUrl(undefined)}
            >
              Hapus logo
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button className="btn btn-ghost flex-1" onClick={onCancel}>Batal</button>
        <button
          className="btn btn-primary flex-1"
          onClick={handleSave}
          disabled={!name.trim()}
          id="save-team-btn"
        >
          Simpan Tim
        </button>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const teams = useAppStore((s) => s.teams);
  const { addTeam, updateTeam, deleteTeam, setUi } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  function handleAdd(data: Omit<Team, 'id' | 'createdAt'>) {
    addTeam(data);
    setShowAddForm(false);
  }

  function handleUpdate(id: string, data: Omit<Team, 'id' | 'createdAt'>) {
    updateTeam(id, data);
    setEditId(null);
  }

  function handleDelete(team: Team) {
    setUi({
      confirmDialog: {
        title: `Hapus "${team.name}"?`,
        message: 'Tim yang dihapus tidak bisa dikembalikan.',
        variant: 'danger',
        onConfirm: () => deleteTeam(team.id),
      },
    });
  }

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
            MANAJEMEN TIM
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            {teams.length} tim tersimpan
          </p>
        </div>
        {!showAddForm && (
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
            id="add-team-btn"
          >
            <Plus size={16} /> Tambah Tim
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <TeamForm
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Team list */}
      {teams.length > 0 ? (
        <div className="flex flex-col gap-3">
          {teams.map((team) => (
            <div key={team.id}>
              {editId === team.id ? (
                <TeamForm
                  initial={team}
                  onSave={(data) => handleUpdate(team.id, data)}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <div
                  className="card"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}
                >
                  <TeamAvatar team={team} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {team.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {team.shortName} · Dibuat {formatDate(team.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: team.colorPrimary,
                        border: '2px solid var(--border)',
                      }}
                      title={team.colorPrimary}
                    />
                    <button
                      className="btn btn-ghost"
                      style={{ minHeight: 'auto', padding: '0.375rem' }}
                      onClick={() => setEditId(team.id)}
                      id={`edit-team-${team.id}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ minHeight: 'auto', padding: '0.375rem', color: 'var(--danger)' }}
                      onClick={() => handleDelete(team)}
                      id={`delete-team-${team.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !showAddForm && (
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
            <Users size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: 8 }}>
              Belum Ada Tim
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', maxWidth: 300, margin: '0 auto 1.5rem' }}>
              Tambahkan tim untuk reuse di berbagai pertandingan
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <Plus size={16} /> Tambah Tim
            </button>
          </div>
        )
      )}
    </div>
  );
}
