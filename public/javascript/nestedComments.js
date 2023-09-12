document.addEventListener('click', function(event){
    if(event.target.classList.contains('commentEditBtn')){
        const commentId = event.target.getAttribute('data-comment-id');
        console.log(commentId);
        
        const parenEle = event.target.parentElement.parentElement;
        console.log(parenEle);

        event.target.style.display = 'none';

        const a = document.createElement('div');
        const b = document.createElement('label');
        const c = document.createElement('textarea');
        const d = document.createElement('div');
        const e = document.createElement('span');
        const f = document.createElement('span');

        a.setAttribute('class', 'mb-3 px-3');
        b.setAttribute('class', 'form label w-100');
        c.setAttribute('class', 'form-control');
        d.setAttribute('class', 'd-flex justify-content-end mt-1');
        e.setAttribute('class', 'btn btn-outline-warning btn-sm p-1 me-1');
        e.innerHTML = "등록";
        f.setAttribute('class', 'btn btn-outline-secondary btn-sm p-1');
        f.innerHTML = "취소";

        const atag = parenEle.appendChild(a);
        const btag = atag.appendChild(b);
        const ctag = atag.appendChild(c);
        const dtag = atag.appendChild(d);
        const etag = dtag.appendChild(e);
        const ftag = dtag.appendChild(f);
        
    }
})


    // const editbtns = document.querySelectorAll('.editComment');
    // for(let editbtn of editbtns ){
    //     editbtn.addEventListener('click', function(){
    //         const item = this.getAttribute('data-comment-id');
    //         console.log(item);
    //     })
    // }