import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormText1 } from '../../../components/gui/GuiForm';
import {
  getStandardById,
  updateStandard,
} from '../../../services/api/standard-sample/StandardAPI';
import { LaboratoryInfoInterface } from '../../../types/Laboratory';
import { StandardInput } from '../../../types/standard-sample/standard';
import { StandardCertificate } from '../../../types/standard-sample/standardCertificate';
const PTSampleEdit: React.FC = () => {
  const navigate = useNavigate();
  const { standardId } = useParams<{ standardId: string }>();
  const id = parseInt(standardId || '0', 10);

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedLabs, setSelectedLabs] = useState<LaboratoryInfoInterface[]>(
    []
  );
  const [formData, setFormData] = useState<StandardInput>({
    standardName: '',
    standardCertificates: [],
  });
  const [errors, setErrors] = useState<Partial<Record<'standardName', string>>>(
    {}
  );
  const [showConfirm, setShowConfirm] = useState<'cancel' | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getStandardById(id);
        setFormData({
          standardName: data.standardName,
          standardCertificates: data.standardCertificates.map(
            (c: StandardCertificate) => ({
              laboratoryId: c.laboratoryId,
              certificateValue: c.certificateValue,
            })
          ),
        });
        setSelectedLabs(
          data.standardCertificates.map(
            (c: StandardCertificate) => c.laboratory
          )
        );
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'โหลดข้อมูลไม่สำเร็จ',
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id, navigate]);

  const onChangeField = <K extends keyof StandardInput>(
    field: K,
    value: StandardInput[K]
  ) => {
    setFormData(p => ({ ...p, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const updateCertificateValue = (labId: number, value: number) => {
    setFormData(p => ({
      ...p,
      standardCertificates: p.standardCertificates.map(c =>
        c.laboratoryId === labId ? { ...c, certificateValue: value } : c
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.standardName.trim()) {
      setErrors({ standardName: 'กรุณาระบุชื่อมาตรฐาน' });
      return;
    }
    try {
      await updateStandard(id, formData);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'แก้ไข Standard เรียบร้อยแล้ว',
        timer: 2000,
        timerProgressBar: true,
      });
      navigate('/admin/standard');
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'ผิดพลาด',
        text: 'ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  if (loading) return <p>กำลังโหลดข้อมูล...</p>;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="private-card">
          <div className="private-card-header d-flex justify-content-between align-items-center">
            <h4 className="private-card-title mb-0">แก้ไขค่า Standard</h4>
            <GenButtonCircle
              color={B_LIST.list.color}
              icon={B_LIST.list.icon}
              onClick={() => navigate('/admin/standard')}
            />
          </div>
          <div className="private-card-body">
            <div className="col-md-6 mx-auto">
              <GenFormText1
                isRequired
                id="standardName"
                name="standardName"
                label="ชื่อ Standard"
                placeholder="กรอกชื่อ"
                value={formData.standardName}
                onChange={e => onChangeField('standardName', e.target.value)}
                errorMessage={errors.standardName}
              />
            </div>

            <h4 className="private-card-title mt-4 mb-0">
              ตารางบันทึกผลการทดลอง
            </h4>
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Lab Name</th>
                  <th>Parameter</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {selectedLabs.map(lab => {
                  const cert = formData.standardCertificates.find(
                    c => c.laboratoryId === lab.laboratoryId
                  );
                  return (
                    <tr key={lab.laboratoryId}>
                      <td>{lab.name}</td>
                      <td>
                        {lab.shortNameAfter}{' '}
                        {lab.unitAfter && `(${lab.unitAfter})`}
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={cert?.certificateValue ?? 0}
                          onChange={e =>
                            updateCertificateValue(
                              lab.laboratoryId,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="private-action-footer d-flex justify-content-between mt-4">
              <button type="submit" className="btn btn-success">
                บันทึก
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowConfirm('cancel')}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </form>

      {showConfirm === 'cancel' && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการออกโดยไม่บันทึกหรือไม่?"
          action="cancel"
          onConfirm={() => navigate(-1)}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default PTSampleEdit;
