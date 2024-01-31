// 이메일 중복 체크
const emailBtn = document.getElementById('emailBtn');
async function checkEmail() {
    const email = document.getElementById('email');
    const emailMsg = document.getElementById('emailMsg');
    const emailRegExp = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
    const checkEmail = emailRegExp.test(email.value);   // 이메일 정규식 체크(true, false 반환)

    if(!email.value) {  // input에 값이 없을때
        emailMsg.innerHTML = '이메일을 입력해주세요.';
        emailMsg.removeAttribute('class');
        emailMsg.setAttribute('class', 'invalidEmailMsg');
    }
    if(email.value) {   // input에 값이 있을때
        if(checkEmail) {    // 정규식 체크
            const emailResult = await axios.get(`/signup/check?email=${email.value}`); // 중복 검사
            if(emailResult.data == 'ok') {
                emailMsg.innerHTML = '';
                await axios.get(`/signup/verifyemail?email=${email.value}`)
                .then((res) => {
                    createVerifyCodePage(email.value);
                })
            }
            if(emailResult.data == 'notok') {
                emailMsg.innerHTML = '잘못된 이메일 형식 또는 사용 불가능한 이메일입니다.';
                emailMsg.removeAttribute('class');
                emailMsg.setAttribute('class', 'invalidEmailMsg');
            }
        }
        if(!checkEmail) {
            emailMsg.innerHTML = '잘못된 이메일 형식 또는 사용 불가능한 이메일입니다.';
            emailMsg.removeAttribute('class');
            emailMsg.setAttribute('class', 'invalidEmailMsg');
        }
    }
}


function createVerifyCodePage(email) {
    const verifyEmailWrap = document.createElement('div');
    const verifyInnerWrap = document.createElement('div');
    const h5 = document.createElement('h5');
    const b = document.createElement('b');
    const p = document.createElement('p');
    const inputEmailCodeWrap = document.createElement('div');
    const inputEmailCode = document.createElement('input');
    const timer_min = document.createElement('p');
    const timer_sec = document.createElement('p');
    const emailCodeMsgWrap = document.createElement('div');
    const emailCodeMsg = document.createElement('p');
    const emailCodeBtnWrap = document.createElement('div');
    const emailCode = document.createElement('button');

    verifyEmailWrap.setAttribute('id', 'verifyEmailWrap');
    verifyInnerWrap.setAttribute('id', 'verifyInnerWrap');
    b.innerHTML = '인증번호 입력';
    p.innerHTML = `${email}으로 인증번호를 보냈습니다.`;
    inputEmailCodeWrap.setAttribute('id', 'inputEmailCodeWrap');
    inputEmailCode.setAttribute('type', 'text');
    inputEmailCode.setAttribute('id', 'inputEmailCode');
    inputEmailCode.setAttribute('name', 'inputEmailCode');
    inputEmailCode.setAttribute('placeholder', '인증번호 입력');
    inputEmailCode.setAttribute('maxlength', '6');
    inputEmailCode.setAttribute('autocomplete', 'off');

    timer_min.setAttribute('id', 'timer_min');
    timer_min.innerHTML = '3:';
    timer_sec.setAttribute('id', 'timer_sec');
    timer_sec.innerHTML = '00';

    emailCodeMsgWrap.setAttribute('id', 'emailCodeMsgWrap');
    emailCodeMsg.setAttribute('id', 'emailCodeMsg');
    emailCodeBtnWrap.setAttribute('id', 'emailCodeBtnWrap');
    emailCode.setAttribute('id', 'emailCode');
    emailCode.innerHTML = '인증완료';

    const emailWrap = document.getElementById('emailWrap');
    emailWrap.insertAdjacentElement('afterend', verifyEmailWrap);
    verifyEmailWrap.appendChild(verifyInnerWrap);
    verifyInnerWrap.appendChild(h5);
    h5.appendChild(b);
    verifyInnerWrap.appendChild(p);
    verifyInnerWrap.appendChild(inputEmailCodeWrap);
    inputEmailCodeWrap.appendChild(inputEmailCode);
    inputEmailCodeWrap.appendChild(timer_min);
    inputEmailCodeWrap.appendChild(timer_sec);
    verifyInnerWrap.appendChild(emailCodeMsgWrap);
    emailCodeMsgWrap.appendChild(emailCodeMsg);
    verifyInnerWrap.appendChild(emailCodeBtnWrap);
    emailCodeBtnWrap.appendChild(emailCode);

    emailWrap.remove();

    inputVerifyCode(email);
}


function inputVerifyCode(email) {
    // 인증번호 타이머
    const timer_min = document.getElementById('timer_min');
    const timer_sec = document.getElementById('timer_sec');
    let time = 180;
    setInterval(() => {
        if(time > 0) {
            time = time - 1;
            let min = Math.floor(time / 60);
            let sec = String(time % 60).padStart(2, "0");
            timer_min.innerText = min+':';
            timer_sec.innerText = sec;
        }
    }, 1000);

    const checkEmailCode = async () => {
        const inputEmailCode = document.getElementById('inputEmailCode');
        const data = {userCode: inputEmailCode.value, email: email};
        await axios.post(`/signup/verifycode`, data)
        .then((res) => {
            const emailCodeMsg = document.getElementById('emailCodeMsg');
            emailCodeMsg.innerHTML = '';
            createNickPwdPage(email)
        })
        .catch((err) => {
            if(err.response.data === 'incorrect') {
                const emailCodeMsg = document.getElementById('emailCodeMsg');
                emailCodeMsg.innerHTML = '잘못된 인증번호입니다.';
            }
            if(err.response.data === 'not exist') {
                const emailCodeMsg = document.getElementById('emailCodeMsg');
                emailCodeMsg.innerHTML = '인증시간 만료. 다시 인증해주세요.';
            }
        })
    }

    // 인증하기 버튼 클릭 시
    const emailCode = document.getElementById('emailCode');
    emailCode.addEventListener('click', checkEmailCode)
    const inputEmailCode = document.getElementById('inputEmailCode');
    inputEmailCode.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {emailCode.click()}
    })

}

// 닉네임, 비밀번호 설정
function createNickPwdPage(email) {

    const userInfoWrap = document.createElement('div');
    const userInfoInnerWrap = document.createElement('div');
    const h5 = document.createElement('h5');
    const b = document.createElement('b');
    const p = document.createElement('p');
    const inputNicknameWrap = document.createElement('div');
    const nickname = document.createElement('input');
    const nicknameMsgWrap = document.createElement('div');
    const nicknameMsg = document.createElement('p');
    const pwdWrap = document.createElement('div');
    const password = document.createElement('input');
    const visible1 = document.createElement('p');
    const eye1 = document.createElement('i')
    const pwdMsgWrap = document.createElement('div');
    const pwdMsg = document.createElement('p');
    const confirmPwdWrap = document.createElement('div');
    const confirmPassword = document.createElement('input');
    const visible2 = document.createElement('p');
    const eye2 = document.createElement('i')
    const confirmPwdMsgWrap = document.createElement('div');
    const confirmPwdMsg = document.createElement('p');
    const registerBtnWrap = document.createElement('div');
    const registerBtn = document.createElement('button');

    userInfoWrap.setAttribute('id', 'userInfoWrap');
    userInfoInnerWrap.setAttribute('id', 'userInfoInnerWrap');
    b.innerHTML = '닉네임 및 비밀번호 설정';
    p.innerHTML = '사용할 닉네임과 비밀번호를 입력해 주세요.';
    inputNicknameWrap.setAttribute('id', 'inputNicknameWrap');
    nickname.setAttribute('type', 'text');
    nickname.setAttribute('id', 'nickname');
    nickname.setAttribute('name', 'nickname');
    nickname.setAttribute('autocomplete', 'nickname');
    nickname.setAttribute('placeholder', '닉네임 입력');
    nicknameMsgWrap.setAttribute('id', 'nicknameMsgWrap');
    nicknameMsg.setAttribute('id', 'nicknameMsg');
    pwdWrap.setAttribute('id', 'pwdWrap');
    password.setAttribute('type', 'password');
    password.setAttribute('id', 'password');
    password.setAttribute('name', 'password');
    password.setAttribute('autocomplete', 'new-password');
    password.setAttribute('placeholder', '비밀번호 입력 (최소 6자리)');
    visible1.setAttribute('id', 'visible1');
    eye1.setAttribute('id', 'eye1');
    eye1.setAttribute('class', 'fa-solid fa-eye active')
    pwdMsgWrap.setAttribute('id', 'pwdMsgWrap');
    pwdMsg.setAttribute('id', 'pwdMsg');
    confirmPwdWrap.setAttribute('id', 'confirmPwdWrap');
    confirmPassword.setAttribute('type', 'password');
    confirmPassword.setAttribute('id', 'confirmPassword');
    confirmPassword.setAttribute('name', 'confirmPassword');
    confirmPassword.setAttribute('autocomplete', 'new-password');
    confirmPassword.setAttribute('placeholder', '비밀번호 확인');
    visible2.setAttribute('id', 'visible2');
    eye2.setAttribute('id', 'eye2');
    eye2.setAttribute('class', 'fa-solid fa-eye active')
    confirmPwdMsgWrap.setAttribute('id', 'confirmPwdMsgWrap');
    confirmPwdMsg.setAttribute('id', 'confirmPwdMsg');
    registerBtnWrap.setAttribute('id', 'registerBtnWrap');
    registerBtn.setAttribute('id', 'registerBtn');
    registerBtn.innerHTML = '등록완료';
    
    const verifyEmailWrap = document.getElementById('verifyEmailWrap');
    verifyEmailWrap.insertAdjacentElement('afterend', userInfoWrap);
    userInfoWrap.appendChild(userInfoInnerWrap);
    userInfoInnerWrap.appendChild(h5);
    h5.appendChild(b);
    userInfoInnerWrap.appendChild(p);
    userInfoInnerWrap.appendChild(inputNicknameWrap);
    inputNicknameWrap.appendChild(nickname);
    userInfoInnerWrap.appendChild(nicknameMsgWrap);
    nicknameMsgWrap.appendChild(nicknameMsg);
    userInfoInnerWrap.appendChild(pwdWrap);
    pwdWrap.appendChild(password);
    pwdWrap.appendChild(visible1);
    visible1.appendChild(eye1);
    userInfoInnerWrap.appendChild(pwdMsgWrap);
    pwdMsgWrap.appendChild(pwdMsg);
    userInfoInnerWrap.appendChild(confirmPwdWrap);
    confirmPwdWrap.appendChild(confirmPassword);
    confirmPwdWrap.appendChild(visible2);
    visible2.appendChild(eye2);
    userInfoInnerWrap.appendChild(confirmPwdMsgWrap);
    confirmPwdMsgWrap.appendChild(confirmPwdMsg);
    userInfoInnerWrap.appendChild(registerBtnWrap);
    registerBtnWrap.appendChild(registerBtn);

    verifyEmailWrap.remove();

    inputNickPwd(email)
}


function inputNickPwd(email) {
    const registerBtn = document.getElementById('registerBtn');
    registerBtn.addEventListener('click', async () => {
        const nickname = document.getElementById('nickname').value;
        const password = document.getElementById('password').value;
        const confirmPwd = document.getElementById('confirmPassword').value;
        const nicknameMsg = document.getElementById('nicknameMsg');
        const pwdMsg = document.getElementById('pwdMsg');
        const confirmPwdMsg = document.getElementById('confirmPwdMsg');
        
        if(!nickname) {
            nicknameMsg.innerHTML = '닉네임을 입력해주세요.'
        }
        if(nickname) {
            const nicknameResult = await axios.get(`/signup/check?nickname=${nickname}`);
            if(nicknameResult.data == 'notok') {
                nicknameMsg.innerHTML = '사용할 수 없는 닉네임입니다.';
            }
            if(nicknameResult.data == 'ok') {
                nicknameMsg.innerHTML = '';
                if(!password) {
                    pwdMsg.innerHTML = '비밀번호를 입력해 주세요. (최소 6자리 이상)';
                }
                if(!confirmPwd) {
                    confirmPwdMsg.innerHTML = '비밀번호를 재입력해 주세요.';
                }
                if(password & confirmPwd) {
                    if(password.length < 6) {
                        pwdMsg.innerHTML = '최소 6자리 이상 입력해 주세요.';
                    }
                    if(confirmPwd.length < 6) {
                        confirmPwdMsg.innerHTML = '최소 6자리 이상 입력해 주세요.';
                    }
                }
                if(password.length > 5 & confirmPwd.length > 5) {
                    if(password != confirmPwd) {
                        pwdMsg.innerHTML = '비밀번호가 일치하지 않습니다.';
                        confirmPwdMsg.innerHTML = '비밀번호가 일치하지 않습니다.';
                    }
                    if(password === confirmPwd) {
                        pwdMsg.innerHTML = '';
                        confirmPwdMsg.innerHTML = '';
                        const data = {email: email, nickname: nickname, password: password}
                        await axios.post('/signup', data)
                        .then(() => {
                            window.location.href ='/index'
                        })
                    }
                }
            }
        }
    })

    // 비밀번호 토글..
    const eye1 = document.getElementById('eye1');
    const eye2 = document.getElementById('eye2');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

        eye1.addEventListener('click', () => {
            if(eye1.classList.contains('active')){
                eye1.removeAttribute('class');
                eye1.setAttribute('class', 'fa-solid fa-eye-slash')
                password.removeAttribute('type')
                password.setAttribute('type', 'text')
            } else {
                eye1.removeAttribute('class');
                eye1.setAttribute('class', 'fa-solid fa-eye active')
                password.removeAttribute('type')
                password.setAttribute('type', 'password')
            }
        })

        eye2.addEventListener('click', () => {
            if(eye2.classList.contains('active')){
                eye2.removeAttribute('class');
                eye2.setAttribute('class', 'fa-solid fa-eye-slash')
                confirmPassword.removeAttribute('type')
                confirmPassword.setAttribute('type', 'text')
            } else {
                eye2.removeAttribute('class');
                eye2.setAttribute('class', 'fa-solid fa-eye active')
                confirmPassword.removeAttribute('type')
                confirmPassword.setAttribute('type', 'password')
            }
        })
}


window.onpageshow = function(event){
    if(event.persisted){
        window.location.reload();
    }
}

// 새로고침 시 알림팝업
// window.onbeforeunload = function(event) {
//     return "";
// };

