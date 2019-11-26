import { settings, select } from '../settings.js';
import { BaseWidget } from './BaseWidget.js';
export class AmountWidget extends BaseWidget{
  constructor(element) {
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;
    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);

    if (newValue !== thisWidget.value &&
            newValue >= settings.amountWidget.defaultMin &&
            newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function () {
      event.stopPropagation();
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function () {
      event.preventDefault();
      event.stopPropagation();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function () {
      event.preventDefault();
      event.stopPropagation();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

}