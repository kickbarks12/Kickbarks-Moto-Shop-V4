document.addEventListener("DOMContentLoaded", initProfile);

function initProfile() {
  checkAuthAndLoadProfile();
  initRefundModal();
  
}

function checkAuthAndLoadProfile() {
  document.getElementById("profileLoading")?.classList.remove("d-none");

  fetch("/api/users/me", { credentials: "include" })
    .then(res => {
      if (!res.ok) {
        window.location.href = "/login.html";
        return null;
      }
      return res.json();
    })
    .then(user => {
      document.getElementById("profileLoading")?.classList.add("d-none");
      if (!user) return;
      renderProfile(user);
      loadWishlist();
      loadOrders();
    });
}



let refundModal = null;

function initRefundModal() {
  const modalEl = document.getElementById("refundModal");

  if (!modalEl) {
    console.warn("Refund modal element not found");
    return;
  }

  if (!window.bootstrap || !bootstrap.Modal) {
    console.error("Bootstrap Modal not available");
    return;
  }

  refundModal = new bootstrap.Modal(modalEl, {
    backdrop: true,
    keyboard: true
  });
}



function logout() {
  // Clear any leftover frontend auth
  

  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  })
    .then(() => {
      window.location.href = "/login.html";
    })
    .catch(err => {
      console.error("Logout failed", err);
      window.location.href = "/login.html";
    });
}


function loadWishlist() {
  fetch("/api/users/wishlist", { credentials: "include" })
    .then(res => res.json())
    .then(items => {
      const wishlistEl = document.getElementById("wishlist");
      if (!wishlistEl) return;

      if (!items || items.length === 0) {
        wishlistEl.innerHTML = `
          <li class="list-group-item text-center">
            No wishlist items
          </li>`;
        return;
      }

      wishlistEl.innerHTML = items.map(p => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span>${p.name}</span>
          <div>
            <button class="btn btn-sm btn-primary"
              onclick='addWishlistToCart(${JSON.stringify(p)})'>
              Add to Cart
            </button>
            <button class="btn btn-sm btn-danger ms-2"
              onclick="removeWishlist('${p._id}')">
              ✕
            </button>
          </div>
        </li>
      `).join("");
    });
}

function addWishlistToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const found = cart.find(i => i._id === product._id);

  if (found) found.qty += 1;
  else cart.push({ ...product, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");

}

function removeWishlist(productId) {
  fetch(`/api/users/wishlist/${productId}`, {
    method: "POST",
    credentials: "include"
  })
    // .then(() => location.reload());
}

document.getElementById("addressForm")?.addEventListener("submit", e => {
  e.preventDefault();

  fetch("/api/users/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      label: document.getElementById("addrLabel").value,
      street: document.getElementById("addrStreet").value,
      city: document.getElementById("addrCity").value,
      province: document.getElementById("addrProvince").value,
      zip: document.getElementById("addrZip").value
    })
  })
    .then(res => res.json())
    // .then(() => location.reload());
});
function deleteAddress(index) {
  if (!confirm("Delete this address?")) return;

  fetch(`/api/users/addresses/${index}`, {
    method: "DELETE",
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) throw new Error("Delete failed");
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to delete address");
    });
}

let currentPage = 1;
let currentSearch = "";

// STEP 2.1: Search handler
function searchOrders() {
  currentSearch = document.getElementById("orderSearch").value;
  loadOrders(1);
}

// STEP 2.2: Load orders from backend
function loadOrders(page = 1) {
  currentPage = page;

  const params = new URLSearchParams({
    page,
    search: currentSearch
  });

 fetch(`/api/orders?${params.toString()}`, {
  credentials: "include"
})

    .then(res => res.json())
    .then(data => {
      renderOrders(data.orders);
      renderPagination(data.currentPage, data.totalPages);
    })
    .catch(err => console.error("Order load error:", err));
}

// STEP 2.3: Render orders
function renderOrders(orders = []) {
  const list = document.getElementById("orders");
  list.innerHTML = "";

  if (!orders.length) {
    list.innerHTML = `
      <li class="list-group-item text-muted text-center">
        No orders found.
      </li>
    `;
    return;
  }

  orders.forEach(order => {
    
    const canCancel = order.status === "Pending";
    const canRefund =
  (order.status === "Cancelled" || order.status === "Completed") &&
  order.refundStatus !== "Refunded";


  list.innerHTML += `
    <li class="list-group-item">
      <div class="d-flex justify-content-between align-items-start">

        <!-- LEFT -->
        <div>
          <strong>Order #${order._id}</strong><br>
          <small>Total: ₱${order.total}</small>

          ${
            order.refundStatus && order.refundStatus !== "None"
              ? `<small class="d-block text-muted">
                   Refund: ${order.refundStatus}
                 </small>`
              : ""
          }
        </div>

        <!-- RIGHT -->
        <div class="text-end">
          <span class="badge ${
            order.status === "Pending"
              ? "bg-warning text-dark"
              : order.status === "Cancelled"
              ? "bg-danger"
              : "bg-success"
          }">
            ${order.status}
          </span>

          ${
            canCancel
              ? `<button
                   class="btn btn-sm btn-outline-danger mt-2"
                   onclick="cancelOrder('${order._id}')">
                   Cancel
                 </button>`
              : ""
          }

          ${
  canRefund
    ? `<button
         class="btn btn-sm btn-outline-warning mt-2 ms-1"
         onclick="openRefundModal('${order._id}')">
         Request Refund
       </button>`
    : ""
}

        </div>

      </div>
    </li>
  `;
});

}


// STEP 2.4: Render pagination
function renderPagination(current, total) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (total <= 1) return;

  if (current > 1) {
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="loadOrders(${current - 1})">Prev</a>
      </li>
    `;
  }

  for (let i = 1; i <= total; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === current ? "active" : ""}">
        <a class="page-link" href="#" onclick="loadOrders(${i})">${i}</a>
      </li>
    `;
  }

  if (current < total) {
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" onclick="loadOrders(${current + 1})">Next</a>
      </li>
    `;
  }
}

// STEP 2.5: Load first page on open

function cancelOrder(orderId) {
  if (!confirm("Are you sure you want to cancel this order?")) return;

fetch(`/api/orders/${orderId}/cancel`, {
  method: "PATCH",
  credentials: "include"
})

    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Order cancelled");
        loadOrders(currentPage); // refresh list
      } else {
        alert(data.error || "Unable to cancel order");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Something went wrong");
    });
}
function requestRefund(orderId) {
  if (!confirm("Request a refund for this order?")) return;

  fetch(`/api/orders/${orderId}/refund`, {
  method: "PATCH",
  credentials: "include"
})

    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Refund request submitted");
        loadOrders(currentPage);
      } else {
        alert(data.error || "Refund failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Something went wrong");
    });
}
// let refundModal;

// document.addEventListener("DOMContentLoaded", () => {
//   refundModal = new bootstrap.Modal(
//     document.getElementById("refundModal")
//   );
// });

function openRefundModal(orderId) {
  if (!refundModal) {
    alert("Refund modal not ready");
    return;
  }

  document.getElementById("refundOrderId").value = orderId;
  document.getElementById("refundReason").value = "";
  refundModal.show();
}

function submitRefund() {
  const orderId = document.getElementById("refundOrderId").value;
  const reason = document.getElementById("refundReason").value.trim();

  if (!reason) {
    alert("Please enter a refund reason");
    return;
  }

  fetch(`/api/orders/${orderId}/refund`, {
  method: "PATCH",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ reason })
})

    .then(res => res.json())
    .then(data => {
      if (data.success) {
        refundModal.hide();
        alert("Refund request submitted");
        loadOrders(currentPage);
      } else {
        alert(data.error || "Refund failed");
      }
    });
}
function renderProfile(user) {
  // Render addresses
  const addressList = document.getElementById("addressList");

  if (addressList) {
    if (!user.addresses || user.addresses.length === 0) {
      addressList.innerHTML = `
        <li class="list-group-item text-center text-muted">
          No addresses saved
        </li>`;
    } else {
      addressList.innerHTML = user.addresses.map((a, i) => `
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <strong>${a.label || "Address"}</strong><br>
            ${a.street}, ${a.city}<br>
            ${a.province || ""} ${a.zip || ""}
          </div>
          <button class="btn btn-sm btn-outline-danger"
            onclick="deleteAddress(${i})">
            ✕
          </button>
        </li>
      `).join("");
    }
  }

  // Profile fields
  document.getElementById("welcomeName").innerText = user.name;

  const nameEl = document.getElementById("profileName");
  const emailEl = document.getElementById("profileEmail");
  const voucherEl = document.getElementById("profileVouchers");
  const mobileEl = document.getElementById("profileMobile");
  const birthdayEl = document.getElementById("profileBirthday");

  if (nameEl) nameEl.innerText = user.name;
  if (emailEl) emailEl.innerText = user.email;
  if (voucherEl) voucherEl.innerText = user.vouchers ?? 0;

  if (mobileEl) {
    mobileEl.innerText =
      user.mobile !== null && user.mobile !== undefined && user.mobile !== ""
        ? user.mobile
        : "—";
  }

  if (birthdayEl) {
    birthdayEl.innerText = user.birthday
      ? new Date(user.birthday).toLocaleDateString()
      : "—";
  }
}
