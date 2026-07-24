// --- main.js ---
function selectSurvey(surveyId) {
    const fetchUrl = 'questions.json?t=' + new Date().getTime();
    fetch(fetchUrl)
        .then(response => { if(!response.ok) throw new Error("File not found"); return response.json(); })
        .then(data => {
            currentSurveyData = data[surveyId]; 
            
            if(currentSurveyData.type === 'digit_span') {
                totalQuestions = currentSurveyData.parts.A.items.length + currentSurveyData.parts.B.items.length;
            } else if (currentSurveyData.type === 'pab') {
                totalQuestions = 1; 
            } else {
                totalQuestions = currentSurveyData.questions.length; 
            }
            
            currentSurveyName = currentSurveyData.title;
            document.getElementById('survey-title-display').innerText = currentSurveyName; 

            if (surveyId === 'survey5' || surveyId === 'survey5A') {
                document.getElementById('age-container').style.display = 'block';
            } else {
                document.getElementById('age-container').style.display = 'none';
                document.getElementById('age').value = ''; 
            }

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
    let age = "";
    
    let requiresAge = (currentSurveyName.includes("5A") || currentSurveyName.includes("5B") || currentSurveyName.includes("שאלון 5")) && !currentSurveyName.includes("PAB");

    if (requiresAge) {
        age = document.getElementById('age').value.trim();
        if(!first || !last || !age) { showError("נא למלא שם, משפחה וגיל כדי להתחיל."); return; }
    } else {
        if(!first || !last) { showError("נא למלא שם ושם משפחה כדי להתחיל."); return; }
    }

    responses["Survey_Type"] = currentSurveyName; 
    responses["Participant_Name"] = first + " " + last; 
    responses["Age"] = age;
    responses["Start_Time"] = new Date().toLocaleString();
    if(!responses["Consent_Agreed"]) { responses["Consent_Agreed"] = "טרם מולא טופס מלא"; }
    responses["Answers"] = []; 
    responses["Total_Score"] = 0;

    renderQuestions(); 

    if (currentSurveyData.type === 'digit_span') {
        ds_part = 'A';
        ds_itemIdx = 0;
        ds_lastCorrectA = 0;
        ds_lastCorrectB = 0;
        switchPage('intro', 'ds_sec_A_0');
    } else if (currentSurveyData.type === 'pab') {
        switchPage('intro', 'pab-container');
    } else if (currentSurveyData.type === 'survey12') { 
        switchPage('intro', 's12_intro'); // הפניה לטופס הפרטים האישיים של שאלון 12
    } else {
        switchPage('intro', 'q1'); 
    }
    startTime = Date.now();
}

function renderQuestions() {
    if (currentSurveyData.type === "faux_pas") {
        renderFauxPasQuestions();
    } else if (currentSurveyData.type === "raven") {
        renderRavenQuestions();
    } else if (currentSurveyData.type === "vocabulary") {
        renderVocabularyQuestions();
    } else if (currentSurveyData.type === "digit_span") {
        renderDigitSpanQuestions();
    } else if (currentSurveyData.type === "pab") {
        renderPabQuestions();
    } else if (currentSurveyData.type === "survey12") {
        renderSurvey12Questions(); // הפניה לרינדור שאלון 12
    } else {
        renderRegularQuestions();
    }
}

// החלף את הפונקציה הקיימת renderRegularQuestions בקובץ main.js בקוד הבא:

function renderRegularQuestions() {
    const container = document.getElementById('survey-container'); 
    let html = '';
    
    if (currentSurveyData.description) {
        html += `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;"><h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3></div>`;
    }

    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        let optionsHtml = '';
        let inputType = qObj.inputType || 'radio';

        // הוספת תמיכה בתמונות
        let mediaHtml = '';
        if (qObj.image) {
            mediaHtml += `<img src="${qObj.image}" alt="שאלה ${qNum}" style="max-width: 100%; height: auto; display: block; margin: 15px auto; border: 2px solid #ccc; border-radius: 5px;">`;
        }
        
        // הוספת תמיכה באודיו
        if (qObj.audio) {
            mediaHtml += `
            <div style="text-align: center; padding: 10px; margin-bottom: 15px; background: #fafafa; border: 1px solid #eee; border-radius: 5px;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">השמעת הנחייה/קטע קול:</p>
                <audio id="audio_reg_${qNum}" src="${qObj.audio}" controls style="width: 100%;"></audio>
            </div>`;
        }

        if (inputType === 'text') {
            optionsHtml = `<textarea id="ans_text_${qNum}" rows="4" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-family:'Assistant'; font-size:16px; box-sizing:border-box;" placeholder="כתוב/כתבי את תשובתך כאן... (ניקוד יחושב ידנית)"></textarea>`;
        } else {
            let qOptions = qObj.options || currentSurveyData.options;
            if (qOptions) {
                qOptions.forEach((opt, optIndex) => {
                    const score = (qObj.scores && qObj.scores[optIndex]) !== undefined ? qObj.scores[optIndex] : 0; 
                    if (inputType === 'checkbox') {
                        optionsHtml += `<label class="option"><input type="checkbox" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
                    } else {
                        optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
                    }
                });
            }
        }
        
        html += `
        <div id="q${qNum}" class="section">
            <h2>שאלה ${qNum} מתוך ${totalQuestions}</h2>
            ${mediaHtml}
            <p class="scenario-text">${qObj.text}</p>
            <div style="margin-top:10px;">${optionsHtml}</div><br>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
            <button class="btn" onclick="handleNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button>
        </div>`;
    });
    container.innerHTML = html;
}

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

function handleNext(qNum) {
    let qObj = currentSurveyData.questions[qNum - 1];
    let inputType = qObj.inputType || 'radio';
    let answerVal = '';
    let scoreVal = 0;

    if (inputType === 'text') {
        let textEl = document.getElementById(`ans_text_${qNum}`);
        answerVal = textEl.value.trim();
        if (!answerVal) { showError("חובה לכתוב תשובה לפני שממשיכים!"); return; }
        scoreVal = 0;
    } else if (inputType === 'checkbox') {
        let checkedBoxes = document.getElementById('q' + qNum).querySelectorAll('input[type="checkbox"]:checked');
        if (checkedBoxes.length === 0) { showError("חובה לבחור לפחות תשובה אחת!"); return; }
        let vals = [];
        checkedBoxes.forEach(cb => { 
            vals.push(cb.value); 
            scoreVal += parseInt(cb.getAttribute('data-score')) || 0; 
        });
        answerVal = vals.join(" | "); 
    } else {
        const checkedRadio = document.getElementById('q' + qNum).querySelector('input[type="radio"]:checked');
        if (!checkedRadio) { showError("חובה לבחור תשובה לפני שממשיכים!"); return; }
        answerVal = checkedRadio.value;
        scoreVal = parseInt(checkedRadio.getAttribute('data-score')) || 0;
    }
    
    responses.Answers.push({ 
        Question_Number: qNum, 
        Question_Text: qObj.text || "שאלה " + qNum, 
        Part: qObj.part || "", 
        Answer: answerVal, 
        Score: scoreVal, 
        Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000) 
    });

    if (qNum < totalQuestions) { 
        switchPage('q' + qNum, 'q' + (qNum + 1)); 
        startTime = Date.now(); 
    } else { 
        finalizeSurvey(); 
    }
}

function finalizeSurvey() {
    responses["End_Time"] = new Date().toLocaleString();
    responses["Total_Score"] = responses.Answers.reduce((sum, ans) => sum + ans.Score, 0);
    
    responses["Scores_Parts"] = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    responses.Answers.forEach(ans => {
        if (ans.Part && responses["Scores_Parts"][ans.Part] !== undefined) { responses["Scores_Parts"][ans.Part] += ans.Score; }
    });

    if (currentSurveyData.type === 'digit_span') {
        responses["s5a_lastA"] = ds_lastCorrectA;
        responses["s5a_lastB"] = ds_lastCorrectB;
    }

    switchPage(document.querySelector('.section.active').id, 'success-msg'); 
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