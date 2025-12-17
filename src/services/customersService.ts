import apiClient from './api'

export interface SegmentData {
  count: number
  avgUsage: number
  avgCoupons: number
}

export interface CustomerSegments {
  vip: SegmentData
  regular: SegmentData
  active: SegmentData
  normal: SegmentData
  new: SegmentData
  total: number
}

export interface CustomerListItem {
  id: string
  nickname: string
  phone: string
  usageCount: number
  couponCount: number
  segment: string
  lastUsage: string | null
  createdAt: string
}

/**
 * 고객 세그먼트별 통계 조회
 */
export async function getCustomerSegments(): Promise<CustomerSegments> {
  const response = await apiClient.get<CustomerSegments>('/api/admin/customers/segments')
  return response.data
}

/**
 * 고객 목록 조회
 */
export async function getCustomerList(segment?: string): Promise<CustomerListItem[]> {
  const response = await apiClient.get<CustomerListItem[]>('/api/admin/customers/list', {
    params: segment ? { segment } : {}
  })
  return response.data
}

export default {
  getCustomerSegments,
  getCustomerList
}
