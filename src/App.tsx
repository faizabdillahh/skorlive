// src/App.tsx — Root component dengan routing dan theme provider

import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useAppStore } from '@/stores/app-store';
import { applyTheme } from '@/lib/theme';
import AppLayout from '@/components/layout/AppLayout';
import DashboardPage from '@/pages/DashboardPage';
import NewMatchPage from '@/pages/NewMatchPage';
import LiveMatchPage from '@/pages/LiveMatchPage';
import HistoryPage from '@/pages/HistoryPage';
import MatchDetailPage from '@/pages/MatchDetailPage';
import TournamentsPage from '@/pages/TournamentsPage';
import TournamentDetailPage from '@/pages/TournamentDetailPage';
import NewTournamentPage from '@/pages/NewTournamentPage';
import TeamsPage from '@/pages/TeamsPage';
import SettingsPage from '@/pages/SettingsPage';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function App() {
  const theme = useAppStore((s) => s.settings.theme);
  const confirmDialog = useAppStore((s) => s.ui.confirmDialog);
  const setUi = useAppStore((s) => s.setUi);

  // Apply theme on mount dan saat berubah
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="matches">
            <Route index element={<Navigate to="/" replace />} />
            <Route path="new" element={<NewMatchPage />} />
            <Route path=":matchId/live" element={<LiveMatchPage />} />
            <Route path=":matchId" element={<MatchDetailPage />} />
          </Route>
          <Route path="tournaments">
            <Route index element={<TournamentsPage />} />
            <Route path="new" element={<NewTournamentPage />} />
            <Route path=":tournamentId" element={<TournamentDetailPage />} />
          </Route>
          <Route path="history" element={<HistoryPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Global Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setUi({ confirmDialog: null });
          }}
          onCancel={() => setUi({ confirmDialog: null })}
        />
      )}
    </>
  );
}
