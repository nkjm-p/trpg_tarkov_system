import type { MapAreaDef } from '../types';

/**
 * 「Escape from Conspiracy」シナリオ用のマップエリア定義。
 * x, y はマップグリッド上の配置座標(マス単位)。
 * connections は双方向のルートとして記述してください
 * (A→Bを追加したら、必ずB側にもAを追加する)。
 * GM側で自由に追加・変更してください。
 */
export const MAP_AREAS: MapAreaDef[] = [
  {
    id: 'area_checkpoint',
    name: '検問所',
    x: 0,
    y: 2,
    description: 'マップ北西の出入口。セッションの開始地点。',
    connections: ['area_warehouse', 'area_gasstation'],
  },
  {
    id: 'area_warehouse',
    name: '倉庫地区',
    x: 1,
    y: 1,
    description: '物資が眠る倉庫群。索敵と交戦の頻発地帯。',
    connections: ['area_checkpoint', 'area_factory', 'area_railway'],
  },
  {
    id: 'area_gasstation',
    name: 'ガソリンスタンド跡',
    x: 1,
    y: 3,
    description: '燃料や工具が見つかることがある廃ガソリンスタンド。',
    connections: ['area_checkpoint', 'area_railway', 'area_village'],
  },
  {
    id: 'area_factory',
    name: '旧工場',
    x: 2,
    y: 0,
    description: '電子部品や貴重品が眠る大型施設。',
    connections: ['area_warehouse', 'area_railway'],
  },
  {
    id: 'area_railway',
    name: '線路沿い',
    x: 2,
    y: 2,
    description: 'マップ中央を貫く線路。複数エリアへの分岐点。',
    connections: ['area_warehouse', 'area_gasstation', 'area_factory', 'area_village', 'area_extract'],
  },
  {
    id: 'area_village',
    name: '廃村',
    x: 2,
    y: 4,
    description: '住民が去った小さな村。医療品の入手が期待できる。',
    connections: ['area_gasstation', 'area_railway', 'area_extract'],
  },
  {
    id: 'area_extract',
    name: '脱出ポイント',
    x: 3,
    y: 3,
    description: 'マップからの脱出地点。到達すればセッション終了。',
    connections: ['area_railway', 'area_village'],
  },
];

export function getMapAreaDef(areaId: string): MapAreaDef | undefined {
  return MAP_AREAS.find((area) => area.id === areaId);
}

/**
 * 指定エリアからルート移動可能なエリア定義一覧を返す。
 * areaId が null(未配置)の場合は、初期配置用として全エリアを返す。
 */
export function getRoutableAreas(areaId: string | null): MapAreaDef[] {
  if (!areaId) return MAP_AREAS;
  const current = getMapAreaDef(areaId);
  if (!current) return MAP_AREAS;
  return current.connections
    .map((id: string) => getMapAreaDef(id))
    .filter((area: any): area is MapAreaDef => Boolean(area));
}