import { useCallback, useState } from 'react';

import type {
  WidgetDef,
  WidgetGridLayoutState,
  WidgetGridPos,
  WidgetLayoutState,
} from './types';

export const GRID_COLS = 12;
const DEFAULT_GRID = { w: GRID_COLS, h: 5 };

const readJson = <T>(storageKey: string): T | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

// วางวิดเจ็ตเรียงซ้าย→ขวา บน→ล่าง ตามลำดับที่ให้มา (ใช้สร้างกริดเริ่มต้น/migrate)
const packSequential = (
  items: { id: string; w: number; h: number }[]
): Record<string, WidgetGridPos> => {
  const grid: Record<string, WidgetGridPos> = {};
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  for (const item of items) {
    const w = Math.min(Math.max(1, item.w), GRID_COLS);
    if (x + w > GRID_COLS) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    grid[item.id] = { x, y, w, h: item.h };
    x += w;
    rowHeight = Math.max(rowHeight, item.h);
  }
  return grid;
};

const buildDefaultGrid = (
  widgets: WidgetDef[]
): Record<string, WidgetGridPos> =>
  packSequential(
    widgets.map(widget => ({
      id: widget.id,
      w: widget.defaultGrid?.w ?? DEFAULT_GRID.w,
      h: widget.defaultGrid?.h ?? DEFAULT_GRID.h,
    }))
  );

// แปลง layout v2 ของ WidgetBoard เดิม (order/spans/hidden) เป็นกริด v3
// เพื่อให้ผู้ใช้ที่เคยจัดหน้าไว้แล้วไม่ต้องเริ่มใหม่ตอนอัปเกรดเป็นบอร์ดลากวาง
const migrateFromLegacy = (
  widgets: WidgetDef[],
  legacy: Partial<WidgetLayoutState>
): Partial<WidgetGridLayoutState> => {
  const defById = new Map(widgets.map(widget => [widget.id, widget]));
  const order = (Array.isArray(legacy.order) ? legacy.order : []).filter(id =>
    defById.has(id)
  );
  for (const widget of widgets) {
    if (!order.includes(widget.id)) order.push(widget.id);
  }
  const grid = packSequential(
    order.map(id => {
      const def = defById.get(id)!;
      const span = !def.lockSpan && legacy.spans?.[id];
      const defaultW = def.defaultGrid?.w ?? DEFAULT_GRID.w;
      return {
        id,
        w: span === 'half' ? 6 : span === 'full' ? GRID_COLS : defaultW,
        h: def.defaultGrid?.h ?? DEFAULT_GRID.h,
      };
    })
  );
  return {
    grid,
    hidden: Array.isArray(legacy.hidden) ? legacy.hidden : [],
  };
};

// รวมค่าที่บันทึกไว้เข้ากับรายการวิดเจ็ตปัจจุบัน — id ที่หายไปถูกตัดทิ้ง
// วิดเจ็ตใหม่ที่เพิ่งลงทะเบียนถูกวางต่อท้ายกริด จึงเพิ่มวิดเจ็ตในโค้ดได้
// โดยไม่ล้าง layout เดิมของผู้ใช้
const reconcile = (
  widgets: WidgetDef[],
  stored: Partial<WidgetGridLayoutState> | null
): WidgetGridLayoutState => {
  if (!stored) {
    return { grid: buildDefaultGrid(widgets), hidden: [], viz: {} };
  }
  const ids = new Set(widgets.map(widget => widget.id));
  const grid: Record<string, WidgetGridPos> = {};
  let maxY = 0;
  for (const widget of widgets) {
    const pos = stored.grid?.[widget.id];
    if (
      pos &&
      [pos.x, pos.y, pos.w, pos.h].every(
        value => typeof value === 'number' && Number.isFinite(value)
      )
    ) {
      const w = Math.min(Math.max(1, Math.round(pos.w)), GRID_COLS);
      grid[widget.id] = {
        x: Math.min(Math.max(0, Math.round(pos.x)), GRID_COLS - w),
        y: Math.max(0, Math.round(pos.y)),
        w,
        h: Math.max(1, Math.round(pos.h)),
      };
      maxY = Math.max(maxY, grid[widget.id].y + grid[widget.id].h);
    }
  }
  for (const widget of widgets) {
    if (grid[widget.id]) continue;
    grid[widget.id] = {
      x: 0,
      y: maxY,
      w: widget.defaultGrid?.w ?? DEFAULT_GRID.w,
      h: widget.defaultGrid?.h ?? DEFAULT_GRID.h,
    };
    maxY += grid[widget.id].h;
  }
  const viz: Record<string, string> = {};
  for (const widget of widgets) {
    const storedViz = stored.viz?.[widget.id];
    if (
      storedViz &&
      widget.vizOptions?.some(option => option.id === storedViz)
    ) {
      viz[widget.id] = storedViz;
    }
  }
  return {
    grid,
    hidden: (Array.isArray(stored.hidden) ? stored.hidden : []).filter(id =>
      ids.has(id)
    ),
    viz,
  };
};

// จัดการ layout ของ GridWidgetBoard (ตำแหน่ง/ขนาด/ซ่อน/ชนิดกราฟ) + บันทึก localStorage
// legacyStorageKey: คีย์ v2 ของ WidgetBoard เดิม — ใช้ migrate ครั้งแรกถ้ายังไม่มีค่า v3
export const useGridWidgetLayout = (
  storageKey: string,
  widgets: WidgetDef[],
  legacyStorageKey?: string
) => {
  const [layout, setLayout] = useState<WidgetGridLayoutState>(() => {
    const stored = readJson<Partial<WidgetGridLayoutState>>(storageKey);
    if (stored) return reconcile(widgets, stored);
    const legacy = legacyStorageKey
      ? readJson<Partial<WidgetLayoutState>>(legacyStorageKey)
      : null;
    return reconcile(
      widgets,
      legacy ? migrateFromLegacy(widgets, legacy) : null
    );
  });

  const update = useCallback(
    (updater: (prev: WidgetGridLayoutState) => WidgetGridLayoutState) => {
      setLayout(prev => {
        const next = updater(prev);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // เก็บลง storage ไม่ได้ (เช่นโหมดส่วนตัว) — ใช้ค่าในหน่วยความจำต่อ
        }
        return next;
      });
    },
    [storageKey]
  );

  // รับตำแหน่งทั้งกระดานจาก react-grid-layout (onLayoutChange) มาทับของเดิม
  const applyGrid = useCallback(
    (
      positions: readonly {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }[]
    ) => {
      update(prev => {
        const grid = { ...prev.grid };
        for (const pos of positions) {
          grid[pos.i] = { x: pos.x, y: pos.y, w: pos.w, h: pos.h };
        }
        return { ...prev, grid };
      });
    },
    [update]
  );

  const setHidden = useCallback(
    (id: string, hide: boolean) => {
      update(prev => ({
        ...prev,
        hidden: hide
          ? [...prev.hidden.filter(item => item !== id), id]
          : prev.hidden.filter(item => item !== id),
      }));
    },
    [update]
  );

  const setViz = useCallback(
    (id: string, vizId: string) => {
      update(prev => ({ ...prev, viz: { ...prev.viz, [id]: vizId } }));
    },
    [update]
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ไม่เป็นไร — แค่ล้างสถานะในหน่วยความจำ
    }
    setLayout(reconcile(widgets, null));
  }, [storageKey, widgets]);

  return { layout, applyGrid, setHidden, setViz, reset };
};
