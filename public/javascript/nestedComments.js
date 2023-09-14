
function closeBox(event) {

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

function commentEditBox(event){

    const commentText = event.target.parentElement.previousElementSibling.firstElementChild.innerHTML;
    // const commentText = event.target.parentElement.previousElementSibling.children[0].innerHTML;
    const parentEle = event.target.parentElement.parentElement;

    const a = document.createElement('div');
    const b = document.createElement('label');
    const c = document.createElement('textarea');
    const d = document.createElement('div');
    const e = document.createElement('span');

    a.setAttribute('class', 'mb-3 px-3 editCommentWrap');
    b.setAttribute('class', 'form label w-100');
    c.setAttribute('class', 'form-control');
    c.innerHTML = commentText;
    d.setAttribute('class', 'd-flex justify-content-end mt-1');
    e.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1');
    e.innerHTML = "등록";

    const atag = parentEle.appendChild(a);
    const btag = atag.appendChild(b);
    const ctag = atag.appendChild(c);
    const dtag = atag.appendChild(d);
    const etag = dtag.appendChild(e);

}

function commentReplyBox(event) {

    const parentEle = event.target.parentElement.parentElement;

    const a = document.createElement('div');
    const b = document.createElement('label');
    const c = document.createElement('textarea');
    const d = document.createElement('div');
    const e = document.createElement('span');

    a.setAttribute('class', 'mb-3 px-3 replyCommentWrap');
    b.setAttribute('class', 'form label w-100');
    c.setAttribute('class', 'form-control');
    d.setAttribute('class', 'd-flex justify-content-end mt-1');
    e.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1');
    e.innerHTML = "등록";

    const atag = parentEle.appendChild(a);
    const btag = atag.appendChild(b);
    const ctag = atag.appendChild(c);
    const dtag = atag.appendChild(d);
    const etag = dtag.appendChild(e);

}

document.addEventListener('click', function(event){  // 답변,수정 버튼 관련

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
