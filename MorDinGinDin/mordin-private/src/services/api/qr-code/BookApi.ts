import api from '../../Axios';

import { CollectExamInput } from '@/types/qr-code/CollectSample';
import { SampleCodes } from '@/types/qr-code/Report';

export async function getReceivedBooksByServiceCalendarId(id: number) {
  try {
    const response = await api.get(`/books/service-calendar/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting books by service calendar ID:', error);
    throw error;
  }
}

export async function getSampleResultsByServCalendarId(id: number) {
  try {
    const response = await api.get(`/books/service-calendar/${id}/results`);
    return response.data;
  } catch (error) {
    console.error(
      'Error getting sample results by service calendar ID:',
      error
    );
    throw error;
  }
}

export async function selectReceivedBooksByByServiceCalendarId(
  id: number,
  bookId: number[]
) {
  try {
    const response = await api.patch(
      `/books/service-calendar/${id}/selects`,
      bookId
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
export async function settingOwnerData(id: number, data: CollectExamInput) {
  try {
    const response = await api.patch(`/books/settings/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error setting owner data', error);
    throw error;
  }
}

export async function findSampleForReportPages(id: number) {
  try {
    const response = await api.get(`/books/service-calendar/${id}/reports`);
    return response.data;
  } catch (error) {
    console.error('Error can not find sample', error);
    throw error;
  }
}

export async function getReports(sampleCodes: SampleCodes) {
  try {
    const response = await api.post(`/books/reports`, sampleCodes);
    return response.data;
  } catch (error) {
    console.error('Error can not find sample', error);
    throw error;
  }
}

export async function getReportsPdf(sampleCodes: SampleCodes) {
  try {
    const response = await api.post(`/books/reports/pdf`, sampleCodes, {
      responseType: 'blob', // สำคัญ!
    });
    return response.data; // ได้ blob (ไฟล์ pdf) กลับมา
  } catch (error) {
    console.error('Error generating PDF', error);
    throw error;
  }
}

export const getBookingsByCalendar = async (calendarId: number) => {
  const res = await api.get(`/books/booking/calendar/${calendarId}`);
  return res.data;
};

export const pairBooking = async (bookId: number, qrCode: string) => {
  const res = await api.post(`/books/pair`, { bookId, qrCode });
  return res.data;
};
