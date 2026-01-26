// Check admin access
fetch("/api/admin/dashboard", {
  credentials: "include"
})
  .then(res => {
    if (!res.ok) {
      // Not admin or not logged in
      window.location.href = "/login.html";
      return;
    }
    return res.json();
  })
  .then(data => {
    if (!data) return;

    document.getElementById("adminInfo").innerHTML = `
      <p><strong>Logged in as:</strong> ${data.email}</p>
      <p><strong>Role:</strong> ${data.role}</p>
      <p>Welcome to the admin panel.</p>
    `;
  })
  .catch(() => {
    window.location.href = "/login.html";
  });
