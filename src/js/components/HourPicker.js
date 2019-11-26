import { BaseWidget } from './BaseWidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.syncValue();
  }
    
  parseValue(value) {
    return utils.numberToHour(value);
  }
    
  isValid() {
    return true;
  }
    
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.output.innerText = thisWidget.value;
  }

  syncValue() {
    const thisWidget = this;
    thisWidget.value = thisWidget.dom.input.value;
  }
    
  initPlugin() {
    const thisWidget = this;
    window.rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function() {
      thisWidget.syncValue();
    });
  }
}
