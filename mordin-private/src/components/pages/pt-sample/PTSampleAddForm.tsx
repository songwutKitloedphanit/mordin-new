import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormText1 } from '../../../components/gui/GuiForm';
import { createStandard } from '../../../services/api/standard-sample/StandardAPI';
import { LaboratoryInfoInterface } from '../../../types/Laboratory';
import { StandardInput } from '../../../types/standard-sample/standard';

export interface PTSampleAddFormProps {
  selectedLabs: LaboratoryInfoInterface[];
  onCancel: () => void;
  onSuccess: () => void;
}

const PTSampleAddForm: React.FC<PTSampleAddFormProps> = ({
  selectedLabs,
  onCancel,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<StandardInput>({
    standardName: '',
    standardCertificates: [],
  });
  const [errors, setErrors] = useState<{ standardName?: string }>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    //console.log('[AddForm] initializing certificates for labs:', selectedLabs);
    const initCert = selectedLabs.map(l => ({
      laboratoryId: l.laboratoryId,
      certificateValue: 0,
    }));
    setFormData(fd => ({ ...fd, standardCertificates: initCert }));
    setIsReady(true);
  }, [selectedLabs]);

  const onChange = <K extends keyof StandardInput>(
    field: K,
    value: StandardInput[K]
  ) => {
    setFormData(fd => ({ ...fd, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const updateValue = (labId: number, val: number) => {
    //console.log(`[AddForm] updateValue labId=${labId} val=${val}`);
    setFormData(fd => ({
      ...fd,
      standardCertificates: fd.standardCertificates.map(c =>
        c.laboratoryId === labId ? { ...c, certificateValue: val } : c
      ),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    //console.log('[AddForm] submit formData:', formData);
    if (!formData.standardName.trim()) {
      setErrors({ standardName: 'กรุณาระบุชื่อมาตรฐาน' });
      return;
    }
    try {
      await createStandard(formData);
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'เพิ่ม Standard เรียบร้อยแล้ว',
        timer: 2000,
        timerProgressBar: true,
      });
      onSuccess();
    } catch (err) {
      console.error('[AddForm] createStandard error:', err);
      Swal.fire({
        icon: 'error',
        title: 'ผิดพลาด',
        text: 'ไม่สามารถบันทึกได้ กรุณาลองใหม่',
      });
    }
  };

  if (!isReady) {
    return <p>กำลังเตรียมข้อมูล...</p>;
  }

  return (
    <form onSubmit={submit}>
      <div className="private-card">
        <div className="private-card-header d-flex justify-content-between align-items-center">
          <h4 className="private-card-title mb-0">เพิ่มค่า Standard</h4>
          <GenButtonCircle
            color="btn-primary"
            icon="fa fa-clipboard-list"
            link="/admin/standard"
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
              onChange={e => onChange('standardName', e.target.value)}
              errorMessage={errors.standardName}
            />
          </div>
          <h5 className="mt-4">ตารางบันทึกผลการทดลอง</h5>
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
                // optional chaining + default
                const cert = formData.standardCertificates.find(
                  c => c.laboratoryId === lab.laboratoryId
                );
                if (!cert) {
                  console.warn('[AddForm] missing cert for lab:', lab);
                }
                return (
                  <tr key={lab.laboratoryId}>
                    <td>{lab.name}</td>
                    <td>
                      {lab.shortNameAfter}
                      {lab.unitAfter && ` (${lab.unitAfter})`}
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={cert?.certificateValue ?? 0}
                        onChange={e =>
                          updateValue(lab.laboratoryId, +e.target.value)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="private-card-footer d-flex">
          <button type="submit" className="btn btn-success">
            บันทึก
          </button>
          <button
            type="button"
            className="btn btn-danger ms-auto"
            onClick={() => setShowConfirm(true)}
          >
            ยกเลิก
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmAlert
          title="ยืนยันการยกเลิก"
          text="คุณต้องการออกโดยไม่บันทึกหรือไม่?"
          action="cancel"
          onConfirm={onCancel}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </form>
  );
};

export default PTSampleAddForm;
