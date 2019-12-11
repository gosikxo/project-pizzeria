import { BaseWidget } from './BaseWidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }

  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {}

  initPlugin() {
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    thisWidget.plugin = window.flatpickr(thisWidget.dom.input, {
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      defaultDate: thisWidget.minDate,
      locale: {
        firstDayOfWeek: 1 // start week on Monday
      },
      disable: [
        function(date) {
          // return true to disable
          return date.getDay() === 1;

        }
      ],
    });
    thisWidget.plugin.config.onChange.push(function dateHasChanged(_selectedDates, dateStr) {
      thisWidget.value = dateStr;
      const event = new CustomEvent('date_updated', {
        bubbles: true
      });
      thisWidget.dom.input.dispatchEvent(event);
    });
  }
}