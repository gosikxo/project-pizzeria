
import { Product } from './components/Product.js';
import { Cart } from './components/Cart.js';
import { select, settings, classNames } from './settings.js';
import { Booking } from './components/Booking.js';
const app = {
  initPages() {
    const thisApp = this;
    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));
    let pagesMatchingHash = [];

    if(window.location.hash.length > 2) {
      // Get id from hashed ID "#/booking" -> "booking"
      const idFromHash = window.location.hash.replace('#/', '');
      
      // Find pages matching id gathered from hash 
      pagesMatchingHash = thisApp.pages.filter(function(page) {
        return page.id == idFromHash;
      });

      // If no pages match provided hash we get the first one on default
      thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    } else {
      // If there's no hash then render first page (which is "order page")
      thisApp.activatePage(thisApp.pages[0].id);
    }

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function () {
        const clickedElement = this;
        event.preventDefault();
        /*get page id from href*/
        const id = clickedElement.getAttribute('href').replace('#', '');
        /*activate page*/
        thisApp.activatePage(id);
      });
    }
  },
  activatePage(pageId) {
    const thisApp = this;
    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.nav.active, page.getAttribute('id') == pageId);
    }
    window.location.hash = '#/' + pageId;
  },
  initBooking() {
    const thisApp = this;
    thisApp.BookingWidget = document.querySelector(select.containerOf.booking);
    thisApp.Booking = new Booking(thisApp.BookingWidget);
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
  },

  initMenu: function () {
    const thisApp = this;

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  init: function () {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();


