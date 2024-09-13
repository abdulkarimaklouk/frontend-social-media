import { classList, fetchData } from "./functions.js";
let bodyMyFamily = document.querySelector("#myFamily body")
let overLow = document.querySelector("#myFamily .over-low");
let sectionCreatePost = document.querySelector("#myFamily .over-low .create-post");
let sectionShowPost = document.querySelector("#myFamily .over-low .show-onepost");
let contentPostShowPost = sectionShowPost.querySelector(".content-post");
let sectionUpdatePost = document.querySelector("#myFamily .over-low .update-post");
let divConfirm = document.querySelector("#myFamily .over-low #confirm");
let arrOverLow = [sectionCreatePost, sectionShowPost, sectionUpdatePost, divConfirm];
let navMain = document.querySelector("#myFamily main > nav");
let rectangle = document.querySelector("#myFamily main > section .rectangle");
let storys = document.querySelector("#myFamily main > section .storys");
let sectionPosts = document.querySelector("#myFamily main > section .posts");

const token = localStorage.getItem("token");
let headers = {};
if (token) {
    headers = {
        'Authorization': `Bearer ${token.slice(1, -1)}`
    }
}
// get user 
const user = await getUser();
async function getUser() {
    if (!token || token === "undefined") {
        toPageLogin();
    }
    let user = await fetch("http://localhost:3000/api/users/user", {
        headers
    });
    user = await user.json();
    if (user["status"] === "success") {
        return user.data;
    } else {
        toPageLogin();
    }
}

// avatar
const avatarUser = await avatarFetch();
async function avatarFetch() {
    let avatarBlob = await fetch(`http://localhost:3000${user.avatar}`);
    avatarBlob = URL.createObjectURL(await avatarBlob.blob());
    return avatarBlob;
}


rectangle.querySelector("div img").src = avatarUser;
storys.querySelector(".add-story img").src = avatarUser;

// log out
document.querySelector("#log-out").addEventListener("click", (e) => {
    toPageLogin();
})


// get data to nav 

navMain.querySelector(".info-section .info-text a h3").textContent = user.username;
navMain.querySelector(".user-photo a img").src = avatarUser;



//post crud

let limit = 5;


// create post
rectangle.onclick = () => {
    let textareaPost = document.querySelector("#myFamily .over-low .create-post textarea");
    domSections(sectionCreatePost);
    sectionCreatePost.querySelector(".user span").textContent = user.username;
    sectionCreatePost.querySelector(".user img").src = avatarUser;
    createPost(textareaPost);
    valueInputsStyle(textareaPost, sectionCreatePost, "color: #000; border: #ccc 1px solid; background-color: #ccc;", "color: #fff; border: #1227DF 1px solid; background-color: #1227DF;");
    removalOverLow();
}
function createPost(textareaPost) {
    sectionCreatePost.querySelector("form").onsubmit = (e) => {
        let btn = sectionCreatePost.querySelector("form button");
        btn.disabled = true;
        setTimeout(() => { btn.disabled = false; }, 3000)
        e.preventDefault();
        if (textareaPost.value) {
            overLow.querySelector("#circale-animation").style.display = "flex";
            const post = {
                content: textareaPost.value,
                userId: user._id,
                username: user.username,
            }
            let ifSuccessPost = (data) => {
                if (data["status"] === "success") {
                    postFinished(textareaPost);
                    getPosts((sectionPosts.querySelectorAll(".post").length / limit) + 1);
                }
            }
            fetchData("http://localhost:3000/api/posts", "POST", JSON.stringify(post), ifSuccessPost);
        }
    }
}


// read posts
function getPosts(i) {
    fetchData(`http://localhost:3000/api/posts?limit=${limit}&page=${i}`, "GET", '', getPost);
}
function getPost(dataPOSTS) {
    if (dataPOSTS["status"] === "success") {
        dataPOSTS.data.posts.forEach(async (post) => {
            var boolen = true;
            sectionPosts.querySelectorAll(".post").forEach(POST => {
                if (POST.id === post._id) {
                    boolen = false;
                }
            });
            async function dataUser() {
                let getAvatarUser = await fetch(`http://localhost:3000/api/users/${post.userId}`, { headers }).then(user => user.json());
                return await getAvatarUser;
            }
            let dataAvatar = await dataUser();
            async function avatar() {
                return await fetch(`http://localhost:3000${dataAvatar.data.avatar}`).then(avatar => avatar.blob()).then(avatar => URL.createObjectURL(avatar));
            }
            let img = await avatar();
            let postHtml = `
            <section class="post" id="${post._id}">
            <header class="">
                <div class="user">
                    <img id="avatar" src="${img}" alt="">
                    <span>${post.username}</span>
                </div>
                <div class="icons">
                    <ul style="display:none;">
                        <li>update</li>
                        <li>delete</li>
                    </ul>
                    <i id="points" class="fa-solid fa-ellipsis points"></i>
                    <i class="fa-solid fa-x x"></i>
                </div>
            </header>
            <article>${post.content}</article>
            <footer class="">
                <div class="like-commentIcons">
                    <span id="count-likes">${post.usernameLikes.length}</span>
                    <i id="like-icon" class="fa-regular fa-heart"></i>
                    <span id="count-comment">${post.lengthComments}</span>
                    <i id="comment-icon" class="fa-regular fa-comment"></i>
                </div>
                <div class="share">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </div>
            </footer>
            </section>`;
            if (boolen === true) {
                sectionPosts.innerHTML += postHtml;
            };
            if (post.usernameLikes.includes(user.username)) {
                sectionPosts.querySelectorAll("#myFamily main > section .posts .post #like-icon").forEach(icon => {
                    if (icon.parentElement.parentElement.parentElement.id === post._id) {
                        icon.className = "fa-solid fa-heart";
                    }
                })
            } else {
                sectionPosts.querySelectorAll("#myFamily main > section .posts .post #like-icon").forEach(icon => {
                    if (icon.parentElement.parentElement.parentElement.id === post._id) {
                        icon.className = "fa-regular fa-heart";
                    }
                })
            }
        })
        if (dataPOSTS.data.posts.length) {
            setTimeout(() => { likeFetch(); }, 1000);
            setTimeout(() => { updateAndDeletePoints(dataPOSTS) }, 1000)
            setTimeout(() => { getOnePostAndCRUDComment() }, 1000);
        }
    } else if (dataPOSTS.message === "invalid token") {
        toPageLogin();
    }
}



getPosts(1);

window.addEventListener("scroll", (e) => {
    let post = document.querySelectorAll(".post");
    let html = document.documentElement;
    let heigth = html.scrollHeight - html.clientHeight;
    if (heigth === Math.ceil(html.scrollTop)) {
        getPosts((post.length / limit) + 1);
    }
})


// update post and delete
function updateAndDeletePoints(postsData) {
    let posts = postsData.data.posts;
    document.querySelectorAll(".post").forEach(postHtml => {
        let post = posts.filter(post => { return post._id === postHtml.id })[0];
        if (postHtml.querySelector("header .user span").textContent === user.username) {
            let iconX = postHtml.querySelector(".fa-x");
            let ul = postHtml.querySelector("ul");
            let points = postHtml.querySelector(".points");
            points.style.display = "block";
            postHtml.onclick = (e) => {
                if (e.target === points) {
                    classList(ul, "add", "points-Options");
                    classList(iconX, "remove", "x");
                } else if (e.target === iconX) {
                    classList(ul, "remove", "points-Options");
                    classList(iconX, "add", "x");
                }
                if (e.target.textContent === "update") {
                    updateComponentes(postHtml, post);
                } else if (e.target.textContent === "delete") {
                    deletePost(postHtml);
                }
            }
        }
    })
}
// update post function

function updateComponentes(postHtml) {
    let textareaUpdate = sectionUpdatePost.querySelector("textarea");
    let contentPost = postHtml.querySelector("article").textContent;
    domSections(sectionUpdatePost);
    sectionUpdatePost.querySelector("#theUserName").textContent = user.username;
    textareaUpdate.value = contentPost;
    updatePost(textareaUpdate, contentPost, postHtml);
    valueInputsStyle(textareaUpdate, sectionUpdatePost, "color: #000; background-color: #ccc;", "color: #fff; background-color: #1227DF;");
    removalOverLow();
}

function updatePost(textareaUpdate, contentPost, postHtml) {
    sectionUpdatePost.onsubmit = (e) => {
        e.preventDefault();
        if (textareaUpdate.value && textareaUpdate.value != contentPost) {
            overLow.querySelector("#circale-animation").style.display = "flex";
            let btn = sectionUpdatePost.querySelector("form button");
            btn.disabled = true;
            setTimeout(() => { btn.disabled = false; }, 3000);
            const dataPostUpdate = {
                content: textareaUpdate.value
            }
            let ifSuccessUpdate = (postUpdate) => {
                if (postUpdate.status === "success") {
                    postHtml.querySelector("article").textContent = textareaUpdate.value;
                    postFinished();
                }
            }
            fetchData(`http://localhost:3000/api/posts/${postHtml.id}`, "PATCH", JSON.stringify(dataPostUpdate), ifSuccessUpdate);
        }
    }
}

// delete post function

function deletePost(postHtml) {
    domSections(divConfirm);
    divConfirm.onsubmit = (e) => {
        overLow.querySelector("#circale-animation").style.display = "flex";
        let btn = divConfirm.querySelector("form button");
        btn.disabled = true;
        setTimeout(() => { btn.disabled = false; }, 3000);
        e.preventDefault();
        let ifSuccessDelete = (postDelete) => {
            if (postDelete.status === "success") {
                overLow.querySelector("#circale-animation").style.display = "none";
                postFinished();
                postHtml.remove();
            }
        }
        fetchData(`http://localhost:3000/api/posts/${postHtml.id}`, "DELETE", '', ifSuccessDelete);
    }
    removalOverLow();
}

// like && unlike post

function likeFetch() {
    var boolen = true
    sectionPosts.querySelectorAll(".post").forEach((post) => {
        setInterval(() => {
            boolen = true
        }, 3000);
        post.addEventListener("click", event => {
            if (event.target.id === "like-icon" && boolen) {
                const userLike = {
                    likeUserName: user.username,
                    postId: event.currentTarget.id
                }
                let actionLike = (data) => {
                    if (data.status === "success") {
                        let lenLikes = data.data.likesPost.length;
                        contentPostShowPost.querySelector("footer > div > #count-likeShowpost").textContent = lenLikes;
                        if (data.data.likesPost.includes(user.username)) {
                            event.target.className = "fa-solid fa-heart";
                        } else {
                            event.target.className = "fa-regular fa-heart";
                        }
                        event.target.parentElement.querySelector("#count-likes").textContent = lenLikes;
                        contentPostShowPost.querySelector("footer > div > #like-showpost").className = post.querySelector("footer #like-icon").className;
                    }
                }
                fetchData(`http://localhost:3000/api/like/${event.currentTarget.id}`, "PATCH", JSON.stringify(userLike), actionLike);
                boolen = false;
            }
        })
    })
}

// commetns crud  and get post
let limitComment = 4;

function countComment(post) {
    let ifSuccess = (POST) => {
        if (POST.status === "success") {
            post.querySelector("#count-comment").textContent = POST.data.Comments.length;
        }
    }
    fetchData(`http://localhost:3000/api/comments/${post.id}?limit=${Number.MAX_SAFE_INTEGER}`, "GET", "", ifSuccess);
}

function getOnePostAndCRUDComment() {
    document.querySelectorAll("#comment-icon").forEach(icon => {
        icon.addEventListener("click", (e) => {
            sectionShowPost.querySelector(".comments-post").innerHTML = "";
            let post = e.target.parentElement.parentElement.parentElement;
            let textareaComment = sectionShowPost.querySelector("form textarea");
            textareaComment.value = "";
            // getOnePost
            getContentPost(post);
            setTimeout(() => {
                domSections(sectionShowPost);
                valueInputsStyle(textareaComment, sectionShowPost, "color: #000;", "color: #1227DF;");
                removalOverLow();
            }, 700);
            // CRUD Comment one post
            // countComment(post);
            createCommentFeth(textareaComment, post);
            getComments(1, post);
            sectionShowPost.onscroll = (e) => {
                let heigth = sectionShowPost.scrollHeight - sectionShowPost.clientHeight;
                if (heigth === Math.ceil(sectionShowPost.scrollTop)) {
                    getComments((sectionShowPost.querySelectorAll(".comment").length / limitComment) + 1, post);
                }
            }
        })
    })
}

async function getContentPost(postHtml) {
    async function getPOST() {
        let getPost = await fetch(`http://localhost:3000/api/posts/${postHtml.id}`, { headers }).then(user => user.json());
        return getPost;
    }
    let dataPOST = await getPOST();
    let POST = dataPOST.data;
    async function dataUser() {
        let getAvatarUser = await fetch(`http://localhost:3000/api/users/${POST.userId}`, { headers }).then(user => user.json());
        return await getAvatarUser;
    }
    let dataAvatar = await dataUser();
    async function avatar() {
        return await fetch(`http://localhost:3000${dataAvatar.data.avatar}`).then(avatar => avatar.blob()).then(avatar => URL.createObjectURL(avatar));
    };
    let img = await avatar();
    contentPostShowPost.querySelector(".user img").src = img;
    contentPostShowPost.querySelector(".user span").textContent = postHtml.querySelector(".user span").textContent;
    contentPostShowPost.querySelector("article").textContent = postHtml.querySelector("article").textContent;
    contentPostShowPost.querySelector("footer > div > #count-likeShowpost").textContent = postHtml.querySelector("footer #count-likes").textContent;
    contentPostShowPost.querySelector("footer > div > i").className = postHtml.querySelector("footer #like-icon").className;
    async function avatarUser() {
        return await fetch(`http://localhost:3000${user.avatar}`).then(avatar => avatar.blob()).then(avatar => URL.createObjectURL(avatar));
    }
    sectionShowPost.querySelector("form > img").src = await avatarUser();
    // like one post
    sectionShowPost.querySelector("#like-showpost").onclick = (e) => {
        postHtml.querySelector("#like-icon").click();
    }
}

function createCommentFeth(textareaComment, post) {
    let btn = sectionShowPost.querySelector("form button");
    sectionShowPost.querySelector("form").onsubmit = (e) => {
        e.preventDefault();
        btn.disabled = true;
        setTimeout(() => { btn.disabled = false; }, 3000);
        if (textareaComment.value) {
            sectionShowPost.style.position = "absolute";
            overLow.querySelector("#circale-animation").style.display = "flex";
            let dataComment = {
                content: textareaComment.value,
                userId: user._id,
                username: user.username,
                postId: post.id,
                avatar: user.avatar
            }
            let ifSuccess = (DATAComment) => {
                if (DATAComment.status === "success") {
                    overLow.querySelector("#circale-animation").style.display = "none";
                    textareaComment.value = "";
                    countComment(post);
                    getComments((sectionShowPost.querySelectorAll(".comment").length / limitComment) + 1, post);
                }
            }
            fetchData(`http://localhost:3000/api/comments`, "POST", JSON.stringify(dataComment), ifSuccess);
        }
    }
}




function getComments(i, post) {
    fetchData(`http://localhost:3000/api/comments/${post.id}?limit=${limitComment}&page=${i}`, "GET", '', getComment)
}
function getComment(data) {
    if (data["status"] === "success") {
        data.data.Comments.forEach(async (comment) => {
            let avatarBlob = await fetch(`http://localhost:3000${comment.avatar}`);
            avatarBlob = URL.createObjectURL(await avatarBlob.blob());
            var boolen = true;
            sectionShowPost.querySelectorAll(".comment").forEach(COMMENT => {
                if (COMMENT.id === comment._id) {
                    boolen = false;
                }
            });
            let commentHtml = `
            <div id="${comment._id}" class="comment">
                <img src="${avatarBlob}" alt="">
                <div class="content-comment">
                    <div>
                        <h5>${comment.username}</h5>
                        <span>${comment.content}</span>
                    </div>
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </div>
            </div>`;
            if (boolen) {
                sectionShowPost.querySelector(".comments-post").innerHTML += commentHtml;
            }
        })
    }
}



// functions utils
function postFinished(textarea) {
    overLow.querySelector("#circale-animation").style.display = "none";
    overLow.classList.remove("overlow-body");
    bodyMyFamily.style.overflow = "visible";
    if (textarea) {
        textarea.value = "";
    }
}

function toPageLogin() {
    location.href = location.href.replace(/\/[^\/]*$/, '/login.html');
    localStorage.clear();
}
function domSections(ele) {
    classList(overLow, "add", "overlow-body");
    overLow.style.top = `${scrollY}px`;
    bodyMyFamily.style.overflow = "hidden";
    sectionSwitch(ele);
}

function sectionSwitch(ele) {
    arrOverLow.forEach(el => {
        el.style.display = "none";
    })
    ele.style.display = "block";
}
function valueInputsStyle(input, parent, style1, style2) {
    setInterval(() => {
        if (!input.value) {
            parent.querySelector("button").style.cssText = style1;
        } else {
            parent.querySelector("button").style.cssText = style2;
        }
    }, 10);
}
function removalOverLow() {
    overLow.addEventListener("click", (e) => {
        if (e.target.id === "x" || e.target === e.currentTarget) {
            bodyMyFamily.style.overflow = "visible";
            overLow.classList.remove("overlow-body");
        }
    })
}




