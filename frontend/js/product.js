// Get product ID from URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let product;

// Load product details
fetch(`/api/products/${id}`)
  .then(res => res.json())
  .then(p => {
    product = p;

    document.getElementById("name").innerText = p.name;
    document.getElementById("image").src = p.image;
    document.getElementById("desc").innerText = p.description;
    document.getElementById("price").innerText = p.price;
    // document.getElementById("addBtn").disabled = false;

    
  });

// Add to cart
function add() {
  if (!product) return;

  const qty = Number(document.getElementById("qty").value) || 1;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const found = cart.find(i => i._id === product._id);

  if (found) found.qty += qty;
  else cart.push({ ...product, qty });

  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Added to cart");
}

