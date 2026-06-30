let startTime; 
let responses = {};
let currentSurveyData = null; 
let totalQuestions = 0;
let currentSurveyName = "";

// *** חובה להדביק כאן את הקישור שקיבלת מגוגל שיטס! ***
const SCRIPT_URL = 'הכנס_כאן_את_הקישור_של_גוגל_שיטס'; 

function selectSurvey(surveyId) {
    // טריק שבירת מטמון (Cache Busting): הוספת זמן נוכחי כדי שהדפדפן יחשוב שזה תמיד קובץ חדש
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
            switchPage('survey-selection', 'intro');
        })
        .catch(error => {
            showError("שגיאה: לא הצלחנו לטעון את השאלונים. אנא ודאו שיש חיבור אינטרנט תקין.");
        });
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
    responses["Answers"] = [];
    responses["Total_Score"] = 0;

    renderQuestions();
    switchPage('intro', 'q1');
    startTime = Date.now(); 
}

function renderQuestions() {
    const container = document.getElementById('survey-container');
    let html = '';
    
    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1;
        
        let optionsHtml = '';
        currentSurveyData.options.forEach((opt, optIndex) => {
            const score = qObj.scores[optIndex];
            optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
        });
        
        html += `
        <div id="q${qNum}" class="section">
            <h2>שאלה ${qNum} מתוך ${totalQuestions}</h2>
            <p class="scenario-text">${qObj.text}</p>
            <div style="margin-top:10px;">
                ${optionsHtml}
            </div>
            <button class="btn" onclick="handleNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

function handleNext(qNum) {
    const section = document.getElementById('q' + qNum);
    const checkedRadio = section.querySelector('input[type="radio"]:checked');
    
    if (!checkedRadio) { 
        showError("חובה לבחור תשובה לפני שממשיכים!"); 
        return; 
    }
    
    const answerScore = parseInt(checkedRadio.getAttribute('data-score'));
    let timeTakenSeconds = Math.round((Date.now() - startTime) / 1000); 

    responses.Answers.push({ 
        Question_Number: qNum, 
        Question_Text: currentSurveyData.questions[qNum - 1].text,
        Answer: checkedRadio.value, 
        Score: answerScore,
        Time_Taken_Sec: timeTakenSeconds 
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
    
    // סכימת הציון הכולל
    responses["Total_Score"] = responses.Answers.reduce((sum, ans) => sum + ans.Score, 0);
    
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
            <p style="color: #555555; margin-bottom: 20px;">ניתן לסגור לשונית זו כעת.</p>
        `;
    })
    .catch(error => {
        showError("אירעה שגיאה בשליחת הנתונים. אנא נסה שוב.");
    });
}

function showError(msg) {
    const errorBox = document.getElementById('error-box');
    errorBox.innerText = msg;
    errorBox.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    setTimeout(() => { errorBox.style.display = 'none'; }, 3500);
}

function switchPage(hideId, showId) {
    let hideEl = document.getElementById(hideId);
    let showEl = document.getElementById(showId);
    if(hideEl) hideEl.classList.remove('active');
    if(showEl) showEl.classList.add('active');
}