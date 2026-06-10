import { useState } from 'react';

import api from '@/services/Axios';
import { ServiceTypeWithAllInfo } from '@/types/service-type/ServiceTypes';

const Test = () => {
  const [apiResponse, setApiResponse] = useState<ServiceTypeWithAllInfo | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/service-types/fertilizer-usages');
      setApiResponse(response.data);
    } catch (_) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const [name, setName] = useState('');
  const [expression, setExpression] = useState('');
  const [variables, setVariables] = useState([{ key: '', value: '' }]);
  const [submittedFormula, setSubmittedFormula] = useState<{
    name: string;
    expression: string;
    variables: Record<string, number>;
    result: number;
  } | null>(null);

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '' }]);
  };

  const handleVariableChange = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newVars = [...variables];
    newVars[index][field] = value;
    setVariables(newVars);
  };

  const evaluateFormula = (
    expression: string,
    vars: Record<string, number>
  ): number | string => {
    try {
      const argNames = Object.keys(vars);
      const argValues = Object.values(vars);
      const fn = new Function(...argNames, `return ${expression}`);
      const result = fn(...argValues);
      return result;
    } catch (_) {
      return '❌ เกิดข้อผิดพลาดในการคำนวณ';
    }
  };
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('เบราว์เซอร์ไม่รองรับการใช้ GPS');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      err => {
        setLocationError('ไม่สามารถดึงตำแหน่งได้: ' + err.message);
      }
    );
  };
  return (
    <div>
      <h1>Home Page For Aum2</h1>
      <br />
      <hr />
      <br />
      <h2>📍 ดึงตำแหน่ง GPS</h2>
      <button onClick={handleGetLocation}>ดึงตำแหน่งปัจจุบัน</button>
      {location && (
        <p>
          ตำแหน่ง: <strong>Lat:</strong> {location.lat.toFixed(6)},{' '}
          <strong>Lng:</strong> {location.lng.toFixed(6)}
        </p>
      )}
      {locationError && <p style={{ color: 'red' }}>{locationError}</p>}
      <button onClick={handleTestApi} disabled={loading}>
        {loading ? 'Testing API...' : 'Test API'}
      </button>
      <br />
      <hr />
      <br />
      <h2>เพิ่มสูตรคำนวณ</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          const vars = Object.fromEntries(
            variables.map(v => [v.key, parseFloat(v.value)])
          );
          const result = evaluateFormula(expression, vars);
          const formula = {
            name,
            expression,
            variables: vars,
            result: typeof result === 'number' ? result : NaN,
          };
          setSubmittedFormula(formula);
        }}
      >
        <div>
          <label>ชื่อสูตร: </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>สูตร (expression): </label>
          <input
            value={expression}
            onChange={e => setExpression(e.target.value)}
            required
          />
        </div>
        <div>
          <label>ตัวแปร:</label>
          {variables.map((v, i) => (
            <div key={i}>
              <input
                placeholder="ชื่อ เช่น a"
                value={v.key}
                onChange={e => handleVariableChange(i, 'key', e.target.value)}
                required
              />
              <input
                placeholder="ค่า เช่น 0.0122"
                type="number"
                value={v.value}
                onChange={e => handleVariableChange(i, 'value', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addVariable}>
            + เพิ่มตัวแปร
          </button>
        </div>
        <br />
        <button type="submit">บันทึกสูตร</button>
      </form>

      {submittedFormula && (
        <div
          style={{
            marginTop: '20px',
            background: '#f0f0f0',
            padding: '10px',
          }}
        >
          <h3>สูตรที่กรอก:</h3>
          <p>
            <strong>ชื่อสูตร:</strong> {submittedFormula.name}
          </p>
          <p>
            <strong>สูตร:</strong> {submittedFormula.expression}
          </p>
          <p>
            <strong>ตัวแปร:</strong>
          </p>
          <ul>
            {Object.entries(submittedFormula.variables).map(([key, value]) => (
              <li key={key}>
                {key} = {value}
              </li>
            ))}
          </ul>
          <p>
            <strong>ผลลัพธ์:</strong>{' '}
            {isNaN(submittedFormula.result) ? (
              <span style={{ color: 'red' }}>ไม่สามารถคำนวณสูตรได้</span>
            ) : (
              <span style={{ color: 'green' }}>{submittedFormula.result}</span>
            )}
          </p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {apiResponse && (
        <pre style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      )}

      <h2 className="mb-2 text-lg font-semibold">ตาราง Excel</h2>
    </div>
  );
};

export default Test;
