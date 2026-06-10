import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';
import React from 'react';

import SarabunBold from '@/assets/fonts/sarabun/Sarabun-Bold.ttf';
import SarabunLight from '@/assets/fonts/sarabun/Sarabun-Light.ttf';
import { PrintReportInterface } from '@/types/qr-code/Report';
import { formatThaiDateWithOutWeekly } from '@/utils/Date';
import { formatNumber } from '@/utils/Number';

Font.register({
  family: 'Sarabun',
  fonts: [
    {
      src: SarabunLight,
    },
    {
      src: SarabunBold,
      fontWeight: 'bold',
    },
  ],
});

Font.registerHyphenationCallback(word => {
  return word.split('');
});

// Create styles
const styles = StyleSheet.create({
  page: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontFamily: 'Sarabun',
    fontSize: 9,
    lineHeight: 1.2,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  logo: {
    width: 80,
    height: 50,
    marginLeft: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#0dcaf0',
    marginLeft: 25,
    marginTop: 5,
    borderRadius: 50,
    height: 30,
    width: 450,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'right',
    marginRight: 10,
    color: '#0a58ca',
    flexWrap: 'wrap',
    marginTop: -10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  infoItem: {
    // width: '50%',
    flex: 1,
  },
  table: {
    display: 'flex',
    width: '100%',
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 0.5,
  },
  tableColHead: {
    flex: 1,
    minWidth: 100,
    textAlign: 'center',
    fontWeight: 'bold',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 4,
  },
  tableCol: {
    flex: 1,
    minWidth: 100,
    textAlign: 'center',
    borderRightWidth: 0.5,
    borderColor: '#000',
    borderStyle: 'solid',
    padding: 6,
  },
  footer: {
    flexDirection: 'row',
  },
  footerCol: {
    width: '33%',
    paddingVertical: 5,
    paddingHorizontal: 15,
    textAlign: 'center',
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: '#000',
    marginTop: 1,
    marginBottom: 3,
  },
});

// Create Document Component
const ReportPDF = ({ reports }: { reports: PrintReportInterface[] }) => {
  const imgData =
    'data:image/png;base64,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';

  const address =
    'บริษัท มิตรผลวิจัย พัฒนาอ้อยและน้ำตาล จำกัด ที่อยู่ 399 หมุ่ 1 ถ.ชุมแพ-ภูเขียว ต.โคกสะอาด อ.ภูเขียว จ.ชัยภูมิ 3611000';

  return (
    <Document>
      {reports.map(reportData => (
        <Page key={reportData.bookId} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.infoContainer}>
              <Image style={styles.logo} src={imgData} />
              <View style={styles.title}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: 'white',
                    marginTop: 5,
                  }}
                >
                  รายงานผลการวิเคราะห์ดิน
                </Text>
              </View>
            </View>
            <View style={{ width: '100%', marginTop: -20 }}>
              <Text style={styles.subtitle}>{address}</Text>
            </View>
          </View>

          {/* Sample Information */}
          <View style={[styles.infoContainer, { marginTop: 15 }]}>
            <View style={styles.infoItem}>
              <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>
                ชื่อผู้ส่งตัวอย่าง :{' '}
              </Text>
              <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>
                สถานที่เก็บตัวอย่าง :{' '}
              </Text>
              <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>
                พื้นที่ไร่ :{' '}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Dot
                text={`${reportData.farmer?.firstName} ${reportData.farmer?.lastName}`}
                textStyle={{ textAlign: 'center' }}
              />
              <Dot
                text={reportData.land?.name ?? '-'}
                textStyle={{ textAlign: 'center' }}
              />
              <Dot
                text={reportData.land?.areaSize.toString() ?? '-'}
                textStyle={{ textAlign: 'center' }}
              />
            </View>
            <View style={styles.infoItem}>
              <Text style={{ marginBottom: 5 }}> </Text>
              <Text
                style={{
                  marginBottom: 5,
                  textAlign: 'right',
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              >
                รหัสแปลง :{' '}
              </Text>
              <Text
                style={{
                  marginBottom: 5,
                  textAlign: 'right',
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              >
                ตำบล :{' '}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={{ marginBottom: 5 }}> </Text>
              <Dot
                text={reportData.land?.landCode ?? '-'}
                textStyle={{ textAlign: 'center' }}
              />

              <Dot
                text={reportData.land?.subdistrict?.nameTh ?? '-'}
                textStyle={{ textAlign: 'center' }}
              />
            </View>
            <View style={styles.infoItem}>
              <Text
                style={{
                  marginBottom: 5,
                  textAlign: 'right',
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              >
                รหัสตัวอย่าง :{' '}
              </Text>
              <Text
                style={{
                  marginBottom: 5,
                  textAlign: 'right',
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              >
                อำเภอ :{' '}
              </Text>
              <Text
                style={{
                  marginBottom: 5,
                  textAlign: 'right',
                  marginRight: 5,
                  fontWeight: 'bold',
                }}
              >
                ตำบล :{' '}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Dot
                text={reportData.sampleCode}
                textStyle={{ textAlign: 'center' }}
              />
              <Dot
                text={reportData.land?.subdistrict?.district?.nameTh ?? '-'}
                textStyle={{ textAlign: 'center' }}
              />
              <Dot
                text={
                  reportData.land?.subdistrict?.district?.province?.nameTh ??
                  '-'
                }
                textStyle={{ textAlign: 'center' }}
              />
            </View>
          </View>

          <View
            style={{
              height: 0.5,
              backgroundColor: '#000',
              marginTop: -3,
              marginBottom: 8,
              width: '100%', // เต็มความกว้าง
            }}
          />
          <View style={styles.infoContainer}>
            <View style={[styles.infoItem, { fontWeight: 'bold' }]}>
              <Text>วันที่รับตัวอย่าง:</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={{ textDecoration: 'underline' }}>
                {formatThaiDateWithOutWeekly(
                  reportData.collectSampleAt?.toString()
                )}
              </Text>
            </View>
            <View style={[styles.infoItem, { fontWeight: 'bold' }]}></View>
            <View style={[styles.infoItem, { fontWeight: 'bold' }]}>
              <Text>วันที่ออกรายงานผล:</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoItem}>
                <Text style={{ textDecoration: 'underline' }}>
                  {formatThaiDateWithOutWeekly(new Date().toString())}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}></View>
          </View>
          <View
            style={{
              height: 0.5, // ความหนาเส้น
              backgroundColor: '#000',
              marginTop: 7,
              marginBottom: 5,
              width: '100%', // เต็มความกว้าง
            }}
          />
          {/* Soil Analysis Table */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 5,
              marginBottom: 5,
              fontWeight: 'bold',
            }}
          >
            <Text>รายงานผลการวิเคราะห์ดิน</Text>
            <Text>
              ระดับความอุดมสมบูรณ์:{' '}
              {reportData.ferMajorLandScores.find(
                r => r.soilGrade.laboratoryId === null
              )?.soilGradeLevel.scoreName + ' ' || '-'}
            </Text>
          </View>

          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, { backgroundColor: '#cfe2ff' }]}>
              <Text style={[styles.tableColHead, { maxWidth: '18%' }]}>
                รายการ
              </Text>
              <Text style={styles.tableColHead}>หน่วย</Text>
              <Text style={styles.tableColHead}>วิธีวิเคราะห์</Text>
              <Text style={styles.tableColHead}>ผลวิเคราะห์ดิน</Text>
              <Text style={styles.tableColHead}>ระดับ</Text>
            </View>

            {/* Table Rows */}
            {reportData.results?.map(
              item =>
                item.resultGradeLevel && (
                  <View key={item.resultGradeId} style={styles.tableRow}>
                    <Text
                      style={[
                        styles.tableCol,
                        {
                          textAlign: 'left',
                          fontWeight: 'bold',
                          maxWidth: '18%',
                        },
                      ]}
                    >
                      {item.laboratorySetting?.laboratory?.name + ' ' || '-'}
                    </Text>
                    <Text style={styles.tableCol}>
                      {item.laboratorySetting?.laboratory?.unitAfter || '-'}
                    </Text>
                    <Text style={styles.tableCol}>
                      {item.laboratorySetting?.laboratory?.machineType?.name ||
                        '-'}
                    </Text>
                    <Text style={styles.tableCol}>
                      {item.postValue != null
                        ? formatNumber(item.postValue)
                        : '-'}
                    </Text>

                    <Text
                      style={[
                        styles.tableCol,
                        {
                          backgroundColor:
                            item.resultGradeLevel?.color || '#ffffff',
                          flexWrap: 'wrap',
                        },
                      ]}
                    >
                      {item.resultGradeLevel?.scoreName
                        ? `${item.resultGradeLevel?.scoreName} `
                        : '-'}
                    </Text>
                  </View>
                )
            )}
          </View>

          {/* Soil Improvement Table */}
          {reportData.ferMinorLandUsages.length > 0 && (
            <View>
              <Text
                style={{
                  marginBottom: 5,
                  fontWeight: 'bold',
                  flexWrap: 'wrap',
                }}
              >
                คำแนะนำการปรับปรุงดินนน
              </Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, { backgroundColor: '#cfe2ff' }]}>
                  <Text
                    style={[
                      styles.tableColHead,
                      { width: '25%', flexWrap: 'wrap' },
                    ]}
                  >
                    คำแนะนำการปรับปรุงดินนน
                  </Text>
                  <Text style={[styles.tableColHead, { width: '15%' }]}>
                    หน่วย
                  </Text>
                  <Text style={[styles.tableColHead, { width: '15%' }]}>
                    ปริมาณการใช้
                  </Text>
                  <Text style={[styles.tableColHead, { width: '45%' }]}>
                    ประโยชน์
                  </Text>
                </View>

                {/* Table Rows */}
                {reportData.ferMinorLandUsages.map(item => (
                  <View
                    key={item.fertilizerMinorLandUsageId}
                    style={styles.tableRow}
                  >
                    <View
                      style={[
                        styles.tableCol,
                        { width: '25%', fontWeight: 'bold' },
                      ]}
                    >
                      <Text wrap>{item.fertilizerMinor.name || '-'}</Text>
                    </View>
                    <View style={[styles.tableCol, { width: '15%' }]}>
                      <Text wrap>
                        {item.fertilizerMinor.unit.name + 'ต่อไร่' || '-'}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { width: '15%' }]}>
                      <Text wrap>{formatNumber(item.useRatePerRai)}</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCol,
                        { width: '45%', textAlign: 'left' },
                      ]}
                    >
                      <Text wrap>{item.fertilizerMinor?.benefit || '-'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 5,
              flexWrap: 'wrap',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>คำแนะนำการใช้ปุ๋ยเคมีมม</Text>
            {/* <Text>หมายเหตุ: {reportData.fertilityLevel}</Text> */}
          </View>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, { backgroundColor: '#cfe2ff' }]}>
              <Text
                style={[
                  styles.tableColHead,
                  { width: '28%', flexWrap: 'wrap' },
                ]}
              >
                คำแนะนำการใช้ปุ๋ยเคมีมม
              </Text>

              {reportData.serviceType?.serviceCategories.map(cat => (
                <React.Fragment key={cat.serviceCategoryId}>
                  <Text style={[styles.tableColHead, { width: '18%' }]}>
                    สูตรปุ๋ย {cat.name}
                  </Text>
                  <Text style={[styles.tableColHead, { width: '18%' }]}>
                    ปริมาณ
                  </Text>
                </React.Fragment>
              ))}
            </View>

            {/* Table Rows */}
            {reportData.usageType.map(usageType => {
              // หาชื่อประเภทการใช้
              const foundUsage = reportData.ferMajorLandUsages.find(
                u =>
                  u.serviceFertilizerMajorUsage?.usageTypeId ===
                  usageType.usageTypeId
              );

              const usageTypeName = foundUsage ? usageType.name : '';

              return (
                <View style={styles.tableRow} key={usageType.usageTypeId}>
                  <Text
                    style={[
                      styles.tableCol,
                      { width: '28%', fontWeight: 'bold' },
                    ]}
                  >
                    {usageTypeName || '-'}
                  </Text>

                  {reportData.serviceType?.serviceCategories.map(cat => {
                    const item = reportData.ferMajorLandUsages?.find(
                      i =>
                        i.serviceFertilizerMajorUsage?.usageTypeId ===
                          usageType.usageTypeId &&
                        i.serviceFertilizerMajorUsage?.serviceCategoryId ===
                          cat.serviceCategoryId
                    );

                    return (
                      <React.Fragment key={cat.serviceCategoryId}>
                        <Text style={[styles.tableCol, { width: '18%' }]}>
                          {item?.formula || '-'}
                        </Text>
                        <Text style={[styles.tableCol, { width: '18%' }]}>
                          {item?.useRate
                            ? `${formatNumber(item.useRate)} ${item.serviceFertilizerMajorUsage?.fertilizerMajor?.unit?.name}ต่อไร่`
                            : '-'}
                        </Text>
                      </React.Fragment>
                    );
                  })}
                </View>
              );
            })}

            {/* แถวต้นทุน */}
            <View style={[styles.tableRow, { backgroundColor: '#cfe2ff' }]}>
              <Text style={[styles.tableColHead, { width: '28%' }]}>
                ต้นทุนปุ๋ยเคมี บาท/ไร่
              </Text>

              {reportData.serviceType?.serviceCategories?.map(cat => {
                const item = reportData.ferMajorLandUsages?.find(
                  i =>
                    i.serviceFertilizerMajorUsage?.serviceCategoryId ===
                    cat.serviceCategoryId
                );

                return (
                  <React.Fragment key={cat.serviceCategoryId}>
                    <Text
                      style={[styles.tableColHead, { width: '18%' }]}
                    ></Text>
                    <Text style={[styles.tableColHead, { width: '18%' }]}>
                      {formatNumber(item?.costPerRai ?? null)}
                    </Text>
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerCol}>
              <Text style={{ fontWeight: 'bold' }}>ผู้รายงาน</Text>
              <Dot text={`นางสาวจิรัชญา สีลาบัว`} />
              <Text style={{ fontWeight: 'bold' }}>
                (ผู้ช่วยนักวิจัยรถหมอดิน)
              </Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={{ fontWeight: 'bold' }}>ผู้จัดการ/ผู้ตรวจสอบ</Text>
              <Dot text={`คุณจำนาญ โคตรภูเวียง `} />
              <Text style={{ fontWeight: 'bold' }}>
                (ผู้จัดการฝ่า»ฏิบัติเทคโนโลยีอ้อย)
              </Text>
            </View>
            <View style={styles.footerCol}>
              <Text style={{ fontWeight: 'bold' }}>ที่ปรึกษา</Text>
              <Dot text={`รศ.ดร ธนภัทรสกรณ์ สุกิจประภานนท์`} />
              <Text style={{ fontWeight: 'bold' }}>
                (อาจารย์/ผู้เชี่ยวชาญด้านปฐพีศาสตร์)
              </Text>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default ReportPDF;

type DotProps = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textStyle?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lineStyle?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  containerStyle?: any;
};

const Dot = ({ text, textStyle, lineStyle, containerStyle }: DotProps) => {
  return (
    <View style={containerStyle}>
      <Text wrap={false} style={textStyle}>
        {text}
      </Text>
      <View style={[styles.dottedLine, lineStyle]} />
    </View>
  );
};
