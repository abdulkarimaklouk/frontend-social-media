function classList(ele, action, CLASS, action2, CLASS2) {
    if (action === "add") {
        ele.classList.add(CLASS);
    }
    if (action === "remove") {
        ele.classList.remove(CLASS);
    }
    if (action2 === "add") {
        ele.classList.add(CLASS2);
    }
    if (action2 === "remove") {
        ele.classList.remove(CLASS2);
    }
}

async function fetchData(url, typeMethod, dataBody, functionAfterFetch, par1) {
    let token = localStorage.getItem("token");
    if (typeMethod != "GET") {
        let DATA = await fetch(url, {
            method: typeMethod,
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token.slice(1, -1)}`
            },
            body: dataBody
        });
        DATA = await DATA.json();
        functionAfterFetch(DATA);
    } else if (typeMethod == "GET") {
        let DATA = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token.slice(1, -1)}`
            }
        });
        DATA = await DATA.json();
        functionAfterFetch(DATA, par1);
    }
}

export {
    classList, fetchData
} 