function goToComment(e) {
    const postId = e.getAttribute('data-post-id');
    const commentId = e.getAttribute('data-comment-id');
    window.location.href = `/index/${postId}?commentId=${commentId}`;
}

function goToPage(e) {
    const page = e.getAttribute('data-page');
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    url.searchParams.set('page', page);
    window.location.href = `${url.href}`;
}

function searchPost() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    document.getElementById('start-date-hidden').value = startDate;
    document.getElementById('end-date-hidden').value = endDate;
    return true;
}

function checkAll(e) {
    const checkOneNote = document.getElementsByClassName('check-one-post');
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
        const checkBtnCnt = document.getElementsByClassName('check-one-post');
        const checkedCnt = document.querySelectorAll('.check-one-post:checked');

        if(checkBtnCnt.length === checkedCnt.length) {
            document.getElementById('check-all').checked = true;
        }
    } else {
        document.getElementById('check-all').checked = false;
    }
}

function deletePost() {
    const checkedCnt = document.querySelectorAll('.check-one-post:checked');
    if(checkedCnt.length === 0) {
        return window.alert("삭제할 게시물을 선택해 주세요.");
    }

    const arr = [];
    [...checkedCnt].forEach(element => {
        arr.push(element.dataset.checkPostId);
    })

    axios.delete('/admin/delete-post', {data: arr})
    .then((res) => {
        if(res.data === 'ok') {
            window.alert('선택한 게시물을 삭제했습니다.');
            window.location.reload();
        }
        if(res.data === 'nk') {
            window.alert('권한이 없습니다. 관리자에게 문의하세요.');
            window.location.reload();
        }
    })
}

function deleteComment() {
    const checkedCnt = document.querySelectorAll('.check-one-post:checked');
    if(checkedCnt.length === 0) {
        return window.alert("삭제할 게시물을 선택해 주세요.");
    }

    const arr = [];
    [...checkedCnt].forEach(element => {
        arr.push(element.dataset.checkCommentId);
    })

    axios.delete('/admin/delete-comment', {data: arr})
    .then((res) => {
        if(res.data === 'ok') {
            window.alert('선택한 댓글을 삭제했습니다.');
            window.location.reload();
        }
        if(res.data === 'nk') {
            window.alert('권한이 없습니다. 관리자에게 문의하세요.');
            window.location.reload();
        }
    })
}

// select option 검색 후에도 초기화되지 않게 저장.
document.addEventListener("DOMContentLoaded", function() {
    const selectedOption = localStorage.getItem("selectedOption");
    if (selectedOption) {
        document.getElementById("select-option").value = selectedOption;
    }
    document.getElementById("select-option").addEventListener("change", function() {
        const selectedValue = this.value;
        localStorage.setItem("selectedOption", selectedValue);
    });
});