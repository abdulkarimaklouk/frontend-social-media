import { classList } from "./functions.js"


let formLogin = document.querySelector(`#login form`);

let h2Login = document.querySelector(`#login form h2`);

let divInputs = document.querySelectorAll("#login form .input-div");


let inputs = document.querySelectorAll('#login form .input-div input');


let pError = document.querySelectorAll(`#login form .input-div .error`);


let eye = document.querySelector("#login form .eye-hideDiv .eye");

let btn = document.querySelector(`#login form button`);

let pSwitch = document.querySelector(`#login form > p`);

let aSignup = pSwitch.querySelector(`a`);


let newUser = { username: "", email: "", password: "" };
let User = { email: "", password: "" };

let classSUCCESSMSG = "input-success";
let classERRORMSG = "input-error";
let actionAdd = "add";
let actionRemove = "remove";


//input password to text

eye.onclick = () => {
    if (inputs[2].type === "password") {
        typeInput("text");
    } else {
        typeInput("password");
    }
}
function typeInput(type) {
    inputs[2].type = type;
}

// switch to signup

aSignup.addEventListener("click", (e) => {
    e.preventDefault();
    Switch("Signup");
})

function Switch(Signup) {
    h2Login.textContent = Signup;
    divInputs[0].style.display = "block";
    btn.textContent = Signup;
    pSwitch.innerHTML = `<p>have an account ? <a href="" class="Signup color-text-gradient">Login</a></p>`;
    divInputs.forEach((ele) => {
        formLogin.style.cssText = "transform: rotate3d(1, 1 , -1 , 360deg); transition: 1s;"
        ele.querySelector("input").value = "";
        ele.querySelector(".error").textContent = "";
        classList(ele, actionRemove, classERRORMSG, actionRemove, classSUCCESSMSG);
    });
};

// auth

formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    formLogin.querySelector("button").disabled = true;
    setTimeout(() => {
        formLogin.querySelector("button").disabled = false;
    }, 3000)
    if (h2Login.textContent === "Login") {
        validData(inputs[1], inputs[2]);
    } else {
        validData(inputs[0], inputs[1], inputs[2]);
    }
})

function validData(...input) {
    const urlLogin = "http://localhost:3000/api/auth/login";
    const urlRegister = "http://localhost:3000/api/auth/register";
    if (input.length === 2) {
        validFunInput(input[0], validator.isEmail(input[0].value), 1, "email is not valid", 2, User, urlLogin);
        validFunInput(input[1], validator.isLength(input[1].value, { min: 8 }), 2, "password must be at least 8 characters", 2, User, urlLogin);
    } else if (input.length === 3) {
        validFunInput(input[0], validator.isLength(input[0].value, { min: 3 }), 0, "username must be at least 3 characters", 3, newUser, urlRegister);
        validFunInput(input[1], validator.isEmail(input[1].value), 1, "email is not valid", 3, newUser, urlRegister);
        validFunInput(input[2], validator.isLength(input[2].value, { min: 8 }), 2, "Password must be at least 8 characters", 3, newUser, urlRegister);
    }
}

let arrInputCheck = [];

function validFunInput(input, methodValid, iDivInput, msg, numArrLen, objData, url) {
    if (input.value) {
        if (methodValid) {
            classList(divInputs[iDivInput], actionRemove, classERRORMSG)
            pError[iDivInput].textContent = "";
            if (!arrInputCheck.includes(input)) {
                arrInputCheck.push(input);
            }
            if (arrInputCheck.length === numArrLen) {
                dataToObj(url, objData);
                arrInputCheck = [];
            }
        } else {
            if (arrInputCheck.includes(input)) {
                arrInputCheck.splice(arrInputCheck.indexOf(input), 1);
            }
            classList(divInputs[iDivInput], actionRemove, classSUCCESSMSG, actionAdd, classERRORMSG);
            pError[iDivInput].textContent = msg;
        }
    } else {
        classList(divInputs[iDivInput], actionAdd, classERRORMSG);
        pError[iDivInput].textContent = `${input.placeholder} is required`;
    }
}

async function dataToObj(url, objData) {
    arrInputCheck.forEach((input) => {
        objData[input.placeholder] = input.value;
    });

    let user = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(objData),
    });

    user = await user.json();

    if (user["status"] === "success") {
        divInputs.forEach(div => {
            classList(div, actionRemove, classERRORMSG, actionAdd, classSUCCESSMSG);
        });
        localStorage.setItem("token", JSON.stringify(user.data.token));
        if (h2Login.textContent === 'Signup') {
            selectAvatar(document.body);
        } else {
            location.href = location.href.replace(/\/[^\/]*$/, '/myFamily.html');
        }
    } else {
        if (user.message.split(" ")[0] === "E11000") {
            divInputs.forEach(div => {
                classList(div, actionAdd, classERRORMSG, actionRemove, classSUCCESSMSG)
            })
            pError[2].textContent = "username no valid";
            return;
        }
        divInputs.forEach(div => {
            classList(div, actionAdd, classERRORMSG, actionRemove, classSUCCESSMSG)
        })
        pError[2].textContent = user.message;
    }
}


function selectAvatar(body) {
    let styleBtn = `
    cursor: pointer;
    user-select: none;
    background-color: #e3362c;
    color: #fff;
    padding: 7px;
    border-radius: 5px;
    border: none;
    flex-basis: 48%;
    `
    body.className = "Centering-flex";
    body.style.backgroundColor = "#eee"
    body.innerHTML = `
        <h1 class="Centering-position-left" style="top: 0px; color: #ff5248;" >myFamily</h1>
        <section style="background-color : #fff; padding: 25px; border-radius: 10px; ">
            <img src="../img/profile.png" alt="" style="max-height: 185px;max-width:185px; display:block; margin : 0 auto 25px; object-fit: cover;">
            <label for="input-file" style="
                display: block;
                background-color: #e3362c;
                color: #fff;
                margin-bottom: 10px;
                padding: 10px;
                text-align: center;
                border-radius: 5px;
                cursor: pointer;
                user-select: none;
            ">update photo profile</label>
            <div style="display:flex; justify-content: space-between; width: 100%;">
                <button id="update-btn" style="${styleBtn}">update</button>
                <button id="skip-btn" style="${styleBtn}">skip</button>
            </div>
            <input type="file" accept="image/jpeg , image/png , image/jpg" style="display:none;" id="input-file">
        </section>
    `;
    let img = body.querySelector("section > img");
    let inputFile = body.querySelector("section #input-file");
    inputFile.style.display = "none"
    let avatar = '';
    inputFile.onchange = () => {
        avatar = URL.createObjectURL(inputFile.files[0]);
        img.src = avatar;
    }
    body.querySelector("section").addEventListener("click", (event) => {
        if (event.target.id === "update-btn") {
            if ("/profile.png" != img.src.split("img")[1]) {
                const formData = new FormData();
                formData.append("avatar", inputFile.files[0]);
                fetch("http://localhost:3000/api/users/avatar", {
                    method: "PATCH",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("token").slice(1, -1)}`
                    },
                    body: formData,
                }).then(res => res.json())
                    .then((res) => {
                        if (res.status === "success") {
                            location.href = "http://127.0.0.1:5500/myFamily.html";
                        }
                    })
            }
        } else if (event.target.id === "skip-btn") {
            location.href = "http://127.0.0.1:5500/myFamily.html";
        }
    });
}
