// components/layout/AppLayout.tsx — Shell layout dengan sidebar navigasi

import { Outlet, useNavigate, useLocation } from 'react-router';
import { useState } from 'react';
import {
  LayoutDashboard,
  Trophy,
  History,
  Users,
  Settings,
  Menu,
  X,
  Plus,
  Zap,
  Github,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  { label: 'Turnamen', path: '/tournaments', icon: <Trophy size={18} /> },
  { label: 'Histori', path: '/history', icon: <History size={18} /> },
  { label: 'Tim', path: '/teams', icon: <Users size={18} /> },
  { label: 'Pengaturan', path: '/settings', icon: <Settings size={18} /> },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useAppStore((s) => s.settings.theme);
  const isMinimal = theme === 'minimal_sport';

  function handleNav(path: string) {
    navigate(path);
    setMobileOpen(false);
  }

  const sidebar = (
    <aside
      className={cn(
        'flex flex-col h-full border-r',
        'transition-colors duration-200',
      )}
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        width: '260px',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3"
        style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 40,
            height: 40,
            background: 'var(--accent)',
          }}
        >
          <Zap size={22} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div
            className="font-bold leading-none"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            SKORLIVE
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Sistem Skor Olahraga
          </div>
        </div>
      </div>

      {/* Quick action */}
      <div style={{ padding: '1rem 1rem 0.5rem' }}>
        <button
          className="btn btn-primary w-full"
          id="new-match-btn"
          onClick={() => handleNav('/matches/new')}
          style={{ justifyContent: 'flex-start', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Pertandingan Baru
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1" style={{ padding: '0.75rem 1rem' }} role="navigation" aria-label="Menu utama">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              className={cn('nav-item', isActive && 'active')}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => handleNav(item.path)}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: '1rem',
          fontSize: '0.75rem',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <span>v1.0.0 · {isMinimal ? 'Minimal Sport' : 'SkorLive'}</span>
        <a
          href="https://github.com/faizabdillahh/skorlive"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-[var(--accent)] transition-colors"
          title="GitHub Repository"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          <Github size={13} />
          GitHub
        </a>
      </div>
    </aside>
  );

  return (
    <div className="layout-app" style={{ minHeight: '100dvh' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col" style={{ gridRow: '1 / -1' }}>
        {sidebar}
      </div>

      {/* Mobile: topbar + drawer */}
      <header
        className="md:hidden flex items-center justify-between px-5 py-4"
        style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 32, height: 32, background: 'var(--accent)' }}
          >
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
            }}
          >
            SKORLIVE
          </span>
        </div>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.4rem', minHeight: 'auto' }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 left-0 h-full flex flex-col"
            style={{ width: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="main-content" style={{ gridColumn: '2 / -1' }}>
        <Outlet />
      </main>
    </div>
  );
}
