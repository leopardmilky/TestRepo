(function () {
    // 텍스트 에디터에 데이터 가져오기
    const mainText = document.getElementById("mainText").value;
    const doc = new DOMParser().parseFromString(mainText, "text/html");
    const nodes = doc.body.childNodes;
    const nodesCopy = Array.from(nodes);
    const targetElement = document.getElementById('text-input');
    for(node of nodesCopy){
        targetElement.appendChild(node);
    }
    const boardImgUrl = JSON.parse(document.getElementById("imgUrl").value);
    const imgElement = document.getElementById('text-input').querySelectorAll('img');
    
    imgElement.forEach((img) => {
        const imgNum = img.getAttribute('data-img-num');
        const url = boardImgUrl[imgNum];
        img.src = url;
    });
})();


let sel
let range
const imgObj = {};

function imgUpload(obj) {

    // 1. 이미지를 불러온다.
    // 2. 이미지 src 속성에 URL추가
    // 3. imgObj객체에 file 객체를 담는다.
    // 4. submit할때 일치하는 객체만 찾아서 보낸다. 

    const fileNum = document.querySelectorAll('.imgSize').length;

    if(obj.files.length + fileNum < 6) {    // 이미지 최대 첨부 개수 (업로드 하려는 이미지 갯수 + 업로드된 이미지 개수 < 6)
        if(range) {  // caret의 range값이 있을때.
            for(file of obj.files) {
                const img = new Image();
                const imgFile = URL.createObjectURL(file);
                img.src = imgFile;
                img.setAttribute('class', 'imgSize');
                img.setAttribute('alt', file.name);
                imgObj[imgFile] = file;
                range.insertNode(img);
            }
        }
    
        if(!range) { // caret의 range값이 없을때. (바로 사진 버튼 눌렀을때.)
            for(file of obj.files) {
                const img = new Image();
                const imgFile = URL.createObjectURL(file);
                img.src = imgFile;
                img.setAttribute('class', 'imgSize');
                img.setAttribute('alt', file.name);
                imgObj[imgFile] = file;
                caret.appendChild(img);
            }
        }
    } else {
        alert("최대 첨부 갯수 5개를 초과 했습니다.");
    }
    // input 초기화. (동일 이미지 파일 첨부 때문에)
    const imgBtn = document.getElementById('imgBtn');
    imgBtn.value = '';
};

const caret = document.querySelector('#text-input');
caret.onkeyup = function() {
    sel = window.getSelection();
    range = sel.getRangeAt(0);
};
caret.addEventListener('click', function() {
    sel = window.getSelection();
    range = sel.getRangeAt(0);
});

const pageId = document.getElementById("mainText").getAttribute('data-page-id');
async function updateContent() { // 게시물 수정

    const textData = document.getElementById('text-input');
    const titleData = document.getElementById('new2Title').value;
    const imgData = textData.querySelectorAll('img');
    const formData = new FormData();
    const uploadImgArr = [];    // 이미지 파일객체
    const imgIndex = {};        // '이미지 인덱스': '파일이름'(alt)

    let num = 0;
    imgData.forEach((img) => {
        img.setAttribute("data-img-num", num);
        if(Object.keys(imgObj).includes(img.src)) {
            uploadImgArr.push(imgObj[img.src]);
        }
        img.removeAttribute('src');
        imgIndex[num] = img.alt
        num++;
    })

    Object.keys(imgObj).forEach((blobUrl) => {  // blob URL 명시적 해제
        URL.revokeObjectURL(blobUrl);
    });

    formData.append('imgIndex', JSON.stringify(imgIndex));

    uploadImgArr.forEach((img) => {
        formData.append('images', img);
    });

    formData.append('title' ,titleData);
    formData.append('mainText' ,textData.innerHTML);

    await axios.put(`/index/${pageId}`, formData)
    .then((res) => {
        window.location.href =` http://localhost:3000/index/${res.data}`
    })
}