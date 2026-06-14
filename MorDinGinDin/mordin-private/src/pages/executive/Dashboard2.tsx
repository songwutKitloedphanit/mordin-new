import { useEffect, useState } from 'react';

// Import services and types as before
import ChoroplethMap, {
  ChoroplethMapData,
  ChoroplethMapOption,
} from '@/components/chart/ChoroplethMap';
import HorizontalBarChart, {
  BarChartDataItem,
} from '@/components/chart/HorizontalBarChart';
import DashboardSummary, {
  SummaryData,
} from '@/components/pages/executive/dashboard/DashBoardCard';
import DashboardFilters from '@/components/pages/executive/dashboard/DashboardFilter';
import { getDistrictsByProvinceCode } from '@/services/api/address/DistrictApi';
import { getAllGeoGraphies } from '@/services/api/address/GeographiesApi';
import { getProvinceByGeographyId } from '@/services/api/address/ProvinceApi';
import { getSubdistrictsByDistrictCode } from '@/services/api/address/SubdistrictApi';
import { getFertilizerMajorLandScoreGraph } from '@/services/api/fertilizer/FertilizerMajorLandScore';
import { getAllServiceTypes } from '@/services/api/service-type/ServiceTypeApi';
import { District, geography, Province, Subdistrict } from '@/types/address';
import { MapLevel } from '@/types/common/GADM';
import { ServiceType } from '@/types/service-type/ServiceTypes';

interface SelectedSearch {
  year?: number;
  factoryId?: number;
  serviceAreaId?: number;
  geographyId?: number;
  provinceCode?: number;
  districtCode?: number;
  subdistrictCode?: number;
  typeId?: number;
}

const Dashboard = () => {
  // --- State Management ---
  const [selectedSearch, setSelectedSearch] = useState<SelectedSearch>({
    typeId: 0,
  });
  const [geographyList, setGeographyList] = useState<geography[]>([]);
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [subDistrictList, setSubdistrictList] = useState<Subdistrict[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [filterLevel, setFilterLevel] = useState<{
    level: MapLevel;
    name?: string;
  }>();

  // Replace this with data fetched from your new /api/dashboard endpoint
  const [dashboardData, setDashboardData] = useState<{
    summary: SummaryData;
    graphData: {
      elementName: string;
      BarChartDataItem: BarChartDataItem[];
      ChoroplethMapDataItem: {
        data: ChoroplethMapData[];
        options: ChoroplethMapOption;
      };
    }[];
  }>({
    summary: {
      totalArea: 20000,
      totalFarmers: 5131,
      totalSamples: 7000,
      totalWorkingDays: 294,
    },
    graphData: [],
  });

  // --- Data Fetching ---
  useEffect(() => {
    // This effect fetches data for filters' dropdowns
    const fetchFilterData = async () => {
      const [geographies, serviceTypes] = await Promise.all([
        getAllGeoGraphies(),
        getAllServiceTypes(),
      ]);
      setServiceTypes(serviceTypes);
      setSelectedSearch({
        typeId: serviceTypes.length > 0 ? serviceTypes[0].serviceTypeId : 0,
      });
      setGeographyList(geographies);
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    // This effect will re-fetch dashboard data when filters change
    const fetchDashboardData = async () => {
      // Here you would call your API:
      const data = await getFertilizerMajorLandScoreGraph(selectedSearch);
      const elementShow: Record<string, boolean> = {
        OM: true,
        P: true,
        K: true,
        Ca: true,
        Mg: true,
      };
      if (data.soilAnalysis.length > 0) {
        const processedGraphs = data.soilAnalysis
          .filter(element => elementShow[element.elementName])
          .map(element => {
            const graph = {
              elementName: element.elementName,
              BarChartDataItem: [] as BarChartDataItem[],
              ChoroplethMapDataItem: {
                data: [] as ChoroplethMapData[],
                options: {
                  name: element.elementName,
                  pieces: [],
                },
              },
            };

            element.ChoroplethMapData.map(location => {
              graph.ChoroplethMapDataItem.data.push({
                name: location.locationName.replace(' ', ''),
                value: 1,
                itemStyle: { color: location?.data?.color || '#ccc' },
              });
            });

            element.HorizontalBarChartData.map(bar => {
              graph.BarChartDataItem.push({
                label: bar.gradeName,
                value: bar.count,
                color: bar.color,
              });
            });

            return graph;
          });

        setDashboardData(prev => ({ ...prev, graphData: processedGraphs }));
      } else {
        const defaultGraph = [
          {
            elementName: 'Ca',
            BarChartDataItem: [],
            ChoroplethMapDataItem: {
              data: [],
              options: {
                name: 'Ca',
                pieces: [],
              },
            },
          },
          {
            elementName: 'K',
            BarChartDataItem: [],
            ChoroplethMapDataItem: {
              data: [],
              options: {
                name: 'K',
                pieces: [],
              },
            },
          },
          {
            elementName: 'Mg',
            BarChartDataItem: [],
            ChoroplethMapDataItem: {
              data: [],
              options: {
                name: 'Mg',
                pieces: [],
              },
            },
          },
          {
            elementName: 'OM',
            BarChartDataItem: [],
            ChoroplethMapDataItem: {
              data: [],
              options: {
                name: 'OM',
                pieces: [],
              },
            },
          },
          {
            elementName: 'P',
            BarChartDataItem: [],
            ChoroplethMapDataItem: {
              data: [],
              options: {
                name: 'P',
                pieces: [],
              },
            },
          },
        ];

        setDashboardData(prev => ({ ...prev, graphData: defaultGraph }));
      }
    };

    fetchDashboardData();
  }, [selectedSearch]);

  // --- Event Handlers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSelectedSearch(prev => ({
      ...prev,
      [name]: value ? Number(value) : undefined,
    }));
  };

  const handleGeographyChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const geographyId = Number(value);
    const selectedText = e.target.options[e.target.selectedIndex].text;

    // Reset child filters
    setProvinceList([]);
    setDistrictList([]);
    setSubdistrictList([]);
    setSelectedSearch(prev => ({
      ...prev,
      geographyId: geographyId || undefined,
      provinceCode: undefined,
      districtCode: undefined,
      subdistrictCode: undefined,
    }));

    if (selectedText === 'All') {
      setFilterLevel(undefined);
    } else {
      setFilterLevel({
        level: MapLevel.Region,
        name: selectedText,
      });
    }

    if (geographyId) {
      const provinces = await getProvinceByGeographyId(geographyId);
      setProvinceList(provinces);
    }
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const provinceCode = Number(value);
    const selectedText = e.target.options[e.target.selectedIndex].text;
    const nameEn = provinceList
      .find(province => province.code === provinceCode)
      ?.nameEn.replace(/\s+/g, '');

    setDistrictList([]);
    setSubdistrictList([]);
    setSelectedSearch(prev => ({
      ...prev,
      provinceCode: provinceCode || undefined,
      districtCode: undefined,
      subdistrictCode: undefined,
    }));

    if (selectedText === 'All') {
      setFilterLevel({
        level: MapLevel.Region,
        name: geographyList.find(
          geography => geography.id === selectedSearch.geographyId
        )?.name,
      });
    } else {
      setFilterLevel({
        level: MapLevel.Province,
        name: nameEn,
      });
    }

    if (provinceCode) {
      const districts = await getDistrictsByProvinceCode(provinceCode);
      setDistrictList(districts);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const districtCode = Number(value);
    const selectedText = e.target.options[e.target.selectedIndex].text;
    const nameEn = districtList
      .find(district => district.code === districtCode)
      ?.nameEn.replace(/\s+/g, '')
      .replace(/Mueang/i, 'Muang');

    // Reset child filter
    setSubdistrictList([]);
    setSelectedSearch(prev => ({
      ...prev,
      districtCode: districtCode || undefined,
      subdistrictCode: undefined,
    }));

    if (selectedText === 'All') {
      setFilterLevel({
        level: MapLevel.Province,
        name: provinceList
          .find(province => province.code === selectedSearch.provinceCode)
          ?.nameEn.replace(/\s+/g, ''),
      });
    } else {
      setFilterLevel({
        level: MapLevel.District,
        name: nameEn,
      });
    }

    if (districtCode) {
      const subdistricts = await getSubdistrictsByDistrictCode(districtCode);
      setSubdistrictList(subdistricts);
    }
  };

  return (
    <>
      <DashboardSummary />

      <div className="row">
        <div className="col-12 text-start">
          <ul
            className="nav nav-pills nav-secondary"
            id="pills-tab"
            role="tablist"
          >
            {serviceTypes.map(type => (
              <li className="nav-item" key={type.serviceTypeId}>
                <button
                  type="button"
                  className={`nav-link ${selectedSearch?.typeId === type.serviceTypeId ? 'active' : ''}`}
                  onClick={() =>
                    setSelectedSearch(prev => ({
                      ...prev,
                      typeId: type.serviceTypeId,
                    }))
                  }
                >
                  {type.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DashboardFilters
        lists={{
          geographyList: geographyList,
          provinceList: provinceList,
          districtList: districtList,
          subDistrictList: subDistrictList,
        }}
        values={selectedSearch}
        handlers={{
          handleChange: handleChange,
          handleSelectFactory: undefined,
          handleGeographyChange: handleGeographyChange,
          handleProvinceChange: handleProvinceChange,
          handleDistrictChange: handleDistrictChange,
        }}
      />

      <div className="row">
        {dashboardData?.graphData?.map(item => (
          <div
            key={`choropleth-map-${item.elementName}`}
            className="col-md-4 mb-3"
          >
            <ChoroplethMap
              data={item.ChoroplethMapDataItem.data}
              options={item.ChoroplethMapDataItem.options}
              filter={filterLevel}
            />
          </div>
        ))}
      </div>

      <div className="row">
        {dashboardData?.graphData?.map(item => (
          <div
            className="col-md-4 mb-3"
            key={`horizontal-bar-${item.elementName}`}
          >
            <div style={{ height: '160px' }}>
              <HorizontalBarChart
                title={item.elementName}
                dataItems={item.BarChartDataItem}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
