import { useEffect, useState, useRef } from 'react';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { Shop } from '../../../types/Shop';

import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import ShopSummaryCard from '@/components/pages/shop/ShopSummaryCard';
import { getAllShops, deleteShop as apiDeleteShop } from '@/services/api/ShopApi';
import Swal from 'sweetalert2';

const ShopManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const [deleteShopData, setDeleteShopData] = useState<Shop | null>(null);
  const [shopMarkers, setShopMarkers] = useState<MapMarkerData[]>([]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getAllShops();
      const mappedShops: Shop[] = data.map((item: any) => ({
        id: item.shopId,
        name: item.name,
        phone: item.phone,
        owner: item.ownerName,
        subdistrict: item.subdistrict?.nameTh || '',
        zipcode: item.zipCode?.toString() || '',
        updatedAt: new Date(Number(item.updatedAt)).toLocaleDateString('th-TH'),
        shopAddress: item.googleMapUrl || '',
        province: item.subdistrict?.district?.province?.nameTh || '',
        district: item.subdistrict?.district?.nameTh || '',
        latitude: item.latitude ? Number(item.latitude) : 0,
        longitude: item.longitude ? Number(item.longitude) : 0,
        facebook: item.facebook,
        line: item.lineId,
        images: item.imageUrl
      }));

      setShops(mappedShops);
      setShopMarkers(
        mappedShops
          .filter(s => s.latitude && s.longitude)
          .map(shop => ({
            id: shop.id,
            lat: shop.latitude!,
            lng: shop.longitude!,
          }))
      );
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleDelete = async () => {
    if (!deleteShopData) return;
    try {
      await apiDeleteShop(deleteShopData.id);
      await Swal.fire('สำเร็จ', 'ลบข้อมูลร้านเรียบร้อยแล้ว', 'success');
      // fetchShops();
      setShops(prev => prev.filter(s => s.id !== deleteShopData.id));
    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.message || 'ไม่สามารถลบข้อมูลได้';
      const errorMessage = Array.isArray(message) ? message.join(', ') : message;
      Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
    }
    setDeleteShopData(null);
  };

  const handleCancel = () => {
    setDeleteShopData(null);
  };

  return (
    <>
      {/* Google Maps */}
      <div className="row" ref={mapRef}>
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Shop Location</div>
            </div>
            <div className="card-body">
              <LeafletMap markers={shopMarkers} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Card */}
      <div className="row">
        <ShopSummaryCard />
      </div>

      {/* Shops Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Shop Management</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/shop/add"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <table
                      id="shop-table"
                      className="table table-striped table-hover"
                    >
                      <thead>
                        <tr>
                          <th>ชื่อ</th>
                          <th>เบอร์โทรศัพท์</th>
                          <th>เจ้าของ</th>
                          <th>จังหวัด</th>
                          <th>อำเภอ</th>
                          <th>Link</th>
                          <th>Management</th>
                          <th>Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shops.map(shop => (
                          <tr key={shop.id}>
                            <td>{shop.name}</td>
                            <td>{shop.phone}</td>
                            <td>{shop.owner}</td>
                            <td>{shop.province}</td>
                            <td>{shop.district}</td>
                            <td>
                              {shop.line && (
                                <GenButtonCircle
                                  color={B_LIST.line.color}
                                  icon={B_LIST.line.icon}
                                  link={shop.line}
                                  isExternal={true}
                                />
                              )}
                              {shop.facebook && (
                                <GenButtonCircle
                                  color={B_LIST.fb.color}
                                  icon={B_LIST.fb.icon}
                                  link={shop.facebook}
                                  isExternal={true}
                                />
                              )}
                              {shop.shopAddress && (
                                <GenButtonCircle
                                  color={B_LIST.location.color}
                                  icon={B_LIST.location.icon}
                                  link={shop.shopAddress}
                                  isExternal={true}
                                />
                              )}
                            </td>
                            <td>
                              <GenButtonCircle
                                color={B_LIST.edit.color}
                                icon={B_LIST.edit.icon}
                                link={`/admin/shop/${shop.id}/edit`}
                              />
                              <GenButtonCircle
                                color={B_LIST.del.color}
                                icon={B_LIST.del.icon}
                                onClick={() => setDeleteShopData(shop)}
                              />
                            </td>
                            <td>{shop.updatedAt}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>ชื่อ</th>
                          <th>เบอร์โทรศัพท์</th>
                          <th>เจ้าของ</th>
                          <th>จังหวัด</th>
                          <th>อำเภอ</th>
                          <th>Link</th>
                          <th>Management</th>
                          <th>Update</th>
                        </tr>
                      </tfoot>
                    </table>
                    <DataTableFilter tableId="shop-table" loading={loading} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {deleteShopData && (
        <ConfirmAlert
          title="ต้องการลบข้อมูล?"
          text={`คุณแน่ใจหรือไม่ว่าต้องการลบ ${deleteShopData.name} ?`}
          action="delete"
          onConfirm={() => handleDelete()}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default ShopManagement;
