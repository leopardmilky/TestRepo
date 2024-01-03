
let postId
let commentId


// 알림에서 댓글 찾아가는 자동 스크롤 및 색상 표시
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const parameterValue = urlParams.get('commentId');
if(parameterValue) {
    const element = document.querySelector('[data-commentid="' + parameterValue + '"]');
    const targetComment = element.parentElement.parentElement.parentElement;
    targetComment.scrollIntoView({ behavior: 'auto', block: 'center' });
    targetComment.setAttribute('id', 'targetComment');
    setTimeout(function () {
        targetComment.removeAttribute('id');
    }, 2000);
}

function createReplyInputBox(e) {   // 답변하기 박스 생성.
    const hasReplyInputBox = document.getElementById('input-reply-text-wrap');
    const hasEditInputBox = document.getElementById('input-edit-text-wrap');
    if(hasReplyInputBox || hasEditInputBox){
        removeInputBox()
    }

    postId = e.getAttribute('data-postId');
    commentId = e.getAttribute('data-commentId');
    const element = e.parentElement.parentElement.parentElement;
    const replyInputBox = `
    <div id="input-reply-text-wrap">
        <div id="input-reply-text">
            <textarea name="comment[body]" id="input-reply-text-box" required></textarea>
        </div>
        <div id="input-reply-text-btn-group">
            <button class="submit control-btn" onclick="submitReply()">등록</button>
            <button class="cancel control-btn" onclick="removeInputBox()">취소</button>
        </div>
    </div>`
    element.insertAdjacentHTML('afterend', replyInputBox);
}

function removeInputBox() { // 글쓰기 박스 제거
    const replyInputBox = document.getElementById('input-reply-text-wrap');
    const editInputBox = document.getElementById('input-edit-text-wrap');
    if(replyInputBox){
        replyInputBox.remove();
    }
    if(editInputBox){
        editInputBox.remove();
    }
}

function createEditCommentInputBox(e) { // 수정하기 박스 생성.
    const hasReplyInputBox = document.getElementById('input-reply-text-wrap');
    const hasEditInputBox = document.getElementById('input-edit-text-wrap');
    if(hasReplyInputBox || hasEditInputBox){
        removeInputBox()
    }

    postId = e.getAttribute('data-postId');
    commentId = e.getAttribute('data-commentId');
    const text = e.parentElement.parentElement.previousElementSibling.firstElementChild.innerHTML;
    const element = e.parentElement.parentElement.parentElement;
    const replyInputBox = `
    <div id="input-edit-text-wrap">
        <div id="input-edit-text">
            <textarea name="" id="input-edit-text-box" required>${text}</textarea>
        </div>
        <div id="input-edit-text-btn-group">
            <button class="submit control-btn" onclick="submitEditedComment()">등록</button>
            <button class="cancel control-btn" onclick="removeInputBox()">취소</button>
        </div>
    </div>`

    element.insertAdjacentHTML('afterend', replyInputBox);
}

async function submitReply(e) { // 답변 제출.
    const text = document.getElementById('input-reply-text-box').value;

    if(text == '' || text.trim() == ''){
        return window.alert('내용을 입력해 주세요.')
    }

    const data = {body: text}
    await axios.post(`/index/${postId}/comments/${commentId}`, data)
    .then((res) => {
        removeInputBox();
        window.location.reload();
    })
}

async function submitEditedComment(e) { // 수정하기 제출.
    const text = document.getElementById('input-edit-text-box').value;

    if(text == '' || text.trim() == ''){
        return window.alert('내용을 입력해 주세요.')
    }

    const data = {body: text}
    await axios.put(`/index/${postId}/comments/${commentId}`, data)
    .then((res) => {
        if(res.data == 'nk'){
            window.alert('해당 댓글에 답변이 있어서 수정할 수 없습니다.')
            removeInputBox();
            return window.location.reload();
        }
        removeInputBox();
        window.location.reload();
    })
}

async function commentDelete(e) {   // 댓글 삭제.
    postId = e.getAttribute('data-postId');
    commentId = e.getAttribute('data-commentId');
    await axios.delete(`/index/${postId}/comments/${commentId}`)
    .then((res) => {
        if(res.data === 'ok') {
            window.alert('댓글을 삭제 했습니다.')
            window.location.reload();
        }
        if(res.data === 'nk') {
            window.alert('삭제되거나 찾을 수 없는 댓글입니다.')
            window.location.reload();
        }

    })
}

async function commentLike(e) { // 댓글 좋아요.

    postId = e.getAttribute('data-postId');
    commentId = e.getAttribute('data-commentId');

    await axios.post(`/index/${postId}/comments/${commentId}/commentLike`)
    .then((res) => {

        if(res.data === 'nk') {
            return window.alert('로그인이 필요합니다.')
        }

        if(res.data === 'exist') {
            return window.alert('이미 추천한 댓글입니다.')
        }

        if(res.data.ok) {
            const updateLikes = e.lastElementChild;
            updateLikes.innerHTML = `${res.data.ok}`;
        }
    })
}

async function commentPage(e) { // 댓글 페이징

    postId = e.getAttribute('data-postId');
    let page = e.hasAttribute('data-page'); // hasAttribute 한 번 써보고 싶어서 써봄...
    if(!page) { // data-page를 가지고 있지 않다면
        page = e.innerHTML;
    } else {
        page = e.getAttribute('data-page');
    }

    await axios.post(`/index/${postId}?commentPage=${page}`)
    .then((res) => {

        // 댓글 로드
        document.getElementById('comments-wrap').remove();
        const commentsWrap = document.createElement('div');
        commentsWrap.setAttribute('id', 'comments-wrap');
        for(data of res.data.commentsArr) {
            commentsWrap.insertAdjacentHTML('beforeend', data);
        }
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.appendChild(commentsWrap);

        // 페이징
        document.getElementById('pagination').remove();
        const pagination = document.createElement('div');
        pagination.setAttribute('id', 'pagination');
        for(data of res.data.pageArr) {
            pagination.insertAdjacentHTML('beforeend', data);
        }
        const paginationWrap = document.getElementById('pagination-wrap');
        paginationWrap.appendChild(pagination);
    })
}

async function commentReport(e) {

    const postId = e.getAttribute('data-postId');
    const commentId = e.getAttribute('data-commentId');

    await axios.post(`/index/${postId}/comments/${commentId}/commentReport`)
    .then((res) => {
        if(res.data === 'nk') {
            return window.alert('로그인이 필요합니다.')
        }

        if(res.data === 'exist') {
            return window.alert('이미 신고한 댓글입니다.')
        }

        if(res.data === 'ok') {
            return window.alert('신고 완료.')
        }
    })
}