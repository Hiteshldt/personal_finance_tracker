'use client';

import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Building2, Plus, Minus, Home as HomeIcon, Receipt, Briefcase, Gem, Moon, Sun, X, ChevronLeft, ChevronRight, BarChart3, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type Account = { id: number; name: string; type: string; balance: number };
type Category = { id: number; name: string; type: string };
type Transaction = { id: number; amount: number; type: string; category_name?: string; account_name?: string; description?: string; date: string };
type Asset = { id: number; name: string; value: number; type: string };
type User = { id: number; name: string; username: string };

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'pincode' | 'app'>('pincode');
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'assets' | 'chart'>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    // Check for existing session
    const savedUserId = localStorage.getItem('userId');
    const savedUsername = localStorage.getItem('username');
    if (savedUserId && savedUsername) {
      setAuthMode('pincode');
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [selectedMonth, selectedYear, user]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!user) return null;
    const headers = {
      ...options.headers,
      'x-user-id': user.id.toString(),
      'Content-Type': 'application/json',
    };
    return fetch(url, { ...options, headers });
  };

  const loadData = async () => {
    if (!user) return;

    const [accountsRes, categoriesRes, txRes, statsRes, assetsRes] = await Promise.all([
      authenticatedFetch('/api/accounts'),
      authenticatedFetch('/api/categories'),
      authenticatedFetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`),
      authenticatedFetch(`/api/transactions/stats?month=${selectedMonth}&year=${selectedYear}`),
      authenticatedFetch('/api/assets'),
    ]);

    if (accountsRes) setAccounts(await accountsRes.json());
    if (categoriesRes) setCategories(await categoriesRes.json());
    if (txRes) setTransactions(await txRes.json());
    if (statsRes) setStats(await statsRes.json());
    if (assetsRes) setAssets(await assetsRes.json());
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id.toString());
    localStorage.setItem('username', userData.username);
    localStorage.setItem('userName', userData.name);
    setAuthMode('app');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userName');
    setAuthMode('pincode');
    setAccounts([]);
    setCategories([]);
    setTransactions([]);
    setAssets([]);
    setStats({});
  };

  const addAccount = async (name: string, type: string, balance: number) => {
    await authenticatedFetch('/api/accounts', { method: 'POST', body: JSON.stringify({ name, type, balance }) });
    setShowAddAccount(false);
    loadData();
  };

  const addTransaction = async (data: any) => {
    await authenticatedFetch('/api/transactions', { method: 'POST', body: JSON.stringify(data) });
    setShowAddTx(false);
    loadData();
  };

  const addAsset = async (name: string, value: number, type: string) => {
    await authenticatedFetch('/api/assets', { method: 'POST', body: JSON.stringify({ name, value, type }) });
    setShowAddAsset(false);
    loadData();
  };

  const addCategory = async (name: string, type: 'income' | 'expense') => {
    await authenticatedFetch('/api/categories', { method: 'POST', body: JSON.stringify({ name, type }) });
    setShowAddCategory(false);
    loadData();
  };

  const deleteTransaction = async (id: number) => {
    if (confirm('Delete this transaction?')) {
      await authenticatedFetch('/api/transactions', { method: 'DELETE', body: JSON.stringify({ id }) });
      loadData();
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
  const netWorth = totalBalance + totalAssets;

  // Show auth screens if not logged in
  if (authMode === 'signup') {
    return <SignupScreen onSuccess={handleLogin} onSwitchToLogin={() => setAuthMode('login')} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (authMode === 'login') {
    return <LoginScreen onSuccess={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (authMode === 'pincode') {
    return <PincodeScreen onSuccess={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} onSwitchToLogin={() => setAuthMode('login')} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/20 pb-24 transition-all duration-300">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 dark:from-primary-900 dark:via-blue-900 dark:to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>

        <div className="relative max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm opacity-90">Welcome back,</p>
                <h1 className="text-xl font-bold">{user?.name || 'User'}</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleDarkMode} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 shadow-xl">
            <p className="text-sm opacity-80 mb-2">Total Net Worth</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">₹{Math.floor(netWorth).toLocaleString('en-IN')}</span>
              <span className="text-base opacity-80">.{(netWorth % 1).toFixed(2).slice(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 -mt-4">
        {tab === 'dashboard' && (
          <div className="space-y-5">
            {/* Month Selector */}
            <div className="glass-card rounded-2xl p-4 shadow-lg dark:border dark:border-gray-800">
              <div className="flex items-center justify-between">
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 2); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Total Expense Only */}
            <div className="glass-card rounded-2xl p-5 shadow-lg dark:border dark:border-red-900/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-base font-semibold text-red-700 dark:text-red-400">Total Expenses</span>
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">₹{(stats.total_expenses || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        {tab === 'chart' && (
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5 shadow-lg dark:border dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">Monthly Overview</h3>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 2); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'This Month', Income: stats.total_income || 0, Expenses: stats.total_expenses || 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Income" fill="#10b981" />
                    <Bar dataKey="Expenses" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-400 mb-1">Total Income</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{(stats.total_income || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-sm text-red-700 dark:text-red-400 mb-1">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">₹{(stats.total_expenses || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'transactions' && (
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-4 shadow-lg dark:border dark:border-gray-800">
              <div className="flex items-center justify-between">
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 2); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden shadow-lg dark:border dark:border-gray-800">
              <div className="max-h-[65vh] overflow-y-auto scrollbar-hide">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                    <p className="text-gray-400 dark:text-gray-600 mb-4">No transactions this month</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Click the + or - buttons below to add</p>
                  </div>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} onClick={() => deleteTransaction(tx.id)} className="p-5 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{tx.category_name || tx.type}</p>
                          {tx.account_name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tx.account_name}</p>}
                          {tx.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{tx.description}</p>}
                        </div>
                        <div className="text-right ml-4">
                          <p className={`font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'accounts' && (
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5 shadow-lg dark:border dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Accounts</h3>
                <button onClick={() => setShowAddAccount(true)} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {accounts.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                  <p className="text-gray-400 dark:text-gray-600 mb-6">No accounts yet</p>
                  <button onClick={() => setShowAddAccount(true)} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">Add Your First Account</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg">
                          {acc.type === 'bank' ? <Building2 className="w-6 h-6 text-white" /> : <Wallet className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{acc.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{acc.type}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-gray-800 dark:text-gray-200">₹{Number(acc.balance).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-lg dark:border dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Categories</h3>
                <button onClick={() => setShowAddCategory(true)} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Expense Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <span key={cat.id} className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium">{cat.name}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Income Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter(c => c.type === 'income').map(cat => (
                      <span key={cat.id} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">{cat.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'assets' && (
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5 shadow-lg dark:border dark:border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Other Assets</h3>
                <button onClick={() => setShowAddAsset(true)} className="px-4 py-2 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {assets.length === 0 ? (
                  <div className="text-center py-12">
                    <Gem className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                    <p className="text-gray-400 dark:text-gray-600 mb-6">No assets yet</p>
                    <button onClick={() => setShowAddAsset(true)} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">Add Your First Asset</button>
                  </div>
                ) : (
                  assets.map(asset => (
                    <div key={asset.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                          <Gem className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{asset.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{asset.type}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg text-gray-800 dark:text-gray-200">₹{Number(asset.value).toLocaleString('en-IN')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium FAB */}
      {(tab === 'dashboard' || tab === 'transactions') && (
        <div className="fixed bottom-28 right-6 flex flex-col gap-3 z-40">
          <button onClick={() => { setTxType('income'); setShowAddTx(true); }} className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-110 flex items-center justify-center group">
            <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
          </button>
          <button onClick={() => { setTxType('expense'); setShowAddTx(true); }} className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-2xl hover:shadow-red-500/50 transition-all hover:scale-110 flex items-center justify-center group">
            <Minus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddTx && <AddTransactionModal type={txType} accounts={accounts} categories={categories.filter(c => c.type === txType)} onAdd={addTransaction} onClose={() => setShowAddTx(false)} />}
      {showAddAccount && <AddAccountModal onAdd={addAccount} onClose={() => setShowAddAccount(false)} />}
      {showAddCategory && <AddCategoryModal onAdd={addCategory} onClose={() => setShowAddCategory(false)} />}
      {showAddAsset && <AddAssetModal onAdd={addAsset} onClose={() => setShowAddAsset(false)} />}

      {/* Premium Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass-card border-t border-gray-200/50 dark:border-gray-800/50 safe-area-pb z-50">
        <div className="max-w-2xl mx-auto flex justify-around py-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
            { id: 'chart', label: 'Chart', icon: BarChart3 },
            { id: 'transactions', label: 'History', icon: Receipt },
            { id: 'accounts', label: 'Accounts', icon: CreditCard },
            { id: 'assets', label: 'Assets', icon: Briefcase },
          ].map(item => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button key={item.id} onClick={() => setTab(item.id as any)} className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${isActive ? 'bg-primary-100 dark:bg-primary-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'}`}>
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SignupScreen({ onSuccess, onSwitchToLogin, darkMode, toggleDarkMode }: any) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !username || !password || !pincode) {
      setError('All fields are required');
      return;
    }

    if (pincode.length !== 4 || !/^\d+$/.test(pincode)) {
      setError('Pincode must be exactly 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, pincode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 dark:from-primary-900 dark:via-blue-900 dark:to-purple-900 text-white flex items-center justify-center p-6">
      <button onClick={toggleDarkMode} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all">
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-md w-full">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
            <Wallet className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Money Manager</h1>
            <p className="text-blue-100">Create your account</p>
          </div>
          <div className="glass rounded-3xl p-8 space-y-4">
            {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm">{error}</div>}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            />

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Username"
              className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            />

            <input
              type="password"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4-Digit Pincode"
              maxLength={4}
              className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium text-center text-2xl tracking-widest"
            />

            <button
              onClick={handleSignup}
              disabled={loading || !name || !username || !password || pincode.length !== 4}
              className="w-full py-4 bg-white text-primary-600 rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <button onClick={onSwitchToLogin} className="w-full py-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onSuccess, onSwitchToSignup, darkMode, toggleDarkMode }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 dark:from-primary-900 dark:via-blue-900 dark:to-purple-900 text-white flex items-center justify-center p-6">
      <button onClick={toggleDarkMode} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all">
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-md w-full">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
            <Wallet className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-blue-100">Login to your account</p>
          </div>
          <div className="glass rounded-3xl p-8 space-y-4">
            {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm">{error}</div>}

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="Username"
              className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-5 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            />

            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className="w-full py-4 bg-white text-primary-600 rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button onClick={onSwitchToSignup} className="w-full py-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all">
              Don't have an account? Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PincodeScreen({ onSuccess, onSwitchToSignup, onSwitchToLogin, darkMode, toggleDarkMode }: any) {
  const [pincode, setPincode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedUsername, setSavedUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedUsername(localStorage.getItem('username'));
    }
  }, []);

  const handlePincodeLogin = async () => {
    if (pincode.length !== 4) {
      setError('Pincode must be 4 digits');
      return;
    }

    if (!savedUsername) {
      setError('No saved account found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/pincode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: savedUsername, pincode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'Invalid pincode');
        setPincode('');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 dark:from-primary-900 dark:via-blue-900 dark:to-purple-900 text-white flex items-center justify-center p-6">
      <button onClick={toggleDarkMode} className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center hover:bg-white/30 transition-all">
        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-md w-full">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
            <Wallet className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Money Manager</h1>
            {savedUsername ? (
              <p className="text-blue-100">Welcome back, @{savedUsername}</p>
            ) : (
              <p className="text-blue-100">Enter your pincode</p>
            )}
          </div>
          <div className="glass rounded-3xl p-8 space-y-4">
            {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm">{error}</div>}

            <input
              type="password"
              value={pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPincode(value);
                if (value.length === 4) {
                  // Auto-submit when 4 digits entered
                  setTimeout(() => handlePincodeLogin(), 100);
                }
              }}
              placeholder="Enter 4-digit pincode"
              maxLength={4}
              autoFocus
              className="w-full px-5 py-6 rounded-2xl bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 font-bold text-center text-3xl tracking-widest"
            />

            <button
              onClick={handlePincodeLogin}
              disabled={loading || pincode.length !== 4}
              className="w-full py-4 bg-white text-primary-600 rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Verifying...' : 'Unlock'}
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={onSwitchToLogin} className="py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-medium text-sm shadow-xl hover:shadow-2xl transition-all">
                Full Login
              </button>
              <button onClick={onSwitchToSignup} className="py-3 bg-white/20 backdrop-blur-xl text-white rounded-xl font-medium text-sm shadow-xl hover:shadow-2xl transition-all">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTransactionModal({ type, accounts, categories, onAdd, onClose }: any) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-fadeIn">
      <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-t-3xl p-6 pb-8 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-y-auto dark:border-t dark:border-gray-800 animate-slideUp">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 capitalize">{type === 'income' ? 'Add Income' : 'Add Expense'}</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-lg font-semibold focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-colors" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-colors">
            <option value="">Select category (optional)</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Account</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-colors">
            <option value="">Select account</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Description (Optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a note..." className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 text-gray-800 dark:text-gray-200 transition-colors" />
        </div>

        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
          <button onClick={() => { if (amount && accountId) { onAdd({ amount: parseFloat(amount), type, category_id: categoryId || null, account_id: accountId, description: description || null, date: new Date().toISOString() }); } }} disabled={!amount || !accountId} className={`flex-1 py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${type === 'income' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
            Add {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAccountModal({ onAdd, onClose }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [balance, setBalance] = useState('');

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-t-3xl p-6 pb-8 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-y-auto dark:border-t dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Add Account</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Account Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Main Bank, Cash" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 text-gray-800 dark:text-gray-200" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Type</label>
          <div className="grid grid-cols-2 gap-3">
            {['bank', 'cash', 'card', 'wallet'].map(t => (
              <button key={t} onClick={() => setType(t)} className={`py-3 rounded-xl font-semibold capitalize transition-all ${type === t ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Current Balance</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
            <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-lg font-semibold focus:outline-none focus:border-primary-500 text-gray-800 dark:text-gray-200" />
          </div>
        </div>

        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold">Cancel</button>
          <button onClick={() => { if (name) { onAdd(name, type, parseFloat(balance) || 0); onClose(); } }} disabled={!name} className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50">Add Account</button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryModal({ onAdd, onClose }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-t-3xl p-6 pb-8 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-y-auto dark:border-t dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Add Category</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Category Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Groceries, Rent" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 text-gray-800 dark:text-gray-200" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Type</label>
          <div className="flex gap-3">
            <button onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${type === 'expense' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Expense</button>
            <button onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${type === 'income' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Income</button>
          </div>
        </div>

        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold">Cancel</button>
          <button onClick={() => { if (name) { onAdd(name, type); onClose(); } }} disabled={!name} className={`flex-1 py-3 rounded-xl font-semibold text-white shadow-lg disabled:opacity-50 ${type === 'income' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>Add Category</button>
        </div>
      </div>
    </div>
  );
}

function AddAssetModal({ onAdd, onClose }: any) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('');

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
      <div onClick={(e) => e.stopPropagation()} className="glass-card rounded-t-3xl p-6 pb-8 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-y-auto dark:border-t dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Add Asset</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Asset Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., House, Gold, Stocks, Car" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 text-gray-800 dark:text-gray-200" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Type / Category (optional)</label>
          <input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Property, Investment, Vehicle" className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:border-primary-500 text-gray-800 dark:text-gray-200" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Current Value</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-lg font-semibold focus:outline-none focus:border-primary-500 text-gray-800 dark:text-gray-200" />
          </div>
        </div>

        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold">Cancel</button>
          <button onClick={() => { if (name && value) { onAdd(name, parseFloat(value), type || 'other'); onClose(); } }} disabled={!name || !value} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50">Add Asset</button>
        </div>
      </div>
    </div>
  );
}
