
var hamburgerIcon = document.getElementById("hamburgerIcon");
var navItems = document.getElementById("navItems");
var hamburgerControl = false;


function showMenu(){
   if (!hamburgerControl){
      hamburgerIcon.firstElementChild.className = "fa-solid fa-times";
      navItems.style.width = "100%";
      hamburgerControl = true;
   }else{
      hamburgerIcon.firstElementChild.className = "fa-solid fa-bars";
      navItems.style.width = "0%";
      hamburgerControl = false;
   }
}


var firstComment = document.getElementById("firstComment");

// firstComment.style.marginLeft = "-50px";

function move(){

}

const aboutBox = document.querySelector(".reveal-box");

function revealAbout() {
  if (!aboutBox) return;

  const boxTop = aboutBox.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (boxTop < windowHeight - 120) {
    aboutBox.classList.add("active");
  }
}

window.addEventListener("scroll", revealAbout);
revealAbout();

