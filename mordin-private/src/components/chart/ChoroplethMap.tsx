import * as echarts from 'echarts';
import type { GeoJSONSourceInput } from 'echarts/types/src/coord/geo/geoTypes.js';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import rawGeoJsonProvince from '../../assets/geojson/gadm41_THA_1.json';
import rawGeoJsonDistrict from '../../assets/geojson/gadm41_THA_2.json';
import rawGeoJsonSubDistrict from '../../assets/geojson/gadm41_THA_3.json';

import { useChartColors } from './chart-colors';

import {
  GADM1GeoJSON,
  GADM2GeoJSON,
  GADM3GeoJSON,
  MapLevel,
  REGION_PROVINCE_MAPPING,
} from '@/types/common/GADM';

export interface ChoroplethMapData {
  name: string;
  value: number;
  itemStyle?: { color: string };
}

// คีย์เทียบชื่อพื้นที่แบบทนความต่างเล็กน้อย (ตัวพิมพ์/เว้นวรรค/อักขระ + Mueang→Muang)
// ใช้จับคู่ชื่อจาก API กับชื่อในแผนที่ GADM ไม่ให้พื้นที่ "ไม่มีสี" ทั้งที่มีข้อมูล
const normalizeGeoKey = (value?: string) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/^mueang/, 'muang');

export interface ChoroplethMapOption {
  name: string;
  pieces: { min: number; max: number; color: string }[];
}

interface ChoroplethMapProps {
  data: ChoroplethMapData[];
  options: ChoroplethMapOption;
  filter?: {
    level: MapLevel; // region, province, district, subdistrict
    name?: string; // ชื่อภูมิภาค, จังหวัด, อำเภอ, ตำบล
  };
  // คลิกพื้นที่บนแผนที่แล้วได้ชื่อพื้นที่กลับไป (เปิดโหมดเลือกพื้นที่ single-select)
  onSelect?: (name: string) => void;
  // ตัวเลข (px) หรือ '100%' เพื่อยืดตามกล่องที่ครอบ (เช่นวิดเจ็ตบนกริดที่ resize ได้)
  height?: number | string;
}

const ChoroplethMap = ({
  data,
  options,
  filter,
  onSelect,
  height = 400,
}: ChoroplethMapProps) => {
  const colors = useChartColors();

  const boxRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ReactECharts | null>(null);

  const rawGeoJson: GADM1GeoJSON | GADM2GeoJSON | GADM3GeoJSON =
    filter?.level === MapLevel.Region
      ? (rawGeoJsonProvince as unknown as GADM1GeoJSON)
      : filter?.level === MapLevel.Province
        ? (rawGeoJsonDistrict as unknown as GADM2GeoJSON)
        : filter?.level === MapLevel.District
          ? (rawGeoJsonSubDistrict as unknown as GADM3GeoJSON)
          : (rawGeoJsonProvince as unknown as GADM1GeoJSON);

  const getProvincesByRegion = (regionName: string): string[] => {
    return REGION_PROVINCE_MAPPING[regionName] || [];
  };

  const filteredGeoJson = useMemo(() => {
    const fixedGeoJson = rawGeoJson
      ? {
          ...rawGeoJson,
          features: rawGeoJson.features.map(f => ({
            ...f,
            properties: {
              ...f.properties,
              name:
                filter?.level === MapLevel.Region
                  ? f.properties.NAME_1 // ใช้ชื่อจังหวัด
                  : filter?.level === MapLevel.Province
                    ? f.properties.NAME_2 // ใช้ชื่ออำเภอ
                    : filter?.level === MapLevel.District
                      ? f.properties.NAME_3
                      : f.properties.NAME_1, // default: จังหวัด
            },
          })),
        }
      : { type: 'FeatureCollection', features: [] };
    return {
      ...fixedGeoJson,
      features: fixedGeoJson.features.filter(f => {
        if (!filter) return true;
        if (filter.level === MapLevel.Region && filter.name) {
          const provincesInRegion = getProvincesByRegion(filter.name);
          return (
            'NAME_1' in f.properties &&
            provincesInRegion.includes(f.properties.NAME_1)
          );
        }
        if (filter.level === MapLevel.Province && 'NAME_2' in f.properties) {
          return filter.name ? f.properties.NAME_1 === filter.name : true;
        }
        if (filter.level === MapLevel.District && 'NAME_3' in f.properties) {
          return filter.name ? f.properties.NAME_2 === filter.name : true;
        }
        return false;
      }),
    };
  }, [rawGeoJson, filter]);

  const mapName = useMemo(() => {
    return `map-${filter?.level || 'default'}-${filter?.name || 'all'}`;
  }, [filter]);

  const [readyMapName, setReadyMapName] = useState<string | null>(null);

  useEffect(() => {
    echarts.registerMap(mapName, filteredGeoJson as GeoJSONSourceInput);
    setReadyMapName(mapName);
  }, [mapName, filteredGeoJson]);

  const isMapReady = readyMapName === mapName;

  // echarts ไม่ตามขนาด container เอง (ตามเฉพาะ window) — เฝ้ากล่องครอบด้วย
  // ResizeObserver เพื่อให้แผนที่ปรับขนาดตอนผู้ใช้ย่อ/ขยายวิดเจ็ตบนกริด
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !isMapReady || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      chartRef.current?.getEchartsInstance().resize();
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [isMapReady]);

  // จับคู่ข้อมูลจาก API เข้ากับชื่อฟีเจอร์ในแผนที่ด้วยคีย์ที่ทนความต่าง แล้วเปลี่ยน
  // ชื่อ data ให้ตรงกับชื่อในแผนที่ (echarts จับคู่แบบตรงตัว) — เก็บ map ย้อนกลับไว้
  // ส่งชื่อเดิมกลับตอนคลิก เพื่อให้ส่วนอื่นของหน้าใช้คีย์เดิมได้เหมือนเดิม
  const { matchedData, renderNameToOriginal } = useMemo(() => {
    const normToFeature = new Map<string, string>();
    for (const feature of filteredGeoJson.features) {
      const featureName = (feature.properties as { name?: string }).name;
      if (featureName) {
        normToFeature.set(normalizeGeoKey(featureName), featureName);
      }
    }
    const reverse = new Map<string, string>();
    const mapped = data.map(item => {
      const featureName = normToFeature.get(normalizeGeoKey(item.name));
      const renderName = featureName ?? item.name;
      reverse.set(renderName, item.name);
      return featureName && featureName !== item.name
        ? { ...item, name: featureName }
        : item;
    });
    return { matchedData: mapped, renderNameToOriginal: reverse };
  }, [data, filteredGeoJson]);

  const option = useMemo(
    () => ({
      backgroundColor: 'transparent',
      title: {
        text: options.name,
        left: 'center',
        textStyle: {
          color: colors.text,
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textStyle: { color: colors.text },
      },
      visualMap: {
        type: 'piecewise',
        pieces: options.pieces,
        left: 'right',
        textStyle: { color: colors.muted },
      },
      series: [
        {
          name: 'Thailand',
          type: 'map',
          map: mapName,
          roam: true,
          data: matchedData,
          selectedMode: onSelect ? 'single' : false,
          emphasis: {
            label: { color: colors.text },
          },
          select: {
            label: { color: colors.text },
          },
        },
      ],
    }),
    [mapName, matchedData, options, colors, onSelect]
  );

  const onEvents = useMemo(
    () =>
      onSelect
        ? {
            click: (params: { name?: string }) => {
              if (params?.name) {
                // ส่งชื่อเดิม (คีย์ที่ส่วนอื่นของหน้าใช้) กลับไป ไม่ใช่ชื่อในแผนที่
                onSelect(renderNameToOriginal.get(params.name) ?? params.name);
              }
            },
          }
        : undefined,
    [onSelect, renderNameToOriginal]
  );

  const boxHeight = typeof height === 'number' ? `${height}px` : height;

  return isMapReady ? (
    <div ref={boxRef} style={{ height: boxHeight, width: '100%' }}>
      <ReactECharts
        ref={chartRef}
        option={option}
        onEvents={onEvents}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  ) : (
    <div style={{ height: boxHeight, display: 'grid', placeItems: 'center' }}>
      กำลังโหลดแผนที่...
    </div>
  );
};

export default ChoroplethMap;
