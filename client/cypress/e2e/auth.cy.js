describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should show validation errors for empty form submission', () => {
    cy.get('[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[name="email"]').type('invalid@email.com');
    cy.get('[name="password"]').type('wrongpassword');
    cy.get('[type="submit"]').click();
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should redirect to home page after successful login', () => {
    cy.get('[name="email"]').type('test@example.com');
    cy.get('[name="password"]').type('password123');
    cy.get('[type="submit"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});
