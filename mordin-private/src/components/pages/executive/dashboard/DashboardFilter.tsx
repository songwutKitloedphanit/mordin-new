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

const FilterItem = ({ children }: { children: React.ReactNode }) => (
  <div style={{ minWidth: 140, maxWidth: 200, flex: '1 1 140px' }}>
    {children}
  </div>
);

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
    <div className="d-flex flex-wrap gap-3 align-items-end">
      {serviceTypeList && serviceTypeList.length > 0 && (
        <FilterItem>
          <GenFormSelect
            isRequired={false}
            id="typeId"
            name="typeId"
            label="ประเภทบริการ"
            value={values?.typeId ?? ''}
            options={serviceTypeList.map(t => ({
              value: t.serviceTypeId,
              name: t.name,
            }))}
            onChange={handleTypeChange}
          />
        </FilterItem>
      )}

      {yearList && (
        <FilterItem>
          <GenFormSelect
            isRequired={false}
            id="year"
            name="year"
            label="ปี"
            options={yearList}
            value={values?.year}
            onChange={handleChange}
          />
        </FilterItem>
      )}

      {factoryList && (
        <FilterItem>
          <GenFormSelect
            isRequired={false}
            id="factory"
            name="factory"
            label="โรงงาน"
            value={values?.factoryId?.toString() ?? ''}
            options={[
              { value: '', name: 'ทั้งหมด' },
              ...factoryList.map(factory => ({
                value: factory.factoryId.toString(),
                name: `${factory.name} (${factory.initial})`,
              })),
            ]}
            onChange={handleSelectFactory}
          />
        </FilterItem>
      )}

      {serviceAreaList && (
        <FilterItem>
          <GenFormSelect
            isRequired={false}
            id="serviceAreaId"
            name="serviceAreaId"
            label="เขตส่งเสริม"
            value={values?.serviceAreaId || ''}
            options={[
              { value: '', name: 'ทั้งหมด' },
              ...serviceAreaList.map(servArea => ({
                value: servArea.serviceAreaId,
                name: `เขต ${servArea.code} (${servArea.name})`,
              })),
            ]}
            onChange={handleChange}
          />
        </FilterItem>
      )}

      {geographyList && (
        <FilterItem>
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
        </FilterItem>
      )}

      {provinceList && (
        <FilterItem>
          <GenFormSelect
            isRequired={false}
            id="provinceCode"
            name="provinceCode"
            label="จังหวัด"
            value={values?.provinceCode}
            options={[
              { value: '', name: 'ทั้งหมด' },
              ...provinceList.map(province => ({
                value: province.code,
                name: province.nameTh,
              })),
            ]}
            onChange={handleProvinceChange}
          />
        </FilterItem>
      )}

      {districtList && districtList.length > 0 && (
        <FilterItem>
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
        </FilterItem>
      )}

      {subDistrictList && subDistrictList.length > 0 && (
        <FilterItem>
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
        </FilterItem>
      )}
    </div>
  );
};

export default DashboardFilters;
