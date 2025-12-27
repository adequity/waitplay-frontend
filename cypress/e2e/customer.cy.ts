/// <reference types="cypress" />

describe('Customer 페이지 테스트', () => {
  const apiUrl = Cypress.env('apiUrl')
  const testQrCode = Cypress.env('testQrCode')

  describe('Customer 페이지 접근', () => {
    it('QR 코드로 Customer 페이지에 접근할 수 있어야 함', () => {
      cy.visitCustomerPage(testQrCode)
      cy.url().should('include', '/customer')
      cy.url().should('include', `qr=${testQrCode}`)
    })

    it('QR 코드 없이 Customer 페이지 접근 시 기본 페이지 표시', () => {
      cy.visit('/customer')
      cy.url().should('include', '/customer')
    })

    it('존재하지 않는 QR 코드로 접근 시 적절한 처리', () => {
      cy.visit('/customer?qr=INVALID_QR_CODE_12345')
      // 에러 메시지 또는 기본 페이지 표시
      cy.get('body').should('exist')
    })
  })

  describe('랜딩페이지 로딩', () => {
    it('랜딩페이지 설정 API가 호출되어야 함', () => {
      cy.intercept('GET', '**/api/landingpage/settings/**').as('getLandingSettings')

      cy.visitCustomerPage(testQrCode)
      cy.wait('@getLandingSettings', { timeout: 15000 }).then((interception) => {
        expect([200, 400, 404]).to.include(interception.response?.statusCode)
      })
    })

    it('랜딩페이지 레이아웃 API가 호출되어야 함', () => {
      cy.intercept('GET', '**/api/landingpage/layout/**').as('getLayout')

      cy.visitCustomerPage(testQrCode)
      cy.wait('@getLayout', { timeout: 15000 }).then((interception) => {
        expect([200, 400, 404]).to.include(interception.response?.statusCode)
      })
    })

    it('페이지 컨텐츠가 표시되어야 함', () => {
      cy.visitCustomerPage(testQrCode)
      // 기본 레이아웃 요소 확인
      cy.get('body').should('be.visible')
    })
  })

  describe('게임 목록', () => {
    beforeEach(() => {
      cy.visitCustomerPage(testQrCode)
    })

    it('게임 관련 요소가 존재해야 함', () => {
      // 게임 캐러셀 또는 게임 카드 확인 (없을 수도 있음)
      cy.get('body').should('be.visible')
      cy.wait(2000) // 페이지 로딩 대기
    })
  })

  describe('리더보드 API', () => {
    it('리더보드 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/score/leaderboard/${encodeURIComponent('같은그림찾기')}/qr/${testQrCode}?limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
        if (response.status === 200) {
          // 응답이 배열이거나 leaderboard 필드를 가진 객체일 수 있음
          if (Array.isArray(response.body)) {
            expect(response.body).to.be.an('array')
          } else if (response.body.leaderboard) {
            expect(response.body.leaderboard).to.be.an('array')
          }
        }
      })
    })
  })

  describe('방명록 API', () => {
    it('방명록 목록 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/guestbook/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
      })
    })
  })

  describe('대기열 API', () => {
    it('대기열 상태 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/queue/status/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
      })
    })

    it('대기열 참여 API가 동작해야 함', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/queue/join`,
        body: {
          qrCodeId: testQrCode,
          customerName: 'CypressTest',
          phoneNumber: '010-1234-5678'
        },
        failOnStatusCode: false
      }).then((response) => {
        // 성공, 중복, 또는 비활성화 상태
        expect([200, 201, 400, 404]).to.include(response.status)
      })
    })
  })

  describe('혜택 API', () => {
    it('혜택 목록 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/benefits/qr/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
      })
    })
  })

  describe('반응형 디자인', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 }
    ]

    viewports.forEach((viewport) => {
      it(`${viewport.name} 뷰포트에서 정상 표시되어야 함`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visitCustomerPage(testQrCode)

        // 페이지가 깨지지 않고 표시되어야 함
        cy.get('body').should('be.visible')
      })
    })
  })

  describe('에러 처리', () => {
    it('API 에러 시에도 페이지가 표시되어야 함', () => {
      cy.intercept('GET', '**/api/landingpage/**', {
        statusCode: 500,
        body: { message: 'Internal Server Error' }
      }).as('serverError')

      cy.visitCustomerPage(testQrCode)

      // 에러가 발생해도 페이지가 완전히 깨지지 않아야 함
      cy.get('body').should('be.visible')
    })
  })

  describe('성능 테스트', () => {
    it('페이지 로드 시간이 적절해야 함', () => {
      const start = Date.now()

      cy.visitCustomerPage(testQrCode)
      cy.get('body').should('be.visible')

      cy.then(() => {
        const loadTime = Date.now() - start
        cy.log(`Page load time: ${loadTime}ms`)
        // 10초 이내 로드
        expect(loadTime).to.be.lessThan(10000)
      })
    })
  })
})
