// mockServer.js

// Simulated database
const users = [];
const musicTracks = [];
let apiKeys = {};
let accessTokens = {};
let distributionStatus = {}; // Track distribution status
let tokenCounter = 1; // For simulating access tokens

// Utility function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Simulated API for user signup
function signup(username, email, password) {
    const existingUser = users.find(user => user.username === username || user.email === email);
    if (existingUser) {
        return { success: false, message: 'User already exists.' };
    }

    const newUser = { id: generateId(), username, email, password };
    users.push(newUser);
    return { success: true, message: 'User created successfully.', userId: newUser.id };
}

// Simulated API for user login
function login(username, password) {
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return { success: false, message: 'Invalid username or password.' };
    }

    // Generate access token
    const accessToken = `token-${tokenCounter++}`;
    accessTokens[accessToken] = user.id;
    return { success: true, accessToken, message: 'Login successful.' };
}

// Simulated API for uploading music
function uploadMusic(title, artist, audioFile, coverArt) {
    const track = {
        id: generateId(),
        title,
        artist,
        audioFile,
        coverArt,
        platforms: [], // Placeholder for platforms to which the track will be distributed
        userId: null // This should be linked to the authenticated user
    };
    musicTracks.push(track);
    return { success: true, message: 'Music uploaded successfully.', trackId: track.id };
}

// Simulated API for distributing music
function distributeMusic(trackId, platforms) {
    const track = musicTracks.find(track => track.id === trackId);
    if (!track) {
        return { success: false, message: 'Music track not found.' };
    }

    track.platforms = platforms; // Update track with selected platforms
    const statusId = generateId();
    distributionStatus[statusId] = { trackId, platforms, status: 'In Progress' };
    
    // Simulating the distribution process
    setTimeout(() => {
        distributionStatus[statusId].status = 'Distributed';
        console.log(`Track "${track.title}" distributed to ${platforms.join(', ')}`);
    }, 3000); // Simulate 3 seconds delay for distribution

    return { success: true, message: 'Distribution initiated.', statusId };
}

// Simulated API to check distribution status
function getDistributionStatus(statusId) {
    const status = distributionStatus[statusId];
    if (!status) {
        return { success: false, message: 'Status ID not found.' };
    }
    return { success: true, status };
}

// Simulated API to get user profile
function getUserProfile(userId) {
    const userMusic = musicTracks.filter(track => track.userId === userId);
    return { success: true, music: userMusic };
}

// Simulated API to get music list
function getMusicList() {
    return { success: true, music: musicTracks };
}

// Simulated API to manage API keys
function generateApiKey(userId) {
    const newApiKey = generateId();
    apiKeys[userId] = apiKeys[userId] || [];
    apiKeys[userId].push(newApiKey);
    return { success: true, apiKey: newApiKey };
}

// Simulated API to manage access tokens
function revokeAccessToken(token) {
    delete accessTokens[token];
    return { success: true, message: 'Access token revoked.' };
}

// Simulated API to get music details
function getMusicDetails(trackId) {
    const track = musicTracks.find(track => track.id === trackId);
    if (!track) {
        return { success: false, message: 'Music track not found.' };
    }
    return { success: true, track };
}

// Exposing the simulated APIs
window.mockApi = {
    signup,
    login,
    uploadMusic,
    distributeMusic,
    getDistributionStatus,
    getUserProfile,
    getMusicList,
    generateApiKey,
    revokeAccessToken,
    getMusicDetails,
};
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

// Implement similar functions for other API interactions as needed
