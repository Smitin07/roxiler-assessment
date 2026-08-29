import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <Login onLogin={login} />;
  }

  return (
    <div className="app">
      <header>
        <div>
          <h1>Roxiler Store Rating</h1>
          <p>
            Welcome, <b>{user.name}</b> ({user.role})
          </p>
        </div>

        <button className="logout" onClick={logout}>
          Logout
        </button>
      </header>

      {user.role === "ADMIN" && <AdminDashboard token={token} />}
      {user.role === "STORE_OWNER" && <OwnerDashboard token={token} />}
      {user.role === "USER" && <UserDashboard token={token} />}
    </div>
  );
}


/* ================= LOGIN ================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      onLogin(data);
    } catch {
      setMessage("Cannot connect to backend");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Roxiler</h1>
        <h2>Store Rating System</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {message && <p className="error">{message}</p>}

        <div className="demo">
          <b>Test Accounts</b>
          <p>Admin: use your existing admin account</p>
          <p>Owner: owner@gmail.com</p>
          <p>Password: NewPassword@123</p>
        </div>
      </div>
    </div>
  );
}


/* ================= ADMIN ================= */

function AdminDashboard({ token }) {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER"
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: ""
  });

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const loadData = async () => {
    const dashboardResponse = await fetch(`${API}/admin/dashboard`, {
      headers
    });

    const usersResponse = await fetch(`${API}/admin/users`, {
      headers
    });

    const storesResponse = await fetch(`${API}/admin/stores`, {
      headers
    });

    setDashboard(await dashboardResponse.json());
    setUsers(await usersResponse.json());
    setStores(await storesResponse.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/admin/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(userForm)
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER"
      });
      loadData();
    }
  };

  const createStore = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/stores`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...storeForm,
        owner_id: storeForm.owner_id
          ? Number(storeForm.owner_id)
          : null
      })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      setStoreForm({
        name: "",
        email: "",
        address: "",
        owner_id: ""
      });
      loadData();
    }
  };

  return (
    <main>
      <h2>Admin Dashboard</h2>

      {dashboard && (
        <div className="cards">
          <div className="card">
            <h3>Total Users</h3>
            <strong>{dashboard.totalUsers}</strong>
          </div>

          <div className="card">
            <h3>Total Stores</h3>
            <strong>{dashboard.totalStores}</strong>
          </div>

          <div className="card">
            <h3>Total Ratings</h3>
            <strong>{dashboard.totalRatings}</strong>
          </div>
        </div>
      )}

      <section className="panel">
        <h2>Create User</h2>

        <form className="form-grid" onSubmit={createUser}>
          <input
            placeholder="Name"
            value={userForm.name}
            onChange={(e) =>
              setUserForm({ ...userForm, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
            required
          />

          <input
            placeholder="Address"
            value={userForm.address}
            onChange={(e) =>
              setUserForm({ ...userForm, address: e.target.value })
            }
            required
          />

          <select
            value={userForm.role}
            onChange={(e) =>
              setUserForm({ ...userForm, role: e.target.value })
            }
          >
            <option value="USER">USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button type="submit">Create User</button>
        </form>
      </section>

      <section className="panel">
        <h2>Create Store</h2>

        <form className="form-grid" onSubmit={createStore}>
          <input
            placeholder="Store Name"
            value={storeForm.name}
            onChange={(e) =>
              setStoreForm({ ...storeForm, name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Store Email"
            value={storeForm.email}
            onChange={(e) =>
              setStoreForm({ ...storeForm, email: e.target.value })
            }
            required
          />

          <input
            placeholder="Address"
            value={storeForm.address}
            onChange={(e) =>
              setStoreForm({ ...storeForm, address: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Owner ID"
            value={storeForm.owner_id}
            onChange={(e) =>
              setStoreForm({ ...storeForm, owner_id: e.target.value })
            }
          />

          <button type="submit">Create Store</button>
        </form>
      </section>

      <section className="panel">
        <h2>Users</h2>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.address}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Stores</h2>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Rating</th>
            </tr>
          </thead>

          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.address}</td>
                <td>⭐ {s.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}


/* ================= USER ================= */

function UserDashboard({ token }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState({});

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const loadStores = async () => {
    const response = await fetch(
      `${API}/stores${search ? `?name=${encodeURIComponent(search)}` : ""}`,
      { headers }
    );

    const data = await response.json();
    setStores(data);
  };

  useEffect(() => {
    loadStores();
  }, []);

  const submitRating = async (store) => {
    const rating = Number(ratings[store.id]);

    if (rating < 1 || rating > 5) {
      alert("Rating must be between 1 and 5");
      return;
    }

    const method = store.user_rating ? "PUT" : "POST";

    const url = store.user_rating
      ? `${API}/ratings/${store.rating_id || 1}`
      : `${API}/ratings`;

    const body = store.user_rating
      ? { rating }
      : {
          store_id: store.id,
          rating
        };

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    alert(data.message);

    loadStores();
  };

  return (
    <main>
      <h2>Store List</h2>

      <div className="search">
        <input
          placeholder="Search store by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={loadStores}>Search</button>

        <button
          onClick={() => {
            setSearch("");
            setTimeout(loadStores, 0);
          }}
        >
          Clear
        </button>
      </div>

      <div className="store-grid">
        {stores.map((store) => (
          <div className="store-card" key={store.id}>
            <h3>{store.name}</h3>

            <p>{store.address}</p>
            <p>{store.email}</p>

            <h3>⭐ {store.rating}</h3>

            <p>
              Your rating:{" "}
              <b>{store.user_rating || "Not rated yet"}</b>
            </p>

            <select
              value={ratings[store.id] || ""}
              onChange={(e) =>
                setRatings({
                  ...ratings,
                  [store.id]: e.target.value
                })
              }
            >
              <option value="">Select rating</option>
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="5">5 ⭐</option>
            </select>

            <button onClick={() => submitRating(store)}>
              {store.user_rating ? "Update Rating" : "Submit Rating"}
            </button>
          </div>
        ))}
      </div>

      <PasswordChange token={token} />
    </main>
  );
}


/* ================= OWNER ================= */

function OwnerDashboard({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/owner/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => response.json())
      .then(setData);
  }, []);

  if (!data) {
    return <main><h2>Loading dashboard...</h2></main>;
  }

  if (data.message) {
    return <main><h2>{data.message}</h2></main>;
  }

  return (
    <main>
      <h2>Store Owner Dashboard</h2>

      <div className="cards">
        <div className="card">
          <h3>My Store</h3>
          <strong>{data.store.name}</strong>
        </div>

        <div className="card">
          <h3>Average Rating</h3>
          <strong>⭐ {data.averageRating}</strong>
        </div>

        <div className="card">
          <h3>Total Ratings</h3>
          <strong>{data.usersWhoRated.length}</strong>
        </div>
      </div>

      <section className="panel">
        <h2>Users Who Rated My Store</h2>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
            </tr>
          </thead>

          <tbody>
            {data.usersWhoRated.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>⭐ {u.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PasswordChange token={token} />
    </main>
  );
}


/* ================= PASSWORD ================= */

function PasswordChange({ token }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      setOldPassword("");
      setNewPassword("");
    }
  };

  return (
    <section className="panel password">
      <h2>Change Password</h2>

      <form className="form-grid" onSubmit={changePassword}>
        <input
          type="password"
          placeholder="Old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <button type="submit">Change Password</button>
      </form>
    </section>
  );
}

export default App;