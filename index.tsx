
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// --- Configuración Supabase (PROYECTO: dnjtsfymqmhupallnkvi) ---
const SUPABASE_URL = 'https://dnjtsfymqmhupallnkvi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuanRzZnltcW1odXBhbGxua3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTUwNTQsImV4cCI6MjA4MjQ3MTA1NH0.0FKal89pt4a1GNN1GGZ1C1ztzCTY-ykErkTzvt8oNUA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Tipos e Interfaces ---
interface Category {
  id: string;
  name: string;
  description: string;
  img: string;
  color: string;
  order: number;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  sizes: string[];
}

interface CartItem extends Product {
  selectedSize: string;
  quantity: number;
}

interface SiteSettings {
  name: string;
  title: string;
  primaryColor: string;
  whatsapp: string;
  logo: string;
  heroTitle: string;
  heroDescription: string;
}

// --- Utilidades ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Subcomponentes ---

const ProductCard: React.FC<{ product: Product, onAdd: (p: Product, s: string) => void, primaryColor: string }> = ({ product, onAdd, primaryColor }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Única');

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        {product.mediaType === 'image' ? (
          <img src={product.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
        ) : (
          <video src={product.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm" style={{ color: primaryColor }}>
          NUEVO
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-400 text-[11px] mb-3 line-clamp-2 leading-tight h-8">{product.description}</p>
        
        <div className="mt-auto">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Talla disponible</span>
            <div className="flex flex-wrap gap-1">
              {product.sizes?.map(s => (
                <button 
                  key={s} 
                  onClick={() => setSelectedSize(s)}
                  className={`text-[10px] min-w-[32px] h-8 flex items-center justify-center border rounded-lg font-medium transition-colors ${selectedSize === s ? 'text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                  style={{ backgroundColor: selectedSize === s ? primaryColor : undefined, borderColor: selectedSize === s ? primaryColor : undefined }}
                >{s}</button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="font-black text-lg" style={{ color: primaryColor }}>${Number(product.price).toLocaleString()}</span>
            <button 
              onClick={() => onAdd(product, selectedSize)}
              className="text-white text-xs px-4 py-2 rounded-xl font-bold active:scale-95 transition-all shadow-md"
              style={{ backgroundColor: primaryColor, boxShadow: `0 4px 14px 0 ${primaryColor}44` }}
            >Agregar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = ({ cart, updateQuantity, checkout, onClose, primaryColor }: any) => {
  const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-800">Mi Carrito</h2>
            <p className="text-xs text-gray-400">{cart.length} artículos seleccionados</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-2xl text-gray-400">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-shopping-bag text-3xl opacity-20"></i>
              </div>
              <p className="font-medium">Tu carrito está vacío</p>
              <button onClick={onClose} className="mt-4 font-bold text-sm underline" style={{ color: primaryColor }}>Seguir comprando</button>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <img src={item.mediaUrl} className="w-20 h-24 object-cover rounded-xl shadow-sm" alt="" />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                    <button onClick={() => updateQuantity(item.id, item.selectedSize, -item.quantity)} className="text-gray-300 hover:text-red-500"><i className="fas fa-times text-xs"></i></button>
                  </div>
                  <p className="text-[11px] font-bold mt-1" style={{ color: primaryColor }}>Talla: {item.selectedSize}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 bg-white rounded-lg border p-1 shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">-</button>
                      <span className="w-6 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600">+</button>
                    </div>
                    <span className="font-black text-sm text-gray-800">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-t-[32px] shadow-inner">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Total a pagar</span>
            <span className="text-3xl font-black" style={{ color: primaryColor }}>${total.toLocaleString()}</span>
          </div>
          <button 
            onClick={checkout}
            disabled={cart.length === 0}
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-green-100"
          >
            <i className="fab fa-whatsapp text-xl"></i> PEDIR POR WHATSAPP
          </button>
          <p className="text-[10px] text-center text-gray-400 mt-4 px-4 leading-tight">Serás redirigido a WhatsApp para coordinar el pago y la entrega.</p>
        </div>
      </div>
    </div>
  );
};

// --- App Principal ---
const App = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    name: 'TUS CURVAS LINDAS',
    title: 'Tus Curvas Lindas - Moda Delivery',
    primaryColor: '#e91e63',
    whatsapp: '+573196968646',
    logo: '',
    heroTitle: 'Moda a tu medida',
    heroDescription: 'Delivery express de las mejores tendencias.'
  });

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar Datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: setRes } = await supabase.from('settings').select('data').eq('id', 'site_config').single();
        if (setRes) setSettings(setRes.data);

        const { data: catRes } = await supabase.from('categories').select('*').order('order', { ascending: true });
        if (catRes) setCategories(catRes);

        const { data: prodRes } = await supabase.from('products').select('*');
        if (prodRes) {
          const grouped: Record<string, Product[]> = {};
          prodRes.forEach((p: any) => {
            const mapped: Product = {
              id: p.id,
              category_id: p.category_id,
              name: p.name,
              description: p.description,
              price: Number(p.price),
              mediaUrl: p.media_url,
              mediaType: p.media_type,
              sizes: p.sizes || []
            };
            if (!grouped[p.category_id]) grouped[p.category_id] = [];
            grouped[p.category_id].push(mapped);
          });
          setProducts(grouped);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const savedUser = localStorage.getItem('tcl_user');
    if (savedUser === 'admin') setIsAdmin(true);
    
    fetchData();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.title = settings.title;
  }, [settings]);

  const handleLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('tcl_user', 'admin');
      setIsLoginOpen(false);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('tcl_user');
  };

  const addToCart = (product: Product, size: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => item.id === product.id && item.selectedSize === size 
          ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, selectedSize: size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const checkout = () => {
    if (cart.length === 0) return;
    let msg = `🛍️ *NUEVO PEDIDO - ${settings.name.toUpperCase()}*\n\nHola! Quiero realizar el siguiente pedido:\n\n`;
    cart.forEach(item => {
      msg += `• *${item.name}*\nTalla: ${item.selectedSize} | Cant: ${item.quantity}\nSubtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    msg += `💰 *TOTAL A PAGAR: $${total.toLocaleString()}*`;
    window.location.href = `https://wa.me/${settings.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  const syncAddCategory = async (newCat: any) => {
    const id = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const catData = { ...newCat, id, order: categories.length + 1 };
    const { error } = await supabase.from('categories').insert([catData]);
    if (!error) {
      setCategories(prev => [...prev, catData]);
      setProducts(prev => ({ ...prev, [id]: [] }));
    }
  };

  const syncRemoveCategory = async (id: string) => {
    if(!confirm('¿Eliminar esta categoría y todos sus productos?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id));
      setProducts(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const syncAddProduct = async (catId: string, prod: any) => {
    const dbProd = {
      id: Date.now().toString(),
      category_id: catId,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      media_url: prod.mediaUrl,
      media_type: prod.mediaType,
      sizes: prod.sizes
    };
    const { error } = await supabase.from('products').insert([dbProd]);
    if (!error) {
      setProducts(prev => ({
        ...prev,
        [catId]: [...(prev[catId] || []), { ...prod, id: dbProd.id, category_id: catId }]
      }));
    }
  };

  const syncRemoveProduct = async (catId: string, prodId: string) => {
    if(!confirm('¿Eliminar este producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', prodId);
    if (!error) {
      setProducts(prev => ({
        ...prev,
        [catId]: prev[catId].filter(p => p.id !== prodId)
      }));
    }
  };

  const syncUpdateSettings = async (newSettings: SiteSettings) => {
    const { error } = await supabase.from('settings').update({ data: newSettings }).eq('id', 'site_config');
    if (!error) setSettings(newSettings);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-pink-600 rounded-full animate-spin mb-4"></div>
        <p className="text-pink-600 font-bold animate-pulse">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('all')}>
            {settings.logo ? (
              <img src={settings.logo} className="w-10 h-10 object-contain rounded-xl shadow-lg" alt="Logo" />
            ) : (
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
                <i className="fas fa-crown text-xl"></i>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-gray-800 uppercase">{settings.name}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: settings.primaryColor }}>Premium Fashion</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: settings.primaryColor }}></div>
                <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: settings.primaryColor }}>Admin Activo</span>
                <button onClick={handleLogout} className="text-[10px] text-gray-400 hover:text-gray-800 ml-2">Salir</button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fas fa-user-circle text-2xl"></i>
              </button>
            )}
            
            <button onClick={() => setIsCartOpen(true)} className="relative group p-2 rounded-xl transition-colors">
              <i className="fas fa-shopping-bag text-2xl" style={{ color: settings.primaryColor }}></i>
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-4 ring-white group-hover:scale-110 transition-transform" style={{ backgroundColor: settings.primaryColor }}>
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Categorías Slider */}
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-50 flex gap-4 py-3 overflow-x-auto no-scrollbar scroll-smooth">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all ${activeTab === 'all' ? 'text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
            style={{ backgroundColor: activeTab === 'all' ? settings.primaryColor : undefined, boxShadow: activeTab === 'all' ? `0 10px 15px -3px ${settings.primaryColor}44` : undefined }}
          >TODOS</button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all border ${activeTab === cat.id ? 'text-white shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100'}`}
              style={{ 
                backgroundColor: activeTab === cat.id ? cat.color : undefined,
                boxShadow: activeTab === cat.id ? `0 10px 15px -3px ${cat.color}44` : undefined,
                borderColor: activeTab === cat.id ? cat.color : undefined
              }}
            >{cat.name.toUpperCase()}</button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[450px] md:h-[550px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ 
            backgroundImage: `url(${activeTab === 'all' ? (settings.heroTitle.startsWith('data:') ? settings.heroTitle : 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600') : (categories.find(c => c.id === activeTab)?.img || '')})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter italic uppercase">
              {activeTab === 'all' ? settings.heroTitle : (categories.find(c => c.id === activeTab)?.name)}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-xl mx-auto drop-shadow-lg leading-relaxed">
              {activeTab === 'all' ? settings.heroDescription : (categories.find(c => c.id === activeTab)?.description)}
            </p>
            {activeTab === 'all' && (
              <button 
                onClick={() => document.getElementById('main-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-10 bg-white px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all"
                style={{ color: settings.primaryColor }}
              >
                Ver Colección
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-grid" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-black text-xs uppercase tracking-widest mb-2 block" style={{ color: settings.primaryColor }}>Nuevos Ingresos</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
              {activeTab === 'all' ? 'Nuestra Colección' : `Colección ${categories.find(c => c.id === activeTab)?.name}`}
            </h2>
          </div>
          <div className="text-gray-400 text-sm font-medium">
             {activeTab === 'all' ? Object.values(products).flat().length : products[activeTab]?.length || 0} modelos disponibles
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {(activeTab === 'all' ? Object.values(products).flat() : products[activeTab] || []).map(prod => (
            <ProductCard key={prod.id} product={prod} onAdd={addToCart} primaryColor={settings.primaryColor} />
          ))}
        </div>
      </main>

      {/* Panel Flotante Admin */}
      {isAdmin && (
        <button onClick={() => setIsAdminPanelOpen(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 transition-transform z-[90] animate-bounce">
          <i className="fas fa-tools"></i>
        </button>
      )}

      {/* Modales */}
      {isLoginOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginOpen(false)} primaryColor={settings.primaryColor} />}
      {isAdminPanelOpen && (
        <AdminPanel 
          onClose={() => setIsAdminPanelOpen(false)} 
          categories={categories} 
          syncAddCategory={syncAddCategory}
          syncRemoveCategory={syncRemoveCategory}
          products={products}
          syncAddProduct={syncAddProduct}
          syncRemoveProduct={syncRemoveProduct}
          settings={settings}
          syncUpdateSettings={syncUpdateSettings}
        />
      )}
      {isCartOpen && <CartSidebar cart={cart} updateQuantity={updateQuantity} checkout={checkout} onClose={() => setIsCartOpen(false)} primaryColor={settings.primaryColor} />}
    </div>
  );
};

// --- Componentes Administrativos ---

const AdminPanel = ({ onClose, categories, syncAddCategory, syncRemoveCategory, products, syncAddProduct, syncRemoveProduct, settings, syncUpdateSettings }: any) => {
  const [tab, setTab] = useState('config');
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-slide-in">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-black">Administración</h2>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Panel de Control</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:rotate-90 transition-transform">&times;</button>
        </div>
        <div className="flex border-b bg-gray-50">
          <button onClick={() => setTab('cats')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${tab === 'cats' ? 'border-b-4 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-400'}`}>Categorías</button>
          <button onClick={() => setTab('prods')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${tab === 'prods' ? 'border-b-4 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-400'}`}>Productos</button>
          <button onClick={() => setTab('config')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest ${tab === 'config' ? 'border-b-4 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-400'}`}>Ajustes</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          {tab === 'cats' && <AdminCats categories={categories} onAdd={syncAddCategory} onRemove={syncRemoveCategory} />}
          {tab === 'prods' && <AdminProds categories={categories} products={products} onAdd={syncAddProduct} onRemove={syncRemoveProduct} />}
          {tab === 'config' && <AdminSettings settings={settings} onUpdate={syncUpdateSettings} />}
        </div>
      </div>
    </div>
  );
};

const AdminCats = ({ categories, onAdd, onRemove }: any) => {
  const [newCat, setNewCat] = useState({ name: '', description: '', img: '', color: '#e91e63' });

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <h4 className="font-black text-xs uppercase tracking-widest text-gray-500 mb-4">Nueva Categoría</h4>
        <div className="space-y-4">
          <input value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="Nombre (ej: Vestidos)" />
          <textarea value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full p-3 border rounded-xl text-sm h-20" placeholder="Descripción corta" />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Imagen Hero</label>
            <input type="file" onChange={async e => {
              if (e.target.files?.[0]) setNewCat({...newCat, img: await fileToBase64(e.target.files[0])})
            }} className="text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500">Color:</label>
            <input type="color" value={newCat.color} onChange={e => setNewCat({...newCat, color: e.target.value})} className="w-10 h-8 cursor-pointer" />
          </div>
          <button onClick={() => {onAdd(newCat); setNewCat({name:'', description:'', img:'', color:'#e91e63'})}} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Crear Categoría</button>
        </div>
      </div>
      <div className="space-y-2">
        {categories.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-white border rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{backgroundColor: c.color}}></div>
              <span className="font-bold text-sm text-gray-700">{c.name}</span>
            </div>
            <button onClick={() => onRemove(c.id)} className="text-red-400 hover:text-red-600 p-2"><i className="fas fa-trash-alt"></i></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminProds = ({ categories, products, onAdd, onRemove }: any) => {
  const [selectedCat, setSelectedCat] = useState('');
  const [newProd, setNewProd] = useState({ name: '', description: '', price: 0, mediaType: 'image', mediaUrl: '', sizes: [] as string[] });

  return (
    <div className="space-y-6">
      <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full p-3 border rounded-2xl bg-gray-50 text-sm font-bold">
        <option value="">Selecciona Categoría...</option>
        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      
      {selectedCat && (
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
          <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="Nombre" />
          <textarea value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} className="w-full p-3 border rounded-xl text-sm h-20" placeholder="Detalles" />
          <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl text-sm" placeholder="Precio ($)" />
          <input value={newProd.sizes.join(', ')} onChange={e => setNewProd({...newProd, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} className="w-full p-3 border rounded-xl text-sm" placeholder="Tallas (S, M, L...)" />
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase">Multimedia</label>
             <input type="file" onChange={async e => {
               if (e.target.files?.[0]) setNewProd({...newProd, mediaUrl: await fileToBase64(e.target.files[0]), mediaType: e.target.files[0].type.startsWith('video') ? 'video' : 'image'})
             }} className="text-xs" />
          </div>
          <button onClick={() => {onAdd(selectedCat, newProd); setNewProd({name:'', description:'', price:0, mediaType:'image', mediaUrl:'', sizes:[]})}} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg">Subir Producto</button>
        </div>
      )}

      {selectedCat && products[selectedCat]?.map((p: any) => (
        <div key={p.id} className="flex items-center justify-between p-3 border-b group">
          <div className="flex items-center gap-3">
            <img src={p.mediaUrl} className="w-10 h-10 object-cover rounded shadow-sm" />
            <span className="text-xs font-bold text-gray-700">{p.name}</span>
          </div>
          <button onClick={() => onRemove(selectedCat, p.id)} className="text-red-300 hover:text-red-500 p-2"><i className="fas fa-trash-alt"></i></button>
        </div>
      ))}
    </div>
  );
};

const AdminSettings = ({ settings, onUpdate }: { settings: SiteSettings, onUpdate: (s: SiteSettings) => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    alert('Ajustes guardados correctamente.');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setLocalSettings({...localSettings, logo: base64});
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-5">
        <h4 className="font-black text-xs uppercase tracking-widest text-gray-500">Configuración General</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
          <input value={localSettings.name} onChange={e => setLocalSettings({...localSettings, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Título de la Página</label>
          <input value={localSettings.title} onChange={e => setLocalSettings({...localSettings, title: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Color Principal del Sitio</label>
          <div className="flex items-center gap-4 bg-white p-3 border rounded-xl">
            <input type="color" value={localSettings.primaryColor} onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})} className="w-16 h-10 border-0 rounded cursor-pointer" />
            <span className="text-xs font-mono font-bold text-gray-400">{localSettings.primaryColor}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp de Pedidos</label>
          <input value={localSettings.whatsapp} onChange={e => setLocalSettings({...localSettings, whatsapp: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="+57 319..." />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logo del Sitio</label>
          <div className="flex flex-col gap-3 p-4 bg-white border rounded-2xl items-center">
            {localSettings.logo ? (
              <div className="relative group">
                <img src={localSettings.logo} className="h-20 w-20 object-contain rounded" alt="Logo Preview" />
                <button 
                  onClick={() => setLocalSettings({...localSettings, logo: ''})} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                >&times;</button>
              </div>
            ) : (
              <div className="h-20 w-20 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                <i className="fas fa-image text-3xl"></i>
              </div>
            )}
            <input type="file" onChange={handleLogoUpload} className="text-xs" accept="image/*" />
          </div>
        </div>
      </div>

      <div className="bg-indigo-900 text-white p-6 rounded-3xl border border-indigo-950 space-y-5">
        <h4 className="font-black text-xs uppercase tracking-widest text-indigo-300">Mensajes del Hero (Principal)</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Título de Impacto</label>
          <input value={localSettings.heroTitle} onChange={e => setLocalSettings({...localSettings, heroTitle: e.target.value})} className="w-full p-3 border border-indigo-800 rounded-xl text-sm bg-indigo-950 text-white outline-none" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Descripción / Bajada</label>
          <textarea value={localSettings.heroDescription} onChange={e => setLocalSettings({...localSettings, heroDescription: e.target.value})} className="w-full p-3 border border-indigo-800 rounded-xl text-sm bg-indigo-950 text-white h-24 outline-none" />
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all">Guardar Todos los Cambios</button>
    </div>
  );
};

const LoginModal = ({ onLogin, onClose, primaryColor }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner" style={{ color: primaryColor }}>
            <i className="fas fa-user-shield"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Acceso Staff</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Introduce tu contraseña maestra</p>
        </div>
        <input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && onLogin(pass)}
          className="w-full p-5 border-2 border-gray-100 rounded-[20px] mb-8 bg-gray-50 outline-none text-center text-2xl tracking-[0.4em] text-gray-800 transition-all font-black shadow-inner" 
          placeholder="••••" 
          autoFocus 
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600">Cancelar</button>
          <button onClick={() => onLogin(pass)} className="flex-1 py-4 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl" style={{ backgroundColor: primaryColor }}>Ingresar</button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
