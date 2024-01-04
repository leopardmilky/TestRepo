
document.addEventListener('click', function(event){  // navbar의 signin, signout버튼
    const signOutBtn = event.target.classList.contains('signOutBtn');
    const signInBtn = event.target.classList.contains('signInBtn');

    if(signOutBtn){ // navbar signout버튼
        const targetUrl = event.target.attributes.class.ownerDocument.location.pathname; // 현재 페이지URL정보 가져옴
        window.location.href = `/signout?redirectUrl=${targetUrl}`
    }

    if(signInBtn){ // navbar signin버튼
        const targetUrl = event.target.attributes.class.ownerDocument.location.pathname;
        window.location.href = `/signin?redirectUrl=${targetUrl}`
    }
});


document.addEventListener('click', (e) => {  // 알림 드롭다운 영역 밖에 클릭 시 꺼짐 기능
    const notiCommon = e.target.classList.contains('noti-common');
    if(!notiCommon) {
        const notiDropdownWrap = document.getElementById('noti-dropdown-wrap');
        if(notiDropdownWrap) {
            if(notiDropdownWrap.style.display === 'block') notiDropdownWrap.style.display = 'none';
        }
    }
});


function openNote_nav(e) {
    const noteId = e.getAttribute('data-note-id');
    window.open(`/mypage/view-note?noteId=${noteId}&type=received`,"_blank","width=550, height=370, top=100px, left=100px");
    // if(e.classList.contains('received')) {
    //     return window.open(`/mypage/view-note?noteId=${noteId}&type=received`,"_blank","width=550, height=370, top=100px, left=100px");
    // }
    // if(e.classList.contains('sent')) {
    //     return window.open(`/mypage/view-note?noteId=${noteId}&type=sent`,"_blank","width=550, height=370, top=100px, left=100px");
    // }
    // if(e.classList.contains('inbox')) {
    //     return window.open(`/mypage/view-note?noteId=${noteId}&type=inbox`,"_blank","width=550, height=370, top=100px, left=100px");
    // }
}

async function goToComment_nav(e) {
    const postId = e.getAttribute('data-post-id');
    const commentId = e.getAttribute('data-comment-id');
    const notiId = e.getAttribute('data-noti-id');
    const data = {notiId: notiId};
    await axios.post('/mypage/mynotification-check', data)
    .then((res) => {
        if(res.data === 'ok'){
            window.location.href = `/index/${postId}?commentId=${commentId}`;
        }
    })
    
}

async function goToPost_nav(e) {
    const postId = e.getAttribute('data-post-id');
    const notiId = e.getAttribute('data-noti-id');
    const data = {notiId: notiId};
    await axios.post('/mypage/mynotification-check', data)
    .then((res) => {
        if(res.data === 'ok') {
            window.location.href = `/index/${postId}`;
        }
    })
    
}

function notiDropdown(e) {
    const notiDropdownWrap = document.getElementById('noti-dropdown-wrap');
    const isDisplayed = notiDropdownWrap.style.display !== 'block';
    notiDropdownWrap.style.display = isDisplayed ? 'block' : 'none';

    if(isDisplayed) {
        axios.get('/mypage/nav-noti')
        .then((res) => {

            if(res.data.length === 0) {
                const notiContentWrap = document.getElementById('noti-content-wrap');
                while(notiContentWrap.firstChild){ notiContentWrap.removeChild(notiContentWrap.firstChild) }
                notiContentWrap.insertAdjacentHTML('beforeend', `<div id="noti-none">새로운 알림이 없습니다.</div>`)

                const notiCount = document.getElementById('noti-count');
                while(notiCount.firstChild){ notiCount.removeChild(notiCount.firstChild) }
                notiCount.insertAdjacentHTML('beforeend', `총 <b>${res.data.length}</b>개의 새 알림이 있습니다.`)
            }

            if(res.data.length > 0) {
                const notiCount = document.getElementById('noti-count');
                while(notiCount.firstChild){ notiCount.removeChild(notiCount.firstChild) }
                notiCount.insertAdjacentHTML('beforeend', `총 <b>${res.data.length}</b>개의 새 알림이 있습니다.`);

                const notiContentWrap = document.getElementById('noti-content-wrap');
                while(notiContentWrap.firstChild){ notiContentWrap.removeChild(notiContentWrap.firstChild) }
                for(noti of res.data) {
                    if(noti.notificationType === 'postComment') {
                        const alarm = 
                        `<div class="noti-dropdown" data-post-id="${noti.postId._id}" data-comment-id="${noti.commentId._id}" data-noti-id="${noti._id}" onclick="goToComment_nav(this)">
                            <div class="noti-dropdown-title">
                                <i class="fa-sharp fa-solid fa-comment"></i></i> ${noti.sender.nickname}님이 댓글을 남겼습니다.
                            </div>
                            <div class="noti-dropdown-text">"${noti.commentId.body}"</div>
                        </div>`
                        notiContentWrap.insertAdjacentHTML('beforeend', alarm);
                    }

                    if(noti.notificationType === 'commentReply') {
                        const alarm = 
                        `<div class="noti-dropdown" data-post-id="${noti.postId._id}" data-comment-id="${noti.replyId._id}" data-noti-id="${noti._id}" onclick="goToComment_nav(this)">
                            <div class="noti-dropdown-title">
                                <i class="fa-sharp fa-solid fa-comments"></i></i> ${noti.sender.nickname}님이 답변을 남겼습니다.
                            </div>
                            <div class="noti-dropdown-text">"${noti.replyId.body}"</div>
                        </div>`
                        notiContentWrap.insertAdjacentHTML('beforeend', alarm);
                    }

                    if(noti.notificationType === 'likePost') {
                        const alarm = 
                        `<div class="noti-dropdown" data-post-id="${noti.postId._id}" data-noti-id="${noti._id}" onclick="goToPost_nav(this)">
                            <div class="noti-dropdown-title">
                                <i class="fa-sharp fa-solid fa-thumbs-up"></i> 해당 게시물에 좋아요를 받았습니다.
                            </div>
                            <div class="noti-dropdown-text">"${noti.postId.title}"</div>
                        </div>`
                        notiContentWrap.insertAdjacentHTML('beforeend', alarm);
                    }

                    if(noti.notificationType === 'likeComment') {
                        const alarm = 
                        `<div class="noti-dropdown" data-post-id="${noti.postId._id}" data-comment-id="${noti.commentId._id}" data-noti-id="${noti._id}" onclick="goToComment_nav(this)">
                            <div class="noti-dropdown-title">
                                <i class="fa-sharp fa-solid fa-thumbs-up"></i> 해당 댓글에 좋아요를 받았습니다.
                            </div>
                            <div class="noti-dropdown-text">"${noti.commentId.body}"</div>
                        </div>`
                        notiContentWrap.insertAdjacentHTML('beforeend', alarm);
                    }

                    if(noti.notificationType === 'note') {
                        const alarm = 
                        `<div class="noti-dropdown" data-note-id="${noti.noteId._id}" onclick="openNote_nav(this)">
                            <div class="noti-dropdown-title">
                                <i class="fa-sharp fa-solid fa-envelope noti-icon"></i> ${noti.sender.nickname}님이 쪽지를 보냈습니다.
                            </div>
                            <div class="noti-dropdown-text">"${noti.noteId.content}"</div>
                        </div>`
                        notiContentWrap.insertAdjacentHTML('beforeend', alarm);
                    }
                }
            }
        })
    }
}