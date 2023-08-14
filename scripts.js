// scripts.js

// Define apiKey
const apiKey = '7b75ecdd';


// DOM elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const viewFavoritesButton = document.getElementById('viewFavoritesButton');
const mainContent = document.getElementById('mainContent');
const searchResults = document.getElementById('searchResults');
const favoritesList = document.getElementById('favoritesList');
console.log('favoritesList', favoritesList)
const detailsContainer = document.getElementById('movieDetailsContainer');

// Get the base URL of the current environment

if (viewFavoritesButton) {
    console.log('viewFavoritesButton', viewFavoritesButton)
    viewFavoritesButton.addEventListener('click', () => {
        window.location.href = 'my-favorites.html';
    });
}

// Add event listener on my-favorites.html
if (window.location.pathname === '/my-favorites.html') {
    document.addEventListener('DOMContentLoaded', () => {
        const favorites = JSON.parse(sessionStorage.getItem('favorites')) || [];
        console.log('fav', favorites);
        displayFavorites(favorites);
    });
}

let searchTimeout;

// Function to search movies
async function searchMovies() {
    const searchTerm = searchInput.value;

    // Clear the previous timeout to prevent unnecessary requests
    clearTimeout(searchTimeout);

    // Delay the search by a short duration to wait for user input
    searchTimeout = setTimeout(async () => {
        console.log('check 1')
        const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${searchTerm}`);
        console.log('response', response)
        const data = await response.json();
        console.log('Data:', data)

        mainContent.innerHTML = '';

        if (data.Search) {
            data.Search.forEach(movie => {
                const movieElement = createMovieElement(movie, true);
                mainContent.appendChild(movieElement);
            });
        }
    }, 300); // Adjust the delay duration as needed
}
// Add event listeners
if (searchButton) {
    searchButton.addEventListener('click', searchMovies);
}

// Add event listener for keyup and Enter key press
if(searchInput){
searchInput.addEventListener('keyup', searchMovies);
// Listen for Enter key press and trigger search
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        searchMovies();
    }
});
}


// Function to create a movie element
function createMovieElement(movie, isSearchResult) {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie');
    movieElement.innerHTML = `
        <h3>${movie.Title}</h3>
        <img src="${movie.Poster}" alt="${movie.Title}">
        <button class="add-to-favorites">Add to Favorites</button>
        <button class="view-details">View Details</button>
    `;

    const addToFavoritesBtn = movieElement.querySelector('.add-to-favorites');
    addToFavoritesBtn.addEventListener('click', () => {
        addToFavorites(movie, addToFavoritesBtn, isSearchResult);
    });

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log('favorites>>>>>>', favorites);
    if (favorites.some(favMovie => favMovie.imdbID === movie.imdbID)) {
        addToFavoritesBtn.textContent = 'Added to Favorites';
        addToFavoritesBtn.disabled = true;
    }

    const viewDetailsBtn = movieElement.querySelector('.view-details');
    console.log('viewDetails', viewDetailsBtn);
    viewDetailsBtn.addEventListener('click', () => {
        window.location.href = `movie-details.html?id=${movie.imdbID}`;
    });

    return movieElement;
}

// Add event listener on movie-details.html
if (window.location.pathname.includes('/movie-details.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        viewMovieDetails();
    });
}

// Function to add a movie to favorites
function addToFavorites(movie, button, isSearchResult) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    console.log('favorites', favorites)
    const isAlreadyAdded = favorites.some(favMovie => favMovie.imdbID === movie.imdbID);

    if (!isAlreadyAdded) {
        favorites.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        button.textContent = 'Added to Favorites';
        button.disabled = true;

        if (!isSearchResult) {
            displayFavorites(favorites);
        }
    }
}

// Function to display favorites
function displayFavorites(favorites) {
    console.log('favorites-----', favorites);
    favoritesList.innerHTML = '';

    if (favorites.length > 0) {
        favorites.forEach(movie => {
            const favoriteMovieElement = createFavoriteMovieElement(movie);
            favoritesList.appendChild(favoriteMovieElement);
        });
    } else {
        favoritesList.innerHTML = '<p>You have no favorite movies.</p>';
    }
}

// Function to create a favorite movie element
function createFavoriteMovieElement(movie) {
    const favoriteMovieElement = document.createElement('div');
    favoriteMovieElement.classList.add('movie');
    favoriteMovieElement.innerHTML = `
        <h3>${movie.Title}</h3>
        <img src="${movie.Poster}" alt="${movie.Title}">
        <button class="remove-from-favorites">Remove from Favorites</button>
    `;

    const removeFromFavoritesBtn = favoriteMovieElement.querySelector('.remove-from-favorites');
    removeFromFavoritesBtn.addEventListener('click', () => {
        removeFromFavorites(movie, favoriteMovieElement);
    });

    return favoriteMovieElement;
}

// Function to remove a movie from favorites
function removeFromFavorites(movie, element) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const updatedFavorites = favorites.filter(favMovie => favMovie.imdbID !== movie.imdbID);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));

    element.remove();
}

// Function to view movie details
async function viewMovieDetails() {
    const queryParams = new URLSearchParams(window.location.search);
    const movieId = queryParams.get('id');

    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`);
    const movieDetails = await response.json();

    detailsContainer.innerHTML = `
        <h2>${movieDetails.Title}</h2>
        <img src="${movieDetails.Poster}" alt="${movieDetails.Title}">
        <p><strong>Year:</strong> ${movieDetails.Year}</p>
        <p><strong>Rated:</strong> ${movieDetails.Rated}</p>
        <p><strong>Released:</strong> ${movieDetails.Released}</p>
        <p><strong>Runtime:</strong> ${movieDetails.Runtime}</p>
        <p><strong>Genre:</strong> ${movieDetails.Genre}</p>
        <p><strong>Plot:</strong> ${movieDetails.Plot}</p>
    `;
}
