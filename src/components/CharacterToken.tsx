import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties } from 'react';

interface Props {
  playerId: string;
  name: string;
  color: string;
  leftPercent: number;
  topPercent: number;
  cellWidthPercent: number;
  cellHeightPercent: number;
}

export function CharacterToken({ playerId, name, color, leftPercent, topPercent, cellWidthPercent, cellHeightPercent }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `token:${playerId}`,
    data: { playerId },
  });

  const dragStyle: CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="absolute flex items-center justify-center rounded-full border-2 shadow-lg"
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${cellWidthPercent}%`,
        height: `${cellHeightPercent}%`,
        backgroundColor: `${color}cc`,
        borderColor: color,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
        ...dragStyle,
      }}
      title={name}
    >
      <span className="stencil select-none text-[9px] leading-none text-white drop-shadow">{name.slice(0, 2)}</span>
    </div>
  );
}