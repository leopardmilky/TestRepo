
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

function commentReplyBox(event) {

    const parentEle = event.target.parentElement.parentElement;

    const a = document.createElement('div');
    const b = document.createElement('label');
    const c = document.createElement('textarea');
    const d = document.createElement('div');
    const e = document.createElement('button');

    a.setAttribute('class', 'mb-3 px-3 replyCommentWrap');
    b.setAttribute('class', 'form label w-100');
    c.setAttribute('class', 'form-control');
    d.setAttribute('class', 'd-flex justify-content-end mt-1');
    e.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1 me-1 sbm replySubmit');
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


document.addEventListener('click', async function(event){
    const sbm = event.target.classList.contains('sbm');
    // console.log(event)
    if(sbm){
        const pageId = event.target.parentElement.parentElement.previousElementSibling.firstElementChild.getAttribute('data-page-id');
        const commentId = event.target.parentElement.parentElement.previousElementSibling.firstElementChild.getAttribute('data-reply-comment');
        const editText = event.target.parentElement.previousElementSibling.value;
        // console.log(editText)
        console.log("event: ", event);
        const config = {comment:{body: editText}}
        // console.log(config)
        // event.preventDefault();
        const axiosData = await axios.put(`/index/${pageId}/comments/${commentId}`, config)
        .then((res) => {
            console.log("res: ", res)
            closeBox();
        })
        .catch((err) => {console.log("err: ", err)})
        
        console.log("axiosData: ", axiosData)
    }
});















// let commentReplyBtn = document.querySelectorAll('.commentReplyBtn'); // 근데 commentReplyBtn 클래스는 나중에 사라지는데 어떻게 계속 작동하지? 처음 로딩시 변수에 다 저장되서 그런건가..
// commentReplyBtn.forEach((target) => target.addEventListener('click', function(){
//     funcc(target)
// }))

// let commentEditBtn = document.querySelectorAll('.commentEditBtn');
// commentEditBtn.forEach((target) => target.addEventListener('click', function(){
//     funcc(target)
// }))

// function funcc(target){
//     console.log(target.parentElement.previousElementSibling.firstElementChild)
    
// }