import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import ConfirmAlert from '../../../components/gui/ConfirmAlert';
import { B_LIST, GenButtonCircle } from '../../../components/gui/GuiButton';
import { GenFormSelect } from '../../../components/gui/GuiForm';
import { getFertilizerMajors } from '../../../services/api/fertilizer/FertilizerMajorApi';
import { updateFertilizerMajorUsages } from '../../../services/api/fertilizer/ServiceFertilizerMajorUsageApi';
import { getServiceCategoryById } from '../../../services/api/service-type/ServiceCategoriesApi';
import { FertilizerMajor } from '../../../types/fertilizer/FertilizerMajor';
import {
  ServiceFertilizerMajorUsageInput,
  ServiceFertilizerMajorUsageInfo,
} from '../../../types/fertilizer/ServiceFertilizerMajor';

import FertilizerUsagesSummaryCard from '@/components/pages/fertilizer-usages/FertilizerUsagesSummaryCard';
import { ServiceCategoryInfo } from '@/types/service-type/ServiceCategories';

type FertilizerRow = {
  kg?: number;
  bags?: number | null;
  price: number;
  fertilizer_id?: number;
  formular?: string;
  N?: number;
  P?: number;
  K?: number;
  unit?: string;
  quantity?: number;
  note?: string;
  type: string;
  serviceFertilizerMajorUsageId?: number | null;
};

interface FertilizerTableProps {
  data: FertilizerRow[];
  gradeName: string;
  textColor: string;
  uniqueUsageTypes: string[];
}

interface FertilizerRowProps {
  grade: string;
  fertilizerType: string;
  textColor: string;
  data: FertilizerRow[];
  onChange: (grade: string, type: string, field: string, value: string) => void;
}

const FertilizerTable = ({
  data,
  gradeName,
  textColor,
  uniqueUsageTypes,
}: FertilizerTableProps) => {
  const typeMap = useMemo(() => {
    return uniqueUsageTypes.reduce(
      (map, type) => {
        map[type] = type;
        return map;
      },
      { total: 'รวม' } as Record<string, string>
    );
  }, [uniqueUsageTypes]);

  return (
    <table
      className="table table-bordered table-sm small"
      style={{ fontSize: '0.8rem' }}
    >
      <tbody>
        <tr>
          <th colSpan={7} style={{ textAlign: 'center' }}>
            เกรดดิน <span className={textColor}>{gradeName}</span>
          </th>
        </tr>
        <tr>
          <th>ประเภท</th>
          <th>สูตรปุ๋ย</th>
          <th>กก.</th>
          <th>N</th>
          <th>P</th>
          <th>K</th>
          <th>ราคา</th>
        </tr>
        {data.map(row => (
          <tr key={`${gradeName}-${row.type}`}>
            <td align="center">{typeMap[row.type] || row.type}</td>
            <td align="center">{row.formular || '0'}</td>
            <td align="center">{row.kg || '0'}</td>
            <td align="center">{(row.N || 0).toFixed(2)}</td>
            <td align="center">{(row.P || 0).toFixed(2)}</td>
            <td align="center">{(row.K || 0).toFixed(2)}</td>
            <td align="center">{(row.price || 0).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const initialDataTemplate = (type: string): FertilizerRow => ({
  fertilizer_id: 0,
  type: type || 'Unknown', // Ensure type is always set  formular: '',
  N: 0,
  P: 0,
  K: 0,
  unit: 'kg',
  quantity: 0,
  price: 0,
  note: '',
  kg: 0,
  bags: null,
  serviceFertilizerMajorUsageId: null,
});

const initialGradeData = (usageTypes: string[] = []): FertilizerRow[] => [
  ...usageTypes.map(type => initialDataTemplate(type)),
  initialDataTemplate('total'),
];

const FertilizerMajorUsageEdit = () => {
  const [fertilizers, setFertilizers] = useState<FertilizerMajor[]>([]);
  const [serviceCategory, setServiceCategory] = useState<ServiceCategoryInfo>(
    {} as ServiceCategoryInfo
  );
  const [showConfirm, setShowConfirm] = useState<null | {
    type: 'delete' | 'cancel';
    index?: number;
  }>(null);
  const { id: serviceCategoryId } = useParams();
  console.log('serviceCategoryId:', serviceCategoryId);
  const [gradeData, setGradeData] = useState<Record<string, FertilizerRow[]>>(
    {}
  );
  const [uniqueUsageTypes, setUniqueUsageTypes] = useState<string[]>([]);
  const [uniqueSoilGradeLevels, setUniqueSoilGradeLevels] = useState<string[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fertilizerData = await getFertilizerMajors({ all: true });
        setFertilizers(fertilizerData.data);

        const id = serviceCategoryId ? Number(serviceCategoryId) : undefined;
        if (id === undefined) {
          console.error('serviceCategoryId is undefined');
          return;
        }
        const category = await getServiceCategoryById(id);
        setServiceCategory(category);
        console.log('category:', category);

        const usages: ServiceFertilizerMajorUsageInfo[] =
          category?.serviceFertilizerMajorUsages || [];
        console.log('usages:', usages);
        const uniqueUsageTypes = [
          ...new Set(usages.map(u => u.usageType.name)),
        ];
        const uniqueSoilGradeLevels = [
          ...new Set(usages.map(u => u.soilGradeLevel.scoreName)),
        ];
        setUniqueUsageTypes(
          uniqueUsageTypes.length > 0
            ? uniqueUsageTypes
            : ['ปุ๋ยรองพื้น', 'ปุ๋บแต่งหน้า', 'ปุ๋ยเพิ่มผลผลิต']
        );
        setUniqueSoilGradeLevels(
          uniqueSoilGradeLevels.length > 0
            ? uniqueSoilGradeLevels
            : ['ต่ำ', 'ปานกลาง']
        );
        console.log('Unique Usage Types:', uniqueUsageTypes);
        console.log('Unique Soil Grade Levels:', uniqueSoilGradeLevels);

        const mapUsageToRow = (
          usage: ServiceFertilizerMajorUsageInfo
        ): FertilizerRow => {
          const fertilizer = usage.fertilizerMajor;
          if (!usage.fertilizerMajor) {
            console.warn(
              'fertilizerMajor is null or undefined for usage:',
              usage
            );
            return {
              ...initialDataTemplate(usage.usageType.name || 'Unknown'),
              serviceFertilizerMajorUsageId:
                usage.serviceFertilizerMajorUsageId ?? null,
              bags: Number(usage.volume),
              fertilizer_id: usage.fertilizerMajorId ?? 0,
            };
          }
          const bags = Number(usage.volume) || 1;
          const kg = fertilizer.quantity
            ? bags * fertilizer.quantity
            : bags * 50;
          const { N, P, K } = calculateNPK(fertilizer, bags);
          const price = calculatePrice(fertilizer.price, bags);
          return {
            fertilizer_id: fertilizer.fertilizerMajorId,
            type: usage.usageType.name || 'Unknown',
            formular: fertilizer.formular || '',
            N,
            P,
            K,
            unit: 'kg',
            quantity: fertilizer.quantity || 0,
            price,
            note: fertilizer.note || '',
            kg,
            bags: usage.volume,
            serviceFertilizerMajorUsageId:
              usage.serviceFertilizerMajorUsageId ?? null,
          };
        };

        const initializeGradeData = (
          usages: ServiceFertilizerMajorUsageInfo[],
          usageTypes: string[] = uniqueUsageTypes
        ): FertilizerRow[] => {
          const baseData = initialGradeData(usageTypes);
          usageTypes.forEach((type, index) => {
            if (!baseData[index] || baseData[index].type !== type) {
              baseData[index] = initialDataTemplate(type);
            }
          });
          usages.forEach(usage => {
            const index = baseData.findIndex(
              item => item.type === usage.usageType.name
            );
            if (index !== -1) {
              baseData[index] = mapUsageToRow(usage);
            }
          });

          const regularItems = baseData.filter(item => item.type !== 'total');
          const totalNPK = regularItems.reduce(
            (acc, item) => ({
              N: (acc.N || 0) + (item.N || 0),
              P: (acc.P || 0) + (item.P || 0),
              K: (acc.K || 0) + (item.K || 0),
              price: acc.price + (item.price || 0),
            }),
            { N: 0, P: 0, K: 0, price: 0 }
          );

          const totalIndex = baseData.findIndex(item => item.type === 'total');
          if (totalIndex !== -1) {
            baseData[totalIndex] = {
              ...baseData[totalIndex],
              ...totalNPK,
              kg: regularItems.reduce(
                (sum, item) => sum + (Number(item.kg) || 0),
                0
              ),
            };
          }

          return baseData;
        };

        const newGradeData: Record<string, FertilizerRow[]> = {};
        uniqueSoilGradeLevels.forEach(grade => {
          const filteredUsages = usages.filter(
            (u: ServiceFertilizerMajorUsageInfo) =>
              u.soilGradeLevel.scoreName === grade
          );
          newGradeData[grade] = initializeGradeData(filteredUsages);
        });
        setGradeData(newGradeData);
        console.log('Initialized gradeData:', newGradeData);

        uniqueSoilGradeLevels.forEach(grade => {
          console.log(
            `Data for Soil Grade Level "${grade}":`,
            newGradeData[grade]
          );
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [serviceCategoryId]);

  const fertilizerOptions = useMemo(
    () =>
      fertilizers.map(f => ({
        name: f.formular,
        value: f.fertilizerMajorId,
      })),
    [fertilizers]
  );

  const calculateNPK = (data: FertilizerMajor, bags: number) => {
    console.log('cal n p k', data);

    const safeMultiply = (value: number) => {
      const num = Number(value);
      return isNaN(num) ? 0 : num * 0.5 * bags;
    };
    return {
      N: safeMultiply(data.N),
      P: safeMultiply(data.P),
      K: safeMultiply(data.K),
    };
  };

  const calculatePrice = (pricePerBag: number, bags: number) => {
    return pricePerBag * bags;
  };

  const updateDataWithTotal = (
    data: FertilizerRow[],
    index: number,
    updatedItem: FertilizerRow
  ) => {
    const newData = [...data];
    newData[index] = updatedItem;

    const regularItems = newData.filter(item => item.type !== 'total');
    const totalNPK = regularItems.reduce(
      (acc, item) => ({
        N: (acc.N || 0) + (item.N || 0),
        P: (acc.P || 0) + (item.P || 0),
        K: (acc.K || 0) + (item.K || 0),
        price: acc.price + (item.price || 0),
      }),
      { N: 0, P: 0, K: 0, price: 0 }
    );

    const totalIndex = newData.findIndex(item => item.type === 'total');
    if (totalIndex !== -1) {
      newData[totalIndex] = {
        ...newData[totalIndex],
        ...totalNPK,
        kg: regularItems.reduce((sum, item) => sum + (Number(item.kg) || 0), 0),
      };
    }

    return newData;
  };

  const handleChange = (
    grade: string,
    type: string,
    field: string,
    id: string
  ) => {
    const fertilizerData = fertilizers.find(
      f => f.fertilizerMajorId === Number(id)
    );

    setGradeData(prev => {
      const gradeItems = prev[grade] || initialGradeData(uniqueUsageTypes);
      const index = gradeItems.findIndex(item => item.type === type);
      if (index === -1) return prev;

      const item = gradeItems[index];
      if (item.type === 'total') return prev;

      if (field === 'formular' && fertilizerData) {
        // If bags is null, undefined, or empty, default to 1 when selecting a fertilizer
        const defaultBags = Number(item.bags) | 1;
        const { N, P, K } = calculateNPK(fertilizerData, defaultBags);
        const price = calculatePrice(fertilizerData.price, defaultBags);
        const kg = fertilizerData.quantity
          ? defaultBags * fertilizerData.quantity
          : defaultBags * 50;

        const updatedItem = {
          ...item,
          formular: fertilizerData.formular,
          fertilizer_id: fertilizerData.fertilizerMajorId,
          bags: defaultBags, // Set to '1' if defaultBags was set to 1
          N,
          P,
          K,
          price,
          kg,
          quantity: fertilizerData.quantity || 0,
        };

        return {
          ...prev,
          [grade]: updateDataWithTotal(gradeItems, index, updatedItem),
        };
      }

      if (field === 'bags') {
        const bags = id === '' ? null : Number(id) || 0; // เก็บเป็น null ถ้าผู้ใช้ลบค่า

        let fertilizerDataLocal = fertilizers.find(
          f => f.fertilizerMajorId === item.fertilizer_id
        );
        if (!fertilizerDataLocal && fertilizers.length > 0) {
          fertilizerDataLocal = fertilizers[0];
        }

        if (!fertilizerDataLocal) return prev;

        const { N, P, K } = calculateNPK(fertilizerDataLocal, bags || 0);
        const price = calculatePrice(fertilizerDataLocal.price, bags || 0);
        const kg = fertilizerDataLocal.quantity
          ? (bags || 0) * fertilizerDataLocal.quantity
          : (bags || 0) * 50;

        const updatedItem = {
          ...item,
          bags,
          fertilizer_id: fertilizerDataLocal.fertilizerMajorId,
          formular: fertilizerDataLocal.formular,
          N,
          P,
          K,
          price,
          kg,
          quantity: fertilizerDataLocal.quantity || 0,
        };

        return {
          ...prev,
          [grade]: updateDataWithTotal(gradeItems, index, updatedItem),
        };
      }

      const updatedItem = { ...item, [field]: id };
      return {
        ...prev,
        [grade]: updateDataWithTotal(gradeItems, index, updatedItem),
      };
    });
  };

  const FertilizerRowComponent = ({
    grade,
    fertilizerType,
    textColor,
    data,
    onChange,
  }: FertilizerRowProps) => {
    const item = data.find(item => item.type === fertilizerType);
    if (!item) return null;

    return (
      <div className="row" key={`${grade}-${fertilizerType}`}>
        <div className="col-md-4 col-lg-4">
          <div className="form-group">
            <label>
              {fertilizerType} ดินเกรด{' '}
              <span className={textColor}>{grade}</span>
            </label>
          </div>
        </div>
        <div className="col-md-4 col-lg-4">
          <GenFormSelect
            isRequired={true}
            id={`${grade}-${fertilizerType}`}
            name="fertilizer"
            label=""
            options={fertilizerOptions}
            value={item.fertilizer_id?.toString() || '0'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onChange(grade, fertilizerType, 'formular', e.target.value)
            }
            disabled={fertilizerType === 'total'}
          />
        </div>
        <div
          className="col-md-4 col-lg-4"
          style={{ justifyContent: 'center', alignContent: 'center' }}
        >
          <input
            className="form-control"
            type="number"
            min="0"
            value={
              item.bags !== null && item.bags !== undefined
                ? Number(item.bags) || ''
                : ''
            }
            onChange={e =>
              onChange(grade, fertilizerType, 'bags', e.target.value)
            }
            placeholder="ระบุจำนวนกระสอบ"
            disabled={fertilizerType === 'total'}
          />
        </div>
      </div>
    );
  };

  const renderFertilizerRows = () => (
    <>
      {uniqueUsageTypes.map(type => (
        <React.Fragment key={type}>
          {uniqueSoilGradeLevels.map((grade, index) => {
            const textColor =
              index % 3 === 0
                ? 'text-danger'
                : index % 3 === 1
                  ? 'text-warning'
                  : 'text-success';
            return (
              <FertilizerRowComponent
                key={`${grade}-${type}`}
                grade={grade}
                fertilizerType={type}
                textColor={textColor}
                data={gradeData[grade] || initialGradeData(uniqueUsageTypes)}
                onChange={handleChange}
              />
            );
          })}
          <hr className="my-3" />
        </React.Fragment>
      ))}
    </>
  );

  const navigate = useNavigate();

  const handleSubmit = async () => {
    console.log(gradeData);
    try {
      const convert = (
        data: FertilizerRow[]
      ): ServiceFertilizerMajorUsageInput[] => {
        return data
          .filter(item => item.type !== 'total' && item.fertilizer_id !== 0)
          .map(item => ({
            serviceFertilizerMajorUsageId:
              item.serviceFertilizerMajorUsageId ?? null,
            fertilizerMajorId: item.fertilizer_id ?? null,
            volume: Number(item.bags) || null,
          }));
      };

      const usages: ServiceFertilizerMajorUsageInput[] =
        Object.values(gradeData).flatMap(convert);
      console.log('Latest Fertilizer Usage Data to be sent:', usages);
      await updateFertilizerMajorUsages(usages);
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'แก้ไขข้อมูลการใช้ปุ๋ยหลักเรียบร้อยแล้ว',
        icon: 'success',
        timer: 2000,
        confirmButtonText: 'ตกลง',
        timerProgressBar: true,
      }).then(() => {
        navigate('/admin/fertilizer-usages');
      });
    } catch (error) {
      console.error('Error update service fertilizer major usage:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถแก้ไขข้อมูลการใช้ปุ๋ยหลักได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      throw error;
    }
  };

  return (
    <>
      <div className="container-fluid">
        {/* Card Summary */}
        <FertilizerUsagesSummaryCard />

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  {serviceCategory ? (
                    <h4 className="card-title mb-0">
                      การให้ธาตุอาหารหลัก (
                      {serviceCategory.serviceType?.name ||
                        'Unknown Service Type'}{' '}
                      - {serviceCategory.name || 'Unknown Category'})
                    </h4>
                  ) : (
                    <h4 className="card-title mb-0">
                      การให้ธาตุอาหารหลัก (Loading...)
                    </h4>
                  )}
                  <GenButtonCircle
                    icon={B_LIST.list.icon}
                    color={B_LIST.list.color}
                    link="/admin/fertilizer-usages"
                  />
                </div>
              </div>
              <div className="card-body">
                <div className="col-md-12 mx-auto">
                  {renderFertilizerRows()}
                </div>
              </div>
              <div className="card-footer d-flex justify-content-between">
                <button
                  type="submit"
                  className="btn btn-success mt-3 mb-3"
                  style={{ width: '120px' }}
                  onClick={handleSubmit}
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  className="btn btn-danger mt-3 mb-3"
                  style={{ width: '120px' }}
                  onClick={() => setShowConfirm({ type: 'cancel' })}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  ปริมาณธาตุอาหารที่ได้รับ/ราคา
                </h5>
              </div>
              <div className="card-body overflow-auto">
                {uniqueSoilGradeLevels.map((grade, index) => {
                  const textColor =
                    index % 3 === 0
                      ? 'text-danger'
                      : index % 3 === 1
                        ? 'text-warning'
                        : 'text-success';
                  return (
                    <React.Fragment key={grade}>
                      <FertilizerTable
                        data={
                          gradeData[grade] || initialGradeData(uniqueUsageTypes)
                        }
                        gradeName={grade}
                        textColor={textColor}
                        uniqueUsageTypes={uniqueUsageTypes}
                      />

                      <div className="my-3" />
                    </React.Fragment>
                  );
                })}
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
              // Handle delete logic
            } else if (showConfirm.type === 'cancel') {
              navigate('/admin/fertilizer-usages');
            }
            setShowConfirm(null);
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </>
  );
};

export default FertilizerMajorUsageEdit;
