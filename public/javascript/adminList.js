
async function changeRoleToUser(e) {
    const userId = e.getAttribute('data-user-id');
    const data = {userId: userId};
    await axios.post('/admin/admin-list/change-role', data)
    .then((res) => {
        if(res.data === 'ok') {
            window.location.reload();
        }
    })
}

async function changeRoleToMaster(e) {
    const userId = e.getAttribute('data-user-id');
    const data = {userId: userId};
    await axios.post('/admin/search-user/change-role', data)
    .then((res) => {
        if(res.data === 'ok') {
            window.location.reload();
        }
    })
}

function goToPage(e) {
    const page = e.getAttribute('data-page');
    const currentURL = window.location.href;
    const url = new URL(currentURL);
    url.searchParams.set('page', page);
    window.location.href = `${url.href}`;
}
