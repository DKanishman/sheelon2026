let startTime; 
let responses = {};
let currentSurveyData = null; 
let totalQuestions = 0;
let currentSurveyName = "";

// *** חובה להדביק כאן את הקישור שקיבלת מגוגל שיטס! ***
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6s-3Kid9JCovsKM82JC8Q7US_mAVXxbtcrhsF7_7nPM_yaBgQCONDnCbwpuOK4hwf4w/exec'; 

// --- טופס הסכמה ---
function openConsentForm() {
    switchPage('survey-selection', 'full-consent-screen');
}

function submitConsentForm() {
    let fname = document.getElementById('consent-fname').value.trim();
    let lname = document.getElementById('consent-lname').value.trim();
    let id = document.getElementById('consent-id').value.trim();
    let address = document.getElementById('consent-address').value.trim();
    let phone = document.getElementById('consent-phone').value.trim();
    let agreed = document.getElementById('fullConsentCheck').checked;

    if (!fname || !lname || !id || !address || !phone) {
        showError("נא למלא את כל השדות בטופס ההסכמה."); return;
    }
    if (!agreed) {
        showError("חובה לסמן את תיבת ההסכמה בסוף הטופס."); return;
    }

    let consentPayload = {
        Survey_Type: "טופס הסכמה מדעת",
        Participant_Name: fname + " " + lname,
        Consent_Data: { FirstName: fname, LastName: lname, ID: id, Address: address, Phone: phone, Agreed: "כן" }
    };

    switchPage('full-consent-screen', 'success-msg');
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(consentPayload)
    }).then(() => {
        responses["Consent_Agreed"] = "כן"; 
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">טופס ההסכמה שלך נשלח ונחתם בהצלחה.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>
        `;
    }).catch(error => {
        showError("אירעה שגיאה בשליחת הנתונים."); switchPage('success-msg', 'full-consent-screen');
    });
}

// --- טופס קבלה ---
// --- טופס קבלה ---
function openReceiptForm() {
    switchPage('survey-selection', 'receipt-screen');
}

function submitReceiptForm() {
    let name = document.getElementById('receipt-name').value.trim();
    let id = document.getElementById('receipt-id').value.trim();
    let checkedRadio = document.querySelector('input[name="tax-declaration"]:checked');
    let agreed = document.getElementById('receiptCheck').checked;

    if (!name || !id) {
        showError("נא למלא שם ותעודת זהות."); return;
    }
    if (!checkedRadio) {
        showError("נא לסמן את אחת מאפשרויות ההצהרה בנוגע לגמול מס."); return;
    }
    if (!agreed) {
        showError("חובה לסמן את אישור החתימה בתחתית הקבלה."); return;
    }

    // יצירת תאריך ושעה אוטומטיים ברגע הלחיצה על שליחה
    let autoDateTime = new Date().toLocaleString('he-IL');

    let receiptPayload = {
        Survey_Type: "קבלה",
        Participant_Name: name,
        Receipt_Data: {
            Name: name,
            ID: id,
            ReceiptDate: autoDateTime, // שליחת התאריך האוטומטי
            Amount: "100 ₪",
            TaxDeclaration: checkedRadio.value,
            Agreed: "כן"
        }
    };

    switchPage('receipt-screen', 'success-msg');
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(receiptPayload)
    }).then(() => {
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">הקבלה נחתמה ונשלחה בהצלחה.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>
        `;
    }).catch(error => {
        showError("אירעה שגיאה בשליחת הנתונים."); switchPage('success-msg', 'receipt-screen');
    });
}

// --- שאלונים וכללי ---
// --- בחירת שאלון ומעבר למסך סודיות ---
function selectSurvey(surveyId) {
    if (surveyId === 'survey3' || surveyId === 'kabala') { 
        showError("שאלון זה אינו זמין כרגע."); 
        return; 
    }
    
    const fetchUrl = 'questions.json?t=' + new Date().getTime();
    fetch(fetchUrl)
        .then(response => { if(!response.ok) throw new Error("File not found"); return response.json(); })
        .then(data => {
            currentSurveyData = data[surveyId]; 
            totalQuestions = currentSurveyData.questions.length; 
            currentSurveyName = currentSurveyData.title;
            document.getElementById('survey-title-display').innerText = currentSurveyName; 
            
            // איפוס תיבת הסימון של הסודיות לפני כל כניסה
            document.getElementById('confidentialityCheck').checked = false;
            
            // העברה למסך הסודיות החדש (במקום ל-intro)
            switchPage('survey-selection', 'confidentiality-screen');
        })
        .catch(error => { showError("שגיאה בטעינת שאלונים."); });
}

// --- אישור סודיות ומעבר למסך הזנת שם ---
function proceedToIntro() {
    let agreed = document.getElementById('confidentialityCheck').checked;
    if (!agreed) {
        showError("נא לאשר את הצהרת הסודיות כדי להמשיך.");
        return;
    }
    // מעבר למסך הזנת השם
    switchPage('confidentiality-screen', 'intro');
}

function startSurvey() {
    let first = document.getElementById('firstName').value.trim();
    let last = document.getElementById('lastName').value.trim();

    if(!first || !last) { showError("נא למלא שם ושם משפחה כדי להתחיל."); return; }
    
    responses["Survey_Type"] = currentSurveyName; responses["Participant_Name"] = first + " " + last; responses["Start_Time"] = new Date().toLocaleString();
    if(!responses["Consent_Agreed"]) { responses["Consent_Agreed"] = "כן (טרם מולא טופס מלא)"; }
    responses["Answers"] = []; responses["Total_Score"] = 0;

    renderQuestions(); switchPage('intro', 'q1'); startTime = Date.now(); 
}

function renderQuestions() {
    const container = document.getElementById('survey-container'); let html = '';
    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; let optionsHtml = '';
        currentSurveyData.options.forEach((opt, optIndex) => {
            const score = qObj.scores[optIndex]; optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
        });
        html += `<div id="q${qNum}" class="section"><h2>שאלה ${qNum} מתוך ${totalQuestions}</h2><p class="scenario-text">${qObj.text}</p>
            <div style="margin-top:10px;">${optionsHtml}</div>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
            <button class="btn" onclick="handleNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button></div>`;
    });
    container.innerHTML = html;
}

function goBackToMain() { document.querySelector('.section.active')?.classList.remove('active'); document.getElementById('custom-confirm').classList.add('active'); }

function confirmBack() {
    let hadConsent = responses["Consent_Agreed"]; responses = {}; if (hadConsent) responses["Consent_Agreed"] = hadConsent;
    document.getElementById('custom-confirm').classList.remove('active'); document.getElementById('survey-selection').classList.add('active');
}

function cancelBack() {
    document.getElementById('custom-confirm').classList.remove('active');
    const questions = document.querySelectorAll('#survey-container .section');
    for (let i = questions.length - 1; i >= 0; i--) {
        if (responses.Answers && responses.Answers.length === i) { questions[i].classList.add('active'); return; }
    }
}

function handleNext(qNum) {
    const checkedRadio = document.getElementById('q' + qNum).querySelector('input[type="radio"]:checked');
    if (!checkedRadio) { showError("חובה לבחור תשובה לפני שממשיכים!"); return; }
    
    responses.Answers.push({ 
        Question_Number: qNum, Question_Text: currentSurveyData.questions[qNum - 1].text, Answer: checkedRadio.value, 
        Score: parseInt(checkedRadio.getAttribute('data-score')), Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000) 
    });

    if (qNum < totalQuestions) { switchPage('q' + qNum, 'q' + (qNum + 1)); startTime = Date.now(); } 
    else { finalizeSurvey(); }
}

function finalizeSurvey() {
    responses["End_Time"] = new Date().toLocaleString();
    responses["Total_Score"] = responses.Answers.reduce((sum, ans) => sum + ans.Score, 0);
    
    switchPage('q' + totalQuestions, 'success-msg'); document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(responses) })
    .then(() => {
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">השאלון הסתיים ותשובותיך נשמרו בהצלחה.</p>
            <p style="color: #555555; margin-bottom: 20px;">ניתן לחזור למסך הראשי כדי למלא שאלון נוסף.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>`;
    }).catch(error => { showError("אירעה שגיאה בשליחת הנתונים. אנא נסה שוב."); });
}

function returnToMainFromSuccess() {
    let hadConsent = responses["Consent_Agreed"]; responses = {}; if (hadConsent) responses["Consent_Agreed"] = hadConsent;
    currentSurveyData = null; totalQuestions = 0; currentSurveyName = ""; document.getElementById('survey-container').innerHTML = '';
    switchPage('success-msg', 'survey-selection');
}

function showError(msg) {
    const eb = document.getElementById('error-box'); eb.innerText = msg; eb.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { eb.style.display = 'none'; }, 3500);
}

function switchPage(hideId, showId) {
    let hideEl = document.getElementById(hideId), showEl = document.getElementById(showId);
    if(hideEl) hideEl.classList.remove('active'); if(showEl) showEl.classList.add('active');
}