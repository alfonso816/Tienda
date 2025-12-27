
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

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

// --- App Principal ---
const App = () => {
  // Estados de datos
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Record<string, Product[]>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    name: 'TUS CURVAS LINDAS',
    title: 'Tus Curvas Lindas - Delivery de Moda',
    primaryColor: '#e91e63',
    whatsapp: '+573196968646',
    logo: '',
    heroTitle: 'Moda a tu puerta en minutos',
    heroDescription: 'Descubre las últimas tendencias en moda con entrega rápida. Ropa, calzado y accesorios para toda ocasión.'
  });

  // Estados de UI
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const savedCategories = localStorage.getItem('tcl_categories');
    const savedProducts = localStorage.getItem('tcl_products');
    const savedSettings = localStorage.getItem('tcl_settings');
    const savedUser = localStorage.getItem('tcl_user');

    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedUser === 'admin') setIsAdmin(true);

    if (savedCategories && savedProducts) {
      setCategories(JSON.parse(savedCategories));
      setProducts(JSON.parse(savedProducts));
    } else {
      // Datos por defecto si no hay nada
      const initialCats: Category[] = [
        { id: 'camisetas', name: 'Camisetas', description: 'Moda para todos', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', color: '#2196f3', order: 1 },
        { id: 'jeans', name: 'Jeans', description: 'Corte perfecto', img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', color: '#4caf50', order: 2 }
      ];
      const initialProds: Record<string, Product[]> = {
        camisetas: [
          { id: 'c1', name: 'Camiseta Básica', description: '100% Algodón', price: 15.99, mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', sizes: ['S', 'M', 'L'] }
        ],
        jeans: [
          { id: 'j1', name: 'Jeans Slim Fit', description: 'Azul clásico', price: 34.99, mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800', sizes: ['30', '32', '34'] }
        ]
      };
      setCategories(initialCats);
      setProducts(initialProds);
    }
  }, []);

  // Guardar cambios
  useEffect(() => {
    if (categories.length > 0) localStorage.setItem('tcl_categories', JSON.stringify(categories));
    if (Object.keys(products).length > 0) localStorage.setItem('tcl_products', JSON.stringify(products));
    localStorage.setItem('tcl_settings', JSON.stringify(settings));
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
    document.title = settings.title;
  }, [categories, products, settings]);

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
    let msg = `Hola! Quiero realizar un pedido de moda. Mi pedido es:\n\n`;
    cart.forEach(item => {
      msg += `- ${item.name} (Talla: ${item.selectedSize}) x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    msg += `\nTotal: $${total.toFixed(2)}`;
    window.location.href = `https://wa.me/${settings.whatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {settings.logo && <img src={settings.logo} className="w-10 h-10 object-contain rounded" alt="Logo" />}
            <span className="text-xl font-bold" style={{ color: 'var(--primary-color)' }}>{settings.name}</span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-pink-600">Admin</span>
                <button onClick={handleLogout} className="text-xs border border-pink-600 text-pink-600 px-2 py-1 rounded hover:bg-pink-600 hover:text-white transition-colors">Salir</button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="bg-pink-600 text-white px-4 py-2 rounded font-bold text-sm">Iniciar Sesión</button>
            )}
            <div onClick={() => setIsCartOpen(true)} className="relative cursor-pointer">
              <i className="fas fa-shopping-cart text-2xl text-pink-600"></i>
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t overflow-x-auto flex gap-4 py-2 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-pink-600 text-white' : 'bg-gray-100'}`}
          >Todos</button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-1 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${activeTab === cat.id ? 'text-white' : 'bg-gray-100'}`}
              style={{ backgroundColor: activeTab === cat.id ? cat.color : '#f3f4f6' }}
            >{cat.name}</button>
          ))}
        </div>
      </header>

      {/* Hero */}
      <section 
        className="relative h-[400px] flex items-center justify-center text-center text-white"
        style={{ 
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${activeTab === 'all' ? (settings.heroTitle === 'Moda a tu puerta en minutos' && !settings.heroDescription.includes('http') ? 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600' : (settings.heroTitle.startsWith('data:') ? settings.heroTitle : 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600')) : (categories.find(c => c.id === activeTab)?.img || '')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="p-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{activeTab === 'all' ? settings.heroTitle : (categories.find(c => c.id === activeTab)?.name)}</h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">{activeTab === 'all' ? settings.heroDescription : (categories.find(c => c.id === activeTab)?.description)}</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">{activeTab === 'all' ? 'Productos Destacados' : `Selección de ${categories.find(c => c.id === activeTab)?.name}`}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(activeTab === 'all' ? Object.values(products).flat() : products[activeTab] || []).map(prod => (
            <ProductCard key={prod.id} product={prod} onAdd={addToCart} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 {settings.name}. Moda a tu medida.</p>
        </div>
      </footer>

      {/* Modales y Paneles */}
      {isLoginOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginOpen(false)} />}
      {isAdmin && <AdminButton onClick={() => setIsAdminPanelOpen(true)} />}
      {isAdminPanelOpen && (
        <AdminPanel 
          onClose={() => setIsAdminPanelOpen(false)} 
          categories={categories} 
          setCategories={setCategories}
          products={products}
          setProducts={setProducts}
          settings={settings}
          setSettings={setSettings}
        />
      )}
      {isCartOpen && <CartSidebar cart={cart} updateQuantity={updateQuantity} checkout={checkout} onClose={() => setIsCartOpen(false)} />}
    </div>
  );
};

// --- Subcomponentes ---

const ProductCard = ({ product, onAdd }: { product: Product, onAdd: (p: Product, s: string) => void }) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Única');

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="h-56 overflow-hidden bg-gray-100">
        {product.mediaType === 'image' ? (
          <img src={product.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={product.name} />
        ) : (
          <video src={product.mediaUrl} className="w-full h-full object-cover" muted autoPlay loop />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{product.name}</h3>
        <p className="text-gray-500 text-xs mb-3 h-8 overflow-hidden">{product.description}</p>
        <div className="mb-3">
          <span className="text-xs text-gray-400 block mb-1">Tallas:</span>
          <div className="flex flex-wrap gap-1">
            {product.sizes.map(s => (
              <button 
                key={s} 
                onClick={() => setSelectedSize(s)}
                className={`text-[10px] w-6 h-6 flex items-center justify-center border rounded ${selectedSize === s ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-pink-600">${product.price.toFixed(2)}</span>
          <button 
            onClick={() => onAdd(product, selectedSize)}
            className="bg-pink-600 text-white text-xs px-3 py-2 rounded font-bold hover:bg-pink-700 transition-colors"
          >Agregar</button>
        </div>
      </div>
    </div>
  );
};

const CartSidebar = ({ cart, updateQuantity, checkout, onClose }: any) => {
  const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-in">
        <div className="p-4 border-b flex justify-between items-center bg-white text-gray-800">
          <h2 className="text-xl font-bold">Tu Carrito</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <i className="fas fa-shopping-bag text-5xl mb-4 opacity-10"></i>
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item: any) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 mb-4 pb-4 border-b">
                <img src={item.mediaUrl} className="w-20 h-20 object-cover rounded shadow-sm" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                  <p className="text-xs text-pink-600 font-medium">Talla: {item.selectedSize}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, -1)} className="w-6 h-6 border border-gray-200 rounded text-gray-500 bg-white">-</button>
                      <span className="text-sm font-medium text-gray-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, 1)} className="w-6 h-6 border border-gray-200 rounded text-gray-500 bg-white">+</button>
                    </div>
                    <span className="font-bold text-sm text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-gray-600">Subtotal</span>
            <span className="text-xl font-bold text-pink-600">${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={checkout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg"
          >
            <i className="fab fa-whatsapp"></i> Finalizar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-transform z-[90]"
  >+</button>
);

const AdminPanel = ({ onClose, categories, setCategories, products, setProducts, settings, setSettings }: any) => {
  const [tab, setTab] = useState('cats');
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-slide-in">
        <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="text-xl font-bold">Panel de Administración</h2>
          <button onClick={onClose} className="text-2xl text-indigo-200 hover:text-white">&times;</button>
        </div>
        <div className="flex border-b bg-gray-50">
          <button onClick={() => setTab('cats')} className={`flex-1 py-3 text-sm font-bold ${tab === 'cats' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-400'}`}>Categorías</button>
          <button onClick={() => setTab('prods')} className={`flex-1 py-3 text-sm font-bold ${tab === 'prods' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-400'}`}>Productos</button>
          <button onClick={() => setTab('config')} className={`flex-1 py-3 text-sm font-bold ${tab === 'config' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-400'}`}>Ajustes</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          {tab === 'cats' && <AdminCats categories={categories} setCategories={setCategories} setProducts={setProducts} />}
          {tab === 'prods' && <AdminProds categories={categories} products={products} setProducts={setProducts} />}
          {tab === 'config' && <AdminSettings settings={settings} setSettings={setSettings} />}
        </div>
      </div>
    </div>
  );
};

// --- Subcomponentes Admin ---

const AdminCats = ({ categories, setCategories, setProducts }: any) => {
  const [newCat, setNewCat] = useState({ name: '', description: '', img: '', color: '#e91e63' });

  const addCat = () => {
    if (!newCat.name || !newCat.img) {
      alert('Por favor completa el nombre y selecciona una imagen');
      return;
    }
    const id = newCat.name.toLowerCase().replace(/\s+/g, '-');
    const cat = { ...newCat, id, order: categories.length + 1 };
    setCategories((prev: any) => [...prev, cat]);
    setProducts((prev: any) => ({ ...prev, [id]: [] }));
    setNewCat({ name: '', description: '', img: '', color: '#e91e63' });
  };

  const removeCat = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría y todos sus productos?')) {
      setCategories((prev: any) => prev.filter((c: any) => c.id !== id));
      setProducts((prev: any) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setNewCat({ ...newCat, img: base64 });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <h4 className="font-bold mb-4 text-gray-700">Nueva Categoría</h4>
        <input value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded mb-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nombre (ej: Vestidos)" />
        <textarea value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} className="w-full p-2 border border-gray-300 rounded mb-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Descripción" />
        <div className="mb-2">
          <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">Imagen de fondo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          {newCat.img && <img src={newCat.img} className="w-full h-20 object-cover mt-2 rounded border border-gray-200" />}
        </div>
        <input type="color" value={newCat.color} onChange={e => setNewCat({...newCat, color: e.target.value})} className="w-full h-10 mb-4 cursor-pointer" title="Color de la categoría" />
        <button onClick={addCat} className="w-full bg-green-600 text-white py-2 rounded font-bold shadow-md hover:bg-green-700 transition-colors">Agregar Categoría</button>
      </div>
      <div className="space-y-2">
        {categories.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded shadow-sm hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-3">
              <img src={c.img} className="w-8 h-8 object-cover rounded shadow-sm" />
              <span className="font-medium text-sm text-gray-700">{c.name}</span>
            </div>
            <button onClick={() => removeCat(c.id)} className="text-red-500 text-xs font-bold hover:underline uppercase">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminProds = ({ categories, products, setProducts }: any) => {
  const [selectedCat, setSelectedCat] = useState('');
  const [newProd, setNewProd] = useState<Partial<Product>>({ name: '', description: '', price: 0, mediaType: 'image', mediaUrl: '', sizes: [] });

  const addProd = () => {
    if (!selectedCat || !newProd.name || !newProd.mediaUrl) {
      alert('Por favor completa todos los campos y carga un archivo');
      return;
    }
    const prod = { ...newProd, id: Date.now().toString() } as Product;
    setProducts((prev: any) => ({
      ...prev,
      [selectedCat]: [...(prev[selectedCat] || []), prod]
    }));
    setNewProd({ name: '', description: '', price: 0, mediaType: 'image', mediaUrl: '', sizes: [] });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setNewProd({ ...newProd, mediaUrl: base64 });
    }
  };

  return (
    <div className="space-y-6">
      <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="w-full p-2 border border-gray-300 rounded font-medium bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none">
        <option value="">Seleccionar Categoría...</option>
        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      
      {selectedCat && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h4 className="font-bold mb-4 text-gray-700">Nuevo Producto</h4>
          <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded mb-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nombre" />
          <textarea value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} className="w-full p-2 border border-gray-300 rounded mb-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Descripción" />
          <input type="number" value={newProd.price} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} className="w-full p-2 border border-gray-300 rounded mb-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Precio" />
          <input value={newProd.sizes?.join(', ')} onChange={e => setNewProd({...newProd, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} className="w-full p-2 border border-gray-300 rounded mb-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tallas (S, M, L...)" />
          <div className="flex gap-4 mb-2">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1 cursor-pointer"><input type="radio" checked={newProd.mediaType === 'image'} onChange={() => setNewProd({...newProd, mediaType: 'image'})} /> Imagen</label>
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1 cursor-pointer"><input type="radio" checked={newProd.mediaType === 'video'} onChange={() => setNewProd({...newProd, mediaType: 'video'})} /> Video</label>
          </div>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">Cargar Archivo</label>
            <input type="file" accept={newProd.mediaType === 'image' ? "image/*" : "video/*"} onChange={handleFileChange} className="w-full text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {newProd.mediaUrl && (
              newProd.mediaType === 'image' ? 
                <img src={newProd.mediaUrl} className="w-full h-20 object-cover mt-2 rounded border border-gray-200 shadow-sm" /> :
                <video src={newProd.mediaUrl} className="w-full h-20 object-cover mt-2 rounded border border-gray-200 shadow-sm" controls />
            )}
          </div>
          <button onClick={addProd} className="w-full bg-indigo-600 text-white py-2 rounded font-bold shadow-md hover:bg-indigo-700 transition-colors">Agregar Producto</button>
        </div>
      )}

      {selectedCat && products[selectedCat] && (
        <div className="grid grid-cols-2 gap-3">
          {products[selectedCat].map((p: Product) => (
            <div key={p.id} className="p-2 border border-gray-100 rounded text-[10px] bg-white shadow-sm hover:shadow-md transition-shadow">
              {p.mediaType === 'image' ? 
                <img src={p.mediaUrl} className="w-full h-16 object-cover mb-1 rounded shadow-sm" alt="" /> :
                <video src={p.mediaUrl} className="w-full h-16 object-cover mb-1 rounded shadow-sm" />
              }
              <p className="font-bold text-gray-800 truncate">{p.name}</p>
              <button onClick={() => {
                if(confirm('¿Eliminar producto?')) {
                  setProducts((prev: any) => ({ ...prev, [selectedCat]: prev[selectedCat].filter((item: any) => item.id !== p.id) }));
                }
              }} className="text-red-500 font-bold hover:underline uppercase mt-1">Eliminar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminSettings = ({ settings, setSettings }: any) => {
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setSettings({ ...settings, logo: base64 });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Nombre del Sitio</label>
        <input value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Título de Pestaña</label>
        <input value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">WhatsApp Pedidos</label>
        <input value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+57..." />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Color Principal</label>
        <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="w-full h-10 border border-gray-300 rounded p-1 cursor-pointer bg-white" />
      </div>
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Logo del Sitio</label>
        <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-xs text-gray-600 mb-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
        {settings.logo && <img src={settings.logo} className="w-16 h-16 object-contain rounded border border-gray-200 p-1 bg-white shadow-sm" />}
      </div>
      <div className="pt-4 border-t border-gray-200">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Hero Título</label>
        <input value={settings.heroTitle} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm mb-2 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Hero Descripción</label>
        <textarea value={settings.heroDescription} onChange={e => setSettings({...settings, heroDescription: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm h-24 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none" />
      </div>
    </div>
  );
};

const LoginModal = ({ onLogin, onClose }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Administración</h2>
        <p className="text-sm text-gray-500 mb-6">Ingresa la contraseña para gestionar el sitio.</p>
        <input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onLogin(pass)}
          className="w-full p-3 border-2 border-gray-100 rounded-xl focus:border-indigo-500 outline-none mb-4 text-gray-800 bg-white shadow-inner" 
          placeholder="Contraseña"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancelar</button>
          <button onClick={() => onLogin(pass)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">Entrar</button>
        </div>
      </div>
    </div>
  );
};

// --- Render ---
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
