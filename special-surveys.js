// --- special-surveys.js ---

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

// ============================================================
// מנגנון זכירת ספרות (Digit Span)
// ============================================================
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

// ============================================================
// מנגנון Faux Pas
// ============================================================
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

// ============================================================
// מנגנון אוצר מילים
// ============================================================
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

function renderSurvey12Questions() {
    const container = document.getElementById('survey-container');
    let html = '';

    // יצירת עמוד הפתיחה עם הטופס לפרטים אישיים
    html += `
    <div id="s12_intro" class="section">
        <h2>שאלון 12 - פרטים אישיים</h2>
        <p style="margin-bottom: 20px; color: #555;">אנא מלא/י את הפרטים הבאים לפני התחלת השאלון (השם ושם המשפחה כבר נשמרו במערכת).</p>
        
        <div class="pab-group" style="background: #fdfdfd; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 0; color: #2c3e50;">פרטים אישיים</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div><label>מיגדר:</label><select id="s12_gender"><option value="">בחר...</option><option value="זכר">זכר</option><option value="נקבה">נקבה</option><option value="אחר">אחר</option></select></div>
                <div><label>גיל:</label><input type="number" id="s12_age" placeholder="גיל"></div>
                <div><label>יד דומינאנטית:</label><select id="s12_hand"><option value="">בחר...</option><option value="ימין">ימין</option><option value="שמאל">שמאל</option><option value="דו-ידי">דו-ידי</option></select></div>
                <div><label>מקום הלידה:</label><input type="text" id="s12_birth" placeholder="מקום הלידה"></div>
                <div><label>השכלה:</label><input type="text" id="s12_edu" placeholder="השכלה"></div>
                <div><label>שנות לימוד/כיתה:</label><input type="text" id="s12_edu_years" placeholder="שנות לימוד/כיתה"></div>
                <div style="grid-column: span 2;"><label>מקצוע:</label><input type="text" id="s12_prof" placeholder="מקצוע"></div>
            </div>
        </div>

        <div class="pab-group" style="background: #fdfdfd; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin-top: 15px;">
            <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 0; color: #2c3e50;">פרטים נוספים</h3>
            <div style="margin-bottom: 10px;"><label>האם נעשו אבחונים בעבר?</label><select id="s12_diag"><option value="">בחר...</option><option value="כן">כן</option><option value="לא">לא</option></select></div>
            <div style="margin-bottom: 10px;"><label>קשיי קשב וריכוז:</label><select id="s12_adhd"><option value="">בחר...</option><option value="כן">כן</option><option value="לא">לא</option></select></div>
            <div style="margin-bottom: 10px;"><label>אוטיזם:</label><select id="s12_aut"><option value="">בחר...</option><option value="כן">כן</option><option value="לא">לא</option></select></div>
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                <label>לקויות למידה:</label><select id="s12_ld"><option value="">בחר...</option><option value="כן">כן</option><option value="לא">לא</option></select>
                <input type="text" id="s12_ld_spec" placeholder="לציין איזה..." style="flex: 1; margin: 0;">
            </div>
            <div><label>אחר:</label><input type="text" id="s12_other" placeholder="פרט..."></div>
        </div>

        <button class="btn btn-back" onclick="goBackToMain()">חזור למסך הראשי</button>
        <button class="btn btn-start" style="background-color: #27ae60;" onclick="submitSurvey12Intro()">שמור נתונים והמשך לשאלון</button>
    </div>`;

    // רינדור השאלות הרגילות של שאלון 12 שיופיעו מיד לאחר הטופס
    currentSurveyData.questions.forEach((qObj, index) => {
        const qNum = index + 1; 
        let optionsHtml = '';
        let inputType = qObj.inputType || 'radio';
        let mediaHtml = '';
        
        if (qObj.image) mediaHtml += `<img src="${qObj.image}" alt="שאלה ${qNum}" style="max-width: 100%; height: auto; display: block; margin: 15px auto; border: 2px solid #ccc; border-radius: 5px;">`;
        if (qObj.audio) mediaHtml += `<div style="text-align: center; padding: 10px; margin-bottom: 15px; background: #fafafa; border: 1px solid #eee; border-radius: 5px;"><p style="margin: 0 0 10px 0; font-weight: bold;">השמעת הנחייה/קטע קול:</p><audio id="audio_reg_${qNum}" src="${qObj.audio}" controls style="width: 100%;"></audio></div>`;

        if (inputType === 'text') {
            optionsHtml = `<textarea id="ans_text_${qNum}" rows="4" style="width:100%; padding:10px; border-radius:5px; border:1px solid #ccc; font-family:'Assistant'; font-size:16px; box-sizing:border-box;" placeholder="כתוב/כתבי את תשובתך כאן... (ניקוד יחושב ידנית)"></textarea>`;
        } else {
            let qOptions = qObj.options || currentSurveyData.options;
            if (qOptions) {
                qOptions.forEach((opt, optIndex) => {
                    const score = (qObj.scores && qObj.scores[optIndex]) !== undefined ? qObj.scores[optIndex] : 0; 
                    optionsHtml += `<label class="option"><input type="${inputType}" name="ans${qNum}" value="${opt}" data-score="${score}"> ${opt}</label>`;
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

function submitSurvey12Intro() {
    let gender = document.getElementById('s12_gender').value;
    let age = document.getElementById('s12_age').value;
    
    // בדיקת תקינות קצרה לנתוני חובה
    if(!gender || !age) {
        showError("אנא מלא/י לפחות את שדות המיגדר והגיל כדי להמשיך.");
        return;
    }

    // פונקציית עזר להוספת התשובות לאובייקט התשובות הראשי
    let pushAns = (q, a) => {
        responses.Answers.push({ 
            Question_Number: 0, 
            Question_Text: q, 
            Part: "פרטים אישיים (שאלון 12)", 
            Answer: a || "-", 
            Score: 0, 
            Time_Taken_Sec: 0 
        });
    };

    pushAns("מיגדר", gender);
    pushAns("גיל", age);
    pushAns("יד דומינאנטית", document.getElementById('s12_hand').value);
    pushAns("מקום הלידה", document.getElementById('s12_birth').value);
    pushAns("השכלה", document.getElementById('s12_edu').value);
    pushAns("שנות לימוד/כיתה", document.getElementById('s12_edu_years').value);
    pushAns("מקצוע", document.getElementById('s12_prof').value);
    
    pushAns("האם נעשו אבחונים", document.getElementById('s12_diag').value);
    pushAns("קשיי קשב וריכוז", document.getElementById('s12_adhd').value);
    pushAns("אוטיזם", document.getElementById('s12_aut').value);
    
    let ld = document.getElementById('s12_ld').value;
    let ld_spec = document.getElementById('s12_ld_spec').value;
    pushAns("לקויות למידה", ld + (ld === 'כן' && ld_spec ? ` (פירוט: ${ld_spec})` : ""));
    
    pushAns("אבחונים אחרים", document.getElementById('s12_other').value);

    // מעבר לשאלה האמיתית הראשונה בשאלון
    switchPage('s12_intro', 'q1');
    startTime = Date.now();
}