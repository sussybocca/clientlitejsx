// @clj-animate particleField3D

function ProductGallery() {
  const [products, setProducts] = __CLJ_useState([
    { id: 1, name: 'Quantum Headphones', price: 199, image: 'https://picsum.photos/200/150?random=1', inCart: false },
    { id: 2, name: '4D Gaming Mouse', price: 89, image: 'https://picsum.photos/200/150?random=2', inCart: false },
    { id: 3, name: 'Hyper Keyboard', price: 149, image: 'https://picsum.photos/200/150?random=3', inCart: false },
    { id: 4, name: 'Quantum Monitor', price: 399, image: 'https://picsum.photos/200/150?random=4', inCart: false },
    { id: 5, name: 'Dimensional Speakers', price: 249, image: 'https://picsum.photos/200/150?random=5', inCart: false },
    { id: 6, name: 'Temporal SSD', price: 129, image: 'https://picsum.photos/200/150?random=6', inCart: false }
  ]);
  const [cart, setCart] = __CLJ_useState([]);
  const [cartOpen, setCartOpen] = __CLJ_useState(false);
  const [search, setSearch] = __CLJ_useState('');

  const addToCart = (product) => {
    if (!product.inCart) {
      setProducts(products.map(p => p.id === product.id ? { ...p, inCart: true } : p));
      setCart([...cart, product]);
      if (typeof CLJ !== 'undefined') CLJ.Toast.show(`✨ ${product.name} added to cart!`, 2000);
    }
  };

  const removeFromCart = (productId) => {
    const removed = cart.find(c => c.id === productId);
    setCart(cart.filter(c => c.id !== productId));
    setProducts(products.map(p => p.id === productId ? { ...p, inCart: false } : p));
    if (typeof CLJ !== 'undefined') CLJ.Toast.show(`🗑️ ${removed.name} removed`, 1500);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ position: 'sticky', top: 0, background: 'rgba(0,0,0,0.9)', padding: '15px', borderRadius: '12px', marginBottom: '20px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ margin: 0, background: 'linear-gradient(135deg,#667eea,#ff44aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🛍️ Quantum Store</h1>
          <input 
            type="text" 
            placeholder="🔍 Search products..." 
            value={search} 
            onInput={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '25px', border: '1px solid #667eea', background: 'rgba(0,0,0,0.5)', color: '#fff', width: '250px' }}
          />
          <button onClick={() => setCartOpen(!cartOpen)} className="clj-btn" style={{ padding: '10px 20px', borderRadius: '25px', background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
            🛒 Cart ({cart.length}) - ${total}
          </button>
        </div>
      </div>

      {cartOpen && (
        <div className="clj-card" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '500px', maxHeight: '70vh', overflow: 'auto', zIndex: 1000, padding: '20px', background: 'rgba(0,0,0,0.95)', borderRadius: '20px', border: '1px solid #667eea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Your Cart</h2>
            <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.6 }}>Cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderBottom: '1px solid rgba(102,126,234,0.2)' }}>
                  <img src={item.image} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}><strong>{item.name}</strong><br/>${item.price}</div>
                  <button onClick={() => removeFromCart(item.id)} className="clj-btn" style={{ background: '#dc3545', padding: '8px 15px' }}>Remove</button>
                </div>
              ))}
              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #667eea', textAlign: 'right' }}>
                <strong>Total: ${total}</strong><br/>
                <button className="clj-btn" style={{ marginTop: '10px', background: 'linear-gradient(135deg,#28a745,#1e7e34)' }}>Checkout</button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="clj-glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '20px', borderRadius: '20px' }}>
        {filteredProducts.map(product => (
          <div key={product.id} className="clj-card" style={{ padding: '15px', borderRadius: '15px', textAlign: 'center', transition: 'transform 0.3s' }}>
            <img src={product.image} style={{ width: '100%', height: '150px', borderRadius: '12px', objectFit: 'cover' }} />
            <h3>{product.name}</h3>
            <p style={{ fontSize: '24px', color: '#667eea', fontWeight: 'bold' }}>${product.price}</p>
            <button 
              onClick={() => addToCart(product)} 
              className="clj-btn" 
              style={{ background: product.inCart ? '#6c757d' : 'linear-gradient(135deg,#28a745,#1e7e34)', width: '100%', padding: '12px' }}
              disabled={product.inCart}
            >
              {product.inCart ? '✓ In Cart' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

__CLJ_mount(ProductGallery, 'root');