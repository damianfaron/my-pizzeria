import { select, settings } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    // console.log('Amount Widget', thisWidget);
    // console.log('contructor arguments: ', element);
    thisWidget.getElements(element);
    // const inputValue = thisWidget.input.value;
    // if (inputValue !== '' && !isNaN(inputValue)) {
    //   thisWidget.setValue(inputValue);
    // } else {
    //   thisWidget.setValue(settings.amountWidget.defaultValue);
    // }
    thisWidget.setValue(
      thisWidget.input.value || settings.amountWidget.defaultValue
    );
    thisWidget.initActions();
  }
  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  // set value in input
  setValue(value) {
    // const thisWidget = this;

    // const newValue = parseInt(value);

    // /* TODO: add validation */
    // thisWidget.value = newValue;
    // thisWidget.input.value = thisWidget.value;

    // if (thisWidget.value !== newValue && !isNaN(newValue)) {
    //   thisWidget.value = newValue;
    // }
    // // console.log(value);
    const thisWidget = this;

    const newValue = parseInt(value);

    if (
      thisWidget.value !== newValue &&
      !isNaN(newValue) &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax
    ) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    // update, to last good num...
    thisWidget.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;

    // change input value
    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    // substract value
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    // add  value

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }

  // own eventLISTENER !!!
  announce() {
    const thisWidget = this;

    // const event = new Event('update');
    const event = new Event('updated', { bubbles: true });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
