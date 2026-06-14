import { GenFormSelect } from '@/components/gui/GuiForm';
import { District, geography, Province, Subdistrict } from '@/types/address';
import { FactoryInfoInterface } from '@/types/service-area/Factories';
import { ServiceAreaInfo } from '@/types/service-area/ServiceAreas';

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
  yearList?: { value: any; name: string }[];
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
  } = handlers;

  return (
    <div className="d-flex justify-content-center">
      {/* Year Filter */}
      {yearList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id={'year'}
            name={'year'}
            label="ปี"
            options={yearList}
            value={values?.year}
            onChange={handleChange}
          />
        </>
      ) : (
        <></>
      )}
      {/* Factory Filter */}
      {factoryList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id="factory"
            name="factory"
            label="โรงงาน"
            value={values?.factoryId?.toString() ?? ''}
            options={[
              { value: '', name: 'All' },
              ...factoryList.map(factory => ({
                value: factory.factoryId.toString(),
                name: `${factory.name} (${factory.initial})`,
              })),
            ]}
            onChange={handleSelectFactory}
          />
        </>
      ) : (
        <></>
      )}
      {/* Service Area Filter */}
      {serviceAreaList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id={'serviceAreaId'}
            name={'serviceAreaId'}
            label="เขตส่งเสริม"
            value={values?.serviceAreaId || ''}
            options={[
              { value: '', name: 'All' },
              ...serviceAreaList.map(servArea => ({
                value: servArea.serviceAreaId,
                name: `เขต ${servArea.code} (${servArea.name})`,
              })),
            ]}
            onChange={handleChange}
          />
        </>
      ) : (
        <></>
      )}
      {/* Geography Filters */}
      {geographyList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id={''}
            name={''}
            label="ภูมิภาค"
            value={values?.geographyId}
            options={[
              { value: '', name: 'All' },
              ...geographyList.map(geography => ({
                value: geography.id,
                name: `${geography.name}`,
              })),
            ]}
            onChange={handleGeographyChange}
          />
        </>
      ) : (
        <></>
      )}

      {/* Province Filters */}
      {provinceList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id={''}
            name={''}
            label="จังหวัด"
            value={values?.provinceCode}
            options={[
              { value: '', name: 'All' },
              ...provinceList.map(province => ({
                value: province.code,
                name: `${province.nameTh}`,
              })),
            ]}
            onChange={handleProvinceChange}
          />
        </>
      ) : (
        <></>
      )}
      {/* District Filters */}
      {districtList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id={'districtCode'}
            name={'districtCode'}
            label="เขต/อำเภอ"
            value={values?.districtCode}
            options={[
              { value: '', name: 'All' },
              ...districtList.map(district => ({
                value: district.code,
                name: `${district.nameTh}`,
              })),
            ]}
            onChange={handleDistrictChange}
          />
        </>
      ) : (
        <></>
      )}
      {/* Subdistrict Filters */}
      {subDistrictList ? (
        <>
          <GenFormSelect
            isRequired={false}
            id={'subdistrictCode'}
            name={'subdistrictCode'}
            label="แขวง/ตำบล"
            value={values?.subdistrictCode}
            options={[
              { value: '', name: 'All' },
              ...subDistrictList.map(subdistrict => ({
                value: subdistrict.code,
                name: `${subdistrict.nameTh}`,
              })),
            ]}
            onChange={handleChange}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default DashboardFilters;
