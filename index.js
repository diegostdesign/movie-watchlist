
const watchlistStored = localStorage.getItem("watchlist-ids");
const mainContainerEl = document.getElementById("main-container")

document.addEventListener("DOMContentLoaded", function () {
    const currentPage = window.location.pathname

    if (currentPage.includes("index.html")) {
        
        document.addEventListener("click", function(e){
            if(e.target.id === "search-btn"){
                const inputElement = document.getElementById("input-movie")
                const inputValue = inputElement.value
                
                if(inputValue){
                    getMovies(inputValue)
                    inputElement.value = ""
                } else {
                    renderDefault()
                }
                
            } else if(e.target.dataset.movie){
                handleWatchListBtn(e.target.dataset.movie, e.target.dataset.click)
            }
            
        })
        renderDefault()
        
    } else if (currentPage.includes("watchlist.html")) {
        
        if (watchlistStored === null || JSON.parse(watchlistStored).length === 0) {
            renderWatchlistDefault()
        } else {
            getWatchlistMovies()
        }
        
        document.addEventListener("click", function (e) {
            if(e.target.dataset.movie){
                handleWatchListBtn(e.target.dataset.movie, e.target.dataset.click)
            }
        })
    }
})

function handleWatchListBtn(watchlistId, clickString){
    
    const isClicked = JSON.parse(clickString.toLowerCase())
    const watchlistIconEl = document.querySelector(`#watchlist-icon[data-movie="${watchlistId}"]`)
    const watchlistParagraphEl = document.querySelector(`#watchlist-paragraph[data-movie="${watchlistId}"]`)
    
    if (!isClicked) {
        watchlistIconEl.classList.remove("fa-circle-plus")
        watchlistIconEl.classList.add("fa-circle-minus")
        watchlistIconEl.setAttribute("data-click", "true")
        watchlistParagraphEl.setAttribute("data-click", "true")
        
        localStorage.setItem(`watchlist-click-state-${watchlistId}`, "true")
        addLocalStorage(watchlistId)
    } else {
        watchlistIconEl.classList.remove("fa-circle-minus")
        watchlistIconEl.classList.add("fa-circle-plus")
        watchlistIconEl.setAttribute("data-click", "false")
        watchlistParagraphEl.setAttribute("data-click", "false")
        
        localStorage.setItem(`watchlist-click-state-${watchlistId}`, "false")
        removeLocalStorage(watchlistId)
    }
}

function addLocalStorage(watchlistId){
    const watchlistArray = getWatchlistArrayFromLocalStorage()

    if (!watchlistArray.includes(watchlistId)) {
        watchlistArray.push(watchlistId)
        localStorage.setItem("watchlist-ids", JSON.stringify(watchlistArray))
    }
}

function removeLocalStorage(watchlistId){
    const watchlistArray = getWatchlistArrayFromLocalStorage()

    const updatedWatchlistArray = watchlistArray.filter(id => id !== watchlistId)
    localStorage.setItem("watchlist-ids", JSON.stringify(updatedWatchlistArray))
}

function getWatchlistArrayFromLocalStorage() {
    const storedWatchlistArray = localStorage.getItem("watchlist-ids")
    return storedWatchlistArray ? JSON.parse(storedWatchlistArray) : []
}

async function getWatchlistMovies(){
    mainContainerEl.innerHTML = ""
    
    const watchlistStored = localStorage.getItem("watchlist-ids")

    if (watchlistStored) {
        const idArr = JSON.parse(watchlistStored)

        for (let movie of idArr) {
            const res = await fetch(`https://www.omdbapi.com/?apikey=f77c98c4&i=${movie}`)
            const data = await res.json()

            const { Title, Runtime, Genre, Plot, Poster, imdbRating } = data
            console.log(data)
            renderCardMovies(Title, Runtime, Genre, Plot, Poster, imdbRating, movie)
        }
    } else {
        renderWatchlistDefault()
    }
}

async function getMovies(input){
    const res = await fetch(`https://www.omdbapi.com/?apikey=f77c98c4&s=${input}`)
    const data = await res.json()
    
    if(data.Response === "False"){
        renderMovieNotFound()
    } else {
        const { Search } = data
        const imdbIds = Search.map(item => item.imdbID)
        getImdbInfo(imdbIds)
    }
}

async function getImdbInfo(imdbIds){
    
    mainContainerEl.innerHTML = ""
    
    for(let movie of imdbIds){
        const res = await fetch(`https://www.omdbapi.com/?apikey=f77c98c4&i=${movie}`)
        const data = await res.json()
    
        const { Title, Runtime, Genre, Plot, Poster, imdbRating } = data 

        renderCardMovies(Title, Runtime, Genre, Plot, Poster, imdbRating, movie)
    }
}

function getClickStateFromLocalStorage(id) {
    const storedClickState = localStorage.getItem(`watchlist-click-state-${id}`)
    return storedClickState !== null ? storedClickState : "false"
}

function renderCardMovies(title, runtime, genre, plot, poster, rating, id){
    const clickState = getClickStateFromLocalStorage(id)
    const iconClasses = clickState === "true" ? "fa-circle-minus" : "fa-circle-plus"

    mainContainerEl.innerHTML += `
        <div id="card" class="card">
        <img src="${poster}" class="movie-poster" alt="movie-poster">
        <div class="card-details">
            <div class="title-info">
                <h2 class="movie-title">${title}</h2>
                <div class="rating">
                    <i class="fa-solid fa-star"></i>
                    <p class="rating-number">${rating}</p>
                </div>
            </div>
            <div class="more-info">
                <p class="duration">${runtime}</p>
                <p class="genres">${genre}</p>
                <div class="watchlist-container">
                    <i id="watchlist-icon" class="fa-solid ${iconClasses}" data-movie="${id}" data-click="${clickState}"></i>
                    <p id="watchlist-paragraph" class="watchlist" data-movie="${id}" data-click="${clickState}">Watchlist</p>
                </div>
            </div>
            <p class="movie-description">${plot}</p>
        </div>
    </div>
    <hr class="separator-line">`
}

function renderMovieNotFound(){
    mainContainerEl.innerHTML = `
        <div id="no-movies-container" class="no-movies">
            <h2 class="start-exploring">Unable to find what you’re looking for. Please try another search.</h2>
        </div>
    `
}

function renderDefault(){
    mainContainerEl.innerHTML = `
        <div id="no-movies-container" class="no-movies">
            <i class="fa-solid fa-film"></i>
            <h2 class="start-exploring">Start exploring</h2>
        </div>
    `
}

function renderWatchlistDefault(){
    mainContainerEl.innerHTML = `
        <div id="no-movies-container" class="no-watchlist">
            <h2 class="empty-watchlist">Your watchlist is looking a little empty...</h2>
            <a href="index.html">
                <div class="add-movies-container">
                    <i class="fa-solid fa-circle-plus"></i>
                    <h3 class="add-movies">Let’s add some movies!</h3>
                </div>
            </a>
        </div>
    `
}