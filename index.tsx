
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

const ProductCard: React.FC<{ product: Product, onAdd: (p: Product, s: string) => void }> = ({ product, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Única');

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
        {product.mediaType === 'image' ? (
          <img src={product.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
        ) : (
          <video src={product.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-pink-600 shadow-sm">
          NUEVO
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-400 text-[11px] mb-3 line-clamp-2 leading-tight">{product.description}</p>
        
        <div className="mt-auto">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Talla disponible</span>
            <div className="flex flex-wrap gap-1">
              {product.sizes?.map(s => (
                <button 
                  key={s} 
                  onClick={() => setSelectedSize(s)}
                  className={`text-[10px] min-w-[32px] h-8 flex items-center justify-center border rounded-lg font-medium transition-colors ${selectedSize === s ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-200 text-gray-500 hover:border-pink-300 bg-white'}`}
                >{s}</button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="font-black text-lg text-pink-600">${Number(product.price).toLocaleString()}</span>
            <button 
              onClick={() => onAdd(product, selectedSize)}
              className="bg-pink-600 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-pink-700 active:scale-95 transition-all shadow-md shadow-pink-200"
            >Agregar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = ({ cart, updateQuantity, checkout, onClose }: any) => {
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
              <button onClick={onClose} className="mt-4 text-pink-600 font-bold text-sm underline">Seguir comprando</button>
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
                  <p className="text-[11px] text-pink-600 font-bold mt-1">Talla: {item.selectedSize}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 bg-white rounded-lg border p-1 shadow-sm">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-pink-600">-</button>
                      <span className="w-6 text-center text-xs font-bold text-gray-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-pink-600">+</button>
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
            <span className="text-3xl font-black text-pink-600">${total.toLocaleString()}</span>
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
    whatsapp: '',
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
        // Ajustes
        const { data: setRes } = await supabase.from('settings').select('data').eq('id', 'site_config').single();
        if (setRes) setSettings(setRes.data);

        // Categorías
        const { data: catRes } = await supabase.from('categories').select('*').order('order', { ascending: true });
        if (catRes) setCategories(catRes);

        // Productos
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
    let msg = `🛍️ *NUEVO PEDIDO - TUS CURVAS LINDAS*\n\nHola! Quiero realizar el siguiente pedido:\n\n`;
    cart.forEach(item => {
      msg += `• *${item.name}*\nTalla: ${item.selectedSize} | Cant: ${item.quantity}\nSubtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
    });
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    msg += `💰 *TOTAL A PAGAR: $${total.toLocaleString()}*`;
    window.location.href = `https://wa.me/${settings.whatsapp.replace(/\+/g, '').replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  // --- Funciones Sincronización Supabase ---
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
        <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin mb-4"></div>
        <p className="text-pink-600 font-bold animate-pulse">Cargando Tus Curvas Lindas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('all')}>
            <div className="w-10 h-10 bg-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
               <i className="fas fa-crown text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-gray-800">{settings.name}</span>
              <span className="text-[10px] uppercase font-bold text-pink-500 tracking-widest">Premium Fashion</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <div className="hidden md:flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Admin Activo</span>
                <button onClick={handleLogout} className="text-[10px] text-indigo-400 hover:text-indigo-800 ml-2">Salir</button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="text-gray-400 hover:text-pink-600 transition-colors">
                <i className="fas fa-user-circle text-2xl"></i>
              </button>
            )}
            
            <button onClick={() => setIsCartOpen(true)} className="relative group p-2 rounded-xl hover:bg-pink-50 transition-colors">
              <i className="fas fa-shopping-bag text-2xl text-pink-600"></i>
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-pink-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-4 ring-white group-hover:scale-110 transition-transform">
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
            className={`px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all ${activeTab === 'all' ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 scale-105' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-pink-50'}`}
          >TODOS</button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all border ${activeTab === cat.id ? 'text-white shadow-lg scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-pink-200'}`}
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
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 hover:scale-100"
          style={{ 
            backgroundImage: `url(${activeTab === 'all' ? (settings.heroTitle.startsWith('data:') ? settings.heroTitle : 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600') : (categories.find(c => c.id === activeTab)?.img || '')})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter italic">
              {activeTab === 'all' ? settings.heroTitle : (categories.find(c => c.id === activeTab)?.name)}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-xl mx-auto drop-shadow-lg leading-relaxed">
              {activeTab === 'all' ? settings.heroDescription : (categories.find(c => c.id === activeTab)?.description)}
            </p>
            {activeTab === 'all' && (
              <button 
                onClick={() => document.getElementById('main-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-10 bg-white text-pink-600 px-10 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all"
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
            <span className="text-pink-600 font-black text-xs uppercase tracking-widest mb-2 block">Top Ventas</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
              {activeTab === 'all' ? 'Nuestras Piezas Clave' : `Colección ${categories.find(c => c.id === activeTab)?.name}`}
            </h2>
          </div>
          <div className="text-gray-400 text-sm font-medium">
             Mostrando {activeTab === 'all' ? Object.values(products).flat().length : products[activeTab]?.length || 0} artículos
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {(activeTab === 'all' ? Object.values(products).flat() : products[activeTab] || []).map(prod => (
            <ProductCard key={prod.id} product={prod} onAdd={addToCart} />
          ))}
        </div>
        
        {(!products[activeTab] || products[activeTab].length === 0) && activeTab !== 'all' && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
            <i className="fas fa-search text-gray-200 text-5xl mb-4"></i>
            <p className="text-gray-400 font-bold">Próximamente nuevos ingresos en esta sección.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="text-2xl font-black mb-6 italic tracking-tighter">{settings.name}</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Empresa líder en delivery de moda premium. Llevamos las tendencias internacionales a tu puerta en tiempo récord.
            </p>
            <div className="flex gap-4">
               <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-colors"><i className="fab fa-instagram"></i></a>
               <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors"><i className="fab fa-facebook-f"></i></a>
               <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-400 transition-colors"><i className="fab fa-tiktok"></i></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-pink-500">Enlaces Rápidos</h4>
            <ul className="space-y-4 text-sm text-gray-400">
               <li><a href="#" className="hover:text-white transition-colors">Política de Cambios</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Tiempos de Envío</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Guía de Tallas</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Trabaja con nosotros</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-pink-500">Contáctanos</h4>
            <p className="text-sm text-gray-400 mb-2">WhatsApp de Atención:</p>
            <p className="text-xl font-black text-white mb-6">{settings.whatsapp}</p>
            <div className="bg-gray-800 p-4 rounded-2xl flex items-center gap-4">
               <i className="fas fa-headset text-2xl text-pink-500"></i>
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">Soporte 24/7</p>
                  <p className="text-xs">Chat en vivo disponible</p>
               </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 mt-20 pt-8 text-center text-[10px] text-gray-600 font-bold tracking-widest">
           &copy; {new Date().getFullYear()} {settings.name} | POWERED BY SUPABASE
        </div>
      </footer>

      {/* Floating Admin Button */}
      {isAdmin && (
        <button 
          onClick={() => setIsAdminPanelOpen(true)} 
          className="fixed bottom-6 left-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl hover:scale-110 active:rotate-45 transition-all z-[90] animate-bounce"
        >
          <i className="fas fa-plus"></i>
        </button>
      )}

      {/* Modales */}
      {isLoginOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginOpen(false)} />}
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
      {isCartOpen && <CartSidebar cart={cart} updateQuantity={updateQuantity} checkout={checkout} onClose={() => setIsCartOpen(false)} />}
    </div>
  );
};

// --- Componentes Administrativos ---

const AdminPanel = ({ onClose, categories, syncAddCategory, syncRemoveCategory, products, syncAddProduct, syncRemoveProduct, settings, syncUpdateSettings }: any) => {
  const [tab, setTab] = useState('cats');
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-slide-in">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-black tracking-tight">Consola de Control</h2>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Sincronizado con Supabase</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-2xl">&times;</button>
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
    <div className="space-y-8">
      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
        <h4 className="font-black text-xs uppercase tracking-widest text-indigo-800 mb-4">Nueva Sección</h4>
        <div className="space-y-4">
          <input value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm bg-white" placeholder="Nombre (ej: Vestidos)" />
          <textarea value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full p-3 border rounded-xl text-sm bg-white h-24" placeholder="Breve descripción del estilo" />
          <div className="bg-white p-4 rounded-xl border border-dashed border-indigo-200">
             <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Imagen de Portada</label>
             <input type="file" onChange={async e => {
               if (e.target.files?.[0]) setNewCat({...newCat, img: await fileToBase64(e.target.files[0])})
             }} className="text-xs text-gray-400" />
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border">
             <label className="text-[10px] font-black text-gray-400 uppercase">Color distintivo:</label>
             <input type="color" value={newCat.color} onChange={e => setNewCat({...newCat, color: e.target.value})} className="w-12 h-8 cursor-pointer rounded overflow-hidden" />
          </div>
          <button onClick={() => {onAdd(newCat); setNewCat({name:'', description:'', img:'', color:'#e91e63'})}} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Crear Categoría</button>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[.2em]">Secciones actuales</h4>
        {categories.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-red-100 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border shadow-sm">
                 <img src={c.img} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-bold text-sm text-gray-800">{c.name}</span>
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">#{c.id}</p>
              </div>
            </div>
            <button onClick={() => onRemove(c.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-200 hover:bg-red-50 hover:text-red-500 transition-all">
              <i className="fas fa-trash-alt text-xs"></i>
            </button>
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
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Colección</label>
        <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full p-4 border rounded-2xl bg-gray-50 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20">
          <option value="">-- Elige una categoría --</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      
      {selectedCat && (
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <h4 className="font-black text-xs uppercase tracking-widest text-green-800 mb-6">Nuevo Ingreso</h4>
          <div className="space-y-4">
            <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm bg-white" placeholder="Nombre de la prenda" />
            <textarea value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} className="w-full p-3 border rounded-xl text-sm bg-white h-24" placeholder="Detalles, materiales, fit..." />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Precio</label>
                 <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl text-sm bg-white font-bold" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tallas</label>
                 <input value={newProd.sizes.join(', ')} onChange={e => setNewProd({...newProd, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} className="w-full p-3 border rounded-xl text-sm bg-white font-bold" placeholder="S, M, L..." />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-dashed border-green-200">
               <label className="text-[10px] font-black text-gray-400 uppercase block mb-2">Archivo Multimedia</label>
               <input type="file" onChange={async e => {
                 if (e.target.files?.[0]) {
                   const file = e.target.files[0];
                   setNewProd({...newProd, mediaUrl: await fileToBase64(file), mediaType: file.type.startsWith('video') ? 'video' : 'image'})
                 }
               }} className="text-xs text-gray-400" />
            </div>
            <button onClick={() => {onAdd(selectedCat, newProd); setNewProd({name:'', description:'', price:0, mediaType:'image', mediaUrl:'', sizes:[]})}} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all">Subir Producto</button>
          </div>
        </div>
      )}

      {selectedCat && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[.2em]">Inventario Actual</h4>
          {products[selectedCat]?.length ? products[selectedCat].map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-2xl group hover:border-red-50 transition-all">
              <div className="flex items-center gap-4">
                <img src={p.mediaUrl} className="w-12 h-16 object-cover rounded-lg shadow-sm" />
                <div>
                   <p className="text-sm font-bold text-gray-800">{p.name}</p>
                   <p className="text-[10px] font-black text-pink-600 tracking-tighter">${p.price.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => onRemove(selectedCat, p.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-200 hover:text-red-500 transition-colors">
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          )) : <p className="text-center py-10 text-xs text-gray-300 font-bold italic">No hay productos en esta categoría.</p>}
        </div>
      )}
    </div>
  );
};

const AdminSettings = ({ settings, onUpdate }: any) => (
  <div className="space-y-8">
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
      <h4 className="font-black text-xs uppercase tracking-widest text-gray-700 mb-6">Identidad Visual</h4>
      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
          <input value={settings.name} onChange={e => onUpdate({...settings, name: e.target.value})} className="w-full p-4 border rounded-2xl text-sm bg-white font-bold" />
        </div>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Enlace WhatsApp</label>
          <input value={settings.whatsapp} onChange={e => onUpdate({...settings, whatsapp: e.target.value})} className="w-full p-4 border rounded-2xl text-sm bg-white font-bold" placeholder="+57 319..." />
        </div>
        <div className="flex items-center gap-6 bg-white p-4 rounded-2xl border">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color Primario</label>
            <span className="text-[9px] text-gray-300 font-bold">{settings.primaryColor}</span>
          </div>
          <input type="color" value={settings.primaryColor} onChange={e => onUpdate({...settings, primaryColor: e.target.value})} className="w-16 h-10 border-0 rounded cursor-pointer outline-none" />
        </div>
      </div>
    </div>
    
    <div className="bg-indigo-900 text-white p-6 rounded-3xl border border-indigo-950 shadow-xl">
      <h4 className="font-black text-xs uppercase tracking-widest text-indigo-300 mb-6">Mensaje Principal (Hero)</h4>
      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Título de Impacto</label>
          <input value={settings.heroTitle} onChange={e => onUpdate({...settings, heroTitle: e.target.value})} className="w-full p-4 border border-indigo-800 rounded-2xl text-sm bg-indigo-950 text-white outline-none focus:ring-2 focus:ring-pink-500/50" />
        </div>
        <div>
          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Bajada / Descripción</label>
          <textarea value={settings.heroDescription} onChange={e => onUpdate({...settings, heroDescription: e.target.value})} className="w-full p-4 border border-indigo-800 rounded-2xl text-sm bg-indigo-950 text-white h-32 outline-none focus:ring-2 focus:ring-pink-500/50" />
        </div>
      </div>
    </div>
  </div>
);

const LoginModal = ({ onLogin, onClose }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner rotate-3 hover:rotate-0 transition-transform">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Acceso Staff</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Solo personal autorizado</p>
        </div>
        <input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && onLogin(pass)}
          className="w-full p-5 border-2 border-gray-100 rounded-[20px] mb-8 bg-gray-50 focus:border-pink-600 outline-none text-center text-2xl tracking-[0.4em] text-gray-800 transition-all font-black shadow-inner" 
          placeholder="••••" 
          autoFocus 
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
          <button onClick={() => onLogin(pass)} className="flex-1 py-4 bg-pink-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-pink-200 hover:scale-105 active:scale-95 transition-all">Ingresar</button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
