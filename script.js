// State management
let currentUser = null;
let isAdmin = false;
let currentPoll = null;
let users = [];
let polls = [];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const waitingRoom = document.getElementById('waiting-room');
const pollScreen = document.getElementById('poll-screen');
const adminPanel = document.getElementById('admin-panel');
const waitingList = document.querySelector('.waiting-list');
const pollOptions = document.querySelector('.poll-options');
const votersList = document.querySelector('.voters-list');
const pollTimer = document.querySelector('.poll-timer');
const pollQuestion = document.querySelector('.poll-question');

// Event Listeners
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('start-session').addEventListener('click', startSession);
document.getElementById('create-poll').addEventListener('click', createPoll);
document.getElementById('end-session').addEventListener('click', endSession);

// Functions
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    if (!username) return;

    currentUser = {
        name: username,
        id: Date.now().toString(),
        isAdmin: users.length === 0 // First user becomes admin
    };

    isAdmin = currentUser.isAdmin;
    users.push(currentUser);

    // Show admin controls if admin
    if (isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('visible'));
    }

    // Update UI
    updateWaitingRoom();
    showScreen('waiting-room');
}

function updateWaitingRoom() {
    waitingList.innerHTML = users.map(user => `
        <div class="user-card">
            <h3>${user.name}</h3>
            ${user.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
        </div>
    `).join('');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startSession() {
    if (!isAdmin) return;
    showScreen('poll-screen');
    createPoll();
}

function createPoll() {
    if (!isAdmin) return;

    // Example poll - in a real app, this would be created through a form
    currentPoll = {
        id: Date.now().toString(),
        question: "What's your favorite programming language?",
        options: [
            { text: "JavaScript", votes: 0, voters: [] },
            { text: "Python", votes: 0, voters: [] },
            { text: "Java", votes: 0, voters: [] }
        ],
        startTime: Date.now(),
        duration: 30000 // 30 seconds
    };

    updatePollUI();
    startTimer();
}

function updatePollUI() {
    pollQuestion.textContent = currentPoll.question;
    pollOptions.innerHTML = currentPoll.options.map(option => `
        <div class="option" data-option-id="${option.text}">
            <div class="progress-bar" style="width: ${(option.votes / users.length) * 100}%"></div>
            <span>${option.text}</span>
            <span class="vote-count">${option.votes} votes</span>
        </div>
    `).join('');

    // Add click handlers for options
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', () => handleVote(option.dataset.optionId));
    });

    updateVotersList();
}

function handleVote(optionId) {
    if (!currentPoll) return;

    const option = currentPoll.options.find(opt => opt.text === optionId);
    if (!option) return;

    // Remove previous vote if exists
    currentPoll.options.forEach(opt => {
        opt.voters = opt.voters.filter(voter => voter !== currentUser.id);
        opt.votes = opt.voters.length;
    });

    // Add new vote
    option.voters.push(currentUser.id);
    option.votes = option.voters.length;

    updatePollUI();
}

function updateVotersList() {
    votersList.innerHTML = users.map(user => {
        const votedOption = currentPoll.options.find(opt => opt.voters.includes(user.id));
        return `
            <div class="voter">
                <span>${user.name}</span>
                ${votedOption ? `<span class="voted-for">Voted: ${votedOption.text}</span>` : '<span class="waiting">Waiting...</span>'}
            </div>
        `;
    }).join('');
}

function startTimer() {
    const endTime = currentPoll.startTime + currentPoll.duration;
    
    const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        
        if (remaining === 0) {
            clearInterval(timer);
            endPoll();
            return;
        }

        const seconds = Math.floor(remaining / 1000);
        pollTimer.textContent = `${seconds}s`;
    }, 1000);
}

function endPoll() {
    // Show results
    updatePollUI();
    // In a real app, you might want to show a results screen or create a new poll
}

function endSession() {
    if (!isAdmin) return;
    // Reset state
    currentPoll = null;
    users = [];
    currentUser = null;
    isAdmin = false;
    
    // Reset UI
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('visible'));
    showScreen('login-screen');
}

// Initialize
function init() {
    showScreen('login-screen');
}

init(); 