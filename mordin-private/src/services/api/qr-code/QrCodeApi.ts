import qs from 'qs';

import { CollectSampleInput } from '../../../types/qr-code/CollectSample';
import {
  QrCodeInput,
  QrCodeSearch,
  QrCodeSummary,
} from '../../../types/qr-code/QrCode';
import api from '../../Axios';

import { BookIds } from '@/types/qr-code/Report';

//number = จำนวน qrCode ที่ต้องการสร้าง
export async function generateQrCode(number: number, qrCodeData: QrCodeInput) {
  try {
    const response = await api.post(`/qr-codes/generate/${number}`, qrCodeData);
    return response.data;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export async function getQrCodeByQrCode(qrCode: string) {
  try {
    const response = await api.get(`/qr-codes/${qrCode}`);
    return response.data;
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
}

export async function getQrCodeByEncryptCode(code: string) {
  try {
    const response = await api.get(`/qr-codes/encrypt-code/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error getting QR code by encrypt code:', error);
    throw error;
  }
}

export async function getAllQrCode() {
  try {
    const response = await api.get(`/qr-codes`);
    return response.data;
  } catch (error) {
    console.error('Error getting all QR codes:', error);
    throw error;
  }
}

export async function getCollectedQrCodes() {
  try {
    const response = await api.get(`/qr-codes/collected`);
    return response.data;
  } catch (error) {
    console.error('Error getting collected QR codes:', error);
    throw error;
  }
}

export async function checkEncryptQrCode(code: string) {
  try {
    const response = await api.get(`/qr-codes/check-encrypt/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error checking encrypt QR code:', error);
    throw error;
  }
}

export async function getEncryptQrCode(code: string) {
  try {
    const response = await api.get(`/qr-codes/encrypt/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error getting encrypt QR code:', error);
    throw error;
  }
}

export async function getDecryptQrCode(code: string) {
  try {
    const response = await api.get(`/qr-codes/decrypt/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error getting encrypt QR code:', error);
    throw error;
  }
}

export async function updateDataByFarmer(
  code: string,
  data: CollectSampleInput
) {
  try {
    const response = await api.patch(
      `/qr-codes/update-data-by-farmer/${code}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error updating QR code data:', error);
    throw error;
  }
}

export async function receiveQrCodeSample(
  code: string,
  data: { serviceCalendarId: number }
) {
  try {
    const response = await api.patch(`/qr-codes/receive-sample/${code}`, data);
    return response.data;
  } catch (error) {
    console.error('Error receiving QR code sample:', error);
    throw error;
  }
}

export async function receivedSampleByEncryptedCode(
  code: string,
  data: { serviceCalendarId: number }
) {
  try {
    const response = await api.patch(
      `/qr-codes/receive-sample/encrypted/${code}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error getting sample results by service calendar ID:',
      error
    );
    throw error;
  }
}

export async function receivedSampleByDecryptedCode(
  code: string,
  data: { serviceCalendarId: number; bookId?: number }
) {
  try {
    const response = await api.patch(
      `/qr-codes/receive-sample/decrypted/${code}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      'Error getting sample results by service calendar ID:',
      error
    );
    throw error;
  }
}

export async function approvedQrCodeSampleByBookId(bookId: BookIds) {
  try {
    const response = await api.patch(`/qr-codes/approve`, bookId);
    return response.data;
  } catch (error) {
    console.error('Error approve sample:', error);
    throw error;
  }
}

export async function searchQrCode(param: QrCodeSearch) {
  try {
    const response = await api.get('/qr-codes', {
      params: param,
      paramsSerializer: params =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
    });
    return response.data;
  } catch (error) {
    console.error('Error approve sample:', error);
    throw error;
  }
}

export async function getQrCodeSummary(): Promise<QrCodeSummary> {
  try {
    const response = await api.get('/qr-codes/summary');
    return response.data;
  } catch (error) {
    console.error('Cannot get QR code summary:', error);
    throw error;
  }
}
export async function deleteQrCode(id: number) {
  try {
    const response = await api.delete(`/qr-codes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
}
