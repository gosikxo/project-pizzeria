import { BaseWidget } from './BaseWidget.js';
import { settings, select } from '../settings.js';
import { utils } from '../utils.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initialized = false;

    thisWidget.initPlugin();
    thisWidget.syncValue();
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  initializeColorsContainer() {
    const thisWidget = this;
    thisWidget.dom.rangeSliderWrapper = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.rangeSlider);
    thisWidget.dom.colorRangesWrapper = document.createElement('div');
    thisWidget.dom.colorRangesWrapper.setAttribute('class', 'color-ranges');
    thisWidget.dom.rangeSliderWrapper.appendChild(thisWidget.dom.colorRangesWrapper);
    thisWidget.initialized = true;
  }

  setColors(colors) {
    const thisWidget = this;

    if (thisWidget.initialized) {
      thisWidget.dom.colorRangesWrapper.innerHTML = '';

      for (const color of colors) {
        const colorRange = document.createElement('div');
        colorRange.setAttribute('class', `color-range ${color}`);
        thisWidget.dom.colorRangesWrapper.appendChild(colorRange);
      }
    }
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
    const rangeWrapperClass = select.widgets.hourPicker.rangeSlider.replace('.', '');
    const rangeSliderConfig = { 
      onInit: function () { 
        thisWidget.initializeColorsContainer(); 
      }, 
      rangeClass: rangeWrapperClass,
      fillClass: '' ,
    };
    window.rangeSlider.create(thisWidget.dom.input, rangeSliderConfig);
    thisWidget.dom.input.addEventListener('input', function () {
      thisWidget.syncValue();
      const event = new CustomEvent('hour_updated', {
        bubbles: true
      });
      thisWidget.dom.input.dispatchEvent(event);
    });
  }
}
