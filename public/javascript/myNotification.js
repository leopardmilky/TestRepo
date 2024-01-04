

// 모두 읽음 버튼 활성화 여부
window.onload = async function() {
    await axios.get('/mypage/mynotification-noread')
    .then((res) => {
        if(res.data) {
            const checkAllBtn = document.getElementById('check-all-btn');
            checkAllBtn.setAttribute('class', 'check-all-btn-active');
        } else {
            const checkAllBtn = document.getElementById('check-all-btn');
            checkAllBtn.disabled = true;
            checkAllBtn.setAttribute('class', 'check-all-btn');
        }
    })
}

async function goToComment(e) {
    const postId = e.getAttribute('data-post-id');
    const commentId = e.getAttribute('data-comment-id');
    const notiId = e.getAttribute('data-noti-id');
    const data = {notiId: notiId};
    await axios.post('/mypage/mynotification-check', data)
    .then((res) => {
        if(res.data === 'ok'){
            window.open(`/index/${postId}?commentId=${commentId}`);
        }
    })
}

async function goToPost(e) {
    const postId = e.getAttribute('data-post-id');
    const notiId = e.getAttribute('data-noti-id');
    const data = {notiId: notiId};
    await axios.post('/mypage/mynotification-check', data)
    .then((res) => {
        if(res.data === 'ok') {
            window.open(`/index/${postId}`)
        }
    })
}

async function checkAllNoti() {
    const notiCheck = document.getElementsByClassName('noti-check');
    [...notiCheck].forEach(element => {
        element.removeAttribute('class');
        element.setAttribute('class', 'fa-sharp fa-solid fa-check noti-check-active')
    });
    const checkAllBtn = document.getElementById('check-all-btn');
    checkAllBtn.disabled = true;
    checkAllBtn.removeAttribute('class');
    checkAllBtn.setAttribute('class', 'check-all-btn');

    await axios.get('/mypage/mynotification-allcheck')
    .then((res) => {
        console.log("checkAllNoti()_res.data: ", res.data);
    })
}


// 무한 스크롤 이벤트
const infinite = async () => {
    const scrollPosition = container.scrollTop;
    const containerHeight = container.scrollHeight;

    if (scrollPosition + container.clientHeight + 1 >= containerHeight) {
        const notiTbody = document.getElementById('noti-tbody');
        const notis = document.getElementsByClassName('tr-noti');
        const skip = notis.length;

        await axios.get('/mypage/mynotification-more', {params:{skip}})
        .then((res) => {
            for( noti of res.data) {
                if(noti.notificationType === 'note') {
                    if(noti.isRead) {
                        const data = `
                    <tr class="tr-noti">
                        <td class="td-noti received" data-note-id="${noti.noteId._id}" onclick="openNote(this)">
                            <div class="content-noti-wrap">
                                <p class="top-text"><b>${noti.sender.nickname}</b>님이 <b>쪽지</b>를 보냈습니다.</p>
                                <p class="bottom-text">"${noti.noteId.content}"</p>
                            </div>
                            <div class="check-noti-wrap">
                                <i class="fa-sharp fa-solid fa-check noti-check-active"></i>
                            </div>
                        </td>
                    </tr>`
                    notiTbody.insertAdjacentHTML('beforeend', data);
                    } else {
                        const data = `
                    <tr class="tr-noti">
                        <td class="td-noti received" data-note-id="${noti.noteId._id}" onclick="openNote(this)">
                            <div class="content-noti-wrap">
                                <p class="top-text"><b>${noti.sender.nickname}</b>님이 <b>쪽지</b>를 보냈습니다.</p>
                                <p class="bottom-text">"${noti.noteId.content}"</p>
                            </div>
                            <div class="check-noti-wrap">
                                <i class="fa-sharp fa-solid fa-check noti-check"></i>
                            </div>
                        </td>
                    </tr>`
                    notiTbody.insertAdjacentHTML('beforeend', data);
                    }
                }
                if(noti.notificationType === 'postComment') {
                    if(noti.isRead) {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-comment-id="${noti.commentId._id}" data-noti-id="${noti._id}"  onclick="goToComment(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text"><b>${noti.sender.nickname}</b>님이 <b>댓글</b>을 남겼습니다.</p>
                                    <p class="bottom-text">"${noti.commentId.body}"</p>
                                    <p class="ref-text">연관게시물: "${noti.postId.title}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check-active"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    } else {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-comment-id="${noti.commentId._id}" data-noti-id="${noti._id}"  onclick="goToComment(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text"><b>${noti.sender.nickname}</b>님이 <b>댓글</b>을 남겼습니다.</p>
                                    <p class="bottom-text">"${noti.commentId.body}"</p>
                                    <p class="ref-text">연관게시물: "${noti.postId.title}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    }

                }
                if(noti.notificationType === 'commentReply') {
                    if(noti.isRead) {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-comment-id="${noti.replyId._id}" data-noti-id="${noti._id}" onclick="goToComment(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text"><b>${noti.sender.nickname}</b>님이 <b>답변</b>을 남겼습니다.</p>
                                    <p class="bottom-text">"${noti.replyId.body}"</p>
                                    <p class="ref-text">연관댓글: "${noti.commentId.body}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check-active"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    } else {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-comment-id="${noti.replyId._id}" data-noti-id="${noti._id}" onclick="goToComment(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text"><b>${noti.sender.nickname}</b>님이 <b>답변</b>을 남겼습니다.</p>
                                    <p class="bottom-text">"${noti.replyId.body}"</p>
                                    <p class="ref-text">연관댓글: "${noti.commentId.body}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    }
                }
                if(noti.notificationType === 'likePost') {
                    if(noti.isRead) {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-noti-id="${noti._id}" onclick="goToPost(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text">해당 <b>게시물에 좋아요</b>를 받았습니다.</p>
                                    <p class="bottom-text">"${noti.postId.title}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check-active"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    } else {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-noti-id="${noti._id}" onclick="goToPost(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text">해당 <b>게시물에 좋아요</b>를 받았습니다.</p>
                                    <p class="bottom-text">"${noti.postId.title}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    }
                }
                if(noti.notificationType === 'likeComment') {
                    if(noti.isRead) {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-comment-id="${noti.commentId._id}" data-noti-id="${noti._id}" onclick="goToComment(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text">해당 <b>댓글에 좋아요</b>를 받았습니다.</p>
                                    <p class="bottom-text">"${noti.commentId.body}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check-active"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    } else {
                        const data = 
                        `<tr class="tr-noti">
                            <td class="td-noti" data-post-id="${noti.postId._id}" data-comment-id="${noti.commentId._id}" data-noti-id="${noti._id}" onclick="goToComment(this)">
                                <div class="content-noti-wrap">
                                    <p class="top-text">해당 <b>댓글에 좋아요</b>를 받았습니다.</p>
                                    <p class="bottom-text">"${noti.commentId.body}"</p>
                                </div>
                                <div class="check-noti-wrap">
                                    <i class="fa-sharp fa-solid fa-check noti-check"></i>
                                </div>
                            </td>
                        </tr>`
                        notiTbody.insertAdjacentHTML('beforeend', data);
                    }
                }
            } 
        })
    }
};

// 디바운스(마지막 호출함수만 실행)
let timer = null;
const debouncing = () => {
    //스크롤할 때마다 타이머 재설정
    if (timer) clearTimeout(timer);
    timer = setTimeout(infinite, 200);
};

// 무한 스크롤 이벤트
const container = document.getElementById('items-wrap');
container.addEventListener('scroll', debouncing)