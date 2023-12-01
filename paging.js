
module.exports.boardPaging = (page, totalPost) => {
    const maxPost = 20;
    const maxPage = 5;
    let currentPage = page ? parseInt(page) : 1;
    const hidePost = page === 1 ? 0 : (page - 1) * maxPost;
    const totalPage = Math.ceil(totalPost / maxPost);

    if (currentPage > totalPage) {
      currentPage = totalPage;
    }
  
    const startPage = Math.floor(((currentPage - 1) / maxPage)) * maxPage + 1;
    let endPage = startPage + maxPage - 1;
  
    if (endPage > totalPage) {
      endPage = totalPage;
    }
  
    return { startPage, endPage, hidePost, maxPost, totalPage, currentPage };
  };
  

module.exports.commentPaging = (commentPage, totalComments) => {
  const maxComment = 10;  // 게시물 수
  const maxCommentPage = 5;  // 페이지 수
  let currentCommentPage = commentPage ? parseInt(commentPage) : 1;
  const hideComment = commentPage === 1 ? 0 : (commentPage - 1) * maxComment;
  const totalCommentPage = Math.ceil(totalComments / maxComment); // 33개 게시물, 5페이지라면 총 7페이지
  
  if (currentCommentPage > totalCommentPage) { // 현재 페이지가 총 페이지 수를 넘어가면 맨끝 페이지로 이동.
    currentCommentPage = totalCommentPage;
  }

  const startCommentPage = Math.floor(((currentCommentPage - 1) / maxCommentPage)) * maxCommentPage + 1;  // 시작페이지 계산: 현재 페이지가 1이면 시작페이지는 1, 현재 페이지가 8이면 시작페이지는 6
  let endCommentPage = startCommentPage + maxCommentPage - 1;  // 시작 페이지가 6이고 마지막 페이지가 5인데 1을 뺴면 10 (맞네)

  if (endCommentPage > totalCommentPage) {  // 마지막 페이지가 총 페이지 보다 크면, 마지막 페이지가 총 페이지가 됨.
    endCommentPage = totalCommentPage;
  }

  return { startCommentPage, endCommentPage, hideComment, maxComment, totalCommentPage, currentCommentPage };
};