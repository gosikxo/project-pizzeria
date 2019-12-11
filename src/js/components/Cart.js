import { settings, select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import { CartProduct } from './CartProduct.js';
export class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.wrapper.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      const phoneNumber = thisCart.dom.phone.value;
      const address = thisCart.dom.address.value;
      const isAddressValid = thisCart.validateAddress(address);
      const isPhoneValid = thisCart.validatePhone(phoneNumber);
      const areInputsValid = isAddressValid && isPhoneValid;

      if(thisCart.products.length === 0) {
        window.alert('Your cart is empty. Please add something to the cart before sending an order.');
      } else {
        if(!areInputsValid) {
          window.alert('Please input phone number and address correct.');
        } else { 
          thisCart.sendOrder();
          thisCart.resetState();
        }
      }
    });

    thisCart.dom.address.addEventListener('change', function (event) {
      thisCart.validateAddress(event.target.value);
    });
    thisCart.dom.phone.addEventListener('change', function (event) { 
      thisCart.validatePhone(event.target.value);
    });
    
  }

  validatePhone(phoneNumber) {
    const thisCart = this;

    if(phoneNumber.length>=9) {
      thisCart.dom.phone.classList.remove('error');
      return true;
    } else {
      thisCart.dom.phone.classList.add('error');
      return false;
    }
  }

  validateAddress(address) {
    const thisCart = this;

    if(address.length >= 3) {
      thisCart.dom.address.classList.remove('error');
      return true;
    } else {
      thisCart.dom.address.classList.add('error');
      return false;
    }
  }
  
  resetState() {
    const thisCart = this;
    for (let product of thisCart.products) {
      thisCart.remove(product);
    }
    thisCart.dom.phone.value = '';
    thisCart.dom.address.value = '';
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      address: thisCart.dom.address,
      totalPrice: thisCart.totalPrice,
      phone: thisCart.dom.phone,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
  remove(productToRemove) {
    const thisCart = this;
    productToRemove.dom.wrapper.remove();
    thisCart.products = thisCart.products.filter(product => product !== productToRemove);
    thisCart.update();
  }

  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    const isCartEmpty = thisCart.products.length === 0;
    thisCart.deliveryFee = isCartEmpty ? 0 : settings.cart.defaultDeliveryFee;
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;


    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }

  add(menuProduct) {
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

}
