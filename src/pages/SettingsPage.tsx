// pages/SettingsPage.tsx — Pengaturan aplikasi

import { Settings, Palette, RefreshCw, Volume2, VolumeX, Zap, ZapOff, Monitor, Sun, Moon, Flame, AppWindow } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { applyTheme, themeLabels, themeDescriptions } from '@/lib/theme';
import type { ThemeName, SportType } from '@/types/core';
import { getSportConfig } from '@/lib/sports-config';

const THEMES: ThemeName[] = ['stadium', 'court', 'night_game', 'retro_pitch', 'minimal_sport'];
const SPORTS: SportType[] = ['football', 'basketball', 'futsal', 'volleyball', 'badminton'];


const THEME_BG_PREVIEW: Record<ThemeName, string> = {
  stadium: '#0d1117',
  court: '#1c1107',
  night_game: '#040810',
  retro_pitch: '#1a1612',
  minimal_sport: '#f7f9fc',
};

const THEME_ICONS: Record<ThemeName, React.FC<any>> = {
  stadium: Monitor,
  court: Sun,
  night_game: Moon,
  retro_pitch: Flame,
  minimal_sport: AppWindow,
};

const THEME_ACCENT_PREVIEW: Record<ThemeName, string> = {
  stadium: '#2ea043',
  court: '#ea580c',
  night_game: '#fbbf24',
  retro_pitch: '#e63329',
  minimal_sport: '#1a3a8f',
};

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const setUi = useAppStore((s) => s.setUi);

  function handleThemeChange(theme: ThemeName) {
    updateSettings({ theme });
    applyTheme(theme);
  }

  function handleReset() {
    setUi({
      confirmDialog: {
        title: 'Reset Semua Data?',
        message:
          'Semua pertandingan, turnamen, dan tim akan dihapus permanen. Data tidak bisa dikembalikan.',
        variant: 'danger',
        onConfirm: () => {
          clearAllData();
        },
      },
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="flex items-center gap-3 mb-8">
        <Settings size={28} style={{ color: 'var(--accent)' }} />
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
            PENGATURAN
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Kustomisasi tampilan dan perilaku aplikasi
          </p>
        </div>
      </div>

      {/* Theme selection */}
      <div className="card mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={18} style={{ color: 'var(--accent)' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', letterSpacing: '0.05em' }}>
            TEMA VISUAL
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {THEMES.map((theme) => {
            const isSelected = settings.theme === theme;
            const Icon = THEME_ICONS[theme];
            return (
              <button
                key={theme}
                id={`theme-btn-${theme}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--border-accent)' : '2px solid var(--border)',
                  background: isSelected ? 'var(--accent-muted)' : 'var(--bg-elevated)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms ease',
                }}
                onClick={() => handleThemeChange(theme)}
              >
                {/* Color preview */}
                <div
                  style={{
                    width: 44,
                    height: 36,
                    borderRadius: 8,
                    background: THEME_BG_PREVIEW[theme],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: THEME_ACCENT_PREVIEW[theme],
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    <Icon size={16} />
                    {themeLabels[theme]}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {themeDescriptions[theme]}
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferences */}
      <div className="card mb-8">
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
          }}
        >
          PREFERENSI
        </h2>

        {/* Animations toggle */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '0.875rem 1rem',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
          }}
        >
          <div className="flex items-center gap-3">
            {settings.animationsEnabled ? (
              <Zap size={18} style={{ color: 'var(--accent)' }} />
            ) : (
              <ZapOff size={18} style={{ color: 'var(--text-muted)' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Animasi
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Animasi skor dan transisi UI
              </div>
            </div>
          </div>
          <button
            id="toggle-animations"
            onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: settings.animationsEnabled ? 'var(--accent)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 200ms',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: settings.animationsEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 200ms',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Sound toggle */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '0.875rem 1rem',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
          }}
        >
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 size={18} style={{ color: 'var(--accent)' }} />
            ) : (
              <VolumeX size={18} style={{ color: 'var(--text-muted)' }} />
            )}
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Suara
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Efek suara saat skor bertambah
              </div>
            </div>
          </div>
          <button
            id="toggle-sound"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: settings.soundEnabled ? 'var(--accent)' : 'var(--border)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 200ms',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: settings.soundEnabled ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 200ms',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Default sport */}
        <div
          style={{
            padding: '0.875rem 1rem',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 8 }}>
            Olahraga Default
          </div>
          <select
            className="select"
            value={settings.defaultSport}
            onChange={(e) =>
              updateSettings({ defaultSport: e.target.value as SportType })
            }
            id="default-sport-select"
          >
            {SPORTS.map((s) => (
              <option key={s} value={s}>
                {getSportConfig(s).label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data management */}
      <div className="card mb-8" style={{ borderColor: 'color-mix(in srgb, var(--danger) 30%, transparent)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem',
            color: 'var(--danger)',
          }}
        >
          ZONA BAHAYA
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Tindakan di bawah bersifat permanen dan tidak dapat dibatalkan.
        </p>
        <button
          className="btn btn-danger"
          onClick={handleReset}
          id="reset-all-data-btn"
        >
          <RefreshCw size={16} /> Reset Semua Data
        </button>
      </div>

      {/* App version */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
        }}
      >
        SkorLive v1.0.0 · Sistem Skor Olahraga Multi-Cabang · Data tersimpan di browser lokal
      </div>
    </div>
  );
}
