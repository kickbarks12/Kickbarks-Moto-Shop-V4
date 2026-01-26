let appliedVoucher = null;
let voucherDiscount = 0;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartList = document.getElementById("cartList");
const totalEl = document.getElementById("total");

function renderCart() {
  let total = 0;

if (cart.length === 0) {
  cartList.innerHTML = `<li class="list-group-item text-center">
    Your cart is empty
  </li>`;

  appliedVoucher = null;
  voucherDiscount = 0;
  sessionStorage.removeItem("voucher");

  updateSummary();
  return;
}


  cartList.innerHTML = cart.map((item, index) => {
    total += item.price * item.qty;

    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${item.name}</strong><br>
          ₱${item.price} × ${item.qty}
        </div>
        <div>
          <button class="btn btn-sm btn-secondary" onclick="changeQty(${index}, -1)">−</button>
          <button class="btn btn-sm btn-secondary" onclick="changeQty(${index}, 1)">+</button>
          <button class="btn btn-sm btn-danger" onclick="removeItem(${index})">✕</button>
        </div>
      </li>
    `;
  }).join("");

  updateSummary();

}
// Restore voucher from sessionStorage (if any)
const savedVoucher = JSON.parse(sessionStorage.getItem("voucher"));

if (savedVoucher) {
  appliedVoucher = savedVoucher.code;
  voucherDiscount = savedVoucher.discount;
  document.getElementById("voucherMessage").innerText =
    `Voucher applied: -₱${voucherDiscount}`;
}


function changeQty(index, change) {
  cart[index].qty += change;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

renderCart();

function calculateSubtotal() {
  return cart.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);
}
function updateSummary() {
  const subtotal = calculateSubtotal();
  const shipping = 0; // keep 0 for now, or adjust later

  let total = subtotal + shipping - voucherDiscount;
  if (total < 0) total = 0;

  document.getElementById("subtotal").innerText = subtotal;
  document.getElementById("shipping").innerText = shipping;
  document.getElementById("discount").innerText = voucherDiscount;
  document.getElementById("total").innerText = total;
}

updateSummary();

document
  .getElementById("applyVoucherBtn")
  ?.addEventListener("click", applyVoucher);



function applyVoucher() {
  const code = document.getElementById("voucherInput").value.trim();
  const messageEl = document.getElementById("voucherMessage");

  if (!code) {
    messageEl.innerText = "Please enter a voucher code";
    return;
  }

  fetch("/api/vouchers/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      code,
      subtotal: calculateSubtotal()
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.valid) {
        messageEl.innerText = data.message;
        appliedVoucher = null;
        voucherDiscount = 0;
        sessionStorage.removeItem("voucher");
        updateSummary();
        return;
      }

      appliedVoucher = data.code;
      voucherDiscount = data.discount;

      sessionStorage.setItem(
        "voucher",
        JSON.stringify({
          code: data.code,
          discount: data.discount
        })
      );

      messageEl.innerText = `Voucher applied: -₱${data.discount}`;
      updateSummary();
    })
    .catch(() => {
      messageEl.innerText = "Failed to apply voucher";
    });
}
