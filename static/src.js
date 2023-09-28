// src.js
import { handleKeyPress, handleContextMenuClick, handleWheel, handleTouch, handleAnimate, resumeSlideshow } from "./eventListenerFunctions.js";
// Set the image folder path
let folder = "images";

// Store the interval ID in a variable
let intervalId;

let progressBarFill;
let slideDurationBarFill;

// Read an array of files from /images which returns a list of all the image filenames in the /images folder in this format ["1.png","a.jpg","yellow-3.webp"]
function getImageList() {
  let request = new XMLHttpRequest();
  request.open("GET", folder, false);
  request.send(null);
  let slideArray = JSON.parse(request.responseText);
  // Check that each file in the array is an image
  slideArray = slideArray.filter(file => {
    return file.match(/\.(jpeg|jpg|gif|png|webp|mp4)$/) != null;
  });
  return slideArray;
}
let slideArray = getImageList();
let numImages = slideArray.length;
let slideIndex = 0;

function makeSubfolderCheckboxes(slideArray) {
  // Identify subfolders and create checkboxes for each subfolder
  let subfolders = [];
  slideArray.forEach(file => {
    let subfolder = file.split("/")[1];
    if (subfolder != undefined && subfolders.indexOf(subfolder) == -1) {
      subfolders.push(subfolder);
    }
    // Sort subfolders alphabetically
    subfolders.sort();
  });

  // Remove any subfolder checkboxes that already exist
  let subfolderCheckboxes = document.querySelectorAll("#subfolders input");
  subfolderCheckboxes.forEach(checkbox => {
    checkbox.parentNode.removeChild(checkbox);
  });

  // Remove any subfolder labels that already exist
  let subfolderLabels = document.querySelectorAll("#subfolders label");
  subfolderLabels.forEach(label => {
    label.parentNode.removeChild(label);
  });

  // Create a checkbox for each subfolder
  subfolders.forEach(subfolder => {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = subfolder;
    checkbox.name = subfolder;
    checkbox.value = subfolder;
    checkbox.checked = true;
    checkbox.addEventListener("change", () => {
      // If the checkbox is checked, add the subfolder to the slideshow
      if (checkbox.checked) {
        addSubfolder(subfolder);
      } else {
        // If the checkbox is unchecked, remove the subfolder from the slideshow
        removeSubfolder(subfolder);
      }
    });
    let label = document.createElement("label");
    label.htmlFor = subfolder;
    label.appendChild(document.createTextNode(subfolder));
    document.getElementById("subfolders").appendChild(checkbox);
    document.getElementById("subfolders").appendChild(label);
  });
}

// Function to shuffle an array
function shuffle(array) {
  console.trace();
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Function to check image dimensions and viewport dimensions and animate image accordingly
export function animateImage(imageId) {
  console.log("animateImage", imageId)
  let interval = document.getElementById("interval").value;
  let image = document.getElementById(imageId);
  let imageWidth = image.naturalWidth;
  let imageHeight = image.naturalHeight;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let imageRatio = (imageWidth / imageHeight).toPrecision(2);
  let viewportRatio = (viewportWidth / viewportHeight).toPrecision(2);
  let ratioDifference = (viewportRatio - imageRatio).toPrecision(2);
  let imageAnimations = image.getAnimations();

  // set info div to show image dimensions and viewport dimensions and ratios and ratio difference
  document.getElementById("info").innerHTML = slideArray[slideIndex - 1] + " imageWidth: " + imageWidth + " imageHeight: " + imageHeight + " viewportWidth: " + viewportWidth + " viewportHeight: " + viewportHeight + " imageRatio: " + imageRatio + " viewportRatio: " + viewportRatio + " ratioDifference: " + ratioDifference;

  // If the animate checkbox is unchecked, remove any translate animations (need to keep fade animations) from the image and set the image to 100% max width and height
  let animateCheckbox = document.getElementById("animate");
  if (!animateCheckbox.checked) {
    image.style.maxHeight = "100%";
    image.style.maxWidth = "100%";
    image.style.marginLeft = "0";
    image.style.transform = "translateX(0)";
    // Cancel any translate animations
    for (let i = 0; i < imageAnimations.length; i++) {
      if (imageAnimations[i].id == "translateX" || imageAnimations[i].id == "translateY") {
        imageAnimations[i].cancel();
      }
    }
    return;
  }
  image.style.maxHeight = null;
  image.style.maxWidth = null;
  // If the image is wider than the viewport, animate the image to move right to left for a duration based on interval with max height of 100% of the viewport height
  
  for (let i = 0; i < imageAnimations.length; i++) {
    imageAnimations[i].cancel();
  }
  if (ratioDifference < 0) {
    image.style.height = "100%";
    image.style.width = "auto";
    image.style.marginLeft = "0";
    image.style.transform = "translateX(0)";
    let imageTranslateX = (imageWidth * (viewportHeight / imageHeight)) - viewportWidth;
    image.animate([
      { transform: "translateX(0)" },
      { transform: "translateX(-" + imageTranslateX + "px)" },
      { transform: "translateX(0)" }
    ], {
      duration: interval * 1000 * 2,
      easing: "linear",
      fill: "forwards",
      iterations: Infinity,
      id: "translateX"
    });
    // If the image is taller than the viewport, animate the image to move top to bottom for a duration based on interval with max width of 100% of the viewport width
  } else if (ratioDifference > 0) {
    image.style.height = "auto";
    image.style.width = "100%";
    image.style.marginLeft = "0";
    image.style.transform = "translateX(0)";
    let imageTranslateY = (imageHeight * (viewportWidth / imageWidth)) - viewportHeight;
    image.animate([
      { transform: "translateY(0)" },
      { transform: "translateY(-" + imageTranslateY + "px)" },
      { transform: "translateY(0)" }
    ], {
      duration: interval * 1000 * 2,
      easing: "linear",
      fill: "forwards",
      iterations: Infinity,
      id: "translateY"
    });
  }
}

// Function to start the slideshow
export function startSlideshow() {
  let interval = document.getElementById("interval").value;
  if (document.getElementById("startStopText").innerHTML == "⏵") {
    document.getElementById("startStopText").innerHTML = "⏸";
  }
  // Clear the existing interval if it exists
  clearInterval(intervalId);
  intervalId = setInterval(function () {
    changeSlide(1);
  }, interval * 1000);
  console.log("startSlideshow", intervalId, interval)
}

// Function to stop the slideshow
function stopSlideshow() {
  console.trace();
  document.getElementById("startStopText").innerHTML = "⏵";
  clearInterval(intervalId);

  // Reset the slide duration bar fill animation
  slideDurationBarFill.style.width = "0%";
  let slideDurationBarFillAnimation = slideDurationBarFill.getAnimations()[0];
  if (slideDurationBarFillAnimation) {
    slideDurationBarFillAnimation.cancel();
  }
}

// Function to pause the slideshow
function pauseSlideshow() {
  console.trace();
  clearInterval(intervalId);

  // Reset the slide duration bar fill animation
  slideDurationBarFill.style.width = "0%";
  let slideDurationBarFillAnimation = slideDurationBarFill.getAnimations()[0];
  if (slideDurationBarFillAnimation) {
    slideDurationBarFillAnimation.cancel();
  }
}

// Function to toggle slideshow start and stop
function startStop() {
  console.trace();
  document.getElementById("startStopText").innerHTML == "⏵" ? startSlideshow() : stopSlideshow();
}



// Function to update the interval value
export function updateInterval() {
  let interval = document.getElementById("interval").value;
  document.getElementById("intervalValue").innerHTML = interval + "s";
  // Check if the slideshow is running and update the interval by stopping and starting the slideshow
  if (document.getElementById("startStopText").innerHTML == "⏸") {
    stopSlideshow();
    startSlideshow();
    changeSlide(0);
  }
}



// Function to change the slide
export function changeSlide(n) {
  console.trace(n, slideIndex)
  // console.log("changeSlide +", n, "index:",slideIndex)
  // Increment the slide index by n
  slideIndex += n;
  let videoContainer = document.getElementById("videoContainer");
  let videoCheckbox = document.getElementById("videoEnabled");
  let interval = document.getElementById("interval").value;

  // Wrap around the slide index if it goes out of bounds, shuffling the slide array
  if (slideIndex > numImages) {
    slideIndex = 1;
    slideArray = shuffle(slideArray); // Shuffle the slide array again
  } else if (slideIndex < 1) {
    slideIndex = numImages;
    slideArray = shuffle(slideArray); // Shuffle the slide array again
  }

  // Check if the video checkbox is checked
  if (videoCheckbox.checked) {
    // If the video checkbox is checked, check if the slide is an image or a video
    if (slideArray[slideIndex - 1].match(/\.(jpeg|jpg|gif|png|webp)$/) != null) {
      // If the slide is an image, hide the video container
      videoContainer.style.display = "none";
    } else {
      // If the slide is a video, show the video container
      videoContainer.style.display = "block";
      video.src = slideArray[slideIndex - 1];
      // and set opacity of the image containers to 0
      // slide1Container.style.opacity = 0;
      // slide2Container.style.opacity = 0;
    }
  } else {
    // If the video checkbox is not checked, hide the video container
    videoContainer.style.display = "none";
  }

  // Update the image source with the new slide index from the shuffled array
  if (slide1Container.classList.contains("fadeIn")) { // If slide1 is visible, update slide2
    slide2.src = slideArray[slideIndex - 1];
  } else { // else, update slide1
    slide1.src = slideArray[slideIndex - 1];
  }
  // Update page title
  let currentFilename = slideArray[slideIndex - 1].substring(slideArray[slideIndex - 1].lastIndexOf("/") + 1);
  document.title = slideIndex + "/" + numImages + " " + currentFilename;

  // Animate the progress bar fill to show the slideshow progress
  progressBarFill.style.width = slideIndex / numImages * 100 + "%"; // Reset the progress bar fill width

  // Check if the slideshow is paused
  if (document.getElementById("startStopText").innerHTML == "⏸") {

    // Animate the slide duration bar fill
    slideDurationBarFill.style.width = "0%"; // Reset the slide duration bar fill width
    slideDurationBarFill.animate([ // Animate the slide duration bar fill width
      { width: "0%" },
      { width: "100%" }
    ], {
      duration: interval * 1000,
      easing: "linear",
      fill: "forwards"
    });
  }
}



// Functions to handle subfolders
function addSubfolder(subfolder) {
  slideArray = slideArray.concat(getImageList(subfolder));
  slideArray = shuffle(slideArray);
  numImages = slideArray.length;
  changeSlide(1);
  updateInterval();
}

function removeSubfolder(subfolder) {
  slideArray = slideArray.filter(function (value, index, arr) {
    return !value.includes(subfolder);
  });
  slideArray = shuffle(slideArray);
  numImages = slideArray.length;
  changeSlide(1);
  updateInterval();
}


// Wait for the DOM to be ready
window.addEventListener("DOMContentLoaded", () => {
  // Get the slideshow and slide elements
  let slide1 = document.getElementById("slide1");
  let slide2 = document.getElementById("slide2");
  let video = document.getElementById("video");
  let slide1Container = document.getElementById("slide1Container");
  let slide2Container = document.getElementById("slide2Container");
  let animateCheckbox = document.getElementById("animate");
  
  makeSubfolderCheckboxes(slideArray);
  
  progressBarFill = document.getElementById("progressBarFill");
  slideDurationBarFill = document.getElementById("slideDurationBarFill");

  // Do an initial shuffle of the slide array
  slideArray = shuffle(slideArray);

  // When slide1 is loaded, make slide2 visible and slide2 transparent
  slide1.onload = function () {
    if (slide2Container.classList.contains("fadeIn")) {
      slide2Container.classList.remove("fadeIn");
    }
    slide2Container.classList.add("fadeOut");
    if (slide1Container.classList.contains("fadeOut")) {
      slide1Container.classList.remove("fadeOut");
    }
    slide1Container.classList.add("fadeIn");
  };

  // When slide2 is loaded, make slide2 visible and slide1 transparent
  slide2.onload = function () {
    if (slide1Container.classList.contains("fadeIn")) {
      slide1Container.classList.remove("fadeIn");
    }
    slide1Container.classList.add("fadeOut");
    if (slide2Container.classList.contains("fadeOut")) {
      slide2Container.classList.remove("fadeOut");
    }
    slide2Container.classList.add("fadeIn");
  };

  // Variable declarations for the context menu
  const contextMenu = document.getElementById("context-menu");
  const scope = document.querySelector("body");

  // Display the context menu when the right mouse button is clicked
  scope.addEventListener("contextmenu", e => {
    // Prevent the default context menu from appearing
    e.preventDefault();
    // Get the mouse position
    const { clientX, clientY } = e;
    contextMenu.style.left = `${clientX}px`;
    contextMenu.style.top = `${clientY}px`;
    // Add a small delay to make sure the context menu is displayed after the click event
    setTimeout(() => {
      contextMenu.classList.add("visible");
    }, 10);
  });

  // Hide the context menu when the user clicks outside of it
  scope.addEventListener("click", () => { contextMenu.classList.contains("visible") ? contextMenu.classList.remove("visible") : null; });



  // Event listeners
  document.getElementById("startStop").addEventListener("click", startStop);
  document.addEventListener("keydown", handleKeyPress);
  contextMenu.addEventListener("click", handleContextMenuClick);
  document.addEventListener("wheel", handleWheel);
  animateCheckbox.addEventListener("change", handleAnimate);
  document.addEventListener("touchend", handleTouch);
  window.addEventListener("resize", handleAnimate);
  video.addEventListener("ended", resumeSlideshow);
  video.addEventListener("play", pauseSlideshow);
  // video.addEventListener("pause", resumeSlideshow);
  document.getElementById("interval").addEventListener("input", updateInterval);
  document.addEventListener("visibilitychange", () => { document.hidden ? stopSlideshow() : startSlideshow(); });

  // Wait for the images to load and then call the animateImage function
  slide1.addEventListener("load", () => {
    animateImage("slide1");
  });
  slide2.addEventListener("load", () => {
    animateImage("slide2");
  });

  // Start the slideshow
  startStop();
  changeSlide(1);
});