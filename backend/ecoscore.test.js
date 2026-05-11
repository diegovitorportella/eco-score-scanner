// backend/ecoscore.test.js
const { calculateEcoScore } = require('./ecoscore');

describe('Motor de Cálculo do Eco-Score', () => {
    
    test('Deve retornar nota 10 para produto ideal (sem embalagem e origem local)', () => {
        const product = { packaging: 'nenhuma', origin: 'local' };
        expect(calculateEcoScore(product)).toBe(10);
    });

    test('Deve descontar 4 pontos se a embalagem for de plástico', () => {
        const product = { packaging: 'plastico', origin: 'local' };
        expect(calculateEcoScore(product)).toBe(6);
    });

    test('Deve descontar 3 pontos se o produto for importado', () => {
        const product = { packaging: 'nenhuma', origin: 'importado' };
        expect(calculateEcoScore(product)).toBe(7);
    });

    test('Deve acumular os descontos (plástico + importado = nota 3)', () => {
        const product = { packaging: 'plastico', origin: 'importado' };
        expect(calculateEcoScore(product)).toBe(3);
    });

});