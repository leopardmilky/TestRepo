
function closeBox(event) { // 수정,답변 박스 닫기

    const editCommentWrap = document.querySelector('.editCommentWrap');
    const replyCommentWrap = document.querySelector('.replyCommentWrap');
    const findActive = document.querySelectorAll('.active');

    if(findActive.length > 1){ // 답변/수정 버튼 클릭시 이전에 눌렀던 버튼 비활성화.
        findActive.forEach(element => {   
            if(element.attributes[2] != event.target.attributes[2]){
                element.removeAttribute('aria-pressed');
                element.removeAttribute('class');
                element.setAttribute('aria-pressed', false);
                element.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1');
            }
        });
    }

    if(editCommentWrap){
        editCommentWrap.remove();
    }

    if(replyCommentWrap){
        replyCommentWrap.remove();
    }
}

function commentEditBox(event){ // 댓글 수정 박스 생성

    const commentText = event.target.parentElement.previousElementSibling.firstElementChild.innerHTML;
    const parentEle = event.target.parentElement.parentElement;

    const a = document.createElement('div');
    const b = document.createElement('label');
    const c = document.createElement('textarea');
    const d = document.createElement('div');
    const e = document.createElement('button');

    a.setAttribute('class', 'mb-3 px-3 editCommentWrap');
    b.setAttribute('class', 'form label w-100');
    c.setAttribute('class', 'form-control');
    c.setAttribute('name', 'comment[body]');
    c.innerHTML = commentText;
    d.setAttribute('class', 'd-flex justify-content-end mt-1');
    e.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 sbm editSubmit');
    e.innerHTML = "등록";

    const atag = parentEle.appendChild(a);
    const btag = atag.appendChild(b);
    const ctag = atag.appendChild(c);
    const dtag = atag.appendChild(d);
    const etag = dtag.appendChild(e);

}

function commentReplyBox(event) { // 댓글 답변 박스 생성

    const parentEle = event.target.parentElement.parentElement;

    const a = document.createElement('div');
    const b = document.createElement('label');
    const c = document.createElement('textarea');
    const d = document.createElement('div');
    const e = document.createElement('button');

    a.setAttribute('class', 'mb-3 px-3 replyCommentWrap');
    b.setAttribute('class', 'form label w-100');
    c.setAttribute('class', 'form-control');
    c.setAttribute('name', 'nestedComment[body]');
    d.setAttribute('class', 'd-flex justify-content-end mt-1');
    e.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 sbm replySubmit');
    e.innerHTML = "등록";

    const atag = parentEle.appendChild(a);
    const btag = atag.appendChild(b);
    const ctag = atag.appendChild(c);
    const dtag = atag.appendChild(d);
    const etag = dtag.appendChild(e);

}

function commentReply(event, replyText) { // 대댓글 생성

    const parentEle = event.target.parentElement.parentElement.parentElement.nextElementSibling;
    console.log("parentEle: ", parentEle)

    const a = document.createElement('div');
    const b = document.createElement('div');
    const c = document.createElement('div');
    const d = document.createElement('span');
    const e = document.createElement('b');
    const f = document.createElement('span');
    const g = document.createElement('div');
    const h = document.createElement('p');
    const i = document.createElement('div');
    const j = document.createElement('button');
    const k = document.createElement('button');

    a.setAttribute('class', 'w-75 border-0 d-flex flex-column align-items-end nestedCommentWrap');
    b.setAttribute('class', 'card mb-1 d-flex flex-column bg-light nestedCommentInnerWrap');
    c.setAttribute('class', 'd-flex justify-content-between px-3 mb-3 nestedComment_info');
    g.setAttribute('class', 'd-flex justify-content-between px-3');
    h.setAttribute('id', 'commentReply_body');
    h.setAttribute('style', 'white-space: pre-wrap;');
    // h.setAttribute('data-commentReply-body', '')
    h.innerHTML = replyText;
    i.setAttribute('class', 'd-flex justify-content-end px-3 mb-1');
    j.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 deleteCommentReply');
    j.innerHTML = "삭제";
    k.setAttribute('class', 'btn btn-outline-danger btn-sm p-1 reportCommentReply');
    k.innerHTML = "신고";

    // const atag = parentEle.insertAdjacentElement('beforeEnd', a);
    // const btag = atag.insertAdjacentElement('afterbegin', b);
    // const ctag = btag.insertAdjacentElement('afterbegin' ,c);
    // const dtag = ctag.insertAdjacentElement('afterbegin' ,d);
    // const etag = dtag.insertAdjacentElement('afterbegin' ,e);
    // const ftag = dtag.insertAdjacentElement('afterend' ,f);
    // const gtag = ctag.insertAdjacentElement('afterend' ,g);
    // const htag = gtag.insertAdjacentElement('afterbegin' ,h);
    // const itag = gtag.insertAdjacentElement('afterend' ,i);
    // const jtag = itag.insertAdjacentElement('afterbegin' ,j);
    // const ktag = itag.insertAdjacentElement('beforeEnd' ,k);

    const atag = parentEle.appendChild(a);
    const btag = atag.appendChild(b);
    const ctag = btag.appendChild(c);
    const dtag = ctag.appendChild(d);
    const etag = dtag.appendChild(e);
    const ftag = ctag.appendChild(f);
    const gtag = btag.appendChild(g);
    const htag = gtag.appendChild(h);
    const itag = btag.appendChild(i);
    const jtag = itag.appendChild(j);
    const ktag = itag.appendChild(k);

}

async function reloadCommentReply(){
    
}

document.addEventListener('click', function(event){  // 답변,수정 버튼 클릭

    const dataCommentEdit =  event.target.getAttribute('data-comment-edit');
    const dataReplyComment = event.target.getAttribute('data-reply-comment');
    const sameButton = event.target.classList.contains('active');

    if(dataCommentEdit){
        closeBox(event);
        commentEditBox(event);
        if(!sameButton){ // 같은 버튼 다시 눌렀을때 박스 닫기
            closeBox();
        }
    }

    if(dataReplyComment){
        closeBox(event);
        commentReplyBox(event);
        if(!sameButton){ 
            closeBox();
        }
    }
});

document.addEventListener('click', async function(event){ // 댓글 수정등록 버튼 클릭
    const editSubmit = event.target.classList.contains('editSubmit');
    if(editSubmit){
        const pageId = event.target.parentElement.parentElement.previousElementSibling.children[1].getAttribute('data-page-id');
        const commentId = event.target.parentElement.parentElement.previousElementSibling.children[1].getAttribute('data-comment-edit');
        const editText = event.target.parentElement.previousElementSibling.value;

        const data = {comment:{body: editText}}

        await axios.put(`/index/${pageId}/comments/${commentId}`, data)
        .then((res) => { 
            closeBox(); // 등록 박스 닫기
            document.querySelector(`.comment_body[data-comment-body="${commentId}"]`).innerHTML=editText; // 텍스트 업데이트

            const editCommentBtn = document.querySelector(`[data-comment-edit="${commentId}"]`); // 수정버튼 토글 복구
            editCommentBtn.removeAttribute('aria-pressed');
            editCommentBtn.removeAttribute('class');
            editCommentBtn.setAttribute('aria-pressed', false);
            editCommentBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1');
        })
        .catch((err) => {console.log("err: ", err)})   
    }
});

document.addEventListener('click', async function(event){   // 댓글 답변등록 버튼 클릭
    const replySubmit = event.target.classList.contains('replySubmit');
    if(replySubmit){
        const pageId = event.target.parentElement.parentElement.previousElementSibling.firstElementChild.getAttribute('data-page-id');
        const commentId = event.target.parentElement.parentElement.previousElementSibling.firstElementChild.getAttribute('data-reply-comment');
        const replyText = event.target.parentElement.previousElementSibling.value;
        
        const data = {nestedComment: {body: replyText}}
        const url = `/index/${pageId}/comments/${commentId}`
        
        // commentReply(event, replyText)
        // closeBox();

        await axios.post(url, data)
        .then((res) => {
            commentReply(event, replyText)
            const commentReplyBtn = document.querySelector(`[data-reply-comment="${commentId}"]`); // 답변버튼 토글 복구
            commentReplyBtn.removeAttribute('aria-pressed');
            commentReplyBtn.removeAttribute('class');
            commentReplyBtn.setAttribute('aria-pressed', false);
            commentReplyBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1');
            closeBox();
            // reloadCommentReply()
        })
        .catch((err) => { console.log("err: ", err) })
    }
});




// document.addEventListener('click', async function(event){   // 댓글 페이징
//     const pageNum = event.target.classList.contains('pageNum');
//     if(pageNum){
        
//     }
// })