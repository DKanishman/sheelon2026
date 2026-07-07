let startTime; 
let responses = {};
let currentSurveyData = null; 
let totalQuestions = 0;
let currentSurveyName = "";

// *** חובה להדביק כאן את הקישור שקיבלת מגוגל שיטס! ***
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-6UTuvAo7kbnnra1VDwNzmTISYMnn3K3YNt5Y-QVyl3vxMYZ3mk_XtdSbTNbVcjfs/exec'; 

// ==========================================
// 1. ניהול טופס הסכמה מדעת
// ==========================================
function openConsentForm() { switchPage('survey-selection', 'full-consent-screen'); }

function submitConsentForm() {
    let fname = document.getElementById('consent-fname').value.trim();
    let lname = document.getElementById('consent-lname').value.trim();
    let id = document.getElementById('consent-id').value.trim();
    let address = document.getElementById('consent-address').value.trim();
    let phone = document.getElementById('consent-phone').value.trim();
    let agreed = document.getElementById('fullConsentCheck').checked;

    if (!fname || !lname || !id || !address || !phone) { showError("נא למלא את כל השדות בטופס ההסכמה."); return; }
    if (!agreed) { showError("חובה לסמן את תיבת ההסכמה בסוף הטופס."); return; }

    let consentPayload = {
        Survey_Type: "טופס הסכמה מדעת", Participant_Name: fname + " " + lname,
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
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>`;
    }).catch(error => { showError("אירעה שגיאה בשליחת הנתונים."); switchPage('success-msg', 'full-consent-screen'); });
}

// ==========================================
// 2. ניהול טופס קבלה לסיום המחקר
// ==========================================
function openReceiptForm() { switchPage('survey-selection', 'receipt-screen'); }

function updateTaxDeclaration() {
    let amount = document.getElementById('receipt-amount').value;
    document.getElementById('tax-dec-text').innerText = `קבלתי גמול מסוג זה (מכלל הניסויים בהם השתתפתי) סך ${amount}`;
    document.getElementById('tax-dec-radio').value = `קיבלתי גמול מסוג זה סך ${amount}`;
}

function submitReceiptForm() {
    let name = document.getElementById('receipt-name').value.trim();
    let id = document.getElementById('receipt-id').value.trim();
    let amount = document.getElementById('receipt-amount').value;
    let checkedRadio = document.querySelector('input[name="tax-declaration"]:checked');
    let agreed = document.getElementById('receiptCheck').checked;

    if (!name || !id) { showError("נא למלא שם ותעודת זהות."); return; }
    if (!checkedRadio) { showError("נא לסמן את אפשרות ההצהרה בנוגע לגמול."); return; }
    if (!agreed) { showError("חובה לסמן את אישור החתימה בתחתית הקבלה."); return; }

    let autoDateTime = new Date().toLocaleString('he-IL');
    let receiptPayload = {
        Survey_Type: "קבלה", Participant_Name: name,
        Receipt_Data: { Name: name, ID: id, ReceiptDate: autoDateTime, Amount: amount, TaxDeclaration: checkedRadio.value, Agreed: "כן" }
    };

    switchPage('receipt-screen', 'success-msg');
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(receiptPayload)
    }).then(() => {
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">הקבלה נחתמה ונשלחה בהצלחה.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>`;
    }).catch(error => { showError("אירעה שגיאה בשליחת הנתונים."); switchPage('success-msg', 'receipt-screen'); });
}

// ==========================================
// 3. ניווט והתחלת שאלון
// ==========================================
function selectSurvey(surveyId) {
    const fetchUrl = 'questions.json?t=' + new Date().getTime();
    fetch(fetchUrl)
        .then(response => { if(!response.ok) throw new Error("File not found"); return response.json(); })
        .then(data => {
            currentSurveyData = data[surveyId]; 
            totalQuestions = currentSurveyData.questions.length; 
            currentSurveyName = currentSurveyData.title;
            document.getElementById('survey-title-display').innerText = currentSurveyName; 
            document.getElementById('confidentialityCheck').checked = false;
            switchPage('survey-selection', 'confidentiality-screen');
        })
        .catch(error => { showError("שגיאה בטעינת השאלון. בדוק חיבור לאינטרנט."); });
}

function proceedToIntro() {
    if (!document.getElementById('confidentialityCheck').checked) { showError("נא לאשר את הצהרת הסודיות כדי להמשיך."); return; }
    switchPage('confidentiality-screen', 'intro');
}

function startSurvey() {
    let first = document.getElementById('firstName').value.trim();
    let last = document.getElementById('lastName').value.trim();

    if(!first || !last) { showError("נא למלא שם ושם משפחה כדי להתחיל."); return; }
    responses["Survey_Type"] = currentSurveyName; 
    responses["Participant_Name"] = first + " " + last; 
    responses["Start_Time"] = new Date().toLocaleString();
    if(!responses["Consent_Agreed"]) { responses["Consent_Agreed"] = "טרם מולא טופס מלא"; }
    responses["Answers"] = []; 
    responses["Total_Score"] = 0;

    renderQuestions(); 
    switchPage('intro', 'q1'); 
    startTime = Date.now(); 
}

// ==========================================
// 4. רינדור לפי סוג השאלון
// ==========================================
function renderQuestions() {
    if (currentSurveyData.type === "faux_pas") {
        renderFauxPasQuestions();
    } else if (currentSurveyName === "שאלון 3 (מטריצות רייבן)") {
        renderRavenQuestions();
    } else {
        renderRegularQuestions();
    }
}

// פונקציה לשאלון 4 (הבנת סיטואציות)
function renderFauxPasQuestions() {
    const container = document.getElementById('survey-container'); 
    let html = '';
    
    if (currentSurveyData.description) {
        html += `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;">
                    <h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3>
                 </div>`;
    }

    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        
        html += `
        <div id="q${qNum}" class="section">
            <h2>שאלה ${qNum} מתוך ${totalQuestions}</h2>
            
            <div style="background: #fff; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
                <p class="scenario-text" style="font-size: 18px; font-weight: normal; line-height: 1.6; padding: 15px; margin: 0;">
                    ${qObj.story}
                </p>
                <div style="text-align: center; padding: 10px; border-top: 1px solid #eee; background: #fafafa;">
                    <audio id="audio_${qNum}" src="sound/t4s${qNum}.mp3" type="audio/mpeg" preload="auto"></audio>
                    <button id="btn_audio_${qNum}" class="btn btn-audio" style="background-color: #9b59b6; margin: 0; display: inline-flex; align-items: center; gap: 8px;" onclick="playStoryAudio(${qNum})">
                        🔊 השמע סיפור
                    </button>
                </div>
            </div>
            
            <div style="background: #fdfdfd; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
                
                <div id="fp_step1_${qNum}">
                    <p style="font-weight: bold; font-size: 16px; margin-bottom: 10px;">1. האם מישהו אמר משהו שהוא לא היה צריך להגיד?</p>
                    <select id="fp_q1_${qNum}" style="width: 100%; padding: 10px; font-size: 16px; border-radius: 5px; border: 1px solid #ccc; font-family: 'Assistant';">
                        <option value="">-- בחר/י תשובה --</option>
                        <option value="כן">כן</option>
                        <option value="לא">לא</option>
                    </select>
                    <button class="btn btn-start" style="margin-top: 15px;" onclick="nextFauxPasStep(${qNum}, 1)">המשך</button>
                </div>

                <div id="fp_step2_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">2. מי אמר משהו שהוא לא היה צריך להגיד?</p>
                    <input type="text" id="fp_q2_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 2)">חזור אחורה</button>
                        <button class="btn btn-start" style="flex: 1; margin: 0;" onclick="nextFauxPasStep(${qNum}, 2)">המשך</button>
                    </div>
                </div>

                <div id="fp_step3_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">3. מדוע הוא/היא לא היה צריך להגיד זאת?</p>
                    <input type="text" id="fp_q3_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 3)">חזור אחורה</button>
                        <button class="btn btn-start" style="flex: 1; margin: 0;" onclick="nextFauxPasStep(${qNum}, 3)">המשך</button>
                    </div>
                </div>

                <div id="fp_step4_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">4. מדוע הוא אמר זאת?</p>
                    <input type="text" id="fp_q4_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 4)">חזור אחורה</button>
                        <button class="btn btn-start" style="flex: 1; margin: 0;" onclick="nextFauxPasStep(${qNum}, 4)">המשך</button>
                    </div>
                </div>

                <div id="fp_step5_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">5. ${qObj.q5}</p>
                    <input type="text" id="fp_q5_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 5)">חזור אחורה</button>
                        <button class="btn btn-start" style="flex: 1; background-color: #27ae60; margin: 0;" onclick="handleFauxPasNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button>
                    </div>
                </div>
            </div>
            
            <br>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
        </div>
        `;
    });
    container.innerHTML = html;
}

function playStoryAudio(qNum) {
    let audioEl = document.getElementById(`audio_${qNum}`);
    let btnEl = document.getElementById(`btn_audio_${qNum}`);
    if (!audioEl) return;

    if (audioEl.paused) {
        document.querySelectorAll('audio').forEach(a => { if(a !== audioEl) { a.pause(); a.currentTime = 0; } });
        document.querySelectorAll('.btn-audio').forEach(b => { b.innerHTML = '🔊 השמע סיפור'; });
        audioEl.load();
        let playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => { btnEl.innerHTML = '⏸ עצור השמעה'; })
            .catch(error => { showError("שגיאה: הקובץ לא נמצא. ודא שקיים קובץ בתיקיית sound."); });
        }
    } else {
        audioEl.pause();
        btnEl.innerHTML = '🔊 השמע סיפור';
    }
    audioEl.onended = function() { btnEl.innerHTML = '🔊 השמע סיפור'; };
}

function nextFauxPasStep(qNum, currentStep) {
    if (currentStep === 1) {
        let val = document.getElementById(`fp_q1_${qNum}`).value;
        if (!val) { showError("אנא בחר/י תשובה כדי להמשיך."); return; }
        document.getElementById(`fp_step1_${qNum}`).style.display = 'none';
        if (val === "כן") { document.getElementById(`fp_step2_${qNum}`).style.display = 'block'; } 
        else { document.getElementById(`fp_step5_${qNum}`).style.display = 'block'; }
    }
    else if (currentStep === 2) {
        let val = document.getElementById(`fp_q2_${qNum}`).value.trim();
        if (!val) { showError("אנא ענה/י על השאלה כדי להמשיך."); return; }
        document.getElementById(`fp_step2_${qNum}`).style.display = 'none'; document.getElementById(`fp_step3_${qNum}`).style.display = 'block';
    }
    else if (currentStep === 3) {
        let val = document.getElementById(`fp_q3_${qNum}`).value.trim();
        if (!val) { showError("אנא ענה/י על השאלה כדי להמשיך."); return; }
        document.getElementById(`fp_step3_${qNum}`).style.display = 'none'; document.getElementById(`fp_step4_${qNum}`).style.display = 'block';
    }
    else if (currentStep === 4) {
        let val = document.getElementById(`fp_q4_${qNum}`).value.trim();
        if (!val) { showError("אנא ענה/י על השאלה כדי להמשיך."); return; }
        document.getElementById(`fp_step4_${qNum}`).style.display = 'none'; document.getElementById(`fp_step5_${qNum}`).style.display = 'block';
    }
}

function prevFauxPasStep(qNum, currentStep) {
    if (currentStep === 2) { document.getElementById(`fp_step2_${qNum}`).style.display = 'none'; document.getElementById(`fp_step1_${qNum}`).style.display = 'block'; }
    else if (currentStep === 3) { document.getElementById(`fp_step3_${qNum}`).style.display = 'none'; document.getElementById(`fp_step2_${qNum}`).style.display = 'block'; }
    else if (currentStep === 4) { document.getElementById(`fp_step4_${qNum}`).style.display = 'none'; document.getElementById(`fp_step3_${qNum}`).style.display = 'block'; }
    else if (currentStep === 5) {
        document.getElementById(`fp_step5_${qNum}`).style.display = 'none';
        let val = document.getElementById(`fp_q1_${qNum}`).value;
        if (val === "כן") { document.getElementById(`fp_step4_${qNum}`).style.display = 'block'; } 
        else { document.getElementById(`fp_step1_${qNum}`).style.display = 'block'; }
    }
}

function handleFauxPasNext(qNum) {
    const q1Val = document.getElementById(`fp_q1_${qNum}`).value;
    const qObj = currentSurveyData.questions[qNum - 1];
    let score = qObj.q1_scores[q1Val]; 
    
    let combinedAnswer = `שאלת זיהוי: ${q1Val}`;
    let q5Ans = document.getElementById(`fp_q5_${qNum}`).value.trim();
    if (!q5Ans) { showError("אנא ענה/י על השאלה הפתוחה."); return; }
    
    if (q1Val === "כן") {
        let q2Ans = document.getElementById(`fp_q2_${qNum}`).value.trim();
        let q3Ans = document.getElementById(`fp_q3_${qNum}`).value.trim();
        let q4Ans = document.getElementById(`fp_q4_${qNum}`).value.trim();
        combinedAnswer += ` | מי אמר: ${q2Ans} | מדוע לא צריך: ${q3Ans} | מדוע אמר: ${q4Ans} | שאלת הבנה: ${q5Ans}`;
    } else {
        combinedAnswer += ` | שאלת הבנה: ${q5Ans}`;
    }

    responses.Answers.push({ 
        Question_Number: qNum, Question_Text: "סיפור " + qNum, Part: "",
        Answer: combinedAnswer, Score: score, Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000) 
    });

    if (qNum < totalQuestions) { switchPage('q' + qNum, 'q' + (qNum + 1)); startTime = Date.now(); } 
    else { finalizeSurvey(); }
}


// פונקציית רינדור לשאלונים רגילים (כולל שאלון 5B)
function renderRegularQuestions() {
    const container = document.getElementById('survey-container'); 
    let html = '';
    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        let optionsHtml = '';
        let qOptions = qObj.options || currentSurveyData.options;
        qOptions.forEach((opt, optIndex) => {
            const score = qObj.scores[optIndex]; 
            optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
        });
        html += `
        <div id="q${qNum}" class="section">
            <h2>שאלה ${qNum} מתוך ${totalQuestions}</h2>
            <p class="scenario-text">${qObj.text}</p>
            <div style="margin-top:10px;">${optionsHtml}</div><br>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
            <button class="btn" onclick="handleNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button>
        </div>`;
    });
    container.innerHTML = html;
}

// פונקציית רינדור לרייבן
function renderRavenQuestions() {
    const container = document.getElementById('survey-container'); 
    let html = '';
    let descHtml = currentSurveyData.description ? `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;"><h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3></div>` : '';
    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        let optionsHtml = '';
        let qOptions = qObj.options || currentSurveyData.options;
        for (let optIndex = qOptions.length - 1; optIndex >= 0; optIndex--) {
            const opt = qOptions[optIndex]; const score = qObj.scores[optIndex]; 
            optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
        }
        let imageHtml = qObj.image ? `<img src="${qObj.image}" alt="שאלה ${qNum}" style="max-width: 100%; height: auto; display: block; margin: 15px auto; border: 2px solid #ccc; border-radius: 5px;">` : '';
        html += `
        <div id="q${qNum}" class="section">${descHtml}<h2>שאלה ${qNum} מתוך ${totalQuestions} ${qObj.part ? '(חלק ' + qObj.part + ')' : ''}</h2>
            ${imageHtml}<p class="scenario-text">${qObj.text || ""}</p>
            <div style="margin-top:10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">${optionsHtml}</div><br>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
            <button class="btn" onclick="handleNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button>
        </div>`;
    });
    container.innerHTML = html;
}

// ==========================================
// 5. איסוף נתונים וחזרה למסך ראשי
// ==========================================
function goBackToMain() { document.querySelector('.section.active')?.classList.remove('active'); document.getElementById('custom-confirm').classList.add('active'); }
function confirmBack() { let hadConsent = responses["Consent_Agreed"]; responses = {}; if (hadConsent) responses["Consent_Agreed"] = hadConsent; document.getElementById('survey-container').innerHTML = ''; document.getElementById('custom-confirm').classList.remove('active'); document.getElementById('survey-selection').classList.add('active'); }
function cancelBack() { document.getElementById('custom-confirm').classList.remove('active'); const questions = document.querySelectorAll('#survey-container .section'); for (let i = questions.length - 1; i >= 0; i--) { if (responses.Answers && responses.Answers.length === i) { questions[i].classList.add('active'); return; } } }

function handleNext(qNum) {
    const checkedRadio = document.getElementById('q' + qNum).querySelector('input[type="radio"]:checked');
    if (!checkedRadio) { showError("חובה לבחור תשובה לפני שממשיכים!"); return; }
    
    responses.Answers.push({ 
        Question_Number: qNum, Question_Text: currentSurveyData.questions[qNum - 1].text || "תמונה", 
        Part: currentSurveyData.questions[qNum - 1].part || "", Answer: checkedRadio.value, 
        Score: parseInt(checkedRadio.getAttribute('data-score')), Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000) 
    });

    if (qNum < totalQuestions) { switchPage('q' + qNum, 'q' + (qNum + 1)); startTime = Date.now(); } 
    else { finalizeSurvey(); }
}

// ==========================================
// 6. סיום ושליחה לגוגל
// ==========================================
function finalizeSurvey() {
    responses["End_Time"] = new Date().toLocaleString();
    responses["Total_Score"] = responses.Answers.reduce((sum, ans) => sum + ans.Score, 0);
    
    responses["Scores_Parts"] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    responses.Answers.forEach(ans => {
        if (ans.Part && responses["Scores_Parts"][ans.Part] !== undefined) { responses["Scores_Parts"][ans.Part] += ans.Score; }
    });

    switchPage('q' + totalQuestions, 'success-msg'); 
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

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
    document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; }); 
    document.querySelectorAll('.btn-audio').forEach(b => { b.innerHTML = '🔊 השמע סיפור'; });
    let hideEl = document.getElementById(hideId); let showEl = document.getElementById(showId);
    if(hideEl) hideEl.classList.remove('active'); if(showEl) showEl.classList.add('active');
}