console.log("animation started");

let delay = 200; // Ajustez le délai selon vos besoins
let createdCount = 0; // Compteur pour suivre le nombre d'éléments créés

function createLetterS() {
  if (createdCount < 6) {
    const letters_S = document.createElement("span");
    letters_S.className = "letter_s"; // Supprimez le point dans le nom de la classe
    letters_S.textContent = "s";
    document.querySelector(".pixel-art-text").appendChild(letters_S);
    createdCount++;

    // Répétez la création jusqu'à ce que les 7 éléments soient créés
    setTimeout(createLetterS, delay);
  }
}

createLetterS(); // Commencez la création des éléments

function meltLetters() {
  const meltDiv = document.createElement("div");
  meltDiv.className = "letter";
  meltDiv.textContent = "s";

  setTimeout(() => {
    const letters = document.querySelectorAll(".letter_s");
    console.log(letters.length);
    for (let i = 0; i < 7; i++) {
      setTimeout(() => {
        if (i === 6) {
          // À la dernière itération, remplacez les lettres par le 's' fondu
          letters.forEach((letter) => {
            letter.remove();
          });
          setTimeout(() => {
            // Ajoutez le 's' fondu après un délai
            document.querySelector(".pixel-art-text").appendChild(meltDiv);
          }, 500);
        } else {
          letters[6 - i].style.opacity = "0";
          letters[6 - i].style.transform = "scale(0)";
        }
      }, 500 * i); // Ajustez le délai selon vos besoins (500 ms par lettre)
    }
  }, 1000); // Attendez un peu plus longtemps pour que tous les éléments soient créés
}
setTimeout(meltLetters, 1200); // Retardez le début de l'animation de fusion des 's'
