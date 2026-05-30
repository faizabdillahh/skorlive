// components/ui/ConfirmDialog.tsx — Modal konfirmasi global

import { AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: <Trash2 size={22} />,
    iconBg: 'var(--danger)',
    confirmClass: 'btn-danger',
    confirmLabel: 'Hapus',
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    iconBg: 'var(--warning)',
    confirmClass: 'btn-primary',
    confirmLabel: 'Lanjutkan',
  },
  info: {
    icon: <Info size={22} />,
    iconBg: 'var(--accent)',
    confirmClass: 'btn-primary',
    confirmLabel: 'OK',
  },
};

export default function ConfirmDialog({
  title,
  message,
  variant = 'info',
  onConfirm,
  onCancel,
}: Props) {
  const config = variantConfig[variant];
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="card animate-slide-in w-full max-w-sm"
        style={{ maxWidth: 400 }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex items-center justify-center rounded-lg flex-shrink-0"
            style={{
              width: 40,
              height: 40,
              background: config.iconBg,
              color: '#fff',
            }}
          >
            {config.icon}
          </div>
          <div className="flex-1">
            <h2
              id="confirm-title"
              style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}
            >
              {title}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {message}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.25rem', minHeight: 'auto' }}
            onClick={onCancel}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button className="btn btn-secondary" onClick={onCancel}>
            Batal
          </button>
          <button
            ref={confirmRef}
            className={cn('btn', config.confirmClass)}
            onClick={onConfirm}
            id="confirm-action-btn"
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
