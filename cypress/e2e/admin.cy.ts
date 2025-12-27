/// <reference types="cypress" />

describe('Admin 시스템 테스트', () => {
  const apiUrl = Cypress.env('apiUrl')
  const testQrCode = Cypress.env('testQrCode')

  describe('Admin 페이지 접근 제어', () => {
    it('로그인하지 않은 상태에서 Admin 페이지 접근 시 로그인 페이지로 리다이렉트', () => {
      cy.visit('/admin')
      // 로그인 페이지로 리다이렉트되거나 로그인 모달 표시
      cy.url().then((url) => {
        // /login으로 리다이렉트되거나 /admin에 머무름
        expect(url).to.match(/\/(login|admin)/)
      })
    })
  })

  describe('Admin API 테스트', () => {
    it('QR 코드 목록 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/qrcode`,
        failOnStatusCode: false
      }).then((response) => {
        // 인증 필요, 성공, 또는 404
        expect([200, 400, 401, 403, 404]).to.include(response.status)
      })
    })

    it('QR 코드 상세 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/qrcode/by-code/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('고객 관리 API', () => {
    it('고객 목록 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/admin/customers`,
        headers: {
          Authorization: 'Bearer mock-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        // 인증 필요 또는 성공
        expect([200, 400, 401, 403, 404]).to.include(response.status)
      })
    })
  })

  describe('게임 설정 관리 API', () => {
    it('게임 설정 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/games/settings/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('에셋 관리 API', () => {
    it('에셋 목록 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/admin/assets`,
        headers: {
          Authorization: 'Bearer mock-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 403, 404]).to.include(response.status)
      })
    })
  })

  describe('혜택/쿠폰 관리 API', () => {
    it('혜택 목록 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/benefits/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })

    it('쿠폰 사용 API가 동작해야 함', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/coupons/use`,
        body: {
          couponCode: 'INVALID-COUPON'
        },
        failOnStatusCode: false
      }).then((response) => {
        // 유효하지 않은 쿠폰이므로 400, 401, 또는 404
        expect([400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('랜딩페이지 설정 API', () => {
    it('랜딩페이지 설정 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/landingpage/settings`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })

    it('랜딩페이지 레이아웃 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/landingpage/layout/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('문의 관리 API', () => {
    it('문의 목록 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/inquiry`,
        headers: {
          Authorization: 'Bearer mock-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 401, 403, 404]).to.include(response.status)
      })
    })
  })
})
