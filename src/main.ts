import './style.css';
import { CartDB } from './cartdb';
import type { Dessert } from './cartdb';
import remove from '../assets/images/icon-remove-item.svg';
const cartDB = new CartDB();

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <p class="heading">Desserts</p>
  <div class="maincontainer" id="dessert">
    <div class="container" id="dessert-container"></div>
    <div class="maincart" id="main-cart">
      <div class="cart-info">Your Cart (<span id="cart-count">0</span>)</div>
      <div class="cart-items">Your added items will appear here</div>
      <div class="cart-total">order Total: $<span id="order-total">0.00</span></div>
      <button id="confirm-order">Confirm Order</button>
    </div>
  </div>
  <div class="attribution">
    Challenge by <a href="https://www.frontendmentor.io?ref=challenge">Frontend Mentor</a>. 
    Coded by <a href="https://github.com/Simon-Njoroge/product-list-with-cart-main.git">Simon Njoroge</a>.
  </div>
`;

const container = document.querySelector<HTMLDivElement>('#dessert-container')!;
const cartCount = document.querySelector<HTMLSpanElement>('#cart-count')!;
const cartItems = document.querySelector<HTMLDivElement>('.cart-items')!;
const orderTotal = document.querySelector<HTMLSpanElement>('#order-total')!;
const confirmOrderBtn = document.querySelector<HTMLButtonElement>('#confirm-order')!;

function updateCartUI(items: Dessert[]) {
  cartCount.textContent = items.length.toString();
  cartItems.innerHTML = '';
  let total = 0;

  items.forEach((item) => {
    total += item.price;

    const p = document.createElement('p');
    p.textContent = `${item.name} - $${item.price.toFixed(2)}`;
    
    const delBtn = document.createElement('button');
    const trashIcon = document.createElement('img');
    trashIcon.src = remove;
    trashIcon.alt = 'Remove from cart';
    trashIcon.width = 20;
    trashIcon.height = 20;

    delBtn.appendChild(trashIcon);
    delBtn.style.marginLeft = '10px';

    delBtn.onclick = async () => {
      await cartDB.removeItem(item.name);
      const updated = await cartDB.getAllItems();
      updateCartUI(updated);
    };

    p.appendChild(delBtn);
    cartItems.appendChild(p);
  });

  orderTotal.textContent = total.toFixed(2);
}

confirmOrderBtn.addEventListener('click', async () => {
  const items = await cartDB.getAllItems();
  if (items.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  await cartDB.clearCart();
  const updated = await cartDB.getAllItems();
  updateCartUI(updated);
  alert("Thank you for your order!");
});

async function init() {
  const cart = await cartDB.getAllItems();
  updateCartUI(cart);

  const res = await fetch('/data.json');
  const data: Dessert[] = await res.json();

  data.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <img src="${item.image.thumbnail}" alt="${item.name}" id="img" />
      <p class="category">${item.category}</p>
      <p class="itemtitle">${item.name}</p>
      <p class="price">$${item.price.toFixed(2)}</p>
      <button class="addcart"><span><img src="../assets/images/icon-add-to-cart.svg"/>
      Add to Cart</button>
    `;

    const btn = div.querySelector<HTMLButtonElement>('.addcart')!;
    btn.addEventListener('click', async () => {
      await cartDB.addItem(item);
      const updated = await cartDB.getAllItems();
      updateCartUI(updated);
    });

    container.appendChild(div);
  });
}

init();
