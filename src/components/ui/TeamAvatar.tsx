// components/ui/TeamAvatar.tsx — Avatar tim dengan warna dan logo

import { getInitials, getContrastColor } from '@/lib/utils';
import type { Team } from '@/types/core';

interface Props {
  team: Team;
  size?: number;
  className?: string;
}

export default function TeamAvatar({ team, size = 40, className }: Props) {
  const textColor = getContrastColor(team.colorPrimary);
  const fontSize = size * 0.35;

  if (team.logoDataUrl) {
    return (
      <img
        src={team.logoDataUrl}
        alt={team.name}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      aria-label={team.name}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: team.colorPrimary,
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize,
        letterSpacing: '0.05em',
        flexShrink: 0,
        border: `2px solid ${team.colorSecondary}`,
      }}
    >
      {getInitials(team.name)}
    </div>
  );
}
