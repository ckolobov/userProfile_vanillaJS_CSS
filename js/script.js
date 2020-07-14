const userProfile = {
    store: {},
    service: {},
    view: {},
    init: {}
}

userProfile.service.getData =  async function(url) {
    const response = await fetch(url);
    return await response.json();
}

userProfile.service.getUser = function() {
    const user = userProfile.service.getData('https://randomuser.me/api/');
    user.then((data) => {
        userProfile.store.user = data;
        userProfile.view.drawUserInfo(data);
        userProfile.view.calcPostsHeight();
    });
}

userProfile.view.drawUserInfo = function(userData) {
    const userInfoBlock = document.getElementById('user-info');
    const { name, email, phone, location } = userData.results[0];

    userInfoBlock.innerHTML = `<p class="user-info__name">${name.title} ${name.first} ${name.last}</p>
    <p class="user-info__email">email: <a href="mailto:${email}">${email}</a></p>
    <p class="user-info__phone">phone: <a href="tel: ${phone}">${phone}</a></p>
    <p class="user-info__address">${location.postcode}, ${location.country}</p>
    <p class="user-info__address">${location.state}, ${location.city}</p>
    <p class="user-info__address">${location.street.name}, ${location.street.number}</p>`;
}

userProfile.service.getFriends = function() {
    const source = userProfile.service.getData('https://reqres.in/api/users');
    source.then(data => {
        return userProfile.service.getUsers(data.total_pages);
    }).then(friendsData => {
        userProfile.store.friendsData = friendsData;
        userProfile.view.drawFriendsInfo(friendsData);
    });
}

userProfile.service.getUsers = async function(pages) {
    const friends = [];
    const friendsData = [];

    for (let i = 1; i <= pages; i++) {
        let friendsPage = fetch(`https://reqres.in/api/users?page=${i}`).then(
            data => data.json()
        );
        friends.push(friendsPage);
    }

    const results = await Promise.all(friends);

    for (let i = 0; i < results.length; i++) {
        friendsData.push(results[i].data);
    }

    return friendsData.flat();
}

userProfile.view.drawFriendsInfo = function(friendsData) {
    const friendsContainer = document.getElementById('friends-container');
    const pagination = document.getElementById('friends-pagination');
    friendsContainer.innerHTML = '';
    let container = friendsContainer;
    for (let i = 0; i < friendsData.length; i++) {
        if (i % 3 === 0) {
            const pageNumber = i / 3 + 1;
            const link = document.createElement('a');
            link.className = 'friends-pagination__item js-paginationBtn';
            link.dataset.page = `${pageNumber}`;
            link.innerHTML = `${pageNumber} `;
            pagination.appendChild(link);
            container = document.createElement('div');
            container.id = `friends-page${pageNumber}`;
            container.className = 'friends-page js-friendsPage';
            friendsContainer.appendChild(container);
        }
        userProfile.view.drawFriendItem(friendsData[i], container);
    }
    userProfile.init.initPagination();
}

userProfile.view.drawFriendItem = function(friendData, container) {
    const { avatar, email, first_name, last_name } = friendData;
    const friendItem = document.createElement('div');
    const friendItemAvatar = document.createElement('div');
    const friendItemInfo = document.createElement('div');
    friendItem.className = 'friends-container__item';
    friendItemAvatar.className = 'friends-container__item-avatar';
    friendItemAvatar.style.backgroundImage = `url(${avatar})`;
    friendItemInfo.className = 'friends-container__item-info friend-info';
    friendItemInfo.innerHTML = `<p class="friend-info__item friend-info__first-name">${first_name}</p>
                                <p class="friend-info__item friend-info__last-name">${last_name}</p>
                                <p class="friend-info__item friend-info__email">email: <a href="mailto:${email}">${email}</a></p>`;
    friendItem.appendChild(friendItemAvatar);
    friendItem.appendChild(friendItemInfo);
    container.appendChild(friendItem);
}

userProfile.view.openFriendsPage = function(evt) {
    const pageNumber = evt.target.dataset.page;
    const containerCode = `friends-page${pageNumber}`;
    const pageContent = document.getElementsByClassName("js-friendsPage");
    const paginationButtons = document.getElementsByClassName("js-paginationBtn");
    for (let i = 0; i < pageContent.length; i++) {
        pageContent[i].style.display = "none";
    }
    for (let i = 0; i < paginationButtons.length; i++) {
        paginationButtons[i].className = paginationButtons[i].className.replace(" active", "");
    }
    document.getElementById(containerCode).style.display = "block";
    evt.currentTarget.className += " active";
}

userProfile.init.initPagination = function() {
    const paginationButtons = document.getElementsByClassName("js-paginationBtn");
    for (let i = 0; i < paginationButtons.length; i++) {
        paginationButtons[i].addEventListener('click', userProfile.view.openFriendsPage);
    }
    if (paginationButtons.length > 0) {
        paginationButtons[0].click();
    }
}

userProfile.view.filterFriendsList = function(evt) {
    const input = evt.currentTarget.value.toLowerCase();
    document.getElementById('friends-container').innerHTML = '';
    document.getElementById('friends-pagination').innerHTML = '';
    const filteredFriendsData = userProfile.store.friendsData.filter(friend => {
        return friend.first_name.toLowerCase().indexOf(input) === 0
               || friend.last_name.toLowerCase().indexOf(input) === 0
               || friend.email.toLowerCase().indexOf(input) === 0
    });

    userProfile.view.drawFriendsInfo(filteredFriendsData)
}

userProfile.init.initFriendsFilter = function() {
    const filterInput = document.getElementById('friends-filter');
    filterInput.addEventListener('input', userProfile.view.filterFriendsList);
}

userProfile.service.getPosts = function() {
    const friends = userProfile.service.getData('https://jsonplaceholder.typicode.com/posts');
    friends.then(userProfile.view.drawPostsInfo);
}

userProfile.view.drawPostsInfo = function(postsData) {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    for (let i = 0; i < postsData.length; i++) {
        const post = document.createElement('div');
        post.className = 'posts-container__item';
        post.innerHTML = userProfile.view.drawPostItem(postsData[i].title, postsData[i].body);
        postsContainer.appendChild(post);
    }

    userProfile.view.calcPostsHeight();
}

userProfile.view.drawPostItem = function(title, body) {
    return `<p class="posts-container__item-title">${title}</p>
            <p class="posts-container__item-body">${body}</p>`;
}

userProfile.view.calcPostsHeight = function() {
    const postsContainer = document.getElementById('posts-container');
    const userInfoHeight = document.getElementsByClassName('js-userInfo')[0].offsetHeight;
    const windowHeight = document.body.clientHeight;
    let height = 400;
    if (windowHeight - userInfoHeight - 95 > height) {
        height = windowHeight - userInfoHeight - 100;
    }
    postsContainer.style.height = `${height}px`;
}

userProfile.view.drawAvatar =function(e) {
    const output = document.getElementById('avatar');
    const imgPath = URL.createObjectURL(e.target.files[0]);
    output.style.backgroundImage = `url(${imgPath})`;
    output.onload = function() {
        URL.revokeObjectURL(imgPath);
    }
}

userProfile.init.fileInputInit = function() {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', userProfile.view.drawAvatar);
}

userProfile.view.openTab = function(evt) {
    const tabCode = evt.currentTarget.id;
    const containerCode = `tab-${tabCode}`;
    const tabContent = document.getElementsByClassName("js-tabContent");
    const tabButtons = document.getElementsByClassName("js-tabBtn");
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(containerCode).style.display = "block";
    evt.currentTarget.className += " active";
}

userProfile.init.initTabs = function () {
    const tabButtons = document.getElementsByClassName("js-tabBtn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].addEventListener('click', userProfile.view.openTab);
    }
    tabButtons[0].click();
}

userProfile.init.initAll = function() {
    userProfile.init.fileInputInit();
    userProfile.init.initTabs();
    userProfile.service.getUser();
    userProfile.service.getFriends();
    userProfile.service.getPosts();
    userProfile.init.initFriendsFilter();
}

document.addEventListener("DOMContentLoaded", userProfile.init.initAll);