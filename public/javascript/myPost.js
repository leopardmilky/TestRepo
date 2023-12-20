
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
    if(e.classList.contains('received')) {
        return window.open(`/mypage/view-note?noteId=${noteId}&type=received`,"_blank","width=550, height=370, top=100px, left=100px");
    }
    if(e.classList.contains('sent')) {
        return window.open(`/mypage/view-note?noteId=${noteId}&type=sent`,"_blank","width=550, height=370, top=100px, left=100px");
    }
    if(e.classList.contains('inbox')) {
        return window.open(`/mypage/view-note?noteId=${noteId}&type=inbox`,"_blank","width=550, height=370, top=100px, left=100px");
    }
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
function checkOne(e) {
    if(e.checked) {
        const checkBtnCnt = document.getElementsByClassName('check-one-note');
        const checkedCnt = document.querySelectorAll('.check-one-note:checked');

        if(checkBtnCnt.length === checkedCnt.length) {
            document.getElementById('check-all').checked = true;
        }
    } else {
        document.getElementById('check-all').checked = false;
    }
}


function deleteNote(e) {
    const checkedCnt = document.querySelectorAll('.check-one-note:checked');
    if(checkedCnt.length === 0) {
        return window.alert("삭제할 쪽지를 선택해 주세요.");
    }

    const arr = [];
    [...checkedCnt].forEach(element => {
        arr.push(element.dataset.checkNoteId);
    })

    axios.delete('/mypage/delete-note', {data: arr})
    .then((res) => {
        if(res.data === 'ok') {
            window.alert('선택한 쪽지를 삭제했습니다.');
            window.location.reload();
        }
    })
}

function inboxNote() {
    const checkedCnt = document.querySelectorAll('.check-one-note:checked');
    if(checkedCnt.length === 0) {
        return window.alert("보관할 쪽지를 선택해 주세요.");
    }

    const arr = [];
    [...checkedCnt].forEach(element => {
        arr.push(element.dataset.checkNoteId);
    })

    axios.put('/mypage/save-note', arr)
    .then((res) => {
        if(res.data == 'ok') {
            window.alert('선택한 쪽지가 보관함으로 이동되었습니다.');
            window.location.reload();
        }
    })
}