describe('Products network', () => {
  beforeEach(() => {
    cy.request('POST', '/api/reset');
    cy.login('admin', 'secret123');
  });

  it('loads products from the API', () => {
    cy.intercept('GET', '/api/products').as('getProducts');
    cy.visit('/');
    cy.wait('@getProducts').its('response.statusCode').should('eq', 200);
    cy.get('[data-cy="product-row"]').should('have.length', 3);
  });

  it('sends the right request when adding a product', () => {
    cy.intercept('POST', '/api/products').as('createProduct');
    cy.visit('/');
    cy.get('[data-cy="product-name"]').type('Monitor');
    cy.get('[data-cy="product-sku"]').type('MON-001');
    cy.get('[data-cy="product-price"]').type('100');
    cy.get('[data-cy="product-quantity"]').type('10');
    cy.get('[data-cy="product-save"]').click();
    cy.get('[data-cy="product-row"]').should('have.length', 4);
    cy.wait('@createProduct').then(({ request, response }) => {
      expect(request.body).to.deep.include({ name: 'Monitor', sku: 'MON-001' });
      expect(response?.statusCode).to.eq(201);
      expect(response?.body).to.have.property('id');
    });
  });
});