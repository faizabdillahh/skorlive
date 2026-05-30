// components/ui/StatusBadge.tsx — Badge status pertandingan

import type { MatchStatus } from '@/types/core';

interface Props {
  status: MatchStatus;
}

const statusConfig: Record<MatchStatus, { label: string; className: string }> = {
  live: { label: 'LIVE', className: 'badge badge-live' },
  finished: { label: 'Selesai', className: 'badge badge-finished' },
  scheduled: { label: 'Terjadwal', className: 'badge badge-scheduled' },
  paused: { label: 'Jeda', className: 'badge badge-paused' },
  cancelled: { label: 'Dibatalkan', className: 'badge badge-finished' },
};

export default function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return <span className={config.className}>{config.label}</span>;
}
