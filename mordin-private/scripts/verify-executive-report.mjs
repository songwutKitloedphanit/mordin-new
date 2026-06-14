import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  FULL_EXECUTIVE_REPORT_FIXTURE,
  SOIL_ONLY_REPORT_FIXTURE,
  THAI_REPORT_REGRESSION_TERMS,
} from '../src/components/pages/executive/executive-report.fixture.ts';
import { formatSoilGrade } from '../src/components/pages/executive/executive-report.ts';

const reportSource = await readFile(
  new URL(
    '../src/components/pages/executive/ExecutiveDashboardReportPrint.tsx',
    import.meta.url
  ),
  'utf8'
);
const toolbarSource = await readFile(
  new URL(
    '../src/components/pages/executive/ExecutiveReportToolbar.tsx',
    import.meta.url
  ),
  'utf8'
);

assert.equal(formatSoilGrade('High'), 'สูง');
assert.equal(formatSoilGrade('Low'), 'ต่ำ');
assert.equal(formatSoilGrade('Moderate'), 'ปานกลาง');
assert.equal(formatSoilGrade('ระดับพิเศษ'), 'ระดับพิเศษ');

assert.equal(FULL_EXECUTIVE_REPORT_FIXTURE.pieChartData.length, 1);
assert.equal(SOIL_ONLY_REPORT_FIXTURE.pieChartData.length, 0);
assert.equal(SOIL_ONLY_REPORT_FIXTURE.prepareData.length, 0);

for (const term of THAI_REPORT_REGRESSION_TERMS) {
  assert.ok(reportSource.includes(term), `Missing report term: ${term}`);
}

for (const forbidden of [
  '\u0000',
  'THAI_GLYPH_GUARD',
  'preserveThaiText',
  'formatReportTitle',
  'EXECUTIVE DASHBOARD REPORT',
  'recommendationTag',
]) {
  assert.ok(
    !reportSource.includes(forbidden),
    `Forbidden report text: ${forbidden}`
  );
}

assert.ok(!toolbarSource.includes('window.print'));
assert.ok(!toolbarSource.includes('window.open'));
assert.ok(!toolbarSource.includes('.toBlob()'));
assert.ok(!toolbarSource.includes('buildReportData?:'));
assert.ok(toolbarSource.includes('useReactToPrint'));
assert.ok(toolbarSource.includes('ExecutiveDashboardReportPrint'));

console.log('Executive report regression checks passed.');
