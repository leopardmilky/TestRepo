
function myPostTapMenu(e) {
    if(e.id === "tap-post") {
        window.location.href = "/mypage/mypost-post";
    }
    if(e.id === "tap-comment") {
        window.location.href = "/mypage/mypost-comment";
    }
}

function myLikeTapMenu(e) {
    if(e.id === "tap-post") {
        window.location.href = "/mypage/mylike-post";
    }
    if(e.id === "tap-comment") {
        window.location.href = "/mypage/mylike-comment";
    }
}

function myReportTapMenu(e) {
    if(e.id === "tap-post") {
        window.location.href = "/mypage/myreport-post";
    }
    if(e.id === "tap-comment") {
        window.location.href = "/mypage/myreport-comment";
    }
}