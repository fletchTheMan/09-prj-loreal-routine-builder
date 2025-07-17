/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

// Array to store currently selected products
let selectedProducts = [];

// Restore selections from localStorage on page load
window.addEventListener("DOMContentLoaded", async () => {
  const savedCategory = localStorage.getItem("selectedCategory");
  const savedProducts = JSON.parse(
    localStorage.getItem("selectedProducts") || "[]"
  );

  if (savedCategory) {
    categoryFilter.value = savedCategory;
    const products = await loadProducts();
    const filteredProducts = products.filter(
      (product) => product.category === savedCategory
    );
    displayProducts(filteredProducts);
    setupProductSelection(filteredProducts);
    // Restore selected products
    selectedProducts = [];
    const productCards = document.querySelectorAll(".product-card");
    filteredProducts.forEach((product, idx) => {
      if (
        savedProducts.some(
          (p) => p.name === product.name && p.brand === product.brand
        )
      ) {
        productCards[idx].classList.add("selected");
        selectedProducts.push(product);
      }
    });
  }
});

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product, idx) => `
    <div class="product-card" data-index="${idx}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <div class="product-description">
        ${product.description || "No description available."}
      </div>
    </div>
  `
    )
    .join("");
}

// Set up click listeners for product selection
function setupProductSelection(products) {
  const productCards = document.querySelectorAll(".product-card");
  productCards.forEach((card, idx) => {
    card.addEventListener("click", () => {
      // Toggle selection for this card
      if (card.classList.contains("selected")) {
        card.classList.remove("selected");
        // Remove product from selectedProducts
        selectedProducts = selectedProducts.filter((p) => p !== products[idx]);
        console.log("Deselected product:", products[idx]);
      } else {
        card.classList.add("selected");
        selectedProducts.push(products[idx]);
        console.log("Selected product:", products[idx]);
      }
      // Save selected products and category to localStorage
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
      );
      localStorage.setItem("selectedCategory", categoryFilter.value);
    });
  });
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  // Filter products by selected category
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
  setupProductSelection(filteredProducts);
  selectedProducts = []; // Reset selected products
  // Save selected category and empty products to localStorage
  localStorage.setItem("selectedCategory", selectedCategory);
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
});

const workerUrl = "https://apikeything.hammondfletcher-648.workers.dev/";

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
