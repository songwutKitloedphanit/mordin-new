import * as echarts from 'echarts';
import type { GeoJSONSourceInput } from 'echarts/types/src/coord/geo/geoTypes.js';
import ReactECharts from 'echarts-for-react';
import { useEffect, useMemo, useState } from 'react';

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
}

const ChoroplethMap = ({ data, options, filter }: ChoroplethMapProps) => {
  const colors = useChartColors();

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
          data: data,
          emphasis: {
            label: { color: colors.text },
          },
          select: {
            label: { color: colors.text },
          },
        },
      ],
    }),
    [mapName, data, options, colors]
  );

  return isMapReady ? (
    <ReactECharts option={option} style={{ height: '400px' }} />
  ) : (
    <div style={{ height: '400px', display: 'grid', placeItems: 'center' }}>
      กำลังโหลดแผนที่...
    </div>
  );
};

export default ChoroplethMap;
