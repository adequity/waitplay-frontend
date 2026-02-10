# AI Skill: Cypress Testing

Copy and paste this prompt to Claude to generate a new Cypress E2E test.

## Prompt Template

```markdown
Create a Cypress E2E test file for the feature: `[FeatureName]`.
Path: `cypress/e2e/[featureName].cy.ts`

**Requirements:**

1.  **Describe Block**: `describe('[FeatureName]', () => { ... })`
2.  **BeforeEach**: Visit the relevant page (`cy.visit(...)`) and ensure authentication if needed.
3.  **Test Cases**:
    - `it('should render successfully', ...)`
    - `it('should handle user interaction [interaction]', ...)`
    - `it('should handle error state', ...)` (Mock API failure if applicable)
4.  **Selectors**:
    - Prefer `data-testid` if available.
    - Otherwise use robust selectors like `cy.contains`, `cy.get('button[type="submit"]')`.
    - Avoid brittle CSS paths like `div > div:nth-child(3)`.

**Mocking API (Optional but Recommended for Stability):**
cy.intercept('GET', '/api/endpoint', { fixture: 'success.json' }).as('getData');
cy.wait('@getData');
```
