import { templates } from '../settings.js';
import { utils } from '../utils.js';
import { select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';

export class Booking {
  constructor(wrapperDOMElement) {
    const thisBooking = this;
    thisBooking.render(wrapperDOMElement);
    thisBooking.initWidgets();
  }

  render(wrapperDOMElement) {
    const thisBooking = this;

    // Initialize element 
    const generatedHTML = templates.bookingWidget();
    const element = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    // Element which will contain our Booking element
    thisBooking.dom.wrapper = wrapperDOMElement;
    // Our booking element
    thisBooking.dom.element = element;
    // Add our booking element to specific wrapper which we get from app.js
    thisBooking.dom.wrapper.appendChild(element);

    // Find wrappers for amount widgets 
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    // Initialize amount widgets in specific wrappers which we get in render method
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}
