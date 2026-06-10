import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import HorizontalBarChart, {
  BarChartDataItem,
} from '@/components/chart/HorizontalBarChart';
import DashboardSummary from '@/components/pages/executive/dashboard/DashBoardCard';
import DashboardFilters from '@/components/pages/executive/dashboard/DashboardFilter';
import {
  formatElementShort,
  formatElementTitle,
} from '@/components/pages/executive/executive-elements';
import {
  BriefTile,
  SectionCard,
  StatusNotice,
} from '@/components/pages/executive/ExecutiveDashboardUI';
import ExecutiveReportToolbar from '@/components/pages/executive/ExecutiveReportToolbar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
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

const currentBuddhistYear = new Date().getFullYear() + 543;
const yearList = [
  { value: '', name: 'ทุกปี' },
  { value: currentBuddhistYear, name: currentBuddhistYear.toString() },
  {
    value: currentBuddhistYear - 1,
    name: (currentBuddhistYear - 1).toString(),
  },
];

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

// ลำดับการแสดงช่วงการใส่ปุ๋ย: รองพื้น โ’ แต่งหน้า โ’ เพิ่ม
const USAGE_TYPE_ORDER = ['รอง', 'แต่ง', 'เพิ่ม'];
const usageTypeRank = (name: string) => {
  const index = USAGE_TYPE_ORDER.findIndex(keyword => name.includes(keyword));
  return index === -1 ? USAGE_TYPE_ORDER.length : index;
};

type SelectedSearch = GetGraphFilterParams;

interface DashboardGraph {
  elementName: string;
  BarChartDataItem: BarChartDataItem[];
}

// ===== แท็บของ Tabbed Explorer =====
type TabKey = 'soil' | 'fertilizer' | 'improve';
const EXPLORER_TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'soil', label: 'ผลวิเคราะห์ดิน', icon: 'fas fa-chart-bar' },
  { key: 'fertilizer', label: 'คำแนะนำปุ๋ย', icon: 'fas fa-seedling' },
  { key: 'improve', label: 'การปรับปรุงดิน', icon: 'fas fa-leaf' },
];

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

const parseTabFromParams = (params: URLSearchParams): TabKey => {
  const raw = params.get('tab');
  return EXPLORER_TABS.some(tab => tab.key === raw) ? (raw as TabKey) : 'soil';
};

// แสดงสูตรปุ๋ยเป็นตารางตัวเลข เรียงตาม "จำนวนแปลงที่แนะนำ" (ความนิยม)
// อ่านง่าย เห็นตัวเลขชัด — แทนกราฟวงกลม/แถบที่เทียบยาก
const FormulaTable = ({
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
    <div className="table-responsive">
      <table
        className="table align-middle mb-0"
        style={{ fontSize: '1.35rem' }}
      >
        <thead>
          <tr className="fw-semibold" style={{ fontSize: '1.1rem' }}>
            <th>สูตรปุ๋ย</th>
            {hasCount && <th className="text-end text-nowrap">จำนวนแปลง</th>}
            <th className="text-end text-nowrap">อัตรา (กก./ไร่)</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((item, index) => (
            <tr
              key={`${item.formula}-${item.useRate}`}
              className={index === 0 ? 'table-primary' : ''}
            >
              <td className={index === 0 ? 'fw-bold' : ''}>
                {index === 0 && (
                  <i className="fas fa-star text-warning me-2"></i>
                )}
                {item.formula}
              </td>
              {hasCount && (
                <td className="text-end fw-bold">
                  {item.count.toLocaleString()}
                </td>
              )}
              <td className="text-end">{item.useRate.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // อ่านค่าจาก URL "ครั้งเดียว" ตอน mount เพื่อใช้ตั้งค่าเริ่มต้น (หลังจากนั้นเราเป็นคนเขียน URL เอง)
  const initialUrlRef = useRef<{ tab: TabKey; filters: SelectedSearch } | null>(
    null
  );
  if (!initialUrlRef.current) {
    initialUrlRef.current = {
      tab: parseTabFromParams(searchParams),
      filters: parseFiltersFromParams(searchParams),
    };
  }

  const [factoryList, setFactoryList] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreaList, setServiceAreaList] = useState<ServiceAreaInfo[]>([]);
  const [draftSearch, setDraftSearch] = useState<SelectedSearch>(
    initialUrlRef.current.filters
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
  // สถานะการแสดงผลของดีไซน์ใหม่ (ไม่กระทบ data layer)
  const [activeTab, setActiveTab] = useState<TabKey>(initialUrlRef.current.tab);
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
        const urlFilters = initialUrlRef.current?.filters ?? {};
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

  // เขียนแท็บ + ฟิลเตอร์ที่ใช้จริงลง URL (replace) เพื่อ refresh ไม่หาย + แชร์ลิงก์ได้
  useEffect(() => {
    if (isFilterLoading || !appliedSearch) return;
    const next = new URLSearchParams();
    next.set('tab', activeTab);
    for (const key of FILTER_PARAM_KEYS) {
      const value = appliedSearch[key];
      if (value != null && value !== 0) next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  }, [activeTab, appliedSearch, isFilterLoading, setSearchParams]);

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
  const activeFilters = reportFilters.filter(
    filter =>
      filter.value !== undefined && filter.value !== null && filter.value !== ''
  );

  return (
    <div className="executive-report-content">
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

      {/* ===================== EXECUTIVE BRIEF ===================== */}
      {/* สรุปภาพรวมเห็นทันทีโดยไม่ต้องเลื่อน: KPI + ข้อสรุปเด่น + เงื่อนไขที่กรอง */}
      <section className="exec-brief mb-4">
        <div className="exec-brief-head">
          <div>
            <h4 className="exec-brief-title">
              <i className="fas fa-clipboard-list text-primary me-2"></i>
              สรุปภาพรวม
            </h4>
          </div>
          {activeFilters.length > 0 && (
            <div className="exec-brief-chips executive-report-no-print">
              {activeFilters.map(filter => (
                <span key={filter.label} className="exec-brief-chip">
                  <span className="exec-brief-chip-label">{filter.label}</span>
                  {filter.value}
                </span>
              ))}
            </div>
          )}
        </div>

        <DashboardSummary />
      </section>

      {/* ===================== ตัวกรอง (ยุบได้) ===================== */}
      <div className="private-card mb-4 executive-report-no-print">
        <button
          type="button"
          className="private-card-header exec-filter-toggle"
          onClick={() => setIsFilterOpen(open => !open)}
          aria-expanded={isFilterOpen}
        >
          <span className="private-card-title mb-0 d-flex align-items-center">
            <i className="fas fa-filter me-2 text-primary"></i>
            ตัวกรองข้อมูล
          </span>
          <i
            className={`fas fa-chevron-${isFilterOpen ? 'up' : 'down'} text-body-secondary`}
          ></i>
        </button>
        {isFilterOpen && (
          <div className="private-card-body">
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

      {/* ข้อสรุปเด่น 3 ด้าน — คำนวณตามเงื่อนไขที่กรองปัจจุบัน (อยู่ใต้ตัวกรอง) */}
      {hasSuccessfulLoad && (
        <section className="exec-brief mb-4">
          {isDashboardLoading && (
            <div className="exec-brief-sublabel mb-2">
              <span className="exec-brief-updating">
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                กำลังอัปเดต…
              </span>
            </div>
          )}
          <div
            className={`row g-3 exec-brief-tiles ${
              isDashboardLoading ? 'is-updating' : ''
            }`}
          >
            <BriefTile
              icon="fas fa-vial"
              accent="#3b9bd9"
              label="ดินส่วนใหญ่"
              empty={!soilInsight}
              value={
                soilInsight && (
                  <>
                    {formatElementShort(soilInsight.element)}{' '}
                    <span className="text-body-secondary fs-6">
                      ({soilInsight.element})
                    </span>
                  </>
                )
              }
              sub={
                soilInsight && (
                  <>
                    ส่วนใหญ่อยู่ระดับ{' '}
                    <span className="fw-bold">{soilInsight.grade}</span> (
                    {soilInsight.pct.toFixed(0)}%)
                  </>
                )
              }
            />
            <BriefTile
              icon="fas fa-star"
              accent="#4caf7d"
              label="สูตรปุ๋ยแนะนำสุด"
              empty={!fertilizerInsight}
              value={fertilizerInsight?.formula}
              sub={
                fertilizerInsight &&
                (fertilizerInsight.hasCount
                  ? `แนะนำ ${fertilizerInsight.count.toLocaleString()} แปลง`
                  : `อัตรา ${fertilizerInsight.useRate.toLocaleString()} กก./ไร่`)
              }
            />
            <BriefTile
              icon="fas fa-leaf"
              accent="#f4a62a"
              label="สารปรับปรุงดินเด่น"
              empty={!improveInsight}
              value={improveInsight?.fertilizerMinorName}
              sub={
                improveInsight && (
                  <>
                    ครอบคลุม{' '}
                    <span className="fw-bold">
                      {improveInsight.useRatePercent}%
                    </span>{' '}
                    ของพื้นที่
                  </>
                )
              }
            />
          </div>
        </section>
      )}

      {filterError && <StatusNotice type="error" message={filterError} />}
      {dependentFilterError && (
        <StatusNotice type="error" message={dependentFilterError} />
      )}
      {dashboardError && <StatusNotice type="error" message={dashboardError} />}
      {!hasDashboardLoaded && (
        <LoadingState label="กำลังโหลดข้อมูลแดชบอร์ด..." />
      )}

      {/* ===================== TABBED EXPLORER ===================== */}
      {hasSuccessfulLoad && (
        <div className="position-relative">
          <div
            className="exec-tabs-nav executive-report-no-print"
            role="tablist"
          >
            {EXPLORER_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                className={`exec-tab-btn ${activeTab === tab.key ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={`${tab.icon} me-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* แผงผลวิเคราะห์ดิน */}
          <div
            role="tabpanel"
            className={`exec-tab-panel ${activeTab === 'soil' ? '' : 'is-inactive'}`}
          >
            <SectionCard
              title="ผลการวิเคราะห์ดิน"
              subtitle="สัดส่วนตัวอย่างดินในแต่ละระดับความอุดมสมบูรณ์ แยกตามธาตุอาหาร"
              icon="fas fa-chart-bar"
            >
              {graphData.length > 0 ? (
                <div className="row">
                  {graphData.map(item => {
                    const topGrade = item.BarChartDataItem.reduce((a, b) =>
                      b.value > a.value ? b : a
                    );
                    const totalCount = item.BarChartDataItem.reduce(
                      (sum, bar) => sum + bar.value,
                      0
                    );
                    const topPercent =
                      totalCount > 0 ? (topGrade.value / totalCount) * 100 : 0;
                    return (
                      <div className="col-md-4 mb-4" key={item.elementName}>
                        <div style={{ minHeight: '210px', width: '100%' }}>
                          <HorizontalBarChart
                            title={formatElementTitle(item.elementName)}
                            dataItems={item.BarChartDataItem}
                          />
                        </div>
                        <div
                          className="text-center mt-2"
                          style={{ fontSize: '1.1rem' }}
                        >
                          <span className="text-body-secondary">
                            ส่วนใหญ่อยู่ระดับ{' '}
                          </span>
                          <span className="fw-bold">{topGrade.label}</span>
                          <span className="text-body-secondary">
                            {' '}
                            ({topPercent.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
              )}
            </SectionCard>
          </div>

          {/* แผงคำแนะนำปุ๋ย */}
          <div
            role="tabpanel"
            className={`exec-tab-panel ${activeTab === 'fertilizer' ? '' : 'is-inactive'}`}
          >
            <SectionCard
              title="คำแนะนำปุ๋ย"
              subtitle="สูตรปุ๋ยที่ถูกแนะนำมากที่สุด (ตามจำนวนแปลง) และอัตราใส่ต่อไร่ แยกตามช่วงการเพาะปลูก"
              icon="fas fa-seedling"
            >
              {pieChartData.length > 0 ? (
                <div className="row g-4">
                  {pieChartData.map(item => (
                    <div
                      key={item.serviceCategoryName}
                      className="col-lg-6 col-12"
                    >
                      <div className="border rounded-3 p-3 h-100">
                        <h5
                          className="fw-bold text-center mb-3 pb-2 border-bottom"
                          style={{ fontSize: '1.55rem' }}
                        >
                          <i className="fas fa-flask text-primary me-2"></i>
                          {item.serviceCategoryName}
                        </h5>
                        {item.summary
                          // ซ่อนช่วงการใส่ที่ทุกสูตรอัตรา = 0 (ไม่มีคำแนะนำที่ใช้จริง)
                          .filter(type =>
                            type.PieChartItemDto.some(
                              dto => Number(dto.useRate) > 0
                            )
                          )
                          .map(type => (
                            <div
                              key={`${item.serviceCategoryName}-${type.usageTypeName}`}
                              className="mb-4"
                            >
                              <div
                                className="fw-semibold mb-2"
                                style={{ fontSize: '1.3rem' }}
                              >
                                <i className="fas fa-seedling text-primary me-2"></i>
                                {type.usageTypeName}
                              </div>
                              <FormulaTable items={type.PieChartItemDto} />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
              )}
            </SectionCard>
          </div>

          {/* แผงการปรับปรุงดิน */}
          <div
            role="tabpanel"
            className={`exec-tab-panel ${activeTab === 'improve' ? '' : 'is-inactive'}`}
          >
            <SectionCard
              title="การปรับปรุงดิน"
              subtitle="สัดส่วนพื้นที่ที่ควรปรับปรุงดินและอัตราการใช้เฉลี่ยต่อไร่"
              icon="fas fa-leaf"
            >
              {prepareData.length > 0 ? (
                <div className="row justify-content-center gy-3">
                  {prepareData.map(item => (
                    <div key={item.fertilizerMinorName} className="col-md-5">
                      <div className="private-card border-0 h-100 private-dashboard-improve-card">
                        <div className="private-card-body text-center py-4">
                          <div
                            className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                            style={{
                              width: 72,
                              height: 72,
                              backgroundColor: 'rgba(21, 114, 232, 0.12)',
                            }}
                          >
                            <i
                              className={`${getMinorIcon(
                                item.fertilizerMinorName
                              )} text-primary`}
                              style={{ fontSize: '2rem' }}
                            ></i>
                          </div>
                          <h5
                            className="private-card-title fw-bold mb-1"
                            style={{ fontSize: '1.6rem' }}
                          >
                            {item.fertilizerMinorName}
                          </h5>
                          <div
                            className="text-body-secondary mb-4"
                            style={{ fontSize: '1.05rem' }}
                          >
                            สารปรับปรุงดิน
                          </div>
                          <div className="row text-center">
                            <div className="col-6 border-end">
                              <div
                                className="text-body-secondary mb-1"
                                style={{ fontSize: '1.1rem' }}
                              >
                                <i className="fas fa-chart-pie me-1"></i>
                                สัดส่วนพื้นที่
                              </div>
                              <div className="display-6 fw-bold text-primary">
                                {item.useRatePercent}%
                              </div>
                            </div>
                            <div className="col-6">
                              <div
                                className="text-body-secondary mb-1"
                                style={{ fontSize: '1.1rem' }}
                              >
                                <i className="fas fa-weight-hanging me-1"></i>
                                อัตราเฉลี่ย/ไร่
                              </div>
                              <div className="display-6 fw-bold text-primary">
                                {item.useRatePerRai}
                                <span className="fs-6 ms-1">
                                  {item.unitName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
              )}
            </SectionCard>
          </div>

          {isDashboardLoading && (
            <div
              className="position-absolute d-flex align-items-start justify-content-center pt-5"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.72)',
                inset: 0,
                zIndex: 2,
              }}
            >
              <LoadingState label="กำลังโหลดข้อมูลแดชบอร์ด..." />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

