
const contentId = new URLSearchParams(window.location.search).get('noteId');    // 쿼리 스트링으로 쪽지의 _id 값 가져옴.
const content = window.opener.document.querySelector(`[data-note-id="${contentId}"]`);
const nickname = content.previousElementSibling;
const date = content.nextElementSibling;

// ` `사이에 입력한 문자 그대로 들어가기 때문에 ${}는 사용시 양옆 빈공간이나 줄바꿈 주의.
const noteForm = 
`<div id="container">
    <div id="note-info-wrap">
        <div id="nickname">${nickname.innerHTML}</div>
        <div id="date">${date.innerHTML}</div>
    </div>
    <div id="note-content-wrap">
        <div id="content">${content.innerHTML}</div>
    </div>
    <div id="btn-group-wrap">
        <button id="close" onclick="closeNote()">닫기</button>
        <button id="reply" onclick="sendNote()">답장하기</button>
    </div>
</div>`
const body = document.querySelector('body');
body.innerHTML = noteForm;

function closeNote() {
    window.close();
}

function sendNote() {
    window.open("/mypage/send-note","_blank","width=550, height=350, top=100px, left=100px")
}