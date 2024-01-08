
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




// select option 검색 후에도 초기화되지 않게 저장.
document.addEventListener("DOMContentLoaded", function() {
    const selectedOption = localStorage.getItem("selectedOption");
    if (selectedOption) {
        document.getElementById("select-option").value = selectedOption;
    }
    document.getElementById("select-option").addEventListener("change", function() {
        const selectedValue = this.value;
        localStorage.setItem("selectedOption", selectedValue);
    });
});
