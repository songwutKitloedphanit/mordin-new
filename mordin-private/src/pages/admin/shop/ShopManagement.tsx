import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '@/components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '@/components/gui/GuiButton';
import SearchAndPaginationTable from '@/components/gui/SearchAndPaginationTable';
import LeafletMap, { MapMarkerData } from '@/components/map/LeafletMap';
import {
  getAllShops,
  getShopSummary,
  deleteShop as apiDeleteShop,
} from '@/services/api/ShopApi';
import { Shop, ShopSummary } from '@/types/Shop';

const KPI_CONFIG = [
  {
    key: 'totalShops' as keyof ShopSummary,
    label: 'ร้านค้าทั้งหมด',
    icon: 'fas fa-store',
    accent: '#31CE36',
    unit: 'ร้าน',
  },
];

interface RawShop {
  shopId: number;
  name: string;
  phone: string;
  ownerName: string;
  subdistrict?: {
    nameTh?: string;
    district?: { nameTh?: string; province?: { nameTh?: string } };
  };
  zipCode?: number;
  updatedAt: number;
  googleMapUrl?: string;
  latitude?: number | string;
  longitude?: number | string;
  facebook?: string;
  lineId?: string;
  imageUrl?: string;
}

const mapShop = (item: RawShop): Shop => ({
  id: item.shopId,
  name: item.name,
  phone: item.phone,
  owner: item.ownerName,
  subdistrict: item.subdistrict?.nameTh || '-',
  zipcode: item.zipCode?.toString() || '-',
  updatedAt: item.updatedAt
    ? new Date(Number(item.updatedAt)).toLocaleDateString('th-TH')
    : '-',
  shopAddress: item.googleMapUrl || '',
  province: item.subdistrict?.district?.province?.nameTh || '-',
  district: item.subdistrict?.district?.nameTh || '-',
  latitude: item.latitude ? Number(item.latitude) : 0,
  longitude: item.longitude ? Number(item.longitude) : 0,
  facebook: item.facebook,
  line: item.lineId,
  images: item.imageUrl,
});

const hasValidCoordinate = (lat?: number | string, lng?: number | string) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  return (
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    parsedLat !== 0 &&
    parsedLng !== 0
  );
};

const ShopManagement = () => {
  const [summary, setSummary] = useState<ShopSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [shopMarkers, setShopMarkers] = useState<MapMarkerData[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSummaryLoading(true);
    getShopSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [refreshKey]);

  useEffect(() => {
    getAllShops()
      .then((raw: RawShop[]) =>
        setShopMarkers(
          raw
            .filter(s => hasValidCoordinate(s.latitude, s.longitude))
            .map(s => ({
              id: s.shopId,
              lat: Number(s.latitude),
              lng: Number(s.longitude),
              title: s.name,
              subtitle: [s.ownerName, s.phone].filter(Boolean).join(' ยท '),
              link: s.googleMapUrl || undefined,
            }))
        )
      )
      .catch(console.error);
  }, [refreshKey]);

  const fetchShops = useCallback(async () => {
    const raw: RawShop[] = await getAllShops();
    const data: Shop[] = raw.map(mapShop);
    return { data, total: data.length, totalPages: 1 };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteShop(id);
      await Swal.fire('สำเร็จ', 'ลบข้อมูลร้านเรียบร้อยแล้ว', 'success');
      setDeleteTarget(null);
      setRefreshKey(prev => prev + 1);
    } catch (error: unknown) {
      console.error(error);
      const err = error as {
        response?: { data?: { message?: string | string[] } };
      };
      const message = err?.response?.data?.message || 'ไม่สามารถลบข้อมูลได้';
      const errorMessage = Array.isArray(message)
        ? message.join(', ')
        : message;
      await Swal.fire('เกิดข้อผิดพลาด', errorMessage, 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {KPI_CONFIG.map(cfg => {
          const value = summary?.[cfg.key] ?? 0;
          return (
            <div key={cfg.key} className="col-sm-6 col-lg-4">
              {summaryLoading ? (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: '4px solid rgba(128,128,128,0.2)' }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="flex-fill">
                        <div className="placeholder-glow mb-2">
                          <span
                            className="placeholder d-block rounded"
                            style={{ height: 11, width: '55%' }}
                          />
                        </div>
                        <div className="placeholder-glow">
                          <span
                            className="placeholder d-block rounded"
                            style={{ height: 40, width: '45%' }}
                          />
                        </div>
                      </div>
                      <div
                        className="rounded-circle flex-shrink-0"
                        style={{
                          width: 64,
                          height: 64,
                          backgroundColor: 'rgba(128,128,128,0.1)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="private-metric-card h-100"
                  style={{ borderLeft: `4px solid ${cfg.accent}` }}
                >
                  <div className="private-card-body py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div
                          className="text-muted fw-semibold text-uppercase mb-2"
                          style={{
                            fontSize: '0.85rem',
                            letterSpacing: '0.6px',
                          }}
                        >
                          {cfg.label}
                        </div>
                        <div className="d-flex align-items-baseline gap-1">
                          <span
                            className="fw-bold"
                            style={{ fontSize: '3.5rem', lineHeight: 1 }}
                          >
                            {value}
                          </span>
                          <span
                            className="text-muted"
                            style={{ fontSize: '1rem' }}
                          >
                            {cfg.unit}
                          </span>
                        </div>
                      </div>
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 64,
                          height: 64,
                          backgroundColor: `${cfg.accent}1a`,
                        }}
                      >
                        <i
                          className={cfg.icon}
                          style={{ color: cfg.accent, fontSize: '1.8rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Map Card */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-map-marker-alt me-2" />
                ตำแหน่งร้านค้า
              </h4>
            </div>
            <div className="private-card-body">
              <LeafletMap markers={shopMarkers} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="row">
        <div className="col-12">
          <div className="private-card">
            <div className="private-card-header d-flex align-items-center justify-content-between">
              <h4 className="private-card-title mb-0">
                <i className="fas fa-store me-2" />
                จัดการร้านค้า
              </h4>
              <div className="d-flex gap-2">
                <GenButtonCircle
                  color={B_LIST.add.color}
                  icon={B_LIST.add.icon}
                  link="/admin/shop/add"
                />
              </div>
            </div>
            <div className="private-card-body">
              <SearchAndPaginationTable<Shop>
                fetchData={fetchShops}
                initialLimit={10}
                refreshKey={refreshKey}
                clientSideFilters
                columns={[
                  {
                    header: 'ชื่อร้าน',
                    accessor: 'name',
                    sortable: true,
                    sortKey: 'name',
                  },
                  {
                    header: 'เบอร์โทรศัพท์',
                    accessor: 'phone',
                    sortable: true,
                    sortKey: 'phone',
                  },
                  {
                    header: 'เจ้าของ',
                    accessor: 'owner',
                    sortable: true,
                    sortKey: 'owner',
                  },
                  {
                    header: 'จังหวัด',
                    accessor: 'province',
                    sortable: true,
                    sortKey: 'province',
                    filterable: true,
                  },
                  {
                    header: 'อำเภอ',
                    accessor: 'district',
                    sortable: true,
                    sortKey: 'district',
                    filterable: true,
                  },
                  {
                    header: 'ลิงก์',
                    accessor: shop => (
                      <>
                        {shop.line && (
                          <GenButtonCircle
                            color={B_LIST.line.color}
                            icon={B_LIST.line.icon}
                            link={shop.line}
                            isExternal
                          />
                        )}
                        {shop.facebook && (
                          <GenButtonCircle
                            color={B_LIST.fb.color}
                            icon={B_LIST.fb.icon}
                            link={shop.facebook}
                            isExternal
                            className="mx-1"
                          />
                        )}
                        {shop.shopAddress && (
                          <GenButtonCircle
                            color={B_LIST.location.color}
                            icon={B_LIST.location.icon}
                            link={shop.shopAddress}
                            isExternal
                          />
                        )}
                      </>
                    ),
                  },
                  {
                    header: 'จัดการ',
                    accessor: shop => (
                      <>
                        <GenButtonCircle
                          color={B_LIST.edit.color}
                          icon={B_LIST.edit.icon}
                          className="mx-1"
                          link={`/admin/shop/${shop.id}/edit`}
                        />
                        <GenButtonCircle
                          color={B_LIST.del.color}
                          icon={B_LIST.del.icon}
                          onClick={() =>
                            setDeleteTarget({ id: shop.id, name: shop.name })
                          }
                        />
                      </>
                    ),
                  },
                  {
                    header: 'แก้ไขล่าสุด',
                    accessor: shop => shop.updatedAt,
                    sortable: true,
                    sortKey: 'updatedAt',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmAlert
          title="ยืนยันการลบ"
          text={`คุณต้องการลบ ${deleteTarget.name} หรือไม่?`}
          action="delete"
          onConfirm={() => {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};

export default ShopManagement;

