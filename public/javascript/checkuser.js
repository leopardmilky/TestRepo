window.onpageshow = function(event){
    if(event.persisted){
        window.location.reload();
    }
}

history.pushState(null, null, location.href);
window.onpopstate = function (e) {
    history.go(1);
};