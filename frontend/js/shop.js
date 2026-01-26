        let wishlistIds = [];
        let allProducts = [];


        function loadWishlistIds() {
  return fetch("/api/users/wishlist-ids", { credentials: "include" })
    .then(res => {
      if (!res.ok) return [];
      return res.json();
    })
    .then(ids => (Array.isArray(ids) ? ids : []))
    .catch(() => []);
}




       

        const productList = document.getElementById("productList");
        const searchInput = document.getElementById("searchInput");
        const priceFilter = document.getElementById("priceFilter");

       fetch("/api/products")
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    renderProducts(allProducts); // show products immediately

    // load wishlist AFTER products are shown
    return loadWishlistIds();
  })
  .then(ids => {
    wishlistIds = ids;
    renderProducts(allProducts); // re-render with wishlist state
  });



        function renderProducts(products) {
          productList.innerHTML = products.map(p => `
            <div class="col-6 col-md-4 col-lg-3 mb-4">
              <div class="card h-100 shadow-sm">

                <img src="${p.image}"
                    class="card-img-top"
                    alt="${p.name}">

                <div class="card-body d-flex flex-column">
                  <h6 class="card-title">
                    <a href="/product.html?id=${p._id}"
                      class="text-decoration-none text-dark">
                      ${p.name}
                    </a>
                  </h6>

                  <p class="fw-bold text-success mb-2">
                    ₱${p.price}
                  </p>

                  <button
                    class="btn btn-primary btn-sm w-100 mt-auto"
                    onclick='addCart(${JSON.stringify(p)})'>
                    Add to Cart
                  </button>

                  <button
                    class="btn btn-sm mt-2
                      ${Array.isArray(wishlistIds) && wishlistIds.includes(p._id)

                        ? "btn-danger"
                        : "btn-outline-danger"}"
                    onclick="toggleWishlist('${p._id}')">
                    ♥ Wishlist
                  </button>
                </div>

              </div>
            </div>
          `).join("");
        }


        searchInput.addEventListener("input", () => {
          const keyword = searchInput.value.toLowerCase();
          const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword)
          );
          renderProducts(filtered);
        });

        priceFilter.addEventListener("change", () => {
          let sorted = [...allProducts];

          if (priceFilter.value === "low") {
            sorted.sort((a, b) => a.price - b.price);
          }

          if (priceFilter.value === "high") {
            sorted.sort((a, b) => b.price - a.price);
          }

          renderProducts(sorted);
        });


        function toggleWishlist(productId) {
          fetch(`/api/users/wishlist/${productId}`, {
            method: "POST",
            credentials: "include"
          })
            .then(res => {
              if (res.status === 401) {
                alert("Please login to use wishlist");
                location.href = "/login.html";
                return;
              }
              return fetch("/api/users/wishlist-ids", {
                credentials: "include"
              });
            })
            .then(res => res.json())
            .then(ids => {
              wishlistIds = ids;
              renderProducts(allProducts);
            });
        }
        // function addToCart(product) {
        //   let cart = JSON.parse(localStorage.getItem("cart")) || [];
        //   const found = cart.find(i => i._id === product._id);

        //   if (found) found.qty += 1;
        //   else cart.push({ ...product, qty: 1 });

        //   localStorage.setItem("cart", JSON.stringify(cart));
        //   showToast("Added to cart");
        // }
        function addCart(product) {
          let cart = JSON.parse(localStorage.getItem("cart")) || [];

          const found = cart.find(i => i._id === product._id);

          if (found) {
            found.qty += 1;
          } else {
            cart.push({ ...product, qty: 1 });
          }

          localStorage.setItem("cart", JSON.stringify(cart));
          showToast("Added to cart");
        }
