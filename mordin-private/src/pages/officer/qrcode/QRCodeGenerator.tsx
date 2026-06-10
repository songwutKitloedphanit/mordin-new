import { QRCodeCanvas } from 'qrcode.react';
import React, { useState } from 'react';

import { GenFormText1 } from '../../../components/gui/GuiForm';
import './QRCodeGenerator.css';

const QRCodeGenerator: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(
    'https://iot.eng.kps.ku.ac.th/soil/public/service-book.php'
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const generateQr = () => {
    if (inputValue.trim() === '') {
      alert('Input Field Can not be blank!');
      return;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>QR Code Generator</h1>
        <hr />
        <div className="qrcode">
          <QRCodeCanvas
            value={inputValue}
            size={160}
            level="L"
            includeMargin={true}
          />
        </div>
        <GenFormText1
          isRequired={true}
          id="qr-input"
          name="URL or Text"
          label="QR Input"
          placeholder="Paste a URL or enter text, then press enter"
          onChange={handleInputChange} // ส่ง onChange เข้าไป
        />
        <button type="button" className="btn btn-primary" onClick={generateQr}>
          Generate QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
