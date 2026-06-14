import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
  CameraDevice,
} from 'html5-qrcode';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';

export interface QrScannerProps {
  readerId?: string;
  onScanSuccess: (decodedText: string, scannerInstance: Html5Qrcode) => void;
  onScanError?: (errorMessage: string, error?: unknown) => void;
  fps?: number;
  qrbox?: number;
}

const defaultOnScanError = (_msg: string, _err?: unknown) => {};

const QrScanner: React.FC<QrScannerProps> = ({
  readerId = 'qr-reader',
  onScanSuccess,
  onScanError = defaultOnScanError,
  fps = 15,
  qrbox = 250,
}) => {
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const lastErrorTimeRef = useRef<number>(0);
  // [ใหม่] เพิ่ม Ref เพื่อป้องกันการสั่ง start ซ้ำซ้อน
  const hasStartedRef = useRef(false);

  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(deviceList => {
        setCameras(deviceList);
        if (deviceList.length) setSelectedCameraId(deviceList[0].id);
      })
      .catch(err => {
        console.error('Cannot access cameras', err);
        const name = (err as any)?.name;
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          Swal.fire(
            'ต้องการสิทธิ์ใช้กล้อง',
            'กรุณาอนุญาตให้เว็บไซต์ใช้กล้องจากการตั้งค่าเบราว์เซอร์',
            'warning'
          );
        } else if (name === 'NotFoundError') {
          Swal.fire('ไม่พบกล้อง', 'กรุณาเชื่อมต่อกล้องแล้วลองใหม่', 'error');
        } else {
          Swal.fire(
            'ไม่สามารถใช้กล้องได้',
            (err as Error).message || String(err),
            'error'
          );
        }
      });
  }, []);

  const errorCallback = (msg: string, err?: unknown) => {
    const now = Date.now();
    if (now - lastErrorTimeRef.current < 5000) return;
    lastErrorTimeRef.current = now;
    if ((err as any)?.name === 'NotFoundException') {
      Swal.fire('ไม่พบ QR code', 'กรุณาเล็งกล้องใหม่', 'warning');
    } else {
      console.warn('QR scan error:', msg);
      onScanError(msg, err);
    }
  };

  const startScanning = useCallback(() => {
    // [แก้ไข] ตรวจสอบด้วย Ref ก่อนเริ่ม เพื่อป้องกันการเรียกซ้ำ
    if (!selectedCameraId || hasStartedRef.current) {
      return;
    }
    // [แก้ไข] ตั้งค่า Ref ทันทีว่าได้สั่ง start แล้ว
    hasStartedRef.current = true;

    const scanner = new Html5Qrcode(readerId, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });
    html5QrcodeRef.current = scanner;

    scanner
      .start(
        { deviceId: { exact: selectedCameraId } },
        { fps, qrbox },
        (decodedText: string) => {
          if (html5QrcodeRef.current) {
            onScanSuccess(decodedText, html5QrcodeRef.current);
          }
        },
        errorCallback
      )
      .then(() => {
        setIsScanning(true);
      })
      .catch(e => {
        console.error('Start failed', e);
        errorCallback((e as Error).message, e);
        // [แก้ไข] หากการ start ล้มเหลว ให้ reset ref เพื่อให้ลองใหม่ได้
        hasStartedRef.current = false;
      });
  }, [readerId, selectedCameraId, fps, qrbox, onScanSuccess]);

  const stopScanning = useCallback(() => {
    if (!html5QrcodeRef.current || !isScanning) return;

    html5QrcodeRef.current
      .stop()
      .then(() => {
        html5QrcodeRef.current?.clear();
        setIsScanning(false);
        // [แก้ไข] Reset Ref เมื่อหยุดสแกน
        hasStartedRef.current = false;
      })
      .catch(e => {
        console.error('Stop failed', e);
        setIsScanning(false);
        // [แก้ไข] Reset Ref เมื่อหยุดสแกน (แม้จะเกิด error)
        hasStartedRef.current = false;
      });
  }, [isScanning]);

  useEffect(() => {
    if (selectedCameraId) {
      startScanning();
    }
  }, [selectedCameraId, startScanning]);

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current?.isScanning) {
        html5QrcodeRef.current.stop().catch(err => {
          console.error('Failed to stop scanner on unmount', err);
        });
      }
      // [แก้ไข] เคลียร์ Ref เมื่อ component ถูกปิด
      hasStartedRef.current = false;
    };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <select
        className="form-select mb-2"
        value={selectedCameraId}
        onChange={e => setSelectedCameraId(e.target.value)}
        disabled={isScanning}
      >
        {cameras.map(cam => (
          <option key={cam.id} value={cam.id}>
            {cam.label || cam.id}
          </option>
        ))}
      </select>
      {/* บังคับให้ video/canvas ที่ html5-qrcode ฉีดเข้ามา เติมเต็มกล่องแบบไม่เหลือขอบเทา */}
      <style>{`
        #${readerId} { position: relative; }
        #${readerId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block;
        }
      `}</style>
      <div
        id={readerId}
        style={{
          width: '100%',
          maxWidth: qrbox,
          aspectRatio: '1 / 1',
          margin: '0 auto',
          background: '#eef2f7',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      />
      <button
        type="button"
        className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} mt-2`}
        onClick={isScanning ? stopScanning : startScanning}
      >
        <i className={`fas ${isScanning ? 'fa-stop' : 'fa-camera'} me-2`} />
        {isScanning ? 'หยุดสแกน' : 'เริ่มสแกน'}
      </button>
    </div>
  );
};

export default QrScanner;
