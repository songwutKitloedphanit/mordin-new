import React, { useEffect, useState } from 'react';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { DataTableFilter } from '../../../components/gui/DataTableFilter';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import { deleteBus, getAllBuses } from '../../../services/api/BusApi';
import { Bus } from '../../../types/Bus';
import { TimeStampToDate } from '../../../utils/Date';

import BusSummaryCard from '@/components/pages/bus/BusSummaryCard';

const BusManagement: React.FC = () => {
  // ข้อมูลสำหรับ card
  // const cardData = {
  //   color: 'bg-secondary',
  //   icon: 'fas fa-bus-alt',
  //   name: 'รถให้บริการ (คัน)',
  //   desc: 'จำนวนรถให้บริการทั้งหมด',
  // };

  const [busData, setBusData] = useState<Bus[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [tableReady, setTableReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await getAllBuses();
        console.log('API response:', response);
        setBusData(response || []); // Fallback to empty array if undefined
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลรถ:', error);
        setBusData([]); // Set to empty array on error
      } finally {
        setLoading(false);
        setTableReady(true);
      }
    };
    fetchBuses();
  }, []);

  console.log(busData);

  // // คำนวณสถิติสำหรับ card
  // const totalBuses = busData.length;

  // Handle delete bus
  const handleDelete = async () => {
    if (selectedBusId) {
      try {
        await deleteBus(selectedBusId);
        // วิธีที่ 1: อัปเดต state โดยตรง
        setBusData(busData.filter(bus => bus.busId !== selectedBusId));

        // วิธีที่ 2: หรือใช้ฟังก์ชันรูปแบบ callback เพื่อความแน่นอน
        // setBusData(prevData => prevData.filter(bus => bus.busId !== selectedBusId));
        setShowConfirm(false);
      } catch (error) {
        console.error('Error deleting bus:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <BusSummaryCard />

      {/* Table Section */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <div className="row row-demo-grid">
                <div
                  className="col-md-4 col-sm-6 col-6"
                  style={{ textAlign: 'left' }}
                >
                  <h4 className="card-title">Bus Management</h4>
                </div>
                <div
                  className="col-md-4 col-sm-6 col-6 ms-auto"
                  style={{ textAlign: 'right' }}
                >
                  <GenButtonCircle
                    color={B_LIST.add.color}
                    icon={B_LIST.add.icon}
                    link="/admin/bus/add"
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading || !tableReady ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    id="multi-filter-select"
                    className="display table table-striped table-hover"
                  >
                    <thead>
                      <tr>
                        <th>รหัสรถ</th>
                        <th>ชื่อรถ</th>
                        <th>ทะเบียนรถ</th>
                        <th>พื้นที่ปฏิบัติงาน</th>
                        <th>หมายเหตุ</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tfoot>
                      <tr>
                        <th>รหัสรถ</th>
                        <th>ชื่อรถ</th>
                        <th>ทะเบียนรถ</th>
                        <th>พื้นที่ปฏิบัติงาน</th>
                        <th>หมายเหตุ</th>
                        <th>Management</th>
                        <th>Update</th>
                      </tr>
                    </tfoot>
                    <tbody>
                      {busData.map(bus => (
                        <tr key={bus.busId}>
                          <td>{bus.busNumber}</td>
                          <td>{bus.busName}</td>
                          <td>{bus.licensePlate + ' '}</td>
                          <td>{bus.workingArea}</td>
                          <td>{bus.note}</td>
                          <td className="">
                            <GenButtonCircle
                              color={B_LIST.edit.color}
                              icon={B_LIST.edit.icon}
                              link={`/admin/bus/${bus.busId}/edit`}
                              className="mx-2"
                            />
                            <GenButtonCircle
                              color={B_LIST.del.color}
                              icon={B_LIST.del.icon}
                              onClick={() => {
                                setSelectedBusId(bus.busId);
                                setShowConfirm(true);
                              }}
                            />
                          </td>
                          <td>{TimeStampToDate(bus.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <DataTableFilter
                    tableId="multi-filter-select"
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Alert */}
      {showConfirm && (
        <ConfirmAlert
          title="ต้องการลบข้อมูล?"
          text={`คุณแน่ใจหรือไม่ว่าต้องการลบ ${
            busData.find(bus => bus.busId === selectedBusId)?.busNumber
          }?`}
          action="delete"
          onConfirm={handleDelete}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default BusManagement;
