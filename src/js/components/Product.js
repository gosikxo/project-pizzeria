import { select, templates, classNames } from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this; // eslint-disable-line no-unused-vars

    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.params = {};
    thisProduct.name = thisProduct.data.name;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

  }

  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

      /* START LOOP: for each active product */
      for (const product of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (product !== thisProduct.element) {
          /* remove class active for the active product */
          product.classList.remove('active');
        }
        /* END: if the active product isn't the element of thisProduct */

      }
      /* END LOOP: for each active product */
    });
    /* END: click event listener to trigger */
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  resetState() {
    const thisProduct = this;

    // reset params
    thisProduct.params = {};
    
    // we need to create new DOM element so we will have initial state back again 
    const generatedHTML = templates.menuProduct(thisProduct.data);
    const domElement = utils.createDOMFromHTML(generatedHTML);
    // we assume that if someone added product to cart, the product was active 
    // otherwise no one could click "Add to cart"
    domElement.classList.toggle('active');
    // we want to do not run the animation after product DOM element replacement
    domElement.classList.toggle('ignore-animation');
    // finally we replace the old DOM element with the new one
    utils.replaceDOMElement(domElement, thisProduct.element);
    // we also want to remember the reference to the new element,
    // so we can do the same operation in the future
    thisProduct.element = domElement;

    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  addToCart() {
    const thisProduct = this;
    thisProduct.amount = thisProduct.amountWidget.value;
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });
    thisProduct.element.dispatchEvent(event);
    thisProduct.resetState();
  }

  initOrderForm() {
    const thisProduct = this;
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

    // Data checked by user
    const formData = utils.serializeFormToObject(thisProduct.form);

    // Object containing potential options 
    const data = thisProduct.data;
    thisProduct.categories = {};
    // Default price
    const defaultPrice = thisProduct.data.price;

    // On the very beginning we assume that price is default 
    let total = defaultPrice;

    // Option categories
    const categories = data.params;
    for (const categoryName in categories) {
      // Options possible per category 
      const options = categories[categoryName].options;
      const categoryLabel = categories[categoryName].label;

      // Options checked for specific category
      const checkedForCategory = formData[categoryName];

      // Go throught options and calculate price based on them
      for (const optionName in options) {
        const option = options[optionName];

        // If option is in the array of checked options, then it's checked
        // If not then indexOf is returning -1
        const optionChecked = typeof checkedForCategory !== 'undefined' && checkedForCategory.indexOf(optionName) !== -1;
        const imageWrapper = thisProduct.element.querySelector(`img.${categoryName}-${optionName}`);

        if (optionChecked) {
          if (!thisProduct.params[categoryName]) {
            thisProduct.params[categoryName] = {
              label: categoryLabel,
              options: {},
            };
          }
          thisProduct.params[categoryName].options[optionName] = option.label;

          // if image wrapper was found 
          if (imageWrapper) {
            // then add class active to this image 
            imageWrapper.classList.add(classNames.menuProduct.imageVisible);
          }

          // If option is checked, but it's not default, then we increase total price
          if (!option.default) {
            total += option.price;
          }
        } else {
          if (imageWrapper) {
            imageWrapper.classList.remove(classNames.menuProduct.imageVisible);
          }
          // remove unchecked params if they were previously checked
          delete thisProduct.params[categoryName].options[optionName];
          // If option is not checked and it's default, then we decrase total price
          // Because total price is based on default value
          // Default value is containing default options in price
          if (option.default) {
            total -= option.price;
          }
        }
      }
    }

    /* multiply price by amount */
    thisProduct.priceSingle = total;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

  }
}
