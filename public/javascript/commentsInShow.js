
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
    // console.log("parentEle: ", parentEle)

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
    c.setAttribute('class', 'd-flex justify-content-between px-3 mb-3 nestedCommentInfoWrap');
    g.setAttribute('class', 'd-flex justify-content-between px-3');
    h.setAttribute('id', 'commentReply_body');
    h.setAttribute('style', 'white-space: pre-wrap;');
    // h.setAttribute('data-commentReply-body', '')
    h.innerHTML = replyText;
    i.setAttribute('class', 'd-flex justify-content-end px-3 mb-1');
    j.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 nestedCommentDelete');
    j.innerHTML = "삭제";
    k.setAttribute('class', 'btn btn-outline-danger btn-sm p-1 nestedCommentReport');
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

function signedInUserInfo(){
    console.log("signedInUserInfo???????????????: ", req.session.userInfo) 
}

async function reloadCommentReply(pageId, commentId){  // 댓글 페이지 리로드
    const result = await axios.get(`/index/${pageId}/comments/${commentId}`);
    // console.log("reloadCommentReply@@@@@@@@@@@: ",result.data);
    

    document.querySelector('.commentWrap').remove();
    document.querySelector('.allNestedCommentsWrap').remove();
    // // 불러온 모든댓글 페이지에 다시 로드...

    // // 댓글
    // const allCommentsWrap = document.createElement('div');
    const commentWrap = document.createElement('div');
    const commentInfoWrap = document.createElement('div');
    const commentNickname = document.createElement('span');
    const nicknameBold = document.createElement('b');
    const commentDate = document.createElement('span');
    const commentBodyWrap = document.createElement('div');
    const commentBody = document.createElement('p');
    const commentBtnWrap = document.createElement('div');
    const commentReplyBtn = document.createElement('button');
    const commentEditBtn = document.createElement('button');
    const commentDeleteForm = document.createElement('form');
    const commentDelete = document.createElement('button');
    const commentReport = document.createElement('a');
    
    // allCommentsWrap.setAttribute('class', 'd-flex flex-column w-100 align-items-center allCommentsWrap');
    commentWrap.setAttribute('class', 'card mt-2 w-75 border-start-0 border-end-0 border-bottom-0 commentWrap');
    commentInfoWrap.setAttribute('class', 'd-flex justify-content-between px-3 mb-3 mt-2 commentInfoWrap');
    commentNickname.setAttribute('class', 'commentNickname');
    nicknameBold.setAttribute('class', 'nicknameBold');
    commentDate.setAttribute('class', 'commentDate');
    commentBodyWrap.setAttribute('class', 'd-flex justify-content-between px-3 mb-1 commentBodyWrap');
    commentBody.setAttribute('class', 'commentBody');
    commentBody.setAttribute('id', 'commentBody');
    commentBody.setAttribute('style', 'white-space: pre-wrap;');
    
    commentBtnWrap.setAttribute('class', 'd-flex justify-content-end px-3 mb-3 commentBtnWrap');
    // commentReplyBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 commentReplyBtn');
    // commentReplyBtn.setAttribute('data-bs-toggle', 'button');
    // commentReplyBtn.setAttribute('data-page-id', `${채워넣기}`);
    // commentReplyBtn.setAttribute('data-reply-comment', `${채워넣기}`);
    // commentReplyBtn.innerHTML = '답변';
    // commentEditBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 commentEditBtn');
    // commentEditBtn.setAttribute('data-bs-toggle', 'button');
    // commentEditBtn.setAttribute('data-page-id', `${채워넣기}`);
    // commentEditBtn.setAttribute('data-comment-edit', `${채워넣기}`);
    // commentEditBtn.innerHTML = '수정';
    // commentDeleteForm.setAttribute('class', 'commentDeleteForm');
    // commentDeleteForm.setAttribute('action', `${채워넣기}`);
    // commentDeleteForm.setAttribute('method', 'POST');
    // commentDelete.setAttribute('class', 'btn btn-outline-danger btn-sm p-1 commentDelete');
    // commentDelete.innerHTML = '삭제';
    // commentReport.setAttribute('class', 'btn btn-outline-danger btn-sm p-1 commentReport');
    // commentReport.setAttribute('href', '#');
    // commentReport.innerHTML = '신고';


    // // 대댓글
    // const allNestedCommentsWrap = document.createElement('div');
    // const nestedCommentWrap = document.createElement('div');
    // const nestedCommentInnerWrap = document.createElement('div');
    // const nestedCommentInfoWrap = document.createElement('div');
    // const nestedCommentNickname = document.createElement('span');
    // const nestedNicknameBold = document.createElement('b');
    // const nestedCommentDate = document.createElement('span');
    // const nestedCommentBodyWrap = document.createElement('div');
    // const nestedCommentBody = document.createElement('p');
    // const nestedCommentBtnWrap = document.createElement('div');
    // const nestedCommentDelete = document.createElement('button');
    // const nestedCommentReport = document.createElement('button');

    // allNestedCommentsWrap.setAttribute('class', 'd-flex flex-column w-100 align-items-center allNestedCommentsWrap');
    // nestedCommentWrap.setAttribute('class', 'w-75 border-0 d-flex flex-column align-items-end nestedCommentWrap');
    // nestedCommentInnerWrap.setAttribute('class', 'card mb-1 d-flex flex-column bg-light nestedCommentInnerWrap');
    // nestedCommentInfoWrap.setAttribute('class', 'd-flex justify-content-between px-3 mb-3 nestedCommentInfoWrap');
    // nestedCommentNickname.setAttribute('class', 'nestedCommentNickname');
    // nestedNicknameBold.setAttribute('class', 'nestedNicknameBold');
    // nestedCommentDate.setAttribute('class', 'nestedCommentDate');
    // nestedCommentBodyWrap.setAttribute('class', 'd-flex justify-content-between px-3 nestedCommentBodyWrap');
    // nestedCommentBody.setAttribute('id', 'nestedCommentBody');
    // nestedCommentBody.setAttribute('class', 'nestedCommentBody');
    // nestedCommentBody.setAttribute('style', 'white-space: pre-wrap;');
    // nestedCommentBody.setAttribute('data-commentReply-body', `${채워넣기}`);
    // nestedCommentBtnWrap.setAttribute('class', 'd-flex justify-content-end px-3 mb-1 nestedCommentBtnWrap');
    // nestedCommentDelete.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 nestedCommentDelete');
    // nestedCommentDelete.innerHTML = '삭제';
    // nestedCommentReport.setAttribute('class', 'btn btn-outline-danger btn-sm p-1 nestedCommentReport');
    // nestedCommentReport.innerHTML = '신고';


    // console.log('author:', result.data.author);
    // console.log('comments:', result.data.comments);
    // console.log('nestedComments:', result.data.comments[0].nestedComments);
    // console.log('nestedComments_author:', result.data.comments[0].nestedComments[0].author);

    
    result.data.comments.forEach((element) => {
        // console.log("element111111111111111: ", element);

        const allCommentsWrap = document.querySelector('.allCommentsWrap');
        allCommentsWrap.appendChild(commentWrap);
        commentWrap.appendChild(commentInfoWrap);
        commentInfoWrap.appendChild(commentNickname);
        commentNickname.appendChild(nicknameBold);
        nicknameBold.innerHTML = `${element.author.nickname}`

        commentInfoWrap.appendChild(commentDate)
        const cmDate = new Date(element.createdAt)
        commentDate.innerHTML = `${cmDate.getFullYear()}-${String(cmDate.getMonth()+1).padStart(2,'0')}-${String(cmDate.getDate()).padStart(2,'0')} ${String(cmDate.getHours()).padStart(2,'0')}:${String(cmDate.getMinutes()).padStart(2,'0')}:${String(cmDate.getSeconds()).padStart(2,'0')}`;
        
        commentWrap.appendChild(commentBodyWrap);
        commentBody.setAttribute('data-comment-body', `${element._id}`);
        commentBody.innerHTML = `${element.body}`;
        commentBodyWrap.appendChild(commentBody);

        commentWrap.appendChild(commentBtnWrap);
        signedInUserInfo()
        // console.log("req.session.userInfo: ", );
        // if(signedInUser){
        //     console.log('이걸 어떻게 구분하지......')
        // }



        // console.log(typeof new Date(element.createdAt))
        // console.log(new Date(element.createdAt))









        element.nestedComments.forEach((element) => {
            // console.log("element2222222222222222: ", element)
        })
    })



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
            commentReply(event, replyText);
            const commentReplyBtn = document.querySelector(`[data-reply-comment="${commentId}"]`); // 답변버튼 토글 복구
            commentReplyBtn.removeAttribute('aria-pressed');
            commentReplyBtn.removeAttribute('class');
            commentReplyBtn.setAttribute('aria-pressed', false);
            commentReplyBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1');
            // reloadCommentReply(pageId)
            closeBox();
            console.log("RES@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",res.data)
            reloadCommentReply(pageId, commentId)        
        })
        .catch((err) => { console.log("err: ", err) })
        // console.log("RESULT@@@@@@@@@@@@@@@@@@: ", result);
        // console.log("RESULT_DATA@@@@@@@@@@@@@@@@@@: ", result.data);
    }
});




// document.addEventListener('click', async function(event){   // 댓글 페이징
//     const pageNum = event.target.classList.contains('pageNum');
//     if(pageNum){
        
//     }
// })