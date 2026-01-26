document.addEventListener("DOMContentLoaded", () => {
  // ===============================
  // 🛒 CART COUNT
  // ===============================
  const navCart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = navCart.reduce((sum, item) => sum + (item.qty || 1), 0);

  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = count;

  // ===============================
  // 👤 AUTH STATE (LOGIN / PROFILE)
  // ===============================
  const loginNav = document.getElementById("nav-login");
  const profileNav = document.getElementById("nav-profile");

  if (!loginNav || !profileNav) return;

  fetch("/api/users/me", {
    credentials: "include"
  })
    .then(res => {
      if (res.ok) {
        // ✅ Logged in
        loginNav.classList.add("d-none");
        profileNav.classList.remove("d-none");
      } else {
        // ❌ Guest
        loginNav.classList.remove("d-none");
        profileNav.classList.add("d-none");
      }
    })
    .catch(() => {
      // Fail-safe: treat as guest
      loginNav.classList.remove("d-none");
      profileNav.classList.add("d-none");
    });
});
// ===============================
// 📍 ACTIVE NAV LINK
// ===============================
const currentPath = window.location.pathname;

document.querySelectorAll(".nav-link").forEach(link => {
  const href = link.getAttribute("href");

  if (href === currentPath || (href === "/" && currentPath === "/index.html")) {
    link.classList.add("active");
  }
});
