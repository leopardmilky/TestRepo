
// 이메일 중복 체크
const email = document.querySelector('#email');
const emailCheckMessage = document.querySelector('.emailCheckMessage');

email.onblur = async function (e) {

const emailRegExp = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
const checkEmail = emailRegExp.test(email.value);   // 이메일 정규식 체크(true, false 반환)

    if(!email.value) {  // input에 값이 없을때
        emailCheckMessage.setAttribute('style', 'color: red;');
        emailCheckMessage.innerHTML = '필수 항목입니다.';
        email.removeAttribute('class');
        email.setAttribute('class', 'form-control signupInvalid');
        checkAllInput();
    }

    if(email.value){    // input에 값이 있을때
        if(checkEmail){ // 정규식 체크
            const emailResult = await axios.get(`/signup/check?email=${email.value}`); // 중복 검사
            if(emailResult.data == 'ok') {  
                emailCheckMessage.setAttribute('style', 'color: green;');
                emailCheckMessage.innerHTML = '사용 가능한 이메일입니다.';
                email.removeAttribute('class');
                email.setAttribute('class', 'form-control signupValid');
                checkAllInput();
            }
            if(emailResult.data == 'duplicated') {
                emailCheckMessage.setAttribute('style', 'color: red;');
                emailCheckMessage.innerHTML = '사용할 수 없는 이메일입니다.';
                email.removeAttribute('class');
                email.setAttribute('class', 'form-control signupInvalid');
                checkAllInput();
            }
        }
        if(!checkEmail){
            emailCheckMessage.setAttribute('style', 'color: red;');
            emailCheckMessage.innerHTML = '사용할 수 없는 이메일입니다.';
            email.removeAttribute('class');
            email.setAttribute('class', 'form-control signupInvalid');
            checkAllInput();
        }
    }
    // 이메일 형식에 맞췄는지 확인하는 정규식. 또는 이메일 인증 버튼 클릭 시 중복검사&인증 진행.
}


// 닉네임 중복 체크
const nickname = document.querySelector('#nickname');
const nicknameCheckMessage = document.querySelector('.nicknameCheckMessage');

nickname.onblur = async function (e) {

    if(!nickname.value) {
        nicknameCheckMessage.setAttribute('style', 'color: red;')
        nicknameCheckMessage.innerHTML = '필수 항목입니다.';
        nickname.removeAttribute('class')
        nickname.setAttribute('class', 'form-control signupInvalid')
        checkAllInput()
    }

    if(nickname.value) { // input에 값이 채워져 있을때 체크 진행.
        const nicknameResult = await axios.get(`/signup/check?nickname=${nickname.value}`);
        if(nicknameResult.data == 'ok') {
            nicknameCheckMessage.setAttribute('style', 'color: green;')
            nicknameCheckMessage.innerHTML = '사용 가능한 닉네임입니다.';
            nickname.removeAttribute('class');
            nickname.setAttribute('class', 'form-control signupValid');
            checkAllInput()
        }
        if(nicknameResult.data == 'notok') {
            nicknameCheckMessage.setAttribute('style', 'color: red;')
            nicknameCheckMessage.innerHTML = '사용중인 닉네임입니다.';
            nickname.removeAttribute('class')
            nickname.setAttribute('class', 'form-control signupInvalid')
            checkAllInput()
        }
    }
}


// 비밀번호 확인
const password = document.querySelector('#password');
const confirmPwd = document.querySelector('#confirmPwd');
const passwordCheckMessage = document.querySelector('.passwordCheckMessage');
const confirmPwdCheckMessage = document.querySelector('.confirmPwdCheckMessage');

password.onblur = function (e) {

    if(!password.value) {   // input에 아무것도 없는 경우.
        passwordCheckMessage.setAttribute('style', 'color: red;')
        passwordCheckMessage.innerHTML = '필수 항목입니다.';
        confirmPwdCheckMessage.innerHTML = '';
        password.removeAttribute('class')
        password.setAttribute('class', 'form-control signupInvalid')
        checkAllInput()
    }

    if(password.value.length > 0 & password.value.length < 6) { // 요구 자릿수가 부족한 경우. (6자리)
        passwordCheckMessage.setAttribute('style', 'color: red;')
        passwordCheckMessage.innerHTML = '최소 6자리 이상';
        password.removeAttribute('class')
        password.setAttribute('class', 'form-control signupInvalid')

        confirmPwdCheckMessage.innerHTML = '';
        checkAllInput()
    }

}

password.oninput = function (e) {

    if(password.value.length > 5 & confirmPwd.value.length > 5) { // input에 6글자 이상 값이 채워져 있을때 체크 진행.
        if(password.value == confirmPwd.value) {
            confirmPwdCheckMessage.setAttribute('style', 'color: green;')
            confirmPwdCheckMessage.innerHTML = '비밀번호 일치';
            passwordCheckMessage.innerHTML = '';
            password.removeAttribute('class')
            password.setAttribute('class', 'form-control signupValid');
            confirmPwd.removeAttribute('class')
            confirmPwd.setAttribute('class', 'form-control signupValid');
            checkAllInput()
        }
    
        if(password.value != confirmPwd.value) {    // 확인 탭과 일치하지 않는 경우.
            confirmPwdCheckMessage.setAttribute('style', 'color: red;')
            confirmPwdCheckMessage.innerHTML = '비밀번호가 일치하지 않습니다.';
            password.removeAttribute('class')
            password.setAttribute('class', 'form-control signupInvalid')
            confirmPwd.removeAttribute('class')
            confirmPwd.setAttribute('class', 'form-control signupInvalid')
            checkAllInput()
        }
    }
}

confirmPwd.onblur = function (e) {

    if(!confirmPwd.value) {
        confirmPwdCheckMessage.setAttribute('style', 'color: red;')
        confirmPwdCheckMessage.innerHTML = '필수 항목입니다.';
        confirmPwd.removeAttribute('class')
        confirmPwd.setAttribute('class', 'form-control signupInvalid')
        checkAllInput()
    }

    if(confirmPwd.value.length > 0 & confirmPwd.value.length < 6) {
        confirmPwdCheckMessage.setAttribute('style', 'color: red;')
        confirmPwdCheckMessage.innerHTML = '최소 6자리 이상';
        confirmPwd.removeAttribute('class')
        confirmPwd.setAttribute('class', 'form-control signupInvalid')
        checkAllInput()
    }
}

confirmPwd.onkeyup = function (e) {

    if(password.value.length > 5 & confirmPwd.value.length > 5) {
        if(password.value == confirmPwd.value) {
            confirmPwdCheckMessage.setAttribute('style', 'color: green;')
            confirmPwdCheckMessage.innerHTML = '비밀번호 일치';
            passwordCheckMessage.innerHTML = '';
            password.removeAttribute('class')
            password.setAttribute('class', 'form-control signupValid');
            confirmPwd.removeAttribute('class')
            confirmPwd.setAttribute('class', 'form-control signupValid');
            checkAllInput()
        }
    
        if(password.value != confirmPwd.value) {
            confirmPwdCheckMessage.setAttribute('style', 'color: red;')
            confirmPwdCheckMessage.innerHTML = '비밀번호가 일치하지 않습니다.';
            password.removeAttribute('class')
            password.setAttribute('class', 'form-control signupInvalid')
            confirmPwd.removeAttribute('class')
            confirmPwd.setAttribute('class', 'form-control signupInvalid')
            checkAllInput()
        }
    }
    // 최소 자릿수, 생성 규칙(ex 공백X, 특수문자포함 등....)
}


// Sign up 버튼 활성화
function checkAllInput(){
    const signupBtn = document.querySelector('.signupBtn');
    const check1 = email.classList.contains('signupValid');
    const check2 = nickname.classList.contains('signupValid');
    const check3 = password.classList.contains('signupValid');
    const check4 = confirmPwd.classList.contains('signupValid');
    const verificationCode = document.getElementById('verificationCode');
    if(verificationCode){
        const check5 = verificationCode.classList.contains('signupValid');

        if(check1 & check2 & check3 & check4 & check5) {
            signupBtn.removeAttribute('class');
            signupBtn.setAttribute('class', 'w-25 btn btn-success signupBtn');
        } else {
            signupBtn.removeAttribute('class');
            signupBtn.setAttribute('class', 'w-25 btn btn-success signupBtn disabled');
        }
    }

}


// 이메일 인증하기 버튼 클릭 시
const emailCheck = document.getElementById('emailVerification');
emailCheck.addEventListener('click', async function(event){
    const emailResult = await axios.get(`/signup/check?email=${email.value}`);
    if(emailResult.data == 'ok'){

        const inputValue = document.getElementById('email').value;
        window.alert(`${inputValue}으로 인증번호를 보냈습니다.`);

        await axios.get(`/signup/verifyemail?email=${email.value}`)
        .then((res) => {
            console.log("RES_RESULT: ", res.data);
            createInputCode()
        })
    }
    if(emailResult.data == 'duplicated'){
        emailCheckMessage.setAttribute('style', 'color: red;');
        emailCheckMessage.innerHTML = '사용할 수 없는 이메일입니다.';
        email.removeAttribute('class');
        email.setAttribute('class', 'form-control signupInvalid');
        checkAllInput();
    }
});


// 인증 코드
function createInputCode() {

    verificationTimer()

    const verificationCode = document.getElementById('verificationCode');
    if(!verificationCode) {
        const verificationWrap = document.createElement('div');
        const inputWrap = document.createElement('div');
        const verificationCode = document.createElement('input');
        const checkVerificationCode = document.createElement('button');
        const verificationInfo = document.createElement('div');
        const message = document.createElement('p');
        const verificationTime = document.createElement('p');
        
        // const resend = document.createElement('a');
    
        verificationWrap.setAttribute('class', 'd-flex flex-column mb-3 w-25');
        verificationWrap.setAttribute('id', 'verificationWrap');

        inputWrap.setAttribute('class', 'd-flex flex-row');
    
        verificationCode.setAttribute('class', 'form-control');
        verificationCode.setAttribute('id', 'verificationCode');
        verificationCode.setAttribute('name', 'verificationCode');
        verificationCode.setAttribute('placeholder', '인증번호 입력');
        verificationCode.setAttribute('type', 'text');
        verificationCode.required = true;
        
        checkVerificationCode.setAttribute('id', 'checkVerificationCode');
        checkVerificationCode.setAttribute('type', 'button');
        checkVerificationCode.setAttribute('class', 'w-25 p-2 btn btn-sm btn-info');
        checkVerificationCode.setAttribute('onclick', 'checkCode()');
        checkVerificationCode.innerHTML = '확인'

        verificationInfo.setAttribute('class', 'd-flex flex-row justify-content-between');
        verificationInfo.setAttribute('id', 'verificationInfo');

        message.setAttribute('id', 'message')
        message.setAttribute('class', 'm-0')

        verificationTime.setAttribute('id', 'verificationTime');
        verificationTime.setAttribute('class', 'm-0');

        // resend.setAttribute('id', 'resend');
        // resend.setAttribute('href', '#');
        // resend.innerHTML = '인증번호 재발송';

        const emailWrap = document.getElementById('emailWrap');
    
        emailWrap.insertAdjacentElement('afterend', verificationWrap);
        verificationWrap.appendChild(inputWrap);
        inputWrap.appendChild(verificationCode);
        inputWrap.appendChild(checkVerificationCode);
        verificationWrap.appendChild(verificationInfo);
        verificationInfo.appendChild(message);
        verificationInfo.appendChild(verificationTime);
        // verificationInfo.appendChild(resend);
    }
}

function verificationTimer() {
    let time = 30;
    const x = setInterval(() => {
        const verificationTime = document.getElementById('verificationTime');
        if(verificationTime){
            document.getElementById('verificationTime').innerHTML = `만료까지: ${time}초`;
            time--;
            if(time < 0){
                clearInterval(x)
                document.getElementById('verificationTime').innerHTML = '시간 만료됨.'
            }
        }
        if(!verificationTime){
            clearInterval(x)
        }
    }, 1000);
}

async function checkCode() {
    const verificationCode = document.getElementById('verificationCode');
    const email = document.getElementById('email');
    const data = {userCode: verificationCode.value, email: email.value};
    await axios.post(`/signup/verifycode`, data)
    .then((res) => {
        window.alert('인증번호가 확인되었습니다.')
        document.getElementById('verificationCode').setAttribute('class', 'form-control signupValid');
        document.getElementById('verificationInfo').remove();
    })
    .catch((err) => {
        if(err.response.data === 'incorrect') {
            const message = document.getElementById('message');
            message.innerHTML = '잘못된 인증번호입니다.'
        }
        if(err.response.data === 'not exist') {
            const message = document.getElementById('message');
            message.innerHTML = '인증시간 만료. 다시 인증해주세요.'
        }
    })
}
