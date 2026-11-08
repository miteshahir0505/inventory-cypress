describe('Login suite', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('logs in with valid credentials', () => {
    cy.get('[data-cy="login-username"]').type('admin');
    cy.get('[data-cy="login-password"]').type('secret123');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="inventory-view"]').should('be.visible');
  });

  it('shows an error and stays on login with invalid credentials', () => {
    cy.get('[data-cy="login-username"]').type('admin');
    cy.get('[data-cy="login-password"]').type('wrong-password');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]').should('contain', 'Invalid credentials');
    cy.get('[data-cy="inventory-view"]').should('not.be.visible');
  });

  it('shows a validation error when both fields are empty', () => {
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]').should('contain', 'Username and password are required');
    cy.get('[data-cy="inventory-view"]').should('not.be.visible');
  });

  it('rejects a SQL injection string in the username field', () => {
    cy.get('[data-cy="login-username"]').type("' OR '1'='1");
    cy.get('[data-cy="login-password"]').type('password');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]').should('contain', 'Invalid credentials');
    cy.get('[data-cy="inventory-view"]').should('not.be.visible');
  });

  it('rejects an XSS string in the username field', () => {
    cy.get('[data-cy="login-username"]').type('<script>alert("XSS")</script>');
    cy.get('[data-cy="login-password"]').type('password');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="login-error"]').should('contain', 'Invalid credentials');
    cy.get('[data-cy="inventory-view"]').should('not.be.visible');
  });

  it('stores the token in sessionStorage after login', () => {
    cy.get('[data-cy="login-username"]').type('admin');
    cy.get('[data-cy="login-password"]').type('secret123');
    cy.get('[data-cy="login-submit"]').click();
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('token')).to.equal('fake-jwt-token');
    });
  });

  it('logs out and removes the token', () => {
    cy.get('[data-cy="login-username"]').type('admin');
    cy.get('[data-cy="login-password"]').type('secret123');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="logout-btn"]').click();
    cy.get('[data-cy="login-view"]').should('be.visible');
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('token')).to.be.null;
    });
  });

  it('returns to login after the token is removed and the page reloads', () => {
    cy.get('[data-cy="login-username"]').type('admin');
    cy.get('[data-cy="login-password"]').type('secret123');
    cy.get('[data-cy="login-submit"]').click();
    cy.get('[data-cy="inventory-view"]').should('be.visible');

    cy.window().then((win) => {
      win.sessionStorage.removeItem('token');
    });

    cy.reload();

    cy.get('[data-cy="login-view"]').should('be.visible');
    cy.get('[data-cy="inventory-view"]').should('not.be.visible');
  });
  
});