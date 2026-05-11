const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { calculateEcoScore } = require('./ecoscore');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Rota principal: Busca o produto e calcula a nota na hora
app.get('/api/products/search', async (req, res) => {
    const { name } = req.query;
    
    try {
        const product = await prisma.product.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } }
        });

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const finalScore = calculateEcoScore(product);
        res.json({ ...product, score: finalScore });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Rota auxiliar para popular o banco rápido (para os testes do TP3)
app.get('/api/seed', async (req, res) => {
    try {
        await prisma.product.createMany({
            data: [
                { name: 'Garrafa de Água', category: 'Bebidas', packaging: 'plastico', origin: 'local' },
                { name: 'Camiseta de Algodão', category: 'Vestuário', packaging: 'nenhuma', origin: 'importado' },
                { name: 'Shampoo Sólido', category: 'Cosméticos', packaging: 'reciclavel', origin: 'local' }
            ]
        });
        res.send('✅ Banco de dados populado com 3 produtos de teste! Já pode testar a busca.');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao popular banco. Talvez os produtos já existam.' });
    }
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001 🌱');
});