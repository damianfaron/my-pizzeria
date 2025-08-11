import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';
class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    // console.log('Amount Widget', thisWidget);
    // console.log('contructor arguments: ', element);
    thisWidget.getElements(element);
    // const inputValue = thisWidget.dom.input.value;
    // if (inputValue !== '' && !isNaN(inputValue)) {
    //   thisWidget.setValue(inputValue);
    // } else {
    //   thisWidget.setValue(settings.amountWidget.defaultValue);
    // }
    thisWidget.setValue(
      thisWidget.dom.input.value || settings.amountWidget.defaultValue
    );
    thisWidget.initActions();
  }
  getElements() {
    const thisWidget = this;

    // thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  // set value in input
  // setValue(value) {
  //   // const thisWidget = this;

  //   // const newValue = parseInt(value);

  //   // /* TODO: add validation */
  //   // thisWidget.value = newValue;
  //   // thisWidget.dom.input.value = thisWidget.value;

  //   // if (thisWidget.value !== newValue && !isNaN(newValue)) {
  //   //   thisWidget.value = newValue;
  //   // }
  //   // // console.log(value);
  //   const thisWidget = this;

  //   const newValue = thisWidget.parseValue(value);

  //   if (thisWidget.value !== newValue && thisWidget.isValue(newValue)) {
  //     thisWidget.value = newValue;
  //     thisWidget.announce();
  //   }

  //   // update, to last good num...
  //   // thisWidget.dom.input.value = thisWidget.value;
  //   thisWidget.renderValue();
  // }

  // parseValue(value) {
  //   return parseInt(value);
  // }
  isValue(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    // change input value
    thisWidget.dom.input.addEventListener('change', function () {
      // thisWidget.setValue(thisWidget.dom.input.value);
      thisWidget.value = thisWidget.dom.input.value;
    });
    // substract value
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    // add  value

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  // own eventLISTENER !!!
  // announce() {
  //   const thisWidget = this;

  //   // const event = new Event('update');
  //   const event = new Event('updated', { bubbles: true });
  //   thisWidget.dom.wrapper.dispatchEvent(event);
  // }
}

export default AmountWidget;
