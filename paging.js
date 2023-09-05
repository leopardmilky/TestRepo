

module.exports.paging = (page, totalPost) => {
    const maxPost = 5;
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