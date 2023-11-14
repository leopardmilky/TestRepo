
window.onpageshow = function(event){
    if(event.persisted){
        // window.location.reload();
        history.pushState(null, null, location.href);
        history.go(-2);
    }
}

async function modifyUserInfo(){
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;
    const confirmPwd = document.getElementById('confirmPwd').value;
    const data = {nickname: nickname, password: password, confirmPwd: confirmPwd};
    await axios.put('/saveUserInfo', data)
    .then((res) => {
        window.alert('수정이 완료되었습니다.');
        window.location.href = 'http://localhost:3000/index/';
    })
    .catch((err) => {
        window.alert('닉네임은 알파벳, 한글, 숫자, 언더바(_), 하이픈(-)만 가능합니다.');
        location.reload();
    })
}