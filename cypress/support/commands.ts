Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.request('POST', '/api/login', { username, password }).then((response) => {
      window.sessionStorage.setItem('token', response.body.token);
    });
  });
});
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(username: string, password: string): Chainable<void>;
    }
  }
}

export {};