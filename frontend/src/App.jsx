import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tab, setTab] = useState('search'); // 'search' ou 'admin'
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Estados do Formulário Admin
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bebidas');
  const [packaging, setPackaging] = useState('plastico');
  const [origin, setOrigin] = useState('local');
  const [adminMessage, setAdminMessage] = useState('');

  const searchProduct = async () => {
    if (!query) return;
    try {
      setError('');
      setResult(null);
      const response = await axios.get(`http://localhost:3001/api/products/search?name=${query}`);
      setResult(response.data);
    } catch (err) {
      setResult(null);
      setError('Produto não encontrado.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/products', { name, category, packaging, origin });
      setAdminMessage('✅ Produto cadastrado com sucesso!');
      setName('');
    } catch (err) {
      setAdminMessage('❌ Erro ao cadastrar produto.');
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <nav style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
        <button onClick={() => setTab('search')} style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: tab === 'search' ? 'bold' : 'normal' }}>Buscar Eco-Score</button>
        <button onClick={() => setTab('admin')} style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: tab === 'admin' ? 'bold' : 'normal' }}>Painel Administrativo</button>
      </nav>

      {tab === 'search' ? (
        <div style={{ textAlign: 'center' }}>
          <h1>🌱 EcoScore Scanner</h1>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
            <input type="text" placeholder="Ex: Garrafa..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ padding: '10px', width: '60%' }} />
            <button onClick={searchProduct} style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none' }}>Buscar</button>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {result && (
            <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
              <h2 style={{ color: '#111', marginTop: '0' }}>{result.name} (Nota: {result.score}/10)</h2>
              <p style={{ color: '#333', fontSize: '16px' }}>Categoria: {result.category} | Embalagem: {result.packaging} | Origem: {result.origin}</p>
              
              {result.alternatives && result.alternatives.length > 0 && (
                <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '15px' }}>
                  <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>💡 Alternativas mais Sustentáveis Recomendadas:</h4>
                  {result.alternatives.map(alt => (
                    <div key={alt.id} style={{ padding: '10px', background: '#e8f5e9', margin: '5px 0', borderRadius: '4px', color: '#111' }}>
                      <strong>{alt.name}</strong> - Nota: {alt.score}/10 (Embalagem: {alt.packaging})
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>🏢 Cadastro de Produtos (Módulo Administrativo)</h2>
          <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <label>Nome do Produto:
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>
            <label>Categoria:
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                <option value="Bebidas">Bebidas</option>
                <option value="Vestuario">Vestuário</option>
                <option value="Cosmeticos">Cosméticos</option>
              </select>
            </label>
            <label>Tipo de Embalagem:
              <select value={packaging} onChange={(e) => setPackaging(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                <option value="plastico">Plástico (Alta Pegada)</option>
                <option value="reciclavel">Reciclável/Papel (Média Pegada)</option>
                <option value="nenhuma">Nenhuma Embalagem (Sustentável)</option>
              </select>
            </label>
            <label>Origem Logística:
              <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                <option value="local">Local (Baixa emissão)</option>
                <option value="importado">Importado (Alta emissão de CO2)</option>
              </select>
            </label>
            <button type="submit" style={{ padding: '12px', backgroundColor: '#1976d2', color: 'white', border: 'none', cursor: 'pointer' }}>Cadastrar Produto</button>
          </form>
          {adminMessage && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{adminMessage}</p>}
        </div>
      )}
    </div>
  );
}

export default App;