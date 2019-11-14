/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product { // eslint-disable-line no-unused-vars
    constructor(id, data) {
      const thisProduct = this; // eslint-disable-line no-unused-vars

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();

      console.log('new Product: ', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
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

    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;

      // Data checked by user
      const formData = utils.serializeFormToObject(thisProduct.form);
      
      // Object containing potential options 
      const data = thisProduct.data;

      // Default price
      const defaultPrice = thisProduct.data.price;

      // On the very beginning we assume that price is default 
      let total = defaultPrice;

      // Option categories
      const categories = data.params;
      
      for(const categoryName in categories) {
        // Options possible per category 
        const options = categories[categoryName].options;  
        // Options checked for specific category
        const checkedForCategory = formData[categoryName];

        // Go throught options and calculate price based on them
        for(const optionName in options) {
          const option = options[optionName];

          // If option is in the array of checked options, then it's checked
          // If not then indexOf is returning -1
          const optionChecked = typeof checkedForCategory !== 'undefined' && checkedForCategory.indexOf(optionName) !== -1;
          const imageWrapper = thisProduct.element.querySelector(`img.${categoryName}-${optionName}`);

          if (optionChecked) {
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
            // If option is not checked and it's default, then we decrase total price
            // Because total price is based on default value
            // Default value is containing default options in price
            if (option.default) {
              total -= option.price;
            }
          }
        }
      }


      // We need to acquire number value from string amount of products, because we get string value 
      // IDK why, but amount is an array, that's why we need to get the first and the only one value 
      const amount = Number.parseInt(formData.amount[0]);

      // Afterwards we multiply total price by the number of product ordered
      thisProduct.priceElem.innerHTML = total * amount;
      console.log('Product price: ' + total);

    }
  }

  const app = {
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
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
    },
  };
  app.init();
}
