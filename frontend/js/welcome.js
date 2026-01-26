document.addEventListener("DOMContentLoaded", () => {
  // Show popup only once per browser session
  if (sessionStorage.getItem("welcomeShown")) return;

  fetch("/api/users/me", { credentials: "include" })
    .then(res => (res.ok ? res.json() : null))
    .then(user => {
      if (!user) return;

      const titleEl = document.getElementById("welcomeTitle");
      const messageEl = document.getElementById("welcomeMessage");

      if (titleEl) {
        titleEl.innerText = `Welcome back, ${user.name}!`;
      }

      if (messageEl) {
        messageEl.innerText =
          "Glad to see you again at Kickbarks Moto Shop 🏍️";
      }
    })
    .finally(() => {
      const modalEl = document.getElementById("welcomeModal");

      if (modalEl && window.bootstrap && bootstrap.Modal) {
        const modal = new bootstrap.Modal(modalEl, {
          backdrop: true,
          keyboard: true
        });
        modal.show();
      }

      sessionStorage.setItem("welcomeShown", "true");
    });
});
