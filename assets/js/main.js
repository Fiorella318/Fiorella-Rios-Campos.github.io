//SUBMIT FORM
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Stops the 405 error and the refresh

            // We block the button without changing the text
            submitBtn.disabled = true;
            submitBtn.style.cursor = "wait";

            const serviceID = process.env.serviceID; 
            const templateID = process.env.templateID;
           

            emailjs.sendForm(serviceID, templateID, this)
                .then(() => {
                    alert("¡Mensaje enviado con éxito!");
                    contactForm.reset();
                })
                .catch((err) => {
                    alert("Error al enviar: " + JSON.stringify(err));
                    console.error("EmailJS Error:", err);
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.cursor = "pointer";
                });
        });
    }
});


//BELL SOUND
document.addEventListener("DOMContentLoaded", () => {
    const successLabel = document.querySelector(".success-text");
    const sound = document.getElementById("success-sound");

   // We detect when the CSS animation ends
    successLabel.addEventListener("animationend", (event) => {
        // Only if the animation that finished is the 'fadeIn' animation (or the one you use)
        if (event.animationName === "fadeInText" || event.animationName === "fadeIn") {
            sound.volume = 0.75;
            sound.play().catch(error => {
                console.log("El navegador bloqueó el audio automático hasta que el usuario interactúe.");
            });
        }
    });
});

//Extra
document.addEventListener("click", () => {
    const sound = document.getElementById("success-sound");
    // This "wakes up" the browser's audio engine
    sound.play().then(() => {
        sound.pause(); // We paused it quickly, we just want permission
        sound.currentTime = 0;
    }).catch(e => console.log("Audio esperando interacción"));
}, { once: true }); // It only runs the first time they click


//PROJECTS
const bookContainer = document.querySelector("#book-container");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const papers = document.querySelectorAll(".paper");

let currentLocation = 1;
const isMobile = () => window.innerWidth < 1024;

// 1. ORIGINAL TYPING: We save and empty the text at the beginning
const textStorage = new Map();
document.querySelectorAll('.project-description').forEach(el => {
    textStorage.set(el, el.innerText);
    el.innerText = ''; // It is emptied so that the effect starts from scratch.
});

function getMaxLocation() {
    return isMobile() ? (papers.length * 2) : (papers.length + 1);
}

function updateUI() {
    const mobile = isMobile();
    const max = getMaxLocation();

    if (mobile) {
        papers.forEach((paper, i) => {
            const frontFace = paper.querySelector('.front');
            const backFace = paper.querySelector('.back');
            const paperIndex = Math.floor((currentLocation - 1) / 2);
            const isBack = (currentLocation % 2 === 0);

            paper.classList.toggle('active-paper', i === paperIndex);
            if (i === paperIndex) {
                frontFace.classList.toggle('face-active', !isBack);
                backFace.classList.toggle('face-active', isBack);
            }
        });
    } else {
        // Logic book for PC
        if (currentLocation === 1) bookContainer.classList.remove("open");
        else bookContainer.classList.add("open");

        papers.forEach((paper, i) => {
            if (i < currentLocation - 1) {
                paper.classList.add("flipped");
                paper.style.zIndex = i + 1;
            } else {
                paper.classList.remove("flipped");
                paper.style.zIndex = papers.length - i;
            }
        });
    }

    // Button visibility
    prevBtn.classList.toggle("visible", currentLocation > 1);
    nextBtn.classList.toggle("visible", currentLocation < max);
    
    // Trigger typing with a small delay for the transition
    setTimeout(startTypingEffect, mobile ? 100 : 700);
}

// 2. JUMP FUNCTION FOR THE INDEX
function jumpToPage(paperIndex, isBack = false) {
    if (isMobile()) {
        // On mobile, we calculate the exact step (each side is one step)
        // Step 1: Cover (Paper 1 Front)
        // Step 2: Index (Paper 1 Back)
        // Step 3: Project 1 (Paper 2 Front)
        // Step 4: Project 2 (Paper 2 Back) ...
        currentLocation = (paperIndex * 2) - (isBack ? 0 : 1);
    } else {
        
        if (isBack) {
            currentLocation = paperIndex + 1;
        } else {
            currentLocation = paperIndex;
        }
    }
    
    updateUI();
}

function startTypingEffect() {

    
    // We look for the descriptions that should be visible according to the book's condition
    let activeDescs = [];
    
    if (isMobile()) {
        // On Mobile: Only the face that has the face-active class
        activeDescs = document.querySelectorAll('.face-active .project-description');
    } else {
        // ON PC: We select TWO possible visible descriptions:
        // 1. The BACK side of a paper that has already been turned over (Left Page)
        // 2. The FRONT side of the next paper (Right Page)
        
        const allPapers = document.querySelectorAll('.paper');
        allPapers.forEach((paper, index) => {
            const isFlipped = paper.classList.contains('flipped');
            
            // If the paper is turned over, the visible side is the BACK (Left)
            if (isFlipped) {
                const backDesc = paper.querySelector('.back .project-description');
                if (backDesc) activeDescs.push(backDesc);
            } 
            
            // If the role is the NEXT one to the current one (the one at the top right)

            // The current role is 'currentLocation - 1'
            if (index === currentLocation - 1) {
                const frontDesc = paper.querySelector('.front .project-description');
                if (frontDesc) activeDescs.push(frontDesc);
            }
        });
    }

    activeDescs.forEach(el => {
        // We avoid restarting if you are already typing that same text.
        if (el.getAttribute('data-is-typing') === 'true') return;
        runTyping(el);
    });
    
}

function runTyping(el) {
    const fullText = el.getAttribute('data-text'); // We read from the "hidden" attribute
    if (!fullText) return;

    // Total cleaning
    if (el.typingInterval) clearInterval(el.typingInterval);
    el.innerText = '';
    el.setAttribute('data-is-typing', 'true');
    el.classList.add('is-writing', 'typing-cursor');

    let i = 0;
    el.typingInterval = setInterval(() => {
        if (i < fullText.length) {
            el.innerText += fullText.charAt(i);
            i++;
        } else {
            clearInterval(el.typingInterval);
            el.classList.remove('typing-cursor');
            el.setAttribute('data-is-typing', 'false');
        }
    }, 20);
}

function goNextPage() {
    if (currentLocation < getMaxLocation()) {
        currentLocation++;
        updateUI();
    }
}

function goPrevPage() {
    if (currentLocation > 1) {
        currentLocation--;
        updateUI();
    }
}

// 3. KEYBOARD EVENTS
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goNextPage();
    else if (e.key === "ArrowLeft") goPrevPage();
});

nextBtn.addEventListener("click", goNextPage);
prevBtn.addEventListener("click", goPrevPage);

let lastWidth = window.innerWidth;

window.addEventListener('resize', () => {
    // We only act if the width changed (ignores height changes due to navigation bars)
    if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        currentLocation = 1; 
        updateUI();
    }
});

// Initialization
updateUI();


