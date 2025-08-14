import { classNames, select, settings, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    // id table
    thisBooking.selectedTable = null;
    //
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.minDate);

    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepaeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.booking.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepaeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepaeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepaeat),
    ])
      .then(function (allResponse) {
        const bookingsResponse = allResponse[0];
        const eventsCurrentResponse = allResponse[1];
        const eventsRepaeatResponse = allResponse[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepaeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepaeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepaeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepaeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepaeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;

    let hourValue = thisBooking.hourPicker.value;
    if (typeof hourValue === 'string') {
      thisBooking.hour = utils.hourToNumber(hourValue);
    } else {
      thisBooking.hour = hourValue;
    }

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ===
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    const thisBooking = this;

    const generateHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generateHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    thisBooking.dom.datePickerWrapper = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPickerWrapper = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper
      .querySelector(select.booking.tables)
      .closest('.floor-plan');

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector('form');
    // thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(
    //   select.booking.tables
    // );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerWrapper);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerWrapper);

    // thisBooking.dom.peopleAmount.addEventListener('update', function () {});
    // thisBooking.dom.hoursAmount.addEventListener('update', function () {});

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      // console.log('Booking detected updated event');

      thisBooking.updateDOM();
      // reset table for hour
      thisBooking.resetSelectedTable();
    });

    // for table
    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
  initTables(event) {
    const thisBooking = this;

    // find ele. click
    const clickedTable = event.target.closest(select.booking.tables);
    // if missclick
    if (!clickedTable) return;
    // if table have class booked
    if (clickedTable.classList.contains(classNames.booking.tableBooked)) {
      alert('Stolik zajęty');
      return;
    }

    // delete class

    for (let table of thisBooking.dom.tables) {
      table.classList.remove('selected');
    }

    // get id table
    const tableId = clickedTable.getAttribute(
      settings.booking.tableIdAttribute
    );

    // if click the same table - delete choose
    if (thisBooking.selectedTable == tableId) {
      clickedTable.classList.remove('selected');
      thisBooking.selectedTable = null;
      return;
    }
    // delete tables

    //
    thisBooking.selectedTable = parseInt(tableId);

    // add class to table
    clickedTable.classList.add('selected');
  }

  resetSelectedTable() {
    const thisBooking = this;

    // delete class selected
    for (let table of thisBooking.dom.tables) {
      table.classList.remove('selected');
    }
    thisBooking.selectedTable = null;
  }

  sendBooking() {
    const thisBooking = this;

    // URL
    const url = 'http://localhost:3131/bookings';

    // object payload
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table:
        thisBooking.selectedTable !== null
          ? parseInt(thisBooking.selectedTable)
          : null,
      duration: parseInt(thisBooking.hoursAmount.value),
      ppl: parseInt(thisBooking.peopleAmount.value),
      starters: [],
      phone: thisBooking.dom.form.querySelector('[name="phone"]').value,
      address: thisBooking.dom.form.querySelector('[name="address"]').value,
    };

    // starter
    const checkedStarters = thisBooking.dom.form.querySelectorAll(
      'input[name="starter"]:checked'
    );
    for (let starter of checkedStarters) {
      payload.starters.push(starter.value);
    }

    //  POST
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Błąd sieci');
        }
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('Rezerwacja wysłana:', parsedResponse);
        // alert('Twoja rezerwacja została przyjęta!');

        // save reservation local thisBooking.booked
        thisBooking.makeBooked(
          payload.date,
          payload.hour,
          payload.duration,
          payload.table
        );

        // optional remove
        thisBooking.resetSelectedTable();
        thisBooking.dom.form.reset();
      })
      .catch(function (error) {
        console.error('Błąd przy wysyłaniu rezerwacji:', error);
        alert('Coś poszło nie tak, spróbuj ponownie.');
      });
  }
}

export default Booking;
