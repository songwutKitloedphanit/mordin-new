import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ChoroplethMap, {
  ChoroplethMapData,
  ChoroplethMapOption,
} from '@/components/chart/ChoroplethMap';
import HorizontalBarChart, {
  BarChartDataItem,
} from '@/components/chart/HorizontalBarChart';
import DashboardSummary from '@/components/pages/executive/dashboard/DashBoardCard';
import DashboardFilters from '@/components/pages/executive/dashboard/DashboardFilter';
import {
  ELEMENT_LABELS,
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
import { getAllGeoGraphies } from '@/services/api/address/GeographiesApi';
import { getProvinceByGeographyId } from '@/services/api/address/ProvinceApi';
import { getFertilizerMajorLandScoreGraph } from '@/services/api/fertilizer/FertilizerMajorLandScore';
import { getAllServiceTypes } from '@/services/api/service-type/ServiceTypeApi';
import { geography, Province } from '@/types/address';
import { MapLevel } from '@/types/common/GADM';
import type { GetGraphFilterParams } from '@/types/fertilizer/FertilizerMajorLandScore';
import { ServiceType } from '@/types/service-type/ServiceTypes';

type SelectedSearch = GetGraphFilterParams;

const toMapKey = (value?: string) =>
  (value || '').replace(/\s+/g, '').replace(/^Mueang/i, 'Muang');

// ===== แท็บของ Tabbed Explorer =====
type TabKey = 'map' | 'soil';
const EXPLORER_TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'map', label: 'แผนที่การกระจายตัว', icon: 'fas fa-map' },
  { key: 'soil', label: 'ผลวิเคราะห์ดิน', icon: 'fas fa-chart-bar' },
];

// ฟิลด์ฟิลเตอร์ที่ sync ขึ้น URL — refresh ไม่หาย และแชร์ลิงก์รายงานเงื่อนไขเดียวกันได้
const FILTER_PARAM_KEYS: (keyof SelectedSearch)[] = [
  'typeId',
  'geographyId',
  'provinceCode',
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
  return EXPLORER_TABS.some(tab => tab.key === raw) ? (raw as TabKey) : 'map';
};

const Report = () => {
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

  const [draftSearch, setDraftSearch] = useState<SelectedSearch>(
    initialUrlRef.current.filters
  );
  const [appliedSearch, setAppliedSearch] = useState<SelectedSearch | null>(
    null
  );
  const [geographyList, setGeographyList] = useState<geography[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
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
  const [draftFilterLevel, setDraftFilterLevel] = useState<{
    level: MapLevel;
    name?: string;
  }>();
  const [appliedFilterLevel, setAppliedFilterLevel] = useState<{
    level: MapLevel;
    name?: string;
  }>();
  // สถานะการแสดงผลของดีไซน์ใหม่ (ไม่กระทบ data layer)
  const [activeTab, setActiveTab] = useState<TabKey>(initialUrlRef.current.tab);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const geographyRequestRef = useRef(0);

  const [dashboardData, setDashboardData] = useState<{
    graphData: {
      elementName: string;
      BarChartDataItem: BarChartDataItem[];
      ChoroplethMapDataItem: {
        data: ChoroplethMapData[];
        options: ChoroplethMapOption;
      };
    }[];
  }>({ graphData: [] });

  // เติมจังหวัด + filterLevel ของแผนที่ ให้ตรงกับฟิลเตอร์ที่ restore มาจาก URL
  const hydrateDependentLists = async (
    filters: SelectedSearch,
    geographies: geography[]
  ) => {
    if (!filters.geographyId) return;
    const requestId = ++geographyRequestRef.current;
    try {
      const provinces = await getProvinceByGeographyId(filters.geographyId);
      if (requestId !== geographyRequestRef.current) return;
      const safeProvinces = Array.isArray(provinces) ? provinces : [];
      setProvinceList(safeProvinces);
      if (filters.provinceCode) {
        const nameEn = safeProvinces
          .find(province => province.code === filters.provinceCode)
          ?.nameEn.replace(/\s+/g, '');
        setDraftFilterLevel({ level: MapLevel.Province, name: nameEn });
      } else {
        const geoName = geographies.find(
          geo => geo.id === filters.geographyId
        )?.name;
        setDraftFilterLevel({ level: MapLevel.Region, name: geoName });
      }
    } catch (error) {
      console.error('Cannot hydrate provinces:', error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const fetchFilterData = async () => {
      setIsFilterLoading(true);

      try {
        const [geographies, types] = await Promise.all([
          getAllGeoGraphies(),
          getAllServiceTypes(),
        ]);

        if (ignore) return;

        const safeTypes = Array.isArray(types) ? types : [];
        const safeGeographies = Array.isArray(geographies) ? geographies : [];
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
        setGeographyList(safeGeographies);
        // เติมจังหวัด/ระดับแผนที่ ให้ตรงกับ URL ก่อนปลดสถานะโหลด เพื่อยิงข้อมูลรอบเดียว
        await hydrateDependentLists(initialSearch, safeGeographies);
      } catch (error) {
        console.error('Cannot load report filters:', error);
        if (!ignore) {
          setFilterError('ไม่สามารถโหลดตัวกรองรายงานได้');
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
    setAppliedFilterLevel(draftFilterLevel);
  }, [draftFilterLevel, draftSearch, filterError, isFilterLoading]);

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

        const elementShow: Record<string, boolean> = {
          OM: true,
          P: true,
          K: true,
          Ca: true,
          Mg: true,
        };
        const soilAnalysis = Array.isArray(data?.soilAnalysis)
          ? data.soilAnalysis
          : [];

        const graphData =
          soilAnalysis.length > 0
            ? soilAnalysis
                .filter(element => elementShow[element.elementName])
                .map(element => ({
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
                  ChoroplethMapDataItem: {
                    data: Array.isArray(element.ChoroplethMapData)
                      ? element.ChoroplethMapData.map(location => ({
                          name: toMapKey(location.locationName),
                          value: Number(location.totalCount) || 0,
                          itemStyle: {
                            color: location?.data?.color || '#ccc',
                          },
                        })).filter(location => location.name)
                      : [],
                    options: {
                      name: element.elementName,
                      pieces: [],
                    },
                  },
                }))
            : [];

        setDashboardData({ graphData });
        setHasSuccessfulLoad(true);
        setDashboardError(null);
      } catch (error) {
        console.error('Cannot load report data:', error);
        if (!ignore) {
          setDashboardError('ไม่สามารถโหลดข้อมูลรายงานได้');
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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = Number(e.target.value);
    setDraftSearch(prev => ({ ...prev, typeId: typeId || undefined }));
  };

  const handleGeographyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const geographyId = Number(value);
    const selectedText = e.target.options[e.target.selectedIndex].text;
    const requestId = ++geographyRequestRef.current;

    setProvinceList([]);
    setDependentFilterError(null);
    setDraftSearch(prev => ({
      ...prev,
      geographyId: geographyId || undefined,
      provinceCode: undefined,
      districtCode: undefined,
      subdistrictCode: undefined,
    }));

    setDraftFilterLevel(
      !geographyId ? undefined : { level: MapLevel.Region, name: selectedText }
    );

    if (geographyId) {
      try {
        const provinces = await getProvinceByGeographyId(geographyId);
        if (requestId !== geographyRequestRef.current) return;
        setProvinceList(Array.isArray(provinces) ? provinces : []);
      } catch (error) {
        if (requestId !== geographyRequestRef.current) return;
        console.error('Cannot load provinces:', error);
        setDependentFilterError('ไม่สามารถโหลดจังหวัดได้');
      }
    }
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const provinceCode = Number(value);
    const nameEn = provinceList
      .find(p => p.code === provinceCode)
      ?.nameEn.replace(/\s+/g, '');

    setDraftSearch(prev => ({
      ...prev,
      provinceCode: provinceCode || undefined,
      districtCode: undefined,
      subdistrictCode: undefined,
    }));

    setDraftFilterLevel(
      !provinceCode
        ? {
            level: MapLevel.Region,
            name: geographyList.find(g => g.id === draftSearch.geographyId)
              ?.name,
          }
        : { level: MapLevel.Province, name: nameEn }
    );
  };

  const mapData = dashboardData.graphData.filter(
    item => item.ChoroplethMapDataItem.data.length > 0
  );
  const barData = dashboardData.graphData.filter(
    item => item.BarChartDataItem.length > 0
  );

  // ===== Executive Brief: ดึง "ข้อสรุปเด่น" จากข้อมูลจริงตามฟิลเตอร์ปัจจุบัน =====
  // ธาตุอาหารที่ผลกระจุกตัวมากที่สุด (top grade ครองสัดส่วนสูงสุด)
  const soilInsight = (() => {
    let best: { element: string; grade: string; pct: number } | null = null;
    for (const element of barData) {
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

  // จำนวนพื้นที่ที่มีข้อมูลบนแผนที่ (มากสุดในบรรดาธาตุ)
  const mapCoverage = mapData.reduce(
    (max, item) => Math.max(max, item.ChoroplethMapDataItem.data.length),
    0
  );

  // ธาตุที่นำมาวิเคราะห์ในรายงานนี้
  const analyzedSymbols = barData.map(
    item => ELEMENT_LABELS[item.elementName]?.symbol ?? item.elementName
  );

  const reportFilters = [
    {
      label: 'ประเภทบริการ',
      value: serviceTypes.find(
        type => type.serviceTypeId === appliedSearch?.typeId
      )?.name,
    },
    {
      label: 'ภูมิภาค',
      value: geographyList.find(
        geography => geography.id === appliedSearch?.geographyId
      )?.name,
    },
    {
      label: 'จังหวัด',
      value: provinceList.find(
        province => province.code === appliedSearch?.provinceCode
      )?.nameTh,
    },
  ];
  const activeFilters = reportFilters.filter(
    filter =>
      filter.value !== undefined && filter.value !== null && filter.value !== ''
  );

  return (
    <div className="executive-report-content">
      {/* ===================== PAGE HEADER ===================== */}
      <div className="exec-page-header executive-report-no-print">
        <div>
          <h2 className="exec-page-title">
            <i
              className="fas fa-map me-2 text-primary"
              style={{ fontSize: '1.3rem' }}
            ></i>
            แผนที่การกระจายตัวผลวิเคราะห์ดิน
          </h2>
          <p className="exec-page-subtitle">
            สัดส่วนเชิงพื้นที่ของระดับความอุดมสมบูรณ์แยกตามธาตุอาหารและภูมิภาค
          </p>
        </div>
        <ExecutiveReportToolbar
          title="รายงานการกระจายตัวผลการวิเคราะห์ดิน"
          filters={reportFilters}
          disabled={!hasSuccessfulLoad || isDashboardLoading}
          buildReportData={() => ({
            soilInsight,
            fertilizerInsight: null,
            improveInsight: null,
            graphData: barData.map(element => ({
              elementName: element.elementName,
              BarChartDataItem: element.BarChartDataItem.map(item => ({
                label: item.label,
                value: item.value,
              })),
            })),
            pieChartData: [],
            prepareData: [],
          })}
        />
      </div>

      {/* ===================== KPI SUMMARY ===================== */}
      <section className="mb-4">
        {activeFilters.length > 0 && (
          <div className="exec-brief-chips executive-report-no-print mb-3">
            {activeFilters.map(filter => (
              <span key={filter.label} className="exec-brief-chip">
                <span className="exec-brief-chip-label">{filter.label}:</span>
                {filter.value}
              </span>
            ))}
          </div>
        )}
        <DashboardSummary />
      </section>

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
            style={{ fontSize: '1rem' }}
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
                geographyList,
                provinceList,
              }}
              values={draftSearch}
              handlers={{
                handleChange,
                handleTypeChange,
                handleGeographyChange,
                handleProvinceChange,
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
              icon="fas fa-map-marked-alt"
              accent="#f4a62a"
              label="พื้นที่บนแผนที่"
              empty={mapCoverage === 0}
              value={`${mapCoverage.toLocaleString()} พื้นที่`}
              sub="จุดที่มีข้อมูลแสดงในแผนที่"
            />
            <BriefTile
              icon="fas fa-flask"
              accent="#4caf7d"
              label="ธาตุที่วิเคราะห์"
              empty={barData.length === 0}
              value={`${barData.length} ธาตุ`}
              sub={analyzedSymbols.join(' ยท ')}
            />
          </div>
        </section>
      )}

      {filterError && <StatusNotice type="error" message={filterError} />}
      {dependentFilterError && (
        <StatusNotice type="error" message={dependentFilterError} />
      )}
      {dashboardError && <StatusNotice type="error" message={dashboardError} />}
      {!hasDashboardLoaded && <LoadingState label="กำลังโหลดข้อมูลรายงาน..." />}

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

          {/* แผงแผนที่การกระจายตัว */}
          <div
            role="tabpanel"
            className={`exec-tab-panel ${activeTab === 'map' ? '' : 'is-inactive'}`}
          >
            <SectionCard
              title="แผนที่การกระจายตัวดิน"
              subtitle="การกระจายตัวเชิงพื้นที่ของระดับความอุดมสมบูรณ์ แยกตามธาตุอาหาร"
              icon="fas fa-map"
            >
              {mapData.length > 0 ? (
                <div className="row">
                  {mapData.map(item => (
                    <div
                      key={`choropleth-${item.elementName}`}
                      className="col-md-4 mb-3"
                    >
                      <div className="fw-semibold text-center mb-2">
                        {formatElementTitle(item.elementName)}
                      </div>
                      <ChoroplethMap
                        data={item.ChoroplethMapDataItem.data}
                        options={item.ChoroplethMapDataItem.options}
                        filter={appliedFilterLevel}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
              )}
            </SectionCard>
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
              {barData.length > 0 ? (
                <div className="row">
                  {barData.map(item => (
                    <div
                      key={`bar-${item.elementName}`}
                      className="col-md-4 mb-4"
                    >
                      <div style={{ minHeight: '210px', width: '100%' }}>
                        <HorizontalBarChart
                          title={formatElementTitle(item.elementName)}
                          dataItems={item.BarChartDataItem}
                        />
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

export default Report;
