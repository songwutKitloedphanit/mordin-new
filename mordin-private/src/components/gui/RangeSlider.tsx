import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap.css';
import { ReactElement, useEffect, useState } from 'react';

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  step: number;
  onChange?: (value: [number, number]) => void;
  value?: [number, number];
}

type SliderHandleProps = {
  index: number;
};

const handleRenderWithTooltip =
  (tooltipValues: number[]) =>
    (node: ReactElement, props: SliderHandleProps): ReactElement => {
      const { index } = props;
      const value = tooltipValues?.[index];

      return (
        <Tooltip
          prefixCls="rc-tooltip"
          overlay={
            <span>{typeof value === 'number' ? value.toFixed(2) : ''}</span>
          }
          trigger={['hover']}
          placement="top"
          key={index}
        >
          {node}
        </Tooltip>
      );
    };

export const DoubleRangeSlider = ({
  min,
  max,
  step,
  onChange,
  value,
}: DoubleRangeSliderProps) => {
  const isControlled = value !== undefined;
  const [defaultValue] = useState<[number, number]>([min, max]);
  const [tooltipValues, setTooltipValues] = useState<[number, number]>(
    isControlled ? value! : [min, max]
  );

  const handleSliderChange: (val: number | number[]) => void = val => {
    if (Array.isArray(val) && val.length === 2) {
      const tupleVal = val as [number, number];
      setTooltipValues(tupleVal);
      onChange?.(tupleVal);
    }
  };

  return (
    <div style={{ width: '80%', padding: '20px 0' }}>
      <Slider
        range
        min={min}
        max={max}
        step={step}
        {...(isControlled ? { value } : { defaultValue })}
        onChange={handleSliderChange}
        handleRender={handleRenderWithTooltip(tooltipValues)}
        trackStyle={{ backgroundColor: '#1565C0', height: 10 }}
        handleStyle={[
          {
            borderColor: '#0D47A1',
            height: 24,
            width: 24,
            marginTop: -7,
            backgroundColor: '#1976D2',
          },
          {
            borderColor: '#0D47A1',
            height: 24,
            width: 24,
            marginTop: -7,
            backgroundColor: '#1976D2',
          },
        ]}
        railStyle={{ height: 10 }}
      />
      <div className="d-flex justify-content-between mt-2">
        <p>{min}</p>
        <p>{max}</p>
      </div>
    </div>
  );
};

interface MultiPointSliderProps {
  onChange?: (value: number[]) => void;
  pointsCount?: number; // จำนวนหัวบน slider
}

export const MultiPointSlider = ({
  onChange,
  pointsCount = 4,
}: MultiPointSliderProps) => {
  const getInitialValues = (count: number): number[] => {
    if (count <= 1) return [5]; // กรณีมี 1 หัว ให้ตั้งไว้กลางๆ
    const min = 1;
    const max = 10;
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) =>
      parseFloat((min + i * step).toFixed(2))
    );
  };

  const [multiValues, setMultiValues] = useState<number[]>(
    getInitialValues(pointsCount - 1)
  );

  useEffect(() => {
    if (onChange) onChange(multiValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiValues]);

  useEffect(() => {
    const initial = getInitialValues(pointsCount - 1);
    setMultiValues(initial);
    if (onChange) onChange(initial); // ส่งออกค่าทันทีเมื่อ `pointsCount` เปลี่ยน
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsCount]);

  return (
    <div
      className="slider-container"
      style={{ width: '80%', padding: '20px 0' }}
    >
      <div
        className="slider-wrapper"
        style={{ touchAction: 'none', pointerEvents: 'auto' }}
      >
        <Slider
          range
          min={1}
          max={10}
          step={0.01}
          value={multiValues}
          onChange={val => setMultiValues(val as number[])}
          allowCross={false}
          pushable={0.1}
          handleRender={handleRenderWithTooltip(multiValues)}
          trackStyle={{ backgroundColor: '#1565C0', height: 10 }}
          handleStyle={multiValues.map(() => ({
            borderColor: '#0D47A1',
            height: 24,
            width: 24,
            marginTop: -7,
            backgroundColor: '#1976D2',
          }))}
          railStyle={{ height: 10 }}
        />
      </div>
      <div className="d-flex justify-content-between mt-2">
        <p>{1}</p>
        <p>{10}</p>
      </div>
    </div>
  );
};

interface MultiPointPHSliderProps {
  onChange?: (value: number[]) => void;
  pointsCount?: number;
  max: number;
  min: number;
  initialValues?: number[];
}

export const MultiPointPHSlider = ({
  onChange,
  pointsCount = 4,
  max,
  min,
  initialValues,
}: MultiPointPHSliderProps) => {
  const getInitialValues = (count: number): number[] => {
    if (count <= 1) return [5];
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, i) =>
      parseFloat((min + i * step).toFixed(2))
    );
  };

  const [multiValues, setMultiValues] = useState<number[]>(
    initialValues && initialValues.length > 0
      ? initialValues
      : getInitialValues(pointsCount)
  );

  useEffect(() => {
    if (onChange) onChange(multiValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiValues]);

  useEffect(() => {
    // Only update if initialValues changes and is valid
    if (initialValues && initialValues.length > 0) {
      setMultiValues(initialValues);
      if (onChange) onChange(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useEffect(() => {
    // Only regenerate values if pointsCount changes and no initialValues provided
    if (!initialValues || initialValues.length === 0) {
      const initial = getInitialValues(pointsCount);
      setMultiValues(initial);
      if (onChange) onChange(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsCount]);

  return (
    <div
      className="slider-container"
      style={{ width: '80%', padding: '20px 0' }}
    >
      <div
        className="slider-wrapper"
        style={{ touchAction: 'none', pointerEvents: 'auto' }}
      >
        <Slider
          range
          min={min}
          max={max}
          step={0.1}
          value={multiValues}
          onChange={val => setMultiValues(val as number[])}
          allowCross={false}
          pushable={0.1}
          handleRender={handleRenderWithTooltip(multiValues)}
          trackStyle={{ backgroundColor: '#1565C0', height: 10 }}
          handleStyle={multiValues.map(() => ({
            borderColor: '#0D47A1',
            height: 24,
            width: 24,
            marginTop: -7,
            backgroundColor: '#1976D2',
          }))}
          railStyle={{ height: 10 }}
        />
      </div>
      <div className="d-flex justify-content-between mt-2">
        <p>{min}</p>
        <p>{max}</p>
      </div>
    </div>
  );
};

interface MultiPointSlider2Props {
  /** จำนวน handles จะถูกกำหนดโดยความยาวของ value */
  value: number[];
  onChange: (vals: number[]) => void;
  min: number;
  max: number;
  step?: number;
  /** marks สำหรับแสดง tick labels */
  marks?: { [key: number]: string | React.ReactNode };
}

export const MultiPointSlider2: React.FC<MultiPointSlider2Props> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  marks,
}) => (
  <div style={{ width: '80%', padding: '20px 0' }}>
    <Slider
      range
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={v => onChange(v as number[])}
      allowCross={false}
      pushable={step}
      handleRender={handleRenderWithTooltip(value)}
      marks={marks}
      trackStyle={{ height: 10 }}
      railStyle={{ height: 10 }}
      handleStyle={value.map(() => ({
        height: 24,
        width: 24,
        marginTop: -7,
      }))}
    />
    <div className="d-flex justify-content-between mt-2">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);
