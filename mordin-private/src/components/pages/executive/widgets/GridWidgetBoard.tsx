import { useEffect, useState } from 'react';
import {
  ReactGridLayout,
  WidthProvider,
  type LayoutItem,
} from 'react-grid-layout/legacy';

import type { WidgetDef, WidgetGridLayoutState } from './types';
import { GRID_COLS, useGridWidgetLayout } from './useGridWidgetLayout';

import 'react-grid-layout/css/styles.css';

const Grid = WidthProvider(ReactGridLayout);

// ความสูง 1 แถวกริด (px) — ความสูงจริงของวิดเจ็ต = h*ROW_HEIGHT + (h-1)*GAP
const ROW_HEIGHT = 56;
const GRID_GAP = 16;

// แก้ไข layout ได้เฉพาะจอใหญ่ — จอเล็กเรียง 1 คอลัมน์อ่านอย่างเดียว
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 992px)').matches
  );
  useEffect(() => {
    const query = window.matchMedia('(min-width: 992px)');
    const onChange = (event: MediaQueryListEvent) =>
      setIsDesktop(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

const widgetViz = (def: WidgetDef, layout: WidgetGridLayoutState) =>
  layout.viz[def.id] ?? def.defaultViz ?? def.vizOptions?.[0]?.id ?? null;

// ปุ่มสลับชนิดการแสดงผล (ตาราง/แท่ง/โดนัท) — เห็นตลอด ไม่ต้องเข้าโหมดปรับแต่ง
const VizMenu = ({
  def,
  active,
  onSelect,
}: {
  def: WidgetDef;
  active: string | null;
  onSelect: (vizId: string) => void;
}) => {
  if (!def.vizOptions || def.vizOptions.length < 2) return null;
  return (
    <div
      className="exr-viz-menu executive-report-no-print"
      role="group"
      aria-label="เลือกรูปแบบการแสดงผล"
    >
      {def.vizOptions.map(option => (
        <button
          key={option.id}
          type="button"
          className={`exr-viz-btn ${option.id === active ? 'on' : ''}`}
          title={option.label}
          aria-label={option.label}
          aria-pressed={option.id === active}
          onClick={() => onSelect(option.id)}
        >
          <i className={option.icon}></i>
        </button>
      ))}
    </div>
  );
};

interface WidgetCardProps {
  def: WidgetDef;
  viz: string | null;
  customizing: boolean;
  onHide: () => void;
  onSelectViz: (vizId: string) => void;
}

// กรอบวิดเจ็ตบนกริด: หัวการ์ดเป็นที่จับลาก (ตอนปรับแต่ง) + เมนูชนิดกราฟ + ปุ่มซ่อน
const WidgetCard = ({
  def,
  viz,
  customizing,
  onHide,
  onSelectViz,
}: WidgetCardProps) => {
  const hideButton = customizing && (
    <button
      type="button"
      className="exr-ctrl-btn executive-report-no-print"
      title="ซ่อนส่วนนี้"
      aria-label="ซ่อนส่วนนี้"
      onClick={onHide}
    >
      <i className="fas fa-eye-slash"></i>
    </button>
  );

  // วิดเจ็ตแบบ bare (KPI / ไทล์สรุป) มีการ์ดของตัวเอง — ครอบด้วยกรอบโปร่ง
  if (def.bare) {
    return (
      <div className={`exr-grid-widget ${customizing ? 'is-customizing' : ''}`}>
        {customizing && (
          <div className="exr-bare-head exr-drag-handle executive-report-no-print">
            <span className="exr-bare-title">
              <i className="fas fa-grip-vertical exr-grip"></i>
              <i className={def.icon}></i>
              {def.title}
            </span>
            <div className="exr-widget-actions">{hideButton}</div>
          </div>
        )}
        <div className="exr-grid-widget-body exr-grid-widget-bare">
          {def.render({ viz })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`exr-grid-widget exr-card ${customizing ? 'is-customizing' : ''}`}
    >
      <div className={`exr-card-head ${customizing ? 'exr-drag-handle' : ''}`}>
        <div className="min-w-0">
          <h4 className="exr-card-title">
            {customizing && (
              <i className="fas fa-grip-vertical exr-grip executive-report-no-print"></i>
            )}
            <i className={def.icon}></i>
            {def.title}
          </h4>
          {def.subtitle && <p className="exr-card-sub">{def.subtitle}</p>}
        </div>
        <div className="exr-widget-actions">
          <VizMenu def={def} active={viz} onSelect={onSelectViz} />
          {hideButton}
        </div>
      </div>
      <div className="exr-card-body exr-grid-widget-body">
        {def.render({ viz })}
      </div>
    </div>
  );
};

interface GridWidgetBoardProps {
  // คีย์ localStorage สำหรับจำ layout ของหน้านี้ (คนละคีย์ต่อหน้า)
  storageKey: string;
  widgets: WidgetDef[];
  // คีย์ของ WidgetBoard เดิม — มีไว้ migrate layout ผู้ใช้เก่าครั้งแรก
  legacyStorageKey?: string;
}

// บอร์ดวิดเจ็ตแบบกริดอิสระ (react-grid-layout): ลากวางตำแหน่ง จับมุมย่อ/ขยาย
// ซ่อน/แสดง และสลับชนิดกราฟต่อวิดเจ็ต — บันทึกต่อเครื่องผ่าน localStorage
const GridWidgetBoard = ({
  storageKey,
  widgets,
  legacyStorageKey,
}: GridWidgetBoardProps) => {
  const { layout, applyGrid, setHidden, setViz, reset } = useGridWidgetLayout(
    storageKey,
    widgets,
    legacyStorageKey
  );
  const [customizing, setCustomizing] = useState(false);
  const isDesktop = useIsDesktop();

  const visibleDefs = widgets.filter(
    widget => !layout.hidden.includes(widget.id)
  );
  const hiddenDefs = widgets.filter(widget =>
    layout.hidden.includes(widget.id)
  );

  const rglLayout: LayoutItem[] = visibleDefs.map(widget => {
    const pos = layout.grid[widget.id] ?? { x: 0, y: 0, w: GRID_COLS, h: 5 };
    return {
      i: widget.id,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      minW: widget.defaultGrid?.minW ?? 3,
      minH: widget.defaultGrid?.minH ?? 2,
    };
  });

  const toolbar = (
    <div className="exr-board-toolbar executive-report-no-print">
      {customizing && (
        <button type="button" className="exr-board-btn" onClick={reset}>
          <i className="fas fa-rotate-left me-1"></i>
          คืนค่าเริ่มต้น
        </button>
      )}
      <button
        type="button"
        className={`exr-board-btn ${customizing ? 'is-active' : ''}`}
        onClick={() => setCustomizing(value => !value)}
      >
        <i
          className={`fas ${customizing ? 'fa-check' : 'fa-table-cells-large'} me-1`}
        ></i>
        {customizing ? 'เสร็จสิ้น' : 'ปรับแต่งหน้าจอ'}
      </button>
    </div>
  );

  const hiddenRow = customizing && hiddenDefs.length > 0 && (
    <div className="exr-board-hidden-row executive-report-no-print">
      <span className="exr-board-hidden-label">
        <i className="fas fa-eye-slash me-1"></i>
        ซ่อนอยู่ — กดเพื่อนำกลับมาแสดง:
      </span>
      {hiddenDefs.map(widget => (
        <button
          key={widget.id}
          type="button"
          className="exr-board-hidden-chip"
          onClick={() => setHidden(widget.id, false)}
        >
          <i className={`${widget.icon} me-1`}></i>
          {widget.title}
          <i className="fas fa-plus ms-2"></i>
        </button>
      ))}
    </div>
  );

  // จอเล็ก: เรียง 1 คอลัมน์ตามตำแหน่งบนกริด (บน→ล่าง ซ้าย→ขวา) สูงตามเนื้อหา
  if (!isDesktop) {
    const stacked = [...visibleDefs].sort((a, b) => {
      const posA = layout.grid[a.id] ?? { x: 0, y: 0 };
      const posB = layout.grid[b.id] ?? { x: 0, y: 0 };
      return posA.y - posB.y || posA.x - posB.x;
    });
    return (
      <section>
        <div className="exr-grid-stack">
          {stacked.map(widget => (
            <WidgetCard
              key={widget.id}
              def={widget}
              viz={widgetViz(widget, layout)}
              customizing={false}
              onHide={() => setHidden(widget.id, true)}
              onSelectViz={vizId => setViz(widget.id, vizId)}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      {toolbar}
      {customizing && (
        <div className="exr-board-hint executive-report-no-print">
          <i className="fas fa-hand-pointer me-1"></i>
          ลากที่หัวการ์ดเพื่อย้ายตำแหน่ง · ลากมุมขวาล่างเพื่อย่อ/ขยาย
        </div>
      )}
      {hiddenRow}
      <Grid
        className={`exr-grid-board ${customizing ? 'is-customizing' : ''}`}
        layout={rglLayout}
        cols={GRID_COLS}
        rowHeight={ROW_HEIGHT}
        margin={[GRID_GAP, GRID_GAP]}
        containerPadding={[0, 0]}
        isDraggable={customizing}
        isResizable={customizing}
        draggableHandle=".exr-drag-handle"
        compactType="vertical"
        onLayoutChange={next => {
          if (customizing) applyGrid(next);
        }}
      >
        {visibleDefs.map(widget => (
          <div key={widget.id}>
            <WidgetCard
              def={widget}
              viz={widgetViz(widget, layout)}
              customizing={customizing}
              onHide={() => setHidden(widget.id, true)}
              onSelectViz={vizId => setViz(widget.id, vizId)}
            />
          </div>
        ))}
      </Grid>
    </section>
  );
};

export default GridWidgetBoard;
