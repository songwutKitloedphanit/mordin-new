import { useCallback, useState } from 'react';

import type { WidgetDef, WidgetLayoutState, WidgetSpan } from './types';

const readStored = (storageKey: string): Partial<WidgetLayoutState> | null => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Partial<WidgetLayoutState>) : null;
  } catch {
    return null;
  }
};

// รวมค่าที่ผู้ใช้บันทึกไว้เข้ากับรายการวิดเจ็ตปัจจุบัน — วิดเจ็ตใหม่ที่เพิ่งลงทะเบียน
// จะถูกต่อท้ายและแสดงทันที จึงเพิ่มวิดเจ็ตในโค้ดได้โดยไม่ต้องล้าง layout เดิมของผู้ใช้
const reconcile = (
  widgets: WidgetDef[],
  stored: Partial<WidgetLayoutState> | null
): WidgetLayoutState => {
  const ids = widgets.map(widget => widget.id);
  const order = (Array.isArray(stored?.order) ? stored.order : []).filter(id =>
    ids.includes(id)
  );
  for (const id of ids) {
    if (!order.includes(id)) order.push(id);
  }
  const onlyKnown = (list?: string[]) =>
    (Array.isArray(list) ? list : []).filter(id => ids.includes(id));
  const spans: Record<string, WidgetSpan> = {};
  for (const widget of widgets) {
    const storedSpan = stored?.spans?.[widget.id];
    spans[widget.id] =
      !widget.lockSpan && (storedSpan === 'full' || storedSpan === 'half')
        ? storedSpan
        : widget.defaultSpan;
  }
  return {
    order,
    hidden: onlyKnown(stored?.hidden),
    collapsed: onlyKnown(stored?.collapsed),
    spans,
  };
};

// จัดการสถานะการจัดวางวิดเจ็ต (ลำดับ/ซ่อน/ยุบ/ความกว้าง) พร้อมบันทึกลง localStorage
export const useWidgetLayout = (storageKey: string, widgets: WidgetDef[]) => {
  const [layout, setLayout] = useState<WidgetLayoutState>(() =>
    reconcile(widgets, readStored(storageKey))
  );

  const update = useCallback(
    (updater: (prev: WidgetLayoutState) => WidgetLayoutState) => {
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

  // ย้ายวิดเจ็ตไปก่อน/หลังเพื่อนบ้าน "ที่มองเห็น" ตัวถัดไป (ข้ามตัวที่ซ่อนอยู่)
  const move = useCallback(
    (id: string, direction: -1 | 1) => {
      update(prev => {
        const visible = prev.order.filter(item => !prev.hidden.includes(item));
        const target = visible[visible.indexOf(id) + direction];
        if (!target) return prev;
        const order = prev.order.filter(item => item !== id);
        const targetIndex = order.indexOf(target);
        order.splice(direction > 0 ? targetIndex + 1 : targetIndex, 0, id);
        return { ...prev, order };
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

  const toggleCollapsed = useCallback(
    (id: string) => {
      update(prev => ({
        ...prev,
        collapsed: prev.collapsed.includes(id)
          ? prev.collapsed.filter(item => item !== id)
          : [...prev.collapsed, id],
      }));
    },
    [update]
  );

  const toggleSpan = useCallback(
    (id: string) => {
      update(prev => ({
        ...prev,
        spans: {
          ...prev.spans,
          [id]: prev.spans[id] === 'half' ? 'full' : 'half',
        },
      }));
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

  return { layout, move, setHidden, toggleCollapsed, toggleSpan, reset };
};
