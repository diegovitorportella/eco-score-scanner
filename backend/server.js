const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Motor de Cálculo do Eco-Score
function calculateEcoScore(product) {
    let score = 10; 
    if (product.packaging === 'plastico') score -= 4;
    if (product.packaging === 'reciclavel') score -= 1;
    if (product.origin === 'importado') score -= 3;
    return Math.max(0, score);
}

// ==========================================
// ROTAS DE BUSCA E SUGESTÃO
// ==========================================

// Busca com Filtro Avançado (Nome e Categoria)
app.get('/api/products/search', async (req, res) => {
    const { name, category } = req.query;
    
    try {
        // Monta a query dinamicamente
        let whereClause = { name: { contains: name, mode: 'insensitive' } };
        
        // Se o usuário selecionou uma categoria no filtro, adiciona à query
        if (category) {
            whereClause.category = category;
        }

        const product = await prisma.product.findFirst({
            where: whereClause
        });

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado ou não corresponde ao filtro.' });
        }

        const score = calculateEcoScore(product);
        
        // Busca alternativas da mesma categoria com score potencialmente melhor
        const rawAlternatives = await prisma.product.findMany({
            where: {
                category: product.category,
                NOT: { id: product.id }
            },
            take: 10
        });

        // Calcula o score das alternativas e filtra as melhores
        const alternatives = rawAlternatives
            .map(alt => ({ ...alt, score: calculateEcoScore(alt) }))
            .filter(alt => alt.score > score)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);

        res.json({ ...product, score, alternatives });
        
    } catch (error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// ==========================================
// ROTAS DO PAINEL ADMINISTRATIVO (CRUD)
// ==========================================

// Listar todos os produtos (Para a tabela do Admin)
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'desc' } 
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Cadastro de Produtos
app.post('/api/products', async (req, res) => {
    const { name, category, packaging, origin } = req.body;

    if (!name || !category || !packaging || !origin) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const newProduct = await prisma.product.create({
            data: { name, category, packaging, origin }
        });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar produto.' });
    }
});

// Atualizar (Update) Produto
app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, category, packaging, origin } = req.body;
    
    try {
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { name, category, packaging, origin }
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
});

// Excluir (Delete) Produto
app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
});

// ==========================================
// ROTAS DO DASHBOARD (MÉTRICAS)
// ==========================================

// Obter dados analíticos
app.get('/api/metrics', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        const total = products.length;
        
        if (total === 0) {
            return res.json({ total: 0, averageScore: 0 });
        }

        // Soma os scores de todos os produtos e divide pelo total
        const totalScore = products.reduce((acc, curr) => acc + calculateEcoScore(curr), 0);
        const averageScore = (totalScore / total).toFixed(1);

        res.json({ total, averageScore });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar métricas.' });
    }
});

// ==========================================
// ROTA AUXILIAR (SEED)
// ==========================================

// Rota para popular banco rapidamente
app.get('/api/seed', async (req, res) => {
    try {
        await prisma.product.deleteMany();
        await prisma.product.createMany({
            data: [
                { name: 'Garrafa de Agua', category: 'Bebidas', packaging: 'plastico', origin: 'local' },
                { name: 'Garrafa de Vidro Coletiva', category: 'Bebidas', packaging: 'reciclavel', origin: 'local' },
                { name: 'Suco em Capsula alumínio', category: 'Bebidas', packaging: 'plastico', origin: 'importado' },
                { name: 'Camiseta de Algodao', category: 'Vestuario', packaging: 'nenhuma', origin: 'importado' },
                { name: 'Camiseta Organica Local', category: 'Vestuario', packaging: 'nenhuma', origin: 'local' },
                { name: 'Shampoo Solido', category: 'Cosmeticos', packaging: 'reciclavel', origin: 'local' }
            ]
        });
        res.send('✅ Banco de dados populado com sucesso!');
    } catch (error) {
        res.status(500).json({ error: 'Erro ao popular banco.' });
    }
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001 🌱');
});