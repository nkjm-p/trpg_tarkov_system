import { useDraggable } from '@dnd-kit/core';
import type { CSSProperties, ReactNode } from 'react';
import type { ItemDefinition } from '../types';

interface Props {
  instanceId: string;
  def: ItemDefinition;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/**
 * @dnd-kit の useDraggable をラップし、ドラッグ中のアイテムがスタッシュ/コンテナ
 * どちらの由来かを data として持たせる共通コンポーネント。
 */
export function DraggableItem({ instanceId, def, children, style, className }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instanceId,
    data: { instanceId, def },
  });

  const dragStyle: CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={className}
      style={{
        ...style,
        ...dragStyle,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
}
