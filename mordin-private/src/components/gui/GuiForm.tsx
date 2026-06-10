import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../../public/assets/css/marksDateClass.css';
// import { parseISO } from "date-fns";
import {
  ActionMeta,
  GroupBase,
  OptionsOrGroups,
  SingleValue,
} from 'react-select';
import AsyncSelect from 'react-select/async';

// Helper component for rendering the label with optional red asterisk
const FormLabel: React.FC<{ label: string; isRequired: boolean }> = ({
  label,
  isRequired,
}) => (
  <label>
    {isRequired && <span style={{ color: 'red' }}>* </span>}
    {label}
  </label>
);

interface GenFormText1Props {
  isRequired: boolean;
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  remark?: string;
  readOnly?: boolean;
  type?: string;
  maxLength?: number;
  step?: string;
}

export const GenFormText1: React.FC<GenFormText1Props> = ({
  isRequired,
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  errorMessage,
  remark,
  readOnly,
  type = 'text',
  maxLength,
  step,
}) => (
  <div className="row">
    <div className="col-md-12 col-lg-12">
      <div className="form-group">
        <FormLabel label={label} isRequired={isRequired} />
        <input
          className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          required={isRequired}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          maxLength={maxLength}
          step={step}
        />
        {remark !== undefined && (
          <div
            style={{
              width: '100%',
              marginTop: '0.25rem',
              fontSize: '0.875em',
              color: 'var(--bs-form-invalid-color)',
            }}
          >
            {remark}
          </div>
        )}
        {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
      </div>
    </div>
  </div>
);

interface GenFormText2Props {
  isRequired: boolean;
  id: string;
  name: string;
  label: string;
  placeholder: string;
  desc: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
}

export const GenFormText2: React.FC<GenFormText2Props> = ({
  isRequired,
  id,
  name,
  label,
  placeholder,
  desc,
  value,
  onChange,
  errorMessage,
}) => (
  <div className="row">
    <div className="col-md-12 col-lg-12">
      <div className="form-group">
        <FormLabel label={label} isRequired={isRequired} />
        <input
          className={`form-control ${errorMessage ? 'is-invalid' : ''}`}
          type="text"
          id={id}
          name={name}
          placeholder={placeholder}
          required={isRequired}
          value={value}
          onChange={onChange}
        />
        <small className="form-text text-mute">{desc}</small>
        {errorMessage && <div className="invalid-feedback">{errorMessage}</div>}
      </div>
    </div>
  </div>
);

interface GenFormDate1Props {
  isRequired: boolean;
  id: string;
  name: string;
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GenFormDate1: React.FC<GenFormDate1Props> = ({
  isRequired,
  id,
  name,
  label,
  value,
  onChange,
}) => (
  <div className="row">
    <div className="col-md-12 col-lg-12">
      <div className="form-group">
        <FormLabel label={label} isRequired={isRequired} />
        <input
          className="form-control"
          type="date"
          id={id}
          name={name}
          required={isRequired}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  </div>
);

export interface MarkedDateStatus {
  date: string; // yyyy-MM-dd
  status: string;
}

interface GenFormDate2Props {
  isRequired: boolean;
  id: string;
  name: string;
  label: string;
  value?: string;
  desc: string;
  onChange?: (e: string) => void;
  markedDates?: string[]; // แบบเดิม
  markedDatesWithStatus?: MarkedDateStatus[]; // แบบใหม่
  onMonthYearChange?: (year: number, month: number) => void;
}

const DEFAULT_MARKED_DATES: string[] = [];
const DEFAULT_MARKED_DATES_STATUS: MarkedDateStatus[] = [];

export const GenFormDate2: React.FC<GenFormDate2Props> = ({
  isRequired,
  id,
  name,
  label,
  value,
  desc,
  onChange,
  markedDates = DEFAULT_MARKED_DATES,
  markedDatesWithStatus = DEFAULT_MARKED_DATES_STATUS,
  onMonthYearChange,
}) => {
  const selectedDate = value ? new Date(value) : null;

  let highlightDates: { [key: string]: Date[] }[] = [];

  if (markedDatesWithStatus.length > 0) {
    highlightDates = markedDatesWithStatus.reduce(
      (acc, item) => {
        let colorClass = 'react-datepicker__day--completed';

        if (
          item.status === 'not_set' ||
          item.status === 'not_started' ||
          item.status === 'all_available' ||
          item.status === 'none_approved'
        ) {
          colorClass = 'react-datepicker__day--not-started';
        } else if (
          item.status === 'in_progress' ||
          item.status === 'partially_picked' ||
          item.status === 'partially_approved'
        ) {
          colorClass = 'react-datepicker__day--in-progress';
        } else if (item.status === 'no_samples') {
          colorClass = 'react-datepicker__day--no-samples';
        }

        const dateObj = new Date(item.date);

        const existing = acc.find(
          entry => Object.keys(entry)[0] === colorClass
        );
        if (existing) {
          existing[colorClass].push(dateObj);
        } else {
          acc.push({ [colorClass]: [dateObj] });
        }
        return acc;
      },
      [] as { [key: string]: Date[] }[]
    );
  } else if (markedDates.length > 0) {
    // ใช้สีเขียว (completed) เป็น default
    highlightDates = [
      {
        'react-datepicker__day--completed': markedDates.map(d => new Date(d)),
      },
    ];
  }

  //highlight สำหรับวันที่เลือก
  if (selectedDate) {
    highlightDates.push({
      'react-datepicker__day--selected-custom': [selectedDate],
    });
  }

  return (
    <div className="row mt-3 mb-2">
      <div className="col-md-12 col-lg-12">
        <label htmlFor={id}>
          {label} {isRequired && <span className="text-danger">*</span>}
        </label>
        <div>
          <DatePicker
            id={id}
            name={name}
            selected={selectedDate}
            onChange={date => {
              const isoStr = date?.toISOString().split('T')[0] ?? '';
              onChange?.(isoStr);
            }}
            highlightDates={highlightDates}
            className="form-control py-2"
            dateFormat="yyyy-MM-dd"
            onMonthChange={date => {
              const year = date.getFullYear();
              const month = date.getMonth() + 1;
              onMonthYearChange?.(year, month);
            }}
            onYearChange={date => {
              const year = date.getFullYear();
              const month = date.getMonth() + 1;
              onMonthYearChange?.(year, month);
            }}
          />
        </div>

        <small className="form-text text-muted">{desc}</small>
      </div>
    </div>
  );
};

interface GenFormSelectProps {
  isRequired: boolean;
  id: string;
  name: string;
  label?: string;
  options: { value: string | number; name: string }[];
  value?: string | number | null;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface GenFormSelectProps {
  isRequired: boolean;
  id: string;
  name: string;
  label?: string;
  options: { value: string | number; name: string }[];
  value?: string | number | null;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  emptyMessage?: string; // ยังคงมี option นี้ไว้สำหรับกรณีต้องการกำหนดข้อความเฉพาะ
  disabled?: boolean; // เพิ่มคุณสมบัติ disabled สำหรับการปิดใช้งาน select
}

export const GenFormSelect: React.FC<GenFormSelectProps> = ({
  isRequired,
  id,
  name,
  label,
  options,
  value,
  onChange,
  emptyMessage,
  disabled,
}) => {
  // ตรวจสอบว่ามี options หรือไม่
  const hasOptions = options && options.length > 0;

  // สร้างข้อความเมื่อไม่มีข้อมูล
  const noDataMessage = emptyMessage
    ? emptyMessage
    : `ไม่มีข้อมูล${label ? `${label}` : ''}`;

  return (
    <div className="row">
      <div className="col-md-12 col-lg-12">
        <div className="form-group">
          {label && <FormLabel label={label} isRequired={isRequired} />}
          <select
            className="form-select"
            id={id}
            name={name}
            required={isRequired}
            value={value || ''}
            onChange={onChange}
            disabled={disabled || !hasOptions} // ใช้ disabled จาก prop หรือเมื่อไม่มี options
          >
            {hasOptions ? (
              options.map(item => (
                <option key={`${item.value}-${item.name}`} value={item.value}>
                  {item.name}
                </option>
              ))
            ) : (
              <option value="">{noDataMessage}</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
interface GenFormRadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
}

export const GenFormRadioGroup: React.FC<GenFormRadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  errorMessage,
}) => (
  <div className="form-group mt-3">
    <label className="form-label">{label}</label>
    <div className="d-flex gap-3">
      {options.map(option => (
        <div key={option.value} className="form-check">
          <input
            type="radio"
            className={`form-check-input ${errorMessage ? 'is-invalid' : ''}`}
            id={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          <label htmlFor={option.value} className="form-check-label">
            {option.label}
          </label>
        </div>
      ))}
    </div>
    {errorMessage && (
      <div className="invalid-feedback d-block">{errorMessage}</div>
    )}
  </div>
);

interface Option {
  value: string;
  label: string;
}
interface GenFormSearchSelectProps {
  label: string;
  isRequired?: boolean;
  errorMessage?: string;
  loadOptions: (
    inputValue: string
  ) => Promise<OptionsOrGroups<Option, GroupBase<Option>>>;
  value: Option | null;
  onChange: (
    newValue: SingleValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;

  placeholder?: string;
  id: string;
}

const GenFormSearchSelect: React.FC<GenFormSearchSelectProps> = ({
  label,
  isRequired = false,
  errorMessage,
  loadOptions,
  value,
  onChange,
  placeholder,
  id,
}) => {
  return (
    <div className="row">
      <div className="col-md-12 col-lg-12">
        <div className="form-group">
          <label htmlFor={id} className="form-label">
            {label} {isRequired && <span style={{ color: 'red' }}>*</span>}
          </label>
          <AsyncSelect
            inputId={id}
            cacheOptions
            defaultOptions
            loadOptions={loadOptions}
            value={value}
            onChange={onChange}
            isClearable
            placeholder={placeholder}
            styles={{
              control: provided => ({
                ...provided,
                borderWidth: '2px',
                borderColor: errorMessage ? '#dc3545' : '#edf0f2',
              }),
              container: provided => ({
                ...provided,
                width: '100%',
              }),
            }}
          />
          {errorMessage && (
            <div className="invalid-feedback" style={{ display: 'block' }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenFormSearchSelect;
