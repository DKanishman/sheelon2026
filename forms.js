// --- forms.js ---
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

function goBackToMain() { 
    document.querySelector('.section.active')?.classList.remove('active'); 
    document.getElementById('custom-confirm').classList.add('active'); 
}

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