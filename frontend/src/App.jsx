import { BrowserRouter, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router';
import { useState, useEffect } from 'react';
import { Leaf, Search, ChevronDown, Activity, Box, Star, ArrowRight, ArrowLeft, AlertCircle, X, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

// Funções utilitárias
const getEcoScore = (product) => {
  let score = 10;
  if (product.packaging === 'plastico') score -= 4;
  if (product.packaging === 'reciclavel') score -= 1;
  if (product.origin === 'importado') score -= 3;
  return Math.max(0, score);
};

const getScoreColor = (score) => {
  if (score >= 8) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 5) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-rose-100 text-rose-700 border-rose-200";
};

// --- COMPONENTE: PAINEL ADMINISTRATIVO (MODAL) ---
function AdminPanel({ onClose }) {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Bebidas');
  const [packaging, setPackaging] = useState('plastico');
  const [origin, setOrigin] = useState('local');
  const [adminMessage, setAdminMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/products');
      setProducts(response.data);
    } catch (err) {
      console.error("Erro ao buscar produtos", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/products/${editingId}`, { name, category, packaging, origin });
        setAdminMessage('✅ Produto atualizado com sucesso!');
      } else {
        await axios.post('http://localhost:3001/api/products', { name, category, packaging, origin });
        setAdminMessage('✅ Produto cadastrado com sucesso!');
      }
      setName('');
      setEditingId(null);
      fetchProducts();
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setAdminMessage(''), 3000);
    } catch (err) {
      setAdminMessage('❌ Erro ao salvar produto.');
    }
  };

  const handleEdit = (prod) => {
    setEditingId(prod.id);
    setName(prod.name);
    setCategory(prod.category);
    setPackaging(prod.packaging);
    setOrigin(prod.origin);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/products/${id}`);
      setAdminMessage('🗑️ Produto excluído com sucesso!');
      fetchProducts();
      setTimeout(() => setAdminMessage(''), 3000);
    } catch (err) {
      setAdminMessage('❌ Erro ao excluir produto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="text-sm text-gray-500 font-medium">Gestão de catálogo e base de conhecimento</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Formulário de Cadastro/Edição */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              {editingId ? <span className="text-amber-500"><Edit2 className="w-5 h-5"/></span> : <span className="text-emerald-500">➕</span>}
              {editingId ? 'Editar Produto' : 'Adicionar Novo Produto'}
            </h3>
            
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Produto</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Garrafa de Vidro" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Categoria</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                    <option value="Bebidas">Bebidas</option>
                    <option value="Vestuario">Vestuário</option>
                    <option value="Cosmeticos">Cosméticos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Embalagem</label>
                  <select value={packaging} onChange={(e) => setPackaging(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                    <option value="plastico">Plástico (Alta Pegada)</option>
                    <option value="reciclavel">Reciclável (Média)</option>
                    <option value="nenhuma">Nenhuma (Sustentável)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Origem Logística</label>
                  <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer">
                    <option value="local">Local (Baixa Emissão)</option>
                    <option value="importado">Importado (Alta Emissão)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="submit" className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors shadow-sm ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                  {editingId ? 'Atualizar Produto' : 'Cadastrar Produto'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setName(''); }} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
            
            {adminMessage && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-bold text-center ${adminMessage.includes('❌') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {adminMessage}
              </div>
            )}
          </div>

          {/* Lista de Produtos */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Catálogo Existente ({products.length})</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Categoria</th>
                    <th className="py-3 px-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{prod.name}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-600 hidden sm:table-cell">{prod.category}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleEdit(prod)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors inline-flex mr-2" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prod.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors inline-flex" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTE: TELA INICIAL (CATÁLOGO) ---
function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, averageScore: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, metRes] = await Promise.all([
          axios.get('http://localhost:3001/api/products'),
          axios.get('http://localhost:3001/api/metrics')
        ]);
        setProducts(prodRes.data);
        setMetrics(metRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados", err);
      }
    };
    fetchData();
  }, []);

  const topProducts = [...products]
    .map(p => ({ ...p, score: getEcoScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() || category) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&cat=${encodeURIComponent(category)}`);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full">
      <section className="relative w-full bg-emerald-900 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=1080" 
            alt="Natureza" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 to-emerald-950/90" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-800/60 text-emerald-100 text-sm font-bold tracking-wide uppercase mb-6 border border-emerald-700/50 backdrop-blur-sm">
            Catálogo de Descoberta
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
            Descubra o verdadeiro <br className="hidden md:block"/> impacto do que você consome.
          </h1>
          <p className="text-lg md:text-xl text-emerald-100/90 mb-10 max-w-2xl mx-auto font-medium">
            Faça escolhas mais verdes. Pesquise produtos, veja seu EcoScore e encontre alternativas sustentáveis para o seu dia a dia.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center relative pl-4 bg-gray-50 rounded-xl">
              <Search className="text-gray-400 w-5 h-5 absolute left-4" />
              <input 
                type="text" 
                placeholder="Busque por produto..." 
                className="w-full bg-transparent py-4 pl-10 pr-4 text-gray-700 outline-none font-medium placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative md:w-48 bg-gray-50 rounded-xl flex items-center px-4 border-t md:border-t-0 md:border-l border-gray-100">
              <select 
                className="w-full bg-transparent py-4 text-gray-700 outline-none font-medium appearance-none cursor-pointer pr-6"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Categorias</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Vestuario">Vestuário</option>
                <option value="Cosmeticos">Cosméticos</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-4 pointer-events-none" />
            </div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] w-full md:w-auto">
              Pesquisar
            </button>
          </form>
        </div>
      </section>

      <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-16 w-full mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Box className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Catalogado</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-gray-900">{metrics.total}</h3>
                <span className="text-sm font-medium text-gray-400">produtos analisados</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Média de Sustentabilidade</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-extrabold text-gray-900">{metrics.averageScore}</h3>
                <span className="text-sm font-medium text-gray-400">/10 pts (EcoScore global)</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Star className="text-amber-400 w-6 h-6 fill-amber-400" />
              Destaques Sustentáveis
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group flex flex-col h-full cursor-pointer">
                <div className="relative h-48 w-full bg-emerald-50 flex items-center justify-center overflow-hidden">
                  <span className="text-7xl group-hover:scale-110 transition-transform duration-500">
                    {product.category === 'Bebidas' ? '🥤' : product.category === 'Vestuario' ? '👕' : '🧴'}
                  </span>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-extrabold text-gray-800 shadow-sm flex items-center gap-1">
                      {product.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1.5 rounded-xl text-sm font-extrabold shadow-sm border ${getScoreColor(product.score)}`}>
                      Nota {product.score.toFixed(1)}/10
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Origem: {product.origin}</span>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-4 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-600 line-clamp-1">{product.packaging}</span>
                    <button className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- COMPONENTE: TELA DE RESULTADOS DA BUSCA ---
function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      try {
        setError('');
        setResult(null);
        const url = `http://localhost:3001/api/products/search?name=${encodeURIComponent(query)}${cat ? `&category=${encodeURIComponent(cat)}` : ''}`;
        const response = await axios.get(url);
        setResult(response.data);
      } catch (err) {
        setError('Produto não encontrado ou não corresponde aos filtros.');
      } finally {
        setLoading(false);
      }
    };
    
    if (query || cat) fetchSearch();
  }, [query, cat]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" />
        Voltar ao Catálogo
      </Link>

      {loading ? (
        <div className="text-center py-20 text-gray-500 font-bold text-xl animate-pulse">
          Analisando impacto ambiental...
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-700 mb-2">Ops! Nada encontrado.</h2>
          <p className="text-rose-600">{error}</p>
        </div>
      ) : result ? (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8 mb-8">
              <div>
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold uppercase tracking-wider mb-3">
                  {result.category}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{result.name}</h1>
              </div>
              <div className={`px-6 py-4 rounded-2xl border-2 text-center shrink-0 ${getScoreColor(result.score)}`}>
                <p className="text-sm font-bold uppercase tracking-wider opacity-80 mb-1">EcoScore</p>
                <p className="text-4xl font-black">{result.score}/10</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 font-semibold mb-1">Embalagem</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{result.packaging}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 font-semibold mb-1">Origem / Logística</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{result.origin}</p>
              </div>
            </div>
          </div>

          {result.alternatives && result.alternatives.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <Leaf className="text-emerald-500 w-6 h-6" />
                Alternativas mais Sustentáveis
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {result.alternatives.map(alt => (
                  <div key={alt.id} className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-950 mb-1">{alt.name}</h3>
                      <p className="text-emerald-700 font-medium text-sm">
                        Embalagem: {alt.packaging} | Origem: {alt.origin}
                      </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100 text-emerald-700 font-black text-lg">
                      Nota {alt.score}/10
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// --- COMPONENTE DE LAYOUT ---
function Layout({ children }) {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] font-['Nunito',sans-serif]">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Leaf size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">EcoScore Scanner</span>
          </Link>
          <nav className="hidden sm:flex gap-6">
            <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
              Descobrir
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full h-full">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 font-medium">
            &copy; 2026 EcoScore Scanner. ODS 12 - Consumo e Produção Responsáveis.
          </p>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="text-sm font-semibold text-gray-400 hover:text-emerald-600 transition-colors"
          >
            Acesso Restrito (Admin)
          </button>
        </div>
      </footer>

      {/* Renderização do Painel Administrativo */}
      {isAdminOpen && <AdminPanel onClose={() => setIsAdminOpen(false)} />}
    </div>
  );
}

// --- APP PRINCIPAL ---
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;