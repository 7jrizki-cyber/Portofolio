let songs = [];
let currentIndex = -1;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

const audio = document.getElementById("audio");
const folderInput = document.getElementById("folderInput");

if (folderInput) {
  folderInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);

    console.log("File dipilih:", files);

    if (!files.length) {
      return;
    }

    const audioFiles = files.filter((file) => {
      return (
        file.type.startsWith("audio/") ||
        /\.(mp3|wav|ogg|m4a|aac|flac|webm)$/i.test(file.name)
      );
    });

    console.log("Audio ditemukan:", audioFiles);

    if (!audioFiles.length) {
      alert("Tidak ada file musik ditemukan.");
      return;
    }

    songs = audioFiles.map((file) => {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .trim();

      return {
        name: cleanName,
        artist: "Unknown Artist",
        album: "Unknown Album",
        file: file,
        url: URL.createObjectURL(file),
        favorite: false
      };
    });

    console.log("Songs:", songs);

    alert(`${songs.length} lagu berhasil diimport!`);
  });
}

/* =========================================================
   CREATE SONG OBJECT
   ========================================================= */

function createSongFromFile(file) {

  const originalName = file.name;

  const cleanName = originalName
    .replace(/\.[^/.]+$/, "")
    .trim();

  let artist = "Unknown Artist";
  let songName = cleanName;

  /*
     Format yang didukung:

     Artist - Song.mp3

     Contoh:

     YOASOBI - Idol.mp3
  */

  if (cleanName.includes(" - ")) {

    const parts = cleanName.split(" - ");

    artist = parts.shift().trim();

    songName = parts.join(" - ").trim();

  }


  return {

    id: crypto.randomUUID(),

    name: songName,

    artist: artist,

    album: "Unknown Album",

    file: file,

    url: URL.createObjectURL(file),

    favorite: false

  };

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderEverything() {

  const filteredSongs = getFilteredSongs();

  renderHome(filteredSongs);

  renderDiscover(filteredSongs);

  renderFavorites(filteredSongs);

  renderLibrary(filteredSongs);

  renderAlbums(filteredSongs);

  renderArtists(filteredSongs);

  trackCount.textContent =
    `${songs.length} TRACK${songs.length === 1 ? "" : "S"}`;

  updatePlayerUI();

}


/* =========================================================
   SEARCH
   ========================================================= */

function getFilteredSongs() {

  const query =
    searchInput.value.trim().toLowerCase();

  if (!query) {

    return [...songs];

  }

  return songs.filter((song) => {

    return (

      (song.name || "").toLowerCase().includes(query) ||

      (song.artist || "").toLowerCase().includes(query) ||

      (song.album || "").toLowerCase().includes(query)

    );

  });

}


searchInput.addEventListener("input", () => {

  renderEverything();

});


/* =========================================================
   SONG ELEMENT
   ========================================================= */

function createSongElement(song, index) {

  const wrapper =
    document.createElement("div");

  wrapper.className = "track-row";


  if (index === currentIndex) {

    wrapper.classList.add("current");

  }


  const number =
    String(index + 1).padStart(2, "0");

  const isFavorite =
    song.favorite === true;


  wrapper.innerHTML = `

    <div class="track-number">
      ${number}
    </div>

    <button
      class="track-play"
      type="button"
      data-action="play"
    >
      ${index === currentIndex && isPlaying ? "Ⅱ" : "▶"}
    </button>

    <div class="track-main">

      <strong class="track-name">
        ${escapeHtml(song.name || "Untitled")}
      </strong>

      <span>
        ${escapeHtml(song.artist || "Unknown Artist")}
      </span>

    </div>

    <div class="track-album">
      ${escapeHtml(song.album || "Unknown Album")}
    </div>

    <button
      class="track-favorite ${isFavorite ? "active" : ""}"
      type="button"
      data-action="favorite"
    >
      ${isFavorite ? "♥" : "♡"}
    </button>

    <button
      class="track-delete"
      type="button"
      data-action="delete"
      title="Delete song"
    >
      ×
    </button>

  `;


  wrapper
    .querySelector('[data-action="play"]')
    .addEventListener("click", async (event) => {

      event.stopPropagation();

      await playSong(index);

    });


  wrapper
    .querySelector('[data-action="favorite"]')
    .addEventListener("click", (event) => {

      event.stopPropagation();

      toggleFavorite(song);

    });


  wrapper
    .querySelector('[data-action="delete"]')
    .addEventListener("click", (event) => {

      event.stopPropagation();

      deleteSong(song);

    });


  wrapper.addEventListener("dblclick", async () => {

    await playSong(index);

  });


  return wrapper;

}


/* =========================================================
   HOME
   ========================================================= */

function renderHome(list) {

  homeTracks.innerHTML = "";

  if (!list.length) {

    homeTracks.innerHTML =
      emptyState(
        "NO MUSIC YET",
        "Import a folder containing your music files."
      );

    return;

  }


  list
    .slice(0, 10)
    .forEach((song) => {

      const realIndex =
        songs.findIndex(
          (item) => item.id === song.id
        );

      homeTracks.appendChild(
        createSongElement(song, realIndex)
      );

    });

}


/* =========================================================
   DISCOVER
   ========================================================= */

function renderDiscover(list) {

  discoverTracks.innerHTML = "";

  if (!list.length) {

    discoverTracks.innerHTML =
      emptyState(
        "NOTHING TO DISCOVER",
        "Import some music first."
      );

    return;

  }


  const shuffled = [...list];

  shuffleArray(shuffled);


  shuffled.forEach((song) => {

    const realIndex =
      songs.findIndex(
        (item) => item.id === song.id
      );

    discoverTracks.appendChild(
      createSongElement(song, realIndex)
    );

  });

}


/* =========================================================
   FAVORITES
   ========================================================= */

function renderFavorites(list) {

  favoriteTracks.innerHTML = "";

  const favorites =
    list.filter(
      (song) => song.favorite === true
    );


  if (!favorites.length) {

    favoriteTracks.innerHTML =
      emptyState(
        "NO FAVORITES",
        "Press the heart icon to save your favorite songs."
      );

    return;

  }


  favorites.forEach((song) => {

    const realIndex =
      songs.findIndex(
        (item) => item.id === song.id
      );

    favoriteTracks.appendChild(
      createSongElement(song, realIndex)
    );

  });

}


/* =========================================================
   LIBRARY
   ========================================================= */

function renderLibrary(list) {

  libraryTracks.innerHTML = "";

  if (!list.length) {

    libraryTracks.innerHTML =
      emptyState(
        "LIBRARY EMPTY",
        "Import your music folder to get started."
      );

    return;

  }


  list.forEach((song) => {

    const realIndex =
      songs.findIndex(
        (item) => item.id === song.id
      );

    libraryTracks.appendChild(
      createSongElement(song, realIndex)
    );

  });

}


/* =========================================================
   ALBUMS
   ========================================================= */

function renderAlbums(list) {

  albumGrid.innerHTML = "";

  const albums = {};


  list.forEach((song) => {

    const album =
      song.album || "Unknown Album";

    if (!albums[album]) {

      albums[album] = [];

    }

    albums[album].push(song);

  });


  const albumNames =
    Object.keys(albums);


  if (!albumNames.length) {

    albumGrid.innerHTML =
      emptyState(
        "NO ALBUMS",
        "Your albums will appear here."
      );

    return;

  }


  albumNames.forEach((album) => {

    const card =
      document.createElement("div");

    card.className = "music-card";


    card.innerHTML = `

      <div class="music-card-art">
        ◇
      </div>

      <div class="music-card-info">

        <strong>
          ${escapeHtml(album)}
        </strong>

        <span>
          ${albums[album].length} tracks
        </span>

      </div>

    `;


    albumGrid.appendChild(card);

  });

}


/* =========================================================
   ARTISTS
   ========================================================= */

function renderArtists(list) {

  artistGrid.innerHTML = "";

  const artists = {};


  list.forEach((song) => {

    const artist =
      song.artist || "Unknown Artist";

    if (!artists[artist]) {

      artists[artist] = 0;

    }

    artists[artist]++;

  });


  const artistNames =
    Object.keys(artists);


  if (!artistNames.length) {

    artistGrid.innerHTML =
      emptyState(
        "NO ARTISTS",
        "Artists will appear here after you import music."
      );

    return;

  }


  artistNames.forEach((artist) => {

    const card =
      document.createElement("div");

    card.className = "artist-card";


    card.innerHTML = `

      <div class="artist-avatar">
        ${escapeHtml(
          artist.charAt(0).toUpperCase()
        )}
      </div>

      <strong>
        ${escapeHtml(artist)}
      </strong>

      <span>
        ${artists[artist]}
        ${artists[artist] === 1 ? "track" : "tracks"}
      </span>

    `;


    artistGrid.appendChild(card);

  });

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function emptyState(title, description) {

  return `

    <div class="empty-state">

      <div class="empty-symbol">
        ◇
      </div>

      <strong>
        ${escapeHtml(title)}
      </strong>

      <span>
        ${escapeHtml(description)}
      </span>

    </div>

  `;

}


/* =========================================================
   PLAYER
   ========================================================= */

async function playSong(index) {

  if (
    index < 0 ||
    index >= songs.length
  ) {

    return;

  }


  const song =
    songs[index];


  if (!song.url) {

    alert("File lagu tidak ditemukan.");

    return;

  }


  currentIndex = index;

  audio.src = song.url;

  audio.load();

  updatePlayerUI();


  try {

    await audio.play();

    isPlaying = true;

    updatePlayButtons();

    renderEverything();

  } catch (error) {

    console.error(
      "PLAY ERROR:",
      error
    );

    alert(
      "Lagu tidak bisa diputar."
    );

  }

}


/* =========================================================
   TOGGLE PLAY
   ========================================================= */

async function togglePlay() {

  if (currentIndex === -1) {

    if (songs.length) {

      await playSong(0);

    }

    return;

  }


  if (audio.paused) {

    try {

      await audio.play();

      isPlaying = true;

    } catch (error) {

      console.error(error);

    }

  } else {

    audio.pause();

    isPlaying = false;

  }


  updatePlayButtons();

  renderEverything();

}


playBtn.addEventListener(
  "click",
  togglePlay
);

bottomPlay.addEventListener(
  "click",
  togglePlay
);


/* =========================================================
   NEXT
   ========================================================= */

async function nextSong() {

  if (!songs.length) {

    return;

  }


  let nextIndex;


  if (isShuffle) {

    nextIndex =
      Math.floor(
        Math.random() * songs.length
      );


    if (
      songs.length > 1 &&
      nextIndex === currentIndex
    ) {

      nextIndex =
        (nextIndex + 1) % songs.length;

    }

  } else {

    nextIndex =
      currentIndex + 1;


    if (
      nextIndex >= songs.length
    ) {

      nextIndex = 0;

    }

  }


  await playSong(nextIndex);

}


nextBtn.addEventListener(
  "click",
  nextSong
);

bottomNext.addEventListener(
  "click",
  nextSong
);


/* =========================================================
   PREVIOUS
   ========================================================= */

async function previousSong() {

  if (!songs.length) {

    return;

  }


  let previousIndex =
    currentIndex - 1;


  if (previousIndex < 0) {

    previousIndex =
      songs.length - 1;

  }


  await playSong(previousIndex);

}


prevBtn.addEventListener(
  "click",
  previousSong
);

bottomPrev.addEventListener(
  "click",
  previousSong
);


/* =========================================================
   SHUFFLE
   ========================================================= */

shuffleBtn.addEventListener(
  "click",
  () => {

    isShuffle = !isShuffle;

    shuffleBtn.classList.toggle(
      "active",
      isShuffle
    );

  }
);


/* =========================================================
   REPEAT
   ========================================================= */

repeatBtn.addEventListener(
  "click",
  () => {

    isRepeat = !isRepeat;

    repeatBtn.classList.toggle(
      "active",
      isRepeat
    );

  }
);


/* =========================================================
   AUDIO EVENTS
   ========================================================= */

audio.addEventListener(
  "ended",
  async () => {

    if (isRepeat) {

      audio.currentTime = 0;

      try {

        await audio.play();

      } catch (error) {

        console.error(error);

      }

      return;

    }


    await nextSong();

  }
);


audio.addEventListener(
  "play",
  () => {

    isPlaying = true;

    updatePlayButtons();

  }
);


audio.addEventListener(
  "pause",
  () => {

    isPlaying = false;

    updatePlayButtons();

  }
);


audio.addEventListener(
  "loadedmetadata",
  () => {

    duration.textContent =
      formatTime(audio.duration);

    progress.value = 0;

  }
);


audio.addEventListener(
  "timeupdate",
  () => {

    if (!audio.duration) {

      return;

    }


    progress.value =
      (audio.currentTime /
        audio.duration) * 100;


    currentTime.textContent =
      formatTime(audio.currentTime);

  }
);


/* =========================================================
   PROGRESS
   ========================================================= */

progress.addEventListener(
  "input",
  () => {

    if (!audio.duration) {

      return;

    }


    audio.currentTime =
      (progress.value / 100) *
      audio.duration;

  }
);


/* =========================================================
   VOLUME
   ========================================================= */

audio.volume =
  Number(volume.value);


volume.addEventListener(
  "input",
  () => {

    audio.volume =
      Number(volume.value);

  }
);


/* =========================================================
   PLAYER UI
   ========================================================= */

function updatePlayerUI() {

  if (
    currentIndex < 0 ||
    !songs[currentIndex]
  ) {

    heroTitle.textContent =
      "Select a song";

    heroArtist.textContent =
      "Import your music collection";

    miniTitle.textContent =
      "Nothing playing";

    miniArtist.textContent =
      "—";

    artNumber.textContent =
      "01";

    favoriteBtn.textContent =
      "♡";

    favoriteBtn.classList.remove(
      "active"
    );

    return;

  }


  const song =
    songs[currentIndex];


  heroTitle.textContent =
    song.name || "Untitled";

  heroArtist.textContent =
    song.artist || "Unknown Artist";

  miniTitle.textContent =
    song.name || "Untitled";

  miniArtist.textContent =
    song.artist || "Unknown Artist";

  artNumber.textContent =
    String(currentIndex + 1)
      .padStart(2, "0");


  favoriteBtn.textContent =
    song.favorite ? "♥" : "♡";


  favoriteBtn.classList.toggle(
    "active",
    song.favorite === true
  );

}


/* =========================================================
   PLAY BUTTON UI
   ========================================================= */

function updatePlayButtons() {

  const icon =
    isPlaying ? "Ⅱ" : "▶";

  playBtn.textContent =
    icon;

  bottomPlay.textContent =
    icon;

}


/* =========================================================
   FAVORITE
   ========================================================= */

favoriteBtn.addEventListener(
  "click",
  () => {

    if (
      currentIndex < 0 ||
      !songs[currentIndex]
    ) {

      return;

    }


    toggleFavorite(
      songs[currentIndex]
    );

  }
);


function toggleFavorite(song) {

  song.favorite =
    !Boolean(song.favorite);

  renderEverything();

}


/* =========================================================
   DELETE SONG
   ========================================================= */

function deleteSong(song) {

  const confirmed =
    confirm(
      `Hapus "${song.name}" dari ASTRA MUSIC?`
    );


  if (!confirmed) {

    return;

  }


  const deletedIndex =
    songs.findIndex(
      (item) => item.id === song.id
    );


  if (
    deletedIndex === currentIndex
  ) {

    stopAudio();

    currentIndex = -1;

  } else if (
    deletedIndex < currentIndex
  ) {

    currentIndex--;

  }


  if (song.url) {

    URL.revokeObjectURL(
      song.url
    );

  }


  songs =
    songs.filter(
      (item) => item.id !== song.id
    );


  renderEverything();

}


/* =========================================================
   CLEAR LIBRARY
   ========================================================= */

clearLibrary.addEventListener(
  "click",
  () => {

    if (!songs.length) {

      alert(
        "Library sudah kosong."
      );

      return;

    }


    const confirmed =
      confirm(
        "Hapus SEMUA lagu dari ASTRA MUSIC?"
      );


    if (!confirmed) {

      return;

    }


    songs.forEach((song) => {

      if (song.url) {

        URL.revokeObjectURL(
          song.url
        );

      }

    });


    stopAudio();

    songs = [];

    currentIndex = -1;

    renderEverything();

    libraryStatus.textContent =
      "LIBRARY READY";

  }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

document
  .querySelectorAll(".nav-item")
  .forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        switchPage(
          button.dataset.page
        );

      }
    );

  });


function switchPage(page) {

  document
    .querySelectorAll(".nav-item")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.page === page
      );

    });


  document
    .querySelectorAll(".page")
    .forEach((section) => {

      section.classList.remove(
        "active-page"
      );

    });


  const target =
    document.getElementById(
      `${page}Page`
    );


  if (target) {

    target.classList.add(
      "active-page"
    );

  }


  pageTitle.textContent =
    page.toUpperCase();


  if (accountMenu) {

    accountMenu.classList.remove(
      "show"
    );

  }

}


/* =========================================================
   ACCOUNT BUTTON
   ========================================================= */

if (accountButton && accountMenu) {

  accountButton.addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      accountMenu.classList.toggle(
        "show"
      );

    }
  );


  document.addEventListener(
    "click",
    (event) => {

      if (
        !accountMenu.contains(
          event.target
        ) &&
        !accountButton.contains(
          event.target
        )
      ) {

        accountMenu.classList.remove(
          "show"
        );

      }

    }
  );

}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  async (event) => {

    if (
      event.target.tagName === "INPUT" ||
      event.target.tagName === "TEXTAREA"
    ) {

      return;

    }


    if (event.code === "Space") {

      event.preventDefault();

      await togglePlay();

    }


    if (
      event.code === "ArrowRight"
    ) {

      await nextSong();

    }


    if (
      event.code === "ArrowLeft"
    ) {

      await previousSong();

    }

  }
);


/* =========================================================
   UTILITIES
   ========================================================= */

function formatTime(seconds) {

  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {

    return "0:00";

  }


  const minutes =
    Math.floor(seconds / 60);

  const secondsLeft =
    Math.floor(seconds % 60);


  return (
    `${minutes}:` +
    `${String(secondsLeft).padStart(2, "0")}`
  );

}


function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


function shuffleArray(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      array[i],
      array[j]
    ] = [
      array[j],
      array[i]
    ];

  }

  return array;

}


/* =========================================================
   STOP AUDIO
   ========================================================= */

function stopAudio() {

  audio.pause();

  audio.currentTime = 0;

  audio.removeAttribute("src");

  audio.load();

  isPlaying = false;

  updatePlayButtons();

  currentTime.textContent =
    "0:00";

  duration.textContent =
    "0:00";

  progress.value = 0;

}


/* =========================================================
   START
   ========================================================= */

updatePlayButtons();

renderEverything();
