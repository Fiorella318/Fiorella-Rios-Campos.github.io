// Asegúrate de que esto esté al inicio de tu main.js
(function() {
    emailjs.init("Apcv4V9NQNYRBUbvo"); // Tu Public Key
})();

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Detiene el error 405 y el refresh

            // Bloqueamos el botón sin cambiar el texto
            submitBtn.disabled = true;
            submitBtn.style.cursor = "wait";

            const serviceID = 'service_fzae7xm'; // De tu captura
            const templateID = 'template_7vyh6o8'; // De tu captura

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

document.addEventListener("DOMContentLoaded", () => {
    const successLabel = document.querySelector(".success-text");
    const sound = document.getElementById("success-sound");

    // Detectamos cuando termina la animación de CSS
    successLabel.addEventListener("animationend", (event) => {
        // Solo si la animación que terminó es la de 'fadeIn' (o la que uses)
        if (event.animationName === "fadeInText" || event.animationName === "fadeIn") {
            sound.volume = 0.75; // Ajusta el volumen (0.0 a 1.0)
            sound.play().catch(error => {
                console.log("El navegador bloqueó el audio automático hasta que el usuario interactúe.");
            });
        }
    });
});

// Añade esto a tu JavaScript actual
document.addEventListener("click", () => {
    const sound = document.getElementById("success-sound");
    // Esto "despierta" el motor de audio del navegador
    sound.play().then(() => {
        sound.pause(); // Lo pausamos rápido, solo queremos permiso
        sound.currentTime = 0;
    }).catch(e => console.log("Audio esperando interacción"));
}, { once: true }); // Solo se ejecuta la primera vez que hacen clic


//PROJECTS:
/* --- CONFIGURACIÓN DE PROYECTOS --- */
/* --- PROYECTOS: LÓGICA RESPONSIVA --- */
/* --- CONFIGURACIÓN DE PROYECTOS --- */
/* --- CONFIGURACIÓN DE PROYECTOS COMPLETA --- */
const bookContainer = document.querySelector("#book-container");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const papers = document.querySelectorAll(".paper");

let currentLocation = 1;
const isMobile = () => window.innerWidth < 1024;

// 1. TYPING ORIGINAL: Guardamos y vaciamos textos al inicio
const textStorage = new Map();
document.querySelectorAll('.project-description').forEach(el => {
    textStorage.set(el, el.innerText);
    el.innerText = ''; // Se vacía para que el efecto empiece de cero
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
        // Lógica de libro para PC
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

    // Visibilidad de botones
    prevBtn.classList.toggle("visible", currentLocation > 1);
    nextBtn.classList.toggle("visible", currentLocation < max);
    
    // Disparar typing con un pequeño delay para la transición
    setTimeout(startTypingEffect, mobile ? 100 : 700);
}

// 2. FUNCIÓN JUMP PARA EL INDEX
function jumpToPage(paperIndex, isBack = false) {
    if (isMobile()) {
        // En móvil calculamos el paso exacto (cada cara es un paso)
        // Paso 1: Portada (Paper 1 Front)
        // Paso 2: Index (Paper 1 Back)
        // Paso 3: Proyecto 1 (Paper 2 Front)
        // Paso 4: Proyecto 2 (Paper 2 Back) ...
        currentLocation = (paperIndex * 2) - (isBack ? 0 : 1);
    } else {
        // En PC simplemente vamos a la hoja. 
        // Si la hoja es > 1, el libro se abre automáticamente en updateUI()
        currentLocation = paperIndex;
    }
    
    updateUI();
}

function startTypingEffect() {

    
    // Buscamos las descripciones que deberían estar visibles según el estado del libro
    let activeDescs = [];
    
    if (isMobile()) {
        // En Móvil: Solo la cara que tiene la clase face-active
        activeDescs = document.querySelectorAll('.face-active .project-description');
    } else {
        // EN PC: Seleccionamos DOS posibles descripciones visibles:
        // 1. La cara BACK de un papel que ya se volteó (Página Izquierda)
        // 2. La cara FRONT del papel que sigue (Página Derecha)
        
        const allPapers = document.querySelectorAll('.paper');
        allPapers.forEach((paper, index) => {
            const isFlipped = paper.classList.contains('flipped');
            
            // Si el papel está volteado, la cara visible es la de ATRÁS (Izquierda)
            if (isFlipped) {
                const backDesc = paper.querySelector('.back .project-description');
                if (backDesc) activeDescs.push(backDesc);
            } 
            
            // Si el papel es el SIGUIENTE al actual (el que está arriba a la derecha)
            // El papel actual es 'currentLocation - 1'
            if (index === currentLocation - 1) {
                const frontDesc = paper.querySelector('.front .project-description');
                if (frontDesc) activeDescs.push(frontDesc);
            }
        });
    }

    activeDescs.forEach(el => {
        // Evitamos reiniciar si ya está escribiendo ese mismo texto
        if (el.getAttribute('data-is-typing') === 'true') return;
        runTyping(el);
    });
    
}

function runTyping(el) {
    const fullText = el.getAttribute('data-text'); // Leemos del atributo "escondido"
    if (!fullText) return;

    // Limpieza total
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

// 3. EVENTOS DE TECLADO REPARADOS
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goNextPage();
    else if (e.key === "ArrowLeft") goPrevPage();
});

nextBtn.addEventListener("click", goNextPage);
prevBtn.addEventListener("click", goPrevPage);
window.addEventListener('resize', () => { 
    currentLocation = 1; 
    updateUI(); 
});

// Inicialización
updateUI();


