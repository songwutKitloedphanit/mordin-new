import api from '@/services/Axios';

export interface DashboardStats {
  totals: {
    farmers: number;
    lands: number;
    samples: number;
    serviceDays: number;
  };
  qr: {
    total: number;
    distributed: number;
    collected: number;
    received: number;
    analyzing: number;
    analyzed: number;
    approved: number;
  };
  soilQuality: { name: string; count: number }[];
}

/** ภาพรวมตัวเลขจริงทั้งระบบ (สำหรับ Dashboard) */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard/stats');
  return data;
}
