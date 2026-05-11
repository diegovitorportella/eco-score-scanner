function calculateEcoScore(product) {
    let score = 10; 
    
    if (product.packaging === 'plastico') score -= 4;
    if (product.packaging === 'reciclavel') score -= 1;
    if (product.origin === 'importado') score -= 3;
    
    return Math.max(0, score);
}

module.exports = { calculateEcoScore };