import './style.css';
import { functionalityDB} from './functionalityDB';
import type { Dessert } from './functionalityDB';
import remove from '../assets/images/icon-remove-item.svg';

const FunctionalityDB = new functionalityDB();

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <p class="heading">Desserts</p>
  <div class="maincontainer" id="dessert">
    <div class="container" id="dessert-container"></div>
    <div class="maincart" id="main-cart">
      <div class="cart-info">Your Cart (<span id="cart-count">0</span>)</div>
      <div class="cart-items">Your added items will appear here</div>
      <div class="cart-total">Order Total: $<span id="order-total">0.00</span></div>
      <button id="confirm-order">Confirm Order</button>
    </div>
  </div>
  <div class="attribution">
    Challenge by <a href="https://www.frontendmentor.io?ref=challenge">Frontend Mentor</a>. 
    Coded by <a href="https://github.com/tmothykhalayi/Week-2-Friday-assignment-.git">Timothy Khalayi</a>.
  </div>
`;

const container = document.querySelector<HTMLDivElement>('#dessert-container')!;
const cartCount = document.querySelector<HTMLSpanElement>('#cart-count')!;
const cartItems = document.querySelector<HTMLDivElement>('.cart-items')!;
const orderTotal = document.querySelector<HTMLSpanElement>('#order-total')!;
const confirmOrderBtn = document.querySelector<HTMLButtonElement>('#confirm-order')!;

/**
 * Update the cart UI with the latest items and total price.
 * @param items - The list of items in the cart.
 */
function updateCartUI(items: Dessert[]) {
  cartCount.textContent = items.length.toString();
  cartItems.innerHTML = '';  // Clear current cart items.
  let total = 0;

  items.forEach((item) => {
    total += item.price;

    const p = document.createElement('p');
    p.textContent = `${item.name} - $${item.price.toFixed(2)}`;
    
    const delBtn = createDeleteButton(item);

    p.appendChild(delBtn);
    cartItems.appendChild(p);
  });

  orderTotal.textContent = total.toFixed(2);
}

function createDeleteButton(item: Dessert): HTMLButtonElement {
  const delBtn = document.createElement('button');
  const trashIcon = document.createElement('img');
  trashIcon.src = remove;
  trashIcon.alt = 'Remove from cart';
  trashIcon.width = 20;
  trashIcon.height = 20;

  delBtn.appendChild(trashIcon);
  delBtn.style.marginLeft = '10px';

  delBtn.onclick = async () => {
    await removeItemFromCart(item.name);
    const updated = await FunctionalityDB.getAllItems();
    updateCartUI(updated);
  };

  return delBtn;
}


async function removeItemFromCart(itemName: string) {
  await FunctionalityDB.removeItem(itemName);
}

//handles confirmation of the order
async function confirmOrderHandler() {
  const items = await FunctionalityDB.getAllItems();
  if (items.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  await FunctionalityDB.clearCart();
  const updated = await FunctionalityDB.getAllItems();
  updateCartUI(updated);
  alert("Thank you for your order!");
}

//json fetch function to get dessert data
async function fetchDessertData(): Promise<Dessert[]> {
  const res = await fetch('/data.json');
  if (!res.ok) {
    console.error('Failed to fetch dessert data');
    return [];
  }
  return await res.json();
}

async function init() {
  const cart = await FunctionalityDB.getAllItems();
  updateCartUI(cart);

  const desserts = await fetchDessertData();
  renderDessertItems(desserts);
}

//displays items
function renderDessertItems(desserts: Dessert[]) {
  desserts.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <img src="${item.image.thumbnail}" alt="${item.name}" id="img" />
      <p class="category">${item.category}</p>
      <p class="itemtitle">${item.name}</p>
      <p class="price">$${item.price.toFixed(2)}</p>
      <button class="addcart">
        <span><img src="../assets/images/icon-add-to-cart.svg" alt="Add to cart" /></span>
        Add to Cart
      </button>
    `;

    const btn = div.querySelector<HTMLButtonElement>('.addcart')!;
    btn.addEventListener('click', async () => {
      await FunctionalityDB.addItem(item);
      const updated = await FunctionalityDB.getAllItems();
      updateCartUI(updated);
    });

    container.appendChild(div);
  });
}

confirmOrderBtn.addEventListener('click', confirmOrderHandler);

// Initialize the app
init();
