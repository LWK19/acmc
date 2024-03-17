var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

//CLOUDFLARE
async function post(payload) {
    //document.getElementById("load").classList.remove("hidden");
    //document.getElementById("load").classList.add("visible");

    // fix payload
    payload["main"] = "MCMS";

    // Cloudflare workers
    const url = "https://acmc-server.lwk19.workers.dev";
    //const url = "http://127.0.0.1:8787";

    try {
        var req = await fetch(url, {
            method: "POST",
            headers: {
                "Access-Control-Request-Private-Network": "true",
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(payload)
        })
        req = req.json();
    } catch (e){
        console.log(e);
    }
    
    /*.then(function (response) {
        return response.json()
    }
    ).then(function (data) {
        return data;
    })*/
    //document.getElementById("load").classList.remove("visible");
    //document.getElementById("load").classList.add("hidden");
    return req;
}

async function login() {
    usern = document.getElementById("username").value.replace(/\s/g, '');
    pword = document.getElementById("password").value.replace(/\s/g, '');
    var resp = await post({ 'method': "login", 'id': usern, 'password': pword });
    if (resp.success) {
        document.cookie = "token=" + resp.token + ";max-age=7200;path=/";
        location.href = 'dashboard'
    } else {
        if (resp.msg == "Wrong Password") {
            //TODO: document.getElementById("incorrect").innerHTML = "Incorrect Password";
        } else if (resp.msg == "Wrong Username") {
            //TODO: document.getElementById("incorrect").innerHTML = "Incorrect Username";
        } else {
            handleErrors(resp);
        }
    }
}

async function updateCompetitionDetails() {
    const date = document.getElementById('date').value;
    const starttime = document.getElementById('starttime').value;
    const acmc_time = new Date(date + "T" + starttime + ":00.000+08:00");
    const duration = document.getElementById('duration').value;
    const buffer = document.getElementById('buffer').value;
    const nummcq = document.getElementById('nummcq').value;
    const numsa = document.getElementById('numsa').value;

    const details = {"acmc_time":acmc_time, "duration":duration,"buffer":buffer,"nummcq":nummcq,"numsa":numsa}
    const resp = await post({ "method": "updateCompetitionDetails", "token": getCookie("token"), "details" : details});
    if (resp.success) {
        //TODO: display confirmation message
        console.log("success")
    } else {
        handleErrors(resp);
    }
}

async function getCompetitionDetails() {
    const resp = await post({ "method": "getCompetitionDetails", "token": getCookie("token")});
    if (resp.success) {
        //TODO: update fields
        const acmc_time = new Date(resp.reply.acmc_time);
        document.getElementById('date').value = acmc_time.getDate();
        document.getElementById('starttime').value = acmc_time.getTime();
        document.getElementById('duration') = resp.reply.duration;
        document.getElementById('buffer').value = resp.reply.buffer;
        document.getElementById('nummcq').value = resp.reply.nummcq;
        document.getElementById('numsa').value = resp.reply.numsa;
    } else {
        handleErrors(resp);
    }
}

async function updateQuestions(section) {
    const links = null; // TODO: get qns as an array of strings
    const resp = await post({ "method": "updateQuestions", "section": section, "token": getCookie("token"), "links" : links});
    if (resp.success) {
        //TODO: display confirmation message
        console.log("success")
    } else {
        handleErrors(resp);
    }
}

async function getQuestions(section) {
    const resp = await post({ "method": "getQuestions", "section": section, "token": getCookie("token")});
    if (resp.success) {
        //TODO: update questions 
        resp.reply; //idk what this is
    } else {
        handleErrors(resp);
    }
}

async function updateParticipants(section) {
    const participants = null; //TODO
    const resp = await post({ "method": "updateParticipants", "token": getCookie("token"), "participants" : participants});
    if (resp.success) {
        //TODO: display confirmation message
        console.log("success");
    } else {
        handleErrors(resp);
    }
}

async function getParticipants(section) {
    const resp = await post({ "method": "getParticipants", "token": getCookie("token")});
    if (resp.success) {
        //TODO: display confirmation message
        resp.reply; // idk what this is
    } else {
        handleErrors(resp);
    }
}

function handleErrors(resp) {
    if (resp.msg == "Token Error") {
        location.href = "index";
        alert("Login timeout. Please sign in again.");
    } else {
        console.log(resp);
        alert("Response error");
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}