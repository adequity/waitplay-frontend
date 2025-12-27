/// <reference types="cypress" />
import './commands'

// 전역 에러 핸들링
Cypress.on('uncaught:exception', (err) => {
  // 특정 에러 무시 (프로덕션 환경에서 발생할 수 있는 에러)
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  if (err.message.includes('Failed to fetch dynamically imported module')) {
    return false
  }
  return true
})

// 테스트 전 로컬 스토리지 클리어
beforeEach(() => {
  cy.clearLocalStorage()
  cy.clearCookies()
})
