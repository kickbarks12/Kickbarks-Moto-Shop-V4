
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const shippingFee = 150;
// const voucherDiscount = Number(localStorage.getItem("appliedVoucher")) || 0;

  const savedVoucher =
  JSON.parse(sessionStorage.getItem("voucher")) || null;

let voucherDiscount = savedVoucher ? savedVoucher.discount : 0;
let voucherCode = savedVoucher ? savedVoucher.code : null;

const checkoutItems = document.getElementById("checkoutItems");
const subtotalEl = document.getElementById("subtotal");

const finalTotalEl = document.getElementById("finalTotal");

let subtotal = 0;

checkoutItems.innerHTML = cart.map(item => {
  subtotal += item.price * item.qty;
  return `<li class="list-group-item">
    ${item.name} × ${item.qty} — ₱${item.price * item.qty}
  </li>`;
}).join("");

document.getElementById("shipping").innerText = shippingFee;


let finalTotal = subtotal + shippingFee - voucherDiscount;
if (finalTotal < 0) finalTotal = 0;
document.getElementById("discount").innerText = voucherDiscount;



subtotalEl.innerText = subtotal;

finalTotalEl.innerText = finalTotal;


function placeOrder() {
  const btn = document.getElementById("placeOrderBtn");

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    showToast("Cart is empty");
    return;
  }

  // 🔒 Lock button
  btn.disabled = true;
  btn.innerText = "Processing...";

  fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
  items: cart,
  voucher: voucherCode
})

  })
    .then(res => {
      if (!res.ok) throw new Error("Order failed");
      return res.json();
    })
    .then(data => {
      localStorage.removeItem("cart");
      sessionStorage.removeItem("voucher");


      const earned = Number(data.cashbackEarned);

      if (earned > 0) {
        showToast(`Order placed! You earned ₱${earned} store credit`);
      } else {
        showToast("Order placed successfully");
      }

      setTimeout(() => {
       window.location.href =
  `/order-success.html?id=${data.orderId}`;

      }, 1200);
    })
    .catch(err => {
      console.error(err);
      showToast("Failed to place order");

      // 🔓 Unlock only on failure
      btn.disabled = false;
      btn.innerText = "Place Order";
    });
}




