import { useEffect, useState } from 'react';

// สีพื้นฐาน (fallback) ของกราฟในโซน private — แหล่งความจริงเดียว
// เดิม hardcode ซ้ำใน ChoroplethMap / HorizontalBarChart / PieChart
const FALLBACK_TEXT = '#2F3A4A';
const FALLBACK_MUTED = '#667085';
const FALLBACK_GRID = 'rgba(102, 112, 133, 0.22)';
const FALLBACK_BG_LIGHT = '#ffffff';
const FALLBACK_BG_DARK = '#20293a';
const FALLBACK_BORDER_LIGHT = '#e0e0e0';
const FALLBACK_BORDER_DARK = '#3d4a5f';

// หมายเหตุ: ก่อนหน้านี้ ChoroplethMap ใช้ fallback border '#d6d6d6' ตอนหา root ไม่เจอ
// แต่ใช้ '#e0e0e0' ตอน light theme — รวมเป็นค่าเดียว ('#e0e0e0') เพื่อความสม่ำเสมอ

const PRIVATE_LAYOUT_ROOT_SELECTOR = '.private-layout-root';

export interface ChartColors {
  text: string;
  muted: string;
  grid: string;
  bg: string;
  border: string;
}

export const readChartColors = (): ChartColors => {
  const root = document.querySelector(PRIVATE_LAYOUT_ROOT_SELECTOR);
  if (!root) {
    return {
      text: FALLBACK_TEXT,
      muted: FALLBACK_MUTED,
      grid: FALLBACK_GRID,
      bg: FALLBACK_BG_LIGHT,
      border: FALLBACK_BORDER_LIGHT,
    };
  }

  const style = getComputedStyle(root);
  const isDark = root.classList.contains('private-layout-dark');
  return {
    text:
      style.getPropertyValue('--private-chart-text').trim() || FALLBACK_TEXT,
    muted:
      style.getPropertyValue('--private-chart-muted').trim() || FALLBACK_MUTED,
    grid:
      style.getPropertyValue('--private-chart-grid').trim() || FALLBACK_GRID,
    bg: isDark ? FALLBACK_BG_DARK : FALLBACK_BG_LIGHT,
    border: isDark ? FALLBACK_BORDER_DARK : FALLBACK_BORDER_LIGHT,
  };
};

/**
 * อ่านสีกราฟจาก CSS variables ของ private layout และติดตามการสลับ light/dark
 * (เดิม useState + MutationObserver ชุดนี้ถูก copy-paste ในทุกไฟล์กราฟ)
 */
export const useChartColors = (): ChartColors => {
  const [colors, setColors] = useState<ChartColors>(() => readChartColors());

  useEffect(() => {
    const root = document.querySelector(PRIVATE_LAYOUT_ROOT_SELECTOR);
    if (!root) return;
    setColors(readChartColors());
    const observer = new MutationObserver(() => setColors(readChartColors()));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return colors;
};
