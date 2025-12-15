import apiClient from './api'

export interface DashboardStats {
  qrScan: number
  couponUsed: number
  newRegular: number
  totalRegular: number
}

export interface ChartPoint {
  label: string
  qrScan: number
  couponUsed: number
  newRegular: number
}

export type Period = 'today' | 'week' | 'month'

/**
 * Admin 대시보드 KPI 통계 조회
 */
export async function getDashboardStats(period: Period = 'today'): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>('/api/admin/dashboard/stats', {
    params: { period }
  })
  return response.data
}

/**
 * 차트 데이터 조회 (기간별 일자/시간대별 데이터)
 */
export async function getChartData(period: Period = 'today'): Promise<ChartPoint[]> {
  const response = await apiClient.get<ChartPoint[]>('/api/admin/dashboard/chart', {
    params: { period }
  })
  return response.data
}

export default {
  getDashboardStats,
  getChartData
}
