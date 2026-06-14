import {
  CalendarInput,
  CalendarSearch,
  ServiceCalendarSummary,
} from '../../types/ServiceCalendar';
import api from '../Axios';

export async function getAllServiceCalendars() {
  try {
    const response = await api.get('/service-calendars');
    return response.data;
  } catch (error) {
    console.error('cannot get all service calendars: ', error);
    throw error;
  }
}

export async function searchServiceCalendars(params: CalendarSearch) {
  try {
    const response = await api.get('/service-calendars', { params });
    return response.data;
  } catch (error) {
    console.error('cannot search service calendars: ', error);
    throw error;
  }
}

export async function createServiceCalendar(
  serviceCalendarData: CalendarInput
) {
  try {
    console.log('serviceCalendarData: ', serviceCalendarData);

    const response = await api.post('/service-calendars', serviceCalendarData);
    return response.data;
  } catch (error) {
    console.error('cannot create service calendar: ', error);
    throw error;
  }
}

export async function getCalendarById(id: number) {
  try {
    const response = await api.get(`/service-calendars/${id}`);
    return response.data;
  } catch (error) {
    console.log('cannot get service calendar: ', error);
    throw error;
  }
}

export async function updateServiceCalendar(id: number, data: CalendarInput) {
  try {
    const response = await api.patch(`/service-calendars/${id}`, data);
    return response.data;
  } catch (error) {
    console.log('cannot update service calendar: ', error);
    throw error;
  }
}

export async function getUpcomingServiceCalendars() {
  try {
    const response = await api.get('/service-calendars/upcoming');
    return response.data;
  } catch (error) {
    console.log('cannot get upcoming service calendars: ', error);
    throw error;
  }
}

export async function deleteServiceCalendar(id: number) {
  try {
    const response = await api.delete(`/service-calendars/${id}`);
    return response.data;
  } catch (error) {
    console.log('cannot delete service calendar: ', error);
    throw error;
  }
}

export async function resolveGoogleMapLink(
  shortUrl: string
): Promise<string | null> {
  try {
    const response = await api.get('/service-calendars/resolve-map-link', {
      params: { url: shortUrl },
    });
    return response.data.resolvedUrl;
  } catch (error) {
    console.error('Failed to resolve map link:', error);
    return null;
  }
}

export async function getServiceCalendarSummary(
  year?: number,
  month?: number
): Promise<ServiceCalendarSummary> {
  try {
    // ส่ง params ไปให้ axios จัดการ query string (?year=...&month=...)
    const response = await api.get<ServiceCalendarSummary>(
      `/service-calendars/summary`,
      {
        params: {
          year,
          month,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Cannot get service calendar summary:', error);
    throw error;
  }
}
