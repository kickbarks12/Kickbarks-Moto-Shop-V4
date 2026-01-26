const params = new URLSearchParams(window.location.search);
const id = params.get("id");


fetch(`/api/orders/${id}`, { credentials: "include" })
  .then(res => res.json())
  .then(order => {
    document.getElementById("status").innerText = order.status;
    document.getElementById("total").innerText = order.total;

    document.getElementById("items").innerHTML = order.items.map(i => `
      <li class="list-group-item d-flex justify-content-between">
        <span>${i.name} × ${i.qty}</span>
        <span>₱${i.price * i.qty}</span>
      </li>
    `).join("");
  });
