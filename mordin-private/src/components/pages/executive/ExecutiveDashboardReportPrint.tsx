import type { Ref } from 'react';

import { MITRPHOL_LOGO_PNG } from '@/assets/img/mitrpholLogoPng';
import { formatElementTitle } from '@/components/pages/executive/executive-elements';
import {
  buildExecutiveReportViewModel,
  formatReportNumber,
  formatSoilGrade,
} from '@/components/pages/executive/executive-report';
import type { DashboardReportData } from '@/components/pages/executive/executive-report';

import './ExecutiveDashboardReportPrint.css';

const SectionHeader = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="executive-print-section-header">
    <span className="executive-print-section-number">{number}</span>
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

const ExecutiveDashboardReportPrint = ({
  data,
  ref,
}: {
  data: DashboardReportData;
  ref?: Ref<HTMLElement>;
}) => {
  const view = buildExecutiveReportViewModel(data);

  return (
    <article ref={ref} className="executive-print-document">
      <header className="executive-print-header">
        <img src={MITRPHOL_LOGO_PNG} alt="MITR PHOL Research" />
        <div className="executive-print-header-body">
          <h1>{data.title}</h1>
          <div className="executive-print-meta">
            <strong>ศูนย์นวัตกรรมและวิจัยมิตรผล</strong>
            <span>วันที่ {view.formattedDate}</span>
          </div>
        </div>
      </header>

      <section className="executive-print-filter">
        <strong>ขอบเขตข้อมูลในรายงาน</strong>
        <span>{view.filterText}</span>
      </section>

      {view.sectionNumbers.summary && (
        <section>
          <SectionHeader
            number={view.sectionNumbers.summary}
            title="สรุปประเด็นสำคัญ"
            description="ข้อมูลสำคัญที่ควรทราบจากผลวิเคราะห์ตามเงื่อนไขที่เลือก"
          />
          <dl className="executive-print-summary">
            {data.soilInsight && (
              <div>
                <dt>ภาพรวมผลวิเคราะห์ดิน</dt>
                <dd>
                  <strong>
                    {formatElementTitle(data.soilInsight.element)}
                  </strong>{' '}
                  พบมากที่สุดในระดับ{' '}
                  <strong>{formatSoilGrade(data.soilInsight.grade)}</strong>{' '}
                  คิดเป็น {data.soilInsight.pct.toFixed(0)}%
                </dd>
              </div>
            )}
            {data.fertilizerInsight && (
              <div>
                <dt>สูตรปุ๋ยที่แนะนำมากที่สุด</dt>
                <dd>
                  <strong>{data.fertilizerInsight.formula}</strong>{' '}
                  {data.fertilizerInsight.hasCount
                    ? `แนะนำใน ${formatReportNumber(data.fertilizerInsight.count)} แปลง`
                    : `อัตรา ${formatReportNumber(data.fertilizerInsight.useRate)} กก./ไร่`}
                </dd>
              </div>
            )}
            {data.improveInsight && (
              <div>
                <dt>สารปรับปรุงดินหลัก</dt>
                <dd>
                  <strong>{data.improveInsight.fertilizerMinorName}</strong>{' '}
                  ครอบคลุม {data.improveInsight.useRatePercent}% ของพื้นที่
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {view.sectionNumbers.soil && (
        <section>
          <SectionHeader
            number={view.sectionNumbers.soil}
            title="ผลการวิเคราะห์ดิน"
            description="ระดับที่พบมากที่สุดและการกระจายตัวของตัวอย่างดินแต่ละรายการ"
          />
          <table>
            <thead>
              <tr>
                <th>รายการวิเคราะห์</th>
                <th>ระดับที่พบมากสุด</th>
                <th className="executive-print-number">ตัวอย่าง</th>
                <th>การกระจายตัว</th>
              </tr>
            </thead>
            <tbody>
              {view.soilRows.map(row => (
                <tr key={row.elementName}>
                  <td>
                    <strong>{formatElementTitle(row.elementName)}</strong>
                  </td>
                  <td>
                    {row.summary.topLabel} ({row.summary.topPct.toFixed(0)}%)
                  </td>
                  <td className="executive-print-number">
                    {formatReportNumber(row.summary.total)}
                  </td>
                  <td className="executive-print-muted">
                    {row.summary.breakdown}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {view.sectionNumbers.fertilizer && (
        <section>
          <SectionHeader
            number={view.sectionNumbers.fertilizer}
            title="คำแนะนำการใช้ปุ๋ย"
            description="สูตรปุ๋ย อัตราการใช้ และจำนวนแปลง แยกตามประเภทและช่วงการใส่"
          />
          {view.fertilizerGroups.map((category, categoryIndex) => (
            <div className="executive-print-group" key={category.name}>
              <h3>
                {view.sectionNumbers.fertilizer}.{categoryIndex + 1}{' '}
                {category.name}
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>ช่วงการใส่</th>
                    <th>สูตรปุ๋ย</th>
                    <th className="executive-print-number">จำนวนแปลง</th>
                    <th className="executive-print-number">กก./ไร่</th>
                  </tr>
                </thead>
                <tbody>
                  {category.usages.flatMap(type =>
                    type.rows.map((row, rowIndex) => (
                      <tr
                        key={`${category.name}-${type.usageTypeName}-${row.formula}`}
                        className={
                          rowIndex === 0 ? 'executive-print-highlight' : ''
                        }
                      >
                        <td>{rowIndex === 0 ? type.usageTypeName : ''}</td>
                        <td>
                          {rowIndex === 0 ? (
                            <strong>{row.formula}</strong>
                          ) : (
                            row.formula
                          )}
                        </td>
                        <td className="executive-print-number">
                          {formatReportNumber(row.count)}
                        </td>
                        <td className="executive-print-number">
                          {formatReportNumber(row.useRate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      )}

      {view.sectionNumbers.improvement && (
        <section className="executive-print-improvement">
          <SectionHeader
            number={view.sectionNumbers.improvement}
            title="แนวทางปรับปรุงบำรุงดิน"
            description="พื้นที่เป้าหมายและอัตราการใช้สารปรับปรุงดินเฉลี่ยต่อไร่"
          />
          <table>
            <thead>
              <tr>
                <th>สารปรับปรุงดิน</th>
                <th className="executive-print-number">พื้นที่แนะนำ</th>
                <th className="executive-print-number">อัตราเฉลี่ย/ไร่</th>
              </tr>
            </thead>
            <tbody>
              {view.improvementRows.map((item, index) => (
                <tr
                  key={item.fertilizerMinorName}
                  className={index === 0 ? 'executive-print-highlight' : ''}
                >
                  <td>
                    {index === 0 ? (
                      <strong>{item.fertilizerMinorName}</strong>
                    ) : (
                      item.fertilizerMinorName
                    )}
                  </td>
                  <td className="executive-print-number">
                    {item.useRatePercent}%
                  </td>
                  <td className="executive-print-number">
                    {formatReportNumber(Number(item.useRatePerRai))}{' '}
                    {item.unitName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {!view.hasAnyData && (
        <p className="executive-print-empty">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
      )}

      <footer>ศูนย์นวัตกรรมและวิจัยมิตรผล • เอกสารสำหรับใช้ภายใน</footer>
    </article>
  );
};

export default ExecutiveDashboardReportPrint;
