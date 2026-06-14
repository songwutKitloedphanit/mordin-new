import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { getFarmerById } from '../../../services/api/FarmerApi';
import { getLandById } from '../../../services/api/LandApi';
import { FarmerInfo } from '../../../types/Farmer';
import { LandInfoInterface } from '../../../types/Land';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import LandCard from '@/components/pages/land/LandCard';
import { formatThaiNationalId } from '@/utils/IdentificationNumberFormat';

const LandInfo = () => {
  const { id } = useParams();
  const [lands, setLands] = useState<LandInfoInterface>(
    {} as LandInfoInterface
  );
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<MapMarkerData[]>([]);
  const [farmerInfo, setFarmerInfo] = useState<FarmerInfo>({} as FarmerInfo);

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const data = await getLandById(Number(id));
        setLands(data);

        setLocation([
          {
            id: data.landId,
            lat: Number(data.latitude),
            lng: Number(data.longitude),
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lands:', error);
        setLoading(false);
      }
    };

    fetchLands();
  }, [id]);

  useEffect(() => {
    if (!lands || !lands.farmerId) return;
    const fetchFarmer = async () => {
      try {
        const data = await getFarmerById(Number(lands.farmerId));
        if (!data) {
          setFarmerInfo({} as FarmerInfo);
          return;
        }

        setFarmerInfo(data || {});
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lands:', error);
        setLoading(false);
      }
    };

    fetchFarmer();
  }, [lands, lands.farmerId]);

  // const totalLands = 2;
  // const poorSoilCount = 0;
  // const normalSoilCount = 2;
  // const fertileSoilCount = 0;

  return (
    <>
      {/* Statistics Cards */}
      <div className="row">
        <LandCard />
      </div>

      {/* Farmer and Land Info */}
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-8 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">
                    ข้อมูลเกษตรกร (
                    {farmerInfo.thaiNationalId
                      ? farmerInfo.thaiNationalId
                      : farmerInfo.thaiFarmerId}
                    )
                  </h4>
                </div>
                <div
                  className="col-md-4 col-sm-4 col-4 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/farmer"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color={B_LIST.edit.color}
                    icon={B_LIST.edit.icon}
                    link={`/admin/farmer/${lands.farmerId}/edit`}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="col-md-12 ms-auto me-auto">
                <div className="row p-4">
                  {loading ? (
                    <div className="text-center p-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <table style={{ minHeight: '205px' }}>
                      <tbody>
                        <tr>
                          <th>ประเภทบัตร</th>
                          <td>
                            {farmerInfo.thaiNationalId
                              ? 'บัตรประชาชน'
                              : 'บัตรเกษตรกร'}
                          </td>
                        </tr>
                        <tr>
                          <th>หมายเลขบัตร</th>
                          <td>
                            {farmerInfo.thaiNationalId
                              ? formatThaiNationalId(farmerInfo.thaiNationalId)
                              : farmerInfo.thaiFarmerId || '-'}
                          </td>
                        </tr>
                        <tr>
                          <th>ชื่อ นามสกุล</th>
                          <td>
                            {farmerInfo.firstName} {farmerInfo.lastName}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                        </tr>
                        <tr>
                          <th>โทรศัพท์</th>
                          <td>{farmerInfo.phone}</td>
                        </tr>
                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                        </tr>
                        <tr>
                          <th>โรงงาน</th>
                          <td>{farmerInfo.factory?.name}</td>
                        </tr>
                        <tr>
                          <th>เขตพื้นที่</th>
                          <td>
                            {farmerInfo.serviceArea?.code}{' '}
                            {farmerInfo.serviceArea?.name}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>&nbsp;</td>
                        </tr>
                        <tr>
                          <th>จำนวนแปลงรวม</th>
                          <td>{farmerInfo.landCount} แปลง</td>
                        </tr>
                        <tr>
                          <th>รวมพื้นที่</th>
                          <td>{farmerInfo.landSizeSummary} ไร่</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-8 col-sm-8 col-8"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">ข้อมูลแปลง({lands.name})</h4>
                </div>
                <div
                  className="col-md-4 col-sm-4 col-4 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.list.color}
                    icon={B_LIST.list.icon}
                    link="/admin/land"
                    className="mx-1"
                  />
                  <GenButtonCircle
                    color={B_LIST.edit.color}
                    icon={B_LIST.edit.icon}
                    link={`/admin/land/${lands?.landId}/edit`}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="col-md-12 ms-auto me-auto">
                <div className="row p-4">
                  <table style={{ minHeight: '205px' }}>
                    <tbody>
                      <tr>
                        <th>รหัวโควต้าอ้อย</th>
                        <td>{lands.quotaCode || '-'}</td>
                      </tr>
                      <tr>
                        <th>หมายเลขแปลง</th>
                        <td>{lands.landCode}</td>
                      </tr>
                      <tr>
                        <th>ชื่อแปลง</th>
                        <td>{lands.name}</td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <th>พิกัด</th>
                        <td>
                          {lands.latitude} , {lands.longitude}
                        </td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <th>อำเภอ</th>
                        <td>{lands.subdistrict?.district?.nameTh}</td>
                      </tr>
                      <tr>
                        <th>จังหวัด</th>
                        <td>{lands.subdistrict?.district?.province?.nameTh}</td>
                      </tr>
                      <tr>
                        <th>ที่อยู่</th>
                        <td>
                          {lands.village}
                          ต.{lands.subdistrict?.nameTh}
                          อ.{lands.subdistrict?.district?.nameTh}
                          จ.{lands.subdistrict?.district?.province?.nameTh}
                          {lands.subdistrict?.zipCode.toString()}
                        </td>
                      </tr>
                      <tr>
                        <td>&nbsp;</td>
                      </tr>
                      <tr>
                        <th>รวมพื้นที่</th>
                        <td>{lands.areaSize} ไร่</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">พิกัดแปลง</div>
            </div>
            <div className="card-body">
              <LeafletMap markers={location} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandInfo;
