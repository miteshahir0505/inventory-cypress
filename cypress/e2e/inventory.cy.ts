describe('Inventory', () => {
  beforeEach(() => {
    cy.request('POST', '/api/reset');
    cy.login('admin', 'secret123');
    cy.visit('/');
  });

  it('shows the three seed products', () => {
    cy.get('[data-cy="product-row"]').should('have.length', 3);
  });

  it('adds a new product', () => {
    cy.get('[data-cy="product-name"]').type('Monitor');
    cy.get('[data-cy="product-sku"]').type('MON-001');
    cy.get('[data-cy="product-price"]').type('100');
    cy.get('[data-cy="product-quantity"]').type('10');
    cy.get('[data-cy="product-save"]').click();
    cy.get('[data-cy="product-row"]').should('have.length', 4);
    cy.contains('[data-cy="product-row"]', 'Monitor').should('be.visible');
  });

  it('deletes a product', () => {
  cy.get('[data-cy="product-delete"]').first().click();
  cy.get('[data-cy="product-row"]').should('have.length', 2);
  cy.contains('[data-cy="product-row"]', 'Laptop').should('not.exist');
});
});