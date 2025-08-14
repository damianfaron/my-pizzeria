import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.home = new Home(document.querySelector(select.containerOf.home));
    const idFromHash = window.location.hash.replace('#/', '');
    // console.log('idFrom Hash', idFromHash);

    // find pages with ID :
    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */

        const id = clickedElement.getAttribute('href').replace('#', '');

        /* runn this app with that id  */

        thisApp.activatePage(id);

        // change URL HASH

        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class active to matching pages, and remove from non-matching */
    for (let page of thisApp.pages) {
      if (page.id == pageId) {
        page.classList.add(classNames.pages.active);
      } else {
        page.classList.remove(classNames.pages.active);
      }
      // // the same to up:
      // page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class active to matching linkgs, and remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
      // // the same to up:
      // page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
  },

  // booking
  // ========================================================================

  initBooking: function () {
    const bookingContainer = document.querySelector(select.containerOf.booking);
    // console.log(bookingContainer);
    // create instantion and add to container
    this.booking = new Booking(bookingContainer);
  },
  // menu
  // ======================================================================

  initMenu: function () {
    // const testProduct = new Product();
    // console.log('testProduct:', testProduct);
    const thisApp = this;
    console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      // new Product(productData, thisApp.data.products[productData]);
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    // console.log(dataSource);
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        // execute initMenu method
        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;

    const cartElement = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElement);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  init: function () {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    // thisApp.initMenu()
    // ;

    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
