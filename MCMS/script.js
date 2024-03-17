var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
document.getElementsByTagName('head')[0].appendChild(script);

//CLOUDFLARE
async function post(payload) {
    document.getElementById("load").classList.remove("hidden");
    document.getElementById("load").classList.add("visible");

    // fix payload
    payload.add({ "main": "MCMS" })

    // Cloudflare workers
    const url = "http://127.0.0.1:8787";//"https://acmc-server.lwk19.workers.dev";

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
    }).then(function (response) {
        return response.json()
    }
    ).then(function (data) {
        return data;
    })
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
    const acmc_time = new Date(date + starttime);
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
    try {
        var acmc_time = await client.db('acmc').collection('details').findOne({ "name": "acmc_time" });
        acmc_time = new Date(JSON.parse(JSON.stringify(acmc_time)).value);

        var acmc_duration = await client.db('acmc').collection('details').findOne({ "name": "acmc_duration" });
        acmc_duration = JSON.parse(JSON.stringify(acmc_duration)).value * 1000;

        var acmc_buffer = await client.db('acmc').collection('details').findOne({ "name": "acmc_buffer" });
        acmc_buffer = JSON.parse(JSON.stringify(acmc_buffer)).value * 1000;

        var numMCQ = await client.db('acmc').collection('details').findOne({ "name": "acmc_mcq" });
        numMCQ = JSON.parse(JSON.stringify(numMCQ)).value;

        var numShortAnsQ = await client.db('acmc').collection('details').findOne({ "name": "acmc_shortAnsQ" });
        numShortAnsQ = JSON.parse(JSON.stringify(numShortAnsQ)).value;

        return { 'success': false, "reply": { "acmc_time": acmc_time, "acmc_duration": acmc_duration, "acmc_buffer": acmc_buffer, "numMCQ": numMCQ, "numShortAnsQ": numShortAnsQ } };
    } catch (e) {
        console.log(e);
        return { 'success': false, "msg": "Unable to access database" };
    }
}

async function updateQuestions(payload) {
    try {
        var col;
        if (payload.section == "junior" || payload.section == "senior") {
            col = client.db(payload.section).collection("qns");
        } else {
            return { "success": false, "msg": "'section' error" };
        }
        // TODO:
        await col.updateOne(
            { "name": "qns" },
            { $set: { "1": null } }
        );

        return { 'success': true };
    } catch (e) {
        console.log(e);
        return { 'success': false, "msg": "Unable to update questions" };
    }
}

async function getQuestions(payload) {
    try {
        var col;
        if (payload.section == "junior" || payload.section == "senior") {
            col = client.db(payload.section).collection("qns");
        } else {
            return { "success": false, "msg": "'section' error" };
        }
        // TODO:
        const reply = await col.findOne(
            { "name": "qns" },
        );

        return { 'success': true, "reply": reply };
    } catch (e) {
        console.log(e);
        return { 'success': false, "msg": "Unable to update questions" };
    }
}

async function updateParticipants(payload) {
    try {
        var col;
        if (payload.section == "junior" || payload.section == "senior") {
            col = client.db(payload.section).collection("ans");
        } else {
            return { "success": false, "msg": "'section' error" };
        }
        // TODO:
        await col.updateOne(
            { "name": "ans" },
            { $set: { "1": null } }
        );

        return { 'success': true };
    } catch (e) {
        console.log(e);
        return { 'success': false, "msg": "Unable to update participants" };
    }
}

async function getParticipants(payload) {
    try {
        var col;
        if (payload.section == "junior" || payload.section == "senior") {
            col = client.db(payload.section).collection("ans");
        } else {
            return { "success": false, "msg": "'section' error" };
        }
        // TODO:
        await col.findOne(
            { "name": "ans" },
            { $set: { "1": null } }
        );

        return { 'success': true };
    } catch (e) {
        console.log(e);
        return { 'success': false, "msg": "Unable to access participants" };
    }
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
    } else if (resp.msg == "Already Submitted") {
        location.href = "finish";
        alert("Already Submitted");
    } else {
        console.log(resp);
        alert("Response error");
    }
}