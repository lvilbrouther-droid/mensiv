import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue
}
from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ_auFW7Ghu1O-A8u3wpOVuQOvw8XU3e0",
  authDomain: "mensive-f840b.firebaseapp.com",
  databaseURL: "https://mensive-f840b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mensive-f840b",
  storageBucket: "mensive-f840b.firebasestorage.app",
  messagingSenderId: "1045875088944",
  appId: "1:1045875088944:web:9f28379bbc33a0aeaf97f5",
  measurementId: "G-T3NJXMG3DZ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


const addStickerBtn = document.getElementById("addStickerBtn");
const stickerPicker = document.getElementById("stickerPicker");
const stickerContainer = document.getElementById("sticker-container");

addStickerBtn.addEventListener("click", () => {
  stickerPicker.classList.toggle("hidden");
});

const stickers = document.querySelectorAll(".pick-sticker");

let selectedSticker = null;
let canPlaceSticker = false;

stickers.forEach((sticker) => {
  sticker.addEventListener("click", () => {
    selectedSticker = sticker.src;
    stickerPicker.classList.add("hidden");

    alert("Klik di mana saja untuk menaruh stikernya!");
  });
});

const slide1 = document.getElementById("slide1");

slide1.addEventListener("pointerdown", async (e) => {

  if (!selectedSticker) return;

  const size = window.innerWidth * 0.18;

  await push(
    ref(db, "stickers"),
    {
      src: selectedSticker,
      x: e.offsetX - size / 2,
      y: e.offsetY - size / 2
    }
  );

  selectedSticker = null;
});

function renderStickers() {

  onValue(ref(db, "stickers"), (snapshot) => {

    stickerContainer.innerHTML = "";

    if (!snapshot.exists()) return;

    snapshot.forEach((child) => {

      const sticker = child.val();

      const img = document.createElement("img");

      img.src = sticker.src;
      img.className = "sticker";

      img.style.left = sticker.x + "px";
      img.style.top = sticker.y + "px";

      stickerContainer.appendChild(img);

    });

  });

}

const playBtn = document.getElementById("playBtn");
const song = document.getElementById("song");

playBtn.addEventListener("click", () => {
  if (song.paused) {
    song.play();

    // optional: kasih class saat sedang play
    playBtn.classList.add("playing");
  } else {
    song.pause();
    playBtn.classList.remove("playing");
  }
});

playBtn.addEventListener("dblclick", () => {
  window.open(
    "https://open.spotify.com/playlist/6Y5aXzEt2VH4QxYBcZJDOy?si=lOR-7yKGQ-uY2KVfv3I4XQ&pt=d7bb5204fe3a69ef26aae015e71c927a",
    "_blank"
  );
});

song.addEventListener("ended", () => {
  playBtn.classList.remove("playing");
});

const slide3 = document.getElementById("slide3");
const slide4 = document.getElementById("slide4");
const letterForm = document.getElementById("letterForm");

document.getElementById("openLettersBtn").onclick = function () {
  document.getElementById("slide4").style.display = "block";
};

document.getElementById("addLetterBtn")
.addEventListener("click", () => {
  letterForm.style.display = "block";
});

document.getElementById("closeFormBtn")
.addEventListener("click", () => {
  letterForm.style.display = "none";
});

document.getElementById("backBtn")
.addEventListener("click", () => {
  slide4.style.display = "none";
});

let letters = [];

async function saveLetter() {

  const name = document.getElementById("senderName").value.trim();
  const message = document.getElementById("letterMessage").value.trim();

  if (!name || !message) {
    alert("Isi surat dan nama dulu ya 💖");
    return;
  }

  try {

    await push(ref(db, "letters"), {
      name: name,
      message: message,
      time: Date.now()
    });

    document.getElementById("senderName").value = "";
    document.getElementById("letterMessage").value = "";

    document.getElementById("successPopup").style.display = "flex";

  } catch (error) {

    console.error(error);
    alert(error.message);

  }

}

function renderLetters() {

  const list = document.getElementById("lettersContainer");

  onValue(ref(db, "letters"), (snapshot) => {

    list.innerHTML = "";
    letters = [];

    if (!snapshot.exists()) return;

    snapshot.forEach((child) => {

      letters.unshift({
        id: child.key,
        ...child.val()
      });

    });

    letters.forEach((letter, index) => {

      list.innerHTML += `
        <div class="letter-item" onclick="openPopup(${index})">

          <div class="letter-name">${letter.name}</div>

          <img
            src="images/envelope.png"
            class="letter-envelope">

        </div>
      `;

    });

  });

}

function openPopup(index) {

  document.getElementById("popupLetter").style.display = "flex";

  document.getElementById("popupName").innerText =
    letters[index].name;

  document.getElementById("popupMessage").innerText =
    letters[index].message;

}

window.openPopup = openPopup;

    document.getElementById("sendLetterForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      saveLetter();
});

document.getElementById("closePopupBtn")
.addEventListener("click", () => {
  document.getElementById("popupLetter")
    .style.display = "none";
});

document.getElementById("successBtn")
.addEventListener("click", () => {

  document.getElementById("successPopup")
    .style.display = "none";

  letterForm.style.display = "none";
});

renderLetters();
renderStickers();