
window.onpageshow = function(event){
    if(event.persisted){
        // window.location.reload();
        history.pushState(null, null, location.href);
        history.go(-2);
    }
}

const cancel = document.getElementById('cancel');
cancel.addEventListener('click', ()=>{
    window.location.href = 'http://localhost:3000/index/';
})

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
        console.log("ERR!@!@!@!@!@: ", err)
        if(err.response.data == 'nk'){
            window.alert('사용중인 닉네임입니다.');
            location.reload();
        }
        if(err.response.data == 'pattern'){
            window.alert('닉네임은 최대 20글자 알파벳, 한글, 숫자, 언더바(_), 하이픈(-)만 가능합니다.');
            location.reload();
        }
        if(err.response.data == 'length'){
            window.alert('닉네임은 1~20글자까지 가능합니다.');
            location.reload();
        }
        if(err.response.data == 'ne'){
            window.alert('비밀번호가 일치하지 않거나 6자리 미만입니다.');
            location.reload();
        }

    })
}