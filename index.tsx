
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
  socialLink: string;
  logo: string;
  heroImage: string;
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
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        {product.mediaType === 'image' ? (
          <img 
            src={product.mediaUrl} 
            className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" 
            alt={product.name} 
          />
        ) : (
          <video 
            src={product.mediaUrl} 
            className="w-full h-full object-cover" 
            muted 
            autoPlay 
            loop 
          />
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm" style={{ color: primaryColor }}>
          NUEVO
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1 uppercase text-sm">{product.name}</h3>
        <p className="text-gray-400 text-[11px] mb-3 line-clamp-2 leading-tight h-8">{product.description}</p>
        
        <div className="mt-auto">
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== 'Única' && (
            <div className="mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Talla disponible</span>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSelectedSize(s)}
                    className={`text-[10px] min-w-[32px] h-8 flex items-center justify-center border rounded-lg font-medium transition-colors ${selectedSize === s ? 'text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
                    style={{ backgroundColor: selectedSize === s ? primaryColor : undefined, borderColor: selectedSize === s ? primaryColor : undefined }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}
          
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
            <p className="text-xs text-gray-400">{cart.length} artículos</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-2xl text-gray-400">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 py-20">
              <i className="fas fa-shopping-cart text-5xl opacity-10 mb-4"></i>
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
    name: 'SOLO COPAS Y SONIDO',
    title: 'Solo Copas y Sonido - Tienda Oficial',
    primaryColor: '#e91e63',
    whatsapp: '+573196968646',
    socialLink: 'https://instagram.com',
    logo: '',
    heroImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600',
    heroTitle: 'Tu sonido, tu estilo',
    heroDescription: 'Lo mejor en audio para tu vehículo con entrega inmediata.'
  });

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: setRes } = await supabase.from('settings').select('data').eq('id', 'site_config').single();
        if (setRes) setSettings(prev => ({...prev, ...setRes.data}));

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

  // --- Sincronización Supabase ---
  const syncAddCategory = async (newCat: any) => {
    if (!newCat.name) return alert('La categoría debe tener un nombre.');
    const id = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const catData = { ...newCat, id, order: categories.length + 1 };
    
    const { error } = await supabase.from('categories').insert([catData]);
    if (error) {
      alert(`Error al crear categoría: ${error.message}.`);
    } else {
      setCategories(prev => [...prev, catData]);
      setProducts(prev => ({ ...prev, [id]: [] }));
      alert('Categoría creada exitosamente.');
    }
  };

  const syncUpdateCategory = async (cat: Category) => {
    const { error } = await supabase.from('categories').update({
      name: cat.name,
      description: cat.description,
      img: cat.img,
      color: cat.color
    }).eq('id', cat.id);

    if (error) {
      alert(`Error al actualizar: ${error.message}`);
    } else {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
      alert('Categoría actualizada correctamente.');
    }
  };

  const syncRemoveCategory = async (id: string) => {
    if(!confirm('¿Eliminar esta categoría y todos sus productos?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
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
      media_type: prod.media_type,
      sizes: prod.sizes
    };
    const { error } = await supabase.from('products').insert([dbProd]);
    if (error) {
      alert(`Error al subir producto: ${error.message}`);
    } else {
      setProducts(prev => ({
        ...prev,
        [catId]: [...(prev[catId] || []), { ...prod, id: dbProd.id, category_id: catId }]
      }));
      alert('Producto guardado correctamente.');
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
    if (error) {
      alert(`Error al guardar ajustes: ${error.message}`);
    } else {
      setSettings(newSettings);
      alert('Configuración actualizada en la nube.');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-pink-600 rounded-full animate-spin mb-4"></div>
        <p className="text-pink-600 font-bold animate-pulse">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo y Nombre con función de inicio y apertura de login administrativo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={() => {
              setActiveTab('all');
              if (!isAdmin) setIsLoginOpen(true);
            }}
          >
            {settings.logo ? (
              <img src={settings.logo} className="w-10 h-10 object-contain rounded-xl shadow-lg" alt="Logo" />
            ) : (
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
                <i className="fas fa-crown text-xl"></i>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none text-gray-800 uppercase">{settings.name}</span>
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
              <div className="flex items-center gap-3">
                {/* Botón SÍGUENOS - Ahora siempre visible en móvil */}
                <a 
                  href={settings.socialLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center px-3 md:px-5 py-2 rounded-full text-[11px] font-black uppercase text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  SÍGUENOS
                </a>
              </div>
            )}
            
            <button onClick={() => setIsCartOpen(true)} className="relative group p-2 rounded-xl transition-colors">
              <i className="fas fa-shopping-cart text-2xl" style={{ color: settings.primaryColor }}></i>
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black ring-4 ring-white" style={{ backgroundColor: settings.primaryColor }}>
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
            className={`px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all ${activeTab === 'all' ? 'text-white shadow-lg' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
            style={{ backgroundColor: activeTab === 'all' ? settings.primaryColor : undefined }}
          >TODOS</button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-2xl whitespace-nowrap text-xs font-black transition-all border ${activeTab === cat.id ? 'text-white shadow-lg' : 'bg-white text-gray-400 border-gray-100'}`}
              style={{ 
                backgroundColor: activeTab === cat.id ? cat.color : undefined,
                borderColor: activeTab === cat.id ? cat.color : undefined
              }}
            >{cat.name.toUpperCase()}</button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[450px] md:h-[550px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform"
          style={{ 
            backgroundImage: `url(${activeTab === 'all' ? (settings.heroImage) : (categories.find(c => c.id === activeTab)?.img || '')})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center text-center p-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter italic uppercase">
              {activeTab === 'all' ? settings.heroTitle : (categories.find(c => c.id === activeTab)?.name)}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium max-w-xl mx-auto drop-shadow-lg leading-relaxed">
              {activeTab === 'all' ? settings.heroDescription : (categories.find(c => c.id === activeTab)?.description)}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-grid" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
              {activeTab === 'all' ? 'DESTACADOS' : (categories.find(c => c.id === activeTab)?.name)}
            </h2>
          </div>
          <div className="text-gray-400 text-sm font-medium">
             {activeTab === 'all' ? Object.values(products).flat().length : products[activeTab]?.length || 0} productos
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {(activeTab === 'all' ? Object.values(products).flat() : products[activeTab] || []).map(prod => (
            <ProductCard key={prod.id} product={prod} onAdd={addToCart} primaryColor={settings.primaryColor} />
          ))}
        </div>
      </main>

      {/* Admin Floating Button */}
      {isAdmin && (
        <button onClick={() => setIsAdminPanelOpen(true)} className="fixed bottom-6 left-6 w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-2xl z-[90] animate-pulse">
          <i className="fas fa-cog"></i>
        </button>
      )}

      {/* Modales */}
      {isLoginOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginOpen(false)} primaryColor={settings.primaryColor} />}
      {isAdminPanelOpen && (
        <AdminPanel 
          onClose={() => setIsAdminPanelOpen(false)} 
          categories={categories} 
          syncAddCategory={syncAddCategory}
          syncUpdateCategory={syncUpdateCategory}
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

// --- Panel de Administración ---

const AdminPanel = ({ onClose, categories, syncAddCategory, syncUpdateCategory, syncRemoveCategory, products, syncAddProduct, syncRemoveProduct, settings, syncUpdateSettings }: any) => {
  const [tab, setTab] = useState('config');
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-slide-in overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-black">Admin Panel</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="flex border-b bg-gray-50">
          <button onClick={() => setTab('cats')} className={`flex-1 py-4 text-[10px] font-black uppercase ${tab === 'cats' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>Categorías</button>
          <button onClick={() => setTab('prods')} className={`flex-1 py-4 text-[10px] font-black uppercase ${tab === 'prods' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>Productos</button>
          <button onClick={() => setTab('config')} className={`flex-1 py-4 text-[10px] font-black uppercase ${tab === 'config' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-gray-400'}`}>Ajustes</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
          {tab === 'cats' && <AdminCats categories={categories} onAdd={syncAddCategory} onUpdate={syncUpdateCategory} onRemove={syncRemoveCategory} />}
          {tab === 'prods' && <AdminProds categories={categories} products={products} onAdd={syncAddProduct} onRemove={syncRemoveProduct} />}
          {tab === 'config' && <AdminSettings settings={settings} onUpdate={syncUpdateSettings} />}
        </div>
      </div>
    </div>
  );
};

const AdminCats = ({ categories, onAdd, onUpdate, onRemove }: any) => {
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', img: '', color: '#e91e63' });

  useEffect(() => {
    if (editingCat) {
      setForm({
        name: editingCat.name,
        description: editingCat.description,
        img: editingCat.img,
        color: editingCat.color
      });
    } else {
      setForm({ name: '', description: '', img: '', color: '#e91e63' });
    }
  }, [editingCat]);

  const handleSubmit = () => {
    if (editingCat) {
      onUpdate({ ...editingCat, ...form });
      setEditingCat(null);
    } else {
      onAdd(form);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">
          {editingCat ? `Editando: ${editingCat.name}` : 'Nueva Categoría'}
        </h4>
        <div className="space-y-4">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="Nombre (ej: Vestidos)" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-3 border rounded-xl text-sm h-20" placeholder="Descripción corta" />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400">Imagen Hero</label>
            {form.img && <img src={form.img} className="w-20 h-20 object-cover rounded-xl mb-2 shadow-sm border" />}
            <input type="file" onChange={async e => {
              if (e.target.files?.[0]) setForm({...form, img: await fileToBase64(e.target.files[0])})
            }} className="text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-gray-500">Color:</label>
            <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="w-10 h-8 cursor-pointer" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">
              {editingCat ? 'Guardar Cambios' : 'Añadir Categoría'}
            </button>
            {editingCat && (
              <button onClick={() => setEditingCat(null)} className="px-4 border border-gray-200 rounded-xl font-bold text-gray-400">Cancelar</button>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {categories.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-4 bg-white border rounded-2xl group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50">
                {c.img && <img src={c.img} className="w-full h-full object-cover" />}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-gray-700">{c.name}</span>
                <span className="text-[10px] text-gray-400 uppercase font-bold" style={{ color: c.color }}>{c.color}</span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingCat(c)} className="text-indigo-400 p-2 hover:bg-indigo-50 rounded-lg"><i className="fas fa-edit"></i></button>
              <button onClick={() => onRemove(c.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><i className="fas fa-trash-alt"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminProds = ({ categories, products, onAdd, onRemove }: any) => {
  const [selectedCat, setSelectedCat] = useState('');
  const [newProd, setNewProd] = useState({ 
    name: '', 
    description: '', 
    price: 0, 
    mediaType: 'image', 
    mediaUrl: '', 
    sizes: ['Única'] as string[] 
  });

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
          <div className="flex flex-col gap-1">
             <label className="text-[10px] font-bold text-gray-400">Imagen/Video</label>
             <input type="file" onChange={async e => {
               if (e.target.files?.[0]) setNewProd({...newProd, mediaUrl: await fileToBase64(e.target.files[0]), mediaType: e.target.files[0].type.startsWith('video') ? 'video' : 'image'})
             }} className="text-xs" />
          </div>
          <button onClick={() => onAdd(selectedCat, newProd)} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Añadir Producto</button>
        </div>
      )}

      {selectedCat && products[selectedCat]?.map((p: any) => (
        <div key={p.id} className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-3">
            <img src={p.mediaUrl} className="w-10 h-10 object-cover rounded shadow-sm" />
            <span className="text-xs font-bold text-gray-700">{p.name}</span>
          </div>
          <button onClick={() => onRemove(selectedCat, p.id)} className="text-red-300"><i className="fas fa-trash-alt"></i></button>
        </div>
      ))}
    </div>
  );
};

const AdminSettings = ({ settings, onUpdate }: { settings: SiteSettings, onUpdate: (s: SiteSettings) => void }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setLocalSettings({...localSettings, logo: base64});
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setLocalSettings({...localSettings, heroImage: base64});
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-5">
        <h4 className="font-black text-xs uppercase text-gray-500">Configuración General</h4>
        
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase">Nombre del Sitio</label>
          <input value={localSettings.name} onChange={e => setLocalSettings({...localSettings, name: e.target.value})} className="w-full p-3 border rounded-xl text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase">Color Principal</label>
          <div className="flex items-center gap-4 bg-white p-3 border rounded-xl">
            <input type="color" value={localSettings.primaryColor} onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})} className="w-16 h-10 border-0 rounded cursor-pointer" />
            <span className="text-xs font-mono text-gray-400">{localSettings.primaryColor}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase">WhatsApp</label>
          <input value={localSettings.whatsapp} onChange={e => setLocalSettings({...localSettings, whatsapp: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="+57..." />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase">Enlace Red Social (Síguenos)</label>
          <input value={localSettings.socialLink} onChange={e => setLocalSettings({...localSettings, socialLink: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="URL de Instagram/Facebook..." />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase">Logo</label>
          <div className="flex flex-col gap-3 p-4 bg-white border rounded-2xl items-center">
            {localSettings.logo ? (
              <img src={localSettings.logo} className="h-20 w-20 object-contain rounded" />
            ) : (
              <div className="h-20 w-20 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                <i className="fas fa-image text-3xl"></i>
              </div>
            )}
            <input type="file" onChange={handleLogoUpload} className="text-xs" accept="image/*" />
            <button onClick={() => setLocalSettings({...localSettings, logo: ''})} className="text-[10px] text-red-500 font-bold uppercase underline">Quitar Logo</button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase">Imagen Hero Principal</label>
          <div className="flex flex-col gap-3 p-4 bg-white border rounded-2xl items-center">
            <div className="h-32 w-full bg-gray-50 border rounded-xl overflow-hidden shadow-inner">
              <img src={localSettings.heroImage} className="w-full h-full object-cover" />
            </div>
            <input type="file" onChange={handleHeroUpload} className="text-xs" accept="image/*" />
          </div>
        </div>
      </div>

      <div className="bg-indigo-900 text-white p-6 rounded-3xl space-y-5">
        <h4 className="font-black text-xs uppercase text-indigo-300">Textos Hero</h4>
        <input value={localSettings.heroTitle} onChange={e => setLocalSettings({...localSettings, heroTitle: e.target.value})} className="w-full p-3 border border-indigo-800 rounded-xl text-sm bg-indigo-950 text-white" />
        <textarea value={localSettings.heroDescription} onChange={e => setLocalSettings({...localSettings, heroDescription: e.target.value})} className="w-full p-3 border border-indigo-800 rounded-xl text-sm bg-indigo-950 text-white h-24" />
      </div>

      <button onClick={() => onUpdate(localSettings)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-700 transition-all">Guardar Ajustes</button>
    </div>
  );
};

const LoginModal = ({ onLogin, onClose, primaryColor }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] w-full max-sm shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-inner" style={{ color: primaryColor }}>
            <i className="fas fa-lock"></i>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Acceso Staff</h2>
          <p className="text-gray-400 text-xs font-bold uppercase mt-2">Contraseña maestra requerida</p>
        </div>
        <input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && onLogin(pass)}
          className="w-full p-5 border-2 border-gray-100 rounded-[20px] mb-8 bg-gray-50 outline-none text-center text-2xl tracking-[0.4em] font-black" 
          placeholder="••••" 
          autoFocus 
        />
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]">Cancelar</button>
          <button onClick={() => onLogin(pass)} className="flex-1 py-4 text-white rounded-[20px] font-black uppercase text-[10px] shadow-lg" style={{ backgroundColor: primaryColor }}>Ingresar</button>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
