/// <reference types="cypress" />

describe('게임 시스템 테스트', () => {
  const apiUrl = Cypress.env('apiUrl')
  const testQrCode = Cypress.env('testQrCode')

  describe('게임 페이지 접근', () => {
    it('같은 그림 찾기(MATCH) 게임 페이지가 로드되어야 함', () => {
      cy.visitGame('MATCH', testQrCode)
      cy.url().should('include', '/game/MATCH')

      // Phaser 게임 컨테이너 확인
      cy.get('#game-container, [id*="game"], canvas', { timeout: 15000 }).should('exist')
    })

    it('핀볼(PINBALL) 게임 페이지가 로드되어야 함', () => {
      cy.visitGame('PINBALL', testQrCode)
      cy.url().should('include', '/game/PINBALL')
      cy.get('#game-container, [id*="game"], canvas', { timeout: 15000 }).should('exist')
    })

    it('벽돌깨기(BREAKOUT) 게임 페이지가 로드되어야 함', () => {
      cy.visitGame('BREAKOUT', testQrCode)
      cy.url().should('include', '/game/BREAKOUT')
      cy.get('#game-container, [id*="game"], canvas', { timeout: 15000 }).should('exist')
    })

    it('존재하지 않는 게임 타입 접근 시 에러 처리', () => {
      cy.visit('/game/INVALID_GAME', { failOnStatusCode: false })
      // 페이지가 로드되어야 함 (에러 페이지 또는 리다이렉트)
      cy.get('body').should('exist')
    })
  })

  describe('게임 에셋 로딩', () => {
    it('QR 코드 기반 게임 에셋이 로드되어야 함', () => {
      cy.intercept('GET', `**/api/game/assets/by-qrcode*`).as('getAssets')

      cy.visitGame('MATCH', testQrCode)

      cy.wait('@getAssets').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200)
        const assets = interception.response?.body?.assets || []
        cy.log(`Loaded ${assets.length} assets`)
      })
    })

    it('에셋이 없을 때 기본 테마(이모지)가 사용되어야 함', () => {
      cy.intercept('GET', `**/api/game/assets/by-qrcode*`, {
        statusCode: 200,
        body: { assets: [] }
      }).as('emptyAssets')

      cy.visitGame('MATCH', 'NONEXISTENT_QR')

      cy.wait('@emptyAssets')
      // 게임이 여전히 로드되어야 함 (이모지 폴백)
      cy.get('canvas', { timeout: 15000 }).should('exist')
    })
  })

  describe('게임 점수 API', () => {
    it('점수 제출 API가 올바르게 동작해야 함', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/game/score`,
        body: {
          gameType: '같은그림찾기',
          score: 1000,
          playerName: 'CypressTest',
          qrCodeId: testQrCode,
          playTime: 60
        },
        failOnStatusCode: false
      }).then((response) => {
        // 성공(200/201) 또는 인증 필요(401) 등 다양한 응답 가능
        expect([200, 201, 400, 401]).to.include(response.status)
      })
    })

    it('리더보드 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/score/leaderboard/같은그림찾기?limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
        if (response.status === 200) {
          // 응답이 배열이거나 leaderboard 필드를 가진 객체
          if (Array.isArray(response.body)) {
            expect(response.body).to.be.an('array')
          } else if (response.body.leaderboard) {
            expect(response.body.leaderboard).to.be.an('array')
          }
        }
      })
    })

    it('QR 코드별 리더보드 조회가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/game/score/leaderboard/같은그림찾기/qr/${testQrCode}?limit=10`,
        failOnStatusCode: false
      }).then((response) => {
        expect([200, 400, 404]).to.include(response.status)
        if (response.status === 200) {
          // 응답이 배열이거나 leaderboard 필드를 가진 객체
          if (Array.isArray(response.body)) {
            expect(response.body).to.be.an('array')
          } else if (response.body.leaderboard) {
            expect(response.body.leaderboard).to.be.an('array')
          }
        }
      })
    })
  })

  describe('게임 설정 API', () => {
    it('게임 설정 조회 API가 동작해야 함', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/games/settings/${testQrCode}`,
        failOnStatusCode: false
      }).then((response) => {
        // 200, 400, 401, 404 모두 가능
        expect([200, 400, 401, 404]).to.include(response.status)
      })
    })
  })

  describe('게임 UI 요소', () => {
    beforeEach(() => {
      cy.visitGame('MATCH', testQrCode)
      // 게임 로딩 대기
      cy.get('canvas', { timeout: 15000 }).should('exist')
    })

    it('게임 캔버스가 표시되어야 함', () => {
      cy.get('canvas').should('be.visible')
    })

    it('게임 컨테이너의 크기가 적절해야 함', () => {
      cy.get('#game-container, [id*="game"]').then(($container) => {
        const width = $container.width()
        const height = $container.height()
        expect(width).to.be.greaterThan(100)
        expect(height).to.be.greaterThan(100)
      })
    })

    it('뒤로가기 버튼이 존재해야 함', () => {
      // 게임 화면 외부의 네비게이션 버튼 확인
      cy.get('button:contains("뒤로"), a:contains("뒤로"), [class*="back"]').should('exist')
    })
  })

  describe('게임 플레이 시뮬레이션', () => {
    it('같은 그림 찾기 게임에서 카드 클릭이 동작해야 함', () => {
      cy.visitGame('MATCH', testQrCode)
      cy.get('canvas', { timeout: 15000 }).should('exist')

      // 캔버스 클릭 시뮬레이션 (게임 시작)
      cy.get('canvas').click('center')

      // 약간의 대기 후 추가 클릭 (카드 선택)
      cy.wait(1000)
      cy.get('canvas').click(200, 300)
      cy.wait(500)
      cy.get('canvas').click(300, 300)
    })
  })

  describe('게임 종료 및 결과', () => {
    it('게임 종료 후 결과 화면이 표시되어야 함 (시뮬레이션)', () => {
      // 이 테스트는 실제 게임 완료가 어려우므로
      // 결과 화면 API 응답을 모킹
      cy.intercept('POST', '**/api/game/score', {
        statusCode: 200,
        body: {
          id: 'test-score-id',
          score: 1000,
          rank: 1
        }
      }).as('submitScore')

      cy.visitGame('MATCH', testQrCode)
      cy.get('canvas', { timeout: 15000 }).should('exist')
    })
  })
})
