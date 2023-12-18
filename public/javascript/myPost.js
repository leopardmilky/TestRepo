
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

function myNotTapMenu(e) {
    if(e.id === "tap-received") {
        window.location.href = "/mypage/mynote-received";
    }
    if(e.id === "tap-sent") {
        window.location.href = "/mypage/mynote-sent";
    }
}

function sendNotePopUp() {
    window.open("/mypage/send-note","_blank","width=550, height=350, top=100px, left=100px")
}