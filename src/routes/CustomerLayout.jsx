import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function CustomerLayout() {
  const { user, loginAsAdmin, loginAsCustomer, logout } = useAuth();

  return (
    <div>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <nav style={{ display: "flex", gap: "12px" }}>
          <Link to="/">Seb's</Link>
          <Link to="/reserve">Reserve</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* Demo controls – for now only */}
        <div style={{ display: "flex", gap: "8px", fontSize: "0.85rem" }}>
          <span>
            {user ? `Logged in as ${user.role}` : "Not logged in"}
          </span>
          <button onClick={loginAsCustomer}>Customer</button>
          <button onClick={loginAsAdmin}>Admin</button>
          <button onClick={logout}>Logout</button>
          <Link to="/admin">Go to Admin</Link>
        </div>
      </header>

      <main style={{ padding: "16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
