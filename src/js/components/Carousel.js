import { select, classNames } from '../settings.js';

export class Carousel {
  constructor(DOMElement) {
    const thisCarousel = this;
    thisCarousel.dom = {};
    thisCarousel.dom.element = DOMElement;
    thisCarousel.initElements();    
    thisCarousel.initialize();
  }

  initElements() {
    const thisCarousel = this;
    thisCarousel.dom.slides = Array.from(thisCarousel.dom.element.querySelectorAll(select.carousel.item));
    thisCarousel.dom.selectors = thisCarousel.dom.element.querySelector(select.carousel.selectors);
  }

  initialize() {
    const thisCarousel = this;
    
    // Set current slide to the first one
    thisCarousel.currentSlideID = 0;
    
    // Add buttons
    thisCarousel.dom.buttons = [];

    for(let slideID = 0; slideID<thisCarousel.dom.slides.length; slideID++){
      const button = document.createElement('button');
      button.addEventListener('click', function() {
        if(slideID !== thisCarousel.currentSlideID) {
          thisCarousel.currentSlideID = slideID;
          thisCarousel.flushInterval();  
          thisCarousel.render();
        }
      });
      thisCarousel.dom.buttons.push(button);
      thisCarousel.dom.selectors.appendChild(button);
    }
    
    thisCarousel.dom.element.classList.add('initialized');
    thisCarousel.flushInterval();  
    thisCarousel.render();
  }

  flushInterval() {
    const thisCarousel = this;
    clearInterval(thisCarousel.updateInterval);
    thisCarousel.updateInterval = setInterval(function() {
      thisCarousel.next();
    }, 3000);
  }

  next() {
    const thisCarousel = this;

    // If the slideID is the last one, we need to start over again
    if(thisCarousel.currentSlideID + 1 === thisCarousel.dom.slides.length) {
      thisCarousel.currentSlideID = 0;
    } else {
      thisCarousel.currentSlideID += 1;
    }
    thisCarousel.render();
  }

  render() {
    const thisCarousel = this;

    for(let slideID=0; slideID<thisCarousel.dom.slides.length; slideID++) {
      const translateXPercent = (slideID-thisCarousel.currentSlideID)*100;
      thisCarousel.dom.slides[slideID].style.transform = `translateX(${translateXPercent}%)`;

      if(thisCarousel.currentSlideID === slideID){
        thisCarousel.dom.buttons[slideID].classList.add(classNames.carousel.buttonActive);
      } else {
        thisCarousel.dom.buttons[slideID].classList.remove(classNames.carousel.buttonActive);
      }
    }
  }
}