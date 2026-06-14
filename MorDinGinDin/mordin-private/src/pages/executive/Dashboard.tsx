import { useEffect, useState } from 'react';

// Import services and types as before
import HorizontalBarChart, {
  BarChartDataItem,
} from '@/components/chart/HorizontalBarChart';
import PieChart from '@/components/chart/PieChart';
import DashboardSummary from '@/components/pages/executive/dashboard/DashBoardCard';
import DashboardFilters from '@/components/pages/executive/dashboard/DashboardFilter';
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
import {
  PieChartData,
  PrepareData,
} from '@/types/fertilizer/FertilizerMajorLandScore';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInfo } from '@/types/service-area/ServiceAreas';
import { ServiceType } from '@/types/service-type/ServiceTypes';

// --- Data Section ---
const yearList = [
  { value: '', name: '' },
  { value: 2568, name: '2568' },
  { value: 2567, name: '2567' },
];

const mockPieChart = [
  { label: '16-16-8', value: 10 },
  { label: '16-6-8', value: 20 },
  { label: '20-8-8', value: 30 },
];
const pieChartDataList = [
  { title: 'ปุ๋ยรองพื้น', dataItems: mockPieChart },
  { title: 'ปุ๋ยแต่งหน้า', dataItems: mockPieChart },
];

const mockBarChart = [
  { label: 'สูงมาก', value: 35, color: '#006400' },
  { label: 'สูง', value: 35, color: '#90be6d' },
  { label: 'ปานกลาง', value: 35, color: '#277da1' },
  { label: 'ต่ำ', value: 40, color: '#f9844a' },
  { label: 'ต่ำมาก', value: 25, color: '#f94144' },
];

const chartDataList = [
  { title: 'OM', dataItems: mockBarChart },
  { title: 'P', dataItems: mockBarChart },
  { title: 'K', dataItems: mockBarChart },
  { title: 'Ca', dataItems: mockBarChart },
  { title: 'Mg', dataItems: mockBarChart },
];

interface SelectedSearch {
  year?: number;
  factoryId?: number;
  serviceAreaId?: number;
  provinceCode?: number;
  districtCode?: number;
  subdistrictCode?: number;
  typeId?: number;
}

const Dashboard = () => {
  // --- State Management ---
  const [factoryList, setFactoryList] = useState<FactoryInfoInterface[]>([]);
  const [serviceAreaList, setServiceAreaList] = useState<ServiceAreaInfo[]>([]);
  const [selectedSearch, setSelectedSearch] = useState<SelectedSearch>({
    typeId: 0,
  });
  const [provinceList, setProvinceList] = useState<Province[]>([]);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [subDistrictList, setSubdistrictList] = useState<Subdistrict[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const [dashboardData, setDashboardData] = useState({
    graphData: [] as {
      elementName: string;
      BarChartDataItem: BarChartDataItem[];
    }[],
    pieChartData: [] as PieChartData[],
    prepareData: [] as PrepareData[],
    soilAnalysis: chartDataList,
    fertilizerRecommendation: pieChartDataList,
    soilImprovement: {
      lime: { percentage: 24, averageRate: 300 },
      filterCake: { percentage: 24, averageRate: 10 },
    },
  });

  // --- Data Fetching ---
  useEffect(() => {
    // This effect fetches data for filters' dropdowns
    const fetchFilterData = async () => {
      const [factories, provinces, serviceTypes] = await Promise.all([
        getAllFactories(),
        getAllProvinces(),
        getAllServiceTypes(),
      ]);
      setFactoryList(factories);
      setServiceTypes(serviceTypes);
      setSelectedSearch({
        typeId: serviceTypes.length > 0 ? serviceTypes[0].serviceTypeId : 0,
      });
      setProvinceList(provinces);
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    // This effect will re-fetch dashboard data when filters change
    const fetchDashboardData = async () => {
      // Here you would call your API:
      const data = await getFertilizerMajorLandScoreGraph(selectedSearch);
      console.log('Fetched dashboard data:', data);
      if (data.soilAnalysis.length > 0) {
        const processedGraphs = data.soilAnalysis.map(element => {
          const graph = {
            elementName: element.elementName,
            BarChartDataItem: [] as BarChartDataItem[],
          };

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
        const defaultGraph = dashboardData.graphData.map(element => ({
          elementName: element.elementName,
          BarChartDataItem: [] as BarChartDataItem[],
        }));
        setDashboardData(prev => ({ ...prev, graphData: defaultGraph }));
      }

      if (data.fertilizerSummary !== null) {
        setDashboardData(prev => ({
          ...prev,
          pieChartData: data.fertilizerSummary.pieChartData,
        }));

        setDashboardData(prev => ({
          ...prev,
          prepareData: data.fertilizerSummary.prepareData,
        }));
      }
      console.log('Fetching new dashboard data for filters:', selectedSearch);
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

  const handleSelectFactory = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const factoryId = Number(value);

    // Reset child filters
    setServiceAreaList([]);
    setSelectedSearch(prev => ({
      ...prev,
      factoryId: factoryId || undefined,
      serviceAreaId: undefined,
    }));

    if (factoryId) {
      const factory = await getFactoryById(factoryId);
      setServiceAreaList(factory.serviceAreas);
    }
  };

  const handleProvinceChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const provinceCode = Number(value);

    // Reset child filters
    setDistrictList([]);
    setSubdistrictList([]);
    setSelectedSearch(prev => ({
      ...prev,
      provinceCode: provinceCode || undefined,
      districtCode: undefined,
      subdistrictCode: undefined,
    }));

    if (provinceCode) {
      const districts = await getDistrictsByProvinceCode(provinceCode);
      setDistrictList(districts);
    }
  };

  const handleDistrictChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { value } = e.target;
    const districtCode = Number(value);

    // Reset child filter
    setSubdistrictList([]);
    setSelectedSearch(prev => ({
      ...prev,
      districtCode: districtCode || undefined,
      subdistrictCode: undefined,
    }));

    if (districtCode) {
      const subdistricts = await getSubdistrictsByDistrictCode(districtCode);
      setSubdistrictList(subdistricts);
    }
  };

  console.log(serviceTypes);
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
          yearList,
          factoryList,
          serviceAreaList,
          provinceList,
          districtList,
          subDistrictList,
        }}
        values={selectedSearch}
        handlers={{
          handleChange,
          handleSelectFactory,
          handleProvinceChange,
          handleDistrictChange,
        }}
      />

      <div className="row">
        {dashboardData.graphData.map(item => (
          <div className="col-md-4 mb-3" key={item.elementName}>
            <div style={{ height: '160px' }}>
              <HorizontalBarChart
                title={item.elementName}
                dataItems={item.BarChartDataItem}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="row d-flex justify-content-center">
        {dashboardData.pieChartData.map(item => (
          <div key={item.serviceCategoryName} className="col-md-6 col-12 mb-2">
            <h3 className="fw-bold mx-5">{item.serviceCategoryName}</h3>
            <div className="row">
              {item.summary.map((type, index) => {
                const dataItems = type.PieChartItemDto.map(p => {
                  return {
                    label: p.formula,
                    value: p.useRate,
                  };
                });

                return (
                  <div
                    key={index}
                    className="mb-2 mx-auto"
                    style={{ width: '80%', maxWidth: 220, height: 220 }}
                  >
                    <PieChart
                      title={type.usageTypeName}
                      dataItems={dataItems}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="row d-flex justify-content-around">
        {dashboardData.prepareData.map(item => (
          <div
            key={item.fertilizerMinorName}
            className="card col-md-5 mb-3 shadow-sm"
          >
            <div className="card-body">
              <h5 className="card-title">
                การปรับปรุงดินด้วย{item.fertilizerMinorName}
              </h5>
              <div className="d-flex justify-content-around">
                <h4>คิดเป็น</h4>
                <h4>อัตราเฉลี่ยต่อไร่</h4>
              </div>
              <div className="d-flex justify-content-around">
                <h2 className="text-primary">{item.useRatePercent}%</h2>
                <h2 className="text-primary">
                  {' '}
                  {item.useRatePerRai} {item.unitName}
                </h2>
              </div>
            </div>
          </div>
        ))}

        {/* <div className="card col-md-4 mb-3 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">การปรับปรุงดินด้วยปูนขาว</h5>
            <div className="d-flex justify-content-around">
              <h4>คิดเป็น</h4>
              <h4>อัตราเฉลี่ยต่อไร่</h4>
            </div>
            <div className="d-flex justify-content-around">
              <h2 className="text-primary">
                {dashboardData.soilImprovement.lime.percentage}%
              </h2>
              <h2 className="text-primary">
                {' '}
                {dashboardData.soilImprovement.lime.averageRate} กก.
              </h2>
            </div>
          </div>
        </div> */}
        {/* <div className="card col-md-4 mb-3 shadow-sm mx-1">
          <div className="card-body">
            <h5 className="card-title">การปรับปรุงดินด้วยกาหม้อกรอง</h5>
            <div className="d-flex justify-content-around">
              <h4>คิดเป็น</h4>
              <h4>อัตราเฉลี่ยต่อไร่</h4>
            </div>
            <div className="d-flex justify-content-around">
              <h2 className="text-primary">
                {dashboardData.soilImprovement.filterCake.percentage}%
              </h2>
              <h2 className="text-primary">
                {' '}
                {dashboardData.soilImprovement.filterCake.averageRate} ตัน
              </h2>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Dashboard;
