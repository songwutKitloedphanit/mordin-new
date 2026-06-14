import { GenFormSelect } from '@/components/gui/GuiForm';
import { District, geography, Province, Subdistrict } from '@/types/address';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInfo } from '@/types/service-area/ServiceAreas';
import { ServiceType } from '@/types/service-type/ServiceTypes';

interface SelectedSearch {
  year?: number;
  factoryId?: number;
  serviceAreaId?: number;
  geographyId?: number;
  provinceCode?: number;
  districtCode?: number;
  subdistrictCode?: number;
  typeId?: number;
}

interface FilterLists {
  serviceTypeList?: ServiceType[];
  yearList?: { value: string | number; name: string }[];
  factoryList?: FactoryInfoInterface[];
  serviceAreaList?: ServiceAreaInfo[];
  geographyList?: geography[];
  provinceList?: Province[];
  districtList?: District[];
  subDistrictList?: Subdistrict[];
}

interface FilterHandlers {
  handleChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSelectFactory?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleGeographyChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleProvinceChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDistrictChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTypeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface DashboardFiltersProps {
  lists: FilterLists;
  values: SelectedSearch | undefined;
  handlers: FilterHandlers;
}

const DashboardFilters = ({
  lists,
  values,
  handlers,
}: DashboardFiltersProps) => {
  const {
    serviceTypeList,
    yearList,
    factoryList,
    serviceAreaList,
    geographyList,
    provinceList,
    districtList,
    subDistrictList,
  } = lists;
  const {
    handleChange,
    handleSelectFactory,
    handleGeographyChange,
    handleProvinceChange,
    handleDistrictChange,
    handleTypeChange,
  } = handlers;

  return (
    <div className="row g-3">
      {serviceTypeList && serviceTypeList.length > 0 && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="typeId"
            name="typeId"
            label="ประเภทบริการ"
            value={values?.typeId ?? ''}
            options={[
              { value: '', name: 'ทุกประเภท' },
              ...serviceTypeList.map(t => ({
                value: t.serviceTypeId,
                name: t.name,
              })),
            ]}
            onChange={handleTypeChange}
          />
        </div>
      )}

      {yearList && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="year"
            name="year"
            label="ปีงบประมาณ"
            options={[{ value: '', name: 'ทุกปี' }, ...yearList]}
            value={values?.year ?? ''}
            onChange={handleChange}
          />
        </div>
      )}

      {factoryList && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="factory"
            name="factory"
            label="สังกัดโรงงาน"
            value={values?.factoryId?.toString() ?? ''}
            options={[
              { value: '', name: 'ทุกโรงงาน' },
              ...factoryList.map(factory => ({
                value: factory.factoryId.toString(),
                name: `${factory.name} (${factory.initial})`,
              })),
            ]}
            onChange={handleSelectFactory}
          />
        </div>
      )}

      {serviceAreaList && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="serviceAreaId"
            name="serviceAreaId"
            label="เขตส่งเสริม"
            value={values?.serviceAreaId || ''}
            options={[
              { value: '', name: 'ทุกเขต' },
              ...serviceAreaList.map(servArea => ({
                value: servArea.serviceAreaId,
                name: `เขต ${servArea.code} (${servArea.name})`,
              })),
            ]}
            onChange={handleChange}
          />
        </div>
      )}

      {geographyList && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="geographyId"
            name="geographyId"
            label="ภูมิภาค"
            value={values?.geographyId}
            options={[
              { value: '', name: 'ทั้งหมด' },
              ...geographyList.map(geography => ({
                value: geography.id,
                name: geography.name,
              })),
            ]}
            onChange={handleGeographyChange}
          />
        </div>
      )}

      {provinceList && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="provinceCode"
            name="provinceCode"
            label="จังหวัด"
            value={values?.provinceCode}
            options={[
              { value: '', name: 'ทุกจังหวัด' },
              ...provinceList.map(province => ({
                value: province.code,
                name: province.nameTh,
              })),
            ]}
            onChange={handleProvinceChange}
          />
        </div>
      )}

      {districtList && districtList.length > 0 && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="districtCode"
            name="districtCode"
            label="เขต/อำเภอ"
            value={values?.districtCode}
            options={[
              { value: '', name: 'ทั้งหมด' },
              ...districtList.map(district => ({
                value: district.code,
                name: district.nameTh,
              })),
            ]}
            onChange={handleDistrictChange}
          />
        </div>
      )}

      {subDistrictList && subDistrictList.length > 0 && (
        <div className="col-sm-6 col-lg-3">
          <GenFormSelect
            isRequired={false}
            id="subdistrictCode"
            name="subdistrictCode"
            label="แขวง/ตำบล"
            value={values?.subdistrictCode}
            options={[
              { value: '', name: 'ทั้งหมด' },
              ...subDistrictList.map(subdistrict => ({
                value: subdistrict.code,
                name: subdistrict.nameTh,
              })),
            ]}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
