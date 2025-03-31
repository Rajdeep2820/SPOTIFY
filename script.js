console.log("Ho jayegaa!!");

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
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

    // Show all the songs inthe playlists.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class = "invert" src="music.svg" alt="">
                            <div class="info">
                                <div class="title" >${song.replaceAll("%20", " ")}</div>
                                <div>Rajjoo</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class = "invert" src="play.svg" alt="">
                            </div>    
                        </li>`;
    }
    // attaching an event listener to each song..
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".startTime").innerHTML = "00:00";
    document.querySelector(".endTime").innerHTML = "00:00";
}

async function displayAlbums() {
    console.log("Displaying albums...");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").filter(Boolean).pop(); // Fixes folder extraction

            if (!folder || folder === "songs") {
                console.warn("Skipping invalid folder:", folder);
                continue;
            }

            let a = await fetch(`/songs/${folder}/info.json`);
            if (!a.ok) {
                console.warn(`Metadata not found for ${folder}, skipping...`);
                continue;
            }

            let response = await a.json();
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="54" height="54" fill="none">
                            <circle cx="16" cy="16" r="12" fill="#1bd760" stroke="black" stroke-width="1.5" />
                            <path d="M12 14.9332V17.0668C12 18.9593 12 19.9051 12.567 20.2803C13.134 20.6555 13.911 20.2491 15.3813 19.4748L17.1662 18.5139C18.9999 17.5697 19.9999 17.0576 19.9999 16C19.9999 14.9424 18.9999 14.4303 17.1662 13.4861L15.3813 12.5252C13.911 11.7509 13.134 11.3445 12.567 11.7197C12 12.0949 12 13.0407 12 14.9332Z" fill="black"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="hudhud">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`;
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })
}
async function main() {
    await getSongs("songs/base");
    playMusic(songs[0], true);

    //display all the albums:
    displayAlbums();


    // attach an event litner to play , next and prev songs
    function togglePlayPause(event) {
        if (event.type === "click" || (event.type === "keydown" && event.code === "Space")) {
            event.preventDefault();
            if (currentSong.paused) {
                currentSong.play();
                play.src = "pause.svg";
            } else {
                currentSong.pause();
                play.src = "playbar.svg";
            }
        }
    }
    // Adding the event listener for both events
    play.addEventListener("click", togglePlayPause);
    document.addEventListener("keydown", togglePlayPause);

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".startTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".endTime").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Adding event listener to seekbar:
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-107%";
    })

    prev.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    // adding event listner to change volume:
    document.querySelector(".volseek").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

    document.querySelector(".volume").addEventListener("click", (e) => {
        if (e.target.src.includes("sound.svg")) {
            e.target.src = "mute.svg";
            currentSong.volume = 0;
            document.querySelector(".volseek input").value = 0;
        } else {
            e.target.src = "sound.svg";
            currentSong.volume = 0.1;
            document.querySelector(".volseek input").value = 10;
        }
    });

}
main();


