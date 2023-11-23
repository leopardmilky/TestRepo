async function postLike() {

    const postId = document.getElementById('content-like').getAttribute('data-postId');

    axios.post(`/index/${postId}/postLike`)
    .then((res) => {

        if(res.data === 'nk') {
            return window.alert('로그인이 필요합니다.')
        }

        if(res.data === 'exist') {
            return window.alert('이미 추천한 게시물입니다.')
        }

        if(res.data.ok) {
            const updateLikes = document.getElementById('count-content-likes');
            updateLikes.innerHTML = `${res.data.ok}`
        }

    })
}