'use client';

import { useEffect, useState } from 'react';

type Account = { id: number; name: string; type: string; balance: number };
type Category = { id: number; name: string; type: string };
type Transaction = { id: number; amount: number; type: string; category_name?: string; account_name?: string; description?: string; date: string };
type Asset = { id: number; name: string; value: number; type: string };

export default function Home() {
  const [tab, setTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'assets'>('dashboard');
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense' | 'transfer'>('expense');

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    const [userRes, accountsRes, categoriesRes, txRes, statsRes, assetsRes] = await Promise.all([
      fetch('/api/user'),
      fetch('/api/accounts'),
      fetch('/api/categories'),
      fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`),
      fetch(`/api/transactions/stats?month=${selectedMonth}&year=${selectedYear}`),
      fetch('/api/assets'),
    ]);

    const userData = await userRes.json();
    setUser(userData);
    setShowSetup(!userData);
    setAccounts(await accountsRes.json());
    setCategories(await categoriesRes.json());
    setTransactions(await txRes.json());
    setStats(await statsRes.json());
    setAssets(await assetsRes.json());
  };

  const saveUser = async (name: string) => {
    await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setShowSetup(false);
    loadData();
  };

  const addAccount = async (name: string, type: string, balance: number) => {
    await fetch('/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type, balance }) });
    loadData();
  };

  const addTransaction = async (data: any) => {
    await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setShowAddTx(false);
    loadData();
  };

  const addAsset = async (name: string, value: number, type: string) => {
    await fetch('/api/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, value, type }) });
    loadData();
  };

  const deleteTransaction = async (id: number) => {
    if (confirm('Delete this transaction?')) {
      await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      loadData();
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const netWorth = totalBalance + totalAssets;

  if (showSetup) {
    return <SetupScreen onSave={saveUser} onAddAccount={addAccount} onComplete={() => loadData()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Hello, {user?.name || 'User'}</h1>
          <div className="mt-4 bg-white/20 rounded-2xl p-4">
            <p className="text-sm opacity-90">Total Net Worth</p>
            <p className="text-3xl font-bold mt-1">₹{netWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-2">
        {tab === 'dashboard' && (
          <div className="space-y-4">
            {/* Month Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 2); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="p-2">←</button>
                <span className="font-semibold">{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="p-2">→</button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-sm text-green-700">Income</p>
                <p className="text-2xl font-bold text-green-600 mt-1">+₹{(stats.total_income || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                <p className="text-sm text-red-700">Expenses</p>
                <p className="text-2xl font-bold text-red-600 mt-1">-₹{(stats.total_expenses || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Accounts */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Accounts</h3>
              <div className="space-y-2">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{acc.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{acc.type}</p>
                    </div>
                    <p className="font-semibold">₹{acc.balance.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            {stats.categoryStats && stats.categoryStats.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold mb-3">Category Breakdown</h3>
                <div className="space-y-2">
                  {stats.categoryStats.slice(0, 5).map((cat: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">{cat.name || 'Uncategorized'}</span>
                      <span className={`text-sm font-medium ${cat.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{(cat.total || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'transactions' && (
          <div className="space-y-4">
            {/* Month Selector */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth - 2); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="p-2">←</button>
                <span className="font-semibold">{new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => { const d = new Date(selectedYear, selectedMonth); setSelectedMonth(d.getMonth() + 1); setSelectedYear(d.getFullYear()); }} className="p-2">→</button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="p-8 text-center text-gray-400">No transactions this month</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} onClick={() => deleteTransaction(tx.id)} className="p-4 border-b border-gray-100 active:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{tx.category_name || tx.type}</p>
                          {tx.account_name && <p className="text-xs text-gray-500">{tx.account_name}</p>}
                          {tx.description && <p className="text-xs text-gray-400 mt-1">{tx.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString('en-IN')}</p>
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
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <h3 className="font-semibold">Accounts</h3>
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{acc.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{acc.type}</p>
                  </div>
                  <p className="font-semibold text-lg">₹{acc.balance.toLocaleString('en-IN')}</p>
                </div>
              ))}
              <button onClick={() => {
                const name = prompt('Account name:');
                const type = prompt('Type (bank/cash/card):') || 'bank';
                const balance = parseFloat(prompt('Initial balance:') || '0');
                if (name) addAccount(name, type, balance);
              }} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                + Add Account
              </button>
            </div>
          </div>
        )}

        {tab === 'assets' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Other Assets</h3>
              <div className="space-y-3">
                {assets.map(asset => (
                  <div key={asset.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                    </div>
                    <p className="font-semibold text-lg">₹{asset.value.toLocaleString('en-IN')}</p>
                  </div>
                ))}
                <button onClick={() => {
                  const name = prompt('Asset name:');
                  const value = parseFloat(prompt('Value:') || '0');
                  const type = prompt('Type (property/gold/stocks/other):') || 'other';
                  if (name && value) addAsset(name, value, type);
                }} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                  + Add Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction FAB */}
      {(tab === 'dashboard' || tab === 'transactions') && (
        <div className="fixed bottom-24 right-4 flex flex-col gap-2">
          <button onClick={() => { setTxType('income'); setShowAddTx(true); }} className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg text-2xl font-bold flex items-center justify-center">+</button>
          <button onClick={() => { setTxType('expense'); setShowAddTx(true); }} className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg text-2xl font-bold flex items-center justify-center">-</button>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTx && (
        <AddTransactionModal
          type={txType}
          accounts={accounts}
          categories={categories.filter(c => c.type === txType)}
          onAdd={addTransaction}
          onClose={() => setShowAddTx(false)}
        />
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'transactions', label: 'Transactions', icon: '💸' },
            { id: 'accounts', label: 'Accounts', icon: '💳' },
            { id: 'assets', label: 'Assets', icon: '💎' },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id as any)} className={`flex flex-col items-center px-4 py-2 ${tab === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupScreen({ onSave, onAddAccount, onComplete }: any) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-blue-600 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {step === 1 && (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">Money Manager</h1>
            <p className="text-blue-100">Let's get started with your personal finance tracker</p>
            <div className="bg-white/20 rounded-2xl p-6 space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white" />
              <button onClick={() => { if (name) { onSave(name); setStep(2); } }} disabled={!name} className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold disabled:opacity-50">Continue</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Add Your First Account</h2>
            <div className="bg-white/20 rounded-2xl p-6 space-y-4">
              <button onClick={() => {
                const name = prompt('Account name (e.g., Main Bank):');
                const balance = parseFloat(prompt('Current balance:') || '0');
                if (name) { onAddAccount(name, 'bank', balance); onComplete(); }
              }} className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold">+ Add Bank Account</button>
              <button onClick={() => {
                const balance = parseFloat(prompt('Cash in hand:') || '0');
                onAddAccount('Cash', 'cash', balance);
                onComplete();
              }} className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold">+ Add Cash</button>
              <button onClick={onComplete} className="w-full py-3 bg-white/20 text-white rounded-lg font-semibold">Skip for Now</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddTransactionModal({ type, accounts, categories, onAdd, onClose }: any) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!amount || !accountId) return;
    onAdd({
      amount: parseFloat(amount),
      type,
      category_id: categoryId || null,
      account_id: accountId,
      description: description || null,
      date: new Date().toISOString(),
    });
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl p-6 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold capitalize">{type === 'income' ? 'Add Income' : 'Add Expense'}</h3>

        <div>
          <label className="text-sm text-gray-600 block mb-2">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-2xl font-bold focus:outline-none focus:border-blue-500" />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-2">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Select category</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-2">Account</label>
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500">
            <option value="">Select account</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-2">Description (Optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a note..." className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">Cancel</button>
          <button onClick={handleSubmit} disabled={!amount || !accountId} className={`flex-1 py-3 rounded-lg font-semibold text-white ${type === 'income' ? 'bg-green-500' : 'bg-red-500'} disabled:opacity-50`}>
            Add {type === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}
