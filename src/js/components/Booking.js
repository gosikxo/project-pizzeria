import { templates } from '../settings.js';
import { utils } from '../utils.js';
import { select, settings } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(wrapperDOMElement) {
    const thisBooking = this;
    thisBooking.render(wrapperDOMElement);
    thisBooking.initWidgets();
    thisBooking.getData();
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
  getData(){
    const thisBooking = this;
  
    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);
  
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];
  
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    // Add current events to booking record
    for (let event of eventsCurrent) {
      thisBooking.makeBooked(event.date, event.duration, event.hour, event.table);
    }

    // Add bookings to booking record
    for (let event of bookings) {
      thisBooking.makeBooked(event.date, event.duration, event.hour, event.table);
    }


    // Generate repeated booking for booking record
    for (let daysToAdd = 0; daysToAdd < settings.datePicker.maxDaysInFuture; daysToAdd++) {
      // Get current date and add specific number of days
      const date = utils.addDays(utils.now(), daysToAdd);

      // Get properly formatted date 
      const dateString = utils.dateToStr(date);

      for (let event of eventsRepeat) {
        // For every day we want to generate normal booking record 
        // As for eventsCurrent and bookings
        // But with generated date
        if(event.repeat){
          thisBooking.makeBooked(dateString, event.duration, event.hour, event.table);
        }
      }
    }
  }


  makeBooked(date, duration, hour, table) {
    const thisBooking = this;
    
    // If specific date has no data 
    if(!thisBooking.booked[date]) {
      // then create empty one for new records
      thisBooking.booked[date] = {};
    }

    // Get number value from hour 12:30 -> 12.5
    const from = utils.hourToNumber(hour);
    const to = from+duration;

    for(let currentTime=from; currentTime<=to; currentTime+=0.5) {
      // If there's record for specific hour we need to push table ID to already written table IDs
      if(thisBooking.booked[date][currentTime]) {
        thisBooking.booked[date][currentTime].push(table);
      } else {
        // IF there's no record, then initialize array
        thisBooking.booked[date][currentTime] = [table];
      }
    }
  }
}