let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutes(seconds) {
  // Check if seconds is a valid number
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "00:00"; // Default value or handle the case as per your requirement
  }

  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // Pad single digit seconds with leading zero
  if (remainingSeconds < 10) {
    remainingSeconds = "0" + remainingSeconds;
  }

  return `${minutes}:${remainingSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the songs in the playlist
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      ` <li>
   <img class="invert" src="img/music.svg" alt="" />
   <div class="info">
     <div class="songName">${song.replaceAll("%20", " ")}</div>
     <div class="artist">Artist</div>
   </div>
   <div class="playNow">
     <img
       class="invert"
       src="img/circle-play-regular (1).svg"
       alt=""
     />
   </div>
 </li`;
  }

  //  Attach an Event listener toEach song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(element);
      playMusic(e.querySelector("div").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  console.log();
  if (!pause) {
    currentSong.play();
    mainPlay.src = "img/pause-solid.svg ";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(
    currentSong.src.split("/").slice(-1)
  );
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[1];

      // get the mata data of the folder

      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
      <div class="play">
        <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <!-- Background circle -->
          <circle cx="20" cy="20" r="18" fill="#1DB954" />

          <!-- Play triangle -->
          <polygon points="15,10 30,20 15,30" fill="##1fdf64" />
        </svg>
      </div>
      <img src="/songs/${folder}/cover.png" alt="lol" />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`;
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      document.querySelector(".songinfo").style.opacity = "1";
    });
  });
}

async function main() {
  await getSongs("songs ");
  playMusic(songs[0], true);
  // here we are first accessing songlist ul and then storing them into varible called songUl. after that we use for of loop on songs[cus its arr] and store each song into songLists ul.

  await displayAlbums();

  // Attach an event listener to play, next and prevous);
  mainPlay.addEventListener("click", (e) => {
    if (currentSong.paused) {
      currentSong.play();
      mainPlay.src = "img/pause-solid.svg ";
    } else {
      currentSong.pause();
      mainPlay.src = "img/play-solid.svg";
    }
  });

  // currentSong.addEventListener("timeupdate", () => {});

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )} / ${secondsToMinutes(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // add an evenet listener to the seekbar

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // add an event listern for hameburger

  document.querySelector(".hameburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });

  // add an event listern for close btn
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event listener on prev

  prev.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // add an event listener on next

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 <= songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //  add an event on volume

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // add event listener to mute

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      currentSong.muted = true;
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      currentSong.muted = false;
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
