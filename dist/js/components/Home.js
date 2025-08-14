import { templates } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.element = element;

    thisHome.render(element);
    thisHome.initActions();
    thisHome.initWidgets(); // init carousel
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.home();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    // element to click
    thisHome.dom.orderBox = thisHome.dom.wrapper.querySelector('.order-box');
    thisHome.dom.bookingBox =
      thisHome.dom.wrapper.querySelector('.booking-box');

    //element of galery and carousel
    thisHome.dom.galleryItems = thisHome.dom.wrapper.querySelectorAll(
      '.home-gallery .gallery-item'
    );
    thisHome.dom.carouselContainer =
      thisHome.dom.wrapper.querySelector('.home-carousel');
  }

  initActions() {
    const thisHome = this;

    thisHome.dom.orderBox.addEventListener('click', function () {
      window.location.hash = '#/order';
    });

    thisHome.dom.bookingBox.addEventListener('click', function () {
      window.location.hash = '#/booking';
    });
  }
  initWidgets() {
    const thisHome = this;

    if (!thisHome.dom.carouselContainer) return;

    // change nodeList to array :
    const slides = Array.from(
      thisHome.dom.carouselContainer.querySelectorAll('.carousel-image')
    );
    const dots = Array.from(
      thisHome.dom.carouselContainer.querySelectorAll('.carousel-dots .dot')
    );
    const descriptions = Array.from(
      document.querySelectorAll('#carousel-description .desc')
    );

    let currentIndex = 0;
    const total = slides.length;

    function updateSlide(index) {
      slides.forEach(function (slide, i) {
        slide.style.display = i === index ? 'block' : 'none';
      });
      dots.forEach(function (dot, i) {
        if (i === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      descriptions.forEach(function (desc, i) {
        if (i === index) {
          desc.classList.add('active');
        } else {
          desc.classList.remove('active');
        }
      });
    }

    // show first
    updateSlide(currentIndex);

    // auto change
    setInterval(function () {
      currentIndex = (currentIndex + 1) % total;
      updateSlide(currentIndex);
    }, 3000);

    // click change
    // dots.forEach(function (dot, i) {
    //   dot.addEventListener('click', function () {
    //     currentIndex = i;
    //     updateSlide(currentIndex);
    //   });
    // });
  }
}

export default Home;
