import AmountWidget from '../components/AmountWidget.js';
import { select } from '../settings.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    // items menuProduct;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.params = menuProduct.params;
    // referencje do el. DOM

    thisCartProduct.getElements(element);
    // method init
    thisCartProduct.initAmountWidgetCart();
    thisCartProduct.initActions();
  }
  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    // create elements
    thisCartProduct.dom.amountWidget = element.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(
      select.cartProduct.remove
    );

    // console.log('new CartProduct:', this);
  }

  initAmountWidgetCart() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.amountWidget.element.addEventListener('updated', () => {
      thisCartProduct.processOrderCart();
    });
  }

  processOrderCart() {
    const thisCartProduct = this;

    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price =
      thisCartProduct.priceSingle * thisCartProduct.amount;

    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
      // na razie nic nie robimy
      console.log('Edit clicked');
    });

    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
      console.log('Remove clicked');
    });
  }
  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  getData() {
    const thisCartProduct = this;

    return {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };
  }
}

export default CartProduct;
