// lib/theme.ts — Definisi 5 tema visual dengan font pairing yang dikurasi per riset

import type { ThemeName } from '@/types/core';

export interface ThemeConfig {
  // Colors
  '--bg-base': string;
  '--bg-surface': string;
  '--bg-elevated': string;
  '--accent': string;
  '--accent-hover': string;
  '--accent-muted': string;
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--border': string;
  '--border-accent': string;
  '--danger': string;
  '--success': string;
  '--warning': string;
  '--score-home': string;
  '--score-away': string;
  // Typography — berubah per tema
  '--font-heading': string;
  '--font-body': string;
  '--font-mono': string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  /**
   * STADIUM — Liga Profesional
   * Mood: Siaran TV, malam di stadion besar, hijau lapangan vs gelap tribun
   * Fonts: Oswald (athletic condensed) + Inter (legible modern)
   * Palette: Charcoal-black GitHub-style + vibrant field green
   */
  stadium: {
    '--bg-base': '#0d1117',
    '--bg-surface': '#161b22',
    '--bg-elevated': '#21262d',
    '--accent': '#2ea043',
    '--accent-hover': '#3fb950',
    '--accent-muted': '#122a1a',
    '--text-primary': '#e6edf3',
    '--text-secondary': '#b0bec5',
    '--text-muted': '#7a8898',
    '--border': '#2d333b',
    '--border-accent': '#2ea043',
    '--danger': '#f85149',
    '--success': '#3fb950',
    '--warning': '#d29922',
    '--score-home': '#58a6ff',
    '--score-away': '#f78166',
    '--font-heading': "'Oswald', system-ui, sans-serif",
    '--font-body': "'Inter', system-ui, sans-serif",
    '--font-mono': "'Roboto Mono', 'Courier New', monospace",
  },

  /**
   * COURT — Parket Basket NBA
   * Mood: Arena basket indoor, energi warm amber, kayu parket vs sorot jingga
   * Fonts: Bebas Neue (bold punchy NBA-style) + Montserrat (geometric clean)
   * Palette: Deep mahogany + copper-orange, terinspirasi Denver Nuggets arena
   */
  court: {
    '--bg-base': '#1c1107',
    '--bg-surface': '#2a1a0a',
    '--bg-elevated': '#3a2310',
    '--accent': '#ea580c',
    '--accent-hover': '#f97316',
    '--accent-muted': '#3b1502',
    '--text-primary': '#fef9f0',
    '--text-secondary': '#fde5b8',
    '--text-muted': '#b87333',
    '--border': '#5c310e',
    '--border-accent': '#ea580c',
    '--danger': '#dc2626',
    '--success': '#16a34a',
    '--warning': '#eab308',
    '--score-home': '#fbbf24',
    '--score-away': '#f87171',
    '--font-heading': "'Bebas Neue', 'Oswald', system-ui, sans-serif",
    '--font-body': "'Montserrat', system-ui, sans-serif",
    '--font-mono': "'Roboto Mono', 'Courier New', monospace",
  },

  /**
   * NIGHT GAME — Pertandingan Malam Dramatis
   * Mood: Siaran live bawah lampu sorot, navy dalam + gold spotlight
   * Fonts: Barlow Condensed (sleek broadcast) + Barlow (matching clean body)
   * Palette: Midnight navy #040810 + warm gold #fbbf24, terinspirasi UEFA broadcast
   */
  night_game: {
    '--bg-base': '#040810',
    '--bg-surface': '#0a1628',
    '--bg-elevated': '#112240',
    '--accent': '#fbbf24',
    '--accent-hover': '#fcd34d',
    '--accent-muted': '#1e1700',
    '--text-primary': '#e8eef5',
    '--text-secondary': '#b0bfd0',
    '--text-muted': '#4e6a8a',
    '--border': '#16304d',
    '--border-accent': '#fbbf24',
    '--danger': '#ef4444',
    '--success': '#22c55e',
    '--warning': '#f59e0b',
    '--score-home': '#38bdf8',
    '--score-away': '#fb7185',
    '--font-heading': "'Barlow Condensed', 'Oswald', system-ui, sans-serif",
    '--font-body': "'Barlow', system-ui, sans-serif",
    '--font-mono': "'Roboto Mono', 'Courier New', monospace",
  },

  /**
   * RETRO PITCH — Lapangan Komunitas 90an
   * Mood: Futsal/voli tingkat kelurahan, energi lokal yang penuh semangat
   * Fonts: Teko (chunky retro bold) + Nunito Sans (friendly rounded body)
   * Palette: Warm dark charcoal + bold red, terinspirasi poster turnamen antar-RT
   */
  retro_pitch: {
    '--bg-base': '#1a1612',
    '--bg-surface': '#26211c',
    '--bg-elevated': '#332c27',
    '--accent': '#e63329',
    '--accent-hover': '#f04a40',
    '--accent-muted': '#3b0a08',
    '--text-primary': '#f5f0eb',
    '--text-secondary': '#d6cfc8',
    '--text-muted': '#9e9089',
    '--border': '#3e3530',
    '--border-accent': '#e63329',
    '--danger': '#e63329',
    '--success': '#16a34a',
    '--warning': '#d97706',
    '--score-home': '#34d399',
    '--score-away': '#f87171',
    '--font-heading': "'Teko', 'Oswald', system-ui, sans-serif",
    '--font-body': "'Nunito Sans', system-ui, sans-serif",
    '--font-mono': "'Roboto Mono', 'Courier New', monospace",
  },

  /**
   * MINIMAL SPORT — Turnamen Formal / Presentasi Resmi
   * Mood: Clean, korporat, cocok ditampilkan di proyektor rapat/turnamen formal
   * Fonts: Plus Jakarta Sans (geometric premium) + DM Sans (ultra-clean modern)
   * Palette: Near-white #f7f9fc + deep navy #1a3a8f + JetBrains Mono untuk angka
   */
  minimal_sport: {
    '--bg-base': '#f7f9fc',
    '--bg-surface': '#ffffff',
    '--bg-elevated': '#eef2f7',
    '--accent': '#1a3a8f',
    '--accent-hover': '#1e40af',
    '--accent-muted': '#dbeafe',
    '--text-primary': '#0a1929',
    '--text-secondary': '#2c4a6e',
    '--text-muted': '#5a7a9a',
    '--border': '#d5e0ef',
    '--border-accent': '#1a3a8f',
    '--danger': '#c8230e',
    '--success': '#146c3c',
    '--warning': '#b05a00',
    '--score-home': '#1a3a8f',
    '--score-away': '#7c3aed',
    '--font-heading': "'Plus Jakarta Sans', system-ui, sans-serif",
    '--font-body': "'DM Sans', system-ui, sans-serif",
    '--font-mono': "'JetBrains Mono', 'Courier New', monospace",
  },
};

export const themeLabels: Record<ThemeName, string> = {
  stadium: 'Stadium',
  court: 'Court',
  night_game: 'Night Game',
  retro_pitch: 'Retro Pitch',
  minimal_sport: 'Minimal Sport',
};

export const themeDescriptions: Record<ThemeName, string> = {
  stadium: 'Liga profesional. Charcoal gelap, hijau lapangan. Oswald + Inter.',
  court: 'Parket basket. Warm mahogany, copper-orange. Bebas Neue + Montserrat.',
  night_game: 'Malam dramatis. Navy dalam, sorot emas. Barlow Condensed + Barlow.',
  retro_pitch: 'Komunitas 90an. Charcoal hangat, merah bold. Teko + Nunito Sans.',
  minimal_sport: 'Formal & bersih. Navy biru tua, latar terang. Jakarta Sans + DM Sans.',
};

export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName];
  const root = document.documentElement;

  // Apply semua CSS variables — termasuk font variables
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Update body font-family secara langsung agar body text ikut berubah
  document.body.style.fontFamily = theme['--font-body'];

  root.setAttribute('data-theme', themeName);
}
