
window.onpageshow = function(event){
    if(event.persisted){
        // window.location.reload();
        history.pushState(null, null, location.href);
        history.go(-2);
    }
}

const cancel = document.getElementById('modify-user-cancel');
cancel.addEventListener('click', ()=>{
    window.location.href = '/index';
})

async function modifyUserInfo(){
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;
    const confirmPwd = document.getElementById('confirmPwd').value;
    const oldPassword = document.getElementById('old-password').value;

    const data = {nickname: nickname, password: password, confirmPwd: confirmPwd, oldPassword: oldPassword};
    await axios.put('/saveUserInfo', data)
    .then((res) => {
        window.alert('수정이 완료되었습니다.');
        window.location.href = '/index';
    })
    .catch((err) => {
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
            window.alert('비밀번호 입력이 잘 못되었습니다. 다시 확인해 주세요.');
            location.reload();
        }

    })
}


const withdrawBtn = document.getElementById('withdrawBtn');
withdrawBtn.onclick = function() {
    modalWrap.style.display = 'block';
}

const closeModal = document.getElementById('closeModal-btn');
closeModal.onclick = function() {
    modalWrap.style.display = 'none';
}

const withdraw = document.getElementById('withdraw-btn');
withdraw.onclick = function() {
    window.location.href = '/withdraw'
}

