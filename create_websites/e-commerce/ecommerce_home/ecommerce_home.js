// VoltShop — Dynamic Store that loads from Dexie

// Dexie Database connection (same as ecommerce_maker)
const storeDB = new Dexie("EcommerceStoreDB");
storeDB.version(1).stores({
    stores: "++id, storeName, createdAt, updatedAt"
});

// Global state
let cart = [];
let isCartOpen = false;
let darkMode = localStorage.getItem('voltTheme') === 'dark';
let currentStore = null;
let currentStoreId = null;

// DOM elements
let rootDiv;
let cartDrawerElement, overlayElement, cartItemsContainer, cartSubtotalSpan, cartTotalSpan;

const $ = s => document.querySelector(s);

// Default fallback data
const defaultCategories = [
    { name: "Headphones", icon: "fa-headphones" },
    { name: "Watches", icon: "fa-clock" },
    { name: "Laptops", icon: "fa-laptop" },
    { name: "Smartphones", icon: "fa-mobile-alt" },
    { name: "Gaming", icon: "fa-gamepad" },
    { name: "Cameras", icon: "fa-camera" },
];

const defaultProducts = [
    { id: "p1", name: "Aurora Pro Headphones", category: "Audio", price: 299, oldPrice: 399, rating: 4.9, reviews: 1420, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80", badge: "Sale" },
    { id: "p2", name: "VoltWatch Ultra", category: "Wearables", price: 249, rating: 4.8, reviews: 892, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", badge: "New" },
    { id: "p3", name: "Aether Laptop Z13", category: "Computers", price: 1299, oldPrice: 1599, rating: 4.7, reviews: 340, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", badge: "Sale" },
    { id: "p4", name: "Pulse Elite Buds", category: "Audio", price: 149, rating: 4.9, reviews: 2100, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&q=80", badge: "" },
    { id: "p5", name: "Edge Gaming Controller", category: "Gaming", price: 89, rating: 4.8, reviews: 755, image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=600&q=80", badge: "New" },
    { id: "p6", name: "Nova Smartphone", category: "Phones", price: 799, oldPrice: 999, rating: 4.6, reviews: 450, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80", badge: "Sale" },
    { id: "p7", name: "Prism Camera 4K", category: "Cameras", price: 549, rating: 4.8, reviews: 268, image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80", badge: "" },
    { id: "p8", name: "VoltDesk Mat", category: "Accessories", price: 49, rating: 4.7, reviews: 922, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80", badge: "Best" },
];

const defaultFeatures = [
    { icon: "fa-truck", title: "Free Shipping", desc: "On every order over $99 — overnight in major cities." },
    { icon: "fa-shield-halved", title: "2-Year Warranty", desc: "Every product is backed by a no-questions warranty." },
    { icon: "fa-rotate-left", title: "30-Day Returns", desc: "Not in love? Send it back free, no restocking fees." },
    { icon: "fa-headset", title: "24/7 Support", desc: "Real engineers, live chat, average reply under 3 min." },
];

// ==================== LOAD STORE FROM DEXIE ====================

async function loadStoreFromDexie() {
    try {
        // Get store ID from localStorage (set by ecommerce_maker)
        const storeId = localStorage.getItem('currentPreviewStoreId');
        
        if (storeId) {
            currentStore = await storeDB.stores.get(parseInt(storeId));
            if (currentStore) {
                currentStoreId = currentStore.id;
                console.log('✅ Loaded store:', currentStore.storeName);
                return currentStore;
            }
        }
        
        // If no specific store, get the most recent store
        const allStores = await storeDB.stores.toArray();
        if (allStores && allStores.length > 0) {
            allStores.sort((a, b) => b.updatedAt - a.updatedAt);
            currentStore = allStores[0];
            currentStoreId = currentStore.id;
            console.log('✅ Loaded latest store:', currentStore.storeName);
            return currentStore;
        }
        
        console.log('No store found, using demo data');
        return null;
    } catch (error) {
        console.error("Error loading from Dexie:", error);
        return null;
    }
}

// ==================== DYNAMIC CONTENT FROM STORE DATA ====================

function getStoreName() {
    return currentStore?.storeName || "VoltShop";
}

function getStoreType() {
    return currentStore?.storeType || "Premium Tech & Gadgets";
}

function getCustomerSegment() {
    return currentStore?.customerSegment || "All Audiences";
}

function getHeroHeadline() {
    return currentStore?.heroHeadline || "Tech that moves with you.";
}

function getHeroDescription() {
    return currentStore?.heroDescription || "Discover premium audio, wearables, and computing — handpicked by engineers, backed by 2-year warranty and shipped from Addis to your door.";
}

function getHeroImage() {
    return currentStore?.heroImage || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80";
}

function getWelcomeText() {
    return currentStore?.welcomeText || "";
}

function getBioText() {
    return currentStore?.bioText || "";
}

function getFooterText() {
    return currentStore?.footerText || "Premium consumer tech, curated by engineers and shipped worldwide. Pay locally with Ethiopian banks.";
}

function getYearsExperience() {
    return currentStore?.yearsExperience || "5+";
}

function getProjectsCount() {
    return currentStore?.projectsCount || "40+";
}

function getClientsCount() {
    return currentStore?.clientsCount || "30+";
}

function getAwardsCount() {
    return currentStore?.awardsCount || "12";
}

function getSocialLinks() {
    return {
        youtube: currentStore?.youtubeLink || "#",
        linkedin: currentStore?.linkedinLink || "#",
        instagram: currentStore?.instagramLink || "#",
        facebook: currentStore?.facebookLink || "#"
    };
}

function getContactInfo() {
    return {
        email: currentStore?.contactEmail || "store@example.com",
        phone: currentStore?.contactPhone || "+1 (415) 555-0123",
        location: currentStore?.contactLocation || "San Francisco · Remote"
    };
}

function getStoreFeatures() {
    if (currentStore?.features && currentStore.features.length > 0) {
        const iconMap = {
            "Free Shipping": "fa-truck",
            "2-Year Warranty": "fa-shield-halved",
            "30-Day Returns": "fa-rotate-left",
            "24/7 Support": "fa-headset"
        };
        return currentStore.features.map(f => ({
            icon: iconMap[f] || "fa-gem",
            title: f,
            desc: getFeatureDescription(f)
        }));
    }
    return defaultFeatures;
}

function getFeatureDescription(feature) {
    const descMap = {
        "Free Shipping": "On every order over $99 — overnight in major cities.",
        "2-Year Warranty": "Every product is backed by a no-questions warranty.",
        "30-Day Returns": "Not in love? Send it back free, no restocking fees.",
        "24/7 Support": "Real engineers, live chat, average reply under 3 min."
    };
    return descMap[feature] || "Available for all customers";
}

function getTestimonials() {
    if (currentStore?.testimonials && currentStore.testimonials.length > 0) {
        return currentStore.testimonials.filter(t => t.name || t.text).slice(0, 3);
    }
    return [
        { name: "Maya R.", role: "Producer", text: "The Aurora Pro headphones changed my mixing workflow. Crystal clear and comfortable.", image: "" },
        { name: "Daniel K.", role: "Software Engineer", text: "VoltShop's support is unreal — replaced my keyboard in 24h, no questions asked.", image: "" },
        { name: "Lina P.", role: "Photographer", text: "Best place to buy gear online. Honest reviews, fast shipping.", image: "" },
    ];
}

function getPrimaryColor() {
    return currentStore?.primaryColor || "#4f46e5";
}

function getSecondaryColor() {
    return currentStore?.secondaryColor || "#f97316";
}

// ==================== CART FUNCTIONS ====================

function saveCart() { localStorage.setItem('volt_cart', JSON.stringify(cart)); }
function loadCart() {
    const s = localStorage.getItem('volt_cart');
    cart = s ? JSON.parse(s) : [];
}

function updateCartBadges() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-count-badge').forEach(b => {
        if (total > 0) { b.textContent = total; b.style.display = 'grid'; }
        else b.style.display = 'none';
    });
}

function addToCart(p) {
    const ex = cart.find(i => i.id === p.id);
    if (ex) ex.qty++;
    else cart.push({ ...p, qty: 1 });
    saveCart(); updateCartBadges(); renderCartDrawerContent();
    showToast(`${p.name} added to cart`, '#10b981');
}

function updateQty(id, d) {
    const i = cart.findIndex(x => x.id === id);
    if (i < 0) return;
    cart[i].qty += d;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    saveCart(); updateCartBadges(); renderCartDrawerContent();
}

function removeItem(id) {
    cart = cart.filter(x => x.id !== id);
    saveCart(); updateCartBadges(); renderCartDrawerContent();
    showToast("Item removed", '#ef4444');
}

function clearCart() {
    cart = [];
    saveCart(); updateCartBadges(); renderCartDrawerContent();
    showToast("Cart cleared", '#f97316');
}

function getTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function renderCartDrawerContent() {
    if (!cartItemsContainer) return;
    const total = getTotal();
    if (!cart.length) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center text-center py-12">
                <i class="fas fa-shopping-bag text-5xl text-gray-300 dark:text-gray-700 mb-3"></i>
                <p class="text-muted">Your cart is empty.</p>
                <button class="btn btn-outline mt-4" id="closeCartSide">Continue shopping</button>
            </div>`;
        const c = cartItemsContainer.querySelector('#closeCartSide');
        if (c) c.onclick = () => toggleCart(false);
    } else {
        cartItemsContainer.innerHTML = cart.map(it => `
            <div class="flex gap-3 rounded-xl border border-border p-3 bg-white dark:bg-gray-900/50">
                <img src="${it.image}" class="h-20 w-20 rounded-lg object-cover" alt="${it.name}"/>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate">${it.name}</div>
                    <div class="text-xs text-muted">${it.category}</div>
                    <div class="mt-2 flex items-center justify-between">
                        <div class="flex items-center gap-1 rounded-md border border-border">
                            <button class="decr-cart w-7 h-7 grid place-items-center hover:text-indigo-500" data-id="${it.id}"><i class="fas fa-minus text-xs"></i></button>
                            <span class="w-6 text-center text-sm font-bold">${it.qty}</span>
                            <button class="incr-cart w-7 h-7 grid place-items-center hover:text-indigo-500" data-id="${it.id}"><i class="fas fa-plus text-xs"></i></button>
                        </div>
                        <div class="font-bold">$${(it.price * it.qty).toFixed(0)}</div>
                    </div>
                </div>
                <button class="remove-cart-item text-gray-400 hover:text-red-500" data-id="${it.id}"><i class="fas fa-trash-alt"></i></button>
            </div>`).join('');
        document.querySelectorAll('.decr-cart').forEach(b => b.onclick = () => updateQty(b.dataset.id, -1));
        document.querySelectorAll('.incr-cart').forEach(b => b.onclick = () => updateQty(b.dataset.id, 1));
        document.querySelectorAll('.remove-cart-item').forEach(b => b.onclick = () => removeItem(b.dataset.id));
    }
    if (cartSubtotalSpan) cartSubtotalSpan.innerText = `$${total.toFixed(2)}`;
    if (cartTotalSpan) cartTotalSpan.innerText = `$${total.toFixed(2)}`;
}

function toggleCart(open) {
    isCartOpen = open;
    if (!cartDrawerElement || !overlayElement) return;
    cartDrawerElement.classList.toggle('open', open);
    overlayElement.classList.toggle('active', open);
    if (open) renderCartDrawerContent();
}

function showToast(msg, color = '#4f46e5') {
    const t = document.createElement('div');
    t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[1200] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-up';
    t.style.backgroundColor = color;
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}

// ==================== MODALS ====================

function openModal(id) { const m = $('#' + id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = $('#' + id); if (m) m.classList.remove('open'); }
function closeAllModals() { document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open')); }

// ==================== SEARCH ====================

function runSearch() {
    const q = document.getElementById('searchInput')?.value.trim().toLowerCase();
    const out = document.getElementById('searchResults');
    
    if (!q) {
        if (out) out.innerHTML = '<p class="text-muted text-sm text-center py-8">🔍 Type to search products in our catalog.</p>';
        return;
    }
    
    const matches = defaultProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
    );
    
    if (matches.length === 0) {
        if (out) out.innerHTML = `<div class="text-center py-8"><i class="fas fa-search text-4xl text-muted mb-3"></i><p class="text-muted text-sm">No products match "<strong>${q}</strong>"</p></div>`;
        return;
    }
    
    if (out) out.innerHTML = `
        <div class="text-xs text-muted mb-3 pb-2 border-b border-border flex justify-between">
            <span>Found ${matches.length} product${matches.length !== 1 ? 's' : ''}</span>
        </div>
        ${matches.map(p => `
            <div class="search-result-item border border-border rounded-xl p-3 hover:border-indigo-500 transition cursor-pointer" data-product-id="${p.id}">
                <div class="flex gap-3">
                    <img src="${p.image}" class="w-16 h-16 rounded-lg object-cover" alt="${p.name}"/>
                    <div class="flex-1 min-w-0">
                        <div class="font-semibold text-sm">${p.name}</div>
                        <div class="flex items-center gap-2 mt-1"><span class="text-xs text-muted">${p.category}</span>${p.badge ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${p.badge === 'Sale' ? 'bg-red-500' : p.badge === 'New' ? 'bg-orange-500' : 'bg-indigo-500'} text-white">${p.badge}</span>` : ''}</div>
                        <div class="flex items-center gap-1 mt-1"><i class="fas fa-star text-yellow-500 text-[10px]"></i><span class="text-xs font-medium">${p.rating}</span></div>
                    </div>
                    <div class="text-right"><div class="font-bold text-indigo-600">$${p.price}</div>${p.oldPrice ? `<div class="text-xs text-muted line-through">$${p.oldPrice}</div>` : ''}</div>
                    <button class="add-from-search bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition" data-id="${p.id}"><i class="fas fa-cart-plus mr-1"></i> Add</button>
                </div>
            </div>
        `).join('')}
    `;
    
    document.querySelectorAll('.add-from-search').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const product = defaultProducts.find(p => p.id === btn.dataset.id);
            if (product) addToCart(product);
        };
    });
}

// ==================== RENDER SECTIONS ====================

function heroSection() {
    const storeName = getStoreName();
    const headline = getHeroHeadline();
    const description = getHeroDescription();
    const heroImg = getHeroImage();
    
    return `<section class="py-16 md:py-24"><div class="container grid lg:grid-cols-2 gap-12 items-center">
        <div class="space-y-6 animate-fade-up">
            <span class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-semibold"><i class="fas fa-star-of-life text-indigo-500"></i> ${storeName} · ${getStoreType()}</span>
            <h1 class="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight">${headline}</h1>
            <p class="text-muted max-w-lg">${description}</p>
            <div class="flex flex-wrap gap-3">
                <a href="#products" class="btn btn-primary"><i class="fas fa-arrow-right"></i> Shop now</a>
                <a href="#categories" class="btn btn-outline">Browse categories</a>
            </div>
            <div class="flex flex-wrap gap-6 text-sm text-muted">
                ${getStoreFeatures().slice(0, 3).map(f => `<span><i class="fas ${f.icon} text-indigo-500"></i> ${f.title}</span>`).join('')}
            </div>
        </div>
        <div class="relative">
            <div class="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img src="${heroImg}" class="w-full h-full object-cover" alt="${storeName} hero"/>
            </div>
        </div>
    </div></section>`;
}

function categoriesSection() {
    return `<section id="categories" class="py-20 bg-surface dark:bg-black/40"><div class="container">
        <div class="mb-10"><p class="text-sm font-bold text-indigo-600 uppercase tracking-wider">Browse</p><h2 class="text-3xl md:text-5xl font-black">Shop by category</h2></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            ${defaultCategories.map(c => `<a href="#products" class="group flex flex-col items-center gap-3 rounded-2xl border border-border p-5 text-center transition-spring hover:-translate-y-2 hover:border-indigo-400">
                <span class="grid h-14 w-14 place-items-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600"><i class="fas ${c.icon} text-2xl"></i></span>
                <span class="font-semibold">${c.name}</span></a>`).join('')}
        </div>
    </div></section>`;
}

function featuresSection() {
    const features = getStoreFeatures();
    
    return `<section id="features" class="py-20"><div class="container">
        <div class="text-center mb-14"><p class="text-indigo-600 font-bold text-sm uppercase">Why ${getStoreName()}</p><h2 class="text-3xl md:text-5xl font-black">Built for people who care.</h2></div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${features.map(f => `
                <div class="rounded-2xl border border-border p-6 bg-card-grad transition-spring hover:-translate-y-1">
                    <span class="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 text-white shadow-glow mb-4"><i class="fas ${f.icon} text-xl"></i></span>
                    <h3 class="font-bold text-lg mb-2">${f.title}</h3>
                    <p class="text-sm text-muted">${f.desc}</p>
                </div>
            `).join('')}
        </div>
    </div></section>`;
}

function productsSection() {
    return `<section id="products" class="py-20 bg-surface dark:bg-black/40"><div class="container">
        <div class="flex flex-wrap justify-between gap-4 mb-12">
            <div><p class="text-sm font-bold text-indigo-600">Trending</p><h2 class="text-3xl md:text-5xl font-black">Featured products</h2></div>
            <p class="text-muted max-w-md">Curated this week. Limited stock — ships within 24h.</p>
        </div>
        <div id="productGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"></div>
    </div></section>`;
}

function renderProductCards() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = defaultProducts.map(p => `
        <div class="product-card rounded-2xl border border-border bg-card-grad overflow-hidden flex flex-col">
            <div class="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src="${p.image}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" alt="${p.name}"/>
                ${p.badge ? `<span class="absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white ${p.badge === 'Sale' ? 'badge-sale' : p.badge === 'New' ? 'badge-new' : 'badge-best'}">${p.badge}</span>` : ''}
            </div>
            <div class="p-4 flex flex-col gap-2 flex-1">
                <span class="text-xs font-semibold text-muted uppercase">${p.category}</span>
                <h3 class="font-bold leading-snug">${p.name}</h3>
                <div class="flex items-center gap-1 text-xs"><i class="fas fa-star text-yellow-500"></i><span class="font-semibold">${p.rating}</span><span class="text-muted">(${p.reviews.toLocaleString()})</span></div>
                <div class="mt-auto pt-2 flex items-center justify-between gap-2 flex-wrap">
                    <div><span class="text-xl font-extrabold">$${p.price}</span>${p.oldPrice ? `<span class="text-xs line-through text-muted ml-2">$${p.oldPrice}</span>` : ''}</div>
                    <button class="add-to-cart-from-grid btn btn-primary py-2 px-3 text-sm" data-id="${p.id}"><i class="fas fa-cart-plus"></i> Add</button>
                </div>
            </div>
        </div>`).join('');
    document.querySelectorAll('.add-to-cart-from-grid').forEach(btn => {
        btn.onclick = () => {
            const p = defaultProducts.find(x => x.id === btn.dataset.id);
            if (p) addToCart(p);
        };
    });
}

function testimonialsSection() {
    const testimonials = getTestimonials();
    
    return `<section id="reviews" class="py-20"><div class="container">
        <div class="text-center max-w-2xl mx-auto mb-14"><p class="text-sm font-bold text-indigo-600">Loved by our customers</p><h2 class="text-3xl md:text-5xl font-black">What our community says</h2></div>
        <div class="grid md:grid-cols-3 gap-6">
            ${testimonials.map(r => `
                <figure class="rounded-2xl border border-border p-6 bg-card-grad relative">
                    <i class="fas fa-quote-right absolute top-5 right-5 text-indigo-300 text-3xl"></i>
                    <div class="flex gap-0.5 mb-3">${'<i class="fas fa-star text-yellow-500 text-sm"></i>'.repeat(5)}</div>
                    <blockquote class="mb-4">"${escapeHtml(r.text)}"</blockquote>
                    <figcaption><div class="font-bold">${escapeHtml(r.name)}</div><div class="text-sm text-muted">${escapeHtml(r.role)}</div></figcaption>
                </figure>
            `).join('')}
        </div>
    </div></section>`;
}

function newsletterSection() {
    return `<section id="contact" class="py-20"><div class="container">
        <div class="relative overflow-hidden rounded-3xl border border-border bg-card-grad p-8 md:p-12 text-center">
            <i class="fas fa-envelope text-4xl text-indigo-600 mb-4"></i>
            <h2 class="text-3xl md:text-5xl font-black mb-3">Get 10% off your first order</h2>
            <p class="text-muted max-w-md mx-auto mb-6">Subscribe for early access to new drops, exclusive bundles & member-only deals.</p>
            <form id="newsletterFormSubmit" class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input type="email" id="newsEmail" placeholder="you@example.com" class="input flex-1" required/>
                <button type="submit" class="btn btn-primary">Subscribe <i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    </div></section>`;
}

function footerSection() {
    const storeName = getStoreName();
    const footerText = getFooterText();
    const socialLinks = getSocialLinks();
    const contactInfo = getContactInfo();
    
    return `<footer class="border-t border-border py-16 mt-8"><div class="container grid md:grid-cols-5 gap-8">
        <div class="md:col-span-2 space-y-4">
            <div class="flex items-center gap-2 text-2xl font-extrabold"><i class="fas fa-bolt text-indigo-600"></i> ${storeName}</div>
            <p class="text-sm text-muted">${footerText}</p>
            <div class="flex gap-3 text-lg">
                <a href="${socialLinks.youtube}" target="_blank" class="text-muted hover:text-indigo-600"><i class="fab fa-youtube"></i></a>
                <a href="${socialLinks.linkedin}" target="_blank" class="text-muted hover:text-indigo-600"><i class="fab fa-linkedin"></i></a>
                <a href="${socialLinks.instagram}" target="_blank" class="text-muted hover:text-indigo-600"><i class="fab fa-instagram"></i></a>
                <a href="${socialLinks.facebook}" target="_blank" class="text-muted hover:text-indigo-600"><i class="fab fa-facebook"></i></a>
            </div>
        </div>
        <div><h4 class="font-bold mb-4">Shop</h4><ul class="text-sm space-y-2 text-muted"><li>Audio</li><li>Wearables</li><li>Computers</li><li>Gaming</li></ul></div>
        <div><h4 class="font-bold mb-4">Company</h4><ul class="text-sm space-y-2 text-muted"><li>About</li><li>Careers</li><li>Press</li></ul></div>
        <div><h4 class="font-bold mb-4">Support</h4><ul class="text-sm space-y-2 text-muted"><li>Contact</li><li>Returns</li><li>Shipping</li><li>FAQ</li></ul></div>
    </div>
    <div class="container border-t border-border pt-6 mt-10 flex flex-wrap gap-3 justify-between text-xs text-muted">
        <span>© 2026 ${storeName}. All rights reserved.</span>
        <div class="flex flex-wrap gap-2">${['CBE', 'Awash', 'Dashen', 'Telebirr', 'CBEBirr', 'MPesa', 'Chapa'].map(b => `<span class="px-2 py-1 border border-border rounded">${b}</span>`).join('')}</div>
    </div></footer>`;
}

function cartDrawerHTML() {
    return `<div class="cart-overlay" id="cartOverlay"></div>
    <div id="cartDrawer" class="cart-drawer">
        <div class="flex justify-between items-center p-5 border-b border-border">
            <h3 class="text-2xl font-bold flex gap-2 items-center"><i class="fas fa-shopping-bag text-indigo-500"></i> Your Cart</h3>
            <button id="closeDrawerBtn" class="text-gray-500 hover:text-gray-700"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div id="cartItemsContainer" class="flex-1 overflow-y-auto px-5 py-4 space-y-4"></div>
        <div class="border-t border-border p-5 space-y-3">
            <div class="flex justify-between"><span>Subtotal</span><span id="cartSubtotal">$0.00</span></div>
            <div class="flex justify-between font-bold text-xl"><span>Total</span><span id="cartTotal" class="text-gradient">$0.00</span></div>
            <button id="checkoutBtnMain" class="btn btn-primary w-full py-3">Checkout <i class="fas fa-arrow-right"></i></button>
            <button id="clearCartBtn" class="btn btn-ghost w-full text-sm">Clear cart</button>
        </div>
    </div>`;
}

function modalsHTML() {
    const contactInfo = getContactInfo();
    return `
    <div class="modal" id="searchModal">
        <div class="modal-card wide" style="position:relative;margin-top:5vh">
            <button class="modal-close" data-close-modal><i class="fas fa-times"></i></button>
            <h3><i class="fas fa-search text-indigo-500 mr-2"></i>Search Products</h3>
            <div class="search-input-wrap mt-4"><i class="fas fa-search text-muted"></i><input id="searchInput" type="text" placeholder="Search by name, category..." autocomplete="off"/></div>
            <div id="searchResults" class="search-results mt-4"><p class="text-muted text-sm text-center py-8">🔎 Start typing to search our products</p></div>
        </div>
    </div>
    <div class="modal" id="signinModal">
        <div class="modal-card" style="position:relative">
            <button class="modal-close" data-close-modal><i class="fas fa-times"></i></button>
            <h3 id="authTitle">Welcome to ${getStoreName()}</h3>
            <p class="text-muted text-sm mb-5" id="authSubtitle">Sign in to continue your shopping journey.</p>
            <form id="authForm" class="space-y-3">
                <div><label class="label">Email</label><input class="input" type="email" required placeholder="you@example.com"/></div>
                <div><label class="label">Password</label><input class="input" type="password" required minlength="6" placeholder="••••••••"/></div>
                <button type="submit" class="btn btn-primary w-full py-3">Continue <i class="fas fa-arrow-right"></i></button>
            </form>
            <div class="divider">or</div>
            <button class="btn btn-outline w-full py-3"><i class="fab fa-google"></i> Continue with Google</button>
        </div>
    </div>
    <div class="modal" id="checkoutModal">
        <div class="modal-card wide" style="position:relative">
            <button class="modal-close" data-close-modal><i class="fas fa-times"></i></button>
            <h3>Secure checkout</h3>
            <p class="text-muted text-sm mb-5">Pay with your Ethiopian bank or mobile money.</p>
            <form id="checkoutForm" class="space-y-5">
                <div><h4 class="font-bold mb-2">1. Delivery</h4>
                    <div class="row-2 mb-2"><div><label class="label">Full name</label><input class="input" required placeholder="Abebe Bekele"/></div><div><label class="label">Phone</label><input class="input" required placeholder="+251 9..."/></div></div>
                    <div class="mb-2"><label class="label">Address</label><input class="input" required placeholder="${contactInfo.location}"/></div>
                </div>
                <div><h4 class="font-bold mb-2">2. Pay with Ethiopian banks</h4>
                    <div class="bank-grid">${[['CBE', 'Commercial Bank of Ethiopia'], ['Awash', 'Awash Bank'], ['Dashen', 'Dashen Bank'], ['Telebirr', 'Telebirr'], ['CBEBirr', 'CBE Birr']].map((b, i) => `<label class="bank"><input type="radio" name="bank" value="${b[0]}" ${i === 0 ? 'required' : ''}/><div><strong>${b[1]}</strong></div></label>`).join('')}</div>
                </div>
                <div><div class="summary-row"><span>Subtotal</span><strong id="coSubtotal">$0.00</strong></div><div class="summary-row"><span>Delivery</span><strong>$5.00</strong></div><div class="summary-row grand"><span>Total</span><strong id="coTotal">$0.00</strong></div></div>
                <button type="submit" class="btn btn-primary w-full py-3">Place order</button>
            </form>
        </div>
    </div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function attachGlobalListeners() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.onclick = () => {
        darkMode = !darkMode;
        document.body.classList.toggle('dark', darkMode);
        localStorage.setItem('voltTheme', darkMode ? 'dark' : 'light');
        themeBtn.querySelector('i').className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    };
    document.getElementById('cartOpenBtn').onclick = () => toggleCart(true);
    document.getElementById('logoLink').onclick = e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    document.getElementById('searchBtn').onclick = () => { openModal('searchModal'); setTimeout(() => document.getElementById('searchInput')?.focus(), 100); };
    document.getElementById('signinBtn').onclick = () => openModal('signinModal');

    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNavMenu');
    if (mobileToggle && mobileNav) {
        mobileToggle.onclick = () => {
            if (mobileNav.classList.contains('hidden')) {
                mobileNav.classList.remove('hidden');
                mobileNav.innerHTML = `<div class="container flex flex-col py-4 gap-1">${['Shop', 'Categories', 'Features', 'Reviews', 'Contact'].map(l => `<a href="#${l.toLowerCase()}" class="px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded">${l}</a>`).join('')}</div>`;
                mobileNav.querySelectorAll('a').forEach(a => a.onclick = () => mobileNav.classList.add('hidden'));
            } else mobileNav.classList.add('hidden');
        };
    }

    const newsletterForm = document.getElementById('newsletterFormSubmit');
    if (newsletterForm) {
        newsletterForm.onsubmit = e => {
            e.preventDefault();
            showToast("You're in! Check your inbox for 10% off.", '#4f46e5');
            e.target.reset();
        };
    }

    document.querySelectorAll('[data-close-modal]').forEach(b => b.onclick = closeAllModals);
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeAllModals(); toggleCart(false); } });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', runSearch);

    const authToggle = document.getElementById('authToggle');
    if (authToggle) authToggle.onclick = e => { e.preventDefault(); toggleAuthMode(); };
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.onsubmit = e => {
            e.preventDefault();
            closeAllModals();
            showToast('Signed in successfully!', '#10b981');
        };
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.onsubmit = e => {
            e.preventDefault();
            const bank = e.target.querySelector('input[name="bank"]:checked')?.value || 'CBE';
            const total = (getTotal() + 5).toFixed(2);
            showToast(`Order placed! Total: $${total} via ${bank}`, '#10b981');
            cart = []; saveCart(); updateCartBadges(); renderCartDrawerContent();
            closeAllModals();
            toggleCart(false);
        };
    }
}

function attachCartDrawerElements() {
    cartDrawerElement = document.getElementById('cartDrawer');
    overlayElement = document.getElementById('cartOverlay');
    cartItemsContainer = document.getElementById('cartItemsContainer');
    cartSubtotalSpan = document.getElementById('cartSubtotal');
    cartTotalSpan = document.getElementById('cartTotal');
    const closeDrawerBtn = document.getElementById('closeDrawerBtn');
    if (closeDrawerBtn) closeDrawerBtn.onclick = () => toggleCart(false);
    if (overlayElement) overlayElement.onclick = () => toggleCart(false);
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) clearCartBtn.onclick = clearCart;
    const checkoutBtn = document.getElementById('checkoutBtnMain');
    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (!cart.length) { showToast('Your cart is empty', '#ef4444'); return; }
            toggleCart(false);
            const coSubtotal = document.getElementById('coSubtotal');
            const coTotal = document.getElementById('coTotal');
            if (coSubtotal) coSubtotal.textContent = `$${getTotal().toFixed(2)}`;
            if (coTotal) coTotal.textContent = `$${(getTotal() + 5).toFixed(2)}`;
            openModal('checkoutModal');
        };
    }
}

let authMode = 'signin';
function toggleAuthMode() {
    authMode = authMode === 'signin' ? 'signup' : 'signin';
    document.getElementById('authTitle').textContent = authMode === 'signin' ? 'Welcome back' : 'Create your account';
    document.getElementById('authSubtitle').textContent = authMode === 'signin' ? 'Sign in to continue your shopping journey.' : `Join our ${getStoreName()} community today.`;
    document.getElementById('authToggleText').textContent = authMode === 'signin' ? "Don't have an account?" : 'Already have an account?';
    document.getElementById('authToggle').textContent = authMode === 'signin' ? 'Create one' : 'Sign in';
}

function renderApp() {
    rootDiv.innerHTML = `
        ${cartDrawerHTML()}
        <div class="announce"><div class="announce-track">${Array(2).fill('<span>🎉 Free shipping on orders over $99</span><span>•</span><span>Pay with CBE, Awash, Dashen, Telebirr & more</span><span>•</span><span>New arrivals weekly</span><span>•</span><span>2-year warranty on every product</span><span>•</span>').join('')}</div></div>
        <header class="sticky top-0 z-50 border-b border-border bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div class="container flex h-16 md:h-20 items-center justify-between gap-4">
                <a href="#" id="logoLink" class="flex items-center gap-2 font-extrabold text-xl md:text-2xl">
                    <span class="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-600 to-orange-500 text-white shadow-glow"><i class="fas fa-bolt"></i></span>
                    ${getStoreName()}
                </a>
                <nav class="hidden lg:flex items-center gap-8">
                    <a href="#products" class="text-sm font-semibold text-muted hover:text-indigo-600">Shop</a>
                    <a href="#categories" class="text-sm font-semibold text-muted hover:text-indigo-600">Categories</a>
                    <a href="#features" class="text-sm font-semibold text-muted hover:text-indigo-600">Features</a>
                    <a href="#reviews" class="text-sm font-semibold text-muted hover:text-indigo-600">Reviews</a>
                    <a href="#contact" class="text-sm font-semibold text-muted hover:text-indigo-600">Contact</a>
                </nav>
                <div class="flex items-center gap-1 md:gap-2">
                    <button id="searchBtn" class="btn-ghost w-9 h-9 rounded-lg grid place-items-center"><i class="fas fa-search"></i></button>
                    <button id="themeToggleBtn" class="btn-ghost w-9 h-9 rounded-lg grid place-items-center"><i class="fas ${darkMode ? 'fa-sun' : 'fa-moon'}"></i></button>
                    <button id="signinBtn" class="btn-ghost w-9 h-9 rounded-lg grid place-items-center"><i class="fas fa-user"></i></button>
                    <button id="cartOpenBtn" class="relative btn-ghost w-9 h-9 rounded-lg grid place-items-center">
                        <i class="fas fa-shopping-bag"></i>
                        <span class="cart-count-badge absolute -top-1 -right-1 hidden h-5 w-5 place-items-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">0</span>
                    </button>
                    <button id="mobileMenuToggle" class="lg:hidden btn-ghost w-9 h-9 rounded-lg grid place-items-center"><i class="fas fa-bars"></i></button>
                </div>
            </div>
            <div id="mobileNavMenu" class="hidden lg:hidden border-t border-border bg-white dark:bg-gray-900"></div>
        </header>
        <main>
            ${heroSection()}
            ${categoriesSection()}
            ${featuresSection()}
            ${productsSection()}
            ${testimonialsSection()}
            ${newsletterSection()}
        </main>
        ${footerSection()}
        ${modalsHTML()}
    `;
    attachGlobalListeners();
    attachCartDrawerElements();
    renderProductCards();
    renderCartDrawerContent();
    updateCartBadges();
}

// Apply dynamic colors based on store settings
function applyBrandColors() {
    const primaryColor = getPrimaryColor();
    const secondaryColor = getSecondaryColor();
    
    // Create style element for dynamic colors
    const style = document.createElement('style');
    style.textContent = `
        .text-gradient { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); background-clip: text; -webkit-background-clip: text; color: transparent; }
        .btn-primary { background: linear-gradient(105deg, ${primaryColor}, ${secondaryColor}); }
        .badge-best, .btn-primary:hover { background: ${primaryColor}; }
        .badge-new { background: ${secondaryColor}; }
        .text-indigo-600, .text-indigo-500 { color: ${primaryColor} !important; }
        .bg-indigo-600, .bg-indigo-500 { background-color: ${primaryColor} !important; }
        .border-indigo-500, .border-indigo-400 { border-color: ${primaryColor} !important; }
        .bg-gradient-to-br { background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}) !important; }
        .shadow-glow { box-shadow: 0 8px 20px -6px ${primaryColor}80; }
        .ring-indigo-500 { --tw-ring-color: ${primaryColor}; }
        .hover\\:border-indigo-400:hover { border-color: ${primaryColor} !important; }
        .hover\\:text-indigo-600:hover { color: ${primaryColor} !important; }
        .from-indigo-600 { --tw-gradient-from: ${primaryColor}; }
        .to-orange-500 { --tw-gradient-to: ${secondaryColor}; }
        .via-indigo-500 { --tw-gradient-via: ${primaryColor}; }
    `;
    document.head.appendChild(style);
}

// ==================== INITIALIZATION ====================

async function init() {
    rootDiv = document.getElementById('app-root');
    if (!rootDiv) return;
    
    document.body.classList.toggle('dark', darkMode);
    loadCart();
    
    await loadStoreFromDexie();
    applyBrandColors();
    renderApp();
    
    console.log('✅ Store loaded from ecommerce_maker');
}

// Start the app
init();