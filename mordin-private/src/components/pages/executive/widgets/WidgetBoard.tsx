import { useState } from 'react';

import type { WidgetDef, WidgetSpan } from './types';
import { useWidgetLayout } from './useWidgetLayout';

// ปุ่มควบคุมขนาดเล็กบนหัววิดเจ็ต (เลื่อน/ย่อ-ขยาย/ซ่อน/ยุบ)
const ControlButton = ({
  icon,
  title,
  onClick,
  disabled,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    className="exr-ctrl-btn"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
  >
    <i className={icon}></i>
  </button>
);

interface WidgetFrameProps {
  def: WidgetDef;
  span: WidgetSpan;
  collapsed: boolean;
  customizing: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: -1 | 1) => void;
  onHide: () => void;
  onToggleSpan: () => void;
  onToggleCollapsed: () => void;
}

const WidgetFrame = ({
  def,
  span,
  collapsed,
  customizing,
  canMoveUp,
  canMoveDown,
  onMove,
  onHide,
  onToggleSpan,
  onToggleCollapsed,
}: WidgetFrameProps) => {
  const colClass = span === 'half' ? 'col-12 col-xl-6' : 'col-12';

  const controls = customizing && (
    <div className="exr-widget-actions executive-report-no-print">
      <ControlButton
        icon="fas fa-arrow-up"
        title="เลื่อนขึ้น"
        onClick={() => onMove(-1)}
        disabled={!canMoveUp}
      />
      <ControlButton
        icon="fas fa-arrow-down"
        title="เลื่อนลง"
        onClick={() => onMove(1)}
        disabled={!canMoveDown}
      />
      {!def.lockSpan && (
        <ControlButton
          icon={span === 'full' ? 'fas fa-compress' : 'fas fa-expand'}
          title={span === 'full' ? 'ย่อเหลือครึ่งแถว' : 'ขยายเต็มแถว'}
          onClick={onToggleSpan}
        />
      )}
      <ControlButton
        icon="fas fa-eye-slash"
        title="ซ่อนส่วนนี้"
        onClick={onHide}
      />
    </div>
  );

  // วิดเจ็ตแบบ bare (KPI / ไทล์สรุป) มีสไตล์ของตัวเอง — แสดงหัวควบคุมเฉพาะตอนปรับแต่ง
  if (def.bare) {
    return (
      <div className={colClass}>
        <div className={`exr-widget ${customizing ? 'is-customizing' : ''}`}>
          {customizing && (
            <div className="exr-bare-head executive-report-no-print">
              <span className="exr-bare-title">
                <i className={def.icon}></i>
                {def.title}
              </span>
              {controls}
            </div>
          )}
          {def.render()}
        </div>
      </div>
    );
  }

  return (
    <div className={colClass}>
      <div
        className={`exr-widget exr-card h-100 ${
          customizing ? 'is-customizing' : ''
        }`}
      >
        <div className="exr-card-head">
          <div className="min-w-0">
            <h4 className="exr-card-title">
              <i className={def.icon}></i>
              {def.title}
            </h4>
            {def.subtitle && !collapsed && (
              <p className="exr-card-sub">{def.subtitle}</p>
            )}
          </div>
          <div className="exr-widget-actions">
            {controls}
            <button
              type="button"
              className="exr-ctrl-btn executive-report-no-print"
              title={collapsed ? 'ขยายส่วนนี้' : 'ยุบส่วนนี้'}
              aria-label={collapsed ? 'ขยายส่วนนี้' : 'ยุบส่วนนี้'}
              aria-expanded={!collapsed}
              onClick={onToggleCollapsed}
            >
              <i className={`fas fa-chevron-${collapsed ? 'down' : 'up'}`}></i>
            </button>
          </div>
        </div>
        {!collapsed && <div className="exr-card-body">{def.render()}</div>}
      </div>
    </div>
  );
};

interface WidgetBoardProps {
  // คีย์ localStorage สำหรับจำ layout ของหน้านี้ (คนละคีย์ต่อหน้า)
  storageKey: string;
  widgets: WidgetDef[];
}

// บอร์ดวิดเจ็ตปรับแต่งได้: ผู้ใช้จัดลำดับ ย่อ/ขยายความกว้าง ยุบ และซ่อน/แสดงแต่ละส่วนเองได้
// การจัดวางถูกบันทึกต่อเครื่องผ่าน localStorage — เพิ่มข้อมูลส่วนใหม่โดยเพิ่ม WidgetDef ในหน้า
const WidgetBoard = ({ storageKey, widgets }: WidgetBoardProps) => {
  const { layout, move, setHidden, toggleCollapsed, toggleSpan, reset } =
    useWidgetLayout(storageKey, widgets);
  const [customizing, setCustomizing] = useState(false);

  const defById = new Map(widgets.map(widget => [widget.id, widget]));
  const orderedDefs = layout.order
    .map(id => defById.get(id))
    .filter((widget): widget is WidgetDef => Boolean(widget));
  const visibleDefs = orderedDefs.filter(
    widget => !layout.hidden.includes(widget.id)
  );
  const hiddenDefs = orderedDefs.filter(widget =>
    layout.hidden.includes(widget.id)
  );

  return (
    <section>
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

      {customizing && hiddenDefs.length > 0 && (
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
      )}

      <div className="row g-4">
        {visibleDefs.map((widget, index) => (
          <WidgetFrame
            key={widget.id}
            def={widget}
            span={layout.spans[widget.id] ?? widget.defaultSpan}
            collapsed={layout.collapsed.includes(widget.id)}
            customizing={customizing}
            canMoveUp={index > 0}
            canMoveDown={index < visibleDefs.length - 1}
            onMove={direction => move(widget.id, direction)}
            onHide={() => setHidden(widget.id, true)}
            onToggleSpan={() => toggleSpan(widget.id)}
            onToggleCollapsed={() => toggleCollapsed(widget.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default WidgetBoard;
