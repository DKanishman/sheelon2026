// --- globals.js ---
let startTime; 
let responses = {};
let currentSurveyData = null; 
let totalQuestions = 0;
let currentSurveyName = "";

let ds_part = 'A';
let ds_itemIdx = 0;
let ds_lastCorrectA = 0;
let ds_lastCorrectB = 0;

// הקישור שלך ל-Google Sheets
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwe3bSoh6_pSjTnxM-emW6QaQ-Ali9HL2C96E7msr3xvunthyBxTfPqHubpDt3dtw1r/exec'; 

function showError(msg) {
    const eb = document.getElementById('error-box'); 
    eb.innerText = msg; 
    eb.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    setTimeout(() => { eb.style.display = 'none'; }, 3500);
}

function switchPage(hideId, showId) {
    document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; }); 
    
    let hideEl = document.getElementById(hideId); 
    let showEl = document.getElementById(showId);
    if(hideEl) hideEl.classList.remove('active'); 
    if(showEl) showEl.classList.add('active');
}