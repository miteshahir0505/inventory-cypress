describe('Inventory', () => {
  beforeEach(() => {
    cy.login('admin', 'secret123');
    cy.visit('/');
  });

  it('shows the three seed products', () => {
    cy.get('[data-cy="product-row"]').should('have.length', 3);
  });
});