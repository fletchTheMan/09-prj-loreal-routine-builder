// Get reference to the generate routine button and result area
const generateRoutineBtn = document.getElementById("generateRoutine");
let routineResult = document.getElementById("routineResult");

// If routineResult doesn't exist, create and insert it after the selected-products div
if (!routineResult) {
  const selectedProductsDiv = document.querySelector(".selected-products");
  routineResult = document.createElement("div");
  routineResult.id = "routineResult";
  routineResult.className = "selected-products";
  routineResult.style.display = "none";
  selectedProductsDiv.insertAdjacentElement("afterend", routineResult);
}

const workerUrl = "https://apikeything.hammondfletcher-648.workers.dev/";

// Get reference to the selected-products section
const selectedProductsSection = document.querySelector(".selected-products");

// Function to display selected products in the selected-products section
function displaySelectedProducts() {
  if (!selectedProductsSection) return;
  if (selectedProducts.length === 0) {
    selectedProductsSection.innerHTML = `<div class="placeholder-message">No products selected yet.</div>`;
    return;
  }
  selectedProductsSection.innerHTML = `
    <h2>Selected Products</h2>
    <ul>
      ${selectedProducts
        .map(
          (p) => `<li><strong>${p.name}</strong> <span>(${p.brand})</span></li>`
        )
        .join("")}
    </ul>
  `;
}

// Helper function to build a system prompt for routine generation
function getRoutinePrompt() {
  if (selectedProducts.length === 0) {
    return "The user has not selected any products. Please select products to generate a routine.";
  }
  const productList = selectedProducts
    .map((p) => `- ${p.name} (${p.brand})`)
    .join("\n");
  return `You are a professional makeup artist. Create a step-by-step makeup routine using only these:\n${productList}\n\n Explain the order and how to use each product. Be clear and beginner-friendly.`;
}
// Variable to store the last generated routine
let lastGeneratedRoutine = "";

// Event listener for the Generate Routine button
generateRoutineBtn.addEventListener("click", async () => {
  // Show loading message in the chat window
  chatWindow.innerHTML = "<div>Generating your routine...</div>";

  if (selectedProducts.length === 0) {
    chatWindow.innerHTML =
      "<div>Please select products to generate a routine.</div>";
    return;
  }

  // Prepare messages for OpenAI
  const messages = [
    {
      role: "system",
      content: getRoutinePrompt(),
    },
  ];

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const data = await response.json();

    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      chatWindow.innerHTML = `<h2>Your Personalized Makeup Routine</h2><div>${data.choices[0].message.content}</div>`;
      lastGeneratedRoutine = data.choices[0].message.content;
    } else {
      chatWindow.innerHTML = "<div>Sorry, no routine could be generated.</div>";
    }
  } catch (error) {
    chatWindow.innerHTML = `<div>Error: ${error.message}</div>`;
  }
});
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
    displaySelectedProducts();
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
        // Remove product from selectedProducts by matching name and brand
        selectedProducts = selectedProducts.filter(
          (p) =>
            !(p.name === products[idx].name && p.brand === products[idx].brand)
        );
        console.log("Deselected product:", products[idx]);
      } else {
        card.classList.add("selected");
        // Only add if not already in selectedProducts
        if (
          !selectedProducts.some(
            (p) =>
              p.name === products[idx].name && p.brand === products[idx].brand
          )
        ) {
          selectedProducts.push(products[idx]);
        }
        console.log("Selected product:", products[idx]);
      }
      // Save selected products and category to localStorage
      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
      );
      localStorage.setItem("selectedCategory", categoryFilter.value);
      displaySelectedProducts();
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

  // Highlight any products in this category that are already selected
  const productCards = document.querySelectorAll(".product-card");
  filteredProducts.forEach((product, idx) => {
    if (
      selectedProducts.some(
        (p) => p.name === product.name && p.brand === product.brand
      )
    ) {
      productCards[idx].classList.add("selected");
    }
  });

  // Save selected category to localStorage (but do NOT clear selectedProducts)
  localStorage.setItem("selectedCategory", selectedCategory);
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
});

// Helper function to get a system prompt including selected products
function getSystemPrompt() {
  let basePrompt =
    "You are a helpful assistant. Only answer questions about L'Oréal products, their subbrands, the selected products, makeup routines, or makeup recommendations.  If a question is not about these topics, politely explain that you can only help with the selected products or makeup advice.";
  if (selectedProducts.length > 0) {
    const productList = selectedProducts
      .map((p) => `- ${p.name} (${p.brand})`)
      .join("\n");
    basePrompt += `\n\nThe user has selected these L'Oréal products:\n${productList}`;
  }

  if (lastGeneratedRoutine && lastGeneratedRoutine.trim() !== "") {
    basePrompt += `\n\nHere is the personalized makeup routine that was generated for the user (you can comment on it or answer questions about it):\n${lastGeneratedRoutine}`;
  }
  return basePrompt;
}

// Array to store chat history
let chatHistory = [];

// Function to render chat history in the chat window
function renderChatHistory() {
  chatWindow.innerHTML = chatHistory
    .map((msg) => {
      if (msg.role === "user") {
        return `<div style="text-align: right;"><div style="display: inline-block; background: #e0e7ff; color: #222; padding: 8px 12px; border-radius: 16px; margin: 4px 0; max-width: 70%;">${msg.content}</div></div>`;
      } else if (msg.role === "assistant") {
        return `<div style="text-align: left;"><div style="display: inline-block; background: #f3f4f6; color: #222; padding: 8px 12px; border-radius: 16px; margin: 4px 0; max-width: 70%;">${msg.content}</div></div>`;
      } else {
        return "";
      }
    })
    .join("");
}

// Chat form submission handler - connects to OpenAI API
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the user's message from the input field
  const input = chatForm.querySelector("input");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Add user message to chat history
  chatHistory.push({ role: "user", content: userMessage });
  renderChatHistory();

  // Build the messages array for OpenAI, including selected products and routine in the system prompt
  const messages = [
    {
      role: "system",
      content: getSystemPrompt(),
    },
    ...chatHistory.map((msg) => ({ role: msg.role, content: msg.content })),
  ];

  // Show a loading message for the assistant
  chatHistory.push({ role: "assistant", content: "<em>Loading...</em>" });
  renderChatHistory();

  try {
    // Make a POST request to OpenAI's API
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const data = await response.json();

    // Remove the loading message
    chatHistory.pop();

    // Check for a valid response and display it
    if (
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
    ) {
      chatHistory.push({
        role: "assistant",
        content: data.choices[0].message.content,
      });
    } else {
      chatHistory.push({
        role: "assistant",
        content: "Sorry, no response from OpenAI.",
      });
    }
    renderChatHistory();
  } catch (error) {
    // Remove the loading message
    chatHistory.pop();
    chatHistory.push({ role: "assistant", content: `Error: ${error.message}` });
    renderChatHistory();
  }

  // Clear the input field
  input.value = "";
});
