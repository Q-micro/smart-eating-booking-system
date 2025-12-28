const staff = [
  {
    id: 1,
    name: "Ahmed",
    role: "Owner",
    email: "ahmed@admin.com", 
    phone: "+973 3900 1122",
    hireDate: "2021-01-10",
    shift: "Flexible",
    preferredLanguage: "Arabic",
    status: "Active",
    permissions: ["Manage staff", "Manage reservations", "View reports", "Manage billing"],
  },
  {
    id: 2,
    name: "Emily Carter",
    role: "Manager",
    email: "emily.carter@example.com",
    phone: "+973 6633 2211",
    hireDate: "2022-05-03",
    shift: "Evening",
    preferredLanguage: "English",
    status: "Active",
    permissions: ["Manage reservations", "Edit menu", "View reports"],
  },
  {
    id: 4,
    name: "Chloe Smith",
    role: "Host",
    email: "chloe.smith@example.com",
    phone: "+973 3777 9900",
    hireDate: "2024-01-05",
    shift: "Evening",
    preferredLanguage: "English",
    status: "Inactive",
    permissions: ["Manage reservations"],
  },
];

export default function AdminStaff() {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h1>Manage Staff</h1>
      <button style={{ margin: "1rem 0" }}>+ Add Staff Member</button>
      
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Name</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Role</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Email</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Status</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id}>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{member.name}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{member.role}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{member.email}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>{member.status}</td>
              <td style={{ borderBottom: "1px solid #eee", padding: "0.5rem" }}>
                <button style={{ marginRight: "0.5rem" }}>Edit</button>
                <button>Disable</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
