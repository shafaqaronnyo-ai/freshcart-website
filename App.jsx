import React, { useState, useEffect } from 'react';
import { useHousehold } from './householdSync';
import groceryCatalog from './groceryCatalog.json';
import { Settings, Brush, ShoppingBag, LayoutGrid, Sparkles, Plus, Check, Circle, Search, Heart, X, Edit3, Leaf, Coffee, Wheat, Drumstick, Package, Cookie, Snowflake, Home, ShoppingCart, Trash2, AlertCircle, Mic, Share2, ListPlus, Loader2, CheckCircle2, Copy, User, Lock, Mail, ArrowRight, LogOut, KeyRound, ArrowLeft } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('My List'); 
  const [activeCategory, setActiveCategory] = useState('All');
  const [catalogItems, setCatalogItems] = useState([]);
  const [items, setItems] = useState([]);
  const household = useHousehold(setItems, catalogItems);
  const [joinCode, setJoinCode] = useState('');
  const [recoverCode, setRecoverCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [addingItems, setAddingItems] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [toastType, setToastType] = useState('success');
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Form Inputs
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [signupEmailInput, setSignupEmailInput] = useState('');
  const [signupPasswordInput, setSignupPasswordInput] = useState('');
  const [signupConfirmPasswordInput, setSignupConfirmPasswordInput] = useState('');
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [authMode, setAuthMode] = useState('signin');

  // Settings Toggles
  const [autoClear, setAutoClear] = useState(false);
  const [vibrate, setVibrate] = useState(true);
  const [fontSize, setFontSize] = useState('default');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [stagedItems, setStagedItems] = useState([]);
  const [modalDept, setModalDept] = useState('Fresh Food');

  // Recipe States
  const [recipeInput, setRecipeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [selectedRecipeItems, setSelectedRecipeItems] = useState([]);

  const categories = ['All', 'Favorites', 'Fresh Food', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Frozen', 'Household'];
  
  const navItems = [
    { name: 'My List', icon: ShoppingBag },
    { name: 'Browse Items', icon: LayoutGrid },
    { name: 'Recipe', icon: Sparkles },
  ];

  const departments = [
    { name: 'Favorites', icon: Heart },
    { name: 'Fresh Food', icon: Leaf },
    { name: 'Dairy & Eggs', icon: Coffee },
    { name: 'Bakery', icon: Wheat },
    { name: 'Pantry', icon: Package },
    { name: 'Frozen', icon: Snowflake },
    { name: 'Household', icon: Home },
  ];

  // Shared with the Android app: original SQLite grocery catalogue, bundled locally.
  useEffect(() => {
    setCatalogItems(groceryCatalog);
  }, []);

  const filteredCatalog = catalogItems.filter(item => {
    let matchesCategory = false;
    if (activeCategory === 'All') {
      matchesCategory = true;
    } else if (activeCategory === 'Favorites') {
      matchesCategory = favorites.includes(item.id);
    } else {
      matchesCategory = item.category === activeCategory;
    }
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const modalSearchResults = modalSearchQuery 
    ? catalogItems.filter(i => i.name.toLowerCase().includes(modalSearchQuery.toLowerCase())).slice(0, 5)
    : [];
    
  const quickPickItems = modalDept === 'Favorites' 
    ? catalogItems.filter(i => favorites.includes(i.id)).slice(0, 15)
    : catalogItems.filter(i => i.category === modalDept).slice(0, 15);

  const triggerToast = (msg, type = 'success') => {
    setToastType(type);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      triggerToast('Listening... Speak your recipe now', 'success');
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setRecipeInput(speechToText);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      triggerToast('Voice recognition failed. Please try again.', 'error');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmailInput.trim()) return;
    const derivedName = loginEmailInput.split('@')[0];
    setUserName(derivedName.charAt(0).toUpperCase() + derivedName.slice(1));
    setUserEmail(loginEmailInput);
    setIsLoggedIn(true);
    triggerToast('Logged in successfully!', 'success');
    setActiveTab('My List');
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!firstNameInput.trim() || !lastNameInput.trim() || !signupEmailInput.trim()) return;
    if (signupPasswordInput !== signupConfirmPasswordInput) {
      triggerToast('Passwords do not match', 'error');
      return;
    }
    setUserName(`${firstNameInput.trim()} ${lastNameInput.trim()}`);
    setUserEmail(signupEmailInput);
    setIsLoggedIn(true);
    triggerToast('Account created successfully!', 'success');
    setActiveTab('My List');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmailInput.trim()) return;
    triggerToast('Password reset link sent to your email!', 'success');
    setForgotEmailInput('');
    setAuthMode('signin');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setUserEmail('');
    triggerToast('Logged out successfully', 'success');
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]);
  };

  const toggleStagedItem = (item) => {
    const isStaged = stagedItems.some(i => i.id === item.id);
    if (isStaged) {
      setStagedItems(stagedItems.filter(i => i.id !== item.id));
    } else {
      if (items.some(existing => existing.name === item.name)) {
        triggerToast('Item already added to the list', 'success');
        return;
      }
      setStagedItems([...stagedItems, item]);
    }
  };

  const commitStagedItems = () => {
    const newItems = stagedItems.map(item => ({ 
      id: Date.now() + Math.random(), 
      name: item.name, 
      image: item.image,
      completed: false 
    }));
    if (household.enabled) household.add(stagedItems);
    else setItems([...items, ...newItems]);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStagedItems([]);
    setModalSearchQuery('');
  };

  const addFromCatalog = (item) => {
    if (items.some(existing => existing.name === item.name)) {
      triggerToast('Item already added to the list', 'success');
      return;
    }
    const newItem = { id: Date.now(), name: item.name, image: item.image, completed: false };
    if (household.enabled) household.add([item]);
    else setItems(prevItems => [...prevItems, newItem]);
    
    setAddingItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddingItems(prev => ({ ...prev, [item.id]: false })), 1000);
  };

  const toggleItem = (id) => {
    if (household.enabled) { const item = items.find(i => i.id === id); if (item) household.toggle(item, autoClear); return; }
    setItems(items.map(item => {
      if (item.id === id) {
        const nextCompleted = !item.completed;
        if (autoClear && nextCompleted) return null; 
        return { ...item, completed: nextCompleted };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id, e) => { e.stopPropagation(); if (household.enabled) household.remove(id); else setItems(items.filter(item => item.id !== id)); };
  const clearCompletedItems = () => household.enabled ? household.clearCompleted() : setItems(items.filter(item => !item.completed));
  const clearEntireList = () => household.enabled ? household.clearAll() : setItems([]);

  const copyListToClipboard = () => {
    const textList = items.map(i => `${i.completed ? '[x]' : '[ ]'} ${i.name}`).join('\n');
    navigator.clipboard.writeText(textList || 'My FreshCart list is empty!');
    triggerToast('List copied to clipboard!', 'success');
  };

  const shareList = () => {
    const textList = items.map(i => `${i.completed ? '✅' : '⭕'} ${i.name}`).join('\n');
    if (navigator.share) {
      navigator.share({ title: 'My FreshCart List', text: textList }).catch(() => {});
    } else {
      copyListToClipboard();
    }
  };
  
  const handleGenerateIngredients = async () => {
    if (!recipeInput.trim()) return;
    setIsGenerating(true);
    setGeneratedRecipe(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ query: recipeInput })
      });
      
      const data = await response.json();
      const enhancedIngredients = data.ingredients.map((ing, index) => {
        const foundMatch = catalogItems.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
        return {
          ...ing,
          id: ing.id || `ai-${index}`,
          image: foundMatch ? foundMatch.image : (ing.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'),
          category: foundMatch ? foundMatch.category : (ing.category || 'Pantry')
        };
      });

      setGeneratedRecipe({ ...data, ingredients: enhancedIngredients });
      setSelectedRecipeItems(enhancedIngredients.map(i => i.id));
    } catch (error) {
      triggerToast("Cannot connect to AI server. Check your Python backend.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRecipeIngredient = (id) => {
    setSelectedRecipeItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addRecipeToList = () => {
    if (!generatedRecipe) return;
    const ingredientsToAdd = generatedRecipe.ingredients.filter(ing => selectedRecipeItems.includes(ing.id));
    const newItems = ingredientsToAdd.map(ing => ({
      id: Date.now() + Math.random(),
      name: ing.name,
      image: ing.image,
      completed: false
    }));

    if (household.enabled) household.add(ingredientsToAdd);
    else setItems(prev => [...prev, ...newItems]);
    triggerToast(`Added ${newItems.length} items to your list!`, 'success');
    setGeneratedRecipe(null);
    setRecipeInput('');
    setActiveTab('My List');
  };

  const completedCount = items.filter(i => i.completed).length;
  const progressPercent = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-xl';
      case 'xl': return 'text-2xl';
      default: return 'text-lg';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans relative">
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className={`bg-white border-2 rounded-2xl shadow-xl py-3 px-6 flex items-center space-x-3 ${toastType === 'error' ? 'border-red-500' : 'border-brand-green'}`}>
            {toastType === 'error' ? <AlertCircle className="text-red-500" size={24} /> : <CheckCircle2 className="text-brand-green" size={24} />}
            <span className={`font-bold text-lg ${toastType === 'error' ? 'text-red-700' : 'text-brand-green'}`}>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="px-5 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 overflow-hidden">
                <img src="/logo-icon.png" alt="FreshCart Icon" className="w-7 h-7 object-contain shrink-0" />
                <img src="/logo-text.png" alt="FreshCart" className="h-10 w-auto object-contain -ml-1" />
              </div>
              <button 
                onClick={() => setActiveTab('Login')}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 active:scale-95 ${
                  isLoggedIn ? 'bg-brand-green text-white hover:bg-green-700' : 'bg-brand-lightGreen text-brand-green hover:bg-green-700 hover:text-white'
                }`}
                title={isLoggedIn ? `Logged in as ${userEmail}` : 'User Login'}
              >
                <User size={18} />
              </button>
            </div>
            {isLoggedIn && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
                  <span className="text-xs font-bold text-slate-700 truncate">{userName}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{userEmail}</span>
              </div>
            )}
          </div>
          
          <nav className="mt-6 px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                    isActive ? 'bg-brand-lightGreen text-brand-green font-medium shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4">
          <button 
            onClick={() => setActiveTab('Settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
              activeTab === 'Settings' ? 'bg-brand-lightGreen text-brand-green font-medium shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Settings size={22} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto p-8">
          
          {activeTab === 'My List' && (
            <>
              <div className="bg-brand-lightGreen rounded-2xl p-6 mb-8 flex items-center justify-between shadow-sm">
                <div className="flex-1 max-w-md">
                  <div className="flex items-center space-x-2 text-brand-green font-semibold text-lg mb-3">
                    <span className="text-xl">🌿</span>
                    <h2>{completedCount} of {items.length} items gathered</h2>
                  </div>
                  <div className="w-full bg-brand-accent rounded-full h-2 mb-2">
                    <div className="bg-brand-green h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{progressPercent}% completed</p>
                </div>
                <button onClick={clearCompletedItems} title="Clear completed items" className="bg-white p-4 rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 transition-all duration-200 hover:scale-110 active:scale-90">
                  <Brush className="text-brand-green" size={24} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="bg-brand-lightGreen p-5 rounded-full mb-6"><ShoppingBag className="text-brand-green" size={32} /></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No items in this department</h3>
                  <p className="text-slate-500 max-w-md">Click the + button below or browse the catalog to add items to your list.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item.id} onClick={() => toggleItem(item.id)} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-brand-green transition-all duration-200 group">
                      <div className="flex items-center space-x-4">
                        <div className={`p-1 rounded-full ${item.completed ? 'bg-brand-green text-white' : 'text-slate-300'}`}>
                          {item.completed ? <Check size={20} /> : <Circle size={20} />}
                        </div>
                        {item.image && <img src={item.image} alt={item.name} className={`w-14 h-14 rounded-xl object-cover shadow-sm ${item.completed ? 'opacity-50' : 'opacity-100'}`} />}
                        <span className={`${getFontSizeClass()} font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.name}</span>
                      </div>
                      <button onClick={(e) => removeItem(item.id, e)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"><Trash2 size={20} /></button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => { setModalDept('Fresh Food'); setIsModalOpen(true); }} className="fixed bottom-8 right-8 bg-brand-green text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 transition-all z-40">
                <Plus size={32} />
              </button>
            </>
          )}

          {activeTab === 'Browse Items' && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search catalog (${catalogItems.length} items)...`} className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-2xl shadow-sm focus:outline-none focus:border-brand-green text-lg" />
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button key={category} onClick={() => setActiveCategory(category)} className={`px-6 py-2 rounded-full border text-sm font-medium transition-all ${activeCategory === category ? 'bg-brand-green text-white border-brand-green shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-green'}`}>{category}</button>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCatalog.map(item => {
                  const isFavorited = favorites.includes(item.id);
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="relative h-48 bg-slate-100">
                        <img src={item.image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" title={item.imageSource ? `Photo source: ${item.imageSource}` : 'FreshCart placeholder image'} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500" onError={(e)=>{if(!e.currentTarget.src.endsWith('/logo-icon.png')) e.currentTarget.src='/logo-icon.png'}} />
                        <button onClick={() => toggleFavorite(item.id)} className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors ${isFavorited ? 'bg-white text-red-500' : 'bg-white/90 text-slate-400 hover:text-red-500'}`}>
                          <Heart size={20} className={isFavorited ? "fill-current" : ""} />
                        </button>
                      </div>
                      <div className="p-4 relative">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.category}</p>
                        <h4 className="text-lg font-bold text-slate-800">{item.name}</h4>
                        <button onClick={() => addFromCatalog(item)} className={`absolute bottom-4 right-4 p-2 rounded-full shadow-sm transition-all ${addingItems[item.id] ? 'bg-green-500 text-white scale-110' : 'bg-brand-green text-white hover:bg-green-700'}`}>
                          {addingItems[item.id] ? <Check size={20} /> : <Plus size={20} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Recipe' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-brand-lightGreen text-brand-green p-4 rounded-full"><Sparkles size={28} /></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">What do you want to cook?</h2>
                    <p className="text-slate-500">Search recipe to get the ingriedients for the dish</p>
                  </div>
                </div>
                <div className="relative mb-6">
                  <input type="text" value={recipeInput} onChange={(e) => setRecipeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateIngredients()} placeholder="e.g. Thai Green Curry, Pasta..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-lg focus:outline-none focus:border-brand-green" />
                  <button type="button" onClick={handleVoiceInput} className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'text-slate-400 hover:text-brand-green'}`}><Mic size={24} /></button>
                </div>
                <button onClick={handleGenerateIngredients} disabled={isGenerating || !recipeInput.trim()} className="w-full bg-brand-green hover:bg-green-700 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-sm">
                  {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <><Sparkles size={24} /><span>Search Ingredients</span></>}
                </button>
              </div>

              {generatedRecipe && (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                    <h3 className="text-2xl font-bold text-slate-800">{generatedRecipe.title}</h3>
                    <button onClick={() => setGeneratedRecipe(null)} className="p-2 hover:bg-slate-50 rounded-full"><X size={22} /></button>
                  </div>
                  <div className="space-y-4 mb-8">
                    {generatedRecipe.ingredients.map((ing) => {
                      const isSelected = selectedRecipeItems.includes(ing.id);
                      return (
                        <div key={ing.id} onClick={() => toggleRecipeIngredient(ing.id)} className="flex items-center space-x-4 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer">
                          <div className={`p-1 rounded-full ${isSelected ? 'bg-brand-green text-white' : 'text-slate-300'}`}>{isSelected ? <Check size={20} /> : <Circle size={20} />}</div>
                          <img src={ing.image} alt={ing.name} className="w-14 h-14 rounded-xl object-cover" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}} />
                          <div className="flex-1"><h4 className="text-lg font-bold text-slate-800">{ing.name}</h4></div>
                          {ing.qty && <span className="text-slate-500 font-medium pr-2">{ing.qty}</span>}
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={addRecipeToList} className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-sm"><ListPlus size={24} /><span>Add Ingredients to My List</span></button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Login' && (
            <div className="max-w-md mx-auto py-12">
              <div className="bg-white rounded-[2.55rem] border border-slate-100 shadow-xl p-8 sm:p-10">
                {isLoggedIn ? (
                  <div className="space-y-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-800">Account Profile</h2>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <p className="text-sm text-slate-400 font-bold mb-1">Signed in as</p>
                      <p className="text-xl font-bold text-slate-800">{userName}</p>
                      <p className="text-sm text-slate-500">{userEmail}</p>
                    </div>
                    <button onClick={() => setActiveTab('My List')} className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl">Go to Shopping List</button>
                    <button onClick={handleLogout} className="w-full bg-white border border-red-200 text-red-600 font-bold py-4 rounded-2xl">Log Out</button>
                  </div>
                ) : authMode === 'forgot' ? (
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">Reset Password</h2>
                    <form onSubmit={handleForgotSubmit} className="space-y-5">
                      <input type="email" required value={forgotEmailInput} onChange={(e) => setForgotEmailInput(e.target.value)} placeholder="name@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5" />
                      <button type="submit" className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl">Send Reset Instructions</button>
                      <button type="button" onClick={() => setAuthMode('signin')} className="w-full text-sm font-semibold text-slate-500">Back to Sign In</button>
                    </form>
                  </div>
                ) : authMode === 'signup' ? (
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">Create Account</h2>
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <input type="email" required value={signupEmailInput} onChange={(e) => setSignupEmailInput(e.target.value)} placeholder="Email Address" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" required value={firstNameInput} onChange={(e) => setFirstNameInput(e.target.value)} placeholder="First Name" className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm" />
                        <input type="text" required value={lastNameInput} onChange={(e) => setLastNameInput(e.target.value)} placeholder="Last Name" className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm" />
                      </div>
                      <input type="password" required value={signupPasswordInput} onChange={(e) => setSignupPasswordInput(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                      <input type="password" required value={signupConfirmPasswordInput} onChange={(e) => setSignupConfirmPasswordInput(e.target.value)} placeholder="Confirm Password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm" />
                      <button type="submit" className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl">Sign Up</button>
                      <button type="button" onClick={() => setAuthMode('signin')} className="w-full text-sm font-semibold text-brand-green">Already have an account? Sign In</button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 text-center mb-6">Welcome Back</h2>
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      <input type="email" required value={loginEmailInput} onChange={(e) => setLoginEmailInput(e.target.value)} placeholder="name@example.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5" />
                      <input type="password" required value={loginPasswordInput} onChange={(e) => setLoginPasswordInput(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5" />
                      <div className="flex justify-end"><button type="button" onClick={() => setAuthMode('forgot')} className="text-xs font-bold text-brand-green">Forgot password?</button></div>
                      <button type="submit" className="w-full bg-brand-green text-white font-bold py-4 rounded-2xl">Sign In</button>
                      <button type="button" onClick={() => setAuthMode('signup')} className="w-full text-sm font-semibold text-brand-green">Don't have an account? Sign Up</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Settings' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold text-brand-green">FreshCart Settings</h2>
              <section className="bg-white rounded-3xl border p-6 space-y-4" aria-label="Shared household">
                <h3 className="text-xl font-bold text-brand-green">Shared Household</h3>
                <p role="status">{household.message}</p>
                {!household.enabled && <p>Supabase configuration is required for sharing.</p>}
                <div className="flex flex-wrap gap-2">
                  <button disabled={!household.connected || household.busy} onClick={household.create} className="bg-brand-green text-white rounded-xl p-3 disabled:opacity-50">Create household</button>
                  <button disabled={!household.connected || household.busy} onClick={household.inviteMember} className="bg-brand-green text-white rounded-xl p-3 disabled:opacity-50">Create invitation</button>
                  <button disabled={!household.connected || household.busy} onClick={household.createRecovery} className="bg-brand-green text-white rounded-xl p-3 disabled:opacity-50">Create recovery code</button>
                </div>
                {household.invite && <p>Invitation (one use, 10 minutes): <strong>{household.invite}</strong> <button onClick={() => navigator.clipboard.writeText(household.invite)} className="underline">Copy</button></p>}
                {household.recovery && <p>Keep this recovery code private: <strong>{household.recovery}</strong> <button onClick={() => navigator.clipboard.writeText(household.recovery)} className="underline">Copy</button></p>}
                <label htmlFor="join-household" className="block font-semibold">Join household</label>
                <div className="flex gap-2"><input id="join-household" value={joinCode} onChange={e => setJoinCode(e.target.value)} className="border rounded-xl p-3 flex-1 min-w-0" placeholder="Invitation code"/><button disabled={!household.connected || household.busy || !joinCode.trim()} onClick={() => household.join(joinCode)} className="bg-brand-green text-white rounded-xl p-3 disabled:opacity-50">Join</button></div>
                <label htmlFor="recover-household" className="block font-semibold">Recover household on another device</label>
                <div className="flex gap-2"><input id="recover-household" value={recoverCode} onChange={e => setRecoverCode(e.target.value)} className="border rounded-xl p-3 flex-1 min-w-0" placeholder="Recovery code"/><button disabled={!household.connected || household.busy || !recoverCode.trim()} onClick={() => household.recover(recoverCode)} className="bg-brand-green text-white rounded-xl p-3 disabled:opacity-50">Recover</button></div>
              </section>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center space-x-5">
                <div className="w-16 h-16 rounded-full bg-brand-lightGreen text-brand-green flex items-center justify-center shrink-0"><Home size={32} /></div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">FreshCart</h3>
                  <div className="flex items-center space-x-2 mt-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span><span className="text-slate-500 text-sm font-medium">{household.enabled ? 'Shared household list' : 'Local demo list'} ({items.length} items)</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">List & Shopping Behavior</h4>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-100 overflow-hidden">
                  <div className="p-6 flex items-center justify-between">
                    <div><h5 className="font-bold text-slate-800 text-lg">Auto-clear Checked Items</h5><p className="text-slate-500 text-sm">Remove items instantly when checked off</p></div>
                    <button onClick={() => setAutoClear(!autoClear)} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${autoClear ? 'bg-brand-green' : 'bg-slate-300'}`}><div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${autoClear ? 'translate-x-6' : 'translate-x-0'}`}></div></button>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div><h5 className="font-bold text-slate-800 text-lg">Vibrate on Item Checkmark</h5><p className="text-slate-500 text-sm">Tactile confirmation while shopping</p></div>
                    <button onClick={() => setVibrate(!vibrate)} className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${vibrate ? 'bg-brand-green' : 'bg-slate-300'}`}><div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${vibrate ? 'translate-x-6' : 'translate-x-0'}`}></div></button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Add Item Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-800">Add to List</h3>
              <button onClick={closeModal} className="bg-slate-100 p-2.5 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="px-8 overflow-y-auto flex-1 pb-4">
              <div className="relative mb-6">
                <input type="text" autoFocus value={modalSearchQuery} onChange={(e) => setModalSearchQuery(e.target.value)} placeholder="Type item name..." className="w-full border border-slate-200 rounded-2xl p-3 text-lg" />
                {modalSearchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-xl max-h-48 overflow-y-auto z-20">
                    {modalSearchResults.map(item => (
                      <button key={item.id} onClick={() => { toggleStagedItem(item); setModalSearchQuery(''); }} className="w-full flex items-center p-3 hover:bg-slate-50 text-left">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover mr-3" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}} />
                        <span className="flex-1 font-semibold">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RESTORED QUICK-PICK HORIZONTAL SCROLL ROW */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-3">
                  <h4 className="font-bold text-slate-800 text-base">Tap Products to Add ({modalDept})</h4>
                  <span className="text-xs font-medium text-slate-400">{quickPickItems.length} items</span>
                </div>
                
                <div className="flex overflow-x-auto pb-3 gap-3 scrollbar-hide -mx-8 px-8 snap-x">
                  {quickPickItems.map(item => {
                    const isSelected = stagedItems.some(i => i.id === item.id);
                    return (
                      <button 
                        key={`pill-${item.id}`}
                        onClick={() => toggleStagedItem(item)}
                        className={`flex items-center p-1.5 pr-5 rounded-full border transition-all duration-200 whitespace-nowrap snap-start shrink-0 ${isSelected ? 'border-brand-green bg-brand-lightGreen/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        {isSelected ? (
                          <div className="w-9 h-9 rounded-full bg-brand-green text-white flex items-center justify-center mr-3 shrink-0"><Check size={18} /></div>
                        ) : (
                          <img src={item.image} alt={item.name} className="w-9 h-9 rounded-full object-cover mr-3 shrink-0 border border-slate-100" onError={(e)=>{e.target.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'}} />
                        )}
                        <span className={`font-semibold text-sm ${isSelected ? 'text-brand-green' : 'text-slate-700'}`}>{item.name} {isSelected && '(In List)'}</span>
                      </button>
                    );
                  })}
                  {quickPickItems.length === 0 && (
                    <div className="text-slate-400 text-sm py-2 px-1">No items found in this department.</div>
                  )}
                </div>
              </div>

              {/* Department Buttons Grid */}
              <div className="mb-4">
                <h4 className="font-bold text-slate-800 text-base mb-3">Departments</h4>
                <div className="grid grid-cols-3 gap-3">
                  {departments.map(dept => {
                    const DeptIcon = dept.icon;
                    const isActive = modalDept === dept.name;
                    return (
                      <button
                        key={dept.name}
                        onClick={() => setModalDept(dept.name)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${isActive ? 'bg-brand-green text-white border-brand-green shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-green'}`}
                      >
                        <DeptIcon size={22} className="mb-1" />
                        <span className="text-xs font-semibold text-center">{dept.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="p-6 border-t flex gap-4 bg-slate-50">
              <button onClick={closeModal} className="px-8 py-4 rounded-2xl font-bold text-slate-600 bg-white border">Cancel</button>
              <button onClick={commitStagedItems} disabled={stagedItems.length === 0} className="flex-1 py-4 rounded-2xl font-bold text-white bg-brand-green disabled:opacity-50">
                {stagedItems.length > 0 ? `Add ${stagedItems.length} to List` : 'Add 0 to List'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default App;