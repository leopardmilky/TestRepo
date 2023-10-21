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
window.onload = function() {
    const mainText = document.getElementById('mainText');
    const imgData = mainText.querySelectorAll('img');
    const boardImg = document.getElementById('boardImg').value;
    const boardImgObject = JSON.parse(boardImg);

    imgData.forEach((img) => {
        const imgNum = img.getAttribute('data-img-num');
        const url = boardImgObject[imgNum];
        img.src = url;
        img.setAttribute('style', 'max-width: 100%;');
    });
}

 