// scripts.js

// Function to handle user signup
document.getElementById('signup-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const response = mockApi.signup(username, email, password);
    alert(response.message);
});

// Function to handle user login
document.getElementById('login-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = mockApi.login(username, password);
    alert(response.message);
    if (response.success) {
        localStorage.setItem('accessToken', response.accessToken);
        // Redirect or update UI
    }
});

// Function to handle music upload
document.getElementById('upload-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const artist = document.getElementById('artist').value;
    const audioFile = document.getElementById('audio').files[0]; // Handle file in real scenario
    const coverArt = document.getElementById('cover').files[0]; // Handle file in real scenario

    const response = mockApi.uploadMusic(title, artist, audioFile, coverArt);
    alert(response.message);
    if (response.success) {
        // Optionally, proceed to distribution
        const platforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(el => el.value);
        const distributionResponse = mockApi.distributeMusic(response.trackId, platforms);
        alert(distributionResponse.message);
        if (distributionResponse.success) {
            // Optionally, show distribution status
            checkDistributionStatus(distributionResponse.statusId);
        }
    }
});

// Function to generate URLs based on selected platforms
document.getElementById('generate-urls')?.addEventListener('click', function() {
    const selectedPlatforms = Array.from(document.querySelectorAll('input[name="platform"]:checked')).map(el => el.value);
    const urlContainer = document.getElementById('url-container');
    urlContainer.innerHTML = ''; // Clear previous URLs

    if (selectedPlatforms.length === 0) {
        urlContainer.innerHTML = '<p>No platforms selected.</p>';
        return;
    }

    selectedPlatforms.forEach(platform => {
        let uploadUrl = '';
        switch (platform) {
            case 'Spotify':
                uploadUrl = 'https://artists.spotify.com/';
                break;
            case 'Apple Music':
                uploadUrl = 'https://artists.apple.com/';
                break;
            case 'Amazon Music':
                uploadUrl = 'https://music.amazon.com/artists/';
                break;
            case 'YouTube Music':
                uploadUrl = 'https://music.youtube.com/upload';
                break;
            default:
                uploadUrl = '#'; // Fallback
        }

        // Create an anchor element for the upload URL
        const link = document.createElement('a');
        link.href = uploadUrl;
        link.target = '_blank'; // Open in new tab
        link.textContent = `Upload to ${platform}`;
        urlContainer.appendChild(link);
        urlContainer.appendChild(document.createElement('br')); // Add a line break for better spacing
    });
});

// Function to check distribution status
function checkDistributionStatus(statusId) {
    const interval = setInterval(() => {
        const response = mockApi.getDistributionStatus(statusId);
        if (response.success) {
            alert(`Distribution Status: ${response.status.status}`);
            if (response.status.status === 'Distributed') {
                clearInterval(interval); // Stop checking when distributed
            }
        } else {
            clearInterval(interval); // Stop checking on error
            alert(response.message);
        }
    }, 1000); // Check every second
}

// Function to display user profile
function displayUserProfile() {
    const userId = getUserIdFromToken(localStorage.getItem('accessToken')); // Implement this function
    const response = mockApi.getUserProfile(userId);
    if (response.success) {
        const trackList = document.getElementById('track-list');
        trackList.innerHTML = '';
        response.music.forEach(track => {
            const li = document.createElement('li');
            li.textContent = `${track.title} by ${track.artist}`;
            trackList.appendChild(li);
        });
    }
}

// Function to get the music list
function fetchMusicList() {
    const response = mockApi.getMusicList();
    const musicCollection = document.getElementById('music-collection');
    musicCollection.innerHTML = '';
    if (response.success) {
        response.music.forEach(track => {
            const li = document.createElement('li');
            li.textContent = `${track.title} by ${track.artist}`;
            musicCollection.appendChild(li);
        });
    }
}

// Function to get user ID from token (example implementation)
function getUserIdFromToken(token) {
    return accessTokens[token]; // Assuming accessTokens contains user mapping
}
