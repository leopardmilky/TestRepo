// 게시물 htmlString to html 변환
const mainText = document.getElementById('mainText').innerHTML;
document.getElementById('mainText').innerHTML = '';
const txtarea = document.createElement("textarea");
txtarea.innerHTML = mainText;
const doc = new DOMParser().parseFromString(txtarea.value, "text/html");
const nodes = doc.body.childNodes;
const nodesCopy = Array.from(nodes);
const targetElement = document.getElementById('mainText');
for(node of nodesCopy){
    targetElement.appendChild(node);
}

// img태그에 맞는 이미지 s3에서 주소 가져와 src에 삽입.
const imgData = document.getElementById('mainText').querySelectorAll('img');
const boardImg = document.getElementById('boardImg');
const boardImgUrl = JSON.parse(boardImg.value);

imgData.forEach((img) => {
    const imgNum = img.getAttribute('data-img-num');
    const url = boardImgUrl[imgNum];
    img.src = url;
    img.setAttribute('style', 'max-width: 100%;');
});

boardImg.remove();


async function postLike() { // 게시물 좋아요 버튼.

    const postId = document.getElementById('content-like').getAttribute('data-postId');

    await axios.post(`/index/${postId}/postLike`)
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