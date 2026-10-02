import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ArrowUpCircle, ArrowDownCircle, WalletCards,
  Target, LogOut, Plus, Trash2, Search, RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  Legend, LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "./api";

const expenseCategories = ["Food", "Transport", "Shopping", "Bills", "Education", "Health", "Entertainment", "Other"];
const incomeCategories = ["Salary", "Freelance", "Business", "Gift", "Other"];

function money(n) {
  return `৳${Number(n || 0).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("dashboard");

  if (!user) return <Auth onLogin={(u) => setUser(u)} />;

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} user={user} setUser={setUser} />
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">PERSONAL FINANCE</p>
            <h1>Where Is My Money?</h1>
          </div>
          <div className="user-pill">{user.name}</div>
        </header>

        {page === "dashboard" && <Dashboard />}
        {page === "transactions" && <Transactions />}
        {page === "budgets" && <Budgets />}
        {page === "goals" && <Goals />}
      </main>
    </div>
  );
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const url = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(url, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">৳</div>
        <p className="eyebrow">SMART MONEY TRACKER</p>
        <h1>Where Is My Money?</h1>
        <p className="muted">Track spending. Understand habits. Reach your goals.</p>

        <div className="tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
        </div>

        <form onSubmit={submit}>
          {mode === "register" && (
            <input placeholder="Full name" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} />
          )}
          <input type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder="Password (6+ characters)" value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} />
          {error && <div className="error">{error}</div>}
          <button className="primary wide">{mode === "login" ? "Login" : "Create account"}</button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, user, setUser }) {
  const nav = [
    ["dashboard", <LayoutDashboard size={18} />, "Dashboard"],
    ["transactions", <WalletCards size={18} />, "Transactions"],
    ["budgets", <Target size={18} />, "Budgets"],
    ["goals", <Target size={18} />, "Savings Goals"]
  ];

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <aside className="sidebar">
      <div className="side-logo"><span>৳</span><b>WIMM</b></div>
      <nav>
        {nav.map(([key, icon, label]) => (
          <button key={key} className={page === key ? "nav active" : "nav"} onClick={() => setPage(key)}>
            {icon}{label}
          </button>
        ))}
      </nav>
      <div className="side-bottom">
        <div className="mini-user">{user.email}</div>
        <button className="nav" onClick={logout}><LogOut size={18}/> Logout</button>
      </div>
    </aside>
  );
}

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/analytics/summary");
      setData(r.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const savingsRate = data.totalIncome ? Math.max(0, (data.balance / data.totalIncome) * 100) : 0;

  return (
    <>
      <div className="page-title-row">
        <div><h2>Dashboard</h2><p className="muted">Your money at a glance.</p></div>
        <button className="icon-button" onClick={load}><RefreshCw size={18}/></button>
      </div>

      <section className="stats">
        <Stat icon={<ArrowUpCircle/>} label="Total Income" value={money(data.totalIncome)} />
        <Stat icon={<ArrowDownCircle/>} label="Total Expense" value={money(data.totalExpense)} />
        <Stat icon={<WalletCards/>} label="Current Balance" value={money(data.balance)} />
        <Stat icon={<Target/>} label="Savings Rate" value={`${savingsRate.toFixed(0)}%`} />
      </section>

      <section className="insight">
        <div className="insight-icon">💡</div>
        <div>
          <b>Where did my money go?</b>
          <p>
            Your biggest spending category is <strong>{data.topCategory}</strong>
            {data.topAmount ? ` — ${money(data.topAmount)}` : ""}.
            {data.totalExpense ? ` You made ${data.transactionCount} total transactions.` : " Add your first expense to see personalized insights."}
          </p>
        </div>
      </section>

      <div className="grid-2">
        <Card title="6-Month Money Trend">
          <div className="chart"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Line type="monotone" dataKey="income" strokeWidth={3} name="Income" />
              <Line type="monotone" dataKey="expense" strokeWidth={3} name="Expense" />
            </LineChart>
          </ResponsiveContainer></div>
        </Card>

        <Card title="Spending by Category">
          <div className="chart"><ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={105} label>
                {data.categoryData.map((_, i) => <Cell key={i} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer></div>
        </Card>
      </div>
    </>
  );
}

function Stat({ icon, label, value }) {
  return <div className="stat card"><div className="stat-icon">{icon}</div><span>{label}</span><strong>{value}</strong></div>;
}

function Card({ title, children }) {
  return <div className="card panel"><h3>{title}</h3>{children}</div>;
}

function Transactions() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    type: "expense", title: "", amount: "", category: "Food", note: "",
    date: new Date().toISOString().slice(0, 10)
  });

  async function load() {
    const r = await api.get("/transactions");
    setItems(r.data);
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/transactions", form);
    setForm({...form, title: "", amount: "", note: ""});
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    load();
  }

  const filtered = useMemo(() => items.filter(x =>
    `${x.title} ${x.category} ${x.note}`.toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  const cats = form.type === "expense" ? expenseCategories : incomeCategories;

  return (
    <>
      <div className="page-title-row"><div><h2>Transactions</h2><p className="muted">Record every taka coming in or going out.</p></div></div>

      <Card title="Add Transaction">
        <form className="transaction-form" onSubmit={add}>
          <select value={form.type} onChange={e => setForm({...form, type:e.target.value, category:e.target.value === "expense" ? "Food" : "Salary"})}>
            <option value="expense">Expense</option><option value="income">Income</option>
          </select>
          <input placeholder="Title" required value={form.title} onChange={e => setForm({...form,title:e.target.value})}/>
          <input type="number" min="1" placeholder="Amount" required value={form.amount} onChange={e => setForm({...form,amount:e.target.value})}/>
          <select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})}/>
          <input placeholder="Note (optional)" value={form.note} onChange={e => setForm({...form,note:e.target.value})}/>
          <button className="primary"><Plus size={18}/> Add</button>
        </form>
      </Card>

      <div className="search"><Search size={18}/><input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)}/></div>

      <Card title={`Transaction History (${filtered.length})`}>
        <div className="table-wrap">
          <table><thead><tr><th>Date</th><th>Title</th><th>Category</th><th>Type</th><th>Amount</th><th></th></tr></thead>
          <tbody>
          {filtered.map(t => (
            <tr key={t._id}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td><b>{t.title}</b><small>{t.note}</small></td>
              <td>{t.category}</td>
              <td><span className={`badge ${t.type}`}>{t.type}</span></td>
              <td className={t.type === "income" ? "income-text" : "expense-text"}>{t.type === "income" ? "+" : "-"}{money(t.amount)}</td>
              <td><button className="danger-icon" onClick={() => remove(t._id)}><Trash2 size={16}/></button></td>
            </tr>
          ))}
          {!filtered.length && <tr><td colSpan="6" className="empty">No transactions yet.</td></tr>}
          </tbody></table>
        </div>
      </Card>
    </>
  );
}

function Budgets() {
  const month = new Date().toISOString().slice(0, 7);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");

  async function load() {
    const r = await api.get(`/budgets?month=${month}`);
    setItems(r.data);
  }
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    await api.post("/budgets", { category, amount, month });
    setAmount("");
    load();
  }

  return (
    <>
      <div className="page-title-row"><div><h2>Monthly Budgets</h2><p className="muted">Set a spending limit for each category.</p></div></div>
      <Card title="Set / Update Budget">
        <form className="inline-form" onSubmit={save}>
          <select value={category} onChange={e => setCategory(e.target.value)}>{expenseCategories.map(c=><option key={c}>{c}</option>)}</select>
          <input type="number" min="1" placeholder="Budget amount" value={amount} onChange={e=>setAmount(e.target.value)} required/>
          <button className="primary">Save Budget</button>
        </form>
      </Card>
      <div className="budget-grid">
        {items.map(b => {
          const pct = Math.min(100, b.amount ? b.spent / b.amount * 100 : 0);
          return <div className="card budget-card" key={b._id}>
            <div className="row"><b>{b.category}</b><span>{money(b.spent)} / {money(b.amount)}</span></div>
            <div className="progress"><div style={{width:`${pct}%`}}/></div>
            <small>{pct.toFixed(0)}% used</small>
          </div>
        ))}
        {!items.length && <div className="empty card">No budgets for this month yet.</div>}
      </div>
    </>
  );
}

function Goals() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({name:"", targetAmount:"", savedAmount:"", deadline:""});

  async function load() { setItems((await api.get("/goals")).data); }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    await api.post("/goals", form);
    setForm({name:"",targetAmount:"",savedAmount:"",deadline:""});
    load();
  }

  async function remove(id) {
    await api.delete(`/goals/${id}`);
    load();
  }

  return (
    <>
      <div className="page-title-row"><div><h2>Savings Goals</h2><p className="muted">Turn your plans into measurable targets.</p></div></div>
      <Card title="Create Savings Goal">
        <form className="transaction-form" onSubmit={add}>
          <input placeholder="Goal name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input type="number" placeholder="Target amount" required value={form.targetAmount} onChange={e=>setForm({...form,targetAmount:e.target.value})}/>
          <input type="number" placeholder="Already saved" value={form.savedAmount} onChange={e=>setForm({...form,savedAmount:e.target.value})}/>
          <input type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/>
          <button className="primary"><Plus size={18}/> Create</button>
        </form>
      </Card>

      <div className="goal-grid">
        {items.map(g => {
          const pct = Math.min(100, g.targetAmount ? g.savedAmount/g.targetAmount*100 : 0);
          return <div className="card goal-card" key={g._id}>
            <div className="row"><h3>{g.name}</h3><button className="danger-icon" onClick={()=>remove(g._id)}><Trash2 size={16}/></button></div>
            <div className="goal-amount">{money(g.savedAmount)} <span>of {money(g.targetAmount)}</span></div>
            <div className="progress"><div style={{width:`${pct}%`}}/></div>
            <div className="row"><small>{pct.toFixed(0)}% complete</small>{g.deadline && <small>Deadline: {new Date(g.deadline).toLocaleDateString()}</small>}</div>
          </div>
        ))}
        {!items.length && <div className="empty card">Create your first savings goal.</div>}
      </div>
    </>
  );
}

function Loading() {
  return <div className="loading">Loading your money data...</div>;
}

export default App;
