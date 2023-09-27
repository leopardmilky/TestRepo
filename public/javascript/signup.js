

// 이메일 중복 체크
const email = document.querySelector('#email');
const emailCheckMessage = document.querySelector('.emailCheckMessage');

email.onblur = async function (e) {

    const axiosResult = await axios.get(`/signup/check?email=${email.value}`);
    if(axiosResult.data == 'ok'){
        emailCheckMessage.setAttribute('style', 'color: green;')
        emailCheckMessage.innerHTML = '사용 가능한 이메일입니다.';
        email.removeAttribute('class');
        email.setAttribute('class', 'form-control signupValid');
        checkAllInput()
    }
    if(axiosResult.data == 'duplicated'){
        emailCheckMessage.setAttribute('style', 'color: red;')
        emailCheckMessage.innerHTML = '사용할 수 없는 이메일입니다.';
        email.removeAttribute('class')
        email.setAttribute('class', 'form-control signupInvalid')
    }

    // 여기에 이메일 형식에 맞췄는지 확인하는 정규식 필요.

}


// 닉네임 중복 체크
const nickname = document.querySelector('#nickname');
const nicknameCheckMessage = document.querySelector('.nicknameCheckMessage');

nickname.onblur = async function (e) {

    const axiosResult = await axios.get(`/signup/check?nickname=${nickname.value}`);
    if(axiosResult.data == 'ok'){
        nicknameCheckMessage.setAttribute('style', 'color: green;')
        nicknameCheckMessage.innerHTML = '사용 가능한 닉네임입니다.';
        nickname.removeAttribute('class');
        nickname.setAttribute('class', 'form-control signupValid');
        checkAllInput()
    }
    if(axiosResult.data == 'duplicated'){
        nicknameCheckMessage.setAttribute('style', 'color: red;')
        nicknameCheckMessage.innerHTML = '사용할 수 없는 닉네임입니다.';
        nickname.removeAttribute('class')
        nickname.setAttribute('class', 'form-control signupInvalid')
    }
}


// 비밀번호 확인
const password = document.querySelector('#password');
const confirmPwd = document.querySelector('#confirmPwd');
const passwordCheckMessage = document.querySelector('.passwordCheckMessage');

confirmPwd.onkeyup = function (e) {

    if(password.value == confirmPwd.value){
        passwordCheckMessage.setAttribute('style', 'color: green;')
        passwordCheckMessage.innerHTML = '비밀번호 일치';
        password.removeAttribute('class')
        password.setAttribute('class', 'form-control signupValid');
        confirmPwd.removeAttribute('class')
        confirmPwd.setAttribute('class', 'form-control signupValid');
        checkAllInput()
    }

    if(password.value != confirmPwd.value){
        passwordCheckMessage.setAttribute('style', 'color: red;')
        passwordCheckMessage.innerHTML = '비밀번호가 일치하지 않습니다.';
        password.removeAttribute('class')
        password.setAttribute('class', 'form-control signupInvalid')
        confirmPwd.removeAttribute('class')
        confirmPwd.setAttribute('class', 'form-control signupInvalid')
    }
}


// Sign up 버튼 활성화
function checkAllInput(){
    const signupBtn = document.querySelector('.signupBtn');
    const check1 = email.classList.contains('signupValid');
    const check2 = nickname.classList.contains('signupValid');
    const check3 = password.classList.contains('signupValid');
    const check4 = confirmPwd.classList.contains('signupValid');
    if(check1 & check2 & check3 & check4) {
        signupBtn.removeAttribute('class');
        signupBtn.setAttribute('class', 'w-25 btn btn-success signupBtn');
    }
}
