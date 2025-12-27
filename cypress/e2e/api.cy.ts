/// <reference types="cypress" />

describe('API 엔드포인트 테스트', () => {
  const apiUrl = Cypress.env('apiUrl')
  const testQrCode = Cypress.env('testQrCode')

  describe('Health Check', () => {
    it('서버가 정상 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/health`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.status).to.eq('healthy')
      })
    })

    it('루트 엔드포인트가 응답해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.message).to.eq('WaitPlay API')
      })
    })
  })

  describe('인증 API', () => {
    it('POST /api/auth/standard-login - 유효하지 않은 자격 증명', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/standard-login`,
        body: {
          username: 'invalid@test.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })

    it('POST /api/auth/refresh - 유효하지 않은 토큰', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/refresh`,
        body: {
          refreshToken: 'invalid-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })

    it('GET /api/auth/me - 인증 없이 접근', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/auth/me`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })

    it('POST /api/auth/forgot-password - 이메일 형식 테스트', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/forgot-password`,
        body: {
          email: 'test@example.com'
        },
        failOnStatusCode: false
      }).then((response) => {
        // 성공 (보안상 사용자 존재 여부 노출 안 함)
        expect(response.status).to.eq(200)
      })
    })
  })

  describe('게임 API', () => {
    it('GET /api/game/assets - 게임 에셋 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/assets?gameType=같은그림찾기&limit=8`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200)
      })
    })

    it('GET /api/game/assets/by-qrcode - QR코드 기반 에셋 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/assets/by-qrcode?qrCode=${testQrCode}&gameType=같은그림찾기&limit=8`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('assets')
      })
    })

    it('GET /api/game/score/leaderboard - 리더보드 조회 (QR코드 필수)', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/score/leaderboard/${encodeURIComponent('같은그림찾기')}/qr/${testQrCode}?limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(200)
        // leaderboard 필드 또는 배열 확인
        if (response.body.leaderboard) {
          expect(response.body.leaderboard).to.be.an('array')
        }
      })
    })

    it('GET /api/games/settings - 게임 설정 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/games/settings/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 401 인증필요, 404 없음
        expect([200, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('QR코드 API', () => {
    it('GET /api/qrcode/by-code - QR코드 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/qrcode/by-code/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('랜딩페이지 API', () => {
    it('GET /api/landingpage/settings - 설정 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/landingpage/settings`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })

    it('GET /api/landingpage/settings/qr - QR별 설정 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/landingpage/settings/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })

    it('GET /api/landingpage/layout - 레이아웃 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/landingpage/layout/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('혜택/쿠폰 API', () => {
    it('GET /api/benefits/qr - QR별 혜택 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/benefits/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })

    it('POST /api/coupons/use - 유효하지 않은 쿠폰 사용', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/coupons/use`,
        body: {
          couponCode: 'INVALID-COUPON-12345'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 404, 401]).to.include(response.status)
      })
    })
  })

  describe('방명록 API', () => {
    it('GET /api/guestbook - 방명록 목록 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/guestbook/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('대기열 API', () => {
    it('GET /api/queue/status - 대기열 상태 조회', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/queue/status/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200 성공, 400 잘못된 요청, 401 인증필요, 404 없음
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('Admin 전용 API (인증 필요)', () => {
    it('GET /api/admin/customers - 인증 없이 접근 불가', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/admin/customers`,
        failOnStatusCode: false
      }).then((response) => {
        // 401 인증필요, 403 권한없음, 404 엔드포인트 없음
        expect([401, 403, 404]).to.include(response.status)
      })
    })

    it('GET /api/admin/dashboard/stats - 인증 없이 접근 불가', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/admin/dashboard/stats`,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403, 404]).to.include(response.status)
      })
    })

    it('GET /api/admin/assets - 인증 없이 접근 불가', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/admin/assets`,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403, 404]).to.include(response.status)
      })
    })
  })

  describe('SuperAdmin 전용 API (인증 필요)', () => {
    it('GET /api/superadmin/admins - 인증 없이 접근 불가', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/superadmin/admins`,
        failOnStatusCode: false
      }).then((response) => {
        // 401 인증필요, 403 권한없음, 404 엔드포인트 없음
        expect([401, 403, 404]).to.include(response.status)
      })
    })

    it('GET /api/superadmin/dashboard/stats - 인증 없이 접근 불가', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/superadmin/dashboard/stats`,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403, 404]).to.include(response.status)
      })
    })

    it('GET /api/superadmin/notices - 인증 없이 접근 불가', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/superadmin/notices`,
        failOnStatusCode: false
      }).then((response) => {
        expect([401, 403, 404]).to.include(response.status)
      })
    })
  })

  describe('응답 시간 테스트', () => {
    it('Health check 응답이 500ms 이내여야 함', () => {
      const start = Date.now()

      cy.request({
        method: 'GET',
        url: `${apiUrl}/health`
      }).then(() => {
        const responseTime = Date.now() - start
        cy.log(`Response time: ${responseTime}ms`)
        expect(responseTime).to.be.lessThan(500)
      })
    })

    it('게임 에셋 API 응답이 2초 이내여야 함', () => {
      const start = Date.now()

      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/assets/by-qrcode?qrCode=${testQrCode}&gameType=같은그림찾기&limit=8`
      }).then(() => {
        const responseTime = Date.now() - start
        cy.log(`Response time: ${responseTime}ms`)
        expect(responseTime).to.be.lessThan(2000)
      })
    })

    it('리더보드 API 응답이 1초 이내여야 함', () => {
      const start = Date.now()

      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/score/leaderboard/${encodeURIComponent('같은그림찾기')}/qr/${testQrCode}?limit=10`,
        failOnStatusCode: false
      }).then(() => {
        const responseTime = Date.now() - start
        cy.log(`Response time: ${responseTime}ms`)
        expect(responseTime).to.be.lessThan(1000)
      })
    })
  })
})
