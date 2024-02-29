
// 답장 버튼 클릭 시 닉네임 받아옴.
const fromReplyBtn = window.opener.document.getElementById('nickname');
const inputRecipient = document.getElementById('input-recipient');
if(fromReplyBtn) {
    const inputRecipient = document.getElementById('input-recipient');
    inputRecipient.value = fromReplyBtn.innerHTML;
}

function sendNote() {
    const recipient = document.getElementById('input-recipient').value;
    const content = document.getElementById('input-content').value;

    data = {recipient: recipient, content: content};
    axios.post('/mypage/send-note', data)
    .then((res) => {
        if(res.data === 'nk') {
            window.alert("받는사람 또는 내용을 입력해주세요.")
        }
        if(res.data === 'nk2') {
            window.alert("존재하지 않는 사용자입니다.")
        }
        if(res.data === 'ok') {
            window.alert("쪽지를 보냈습니다.");
            window.close();
        }
    })

}

function closeNote() {
    window.close();
}

// 쪽지 글자 세기
const inputContent = document.getElementById('input-content');
const characterLimit = document.getElementById('character-limit');
function countCharacters() {
  const text = inputContent.value;
  const length = text.length;
  if(length > 1000) {
    window.alert('쪽지는 최대 1000글자까지 입력하실 수 있습니다. ')
  } else {
    characterLimit.textContent = `${length}/1000`;
  }
}

inputContent.addEventListener('input', countCharacters)
countCharacters();



