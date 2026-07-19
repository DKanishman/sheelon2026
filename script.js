let startTime; 
let responses = {};
let currentSurveyData = null; 
let totalQuestions = 0;
let currentSurveyName = "";

let ds_part = 'A';
let ds_itemIdx = 0;
let ds_lastCorrectA = 0;
let ds_lastCorrectB = 0;

// *** חובה להדביק כאן את הקישור שקיבלת מגוגל שיטס לאחר הפריסה החדשה! ***
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwBcAQIwzi1PsL02Z3dMr7u7tE-k8gyrjY_WGoJKZYQrQIIAYu1hQ1V7zkCvFadDorr/exec'; 

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
    } else {
        renderRegularQuestions();
    }
}

// ============================================================
// מנגנון שאלון PAB
// ============================================================
function renderPabQuestions() {
    const container = document.getElementById('survey-container');
    const langOptions = `<option value="">בחר/י שפה...</option><option value="עברית">עברית</option><option value="ערבית">ערבית</option><option value="אנגלית">אנגלית</option><option value="רוסית">רוסית</option><option value="אמהרית">אמהרית</option><option value="צרפתית">צרפתית</option><option value="ספרדית">ספרדית</option><option value="יידיש">יידיש</option><option value="טיגריניה">טיגריניה</option><option value="אחר">אחר</option>`;
    const profOptions = `<option value="">רמת שליטה...</option><option value="בסיסית">בסיסית</option><option value="בינונית">בינונית</option><option value="טובה">טובה</option><option value="שוטפת">שוטפת</option>`;
    
    const diagnosesList = [
        'ADHD / קשב וריכוז', 'אוטיזם/אספרגר', 'לקות שפה התפתחותית', 'לקות למידה/דיסלקציה/דיסגרפיה',
        'חרדה/דיכאון/טראומה', 'OCD', 'אפילפסיה/פגיעת ראש/אירוע נוירולוגי', 'פגיעה בשמיעה או ראייה שאינה מתוקנת',
        'שימוש בחומרים/מצב רפואי פעיל המשפיע על תפקוד', 'אחר'
    ];

    let diagHtml = '';
    diagnosesList.forEach((diag, i) => {
        diagHtml += `
        <div class="pab-group" style="background:#fdfdfd; margin-bottom:10px; padding:10px;">
            <p style="font-weight:bold; margin-bottom:5px;">${diag}</p>
            <label><input type="radio" name="pab_diag_${i}" value="לא" checked onchange="togglePabDiag(${i})"> לא</label>
            <label style="margin-right:15px;"><input type="radio" name="pab_diag_${i}" value="כן" onchange="togglePabDiag(${i})"> כן</label>
            
            <div id="pab_diag_details_${i}" class="pab-hidden" style="margin-top:10px; border-top:1px dashed #ccc; padding-top:10px;">
                <input type="text" id="pab_diag_age_${i}" placeholder="גיל אבחון / הערות">
                <select id="pab_diag_who_${i}">
                    <option value="">מי ביצע את האבחון?</option>
                    <option value="פסיכולוג/ית">פסיכולוג/ית</option>
                    <option value="פסיכיאטר/ית">פסיכיאטר/ית</option>
                    <option value="נוירולוג/ית">נוירולוג/ית</option>
                    <option value="צוות רב־מקצועי">צוות רב־מקצועי</option>
                    <option value="אחר">אחר (פרט בהערות)</option>
                </select>
            </div>
        </div>`;
    });

    const treatmentsList = ['פסיכולוגי', 'נוירולוגי', 'תרופתי (יש לפרט תרופה ומינון)', 'אחר'];
    let treatHtml = '';
    treatmentsList.forEach((treat, i) => {
        treatHtml += `
        <div class="pab-group" style="background:#fdfdfd; margin-bottom:10px; padding:10px;">
            <label style="font-weight:bold; cursor:pointer;"><input type="checkbox" id="pab_treat_check_${i}" onchange="togglePabTreat(${i})"> ${treat}</label>
            <div id="pab_treat_details_${i}" class="pab-hidden" style="margin-top:10px;">
                <input type="number" id="pab_treat_age_${i}" placeholder="מאיזה גיל?">
                <input type="text" id="pab_treat_duration_${i}" placeholder="משך הטיפול">
                <input type="text" id="pab_treat_reason_${i}" placeholder="סיבה">
                <input type="text" id="pab_treat_helped_${i}" placeholder="האם הטיפול עזר? וכיצד?">
            </div>
        </div>`;
    });

    container.innerHTML = `
    <div id="pab-container" class="section">
        <h2>שאלון PAB - שאלון מקדים</h2>
        <div class="pab-group">
            <h3>1. פרטים כלליים ואישיים</h3>
            <label>תאריך פגישה:</label>
            <input type="date" id="pab_date">
            <select id="pab_meeting_type"><option value="">סוג פגישה...</option><option value="ZOOM">ZOOM</option><option value="פנים מול פנים (F2F)">פנים מול פנים (F2F)</option></select>
            <input type="number" id="pab_age" placeholder="גיל">
            <input type="text" id="pab_gender" placeholder="מגדר לפי דיווח עצמי">
        </div>

        <div class="pab-group">
            <h3>שפות</h3>
            <label style="font-weight:bold; display:block;">מהי שפת האם שלך (השפה הראשונה שנרכשה)?</label>
            <select id="pab_mothertongue" onchange="document.getElementById('pab_mothertongue_other').style.display = (this.value==='אחר' ? 'block' : 'none');">${langOptions}</select>
            <input type="text" id="pab_mothertongue_other" class="pab-hidden" placeholder="פרט שפת אם">

            <label style="font-weight:bold; display:block; margin-top:15px;">באיזו שפה את/ה משתמש/ת ברוב שעות היום?</label>
            <select id="pab_mainlang" onchange="document.getElementById('pab_mainlang_other').style.display = (this.value==='אחר' ? 'block' : 'none');">${langOptions}</select>
            <input type="text" id="pab_mainlang_other" class="pab-hidden" placeholder="פרט שפה">
            
            <label style="display:block; margin:20px 0 10px; font-weight:bold; font-size:18px; border-bottom:1px solid #ccc; padding-bottom:5px;">
                <input type="checkbox" id="pab_more_langs_check" onchange="document.getElementById('pab_more_langs').style.display = this.checked ? 'block' : 'none'" style="transform:scale(1.2); margin-left:5px;"> 
                האם את/ה דובר/ת שפות נוספות?
            </label>
            
            <div id="pab_more_langs" class="pab-hidden" style="background:#e8f4f8; padding:15px; border-radius:5px;">
                <p style="font-weight:bold; margin-top:0;">שפה נוספת 1:</p>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <select id="pab_lang1" style="flex:1;">${langOptions}</select>
                    <select id="pab_prof1" style="flex:1;">${profOptions}</select>
                </div>
                
                <label style="display:block; margin-bottom:10px; font-weight:bold;"><input type="checkbox" onchange="document.getElementById('pab_lang2_wrap').style.display = this.checked ? 'block' : 'none'"> הוסף שפה נוספת 2</label>
                <div id="pab_lang2_wrap" class="pab-hidden" style="margin-bottom:10px;">
                    <div style="display:flex; gap:10px;">
                        <select id="pab_lang2" style="flex:1;">${langOptions}</select>
                        <select id="pab_prof2" style="flex:1;">${profOptions}</select>
                    </div>
                </div>

                <label style="display:block; margin-bottom:10px; font-weight:bold;"><input type="checkbox" onchange="document.getElementById('pab_lang3_wrap').style.display = this.checked ? 'block' : 'none'"> הוסף שפה נוספת 3</label>
                <div id="pab_lang3_wrap" class="pab-hidden" style="margin-bottom:10px;">
                    <div style="display:flex; gap:10px;">
                        <select id="pab_lang3" style="flex:1;">${langOptions}</select>
                        <select id="pab_prof3" style="flex:1;">${profOptions}</select>
                    </div>
                </div>

                <select id="pab_lang_freq" style="margin-top:10px;">
                    <option value="">באיזו תדירות את/ה משתמש/ת בשפה הנוספת?</option>
                    <option value="כמעט אף פעם">כמעט אף פעם</option>
                    <option value="לעיתים רחוקות">לעיתים רחוקות</option>
                    <option value="מספר פעמים בשבוע">מספר פעמים בשבוע</option>
                    <option value="מדי יום">מדי יום</option>
                    <option value="רוב שעות היום">רוב שעות היום</option>
                </select>
            </div>
        </div>

        <div class="pab-group">
            <h3>רקע דמוגרפי</h3>
            <select id="pab_country" onchange="document.getElementById('pab_imm_wrap').style.display = (this.value==='אחר' ? 'block' : 'none');">
                <option value="">ארץ לידה...</option>
                <option value="ישראל">ישראל</option>
                <option value="אחר">אחר (לא ישראל)</option>
            </select>
            <div id="pab_imm_wrap" class="pab-hidden">
                <input type="text" id="pab_country_other" placeholder="פרט ארץ לידה">
                <input type="number" id="pab_imm_age" placeholder="באיזה גיל עברת להתגורר בישראל?">
            </div>
            <input type="number" id="pab_heb_age" placeholder="באיזה גיל התחלת לדבר בעברית?">
            <select id="pab_hand">
                <option value="">יד דומיננטית...</option>
                <option value="ימין">ימין</option>
                <option value="שמאל">שמאל</option>
                <option value="שתי הידיים">שתי הידיים</option>
            </select>
        </div>

        <div class="pab-group">
            <h3>השכלה ותעסוקה</h3>
            <input type="number" id="pab_edu_years" placeholder="שנות לימוד">
            <input type="text" id="pab_edu_high" placeholder="השכלה גבוהה ביותר">
            <input type="text" id="pab_prof" placeholder="מקצוע">
            <select id="pab_emp" onchange="document.getElementById('pab_emp_other').style.display = (this.value==='אחר' ? 'block' : 'none');">
                <option value="">מצב תעסוקתי...</option><option value="עובד/ת">עובד/ת</option><option value="סטודנט/ית">סטודנט/ית</option><option value="לא עובד/ת">לא עובד/ת</option><option value="גמלאי/ת">גמלאי/ת</option><option value="אחר">אחר</option>
            </select>
            <input type="text" id="pab_emp_other" class="pab-hidden" placeholder="פרט מצב תעסוקתי">
            <select id="pab_econ">
                <option value="">כיצד היית מדרג/ת את מצבך הכלכלי כיום?</option>
                <option value="נמוך מאוד">נמוך מאוד</option><option value="נמוך">נמוך</option><option value="ממוצע">ממוצע</option><option value="מעל הממוצע">מעל הממוצע</option><option value="גבוה">גבוה</option>
            </select>
            
            <p style="font-weight:bold; margin-top:15px;">השכלת הורים</p>
            <select id="pab_edu_mom"><option value="">השכלה גבוהה ביותר של האם...</option><option value="פחות מ-12 שנות לימוד">פחות מ-12 שנות לימוד</option><option value="תיכון">תיכון</option><option value="לימודים מקצועיים">לימודים מקצועיים</option><option value="תואר ראשון">תואר ראשון</option><option value="תואר שני">תואר שני</option><option value="דוקטורט">דוקטורט</option><option value="לא ידוע">לא ידוע</option></select>
            <select id="pab_edu_dad"><option value="">השכלה גבוהה ביותר של האב...</option><option value="פחות מ-12 שנות לימוד">פחות מ-12 שנות לימוד</option><option value="תיכון">תיכון</option><option value="לימודים מקצועיים">לימודים מקצועיים</option><option value="תואר ראשון">תואר ראשון</option><option value="תואר שני">תואר שני</option><option value="דוקטורט">דוקטורט</option><option value="לא ידוע">לא ידוע</option></select>
        </div>

        <div class="pab-group">
            <h3>בריאות</h3>
            <select id="pab_hearing"><option value="">לקות שמיעה (מכשיר שמיעה)?</option><option value="לא">לא</option><option value="כן">כן</option></select>
            <select id="pab_vision"><option value="">לקות ראייה (משקפיים)?</option><option value="לא">לא</option><option value="כן">כן</option></select>
            <select id="pab_meds" onchange="document.getElementById('pab_meds_text').style.display = (this.value==='כן' ? 'block' : 'none');">
                <option value="">אם נטלת תרופה היום, נא לציין (כן/לא)</option><option value="לא">לא</option><option value="כן">כן</option>
            </select>
            <input type="text" id="pab_meds_text" class="pab-hidden" placeholder="פרט איזו תרופה">
            <input type="number" id="pab_sleep" placeholder="כמה שעות ישנת בלילה האחרון?">
        </div>

        <div class="pab-group">
            <h3>2. רקע רפואי ואבחנות</h3>
            <p style="margin-bottom:15px;">האם קיימת בידך אבחנה כתובה לאחד מהבאים?</p>
            ${diagHtml}
        </div>

        <div class="pab-group">
            <h3>3. טיפולים</h3>
            <label style="font-weight:bold; display:block; margin-bottom:10px;">האם קיבלת בעבר או מקבל/ת כיום טיפול?</label>
            <select id="pab_any_treat" onchange="document.getElementById('pab_treat_wrap').style.display = (this.value==='כן' ? 'block' : 'none');">
                <option value="">בחר...</option><option value="לא">לא</option><option value="כן">כן</option>
            </select>
            <div id="pab_treat_wrap" class="pab-hidden" style="margin-top:15px; border-top:2px solid #3498db; padding-top:15px;">
                <p style="margin-bottom:10px;">נא סמן/י ומלא/י פרטים על הטיפולים הרלוונטיים:</p>
                ${treatHtml}
            </div>
        </div>

        <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
        <button class="btn btn-start" style="background-color: #27ae60;" onclick="finalizePAB()">סיום ושליחת שאלון PAB</button>
    </div>
    `;
    
    window.togglePabDiag = function(idx) {
        let val = document.querySelector(`input[name="pab_diag_${idx}"]:checked`).value;
        document.getElementById(`pab_diag_details_${idx}`).style.display = (val === 'כן') ? 'block' : 'none';
    };
    window.togglePabTreat = function(idx) {
        let checked = document.getElementById(`pab_treat_check_${idx}`).checked;
        document.getElementById(`pab_treat_details_${idx}`).style.display = checked ? 'block' : 'none';
    };
}

function finalizePAB() {
    let addAns = (q, a) => {
        responses.Answers.push({ Question_Number: responses.Answers.length+1, Question_Text: q, Part: "PAB", Answer: a || "לא צוין", Score: 0, Time_Taken_Sec: 0 });
    };

    addAns("תאריך וסוג פגישה", document.getElementById('pab_date').value + " | " + document.getElementById('pab_meeting_type').value);
    addAns("גיל (PAB)", document.getElementById('pab_age').value);
    addAns("מגדר", document.getElementById('pab_gender').value);
    
    let mt = document.getElementById('pab_mothertongue').value;
    if (mt === 'אחר') mt = document.getElementById('pab_mothertongue_other').value;
    addAns("שפת אם", mt);
    
    let ml = document.getElementById('pab_mainlang').value;
    if (ml === 'אחר') ml = document.getElementById('pab_mainlang_other').value;
    addAns("שפה מרכזית", ml);
    
    if (document.getElementById('pab_more_langs_check').checked) {
        let langs = `שפה 1: ${document.getElementById('pab_lang1').value} (${document.getElementById('pab_prof1').value})`;
        if(document.getElementById('pab_lang2_wrap').style.display === 'block') {
            langs += ` | שפה 2: ${document.getElementById('pab_lang2').value} (${document.getElementById('pab_prof2').value})`;
        }
        if(document.getElementById('pab_lang3_wrap').style.display === 'block') {
            langs += ` | שפה 3: ${document.getElementById('pab_lang3').value} (${document.getElementById('pab_prof3').value})`;
        }
        addAns("שפות נוספות", langs);
        addAns("תדירות שפה נוספת", document.getElementById('pab_lang_freq').value);
    } else {
        addAns("שפות נוספות", "אין");
        addAns("תדירות שפה נוספת", "לא רלוונטי");
    }

    let country = document.getElementById('pab_country').value;
    if(country === 'אחר') country = document.getElementById('pab_country_other').value + " (עלה בגיל " + document.getElementById('pab_imm_age').value + ")";
    addAns("ארץ לידה", country);
    addAns("גיל תחילת דיבור עברית", document.getElementById('pab_heb_age').value);
    addAns("יד דומיננטית", document.getElementById('pab_hand').value);
    addAns("שנות לימוד והשכלה", document.getElementById('pab_edu_years').value + " שנים | " + document.getElementById('pab_edu_high').value);
    addAns("מקצוע ותעסוקה", document.getElementById('pab_prof').value + " | " + (document.getElementById('pab_emp').value==='אחר'?document.getElementById('pab_emp_other').value:document.getElementById('pab_emp').value));
    addAns("מצב כלכלי", document.getElementById('pab_econ').value);
    addAns("השכלת הורים", "אם: " + document.getElementById('pab_edu_mom').value + " | אב: " + document.getElementById('pab_edu_dad').value);
    addAns("לקות שמיעה/ראייה", "שמיעה: " + document.getElementById('pab_hearing').value + " | ראייה: " + document.getElementById('pab_vision').value);
    
    let meds = document.getElementById('pab_meds').value;
    if(meds === 'כן') meds += " (" + document.getElementById('pab_meds_text').value + ")";
    addAns("נטילת תרופות היום", meds);
    addAns("שעות שינה", document.getElementById('pab_sleep').value);

    const diagnosesList = ['ADHD', 'אוטיזם/אספרגר', 'לקות שפה', 'לקות למידה', 'חרדה/דיכאון', 'OCD', 'אירוע נוירולוגי', 'שמיעה/ראייה', 'מצב רפואי/חומרים', 'אחר'];
    diagnosesList.forEach((diag, i) => {
        let isYes = document.querySelector(`input[name="pab_diag_${i}"]:checked`).value === 'כן';
        let ans = "לא";
        if(isYes) {
            ans = `כן | גיל/הערה: ${document.getElementById(`pab_diag_age_${i}`).value} | מאבחן: ${document.getElementById(`pab_diag_who_${i}`).value}`;
        }
        addAns(`אבחנה: ${diag}`, ans);
    });

    let anyTreat = document.getElementById('pab_any_treat').value;
    addAns("היסטוריית טיפולים", anyTreat);
    if(anyTreat === 'כן') {
        const treatmentsList = ['פסיכולוגי', 'נוירולוגי', 'תרופתי', 'אחר'];
        treatmentsList.forEach((treat, i) => {
            if(document.getElementById(`pab_treat_check_${i}`).checked) {
                let det = `גיל: ${document.getElementById(`pab_treat_age_${i}`).value} | משך: ${document.getElementById(`pab_treat_duration_${i}`).value} | סיבה: ${document.getElementById(`pab_treat_reason_${i}`).value} | עזר: ${document.getElementById(`pab_treat_helped_${i}`).value}`;
                addAns(`טיפול: ${treat}`, det);
            }
        });
    }

    finalizeSurvey();
}

function renderDigitSpanQuestions() {
    const container = document.getElementById('survey-container');
    let html = '';
    
    if (currentSurveyData.description) {
        html += `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;"><h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3></div>`;
    }

    ['A', 'B'].forEach(part => {
        let partData = currentSurveyData.parts[part];
        partData.items.forEach((item, index) => {
            html += `
            <div id="ds_sec_${part}_${index}" class="section">
                <h2 style="color: #2980b9;">${partData.title} - פריט ${index + 1}</h2>
                <p class="scenario-text">${partData.instruction}</p>
                
                <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px;">
                    <h4 style="margin-top: 0;">נסיון 1</h4>
                    <audio id="audio_ds_${part}_${index}_1" src="sound/s5a_${part}_${index}_1.mp3" type="audio/mpeg" preload="auto"></audio>
                    <button id="btn_ds_${part}_${index}_1" class="btn" style="background-color: #9b59b6; margin-top:0;" onclick="playDigitSpanAudio('${part}', ${index}, 1)">🔊 לחץ פעם אחת להשמעת המספרים</button>
                    <div id="timer_ds_${part}_${index}_1" style="color: #e74c3c; font-weight: bold; margin: 10px 0; font-size: 16px;"></div>
                    <input type="text" id="input_ds_${part}_${index}_1" disabled placeholder="הכנס את המספרים כאן לאחר סיום ההשמעה...">
                </div>

                <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px;">
                    <h4 style="margin-top: 0;">נסיון 2</h4>
                    <audio id="audio_ds_${part}_${index}_2" src="sound/s5a_${part}_${index}_2.mp3" type="audio/mpeg" preload="auto"></audio>
                    <button id="btn_ds_${part}_${index}_2" class="btn" style="background-color: #9b59b6; margin-top:0;" onclick="playDigitSpanAudio('${part}', ${index}, 2)">🔊 לחץ פעם אחת להשמעת המספרים</button>
                    <div id="timer_ds_${part}_${index}_2" style="color: #e74c3c; font-weight: bold; margin: 10px 0; font-size: 16px;"></div>
                    <input type="text" id="input_ds_${part}_${index}_2" disabled placeholder="הכנס את המספרים כאן לאחר סיום ההשמעה...">
                </div>

                <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
                <button class="btn btn-start" style="background-color: #27ae60;" onclick="nextDigitSpanItem('${part}', ${index})">שמור והמשך</button>
            </div>`;
        });
    });

    container.innerHTML = html;
}

function playDigitSpanAudio(part, index, trial) {
    let audioEl = document.getElementById(`audio_ds_${part}_${index}_${trial}`);
    let btnEl = document.getElementById(`btn_ds_${part}_${index}_${trial}`);
    let inputEl = document.getElementById(`input_ds_${part}_${index}_${trial}`);
    let timerEl = document.getElementById(`timer_ds_${part}_${index}_${trial}`);

    if (!audioEl) return;
    
    btnEl.disabled = true;
    btnEl.innerText = "ההקלטה הושמעה";
    btnEl.style.backgroundColor = "#ccc";

    let playPromise = audioEl.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            showError(`שגיאה בהפעלת האודיו. ייתכן שהקובץ sound/s5a_${part}_${index}_${trial}.mp3 חסר.`);
            inputEl.disabled = false;
        });
    }

    audioEl.onended = function() {
        inputEl.disabled = false;
        inputEl.focus();
        let timeLeft = 60;
        timerEl.innerText = `נותרו ${timeLeft} שניות להקלדה`;
        
        let timerInterval = setInterval(() => {
            timeLeft--;
            if(timeLeft > 0) {
                timerEl.innerText = `נותרו ${timeLeft} שניות להקלדה`;
            } else {
                clearInterval(timerInterval);
                inputEl.disabled = true;
                timerEl.innerText = "הזמן עבר! לא ניתן להקליד יותר.";
            }
        }, 1000);
        
        inputEl.setAttribute('data-timer', timerInterval);
    };
}

function nextDigitSpanItem(part, idx) {
    let t1Timer = document.getElementById(`input_ds_${part}_${idx}_1`).getAttribute('data-timer');
    let t2Timer = document.getElementById(`input_ds_${part}_${idx}_2`).getAttribute('data-timer');
    if (t1Timer) clearInterval(t1Timer);
    if (t2Timer) clearInterval(t2Timer);

    let t1Input = document.getElementById(`input_ds_${part}_${idx}_1`).value.replace(/[^0-9]/g, '');
    let t2Input = document.getElementById(`input_ds_${part}_${idx}_2`).value.replace(/[^0-9]/g, '');
    
    let t1Target = currentSurveyData.parts[part].items[idx].t1;
    let t2Target = currentSurveyData.parts[part].items[idx].t2;

    let score1 = (t1Input === t1Target) ? 1 : 0;
    let score2 = (t2Input === t2Target) ? 1 : 0;
    let itemScore = score1 + score2;

    if (itemScore > 0) {
        if (part === 'A') ds_lastCorrectA = idx + 1;
        else ds_lastCorrectB = idx + 1;
    }

    responses.Answers.push({
        Question_Number: idx + 1,
        Question_Text: `פריט ${idx + 1}`,
        Part: part,
        Answer: `נסיון 1: ${t1Input || '[ריק]'} | נסיון 2: ${t2Input || '[ריק]'}`,
        Score: itemScore,
        Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000)
    });

    if (itemScore === 0) {
        if (part === 'A') {
            switchPage(`ds_sec_A_${idx}`, `ds_sec_B_0`);
            startTime = Date.now();
        } else {
            finalizeSurvey();
        }
    } else {
        let nextIdx = idx + 1;
        if (nextIdx < currentSurveyData.parts[part].items.length) {
            switchPage(`ds_sec_${part}_${idx}`, `ds_sec_${part}_${nextIdx}`);
            startTime = Date.now();
        } else {
            if (part === 'A') {
                switchPage(`ds_sec_A_${idx}`, `ds_sec_B_0`);
                startTime = Date.now();
            } else {
                finalizeSurvey();
            }
        }
    }
}

function renderFauxPasQuestions() {
    const container = document.getElementById('survey-container'); 
    let html = '';
    if (currentSurveyData.description) {
        html += `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;"><h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3></div>`;
    }
    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        html += `
        <div id="q${qNum}" class="section">
            <h2>שאלה ${qNum} מתוך ${totalQuestions}</h2>
            <div style="background: #fff; border-radius: 5px; border: 1px solid #ddd; margin-bottom: 20px;">
                <p class="scenario-text" style="font-size: 18px; font-weight: normal; line-height: 1.6; padding: 15px; margin: 0;">${qObj.story}</p>
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
                        <option value="">-- בחר/י תשובה --</option><option value="כן">כן</option><option value="לא">לא</option>
                    </select>
                    <button class="btn btn-start" style="margin-top: 15px;" onclick="nextFauxPasStep(${qNum}, 1)">המשך</button>
                </div>
                <div id="fp_step2_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">2. מי אמר משהו שהוא לא היה צריך להגיד?</p><input type="text" id="fp_q2_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;"><button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 2)">חזור אחורה</button><button class="btn btn-start" style="flex: 1; margin: 0;" onclick="nextFauxPasStep(${qNum}, 2)">המשך</button></div>
                </div>
                <div id="fp_step3_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">3. מדוע הוא/היא לא היה צריך להגיד זאת?</p><input type="text" id="fp_q3_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;"><button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 3)">חזור אחורה</button><button class="btn btn-start" style="flex: 1; margin: 0;" onclick="nextFauxPasStep(${qNum}, 3)">המשך</button></div>
                </div>
                <div id="fp_step4_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">4. מדוע הוא אמר זאת?</p><input type="text" id="fp_q4_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;"><button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 4)">חזור אחורה</button><button class="btn btn-start" style="flex: 1; margin: 0;" onclick="nextFauxPasStep(${qNum}, 4)">המשך</button></div>
                </div>
                <div id="fp_step5_${qNum}" style="display: none;">
                    <p style="font-weight: bold; margin-bottom: 5px;">5. ${qObj.q5}</p><input type="text" id="fp_q5_${qNum}" placeholder="הכנס/י תשובה כאן...">
                    <div style="display: flex; gap: 10px; margin-top: 15px;"><button class="btn btn-back" style="flex: 1; margin: 0;" onclick="prevFauxPasStep(${qNum}, 5)">חזור אחורה</button><button class="btn btn-start" style="flex: 1; background-color: #27ae60; margin: 0;" onclick="handleFauxPasNext(${qNum})">${qNum < totalQuestions ? 'המשך לשאלה הבאה' : 'סיום ושליחה'}</button></div>
                </div>
            </div><br><button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
        </div>`;
    });
    container.innerHTML = html;
}

function renderVocabularyQuestions() {
    const container = document.getElementById('survey-container');
    let html = '';

    if (currentSurveyData.description) {
        html += `<div style="margin-bottom: 20px; background: #e8f4f8; padding: 15px; border-radius: 5px;">
                    <h3 style="margin: 0; color: #2c3e50; text-align: center;">${currentSurveyData.description}</h3>
                 </div>`;
    }

    currentSurveyData.questions.forEach((pageObj, index) => {
        const pageNum = index + 1;
        let wordsHtml = '';
        
        pageObj.words.forEach(word => {
            wordsHtml += `
            <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0; font-size: 20px;">${word.id}. ${word.text}</h3>
                    <div>
                        <audio id="audio_v_${word.id}" src="sound/t6s${word.id}.wav" type="audio/wav" preload="auto"></audio>
                        <button id="btn_audio_v_${word.id}" class="btn btn-audio" style="background-color: #9b59b6; margin: 0; padding: 8px 15px; font-size: 14px;" onclick="playVocabAudio(${word.id})">
                            🔊 השמע
                        </button>
                    </div>
                </div>
                <input type="text" id="vocab_input_${word.id}" placeholder="הכנס/י את משמעות המילה כאן..." style="width: 100%; box-sizing: border-box;">
            </div>`;
        });

        html += `
        <div id="q${pageNum}" class="section">
            <h2>עמוד ${pageNum} מתוך ${totalQuestions}</h2>
            ${wordsHtml}
            <br>
            <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
            <button class="btn btn-start" onclick="handleVocabNext(${pageNum})">${pageNum < totalQuestions ? 'המשך לעמוד הבא' : 'סיום ושליחה'}</button>
        </div>`;
    });
    container.innerHTML = html;
}

function playVocabAudio(wordId) {
    let audioEl = document.getElementById(`audio_v_${wordId}`);
    let btnEl = document.getElementById(`btn_audio_v_${wordId}`);
    if (!audioEl) return;

    if (audioEl.paused) {
        document.querySelectorAll('audio').forEach(a => { if(a !== audioEl) { a.pause(); a.currentTime = 0; } });
        document.querySelectorAll('.btn-audio').forEach(b => {
            if (b.id.startsWith('btn_audio_v_')) b.innerHTML = '🔊 השמע';
            else if (b.id.startsWith('btn_audio_')) b.innerHTML = '🔊 השמע סיפור';
        });
        audioEl.load();
        let playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => { btnEl.innerHTML = '⏸ עצור'; })
            .catch(error => { 
                showError("שגיאה: הקובץ לא נמצא."); 
            });
        }
    } else {
        audioEl.pause();
        btnEl.innerHTML = '🔊 השמע';
    }
    audioEl.onended = function() { btnEl.innerHTML = '🔊 השמע'; };
}

function handleVocabNext(pageNum) {
    const pageObj = currentSurveyData.questions[pageNum - 1];
    let allFilled = true;
    let tempAnswers = [];

    pageObj.words.forEach(word => {
        let inputEl = document.getElementById(`vocab_input_${word.id}`);
        let val = inputEl.value.trim();
        if (!val) {
            allFilled = false;
        } else {
            tempAnswers.push({
                Question_Number: word.id,
                Question_Text: word.text,
                Part: "עמוד " + pageNum,
                Answer: val,
                Score: 0, 
                Time_Taken_Sec: Math.round((Date.now() - startTime) / 1000)
            });
        }
    });

    if (!allFilled) {
        showError("אנא כתוב/כתבי את המשמעות של כל המילים בעמוד זה לפני שממשיכים.");
        return;
    }

    tempAnswers.forEach(ans => responses.Answers.push(ans));

    if (pageNum < totalQuestions) {
        switchPage('q' + pageNum, 'q' + (pageNum + 1));
        startTime = Date.now(); 
    } else {
        finalizeSurvey();
    }
}

function playStoryAudio(qNum) {
    let audioEl = document.getElementById(`audio_${qNum}`);
    let btnEl = document.getElementById(`btn_audio_${qNum}`);
    if (!audioEl) return;

    if (audioEl.paused) {
        document.querySelectorAll('audio').forEach(a => { if(a !== audioEl) { a.pause(); a.currentTime = 0; } });
        document.querySelectorAll('.btn-audio').forEach(b => { 
            if (b.id.startsWith('btn_audio_v_')) b.innerHTML = '🔊 השמע';
            else if (b.id.startsWith('btn_audio_')) b.innerHTML = '🔊 השמע סיפור'; 
        });
        audioEl.load();
        let playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(() => { btnEl.innerHTML = '⏸ עצור השמעה'; })
            .catch(error => { showError("שגיאה: הקובץ לא נמצא בתיקיית sound."); });
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

        if (inputType === 'text') {
            optionsHtml = `<textarea id="ans_text_${qNum}" rows="4" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-family:'Assistant'; font-size:16px; box-sizing:border-box;" placeholder="כתוב את תשובתך כאן..."></textarea>`;
        } else {
            let qOptions = qObj.options || currentSurveyData.options;
            qOptions.forEach((opt, optIndex) => {
                const score = (qObj.scores && qObj.scores[optIndex]) !== undefined ? qObj.scores[optIndex] : 0; 
                if (inputType === 'checkbox') {
                    optionsHtml += `<label class="option"><input type="checkbox" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
                } else {
                    optionsHtml += `<label class="option"><input type="radio" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
                }
            });
        }
        
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

function goBackToMain() { document.querySelector('.section.active')?.classList.remove('active'); document.getElementById('custom-confirm').classList.add('active'); }

function confirmBack() { 
    let hadConsent = responses["Consent_Agreed"]; 
    responses = {}; 
    if (hadConsent) responses["Consent_Agreed"] = hadConsent; 
    document.getElementById('survey-container').innerHTML = ''; 
    document.getElementById('custom-confirm').classList.remove('active'); 
    document.getElementById('survey-selection').classList.add('active'); 
}

function cancelBack() { 
    document.getElementById('custom-confirm').classList.remove('active'); 
    if (currentSurveyData.type === 'digit_span') {
        document.getElementById(`ds_sec_${ds_part}_${ds_itemIdx}`).classList.add('active');
    } else if (currentSurveyData.type === 'pab') {
        document.getElementById('pab-container').classList.add('active');
    } else {
        const questions = document.querySelectorAll('#survey-container .section'); 
        for (let i = questions.length - 1; i >= 0; i--) { 
            if (responses.Answers && responses.Answers.length === i) { questions[i].classList.add('active'); return; } 
        } 
    }
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

function showError(msg) {
    const eb = document.getElementById('error-box'); eb.innerText = msg; eb.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => { eb.style.display = 'none'; }, 3500);
}

function switchPage(hideId, showId) {
    document.querySelectorAll('audio').forEach(a => { a.pause(); a.currentTime = 0; }); 
    
    let hideEl = document.getElementById(hideId); let showEl = document.getElementById(showId);
    if(hideEl) hideEl.classList.remove('active'); if(showEl) showEl.classList.add('active');
}