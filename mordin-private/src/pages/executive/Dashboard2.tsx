import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import ChoroplethMap from '@/components/chart/ChoroplethMap';
import DashboardFilters from '@/components/pages/executive/dashboard/DashboardFilter';
import {
  ELEMENT_LABELS,
  formatElementTitle,
} from '@/components/pages/executive/executive-elements';
import { StatusNotice } from '@/components/pages/executive/ExecutiveDashboardUI';
import ExecutiveReportToolbar from '@/components/pages/executive/ExecutiveReportToolbar';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import { getAllGeoGraphies } from '@/services/api/address/GeographiesApi';
import {
  getAllProvinces,
  getProvinceByGeographyId,
} from '@/services/api/address/ProvinceApi';
import { getFertilizerMajorLandScoreGraph } from '@/services/api/fertilizer/FertilizerMajorLandScore';
import { getAllServiceTypes } from '@/services/api/service-type/ServiceTypeApi';
import { geography, Province } from '@/types/address';
import { MapLevel } from '@/types/common/GADM';
import type { GetGraphFilterParams } from '@/types/fertilizer/FertilizerMajorLandScore';
import { ServiceType } from '@/types/service-type/ServiceTypes';

import '@/components/pages/executive/executive-redesign.css';

type SelectedSearch = GetGraphFilterParams;

const toMapKey = (value?: string) =>
  (value || '').replace(/\s+/g, '').replace(/^Mueang/i, 'Muang');

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

// ข้อมูลรายพื้นที่ของธาตุหนึ่ง (เก็บ gradeName/color ไว้แสดงในแผงรายละเอียด)
interface ElementLocation {
  key: string;
  totalCount: number;
  gradeName: string | null;
  color: string;
}

interface ElementMapData {
  elementName: string;
  bars: { label: string; value: number; color: string }[];
  locations: ElementLocation[];
}

const Report = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // อ่านค่าจาก URL "ครั้งเดียว" ตอน mount เพื่อใช้ตั้งค่าเริ่มต้น (หลังจากนั้นเราเป็นคนเขียน URL เอง)
  const initialUrlRef = useRef<SelectedSearch | null>(null);
  if (!initialUrlRef.current) {
    initialUrlRef.current = parseFiltersFromParams(searchParams);
  }

  const [draftSearch, setDraftSearch] = useState<SelectedSearch>(
    initialUrlRef.current
  );
  const [appliedSearch, setAppliedSearch] = useState<SelectedSearch | null>(
    null
  );
  const [geographyList, setGeographyList] = useState<geography[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  // ตารางแปลงชื่อจังหวัดอังกฤษ (คีย์แผนที่) → ชื่อไทย สำหรับแผงรายละเอียด
  const [provinceThaiNames, setProvinceThaiNames] = useState<
    Record<string, string>
  >({});
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const geographyRequestRef = useRef(0);

  const [elements, setElements] = useState<ElementMapData[]>([]);
  // ธาตุที่ใช้ระบายสีแผนที่ + พื้นที่ที่ถูกคลิกเลือกบนแผนที่
  const [activeElementName, setActiveElementName] = useState<string | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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
        const [geographies, types, allProvinces] = await Promise.all([
          getAllGeoGraphies(),
          getAllServiceTypes(),
          getAllProvinces(),
        ]);

        if (ignore) return;

        const safeTypes = Array.isArray(types) ? types : [];
        const safeGeographies = Array.isArray(geographies) ? geographies : [];
        setServiceTypes(safeTypes);
        // ตารางชื่อไทยของจังหวัดทั้งหมด ใช้แปลคีย์แผนที่ (ชื่ออังกฤษ) ตอนแสดงผล
        const thaiNames: Record<string, string> = {};
        for (const province of Array.isArray(allProvinces)
          ? allProvinces
          : []) {
          if (province?.nameEn) {
            thaiNames[toMapKey(province.nameEn)] = province.nameTh;
          }
        }
        setProvinceThaiNames(thaiNames);
        // ใช้ฟิลเตอร์จาก URL ถ้ามี ไม่งั้น default = ประเภทบริการแรก
        const urlFilters = initialUrlRef.current ?? {};
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

        const nextElements: ElementMapData[] =
          soilAnalysis.length > 0
            ? soilAnalysis
                .filter(element => elementShow[element.elementName])
                .map(element => ({
                  elementName: element.elementName,
                  bars: Array.isArray(element.HorizontalBarChartData)
                    ? element.HorizontalBarChartData.map(bar => ({
                        label: bar.gradeName,
                        value: Number(bar.count) || 0,
                        color: bar.color || '#ccc',
                      }))
                    : [],
                  locations: Array.isArray(element.ChoroplethMapData)
                    ? element.ChoroplethMapData.map(location => ({
                        key: toMapKey(location.locationName),
                        totalCount: Number(location.totalCount) || 0,
                        gradeName: location?.data?.gradeName ?? null,
                        color: location?.data?.color || '#ccc',
                      })).filter(location => location.key)
                    : [],
                }))
            : [];

        setElements(nextElements);
        // ล้างการเลือกพื้นที่เมื่อข้อมูลเปลี่ยน (ฟิลเตอร์ใหม่ = ชุดพื้นที่ใหม่)
        setSelectedLocation(null);
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

  const mapElements = elements.filter(item => item.locations.length > 0);
  const barElements = elements.filter(item => item.bars.length > 0);

  // ธาตุที่ใช้ระบายสีแผนที่ตอนนี้ (ค่าที่เลือกหายไปจากข้อมูลใหม่ → กลับไปธาตุแรก)
  const activeElement =
    mapElements.find(item => item.elementName === activeElementName) ??
    mapElements[0] ??
    null;

  // ชื่อพื้นที่สำหรับแสดงผล: จังหวัดแปลงเป็นชื่อไทย, ระดับอำเภอใช้ชื่อจาก GADM ตามเดิม
  const displayLocationName = (key: string) => provinceThaiNames[key] ?? key;

  // ข้อมูลธาตุรายพื้นที่ของจุดที่ถูกคลิก (เรียงตามลำดับธาตุ)
  const selectedDetails = selectedLocation
    ? elements.map(element => ({
        elementName: element.elementName,
        location:
          element.locations.find(
            location => location.key === selectedLocation
          ) ?? null,
      }))
    : [];

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

  // ===== Executive Brief สำหรับรายงานพิมพ์ (ใช้ข้อมูลแท่งเหมือนเดิม) =====
  const soilInsight = (() => {
    let best: { element: string; grade: string; pct: number } | null = null;
    for (const element of barElements) {
      const total = element.bars.reduce((sum, bar) => sum + bar.value, 0);
      if (total === 0) continue;
      const top = element.bars.reduce((a, b) => (b.value > a.value ? b : a));
      const pct = (top.value / total) * 100;
      if (!best || pct > best.pct) {
        best = { element: element.elementName, grade: top.label, pct };
      }
    }
    return best;
  })();

  return (
    <div className="executive-report-content exr">
      {/* ===================== PAGE HEADER ===================== */}
      <div className="exr-page-head executive-report-no-print">
        <div>
          <h2 className="exr-page-title">แผนที่ผลวิเคราะห์ดินรายพื้นที่</h2>
          <p className="exr-page-sub">
            คลิกพื้นที่บนแผนที่เพื่อดูผลวิเคราะห์ดินของพื้นที่นั้น ·
            เลือกธาตุอาหารเพื่อเปลี่ยนการระบายสี
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
            graphData: barElements.map(element => ({
              elementName: element.elementName,
              BarChartDataItem: element.bars.map(item => ({
                label: item.label,
                value: item.value,
              })),
            })),
            pieChartData: [],
            prepareData: [],
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

      {filterError && <StatusNotice type="error" message={filterError} />}
      {dependentFilterError && (
        <StatusNotice type="error" message={dependentFilterError} />
      )}
      {dashboardError && <StatusNotice type="error" message={dashboardError} />}
      {!hasDashboardLoaded && <LoadingState label="กำลังโหลดข้อมูลรายงาน..." />}

      {/* ===================== แผนที่เดียว + แผงรายละเอียดตามจุดที่คลิก ===================== */}
      {hasDashboardLoaded && (
        <div className="position-relative">
          <div className="exr-card">
            <div className="exr-card-head">
              <div className="min-w-0">
                <h4 className="exr-card-title">
                  <i className="fas fa-map-location-dot"></i>
                  แผนที่การกระจายตัวผลวิเคราะห์ดิน
                </h4>
                <p className="exr-card-sub">
                  สีของพื้นที่ = ระดับผลวิเคราะห์ที่พบมากที่สุดของธาตุที่เลือก
                </p>
              </div>
              {mapElements.length > 1 && activeElement && (
                <div
                  className="exr-tabs executive-report-no-print"
                  role="tablist"
                >
                  {mapElements.map(element => (
                    <button
                      key={element.elementName}
                      type="button"
                      role="tab"
                      aria-selected={
                        element.elementName === activeElement.elementName
                      }
                      className={`exr-tab ${
                        element.elementName === activeElement.elementName
                          ? 'on'
                          : ''
                      }`}
                      onClick={() => setActiveElementName(element.elementName)}
                    >
                      {ELEMENT_LABELS[element.elementName]?.symbol ??
                        element.elementName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="exr-card-body">
              {activeElement ? (
                <div className="exr-map-layout">
                  <div className="exr-map-canvas">
                    <ChoroplethMap
                      data={activeElement.locations.map(location => ({
                        name: location.key,
                        value: location.totalCount,
                        itemStyle: { color: location.color },
                      }))}
                      options={{ name: '', pieces: [] }}
                      filter={appliedFilterLevel}
                      onSelect={name =>
                        setSelectedLocation(prev =>
                          prev === name ? null : name
                        )
                      }
                      height={520}
                    />
                    {/* คำอธิบายสีของธาตุที่เลือก */}
                    <div className="exr-map-legend">
                      {activeElement.bars.map(bar => (
                        <span key={bar.label} className="exr-legend-item">
                          <span
                            className="exr-dot"
                            style={{ background: bar.color }}
                          ></span>
                          {bar.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* แผงรายละเอียดพื้นที่ที่คลิก */}
                  <div className="exr-map-detail">
                    {selectedLocation ? (
                      <>
                        <div className="exr-map-detail-head">
                          <div>
                            <div className="exr-map-detail-label">
                              พื้นที่ที่เลือก
                            </div>
                            <div className="exr-map-detail-title">
                              <i className="fas fa-location-dot me-2"></i>
                              {displayLocationName(selectedLocation)}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="exr-board-btn"
                            onClick={() => setSelectedLocation(null)}
                          >
                            <i className="fas fa-xmark me-1"></i>
                            ล้าง
                          </button>
                        </div>
                        {selectedDetails.map(detail => (
                          <div key={detail.elementName} className="exr-map-row">
                            <span className="exr-map-row-name">
                              {formatElementTitle(detail.elementName)}
                            </span>
                            {detail.location ? (
                              <span className="exr-map-row-value">
                                <span
                                  className="exr-dot"
                                  style={{
                                    background: detail.location.color,
                                  }}
                                ></span>
                                <b>{detail.location.gradeName ?? '—'}</b>
                                <small>
                                  ·{' '}
                                  {detail.location.totalCount.toLocaleString()}{' '}
                                  ตัวอย่าง
                                </small>
                              </span>
                            ) : (
                              <span className="exr-map-row-empty">
                                ไม่มีข้อมูล
                              </span>
                            )}
                          </div>
                        ))}
                        <div className="exr-note">
                          <i className="fas fa-circle-info"></i>
                          สีและระดับ =
                          ผลวิเคราะห์ที่พบมากที่สุดของแต่ละธาตุในพื้นที่นี้
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="exr-map-detail-head">
                          <div>
                            <div className="exr-map-detail-label">
                              ภาพรวมพื้นที่ที่แสดง
                            </div>
                            <div className="exr-map-detail-title">
                              <i className="fas fa-chart-simple me-2"></i>
                              ทุกพื้นที่บนแผนที่
                            </div>
                          </div>
                        </div>
                        {barElements.map(element => {
                          const total = element.bars.reduce(
                            (sum, bar) => sum + bar.value,
                            0
                          );
                          const top = element.bars.reduce((a, b) =>
                            b.value > a.value ? b : a
                          );
                          const pct = total > 0 ? (top.value / total) * 100 : 0;
                          return (
                            <div
                              key={element.elementName}
                              className="exr-map-row"
                            >
                              <span className="exr-map-row-name">
                                {formatElementTitle(element.elementName)}
                              </span>
                              <span className="exr-map-row-value">
                                <span
                                  className="exr-dot"
                                  style={{ background: top.color }}
                                ></span>
                                <b>{top.label}</b>
                                <small>· {pct.toFixed(0)}%</small>
                              </span>
                            </div>
                          );
                        })}
                        <div className="exr-map-hint">
                          <i className="fas fa-hand-pointer"></i>
                          คลิกพื้นที่บนแผนที่
                          เพื่อดูผลวิเคราะห์ดินรายพื้นที่ของจุดนั้น
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState title="ไม่พบข้อมูลตามเงื่อนไขที่เลือก" />
              )}
            </div>
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
