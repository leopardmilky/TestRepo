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


// 인증하기 버튼 클릭 시
const withdrawCode = document.getElementById('withdrawCode');
withdrawCode.addEventListener('click', async () => {
    const inputWithdrawCode = document.getElementById('inputWithdrawCode');
    const data = {userCode: inputWithdrawCode.value};
    await axios.post('/withdraw/verifycode', data)
    .then((res) => {
        const withdrawCodeMsg = document.getElementById('withdrawCodeMsg');
        withdrawCodeMsg.innerHTML = '';
        window.location.href = '/withdraw/verifycode/deleteUser';
    })
    .catch((err) => {
        if(err.response.data === 'incorrect') {
            const withdrawCodeMsg = document.getElementById('withdrawCodeMsg');
            withdrawCodeMsg.innerHTML = '잘못된 인증번호입니다.';
        }
        if(err.response.data === 'not exist') {
            const withdrawCodeMsg = document.getElementById('withdrawCodeMsg');
            withdrawCodeMsg.innerHTML = '인증시간 만료. 다시 인증해주세요.';
        }
    })
})
  