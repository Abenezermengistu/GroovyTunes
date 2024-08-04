const clientId = 'd463059008b74f68acdbbd43f3b9d59c';
const clientSecret = 'd804555417c748cc9748cb223d871b7a';
let accessToken = '';

const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const playlistElement = document.getElementById('playlist');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');
const songDetailsElement = document.getElementById('song-details');
const backwardButton = document.getElementById('backward-button');
const forwardButton = document.getElementById('forward-button');

// Get access token from Spotify API
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  accessToken = data.access_token;
}

getAccessToken();

// Event listener for the search input
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  if (query) {
    fetchSuggestions(query);
  } else {
    searchSuggestions.innerHTML = '';
  }
});

// Fetch search suggestions from Spotify API
async function fetchSuggestions(query) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    if (data.tracks.items.length > 0) {
      displaySuggestions(data.tracks.items);
    } else {
      searchSuggestions.innerHTML = '';
    }
  } catch (error) {
    console.error('Error fetching data from Spotify API:', error);
  }
}

// Display search suggestions with images and no text decoration
function displaySuggestions(tracks) {
    searchSuggestions.innerHTML = '';
    tracks.forEach((track) => {
      const suggestionElement = document.createElement('li');
  
      suggestionElement.innerHTML = `
        <img src="${track.album.images[1].url}" alt="${track.album.name}">
        <p>${track.name} - ${track.artists[0].name}</p>
      `;
  
      suggestionElement.addEventListener('click', () => {
        loadPlaylist(track.name); // Load the playlist for the selected suggestion
        searchInput.value = track.name;
        searchSuggestions.innerHTML = '';
      });
  
      searchSuggestions.appendChild(suggestionElement);
    });
  }
  
// Load the playlist with a 4x4 grid layout
function loadPlaylist(query) {
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=16`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => response.json())
    .then(data => {
      const tracks = data.tracks.items;
      playlistElement.innerHTML = ''; // Ensure we are updating the correct element
      tracks.forEach((track) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'playlist-item';
        
        trackElement.innerHTML = `
          <img src="${track.album.images[1].url}" alt="${track.album.name}">
          <div class="track-info">
            <p><strong>${track.name}</strong></p>
            <p>${track.artists[0].name}</p>
          </div>
        `;
        
        trackElement.addEventListener('click', () => {
          playTrack(track);
        });
        
        playlistElement.appendChild(trackElement);
      });
  
      // Automatically play the first track if any
      if (tracks.length > 0) {
        playTrack(tracks[0]);
      }
    })
    .catch(error => console.error('Error fetching playlist:', error));
  }
  
  
// Function to play a selected track
function playTrack(track) {
    const audioPlayer = document.getElementById('audio-player');
    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerImages = document.getElementById('player-images'); // Assuming you have an image element with this ID

    audioPlayer.src = track.preview_url; // Example: Use preview_url or another property for playable URL
    audioPlayer.play();

    playerTitle.textContent = track.name;
    playerArtist.textContent = track.artists[0].name;
    playerImages.src = track.album.images[0].url;  // Correct way to set image source
    playerImages.alt = track.album.name; // Set alt text for accessibility

    displaySongDetails(track);
}

  

// Search for music using Spotify API
async function searchMusic(query) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const data = await response.json();
    if (data.tracks.items.length > 0) {
      loadPlaylist(data.tracks.items);
    } else {
      alert('No results found');
    }
  } catch (error) {
    console.error('Error fetching data from Spotify API:', error);
  }
}


// Display the track details
function displayTrackDetails(track) {
  songDetailsElement.innerHTML = `
    <img src="${track.album.images[0].url}" alt="${track.album.name}">
    <p><strong>Song:</strong> ${track.name}</p>
    <p><strong>Artist:</strong> ${track.artists[0].name}</p>
    <p><strong>Album:</strong> ${track.album.name}</p>
    <p><strong>Release Date:</strong> ${track.album.release_date}</p>
    <p><strong>Duration:</strong> ${(track.duration_ms / 60000).toFixed(2)} minutes</p>
    <p><strong>Spotify URL:</strong> <a href="${track.external_urls.spotify}" target="_blank">Open in Spotify</a></p>
  `;
}

// Event listener for backward button
backwardButton.addEventListener('click', () => {
  audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
});

// Event listener for forward button
forwardButton.addEventListener('click', () => {
  audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
});

