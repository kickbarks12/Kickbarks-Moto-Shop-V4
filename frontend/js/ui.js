function showLoader() {
  document.getElementById("loader")?.classList.remove("d-none");
}

function hideLoader() {
  document.getElementById("loader")?.classList.add("d-none");
}
// function showToast(message) {
//   const body = document.getElementById("toastBody");
//   const toastEl = document.getElementById("toast");

//   if (!body || !toastEl) {
//     console.warn("Toast HTML missing:", message);
//     return;
//   }

//   body.innerText = message;
//   new bootstrap.Toast(toastEl).show();
// }

function showToast(msg) {
  const toast = document.getElementById("toast");

  if (!toast) {
    console.warn("Toast HTML missing:", msg);
    return; // IMPORTANT: do not block add-to-cart
  }

  toast.innerText = msg;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}
function setButtonLoading(btn, loading = true) {
  if (!btn) return;

  if (loading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Processing...
    `;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText;
  }
}
