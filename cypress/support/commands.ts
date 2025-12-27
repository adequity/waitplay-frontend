/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 이메일/비밀번호로 로그인
       */
      login(email: string, password: string): Chainable<void>

      /**
       * 로그아웃
       */
      logout(): Chainable<void>

      /**
       * API 로그인 후 토큰 저장
       */
      apiLogin(email: string, password: string): Chainable<void>

      /**
       * QR 코드로 고객 페이지 접속
       */
      visitCustomerPage(qrCode?: string): Chainable<void>

      /**
       * Admin 페이지 접속 (로그인 필요)
       */
      visitAdminPage(): Chainable<void>

      /**
       * 게임 페이지 접속
       */
      visitGame(gameType: string, qrCode?: string): Chainable<void>

      /**
       * 토큰이 유효한지 확인
       */
      checkAuth(): Chainable<boolean>

      /**
       * 테스트 데이터 초기화
       */
      resetTestData(): Chainable<void>
    }
  }
}

// 이메일/비밀번호 로그인
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[type="email"], input[placeholder*="이메일"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"], button:contains("로그인")').click()
  cy.url().should('not.include', '/login')
})

// 로그아웃
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('accessToken')
    win.localStorage.removeItem('refreshToken')
    win.localStorage.removeItem('user')
  })
  cy.visit('/')
})

// API를 통한 로그인 (UI 없이)
Cypress.Commands.add('apiLogin', (email: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl')

  cy.request({
    method: 'POST',
    url: `${apiUrl}/api/auth/standard-login`,
    body: {
      username: email,
      password: password
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      const { accessToken, refreshToken, userId, nickname, userRole, company } = response.body
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', accessToken)
        win.localStorage.setItem('refreshToken', refreshToken)
        win.localStorage.setItem('user', JSON.stringify({
          id: userId,
          nickname,
          userRole,
          company
        }))
      })
    }
  })
})

// 고객 페이지 접속
Cypress.Commands.add('visitCustomerPage', (qrCode?: string) => {
  const testQrCode = qrCode || Cypress.env('testQrCode')
  if (testQrCode) {
    cy.visit(`/customer?qr=${testQrCode}`)
  } else {
    cy.visit('/customer')
  }
})

// Admin 페이지 접속
Cypress.Commands.add('visitAdminPage', () => {
  cy.visit('/admin')
})

// 게임 페이지 접속
Cypress.Commands.add('visitGame', (gameType: string, qrCode?: string) => {
  const testQrCode = qrCode || Cypress.env('testQrCode')
  const query = testQrCode ? `?qr=${testQrCode}` : ''
  cy.visit(`/game/${gameType}${query}`)
})

// 인증 상태 확인
Cypress.Commands.add('checkAuth', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('accessToken')
    return !!token
  })
})

// 테스트 데이터 초기화 (필요시 구현)
Cypress.Commands.add('resetTestData', () => {
  // 테스트 데이터 초기화 API 호출 (있다면)
  cy.log('Test data reset - not implemented')
})

export {}
