
function myPostTapMenu(e) {
    if(e.id === "tap-post") {
        window.location.href = "/mypage/mypost-post";
    }
    if(e.id === "tap-comment") {
        window.location.href = "/mypage/mypost-comment";
    }
}

function myLikeTapMenu(e) {
    if(e.id === "tap-post") {
        window.location.href = "/mypage/mylike-post";
    }
    if(e.id === "tap-comment") {
        window.location.href = "/mypage/mylike-comment";
    }
}

function myNoteTapMenu(e) {
    if(e.id === "tap-received") {
        window.location.href = "/mypage/mynote-received";
    }
    if(e.id === "tap-sent") {
        window.location.href = "/mypage/mynote-sent";
    }
    if(e.id === "tap-note-inbox") {
        window.location.href = "/mypage/mynote-inbox";
    }
}

function sendNotePopUp() {
    window.open("/mypage/send-note","_blank","width=550, height=350, top=100px, left=100px")
}

function openNote(e) {
    const noteId = e.getAttribute('data-note-id');
    window.open(`/mypage/view-note?noteId=${noteId}`,"_blank","width=550, height=370, top=100px, left=100px")
}

function checkAll(e) {
    const checkOneNote = document.getElementsByClassName('check-one-note');  // checkOneNote는 HTMLCollection이므로 배열로 변환해야함. => Array.from() 또는 ...(스프레드 연산자)
    if(e.checked) {
        [...checkOneNote].forEach(element => {
            element.checked = true;
        });
    } else {
        [...checkOneNote].forEach(element => {
            element.checked = false;
        });
    }
}

function deleteNote() {

}

function inboxNote() {
    
}