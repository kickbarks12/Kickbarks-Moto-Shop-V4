document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/products?featured=true")
    .then(res => res.json())
    .then(products => {
      const container = document.getElementById("featuredProducts");
      if (!container || !products.length) return;

      products.slice(0, 6).forEach(product => {
        container.innerHTML += `
          <div class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 shadow-sm">
              <img
                src="${product.image}"
                class="card-img-top"
                alt="${product.name}"
              />
              <div class="card-body d-flex flex-column">
                <h6 class="card-title">${product.name}</h6>
                <p class="fw-bold mb-2">₱${product.price}</p>
                <a href="/product.html?id=${product._id}" 
                   class="btn btn-sm btn-primary mt-auto">
                  View Product
                </a>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(console.error);
});
