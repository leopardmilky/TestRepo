// 내가 원하는 caret의 위치에 이미지를 추가해야함.
// -> caret의 위치 정보를 실시간으로 담고 있다가 이미지 추가시 마지막 caret위치에 이미지를 추가.

let sel
let range

function imgUpload(obj) {
    if(range){  // caret의 range값이 있을때.
        for(file of obj.files) {
            let img = new Image();
            img.src = URL.createObjectURL(file);
            img.setAttribute('class', 'imgSize');
            range.insertNode(img);
        }
    }
    if(!range){ // caret의 range값이 없을때.(바로 사진 버튼 눌렀을때.)
        for(file of obj.files){
            let img = new Image();
            img.src = URL.createObjectURL(file);
            img.setAttribute('class', 'imgSize');
            caret.appendChild(img);
        }
    }
};

const caret = document.querySelector('#new2MainText');
caret.onkeyup = function(){
    sel = window.getSelection();
    range = sel.getRangeAt(0);
};
caret.addEventListener('click', function(){
    sel = window.getSelection();
    console.log("anchorNode: ", sel.anchorNode);
    console.log("focusNode: ", sel.focusNode);

    range = sel.getRangeAt(0);
    console.log("sel: ", sel);
    console.log("click: ", range);
    console.log("range.getRangeAt(0).startContainer: ", range.getRangeAt(0).startContainer)
});

function boldStyle(obj){



};



// document.getElementById('boldBtn').addEventListener('click', function(){
    
// });

