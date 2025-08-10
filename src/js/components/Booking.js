import { select, templates } from '../settings.js';
import AmountWidget from '../components/AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    // add referention to caontainer
    thisBooking.element = element;

    // initiazlize element dom in container
    // thisBooking.getElements(element);

    // render container:
    thisBooking.render(element);

    // init widget
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    // generate HTML with Hendlebars
    const generateHTML = templates.bookingWidget();
    // create empty object
    thisBooking.dom = {};
    // add wrapper
    thisBooking.dom.wrapper = element;
    // change to HTML
    thisBooking.dom.wrapper.innerHTML = generateHTML;
    // add peopleAmound and hoursAmount
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;

    // create instantion AmountWidget for inputs
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    // change to click (callback empty now)
    thisBooking.dom.peopleAmount.addEventListener('update', function () {});
    thisBooking.dom.hoursAmount.addEventListener('update', function () {});
  }
}

export default Booking;
