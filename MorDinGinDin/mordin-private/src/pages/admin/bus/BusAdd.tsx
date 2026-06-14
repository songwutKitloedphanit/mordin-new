import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle, B_LIST } from '../../../components/gui/GuiButton';
import {
  GenFormSelect,
  GenFormText1,
  GenFormText2,
} from '../../../components/gui/GuiForm';
import { getAllProvinces } from '../../../services/api/address/ProvinceApi';
import { createBus } from '../../../services/api/BusApi';
import { BusInput } from '../../../types/Bus';

import BusSummaryCard from '@/components/pages/bus/BusSummaryCard';
import { Province } from '@/types/address';

const BusAdd = () => {
  // State for form inputs
  const [bus, setBus] = useState<BusInput>({
    busNumber: '',
    busName: '',
    licensePlate: '',
    registrationProvinceCode: 0,
    workingArea: '',
    note: '',
  });

  const navigate = useNavigate();
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

  const [provinceList, setProvinceList] = useState<Province[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const data = await getAllProvinces();
      setProvinceList(data);

      setBus(prev => ({
        ...prev,
        registrationProvinceCode: data[0]?.code,
      }));
    };
    fetchProvinces();
  }, []);

  const handleSubmit = async () => {
    console.log('bus', bus);
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

    console.log('bus', bus);

    try {
      const response = await createBus(bus);
      console.log('created bus:', response.data);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'เพิ่มข้อมูลรถเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/bus');
      });
    } catch (error) {
      console.error('Error creating bus:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถบันทึกข้อมูลรถได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      throw error;
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
                      <h4 className="card-title">เพิ่มรถคันใหม่</h4>
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
                      isRequired
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
                          registrationProvinceCode: Number(e.target.value),
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
                        เพิ่มรถ
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
              : 'คุณต้องการยกเลิกการเพิ่มรถหรือไม่?'
          }
          action={showConfirm.type}
          onConfirm={() => {
            navigate('/admin/bus');
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default BusAdd;
