
let postId
let commentId

function createReplyInputBox(e) {
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

function removeInputBox() {
    const replyInputBox = document.getElementById('input-reply-text-wrap');
    const editInputBox = document.getElementById('input-edit-text-wrap');
    if(replyInputBox){
        replyInputBox.remove();
    }
    if(editInputBox){
        editInputBox.remove();
    }
}

function createEditCommentInputBox(e) {
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

async function submitReply(e) {
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

async function submitEditedComment(e) {
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

async function deleteComment(e) {
    postId = e.getAttribute('data-postId');
    commentId = e.getAttribute('data-commentId');
    await axios.delete(`/index/${postId}/comments/${commentId}`)
    .then((res) => {
        window.alert('댓글을 삭제 했습니다.')
        window.location.reload();
    })
}

async function commentLike(e) {

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


async function commentPage(e) {

    postId = e.getAttribute('data-postId');
    let page = e.innerHTML;
    if(page == 'prev') {
        page = parseInt(document.getElementById('currentPage').innerHTML);
        page -= 1;
    }
    if(page == 'next') {
        page = parseInt(document.getElementById('currentPage').innerHTML);
        page += 1;
    }

    await axios.post(`/index/${postId}?page=${page}`)
    .then((res) => {

        console.log("res.data: ", res.data);
        console.log("res.data.commentsArr: ", res.data.commentsArr);

        // document.getElementById('comments-wrap').remove();
        // const commentsWrap = document.createElement('div');
        // commentsWrap.setAttribute('id', 'comments-wrap');
        // for(data of res.data.commentsArr) {
        //     commentsWrap.innerHTML += data;
        // }
        // const commentsContainer = document.getElementById('comments-container');
        // commentsContainer.appendChild(commentsWrap);
    })
}