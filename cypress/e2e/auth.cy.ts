/// <reference types="cypress" />

describe('인증 시스템 테스트', () => {
  const apiUrl = Cypress.env('apiUrl')

  describe('로그인 페이지', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('로그인 페이지가 정상적으로 로드되어야 함', () => {
      cy.url().should('include', '/login')
      // 아이디 입력 필드 (type="text", placeholder="아이디를 입력하세요")
      cy.get('input.input-apple[type="text"]').should('be.visible')
      // 비밀번호 입력 필드
      cy.get('input.input-apple[type="password"]').should('be.visible')
      // 로그인 버튼
      cy.get('button.login-btn-apple').should('be.visible')
    })

    it('빈 필드로 로그인 시도 시 에러가 표시되어야 함', () => {
      cy.get('button.login-btn-apple').click()
      // 브라우저 기본 validation (required 속성)
      cy.get('input:invalid').should('exist')
    })

    it('잘못된 자격 증명으로 로그인 시 에러가 표시되어야 함', () => {
      cy.get('input.input-apple[type="text"]').type('wronguser')
      cy.get('input.input-apple[type="password"]').type('wrongpassword')
      cy.get('button.login-btn-apple').click()

      // 에러 메시지 확인 (.error-message-apple 클래스)
      cy.get('.error-message-apple', { timeout: 10000 }).should('be.visible')
    })

    it('회원가입 링크가 존재해야 함', () => {
      cy.get('a[href="/signup"]').should('be.visible')
    })

    it('비밀번호 찾기 링크가 존재해야 함', () => {
      cy.get('a[href="/forgot-password"]').should('be.visible')
    })

    it('아이디 저장 체크박스가 존재해야 함', () => {
      cy.get('input.remember-checkbox-apple[type="checkbox"]').should('exist')
    })

    it('SNS 로그인 버튼들이 존재해야 함', () => {
      cy.get('button.kakao-btn').should('be.visible')
      cy.get('button.naver-btn').should('be.visible')
    })
  })

  describe('회원가입 페이지', () => {
    beforeEach(() => {
      cy.visit('/signup')
    })

    it('회원가입 페이지가 정상적으로 로드되어야 함', () => {
      cy.url().should('include', '/signup')
    })

    it('필수 입력 필드가 모두 존재해야 함', () => {
      // 이름 필드
      cy.get('input.form-input[placeholder="홍길동"]').should('be.visible')
      // 이메일 필드
      cy.get('input.form-input[type="email"]').should('be.visible')
      // 비밀번호 필드 (2개: 비밀번호, 비밀번호 확인)
      cy.get('input.form-input[type="password"]').should('have.length', 2)
    })

    it('사업자 토글이 존재해야 함', () => {
      cy.get('input.toggle-checkbox[type="checkbox"]').should('exist')
    })

    it('사업자 토글 활성화 시 사업자 정보 필드가 표시되어야 함', () => {
      // 토글 클릭
      cy.get('.toggle-label').click()

      // 사업자 정보 필드 확인
      cy.get('.business-info-section').should('be.visible')
      cy.get('input.form-input[placeholder*="WaitPlay"]').should('be.visible')
      cy.get('input.form-input[placeholder="000-00-00000"]').should('be.visible')
    })

    it('이용약관 동의 체크박스가 존재해야 함', () => {
      cy.get('.terms-section').should('be.visible')
      cy.get('input.checkbox-input[type="checkbox"]').should('have.length.at.least', 1)
    })

    it('로그인 링크가 존재해야 함', () => {
      cy.get('a.footer-link').contains('로그인').should('be.visible')
    })

    it('SNS 간편 가입 버튼들이 존재해야 함', () => {
      cy.get('button.btn-naver').should('be.visible')
      cy.get('button.btn-kakao').should('be.visible')
    })
  })

  describe('비밀번호 찾기', () => {
    beforeEach(() => {
      cy.visit('/forgot-password')
    })

    it('비밀번호 찾기 페이지가 로드되어야 함', () => {
      cy.url().should('include', '/forgot-password')
    })

    it('이메일 입력 필드가 존재해야 함', () => {
      cy.get('input[type="email"], input[placeholder*="이메일"]').should('be.visible')
    })
  })

  describe('인증 상태 유지', () => {
    it('로그아웃 시 토큰이 삭제되어야 함', () => {
      // 먼저 토큰 설정
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'test-token')
        win.localStorage.setItem('refreshToken', 'test-refresh-token')
      })

      cy.logout()

      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.be.null
        expect(win.localStorage.getItem('refreshToken')).to.be.null
      })
    })
  })

  describe('API 인증 테스트', () => {
    it('유효하지 않은 토큰으로 보호된 API 호출 시 401 응답', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/auth/me`,
        headers: {
          Authorization: 'Bearer invalid-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })

    it('토큰 없이 보호된 API 호출 시 401 응답', () => {
      cy.request({
        method: 'GET',
        url: `${apiUrl}/api/auth/me`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401)
      })
    })

    it('토큰 갱신 API가 올바르게 동작해야 함', () => {
      cy.request({
        method: 'POST',
        url: `${apiUrl}/api/auth/refresh`,
        body: {
          refreshToken: 'invalid-refresh-token'
        },
        failOnStatusCode: false
      }).then((response) => {
        // 유효하지 않은 토큰이므로 401
        expect(response.status).to.eq(401)
      })
    })
  })
})
