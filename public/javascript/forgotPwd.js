// 이메일 중복 체크
const emailBtn = document.getElementById('emailBtn');
emailBtn.addEventListener('click', async() => {
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
            const data = {email: email.value};
            const emailResult = await axios.post('/forgotpwd/check', data); // 중복 검사
            if(emailResult.data == 'ok') {
                emailMsg.innerHTML = '';
                await axios.post('/forgotpwd/temppwd', data)
                .then((res) => {
                    window.alert("해당 이메일로 임시 비밀번호를 전송하였습니다.");
                    window.location.href =` http://localhost:3000/signin`
                });
            }
            
            if(emailResult.data === 'notok') {
                emailMsg.innerHTML = '잘못된 이메일 형식 또는 확인되지 않는 이메일입니다.';
                emailMsg.removeAttribute('class');
                emailMsg.setAttribute('class', 'invalidEmailMsg');
            }
        }
        if(!checkEmail) {
            emailMsg.innerHTML = '잘못된 이메일 형식 또는 확인되지 않는 이메일입니다.';
            emailMsg.removeAttribute('class');
            emailMsg.setAttribute('class', 'invalidEmailMsg');
        }
    }
})