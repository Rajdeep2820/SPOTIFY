console.log("Ho jayegaa!!");

let currentSong = new Audio();

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

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }
    return songs;
}
const playMusic = (track , pause=false)=>{
    // let audio = new Audio("/songs/" + track);
    currentSong.src = "/songs/" + track;
    if(!pause){
    currentSong.play();
    play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML =  decodeURI(track);
    document.querySelector(".startTime").innerHTML = "00:00";
    document.querySelector(".endTime").innerHTML = "00:00";
}
async function main() {

    let songs = await getSongs();
    playMusic(songs[0] , true);

    // Show all the songs inthe playlists.
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
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
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click" , element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })   
    })
     
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

    currentSong.addEventListener("timeupdate" , ()=>{
        console.log(currentSong.currentTime , currentSong.duration);
        document.querySelector(".startTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".endTime").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    }) 

    // Adding event listener to seekbar:
    document.querySelector(".seekbar").addEventListener("click" , (e)=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left =  percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100;
    })

    document.querySelector(".hamburger").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "0";
    })
    document.querySelector(".cross").addEventListener("click" , ()=>{
        document.querySelector(".left").style.left = "-107%";
    })
}

main();


