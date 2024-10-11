Feature('login');

Scenario('test something', ({ I }) => {
    I.amOnPage('https://localhost:44316')
    I.fillField('Login de connexion','admin')
    I.fillField('Mot de Passe','admin')
    I.see('')
});
