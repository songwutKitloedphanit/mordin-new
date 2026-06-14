import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormText1,
  GenFormText2,
  GenFormSelect,
} from '../../../components/gui/GuiForm';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { updateBus, getBusById } from '../../../services/api/BusApi';
import { Province } from '../../../types/address';
import { BusInput } from '../../../types/Bus';

import BusSummaryCard from '@/components/pages/bus/BusSummaryCard';

const BusEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provinceList, setProvinceList] = useState<Province[]>([]);

  const [bus, setBus] = useState<BusInput>({
    busNumber: '',
    busName: '',
    licensePlate: '',
    registrationProvinceCode: 0,
    workingArea: '',
    note: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูลจังหวัด
        const provinces = await getAllProvinces();
        setProvinceList(provinces);

        // ดึงข้อมูลรถ
        if (id) {
          const busData = await getBusById(parseInt(id));
          setBus(busData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถโหลดข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        }).then(() => {
          navigate('/admin/bus');
        });
      }
    };

    fetchData();
  }, [id, navigate]);
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);

  const [errors, setErrors] = useState({
    busNumber: '',
    busName: '',
    licensePlate: '',
    workingArea: '',
  });

  const handleSubmit = async () => {
    const newErrors = {
      busNumber: bus.busNumber.trim() === '' ? 'กรุณาระบุรหัสรถ' : '',
      licensePlate: bus.licensePlate.trim() === '' ? 'กรุณาระบุทะเบียนรถ' : '',
      workingArea: bus.workingArea.trim() === '' ? 'กรุณาระบุพื้นที่ทำการ' : '',
      busName: bus.busName.trim() === '' ? 'กรุณาระบุชื่อรถ' : '',
    };

    setErrors(newErrors);

    // ถ้ามี error อย่างน้อย 1 ช่อง ให้หยุด
    const hasError = Object.values(newErrors).some(msg => msg !== '');
    if (hasError) return;

    // ✅ ถ้าไม่มี error ให้แสดงใน console แล้วแสดง Swal
    console.log('🟢 แก้ไขข้อมูลรถ:', {
      ...bus,
      id: parseInt(id || ''),
    });

    if (id) {
      try {
        const response = await updateBus(parseInt(id), bus);
        console.log('update bus:', response.data);
        Swal.fire({
          title: 'สำเร็จ!',
          text: 'แก้ไขข้อมูลรถเรียบร้อยแล้ว',
          icon: 'success',
          timer: 2000,
          confirmButtonText: 'ตกลง',
          timerProgressBar: true,
        }).then(() => {
          navigate('/admin/bus');
        });
      } catch (error) {
        console.error('Error update bus:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถแก้ไขข้อมูลรถได้',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
        throw error;
      }
    }
  };

  return (
    <>
      <div className="row">
        <BusSummaryCard />
        <div className="container mt-2">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <div className="row align-items-center">
                    <div className="col-md-4 col-sm-6 text-start">
                      <h4 className="card-title">
                        แก้ไขข้อมูลรถ({bus.busNumber})
                      </h4>
                    </div>
                    <div className="col-md-4 col-sm-6 text-end ms-auto">
                      <GenButtonCircle
                        color={B_LIST.list.color}
                        icon={B_LIST.list.icon}
                        link="/admin/bus"
                      />
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <div className="col-md-6 mx-auto">
                    <GenFormText1
                      isRequired={true}
                      id="number"
                      name="number"
                      label="รหัสรถ"
                      value={bus.busNumber}
                      placeholder="ระบุรหัสรถ"
                      onChange={e => {
                        setBus({ ...bus, busNumber: e.target.value });
                        setErrors({ ...errors, busNumber: '' }); // clear error เมื่อกรอกใหม่
                      }}
                      errorMessage={errors.busNumber}
                      maxLength={2}
                    />
                    <GenFormText1
                      isRequired={true}
                      id="name"
                      name="name"
                      label="ชื่อรถ"
                      value={bus.busName}
                      placeholder="ระบุชื่อรถ"
                      onChange={e => {
                        setBus({ ...bus, busName: e.target.value });
                        setErrors({ ...errors, busName: '' }); // clear error เมื่อกรอกใหม่
                      }}
                      errorMessage={errors.busName}
                    />
                    <GenFormText2
                      isRequired={true}
                      id="license"
                      name="license"
                      label="ทะเบียนรถ"
                      value={bus.licensePlate}
                      placeholder="ระบุเลขทะเบียนรถ"
                      desc=""
                      onChange={e => {
                        setBus({ ...bus, licensePlate: e.target.value });
                        setErrors({ ...errors, licensePlate: '' });
                      }}
                      errorMessage={errors.licensePlate}
                    />
                    <GenFormSelect
                      isRequired={true}
                      id="registration"
                      name="registration"
                      label="จังหวัดจดทะเบียน"
                      options={provinceList.map(p => ({
                        value: p.code.toString(),
                        name: p.nameTh,
                      }))}
                      value={bus.registrationProvinceCode.toString()}
                      onChange={e => {
                        setBus({
                          ...bus,
                          registrationProvinceCode: parseInt(e.target.value),
                        });
                      }}
                    />
                    <GenFormText1
                      isRequired={true}
                      id="area"
                      name="area"
                      label="พื้นที่ปฏิบัติงาน"
                      value={bus.workingArea}
                      placeholder="ระบุพื้นที่ปฏิบัติงาน"
                      onChange={e => {
                        setBus({ ...bus, workingArea: e.target.value });
                        setErrors({ ...errors, workingArea: '' });
                      }}
                      errorMessage={errors.workingArea}
                    />
                    <GenFormText1
                      isRequired={false}
                      id="note"
                      name="note"
                      label="หมายเหตุ"
                      value={bus.note}
                      placeholder="ระบุหมายเหตุ"
                      onChange={e => {
                        setBus({ ...bus, note: e.target.value });
                      }}
                    />

                    <div className="card-action mt-4 d-flex justify-content-between">
                      <button
                        type="button"
                        className="btn btn-success"
                        style={{ width: '150px' }}
                        onClick={handleSubmit}
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ width: '150px' }}
                        onClick={() => setShowConfirm({ type: 'cancel' })}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title={
            showConfirm.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการยกเลิก'
          }
          text={
            showConfirm.type === 'delete'
              ? 'คุณต้องการลบประเภทการประเมินนี้หรือไม่?'
              : 'คุณต้องการยกเลิกการแก้ไขหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            if (
              showConfirm.type === 'delete' &&
              typeof showConfirm.index === 'number'
            ) {
              /* empty */
            } else if (showConfirm.type === 'cancel') {
              navigate('/admin/bus');
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default BusEdit;
