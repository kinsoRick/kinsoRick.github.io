let textDisplayed = 0

function colorizeBackgroundText () {
  let header = document.getElementsByClassName("background-text")[0];
  anime({
    targets: header,
    color: () => {
      let hue = anime.random(0, 360);
      let saturation = 60;
      let lumonisity = 70;
      let hslaValue = "hsla(" + hue + "," + saturation + "%," + lumonisity + "%, 0.7)";
      return hslaValue;
    },
    duration: 1000
  });
}

function drawCircles(wrapper) {
  const textToDisplay = ['DEVELOPER', 'FOR', 'YOUR', 'PROJECTS'];

  for (let index = 0; index < textToDisplay.length; index++) {
    const text = textToDisplay[index];

    let div = document.createElement("div");
    let p  = document.createElement("p");
    p.innerHTML = text;
    p.style = "display: none;"
    circle = wrapper.appendChild(div);
    circle.classList.add("circle");
    circle.isHover = false;
    circle.addEventListener("mouseenter", onHoverCircle, false);
    circle.appendChild(p);
  }
}

function colorizeCircles () {
  const circle = document.getElementsByClassName("circle")

  anime({
    targets: circle,
    backgroundColor: () => {
      let hue = anime.random(0, 360);
      let saturation = 60;
      let lumonisity = 70;
      let hslValue = "hsla(" + hue + "," + saturation + "%," + lumonisity + "%, 0.5)";
      return hslValue;
    },
    delay: () => {
      return anime.random(250,1000);
    },
    duration: () => {
      return anime.random(250,1000);
    },
  });
}

function eraseCircles() {
  if (textDisplayed == 4) {
    const circles = document.getElementsByClassName("circle");
    anime({
      targets: circles,
      scale: 0,
      duration: 2000
    });

    setTimeout(secondScreen, 3000)
  }
}

function onHoverCircle(event) {
  circle = event.target;
  circle.isHover = !circle.isHover;
  rotate = anime.random(0, 90);
  
  if (circle.isHover) {
    let p = circle.children[0];
    p.style = `display: block; transform: rotate(-${rotate}deg)`

    anime({
      targets: circle,
      translateY: -200,
      borderRadius: () => {
        return anime.random(25,50);
      },
      rotate: rotate,
      scale: 1.5
    });

    textDisplayed += 1;
  }

  if (!circle.isHover) {
    let p = circle.children[0];
    p.style = "display: none;"

    anime({
      targets: circle,
      translateY: 0,
      borderRadius: 50,
      rotate: 0,
      scale: 1
    });

    textDisplayed -= 1;
  }

  if ( textDisplayed == 4 ) {
    setTimeout(eraseCircles, 2000);
  }
  if (textDisplayed != 4 ) {
    let p = document.getElementsByClassName("background-text")[0];
    
    anime({
      targets: p,
      color:   "#fff",
      duration: 5000
    });
  }
}

function eraseSkills() {
  let python = document.getElementsByClassName("skill")[0];
  let js = document.getElementsByClassName("skill")[1];

  let pythonSkills = document.getElementsByClassName("skills")[0];
  let jsSkills = document.getElementsByClassName("skills")[1];

  let arrows = document.getElementsByClassName("arrows")[0];

  anime({
    targets: [python, js, pythonSkills, jsSkills, arrows],
    easing: 'easeOutExpo',
    duration: 2500,
    opacity: 0
  });

  setTimeout(thirdScreen, 2500)
}

function hoverCard (event) {
  card = event.target;
  card.isHover = !card.isHover;
  rotate = anime.random(0, 90);
  
  if (card.isHover) {
    anime({
      targets: card,
      translateY: -50,
      scale: 1.2
    });
  }

  if (!card.isHover) {
    anime({
      targets: card,
      translateY: 0,
      scale: 1
    });
  }
}

function unHoverCard (event) {
  card = event.target;
  card.isHover = !card.isHover;

  anime({
    targets: card,
    translateY: 0,
    scale: 1,
  });
}

function discordClick (event) {
  let discord = event.target;
  discord.isClick = !discord.isClick;
  
  let svg = document.getElementById("discord-card-svg");
  let text = document.getElementById("discord-card-nick");

  if (discord.isClick) {
    anime({
      targets: svg,
      duration: 1000,
      opacity: 0
    });

    anime({
      targets: text,
      duration: 1000,
      opacity: 1
    });
  
    setTimeout(() => {
      svg.style = "display: none";
    },1000)
    setTimeout(() => {
      text.style = "display: block";
    },1000)
  }
  
}

function emailClick (event) {
  let email = event.target;
  email.isClick = !email.isClick;
  
  let svg = document.getElementById("email-card-svg");
  let text = document.getElementById("email-card-text");

  if (email.isClick) {
    anime({
      targets: svg,
      duration: 1000,
      opacity: 0
    });

    anime({
      targets: text,
      duration: 1000,
      opacity: 1
    });
  
    setTimeout(() => {
      svg.style = "display: none";
    },1000)
    setTimeout(() => {
      text.style = "display: block";
    },1000)
  }
  
}

function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function eraseCookie(name) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function firstScreen () {
  const wrapper = document.getElementById("wrapper");
  setCookie("page",1)

  colorizeBackgroundText();
  drawCircles(wrapper);
  colorizeCircles();
}

function secondScreen() {
  setCookie("page",2)
  let screen = document.getElementById("first-screen");
  screen.remove();

  screen = document.getElementById("second-screen");
  // Change color background
  document.body.style = "background-color: #2d3436";

  screen.style = "display: block";

  let python = document.getElementsByClassName("skill")[0];
  let js = document.getElementsByClassName("skill")[1];

  let pythonSkills = document.getElementsByClassName("skills")[0];
  let jsSkills = document.getElementsByClassName("skills")[1];

  python.style = "transform: translateX(-500px)";
  js.style = "transform: translateX(500px)";

  pythonSkills.style = "transform: translateY(200px)";
  jsSkills.style = "transform: translateY(200px)";

  anime({
    targets: [python, js, pythonSkills, jsSkills],
    easing: 'easeOutExpo',
    duration: 2500,
    translateY: 0,
    translateX: 0
  });

  window.addEventListener("touchend", eraseSkills);
  window.addEventListener("mousewheel", eraseSkills);
}

function thirdScreen () {
  setCookie("page",3)
  let screen = document.getElementById("first-screen");
  if (screen !== null) {
    screen.remove();
  }

  
  screen = document.getElementById("second-screen");
  screen.remove();

  screen = document.getElementById("third-screen");
  screen.style = "display: block"

  document.body.style = "background-color: #2d3436; overflow: auto";

  let cards = document.getElementsByClassName("social-card");
  anime({
    targets: cards,
    translateX: 500
  });

  anime({
    targets: cards,
    duration: 3000,
    translateX: 0
  });
  for (let i=0; i < cards.length; i++) {
    let card = cards[i];
    card.isHover = false;

    card.addEventListener("mouseenter", hoverCard, false);
    card.addEventListener("mouseleave", unHoverCard, false);
  }

  let discord = document.getElementById("discord-card");
  discord.isClick = false;
  discord.addEventListener("click", discordClick, false);

  let email = document.getElementById("email-card");
  email.isClick = false;
  email.addEventListener("click", emailClick, false);
  
  
}

firstScreen();
