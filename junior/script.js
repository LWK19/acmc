var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);
var qn;
var numsa;
var nummcq;
////////////////////////////////////////////////////////////////

//CLOUDFLARE
async function post(payload) {
    document.getElementById("load").classList.remove("hidden");
    document.getElementById("load").classList.add("visible");

    // fix payload
    payload["main"] = "ACMC";
    payload["section"] = "junior";

    // Cloudflare workers TODO
    const url = "https://acmc-server.lwk19.workers.dev";
    //const url = "http://127.0.0.1:8787";

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
    req = await req.json();
    document.getElementById("load").classList.remove("visible");
    document.getElementById("load").classList.add("hidden");
    return req;
}

async function login() {
    usern = document.getElementById("username").value.replace(/\s/g, '');
    pword = document.getElementById("password").value.replace(/\s/g, '');
    var resp = await post({ 'method': "login", 'id': usern, 'password': pword });
    if (resp.success) {
        document.cookie = "token=" + resp.token + ";max-age=7200;path=/";
        location.href = 'instructions'
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

async function getInstructions() {
    const instruct = document.getElementById("instructions")
    var resp = await post({ 'method': "get_instructions", "token": getCookie("token") });
    if (resp.success) {
        for (var i = 0; i < resp.reply.length; i++) {
            var li = document.createElement("li");
            li.innerHTML = resp.reply[i]
            instruct.appendChild(li);
        }

    } else {
        handleErrors(resp);
    }
}

async function buildQNum() {
    const template = document.getElementById("q-template")
    var resp = await post({ 'method': "get_numQ", "token": getCookie("token") });
    if (resp.success) {
        nummcq = parseInt(resp.reply.nummcq);
        numsa = parseInt(resp.reply.numsa);
        for (var i = 0; i < numsa+nummcq; i++) {
            const clone = template.cloneNode(true);
            clone.id = "q" + (i+1);
            clone.innerHTML = i+1;

            clone.setAttribute("onclick", "changeQn(" + (i+1) + ")");
            template.parentElement.insertBefore(clone, template.parentElement.lastElementChild);
        }
        template.remove();
    } else {
        handleErrors(resp);
    }
}

async function updateMainTime() {
    var resp = await post({ "method": "get_time", "token": getCookie("token"), "timermode": "main" });
    if (resp.success) {
        time = parseInt(resp.reply) / 1000;
        mainStarts = new Date().getTime() / 1000;
    } else {
        if (resp.msg == "Error. Start Quiz") {
            location.href = "instructions";
        } else if (resp.msg == "Time Up") {
            alert("Time's Up!");
            location.href = "finish";
        } else if (resp.msg == "Not Started") {
            location.href = "instructions";
        } else {
            handleErrors(resp);
        }
    }
}

async function updateTime() {
    var resp = await post({ "method": "get_time", "token": getCookie("token"), "timermode": "inst" });
    if (resp.success) {
        time = parseInt(resp.reply / 1000);
        starts = new Date().getTime() / 1000;
    } else {
        handleErrors(resp);
    }
}

async function getTime() {
    var resp = await post({ "method": "get_time", "token": getCookie("token"), "timermode": "inst" });
    if (resp.success) {
        time = parseInt(resp.reply / 1000);
        starts = new Date().getTime() / 1000;
        instructTimer();
    } else {
        handleErrors(resp);
    }
}

async function getMainTime() {
    var resp = await post({ "method": "get_time", "token": getCookie("token"), "timermode": "main" });
    if (resp.success) {
        time = parseInt(resp.reply) / 1000;
        mainStarts = new Date().getTime() / 1000;
        mainTimer(time);
    } else {
        if (resp.msg == "Error. Start Quiz") {
            location.href = "instructions";
        } else if (resp.msg == "Time is Up") {
            alert("Time's Up!");
            location.href = "finish";
        } else if (resp.msg == "Not Started") {
            location.href = "instructions";
        } else {
            handleErrors(resp);
        }
    }
}

async function start() {
    var resp = await post({ "method": "start_time", "token": getCookie("token") });
    if (resp.success) {
        var ans_list = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        document.cookie = "ans_local=" + JSON.stringify(ans_list) + ";max-age=7200;path=/";
        location.href = 'main';
    } else {
        handleErrors(resp);
    }
}

async function getName() {
    var resp = await post({ "method": "get_name", "token": getCookie("token") });
    if (resp.success) {
        document.getElementById("name").innerHTML = resp.reply;
    } else {
        handleErrors(resp);
    }
}

async function saveAns() {
    if (qn < nummcq+1) {
        var checked = document.querySelectorAll('input[type=checkbox]:checked');
        if (checked.length == 0) {
            alert("No answer selected");
        } else if (checked.length == 1) {
            ans = checked[0].value;

            var resp = await post({ "method": "save_ans", "token": getCookie("token"), "ans": ans, "qn": qn });
            if (resp.success) {
                var ans_list = JSON.parse(getCookie("ans_local"));
                ans_list[qn - 1] = ans;
                document.cookie = "ans_local=" + JSON.stringify(ans_list) + ";max-age=7200;path=/";

                shadeQNum();
                nextQn();
            } else {
                handleErrors(resp);
            }
        } else {
            alert("Error. More than 1 option selected");
        }
    } else {
        var ans = document.getElementById('open').value.replace(/\s/g, '');
        if (ans == "") {
            alert("No answer entered");
        } else {
            var resp = await post({ "method": "save_ans", "token": getCookie("token"), "ans": ans, "qn": qn });
            if (resp.success) {
                var ans_list = JSON.parse(getCookie("ans_local"));
                ans_list[qn - 1] = ans;
                document.cookie = "ans_local=" + JSON.stringify(ans_list) + ";max-age=7200;path=/";

                shadeQNum();
                nextQn();
            } else if (resp.msg == "Input Error") {
                document.getElementById("inputerror").innerHTML = "Enter numbers 0-9 only";
            } else {
                handleErrors(resp);
            }
        }
    }
}

async function initQn() {
    var qnlink;
    var resp = await post({ "method": "get_qn", "token": getCookie("token") });
    if (resp.success) {
        qnlink = resp.reply;
        for (var i = 0; i < 15; i++) {
            preload(qnlink[i], i);
        }
        changeQn(1);
    } else {
        handleErrors(resp);
    }
}

async function shadeQNum() {
    var resp = await post({ "method": "get_completed_qn", "token": getCookie("token") });
    if (resp.success) {
        var ansqn = resp.reply;
        for (var i = 1; i < numsa+nummcq+1; i++) {
            if (ansqn[i - 1] == "") {
                document.getElementById("q" + i).style.backgroundColor = '';
            } else {
                document.cookie = "ans_local=" + JSON.stringify(ansqn) + ";max-age=7200;path=/";
                document.getElementById("q" + i).style.backgroundColor = "#55E679";
            }
        }
        //showAns(qn);
    } else {
        handleErrors(resp);
    }
}

async function finish() {
    var resp = await post({ "method": "end_time", "token": getCookie("token") });
    if (resp.success) {
        submit();
    } else {
        handleErrors(resp);
    }
}


//////////////////////////////////////////////////////////////
//shared.js
function autoZoom(f) {
    document.body.style.zoom = f*Math.log10(0.01*document.documentElement.clientHeight);
}

function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}
function instructTimer() {
    const instructInterval = setInterval(function () {
        var now = new Date().getTime() / 1000;
        var elapsed = now - starts;
        var timeleft = time - elapsed;
        var days = Math.floor(timeleft / 86400);
        var hours = Math.floor(timeleft % 86400 / 3600);
        var mins = Math.floor(timeleft % 3600 / 60);
        var secs = Math.floor(timeleft % 60);
        var str = "";
        if (days > 0) {
            str = days + ' d, ';
        }
        str = str + str_pad_left(hours, '0', 2) + ' h, ' + str_pad_left(mins, '0', 2) + ' m, ' + str_pad_left(secs, '0', 2) + ' s';
        document.getElementById("startBtn").innerHTML = str;
        if (timeleft < 1) {
            clearInterval(instructInterval);
            document.getElementById("startBtn").innerHTML = "Start Quiz";
            document.getElementById("startBtn").disabled = false;
        }
    }, 100);
}
function mainTimer() {
    const mainInterval = setInterval(() => {
        var now = new Date().getTime() / 1000;
        var elapsed = now - mainStarts;
        var timeleft = time - elapsed;
        var tsec = 60 * 60;
        var hours = Math.floor(timeleft / 3600);
        var mins = Math.floor(timeleft % 3600 / 60);
        var secs = Math.floor(timeleft % 60);
        document.getElementById("clock").innerHTML = hours + ':' + str_pad_left(mins, '0', 2) + ':' + str_pad_left(secs, '0', 2);
        document.getElementById("progress").style.width = timeleft * 150 / tsec + "px";

        if (timeleft < 1) {
            clearInterval(mainInterval);
            finish();
            location.href = 'finish';
        }
    }, 100);
}
function getQn(qn) {
    document.getElementById("question-img").removeChild(document.getElementById("question-img").lastChild);
    document.getElementById("question-img").appendChild(images[qn - 1]);
}
function changeQn(q) {
    qn = q;
    document.getElementById("inputerror").innerHTML = "";
    document.getElementById("question-num").innerHTML = "Question " + qn;
    var checkboxes = document.getElementsByName('opt[]');
    for (var checkbox of checkboxes) {
        checkbox.checked = false;
    }
    showAns(qn);

    getQn(qn);

    if (qn < nummcq + 1) {
        toggle_visibility('input-mcq', 'show');
        toggle_visibility('input-open', 'hide');
    } else {
        toggle_visibility('input-mcq', 'hide');
        toggle_visibility('input-open', 'show');
    }
}
function nextQn() {
    if (qn < nummcq+numsa) {
        qn += 1;
        changeQn(qn);
    }
}
function showAns(qn) {
    var ans_list = getCookie("ans_local");
    if (ans_list != "") {
        ans_list = JSON.parse(ans_list);
        if (qn > 10) {
            document.getElementById('open').value = ans_list[qn - 1];
        } else {
            //check the checkbox corresponds to .value = ans_list[qn-1]
            if (ans_list[qn - 1] != "") {
                document.getElementById("opt" + ans_list[qn - 1]).checked = true;

            }
        }
    }

}
function toggle_visibility(id, cs) {
    if (cs == "show") {
        document.getElementById(id).style.display = 'flex';
    } else if (cs == "hide") {
        document.getElementById(id).style.display = 'none';
    }
}
function submit() {
    document.getElementById('confirmSubmit').classList.remove('visible');
    document.getElementById('confirmSubmit').classList.add('hidden');
    //submit ans
    location.href = 'finish';
}
function enlarge() {
    document.getElementById("lightbox").style.visibility = "visible";
    document.getElementById("img-enlarge").removeChild(document.getElementById("img-enlarge").firstChild);
    document.getElementById("img-enlarge").appendChild(images[qn - 1].cloneNode(true));
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
var images = [];
function preload(url, i) {
    images[i] = new Image();
    images[i].src = url;
    images[i].style = "max-width: 100%;max-height:100%;object-fit:cover;margin:auto";
}

function handleErrors(resp) {
    if (resp.msg == "Token Error") {
        location.href = "index";
        alert("Login timeout. Please sign in again.");
    } else if (resp.msg == "Already Started") {
        location.href = "main";
    } else if (resp.msg == "Competition Over") {
        finish();
    } else if (resp.msg == "Competition Not Started") {
        location.href = "instructions";
    } else if (resp.msg == "Participant Has Not Started") {
        location.href = "instructions";
    } else if (resp.msg == "Already Submitted") {
        location.href = "finish";
        alert("Already Submitted");
    } else {
        console.log(resp.msg);
        alert("Response error");
    }
}
