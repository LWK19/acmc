var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

//CLOUDFLARE
async function post(payload) {
    document.getElementById("load").classList.remove("hidden");
    document.getElementById("load").classList.add("visible");

    // fix payload
    payload["main"] = "MCMS";

    // Cloudflare workers
    //const url = "https://acmc-server.lwk19.workers.dev";
    const url = "http://127.0.0.1:8787";

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
    });
    req = req.json();

    document.getElementById("load").classList.remove("visible");
    document.getElementById("load").classList.add("hidden");
    return req;
}

async function login() {
    usern = document.getElementById("UserID").value.replace(/\s/g, '');
    pword = document.getElementById("password").value.replace(/\s/g, '');
    var resp = await post({ 'method': "login", 'id': usern, 'password': pword });
    if (resp.success) {
        document.cookie = "token=" + resp.token + ";max-age=7200;path=/";
        location.href = 'dashboard'
    } else {
        if (resp.msg == "Wrong Password") {
            document.getElementById("incorrect").innerHTML = "Incorrect Password";
        } else if (resp.msg == "Wrong Username") {
            document.getElementById("incorrect").innerHTML = "Incorrect Username";
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

    const details = { "acmc_time": acmc_time, "duration": duration, "buffer": buffer, "nummcq": nummcq, "numsa": numsa }
    const resp = await post({ "method": "updateCompetitionDetails", "token": getCookie("token"), "details": details });
    if (resp.success) {
        //TODO: display confirmation message
    } else {
        handleErrors(resp);
    }
}

async function getCompetitionDetails() {
    const resp = await post({ "method": "getCompetitionDetails", "token": getCookie("token") });
    if (resp.success) {
        const acmc_time = new Date(resp.reply.acmc_time);
        document.getElementById('date').valueAsDate = acmc_time;
        document.getElementById('starttime').valueAsDate = acmc_time;
        document.getElementById('duration').value = resp.reply.duration;
        document.getElementById('buffer').value = resp.reply.buffer;
        document.getElementById('nummcq').value = resp.reply.nummcq;
        document.getElementById('numsa').value = resp.reply.numsa;
    } else {
        handleErrors(resp);
    }

}

async function getNumQns() {
    const resp = await post({ "method": "getCompetitionDetails", "token": getCookie("token") });
    if (resp.success) {
        return { nummcq: parseInt(resp.reply.nummcq), numsa: parseInt(resp.reply.numsa) };
    } else {
        handleErrors(resp);
    }
}

async function updateQuestions(section, event, qn, qnType) {
    const file = event.target.files[0];
    function blobToBase64(blob) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
    const fileBase64 = await blobToBase64(file);
    const resp = await post({ "method": "updateQuestions", "section": section, "token": getCookie("token"), "file": fileBase64, "qn": qn, "qnType": qnType });
    if (resp.success) {
        //TODO: display confirmation message
    } else {
        handleErrors(resp);
    }
}

async function getQuestions(section) {
    const resp = await post({ "method": "getQuestions", "section": section, "token": getCookie("token") });
    function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename + '.' + mime.split('/')[1], { type: mime });
    }
    function pic(questionPicture, image) {
        const fileReader = new FileReader();

        fileReader.onload = (fileReaderEvent) => {
            questionPicture.style.backgroundImage = `url(${fileReaderEvent.target.result})`;

            // Wait for the image to be loaded before getting its height
            questionPicture.onload = () => {
                // Set the height of the container to the height of the image
                imageContainer.style.height = questionPicture.height + 'px';
            };

            // Remove the 'empty' class and add the 'not-empty' class
            questionPicture.classList.remove('empty');
            questionPicture.classList.add('not-empty');
        };

        fileReader.readAsDataURL(image);
    }
    if (resp.success) {
        for (var i = 0; i < resp.reply.length; i++) {
            if (resp.reply[i] != null) {
                var file = dataURLtoFile(resp.reply[i].file, i + 1);
                pic(document.getElementById(resp.reply[i].qnType + resp.reply[i].qn).getElementsByClassName("question-picture")[0], file);
            }
        }
    } else {
        handleErrors(resp);
    }
}

async function updateParticipants(section) {
    var table;
    if (section == 'junior') {
        table = document.getElementById('jrparticipanttable');
    } else {
        table = document.getElementById('srparticipanttable');
    }
    var participants = [];
    for (var i = 1; i < table.rows.length; i++) {
        var currRow = table.rows[i].cells;
        participants[i - 1] = {
            'name': currRow[0].children[0].value,
            "class": "class",
            "id": currRow[1].children[0].value,
            "password": currRow[2].children[0].value,
            "time_started": "",
            "ans": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            "time": ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            "token": "init_token"
        }
    }
    // TODO: no empty cell
    const resp = await post({ "method": "updateParticipants", "section": section, "token": getCookie("token"), "participants": participants });
    if (resp.success) {
        //TODO: display confirmation message
    } else {
        handleErrors(resp);
    }
}

async function getParticipants(section) {
    var table;
    if (section == 'junior') {
        table = document.getElementById('jrparticipanttable');
    } else {
        table = document.getElementById('srparticipanttable');
    }
    const resp = await post({ "method": "getParticipants", "section": section, "token": getCookie("token") });
    if (resp.success) {
        for (var i = 0; i < resp.reply.length; i++) {
            var currRow = table.rows[i + 1].cells;
            currRow[0].children[0].value = resp.reply[i].name;
            //currRow[0].children[0].value = resp.reply[i].class;
            currRow[1].children[0].value = resp.reply[i].id;
            currRow[2].children[0].value = resp.reply[i].password;

            //add rows
            if (i < resp.reply.length - 1) {
                var numcol = table.rows[0].cells.length;
                var row = table.insertRow(i + 2);
                var cells = [];
                for (var j = 0; j < numcol; j++) {
                    cells.push(row.insertCell(j));
                    cells[j].innerHTML = currRow[j].innerHTML;
                }
                cells[0].getElementsByTagName('input')[0].focus();
            }
        }
    } else {
        handleErrors(resp);
    }
}

async function getResults(section) {
    var table;
    if (section == 'junior') {
        table = document.getElementById('jrresultstable');
    } else {
        table = document.getElementById('srresultstable');
    }
    const resp = await post({ "method": "getParticipants", "section": section, "token": getCookie("token") });
    if (resp.success) {
        for (var i = 0; i < resp.reply.length; i++) {
            var currRow = table.rows[i + 1].cells;
            currRow[0].innerHTML = resp.reply[i].name;
            const ans = resp.reply[i].ans;
            for (var j = 0; j < ans.length; j++) {
                currRow[j + 1].innerHTML = ans[j];
            }

            //add rows
            if (i < resp.reply.length - 1) {
                var numcol = table.rows[0].cells.length;
                var row = table.insertRow(i + 2);
                for (var k = 0; k < numcol; k++) {
                    row.insertCell(k);
                }
            }
        }
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