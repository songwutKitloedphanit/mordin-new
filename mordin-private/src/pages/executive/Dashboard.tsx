import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import DashboardSummary from '@/components/pages/executive/dashboard/DashBoardCard';
import DashboardFilters from '@/components/pages/executive/dashboard/DashboardFilter';
import { formatElementShort } from '@/components/pages/executive/executive-elements';
import {
  BriefTile,
  StatusNotice,
} from '@/components/pages/executive/ExecutiveDashboardUI';
import ExecutiveReportToolbar from '@/components/pages/executive/ExecutiveReportToolbar';
import SoilGradePanel from '@/components/pages/executive/SoilGradePanel';
import UpcomingServiceRounds from '@/components/pages/executive/UpcomingServiceRounds';
import type { WidgetDef } from '@/components/pages/executive/widgets/types';
import WidgetBoard from '@/components/pages/executive/widgets/WidgetBoard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { getDistrictsByProvinceCode } from '@/services/api/address/DistrictApi';
import { getAllProvinces } from '@/services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '@/services/api/address/SubdistrictApi';
import { getFertilizerMajorLandScoreGraph } from '@/services/api/fertilizer/FertilizerMajorLandScore';
import {
  getAllFactories,
  getFactoryById,
} from '@/services/api/service-area/FactoryApi';
import { getAllServiceTypes } from '@/services/api/service-type/ServiceTypeApi';
import { District, Province, Subdistrict } from '@/types/address';
import type {
  GetGraphFilterParams,
  PieChartData,
  PrepareData,
} from '@/types/fertilizer/FertilizerMajorLandScore';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInfo } from '@/types/service-area/ServiceAreas';
import { ServiceType } from '@/types/service-type/ServiceTypes';

import '@/components/pages/executive/executive-redesign.css';

const currentBuddhistYear = new Date().getFullYear() + 543;
const yearList = [
  { value: '', name: 'ทุกปี' },
  { value: currentBuddhistYear, name: currentBuddhistYear.toString() },
  {
    value: currentBuddhistYear - 1,
    name: (currentBuddhistYear - 1).toString(),
  },
];

// คีย์ localStorage สำหรับจำการจัดวางวิดเจ็ตของหน้านี้
const WIDGET_STORAGE_KEY = 'exec-dashboard-widget-layout-v2';

// คำทักทายตามช่วงเวลา (mockup: "สวัสดีตอนเช้า, คุณสมชาย 👋")
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'สวัสดีตอนเช้า';
  if (hour >= 11 && hour < 16) return 'สวัสดีตอนบ่าย';
  if (hour >= 16 && hour < 20) return 'สวัสดีตอนเย็น';
  return 'สวัสดี';
};

// ไอคอนสัญลักษณ์ของสารปรับปรุงดินแต่ละชนิด (จับคู่จากคำในชื่อ)
const MINOR_ICONS: { keyword: string; icon: string }[] = [
  { keyword: 'ปูน', icon: 'fas fa-mountain' }, // ปูนขาว / โดโลไมต์
  { keyword: 'โดโลไมต์', icon: 'fas fa-mountain' },
  { keyword: 'กรอง', icon: 'fas fa-recycle' }, // กากหม้อกรอง / filter cake
  { keyword: 'กาก', icon: 'fas fa-recycle' },
  { keyword: 'ยิปซัม', icon: 'fas fa-cube' },
  { keyword: 'เถ้า', icon: 'fas fa-fire' }, // ขี้เถ้า
  { keyword: 'อินทรีย', icon: 'fas fa-leaf' },
  { keyword: 'มูล', icon: 'fas fa-leaf' }, // ปุ๋ยคอก / มูลสัตว์
];
const getMinorIcon = (name: string) => {
  const found = MINOR_ICONS.find(item => name.includes(item.keyword));
  return found ? found.icon : 'fas fa-flask';
};

// ลำดับการแสดงช่วงการใส่ปุ๋ย: รองพื้น → แต่งหน้า → เพิ่ม
const USAGE_TYPE_ORDER = ['รอง', 'แต่ง', 'เพิ่ม'];
const usageTypeRank = (name: string) => {
  const index = USAGE_TYPE_ORDER.findIndex(keyword => name.includes(keyword));
  return index === -1 ? USAGE_TYPE_ORDER.length : index;
};

type SelectedSearch = GetGraphFilterParams;

interface DashboardGraph {
  elementName: string;
  BarChartDataItem: { label: string; value: number; color: string }[];
}

// ฟิลด์ฟิลเตอร์ที่ sync ขึ้น URL — เพื่อ refresh ไม่หาย และแชร์ลิงก์รายงานเงื่อนไขเดียวกันได้
const FILTER_PARAM_KEYS: (keyof SelectedSearch)[] = [
  'typeId',
  'year',
  'factoryId',
  'serviceAreaId',
  'provinceCode',
  'districtCode',
  'subdistrictCode',
];

const parseFiltersFromParams = (params: URLSearchParams): SelectedSearch => {
  const parsed: SelectedSearch = {};
  for (const key of FILTER_PARAM_KEYS) {
    const raw = params.get(key);
    if (raw == null || raw === '') continue;
    const num = Number(raw);
    if (!Number.isNaN(num)) parsed[key] = num;
  }
  return parsed;
};

const MEDALS = ['🥇', '🥈', '🥉'];

// อันดับสูตรปุ๋ยแบบตารางเหรียญรางวัล เรียงตาม "จำนวนแปลงที่แนะนำ" (ความนิยม)
// อ่านง่าย เห็นอันดับและตัวเลขชัด — แทนกราฟวงกลม/แถบที่เทียบยาก
const FormulaRankTable = ({
  items,
}: {
  items: { formula: string; useRate: number; count?: number }[];
}) => {
  const ranked = items
    .map(item => ({
      formula: item.formula || '-',
      useRate: Number(item.useRate) || 0,
      count: Number(item.count) || 0,
    }))
    // ซ่อนสูตรที่อัตราใส่ = 0 (ตั้งค่าไว้ว่าไม่ต้องใส่) — ไม่ใช่คำแนะนำที่ใช้จริง
    .filter(item => item.useRate > 0);
  const hasCount = ranked.some(item => item.count > 0);
  ranked.sort((a, b) => (hasCount ? b.count - a.count : b.useRate - a.useRate));

  if (ranked.length === 0) return null;

  return (
    <table className="exr-tbl">
      <thead>
        <tr>
          <th style={{ width: 42 }}>#</th>
          <th>สูตรปุ๋ย</th>
          {hasCount && <th className="t-num">จำนวนแปลงแนะนำ</th>}
          <th className="t-num">อัตรา (กก./ไร่)</th>
        </tr>
      </thead>
      <tbody>
        {ranked.map((item, index) => (
          <tr
            key={`${item.formula}-${item.useRate}`}
            className={index === 0 ? 'is-top' : ''}
          >
            <td>{MEDALS[index] ?? index + 1}</td>
            <td className="t-main">{item.formula}</td>
            {hasCount && (
              <td className="t-num t-main">{item.count.toLocaleString()}</td>
            )}
            <td className="t-num">{item.useRate.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  // อ่านค่าจาก URL "ครั้งเดียว" ตอน mount เพื่อใช้ตั้งค่าเริ่มต้น (หลังจากนั้นเราเป็นคนเขียน URL เอง)
  const initialUrlRef = useRef<SelectedSearch | null>(null);
  if (!initialUrlRef.current) {
    initialUrlRef.current = parseFiltersFromParams(searchParams);
  }

  const [factoryList, setFactoryList] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreaList, setServiceAreaList] = useState<ServiceAreaInfo[]>([]);
  const [draftSearch, setDraftSearch] = useState<SelectedSearch>(
    initialUrlRef.current
  );
  const [appliedSearch, setAppliedSearch] = useState<SelectedSearch | null>(
    null
  );
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [subDistrictList, setSubdistrictList] = useState<Subdistrict[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [hasDashboardLoaded, setHasDashboardLoaded] = useState(false);
  const [hasSuccessfulLoad, setHasSuccessfulLoad] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dependentFilterError, setDependentFilterError] = useState<
    string | null
  >(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const factoryRequestRef = useRef(0);
  const provinceRequestRef = useRef(0);
  const districtRequestRef = useRef(0);

  const [dashboardData, setDashboardData] = useState({
    graphData: [] as DashboardGraph[],
    pieChartData: [] as PieChartData[],
    prepareData: [] as PrepareData[],
  });

  // เติม dropdown ที่ขึ้นต่อกันให้ตรงกับฟิลเตอร์ที่ restore มาจาก URL (ใช้ ref กัน stale response)
  const hydrateDependentLists = async (filters: SelectedSearch) => {
    if (filters.factoryId) {
      const requestId = ++factoryRequestRef.current;
      try {
        const factory = await getFactoryById(filters.factoryId);
        if (requestId === factoryRequestRef.current) {
          setServiceAreaList(
            Array.isArray(factory?.serviceAreas) ? factory.serviceAreas : []
          );
        }
      } catch (error) {
        console.error('Cannot hydrate service areas:', error);
      }
    }
    if (filters.provinceCode) {
      const requestId = ++provinceRequestRef.current;
      try {
        const districts = await getDistrictsByProvinceCode(
          filters.provinceCode
        );
        if (requestId === provinceRequestRef.current) {
          setDistrictList(Array.isArray(districts) ? districts : []);
        }
      } catch (error) {
        console.error('Cannot hydrate districts:', error);
      }
    }
    if (filters.districtCode) {
      const requestId = ++districtRequestRef.current;
      try {
        const subdistricts = await getSubdistrictsByDistrictCode(
          filters.districtCode
        );
        if (requestId === districtRequestRef.current) {
          setSubdistrictList(Array.isArray(subdistricts) ? subdistricts : []);
        }
      } catch (error) {
        console.error('Cannot hydrate subdistricts:', error);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchFilterData = async () => {
      setIsFilterLoading(true);

      try {
        const [factories, provinces, types] = await Promise.all([
          getAllFactories(),
          getAllProvinces(),
          getAllServiceTypes(),
        ]);

        if (ignore) return;

        const safeTypes = Array.isArray(types) ? types : [];
        setFactoryList(Array.isArray(factories) ? factories : []);
        setServiceTypes(safeTypes);
        // ใช้ฟิลเตอร์จาก URL ถ้ามี ไม่งั้น default = ประเภทบริการแรก
        const urlFilters = initialUrlRef.current ?? {};
        const initialSearch: SelectedSearch = {
          ...urlFilters,
          typeId:
            urlFilters.typeId ??
            (safeTypes.length > 0 ? safeTypes[0].serviceTypeId : 0),
        };
        setDraftSearch(initialSearch);
        setProvinceList(Array.isArray(provinces) ? provinces : []);
        // เติม dropdown ที่ขึ้นต่อกัน (เขตส่งเสริม/อำเภอ/ตำบล) ให้ตรงกับค่าใน URL
        void hydrateDependentLists(initialSearch);
      } catch (error) {
        console.error('Cannot load dashboard filters:', error);
        if (!ignore) {
          setFilterError('ไม่สามารถโหลดตัวกรองได้');
          setHasDashboardLoaded(true);
        }
      } finally {
        if (!ignore) {
          setIsFilterLoading(false);
        }
      }
    };

    fetchFilterData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (isFilterLoading || filterError) return;
    setAppliedSearch({ ...draftSearch });
  }, [draftSearch, filterError, isFilterLoading]);

  // เขียนฟิลเตอร์ที่ใช้จริงลง URL (replace) เพื่อ refresh ไม่หาย + แชร์ลิงก์ได้
  useEffect(() => {
    if (isFilterLoading || !appliedSearch) return;
    const next = new URLSearchParams();
    for (const key of FILTER_PARAM_KEYS) {
      const value = appliedSearch[key];
      if (value != null && value !== 0) next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  }, [appliedSearch, isFilterLoading, setSearchParams]);

  useEffect(() => {
    let ignore = false;

    const fetchDashboardData = async () => {
      if (!appliedSearch) return;

      setIsDashboardLoading(true);

      try {
        const data = await getFertilizerMajorLandScoreGraph(appliedSearch);

        if (ignore) return;

        const soilAnalysis = Array.isArray(data?.soilAnalysis)
          ? data.soilAnalysis
          : [];
        const fertilizerSummary = data?.fertilizerSummary;

        setDashboardData(prev => ({
          ...prev,
          graphData:
            soilAnalysis.length > 0
              ? soilAnalysis.map(element => ({
                  elementName: element.elementName,
                  BarChartDataItem: Array.isArray(
                    element.HorizontalBarChartData
                  )
                    ? element.HorizontalBarChartData.map(bar => ({
                        label: bar.gradeName,
                        value: Number(bar.count) || 0,
                        color: bar.color || '#ccc',
                      }))
                    : [],
                }))
              : [],
          pieChartData: Array.isArray(fertilizerSummary?.pieChartData)
            ? fertilizerSummary.pieChartData
            : [],
          prepareData: Array.isArray(fertilizerSummary?.prepareData)
            ? fertilizerSummary.prepareData
            : [],
        }));
        setHasSuccessfulLoad(true);
        setDashboardError(null);
      } catch (error) {
        console.error('Cannot load dashboard data:', error);
        if (!ignore) {
          setDashboardError('ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
        }
      } finally {
        if (!ignore) {
          setIsDashboardLoading(false);
          setHasDashboardLoaded(true);
        }
      }
    };

    fetchDashboardData();

    return () => {
      ignore = true;
    };
  }, [appliedSearch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDraftSearch(prev => ({
      ...prev,
      [name]: value ? Number(value) : undefined,
    }));
  };

  const handleSelectFactory = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const factoryId = Number(value);
    const requestId = ++factoryRequestRef.current;
    setServiceAreaList([]);
    setDependentFilterError(null);
    setDraftSearch(prev => ({
      ...prev,
      factoryId: factoryId || undefined,
      serviceAreaId: undefined,
    }));
    if (factoryId) {
      try {
        const factory = await getFactoryById(factoryId);
        if (requestId !== factoryRequestRef.current) return;
        setServiceAreaList(
          Array.isArray(factory?.serviceAreas) ? factory.serviceAreas : []
        );
      } catch (error) {
        if (requestId !== factoryRequestRef.current) return;
        console.error('Cannot load service areas:', error);
        setDependentFilterError('ไม่สามารถโหลดเขตส่งเสริมได้');
      }
    }
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const provinceCode = Number(value);
    const requestId = ++provinceRequestRef.current;
    districtRequestRef.current++;
    setDistrictList([]);
    setSubdistrictList([]);
    setDependentFilterError(null);
    setDraftSearch(prev => ({
      ...prev,
      provinceCode: provinceCode || undefined,
      districtCode: undefined,
      subdistrictCode: undefined,
    }));
    if (provinceCode) {
      try {
        const districts = await getDistrictsByProvinceCode(provinceCode);
        if (requestId !== provinceRequestRef.current) return;
        setDistrictList(Array.isArray(districts) ? districts : []);
      } catch (error) {
        if (requestId !== provinceRequestRef.current) return;
        console.error('Cannot load districts:', error);
        setDependentFilterError('ไม่สามารถโหลดเขต/อำเภอได้');
      }
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const districtCode = Number(value);
    const requestId = ++districtRequestRef.current;
    setSubdistrictList([]);
    setDependentFilterError(null);
    setDraftSearch(prev => ({
      ...prev,
      districtCode: districtCode || undefined,
      subdistrictCode: undefined,
    }));
    if (districtCode) {
      try {
        const subdistricts = await getSubdistrictsByDistrictCode(districtCode);
        if (requestId !== districtRequestRef.current) return;
        setSubdistrictList(Array.isArray(subdistricts) ? subdistricts : []);
      } catch (error) {
        if (requestId !== districtRequestRef.current) return;
        console.error('Cannot load subdistricts:', error);
        setDependentFilterError('ไม่สามารถโหลดแขวง/ตำบลได้');
      }
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = Number(e.target.value);
    setDraftSearch(prev => ({ ...prev, typeId: typeId || undefined }));
  };

  const graphData = dashboardData.graphData.filter(
    item => item.BarChartDataItem.length > 0
  );
  const pieChartData = dashboardData.pieChartData
    .map(item => ({
      ...item,
      summary: (Array.isArray(item.summary) ? item.summary : [])
        .filter(
          type =>
            Array.isArray(type.PieChartItemDto) &&
            type.PieChartItemDto.length > 0
        )
        .sort(
          (a, b) =>
            usageTypeRank(a.usageTypeName) - usageTypeRank(b.usageTypeName)
        ),
    }))
    .filter(item => item.summary.length > 0);
  const prepareData = dashboardData.prepareData;

  // ===== Executive Brief: ดึง "ข้อสรุปเด่น" หนึ่งใจความต่อด้าน จากข้อมูลจริง =====
  // ธาตุอาหารที่ผลกระจุกตัวมากที่สุด (top grade ครองสัดส่วนสูงสุด)
  const soilInsight = (() => {
    let best: { element: string; grade: string; pct: number } | null = null;
    for (const element of graphData) {
      const total = element.BarChartDataItem.reduce(
        (sum, bar) => sum + bar.value,
        0
      );
      if (total === 0) continue;
      const top = element.BarChartDataItem.reduce((a, b) =>
        b.value > a.value ? b : a
      );
      const pct = (top.value / total) * 100;
      if (!best || pct > best.pct) {
        best = { element: element.elementName, grade: top.label, pct };
      }
    }
    return best;
  })();

  // สูตรปุ๋ยที่ถูกแนะนำมากที่สุด (รวมทุกประเภทบริการ/ช่วงการใส่)
  const fertilizerInsight = (() => {
    const all: { formula: string; count: number; useRate: number }[] = [];
    for (const category of pieChartData) {
      for (const type of category.summary) {
        for (const item of type.PieChartItemDto) {
          const useRate = Number(item.useRate) || 0;
          // ข้ามสูตรอัตรา = 0 เพื่อให้ตรงกับตารางที่ซ่อนแถวอัตรา 0 ออกไป
          if (useRate <= 0) continue;
          all.push({
            formula: item.formula || '-',
            count: Number(item.count) || 0,
            useRate,
          });
        }
      }
    }
    if (all.length === 0) return null;
    const hasCount = all.some(item => item.count > 0);
    all.sort((a, b) => (hasCount ? b.count - a.count : b.useRate - a.useRate));
    return { ...all[0], hasCount };
  })();

  // สารปรับปรุงดินที่ครอบคลุมพื้นที่มากสุด
  const improveInsight = (() => {
    if (prepareData.length === 0) return null;
    return prepareData.reduce((a, b) =>
      Number(b.useRatePercent) > Number(a.useRatePercent) ? b : a
    );
  })();

  const reportFilters = [
    {
      label: 'ประเภทบริการ',
      value: serviceTypes.find(
        type => type.serviceTypeId === appliedSearch?.typeId
      )?.name,
    },
    {
      label: 'ปี',
      value: appliedSearch?.year || 'ทุกปี',
    },
    {
      label: 'โรงงาน',
      value: factoryList.find(
        factory => factory.factoryId === appliedSearch?.factoryId
      )?.name,
    },
    {
      label: 'เขตส่งเสริม',
      value: serviceAreaList.find(
        serviceArea =>
          serviceArea.serviceAreaId === appliedSearch?.serviceAreaId
      )?.name,
    },
    {
      label: 'จังหวัด',
      value: provinceList.find(
        province => province.code === appliedSearch?.provinceCode
      )?.nameTh,
    },
    {
      label: 'เขต/อำเภอ',
      value: districtList.find(
        district => district.code === appliedSearch?.districtCode
      )?.nameTh,
    },
    {
      label: 'แขวง/ตำบล',
      value: subDistrictList.find(
        subdistrict =>
          Number(subdistrict.code) === appliedSearch?.subdistrictCode
      )?.nameTh,
    },
  ];
  // ===== นิยามวิดเจ็ตของหน้านี้ =====
  // ทุก section เป็นวิดเจ็ตที่ผู้ใช้ จัดลำดับ/ย่อ-ขยาย/ยุบ/ซ่อน เองได้ (จำค่าใน localStorage)
  // เพิ่มข้อมูลส่วนใหม่ = เพิ่ม WidgetDef ในลิสต์นี้ 1 ตัว
  const widgets: WidgetDef[] = [
    {
      id: 'kpi',
      title: 'ตัวเลขภาพรวม (KPI)',
      icon: 'fas fa-gauge-high',
      defaultSpan: 'full',
      lockSpan: true,
      bare: true,
      render: () => <DashboardSummary />,
    },
    {
      id: 'brief',
      title: 'ข้อสรุปเด่น',
      icon: 'fas fa-lightbulb',
      defaultSpan: 'full',
      lockSpan: true,
      bare: true,
      render: () => (
        <div
          className="exr-insights"
          style={isDashboardLoading ? { opacity: 0.55 } : undefined}
        >
          <BriefTile
            icon="fas fa-vial"
            tone="blue"
            label="ดินส่วนใหญ่"
            empty={!soilInsight}
            value={soilInsight && formatElementShort(soilInsight.element)}
            sub={
              soilInsight && (
                <>
                  <b>{soilInsight.pct.toFixed(0)}%</b> ของตัวอย่างอยู่ระดับ{' '}
                  <b>{soilInsight.grade}</b>
                </>
              )
            }
          />
          <BriefTile
            icon="fas fa-star"
            tone="green"
            label="สูตรปุ๋ยแนะนำมากที่สุด"
            empty={!fertilizerInsight}
            value={fertilizerInsight?.formula}
            sub={
              fertilizerInsight &&
              (fertilizerInsight.hasCount
                ? `แนะนำให้ใช้ใน ${fertilizerInsight.count.toLocaleString()} แปลง`
                : `อัตรา ${fertilizerInsight.useRate.toLocaleString()} กก./ไร่`)
            }
          />
          <BriefTile
            icon="fas fa-leaf"
            tone="amber"
            label="สารปรับปรุงดินเด่น"
            empty={!improveInsight}
            value={improveInsight?.fertilizerMinorName}
            sub={
              improveInsight && (
                <>
                  แนะนำครอบคลุม <b>{improveInsight.useRatePercent}%</b>{' '}
                  ของพื้นที่
                </>
              )
            }
          />
        </div>
      ),
    },
    {
      id: 'soil',
      title: 'สัดส่วนระดับความอุดมสมบูรณ์ของดิน',
      icon: 'fas fa-chart-bar',
      defaultSpan: 'full',
      render: () => (
        <SoilGradePanel
          elements={graphData.map(item => ({
            elementName: item.elementName,
            bars: item.BarChartDataItem,
          }))}
        />
      ),
    },
    {
      id: 'fertilizer',
      title: 'ลำดับสูตรปุ๋ยที่แนะนำมากที่สุด',
      icon: 'fas fa-seedling',
      defaultSpan: 'half',
      render: () =>
        pieChartData.length > 0 ? (
          <div className="exr-grid-wide">
            {pieChartData.map(item => (
              <div key={item.serviceCategoryName}>
                <div className="exr-subhead">
                  <span>
                    <i className="fas fa-flask"></i>
                    {item.serviceCategoryName}
                  </span>
                </div>
                {item.summary
                  // ซ่อนช่วงการใส่ที่ทุกสูตรอัตรา = 0 (ไม่มีคำแนะนำที่ใช้จริง)
                  .filter(type =>
                    type.PieChartItemDto.some(dto => Number(dto.useRate) > 0)
                  )
                  .map(type => (
                    <div
                      key={`${item.serviceCategoryName}-${type.usageTypeName}`}
                      className="exr-group"
                    >
                      <div className="exr-subhead">
                        <span>{type.usageTypeName}</span>
                      </div>
                      <FormulaRankTable items={type.PieChartItemDto} />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
        ),
    },
    {
      id: 'improve',
      title: 'การปรับปรุงสภาพดิน',
      icon: 'fas fa-leaf',
      defaultSpan: 'half',
      render: () =>
        prepareData.length > 0 ? (
          <div className="exr-grid">
            {prepareData.map(item => (
              <div key={item.fertilizerMinorName} className="exr-stat">
                <div className="exr-stat-ic">
                  <i className={getMinorIcon(item.fertilizerMinorName)}></i>
                </div>
                <div>
                  <div className="exr-stat-name">
                    {item.fertilizerMinorName}
                  </div>
                  <div className="exr-stat-metrics">
                    <div>
                      <div className="exr-stat-metric-label">
                        สัดส่วนพื้นที่
                      </div>
                      <div className="exr-stat-metric-value">
                        {item.useRatePercent}%
                      </div>
                    </div>
                    <div>
                      <div className="exr-stat-metric-label">
                        อัตราเฉลี่ย/ไร่
                      </div>
                      <div className="exr-stat-metric-value">
                        {item.useRatePerRai}
                        <small>{item.unitName}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
        ),
    },
    {
      id: 'upcoming',
      title: 'รอบบริการที่กำลังมาถึง',
      icon: 'fas fa-calendar-days',
      defaultSpan: 'half',
      bare: true,
      render: () => <UpcomingServiceRounds />,
    },
  ];

  return (
    <div className="executive-report-content exr">
      {/* ===================== PAGE HEADER (greeting — ไม่ติดไปใน print) ===================== */}
      <div className="exr-page-head executive-report-no-print">
        <div>
          <h2 className="exr-page-title">
            {getTimeGreeting()}
            {user?.firstName ? `, คุณ${user.firstName}` : ''} 👋
          </h2>
          <p className="exr-page-sub">
            ภาพรวมผลวิเคราะห์ดินและคำแนะนำปุ๋ย · ข้อมูลจากการสแกน QR
            และรถวิเคราะห์เคลื่อนที่
          </p>
        </div>
        <ExecutiveReportToolbar
          title="รายงานภาพรวมผลการวิเคราะห์ดินและคำแนะนำการปรับปรุงดิน"
          filters={reportFilters}
          disabled={!hasSuccessfulLoad || isDashboardLoading}
          buildReportData={() => ({
            soilInsight,
            fertilizerInsight,
            improveInsight,
            graphData: graphData.map(el => ({
              elementName: el.elementName,
              BarChartDataItem: el.BarChartDataItem.map(bar => ({
                label: bar.label,
                value: bar.value,
              })),
            })),
            pieChartData,
            prepareData,
          })}
        />
      </div>

      {/* ===================== ตัวกรอง (ยุบได้) ===================== */}
      <div className="exec-filter-card executive-report-no-print">
        <button
          type="button"
          className="exec-filter-card-header"
          onClick={() => setIsFilterOpen(open => !open)}
          aria-expanded={isFilterOpen}
        >
          <span
            className="d-flex align-items-center gap-2 fw-bold"
            style={{ fontSize: '13.5px' }}
          >
            <i className="fas fa-sliders text-primary"></i>
            ตัวกรองข้อมูล / ค้นหาตามเงื่อนไข
          </span>
          <i
            className={`fas fa-chevron-${isFilterOpen ? 'up' : 'down'} text-body-secondary`}
          ></i>
        </button>
        {isFilterOpen && (
          <div className="exec-filter-card-body">
            {isFilterLoading && <LoadingState label="กำลังโหลดตัวกรอง..." />}
            <DashboardFilters
              lists={{
                serviceTypeList: serviceTypes,
                yearList,
                factoryList,
                serviceAreaList,
                provinceList,
                districtList,
                subDistrictList,
              }}
              values={draftSearch}
              handlers={{
                handleChange,
                handleSelectFactory,
                handleProvinceChange,
                handleDistrictChange,
                handleTypeChange,
              }}
            />
          </div>
        )}
      </div>

      {filterError && <StatusNotice type="error" message={filterError} />}
      {dependentFilterError && (
        <StatusNotice type="error" message={dependentFilterError} />
      )}
      {dashboardError && <StatusNotice type="error" message={dashboardError} />}
      {!hasDashboardLoaded && (
        <LoadingState label="กำลังโหลดข้อมูลแดชบอร์ด..." />
      )}

      {/* ===================== WIDGET BOARD (ทุก section ปรับแต่งได้) ===================== */}
      {hasDashboardLoaded && (
        <div className="position-relative">
          <WidgetBoard storageKey={WIDGET_STORAGE_KEY} widgets={widgets} />

          {isDashboardLoading && (
            <div
              className="position-absolute d-flex align-items-center justify-content-center"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                inset: 0,
                zIndex: 2,
                borderRadius: '14px',
              }}
            >
              <div className="text-center">
                <div
                  className="spinner-border text-primary mb-2"
                  role="status"
                  style={{ width: '2rem', height: '2rem' }}
                >
                  <span className="visually-hidden">กำลังโหลด...</span>
                </div>
                <div
                  className="text-body-secondary fw-semibold"
                  style={{ fontSize: '0.9rem' }}
                >
                  กำลังโหลดข้อมูล...
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
