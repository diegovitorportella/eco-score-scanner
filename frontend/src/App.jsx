import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const searchProduct = async () => {
    if (!query) return;
    
    try {
      setError('');
      setResult(null);
      const response = await axios.get(`http://localhost:3001/api/products/search?name=${query}`);
      setResult(response.data);
    } catch (err) {
      setResult(null);
      setError('Produto não encontrado no banco de dados. Tente "Garrafa", "Camiseta" ou "Shampoo".');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>🌱 EcoScore Scanner</h1>
      <p>Consulte o impacto ambiental do seu produto</p>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
        <input 
          type="text" 
          placeholder="Digite o nome do produto..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchProduct()}
          style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={searchProduct}
          style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', backgroundColor: '#2e7d32', color: 'white', cursor: 'pointer' }}
        >
          Buscar
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>{result.name}</h2>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Categoria:</strong> {result.category}</p>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Embalagem:</strong> {result.packaging}</p>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Origem:</strong> {result.origin}</p>
          
          <div style={{ marginTop: '20px', padding: '15px', borderRadius: '5px', backgroundColor: result.score > 5 ? '#e8f5e9' : '#ffebee' }}>
            <h3 style={{ margin: '0', color: result.score > 5 ? '#2e7d32' : '#c62828' }}>
              Nota de Sustentabilidade: {result.score} / 10
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;