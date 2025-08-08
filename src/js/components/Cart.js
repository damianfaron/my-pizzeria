import { select, classNames, templates, settings } from '../settings.js';
import utils from '../utils.js';
import CartProduct from '../components/CartProduct.js';
// import AmountWidget from './components/AmountWidget.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart:', thisCart);
  }
  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  // add product to cart
  add(menuProduct) {
    const thisCart = this;

    // console.log('dodane produkty', menuProduct);

    // generate HTML
    const generateHTML = templates.cartProduct(menuProduct);

    // change HTML to DOM
    const generateDOM = utils.createDOMFromHTML(generateHTML);
    // add items to CART
    thisCart.dom.productList.appendChild(generateDOM);

    const cartProduct = new CartProduct(menuProduct, generateDOM);

    //
    thisCart.products.push(cartProduct);

    // thisCart.products.push(menuProduct);

    // console.log('Wybrane produkty:', thisCart.products);
    thisCart.update();
  }

  update() {
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (const product of thisCart.products) {
      totalNumber = totalNumber + product.amount;
      subtotalPrice = subtotalPrice + product.price;
    }

    if (totalNumber > 0) {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    } else {
      thisCart.totalPrice = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
    }

    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

    for (const totalPriceElem of thisCart.dom.totalPrice) {
      totalPriceElem.innerHTML = thisCart.totalPrice;
    }
    // console.log('totalNumber:', totalNumber);
    // console.log('subtotalPrice:', subtotalPrice);
    // console.log('deliveryFee:', totalNumber > 0 ? deliveryFee : 0);
    // console.log('totalPrice:', thisCart.totalPrice);
  }
  remove(cartProduct) {
    const thisCart = this;

    // delete product DOM
    cartProduct.dom.wrapper.remove();

    // delete  thisCart.products from table
    const index = thisCart.products.indexOf(cartProduct);
    if (index !== -1) {
      thisCart.products.splice(index, 1);
    }

    // update CART
    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.wrapper.querySelector(select.cart.address).value,
      phone: thisCart.dom.wrapper.querySelector(select.cart.phone).value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: [],
    };
    console.log('params to send:', payload);
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
      // console.log(prod);
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}

export default Cart;
