/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

// const { init } = require('browser-sync');

{
  ('use strict');
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),

    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      // console.log('new Product', thisProduct);
      this.getElements();
      // console.log(id);
      // console.log(data);
      this.initAccordion();
      this.initOrderFrom();
      this.initAmountWidget();
      this.processOrder();
    }
    // generate items in HTML
    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on templaet */
      const generateHTML = templates.menuProduct(thisProduct.data);
      // console.log(generateHTML);

      /* create element using untils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generateHTML);

      /* find menu container */
      const menuConatiner = document.querySelector(select.containerOf.menu);
      // console.log(menuConatiner);
      /* add element to menu */
      menuConatiner.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      // console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.amountWidgetElement = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }

    // harmonica event
    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      /*this is in method getElements!!!!!!
      const clickableTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
       ); */

      // console.log(clickableTrigger);
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }
    initOrderFrom() {
      const thisProduct = this;
      // console.log('Metoda init Order From: ', thisProduct);
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      // console.log('metoda Process Order: ', thisProduct);
      // convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log(formData);
      // set price to default price
      let price = thisProduct.data.price;
      // for rvery category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log(paramId, param);
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);
          const optionImage = thisProduct.imageWrapper.querySelector(
            '.' + paramId + '-' + optionId
          );
          // console.log(optionId, option);

          // check if there is param with a name of paramId in formData and if it includes optionId
          if (optionSelected) {
            // check if the option is not default
            if (!option.default) {
              // add option price to price variable
              price += option.price;
            }
          } else {
            // check if the option is default
            if (option.default) {
              // reduce price variable
              price -= option.price;
            }
          }
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add('active');
            } else {
              optionImage.classList.remove('active');
            }
          }
        }
      }
      // save value for one product
      thisProduct.priceSingle = price;
      // change value in amount
      price *= thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(
        thisProduct.amountWidgetElement
      );
      thisProduct.amountWidgetElement.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    /*================================================
    // add items to CART !!
    ============================================*/

    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    // prepare cart PRODUCT

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      // console.log('metoda Process Order: ', thisProduct);
      // convert form to object structure
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      // console.log(formData);
      // set price to default price

      // for rvery category (param)...
      for (let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        // console.log(paramId, param);
        // create category param in params
        params[paramId] = {
          label: param.label,
          options: {},
        };
        // for every option in this category
        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      // console.log('Amount Widget', thisWidget);
      // console.log('contructor arguments: ', element);
      thisWidget.getElements(element);
      // const inputValue = thisWidget.input.value;
      // if (inputValue !== '' && !isNaN(inputValue)) {
      //   thisWidget.setValue(inputValue);
      // } else {
      //   thisWidget.setValue(settings.amountWidget.defaultValue);
      // }
      thisWidget.setValue(
        thisWidget.input.value || settings.amountWidget.defaultValue
      );
      thisWidget.initActions();
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }

    // set value in input
    setValue(value) {
      // const thisWidget = this;

      // const newValue = parseInt(value);

      // /* TODO: add validation */
      // thisWidget.value = newValue;
      // thisWidget.input.value = thisWidget.value;

      // if (thisWidget.value !== newValue && !isNaN(newValue)) {
      //   thisWidget.value = newValue;
      // }
      // // console.log(value);
      const thisWidget = this;

      const newValue = parseInt(value);

      if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      // update, to last good num...
      thisWidget.input.value = thisWidget.value;
    }
    initActions() {
      const thisWidget = this;

      // change input value
      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });
      // substract value
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      // add  value

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    // own eventLISTENER !!!
    announce() {
      const thisWidget = this;

      // const event = new Event('update');
      const event = new Event('updated', { bubbles: true });
      thisWidget.element.dispatchEvent(event);
    }
  }
  /*==================================================================================
  // class CART
===================================================================================*/
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
  }

  /*==================================================================================
  //  CART PRODUCTS 
  // ===================================================================================*/

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
      thisCartProduct.dom.price = element.querySelector(
        select.cartProduct.price
      );
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
  }

  /*==================================================================================
  // APP
===============================================================================*/
  const app = {
    initMenu: function () {
      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
      // console.log(dataSource);
    },
    initCart: function () {
      const thisApp = this;

      const cartElement = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElement);
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
