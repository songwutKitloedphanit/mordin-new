import { ApiProperty } from '@nestjs/swagger';
export class MapGradeDataDto {
  @ApiProperty({ example: 'สูง', nullable: true, description: 'ชื่อเกรดที่ดีที่สุดในพื้นที่นั้น' })
  gradeName: string | null;

  @ApiProperty({ example: '#ff6c6c', nullable: true, description: 'สีของเกรด' })
  color: string | null;
}

export class ChoroplethMapDataDto {
  @ApiProperty({ example: 'นครนายก', description: 'ชื่อสถานที่ (จังหวัด/อำเภอ/ตำบล)' })
  locationName: string;

  @ApiProperty({ example: 5, description: 'จำนวนตัวอย่างทั้งหมดในพื้นที่นี้' })
  totalCount: number;

  @ApiProperty({ type: MapGradeDataDto, description: 'ข้อมูลเกรดที่เป็นตัวแทนของพื้นที่' })
  data: MapGradeDataDto;
}

export class HorizontalBarChartDataDto {
  @ApiProperty({ example: 'ต่ำ', description: 'ชื่อเกรด' })
  gradeName: string;

  @ApiProperty({ example: '#a6f497', description: 'สีประจำเกรด' })
  color: string;

  @ApiProperty({ example: 10, description: 'จำนวนที่พบ' })
  count: number;

  @ApiProperty({ example: '65.5', description: 'คิดเป็นเปอร์เซ็นต์' })
  percentage: string;

  @ApiProperty({ example: 1, description: 'ลำดับสำหรับเรียงกราฟ' })
  order: number;
}

export class SoilAnalysisDataDto { 
  @ApiProperty({ example: 'Mg', description: 'ชื่อธาตุอาหาร' })
  elementName: string;

  @ApiProperty({ type: [ChoroplethMapDataDto], description: 'ข้อมูลสำหรับทำแผนที่' })
  ChoroplethMapData: ChoroplethMapDataDto[];

  @ApiProperty({ type: [HorizontalBarChartDataDto], description: 'ข้อมูลสำหรับทำกราฟแท่งสรุป' })
  HorizontalBarChartData: HorizontalBarChartDataDto[];
}

export class PieChartItemDto {
  @ApiProperty({ example: '16-16-8', description: 'สูตรปุ๋ย' })
  formula: string;

  @ApiProperty({ example: 50, description: 'อัตราการใช้ต่อไร่' })
  useRate: number;

  @ApiProperty({ example: 120, description: 'จำนวนแปลงที่แนะนำสูตรนี้' })
  count: number;
}

export class PieChartDataDto {
  @ApiProperty({ example: 'อ้อยปลูก', description: 'ประเภทบริการ (Service Category)' })
  serviceCategoryName: string;

  @ApiProperty({ type: [PieChartItemDto], description: 'รายการสรุปสูตรปุ๋ย' })
  summary: {
    usageTypeName: string,
    PieChartItemDto: PieChartItemDto[],
  }[];
}

export class PrepareDataDto {
  @ApiProperty({ example: 'ปูนขาว', description: 'ชื่อสารปรับปรุงดิน' })
  fertilizerMinorName: string;

  @ApiProperty({ example: 'กิโลกรัม', description: 'หน่วย' })
  unitName: string;

  @ApiProperty({ example: 300, description: 'อัตราการใช้ต่อไร่' })
  useRatePerRai: number;

  @ApiProperty({ example: 5000, description: 'ปริมาณการใช้รวม' })
  totalUsage: number;

  @ApiProperty({ example: 25.5, description: 'สัดส่วนการใช้เป็นเปอร์เซ็นต์' })
  useRatePercent: number;
}

export class FertilizerSummaryResponseDto {
    @ApiProperty({ type: [PieChartDataDto], description: 'ข้อมูลกราฟวงกลม (Major Usage)' })
    pieChartData: PieChartDataDto[];

    @ApiProperty({ type: [PrepareDataDto], description: 'ข้อมูลการเตรียมดิน (Minor Usage)' })
    prepareData: PrepareDataDto[];
}

export class DashboardResponseDto {
  @ApiProperty({ type: [SoilAnalysisDataDto], description: 'ข้อมูลวิเคราะห์ดินแยกตามธาตุ (Map & Bar)' })
  soilAnalysis: SoilAnalysisDataDto[];

  @ApiProperty({ type: FertilizerSummaryResponseDto, description: 'ข้อมูลสรุปการใช้ปุ๋ยและเตรียมดิน' })
  fertilizerSummary: FertilizerSummaryResponseDto;
}