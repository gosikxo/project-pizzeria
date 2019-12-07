import { select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
export class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;

    // Deep copy, copy value of object not its reference 
    // JSON.stringify -> creates string with JSON values 
    // JSON.parse -> creates JSON from string full of values
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }
  getData() {
    const thisCartProduct = this;
    const productInfo = { id: thisCartProduct.id, name: thisCartProduct.name, price: thisCartProduct.price, priceSingle: thisCartProduct.priceSingle, amount: thisCartProduct.amount, params: thisCartProduct.params };
    return productInfo;
  }
  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.amountWidget.value = thisCartProduct.amount;
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.processChange();
    });
  }

  processChange() {
    const thisCartProduct = this;
    thisCartProduct.amount = thisCartProduct.amountWidget.value;
    thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
    thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
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

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.stopPropagation();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.stopPropagation();
      thisCartProduct.remove();
    });
  }
}