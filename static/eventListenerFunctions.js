import { changeSlide, updateInterval, animateImage, startSlideshow } from "./src.js";
// eventListenerFunctions.js
// Function to handle key presses
function handleKeyPress(e) {
  // If the left arrow key is pressed, call the changeSlide function with argument -1
  if (e.keyCode == 37) {
    changeSlide(-1);
  }
  // If the right arrow key is pressed, call the changeSlide function with argument 1
  if (e.keyCode == 39) {
    changeSlide(1);
  }
}

// Function to handle context menu clicks
function handleContextMenuClick(e) {
  // Hide the context menu
  let contextMenu = document.getElementById("context-menu");
  contextMenu.classList.remove("visible");
}

// Function to handle mouse wheel events
function handleWheel(e) {
  // Get the scroll amount in pixels by dividing deltaY by deltaMode
  let scrollAmount = e.deltaY / e.deltaMode;
  // If the mouse scroll wheel is scrollled up, call the changeSlide function with argument -1
  if (scrollAmount < 0) {
    changeSlide(-1);
    updateInterval();
  }

  // If the mouse scroll wheel is scrollled down, call the changeSlide function with argument 1
  if (scrollAmount > 0) {
    changeSlide(1);
    updateInterval();
  }
}

// Function to handle touch events
function handleTouch(e) {
  // If the touch is a swipe to the left, call the changeSlide function with argument -1
  if (e.changedTouches[0].clientX < e.changedTouches[0].clientY) {
    changeSlide(-1);
  }

  // If the touch is a swipe to the right, call the changeSlide function with argument 1
  if (e.changedTouches[0].clientX > e.changedTouches[0].clientY) {
    changeSlide(1);
  }
}

// Function to handle re-animate events
function handleAnimate() {
  console.trace();
  changeSlide(0);
}

// Function to resume slideshow after video ends
function resumeSlideshow() {
  console.trace();
  startSlideshow();
  changeSlide(1);
}

export { handleKeyPress, handleContextMenuClick, handleWheel, handleTouch, handleAnimate, resumeSlideshow };