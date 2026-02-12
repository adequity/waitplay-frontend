import apiClient from './api'

export interface PolicyDocument {
  id: string
  policyType: 'privacy' | 'terms'
  title: string
  content: string
  version: string
  isActive: boolean
  effectiveDate: string
  changeSummary?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt?: string
}

export interface PolicyConsent {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  isAgreed: boolean
  consentedAt: string
  withdrawnAt?: string
  consentSource?: string
}

export interface CreatePolicyRequest {
  policyType: 'privacy' | 'terms'
  title: string
  content: string
  version: string
  isActive: boolean
  effectiveDate?: string
  changeSummary?: string
}

export interface UpdatePolicyRequest {
  title?: string
  content?: string
  effectiveDate?: string
  changeSummary?: string
}

const policyService = {
  // 정책 목록 조회
  getPolicies: async (policyType?: string) => {
    const params = policyType ? { policyType } : {}
    const response = await apiClient.get('/api/masteradmin/policies', { params })
    return response.data.policies as PolicyDocument[]
  },

  // 특정 정책 조회
  getPolicy: async (id: string) => {
    const response = await apiClient.get(`/api/masteradmin/policies/${id}`)
    return response.data as PolicyDocument
  },

  // 활성화된 정책 조회 (공개)
  getActivePolicy: async (policyType: 'privacy' | 'terms') => {
    const response = await apiClient.get(`/api/masteradmin/policies/active/${policyType}`)
    return response.data as PolicyDocument
  },

  // 정책 생성
  createPolicy: async (data: CreatePolicyRequest) => {
    const response = await apiClient.post('/api/masteradmin/policies', data)
    return response.data
  },

  // 정책 수정
  updatePolicy: async (id: string, data: UpdatePolicyRequest) => {
    const response = await apiClient.put(`/api/masteradmin/policies/${id}`, data)
    return response.data
  },

  // 정책 활성화/비활성화
  togglePolicyActive: async (id: string) => {
    const response = await apiClient.patch(`/api/masteradmin/policies/${id}/toggle-active`)
    return response.data
  },

  // 정책 삭제
  deletePolicy: async (id: string) => {
    const response = await apiClient.delete(`/api/masteradmin/policies/${id}`)
    return response.data
  },

  // 정책 동의 현황 조회
  getPolicyConsents: async (id: string, page = 1, pageSize = 20) => {
    const response = await apiClient.get(`/api/masteradmin/policies/${id}/consents`, {
      params: { page, pageSize }
    })
    return response.data
  },

  // 사용자별 동의 현황 조회
  getUserConsents: async (userId: string) => {
    const response = await apiClient.get(`/api/masteradmin/users/${userId}/consents`)
    return response.data
  }
}

export default policyService
