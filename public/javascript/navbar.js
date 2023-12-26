
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

// const notiDropdownWrap = document.getElementById('noti-dropdown-wrap');
notiDropdownWrap.addEventListener('click', function(e) {

    // const notiDropdownWrap = document.getElementById('noti-dropdown-wrap');

    // const targetElement = e.target;
    // const notiDropdownWrap = document.querySelector('.noti-dropdown-wrap');
    // const isDropdownOpen = notiDropdownWrap.style.display === 'block';
    // console.log("isDropdownOpen: ", isDropdownOpen);
    // if (!targetElement.closest('.noti-dropdown-wrap') && isDropdownOpen) {
    //     notiDropdownWrap.style.display = 'none';
    // }

    // const result = targetElement.closest('.noti-dropdown-wrap');
    // console.log("result: ", result);

});

// const notiAlarmIcon = document.getElementsByClassName('noti-alarm-icon');
// console.log("notiAlarmIcon: ", notiAlarmIcon);

document.addEventListener('click', () => {
    const notiDropdownWrap = document.querySelector('#noti-dropdown-wrap');
    console.log("notiDropdownWrap: ", notiDropdownWrap);
    notiDropdownWrap.style.display === 'block';
});

document.addEventListener('blur', () => {
    const notiDropdownWrap = document.querySelector('#noti-dropdown-wrap');
    notiDropdownWrap.style.display === 'none';
});




// function notiDropdown(e) {
//     const notiDropdownWrap = document.getElementById('noti-dropdown-wrap');
//     const isDisplayed = notiDropdownWrap.style.display !== 'block';
//     notiDropdownWrap.style.display = isDisplayed ? 'block' : 'none';

//     if(isDisplayed) {
//         axios.get('/mypage/mynoti')
//         .then((res) => {

//             if(res.data.length === 0) {
//                 const notiContentWrap = document.getElementById('noti-content-wrap');
//                 const notiCount = document.getElementById('noti-count');
//                 notiContentWrap.innerHTML = `<div id="noti-none">새로운 알림이 없습니다.</div>`;
//                 notiCount.innerHTML = `총 <b>${res.data.length}</b>개의 알림이 있습니다.`;
//             }

//             if(res.data.length > 0) {
//                 const notiCount = document.getElementById('noti-count');
//                 notiCount.innerHTML = `총 <b>${res.data.length}</b>개의 알림이 있습니다.`;

//                 const notiContentWrap = document.getElementById('noti-content-wrap');
//                 notiContentWrap.innerHTML = '';

//                 for(data of res.data) {
//                     if(data.notificationType === 'postComment') {
//                         const alarm = 
//                         `<div class="noti-dropdown">
//                             <div class="noti-dropdown-title">
//                                 <i class="fa-sharp fa-solid fa-comment"></i></i> ${data.sender.nickname}님이 댓글을 남겼습니다.
//                             </div>
//                             <div class="noti-dropdown-text">"${data.commentId.body}"</div>
//                         </div>`
//                         notiContentWrap.innerHTML += alarm;
//                     }

//                     if(data.notificationType === 'commentReply') {
//                         const alarm = 
//                         `<div class="noti-dropdown">
//                             <div class="noti-dropdown-title">
//                                 <i class="fa-sharp fa-solid fa-comments"></i></i> ${data.sender.nickname}님이 답변을 남겼습니다.
//                             </div>
//                             <div class="noti-dropdown-text">"${data.commentId.body}"</div>
//                         </div>`
//                         notiContentWrap.innerHTML += alarm;
//                     }

//                     if(data.notificationType === 'likePost') {
//                         const alarm = 
//                         `<div class="noti-dropdown">
//                             <div class="noti-dropdown-title">
//                                 <i class="fa-sharp fa-solid fa-thumbs-up"></i> 해당 게시물에 좋아요를 받았습니다.
//                             </div>
//                             <div class="noti-dropdown-text">"${data.postId.title}"</div>
//                         </div>`
//                         notiContentWrap.innerHTML += alarm;
//                     }

//                     if(data.notificationType === 'likeComment') {
//                         const alarm = 
//                         `<div class="noti-dropdown">
//                             <div class="noti-dropdown-title">
//                                 <i class="fa-sharp fa-solid fa-thumbs-up"></i> 해당 댓글에 좋아요를 받았습니다.
//                             </div>
//                             <div class="noti-dropdown-text">"${data.commentId.body}"</div>
//                         </div>`
//                         notiContentWrap.innerHTML += alarm;
//                     }

//                     if(data.notificationType === 'note') {
//                         const alarm = 
//                         `<div class="noti-dropdown">
//                             <div class="noti-dropdown-title">
//                                 <i class="fa-sharp fa-solid fa-envelope noti-icon"></i> ${data.sender.nickname}님이 쪽지를 보냈습니다.
//                             </div>
//                             <div class="noti-dropdown-text">"${data.noteId.content}"</div>
//                         </div>`
//                         notiContentWrap.innerHTML += alarm;
//                     }
//                 }
//             }
//         })
//     }
// }