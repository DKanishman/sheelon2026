let startTime; 
let responses = {};
let currentSurveyData = null; 
let totalQuestions = 0;
let currentSurveyName = "";

// *** חובה להדביק כאן את הקישור שקיבלת מגוגל שיטס! ***
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-6UTuvAo7kbnnra1VDwNzmTISYMnn3K3YNt5Y-QVyl3vxMYZ3mk_XtdSbTNbVcjfs/exec'; 


// ==========================================
// 1. ניהול טופס הסכמה מדעת (דיגיטלי מלא)
// ==========================================
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
        showError("נא למלא את כל השדות בטופס ההסכמה."); 
        return;
    }
    if (!agreed) {
        showError("חובה לסמן את תיבת ההסכמה בסוף הטופס."); 
        return;
    }

    let consentPayload = {
        Survey_Type: "טופס הסכמה מדעת",
        Participant_Name: fname + " " + lname,
        Consent_Data: { 
            FirstName: fname, 
            LastName: lname, 
            ID: id, 
            Address: address, 
            Phone: phone, 
            Agreed: "כן" 
        }
    };

    switchPage('full-consent-screen', 'success-msg');
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, {
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify(consentPayload)
    }).then(() => {
        responses["Consent_Agreed"] = "כן"; 
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">טופס ההסכמה שלך נשלח ונחתם בהצלחה.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>
        `;
    }).catch(error => {
        showError("אירעה שגיאה בשליחת הנתונים."); 
        switchPage('success-msg', 'full-consent-screen');
    });
}


// ==========================================
// 2. ניהול טופס קבלה לסיום המחקר
// ==========================================
function openReceiptForm() {
    switchPage('survey-selection', 'receipt-screen');
}

function submitReceiptForm() {
    let name = document.getElementById('receipt-name').value.trim();
    let id = document.getElementById('receipt-id').value.trim();
    let checkedRadio = document.querySelector('input[name="tax-declaration"]:checked');
    let agreed = document.getElementById('receiptCheck').checked;

    if (!name || !id) {
        showError("נא למלא שם ותעודת זהות."); 
        return;
    }
    if (!checkedRadio) {
        showError("נא לסמן את אחת מאפשרויות ההצהרה בנוגע לגמול מס."); 
        return;
    }
    if (!agreed) {
        showError("חובה לסמן את אישור החתימה בתחתית הקבלה."); 
        return;
    }

    // תאריך ושעה אוטומטיים
    let autoDateTime = new Date().toLocaleString('he-IL');

    let receiptPayload = {
        Survey_Type: "קבלה",
        Participant_Name: name,
        Receipt_Data: {
            Name: name,
            ID: id,
            ReceiptDate: autoDateTime,
            Amount: "100 ₪",
            TaxDeclaration: checkedRadio.value,
            Agreed: "כן"
        }
    };

    switchPage('receipt-screen', 'success-msg');
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, {
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify(receiptPayload)
    }).then(() => {
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">הקבלה נחתמה ונשלחה בהצלחה.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>
        `;
    }).catch(error => {
        showError("אירעה שגיאה בשליחת הנתונים."); 
        switchPage('success-msg', 'receipt-screen');
    });
}


// ==========================================
// 3. ניווט, סודיות והתחלת שאלון
// ==========================================
function selectSurvey(surveyId) {
    const fetchUrl = 'questions.json?t=' + new Date().getTime();
    fetch(fetchUrl)
        .then(response => { 
            if(!response.ok) throw new Error("File not found"); 
            return response.json(); 
        })
        .then(data => {
            currentSurveyData = data[surveyId]; 
            totalQuestions = currentSurveyData.questions.length; 
            currentSurveyName = currentSurveyData.title;
            
            document.getElementById('survey-title-display').innerText = currentSurveyName; 
            
            // איפוס וי הסודיות ומעבר למסך סודיות
            document.getElementById('confidentialityCheck').checked = false;
            switchPage('survey-selection', 'confidentiality-screen');
        })
        .catch(error => { 
            showError("שגיאה בטעינת השאלון. בדוק חיבור לאינטרנט."); 
        });
}

function proceedToIntro() {
    let agreed = document.getElementById('confidentialityCheck').checked;
    if (!agreed) {
        showError("נא לאשר את הצהרת הסודיות כדי להמשיך.");
        return;
    }
    // אם אושר, עוברים למסך הזנת השם
    switchPage('confidentiality-screen', 'intro');
}

function startSurvey() {
    let first = document.getElementById('firstName').value.trim();
    let last = document.getElementById('lastName').value.trim();

    if(!first || !last) { 
        showError("נא למלא שם ושם משפחה כדי להתחיל."); 
        return; 
    }
    
    responses["Survey_Type"] = currentSurveyName; 
    responses["Participant_Name"] = first + " " + last; 
    responses["Start_Time"] = new Date().toLocaleString();
    
    // אם לא מולא טופס הסכמה מראש, מתעדים זאת
    if(!responses["Consent_Agreed"]) { 
        responses["Consent_Agreed"] = "טרם מולא טופס מלא במסך הראשי"; 
    }
    
    responses["Answers"] = []; 
    responses["Total_Score"] = 0;

    renderQuestions(); 
    switchPage('intro', 'q1'); 
    startTime = Date.now(); 
}


// ==========================================
// 4. רינדור (הצגת) השאלות, התמונות והאפשרויות
// ==========================================
function renderQuestions() {
    const container = document.getElementById('survey-container'); 
    let html = '';
    
    // הכנת בלוק התיאור (בלי הגדרת section שמתנגשת במערכת)
    let descHtml = '';
    if (currentSurveyData.description) {
        descHtml = `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;">
                        <h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3>
                     </div>`;
    }

    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        let optionsHtml = '';
        
        let qOptions = qObj.options || currentSurveyData.options;
        
        qOptions.forEach((opt, optIndex) => {
            const score = qObj.scores[optIndex]; 
            optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
        });
        
        let imageHtml = qObj.image ? `<img src="${qObj.image}" alt="שאלה ${qNum}" style="max-width: 100%; height: auto; display: block; margin: 15px auto; border: 2px solid #ccc; border-radius: 5px;">` : '';

        // הכנסת התיאור לתוך הבלוק של השאלה עצמה
        html += `
        <div id="q${qNum}" class="section">
            ${descHtml}
            <h2>שאלה ${qNum} מתוך ${totalQuestions} ${qObj.part ? '(חלק ' + qObj.part + ')' : ''}</h2>
            ${imageHtml}
            <p class="scenario-text">${qObj.text || ""}</p>
            <div style="margin-top:10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
                ${optionsHtml}
            </div>
            <br>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
            <button class="btn" onclick="handleNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button>
        </div>
        `;
    });
    
    container.innerHTML = html;
}


// ==========================================
// 5. ניווט תוך כדי שאלון, חזרה לאחור ואיסוף נתונים
// ==========================================
function goBackToMain() { 
    document.querySelector('.section.active')?.classList.remove('active'); 
    document.getElementById('custom-confirm').classList.add('active'); 
}

function confirmBack() {
    let hadConsent = responses["Consent_Agreed"]; 
    responses = {}; 
    if (hadConsent) responses["Consent_Agreed"] = hadConsent;
    
    // התיקון: ניקוי מוחלט של אזור השאלון כדי שתמונות לא יישארו תלויות
    document.getElementById('survey-container').innerHTML = '';
    
    document.getElementById('custom-confirm').classList.remove('active'); 
    document.getElementById('survey-selection').classList.add('active');
}

function cancelBack() {
    document.getElementById('custom-confirm').classList.remove('active');
    const questions = document.querySelectorAll('#survey-container .section');
    for (let i = questions.length - 1; i >= 0; i--) {
        if (responses.Answers && responses.Answers.length === i) { 
            questions[i].classList.add('active'); 
            return; 
        }
    }
}

function handleNext(qNum) {
    const checkedRadio = document.getElementById('q' + qNum).querySelector('input[type="radio"]:checked');
    
    if (!checkedRadio) { 
        showError("חובה לבחור תשובה לפני שממשיכים!"); 
        return; 
    }
    
    // שמירת הנתונים של השאלה (כולל 'חלק' אם קיים עבור רייבן)
    responses.Answers.push({ 
        Question_Number: qNum, 
        Question_Text: currentSurveyData.questions[qNum - 1].text || "תמונה", 
        Part: currentSurveyData.questions[qNum - 1].part || "",
        Answer: checkedRadio.value, 
        Score: parseInt(checkedRadio.getAttribute('data-score')), 
        Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000) 
    });

    // מעבר לשאלה הבאה או סיום
    if (qNum < totalQuestions) { 
        switchPage('q' + qNum, 'q' + (qNum + 1)); 
        startTime = Date.now(); 
    } else { 
        finalizeSurvey(); 
    }
}


// ==========================================
// 6. סיום שאלון ושליחה לגוגל
// ==========================================
function finalizeSurvey() {
    responses["End_Time"] = new Date().toLocaleString();
    responses["Total_Score"] = responses.Answers.reduce((sum, ans) => sum + ans.Score, 0);
    
    // חישוב מיוחד לשאלון 3 - חלוקת ציון לפי פרקים
    responses["Scores_Parts"] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    responses.Answers.forEach(ans => {
        if (ans.Part && responses["Scores_Parts"][ans.Part] !== undefined) {
            responses["Scores_Parts"][ans.Part] += ans.Score;
        }
    });

    switchPage('q' + totalQuestions, 'success-msg'); 
    document.getElementById('success-msg').innerHTML = "<h2>שולח נתונים... אנא המתן...</h2>";

    fetch(SCRIPT_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify(responses) 
    })
    .then(() => {
        document.getElementById('success-msg').innerHTML = `
            <h2 style="color: #2ecc71;">תודה רבה!</h2>
            <p style="color: #333333; font-size: 18px;">השאלון הסתיים ותשובותיך נשמרו בהצלחה.</p>
            <p style="color: #555555; margin-bottom: 20px;">ניתן לחזור למסך הראשי כדי למלא שאלון נוסף.</p>
            <button class="btn btn-survey" style="max-width: 300px; margin: 0 auto; display: block;" onclick="returnToMainFromSuccess()">חזרה למסך הראשי</button>`;
    }).catch(error => { 
        showError("אירעה שגיאה בשליחת הנתונים. אנא נסה שוב."); 
    });
}


// ==========================================
// 7. פונקציות עזר, שגיאות ותצוגה
// ==========================================
function returnToMainFromSuccess() {
    // שומרים את ההסכמה כדי לא להטריד את המשתתף שוב
    let hadConsent = responses["Consent_Agreed"]; 
    responses = {}; 
    if (hadConsent) responses["Consent_Agreed"] = hadConsent;
    
    currentSurveyData = null; 
    totalQuestions = 0; 
    currentSurveyName = ""; 
    
    document.getElementById('survey-container').innerHTML = '';
    switchPage('success-msg', 'survey-selection');
}

function showError(msg) {
    const eb = document.getElementById('error-box'); 
    eb.innerText = msg; 
    eb.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    setTimeout(() => { eb.style.display = 'none'; }, 3500);
}

function switchPage(hideId, showId) {
    let hideEl = document.getElementById(hideId); 
    let showEl = document.getElementById(showId);
    
    if(hideEl) hideEl.classList.remove('active'); 
    if(showEl) showEl.classList.add('active');
}