/** グリッド1マスのピクセルサイズと隙間 */
export const CELL_PX = 48;
export const GAP_PX = 4;

export function cellToPx(cells: number): number {
  return cells * CELL_PX + (cells - 1) * GAP_PX;
}
