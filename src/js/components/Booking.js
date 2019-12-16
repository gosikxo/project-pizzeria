import { templates } from '../settings.js';
import { utils } from '../utils.js';
import { select, settings, classNames } from '../settings.js';
import { AmountWidget } from './AmountWidget.js';
import { DatePicker } from './DatePicker.js';
import { HourPicker } from './HourPicker.js';

export class Booking {
  constructor(wrapperDOMElement) {
    const thisBooking = this;
    thisBooking.selectedTable = undefined;
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

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.bookTableButton = thisBooking.dom.wrapper.querySelector(select.booking.button);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }

  initWidgets() {
    const thisBooking = this;

    // Initialize amount widgets in specific wrappers which we get in render method
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();      
    });

    thisBooking.dom.wrapper.addEventListener('date_updated', function() {
      thisBooking.selectedTable = undefined;
      thisBooking.updateDOM();
      thisBooking.updateHourPicker();
    });

    thisBooking.dom.wrapper.addEventListener('hour_updated', function() {
      thisBooking.selectedTable = undefined;
      thisBooking.updateDOM();
    });

    for (let table of thisBooking.dom.tables)
      table.addEventListener('click', function() {
        const clickedTable = this;
        if(!thisBooking.isTableReservedForHour(clickedTable)) {
          thisBooking.selectedTable = clickedTable;
          thisBooking.updateDOM();
        }
      });


    thisBooking.dom.bookTableButton.addEventListener('click', function() {
      const phoneNumber = thisBooking.dom.phone.value;
      const address = thisBooking.dom.address.value;
      const isAddressValid = thisBooking.validateAddress(address);
      const isPhoneValid = thisBooking.validatePhone(phoneNumber);
      const areInputsValid = isAddressValid && isPhoneValid;

      if(!thisBooking.selectedTable || !areInputsValid){
        window.alert('You need to fill form to make a booking.');
      } else {
        thisBooking.sendOrder();
      }
    });

    thisBooking.dom.address.addEventListener('change', function (event) {
      thisBooking.validateAddress(event.target.value);
    });
    thisBooking.dom.phone.addEventListener('change', function (event) { 
      thisBooking.validatePhone(event.target.value);
    });
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
        const hasEventStarted = date > new Date(event.date);
        // For every day we want to generate normal booking record 
        // As for eventsCurrent and bookings
        // But with generated date
        // Also we want to check if event had already started
        if(event.repeat && hasEventStarted){
          thisBooking.makeBooked(dateString, event.duration, event.hour, event.table);
        }
      }
    }
    thisBooking.updateDOM();
    thisBooking.updateHourPicker();
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

  getStarters() {
    const thisBooking = this;
    const starters = [];

    for(const starterCheckbox of thisBooking.dom.starters) {
      if(starterCheckbox.checked) {
        starters.push(starterCheckbox.value);
      }
    }

    return starters;
  }


  getTableID(table) {
    return parseInt(table.getAttribute(settings.booking.tableIdAttribute));
  }

  isTableReservedForHour(table, hour) {
    const thisBooking = this;
    const tableID = thisBooking.getTableID(table);
    const reservationsToday = thisBooking.booked[thisBooking.date];
    const chosenHour = hour || thisBooking.hour;
    // && returns last element in expression or false if expression equals false
    const tablesReservedThisHour = reservationsToday && reservationsToday[chosenHour];
    return tablesReservedThisHour && tablesReservedThisHour.includes(tableID);
  }

  getReservationsColors(){
    const thisBooking = this;
    const colorsPerHalfHour = [];

    for (let hour=12; hour<24; hour+=0.5) {
      let tablesReserved = 0;

      for(let table of thisBooking.dom.tables){
        if(thisBooking.isTableReservedForHour(table, hour)){
          tablesReserved += 1;
        }
      }

      if(tablesReserved === 0) {
        colorsPerHalfHour.push('green');
      } else { 
        if(tablesReserved === thisBooking.dom.tables.length) {
          colorsPerHalfHour.push('red');
        } else {
          colorsPerHalfHour.push('orange');
        }
      }
    }
    
    return colorsPerHalfHour;
  }

  validatePhone(phoneNumber) {
    const thisBooking = this;

    if(phoneNumber.length>=9) {
      thisBooking.dom.phone.classList.remove('error');
      return true;
    } else {
      thisBooking.dom.phone.classList.add('error');
      return false;
    }
  }

  validateAddress(address) {
    const thisBooking = this;

    if(address.length >= 3) {
      thisBooking.dom.address.classList.remove('error');
      return true;
    } else {
      thisBooking.dom.address.classList.add('error');
      return false;
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.correctValue);

    for(let table of thisBooking.dom.tables){
      if(thisBooking.isTableReservedForHour(table)) {
        table.classList.add(classNames.booking.tableBooked);
      } else { 
        table.classList.remove(classNames.booking.tableBooked);
      }

      if(thisBooking.selectedTable === table) { 
        table.classList.add(classNames.booking.tableSelected);
      } else {
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
  }

  updateHourPicker() {
    const thisBooking = this;
    const colors = thisBooking.getReservationsColors();
    thisBooking.hourPicker.setColors(colors);
  }

  resetState() {
    const thisBooking = this;
    thisBooking.dom.phone.value = '';
    thisBooking.dom.address.value = '';
    thisBooking.selectedTable = undefined;
  }

  sendOrder() {
    const thisBooking = this;
  
    const url = settings.db.url + '/' + settings.db.booking;

    const bookingInfo = { 
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.getTableID(thisBooking.selectedTable),
      repeat: false,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: thisBooking.getStarters(),
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
   
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingInfo),
    };
    fetch(url, options)
      .then(function () {
        thisBooking.resetState();
        thisBooking.getData();
      }).catch(function () {
        window.alert('We couldn\'t make a booking');
      });
  }
}


