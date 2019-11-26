import { templates } from '../settings.js';
import { utils } from '../utils.js';
import { select } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';
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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;

    // Initialize amount widgets in specific wrappers which we get in render method
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}
