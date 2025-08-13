import BaseWidget from '../components/BaseWidget.js';
import { select, settings } from '../settings.js';
import utils from '../utils.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.output
    );
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin() {
    const thisWidget = this;

    window.rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function () {
      // console.log('HourPicker input event, value:', thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(value) {
    // return utils.numberToHour(value);
    return parseFloat(value);
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    // thisWidget.dom.output.innerHTML = thisWidget.value;
    thisWidget.dom.output.innerHTML = utils.numberToHour(thisWidget.value);
  }
}

export default HourPicker;
