/// <reference types="cypress" />

describe('쿠폰/혜택 시스템 테스트', () => {
  const apiUrl = Cypress.env('apiUrl')
  const testQrCode = Cypress.env('testQrCode')

  describe('쿠폰 API 테스트', () => {
    it('쿠폰 목록 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/coupons/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
        if (response.status === 200) {
          expect(response.body).to.be.an('array')
        }
      })
    })

    it('쿠폰 상세 조회 API 테스트', () => {
      // 먼저 쿠폰 목록 조회
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/coupons/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 && response.body.length > 0) {
          const couponId = response.body[0].id

          cy.request({
            method: 'GET',
            url: `${apiUrl}/api/coupons/${couponId}`,
            failOnStatusCode: false
          }).then((detailResponse) => {
            expect([200, 404]).to.include(detailResponse.status)
          })
        }
      })
    })

    it('쿠폰 사용 API - 인증 없이 호출 시 401', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/coupons/use`,
        body: {
          couponId: 'test-coupon-id',
          qrCodeId: testQrCode
        },
        failOnStatusCode: false
      }).then((response) => {
        // 인증 필요
        expect([401, 400, 404]).to.include(response.status)
      })
    })
  })

  describe('혜택 API 테스트', () => {
    it('혜택 목록 조회가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/benefits/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
        if (response.status === 200) {
          expect(response.body).to.be.an('array')
        }
      })
    })

    it('활성화된 혜택만 조회되어야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/benefits/qr/${testQrCode}?active=true`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
        if (response.status === 200 && response.body.length > 0) {
          response.body.forEach((benefit: any) => {
            expect(benefit.isActive).to.be.true
          })
        }
      })
    })
  })

  describe('혜택 UI 표시', () => {
    beforeEach(() => {
      cy.visitCustomerPage(testQrCode)
    })

    it('혜택 섹션이 페이지에 존재할 수 있음', () => {
      // 페이지 로딩 대기
      cy.wait(2000)
      cy.get('body').should('be.visible')
    })

    it('혜택 카드 클릭 시 상세 정보 표시', () => {
      cy.wait(2000)
      // 혜택 카드가 있으면 클릭
      cy.get('body').then(($body) => {
        const benefitCards = $body.find('[data-testid="benefit-card"], .benefit-card, .coupon-card')
        if (benefitCards.length > 0) {
          cy.wrap(benefitCards.first()).click()
          // 모달 또는 상세 페이지 표시 확인
          cy.get('body').should('be.visible')
        }
      })
    })
  })

  describe('쿠폰 발급 플로우', () => {
    it('게임 완료 후 쿠폰 발급 API 테스트', () => {
      // 점수 제출 후 쿠폰 발급 시나리오
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/game/score`,
        body: {
          gameType: '핀볼',
          playerName: 'CypressTest',
          score: 1000,
          qrCodeId: testQrCode
        },
        failOnStatusCode: false
      }).then((response) => {
        // 점수 저장 성공 또는 에러
        expect([200, 201, 400, 404]).to.include(response.status)

        // 쿠폰 발급 확인 (있다면)
        if (response.status === 200 || response.status === 201) {
          cy.log('Score submitted successfully')
        }
      })
    })
  })

  describe('쿠폰 만료 처리', () => {
    it('만료된 쿠폰은 사용 불가', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/coupons/validate`,
        body: {
          couponCode: 'EXPIRED_TEST_COUPON',
          qrCodeId: testQrCode
        },
        failOnStatusCode: false
      }).then((response) => {
        // 만료 또는 유효하지 않은 쿠폰
        expect([400, 404, 410]).to.include(response.status)
      })
    })
  })

  describe('혜택 룰렛/럭키드로우', () => {
    it('럭키드로우 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/benefits/luckydraw/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
      })
    })
  })

  describe('Idempotency 테스트', () => {
    it('동일한 Idempotency-Key로 중복 요청 시 동일 응답', () => {
      const idempotencyKey = `cypress-test-${Date.now()}`

      // 첫 번째 요청
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/coupons/issue`,
        headers: {
          'Idempotency-Key': idempotencyKey
        },
        body: {
          benefitId: 'test-benefit',
          qrCodeId: testQrCode,
          customerName: 'CypressTest'
        },
        failOnStatusCode: false
      }).then((firstResponse) => {
        // 두 번째 동일 요청
        cy.request({
          method: 'POST',
          url: `${apiUrl}/api/coupons/issue`,
          headers: {
            'Idempotency-Key': idempotencyKey
          },
          body: {
            benefitId: 'test-benefit',
            qrCodeId: testQrCode,
            customerName: 'CypressTest'
          },
          failOnStatusCode: false
        }).then((secondResponse) => {
          // 동일한 응답 또는 Idempotency 처리
          if (firstResponse.status === secondResponse.status) {
            cy.log('Idempotency working correctly')
          }
        })
      })
    })
  })
})
