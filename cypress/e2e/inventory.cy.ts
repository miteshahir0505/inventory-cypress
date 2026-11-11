const rows = () => cy.get('[data-cy="product-row"]');

describe('Inventory', () => {
    beforeEach(() => {
        cy.request('POST', '/api/reset');
        cy.login('admin', 'secret123');
        cy.visit('/');
    });

    it('shows the three seed products', () => {
        rows().should('have.length', 3);
    });

    it('shows every product the API returns', () => {
        cy.request('GET', '/api/products').its('body.length').then((count) => {
            rows().should('have.length', count);
        });
    });

    it('adds a new product', () => {
        rows().its('length').then((before) => {
            cy.addProduct({ name: 'Monitor', sku: 'MON-001', price: 100, quantity: 10 });
            rows().should('have.length', before + 1);
            cy.contains('[data-cy="product-row"]', 'Monitor').should('be.visible');
        });
    });

    it('deletes a product', () => {
        rows().its('length').then((before) => {
            cy.get('[data-cy="product-delete"]').first().click();
            rows().should('have.length', before - 1);
            cy.contains('[data-cy="product-row"]', 'Laptop').should('not.exist');
        });
    });

    it('shows an error when required fields are empty', () => {
        rows().its('length').then((before) => {
            cy.get('[data-cy="product-save"]').click();
            cy.get('[data-cy="product-error"]')
                .should('be.visible')
                .and('contain', 'Invalid product data');
            rows().should('have.length', before);
        });
    });

    it('rejects a duplicate SKU', () => {
        rows().its('length').then((before) => {
            cy.get('[data-cy="product-name"]').type('Another Laptop');
            cy.get('[data-cy="product-sku"]').type('LAP-001');
            cy.get('[data-cy="product-price"]').type('500');
            cy.get('[data-cy="product-quantity"]').type('2');
            cy.get('[data-cy="product-save"]').click();
            cy.get('[data-cy="product-error"]')
                .should('be.visible')
                .and('contain', 'SKU already exists');
            rows().should('have.length', before);
        });
    });

    // CHANGE: replaces the invalidPrices block. Now covers price and quantity.
    const invalidCases: { label: string; price: string; quantity: string }[] = [
        { label: 'price -10', price: '-10', quantity: '5' },
        { label: 'price abc', price: 'abc', quantity: '5' },
        { label: 'quantity -1', price: '10', quantity: '-1' },
        { label: 'quantity abc', price: '10', quantity: 'abc' },
    ];

    invalidCases.forEach(({ label, price, quantity }) => {
        it(`rejects ${label}`, () => {
            rows().its('length').then((before) => {
                cy.get('[data-cy="product-name"]').type('Test item');
                cy.get('[data-cy="product-sku"]').type('TST-001');
                cy.get('[data-cy="product-price"]').type(price);
                cy.get('[data-cy="product-quantity"]').type(quantity);
                cy.get('[data-cy="product-save"]').click();

                cy.get('[data-cy="product-error"]')
                    .should('be.visible')
                    .and('contain', 'Invalid product data');
                rows().should('have.length', before);
            });
        });
    });

   it('shows HTML in a product name as literal text', () => {
    const payload = '<b>bold</b>';

    cy.get('[data-cy="product-name"]').type(payload);
    cy.get('[data-cy="product-sku"]').type('XSS-001');
    cy.get('[data-cy="product-price"]').type('10');
    cy.get('[data-cy="product-quantity"]').type('1');
    cy.get('[data-cy="product-save"]').click();

    // CHANGE: find('b') instead of find('[data-cy="product-name"]')
    cy.contains('[data-cy="product-row"]', 'XSS-001')
        .find('b')
        .should('not.exist');

    // CHANGE: assert on the row itself, not a child selector
    cy.contains('[data-cy="product-row"]', 'XSS-001')
        .should('contain', payload);
});

it.skip('shows an error when the server fails to save a product', () => {
    cy.intercept('POST', '/api/products', { statusCode: 500, body: { error: 'Server error' } }).as('saveProduct');

    rows().its('length').then((before) => {
        cy.get('[data-cy="product-name"]').type('Monitor');
        cy.get('[data-cy="product-sku"]').type('MON-001');
        cy.get('[data-cy="product-price"]').type('100');
        cy.get('[data-cy="product-quantity"]').type('10');
        cy.get('[data-cy="product-save"]').click();

        cy.wait('@saveProduct').its('response.statusCode').should('eq', 500);

        rows().should('have.length', before);
        cy.get('[data-cy="product-error"]').should('be.visible');
    });
});

});