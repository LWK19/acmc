//Add New Input Row
function addNewInputRow(table, rowindex = table.rows.length - 1) {
    //Validation
    for (let h = 0; h < table.rows.length; h++) {
        let currentRow = table.rows[h];
        for (let i = 0; i < currentRow.cells.length; i++) {
            let inputElement = currentRow.cells[i].children[0];
            if (inputElement?.tagName?.toLowerCase() != 'input') {
                continue;
            }
            if (inputElement && inputElement.value === "") {
                currentRow.cells[i].style.backgroundColor = "var(--gold)";
                inputElement.focus();
                inputElement.reportValidity()
                return;
            } else {
                currentRow.cells[i].style.backgroundColor = "";
            }
        }
    }

    //Actually adding the row
    var numcol = table.rows[0].cells.length; // Access the number of cells in the first row
    var curRow = table.rows[rowindex];
    var row = table.insertRow(rowindex + 1);
    var cells = [];
    for (var i = 0; i < numcol; i++) {
        cells.push(row.insertCell(i));
        cells[i].innerHTML = curRow.cells[i].innerHTML;
    }
    cells[0].getElementsByTagName('input')[0].focus();
}

function buildResultTable(table, numQns) {
    const template = table.rows[0].cells[1];
    for (var i = 1; i <= numQns; i++) {
        const clone = template.cloneNode();
        clone.innerHTML += i;
        table.rows[0].appendChild(clone);
    }

    var numcol = table.rows[0].cells.length;
    for (var i = 0; i < numcol - 1; i++) {
        table.rows[1].insertCell(i).innerHTML = table.rows[1].cells[0].innerHTML;
    }
}

function buildMCQ(parent, qnum, idx) {
    const template = document.getElementById("mcq");
    for (var i = 1; i <= qnum; i++) {
        const clone = template.cloneNode(true);
        clone.id = clone.id + i;
        clone.children[0].innerHTML = "Question " + i;

        clone.getElementsByClassName("image-input")[0].removeAttribute("onchange");
        clone.getElementsByClassName("image-input")[0].setAttribute("onchange", "handleImageUpload(event, " + i + ")")

        const options = ['A', 'B', 'C', 'D', 'E']
        for (var j = 0; j < 5; j++) {
            clone.getElementsByClassName("optionscontainer")[0].children[j].removeAttribute("onclick");
            clone.getElementsByClassName("optionscontainer")[0].children[j].setAttribute("onclick", "select(\'" + options[j] + "\', " + i + ")");
        }
        parent.appendChild(clone);
    }
    template.remove();
}

function buildSRQ(parent, qnum, idx) {
    const template = document.getElementById("srq");
    for (var i = 1; i <= qnum; i++) {
        const clone = template.cloneNode(true);
        clone.id = clone.id + (i + idx);
        clone.children[0].innerHTML = "Question " + (i + idx);

        clone.getElementsByClassName("image-input")[0].removeAttribute("onchange");
        clone.getElementsByClassName("image-input")[0].setAttribute("onchange", "handleImageUpload(event, " + (i + idx) + ")")

        parent.appendChild(clone);
    }
    template.remove();
}

//Dont question it
function backspaceHandler(table, rowindex = table.rows.length - 1) {
    var activeInput = document.activeElement;
    var activeCell = activeInput.parentElement;
    if (Array.from(table.rows[rowindex].cells).every(cell => cell.children[0].value === "")) {
        if (rowindex > 1) {
            deleteInputRow(table, rowindex);
        }
    } else if (activeInput.value === "") {
        var index = Array.from(table.rows[rowindex].cells).indexOf(activeCell);
        var prevCell = table.rows[rowindex].cells[index - 1];
        var prevInput = prevCell.getElementsByTagName('input')[0];
        if (prevInput) {
            prevInput.focus();
            prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
        }
        return;
    }
}

//Delete Input Row
function deleteInputRow(table, rowindex = table.rows.length - 1) {
    if (table.rows.length < 3) {
        return;
    }
    var numcol = table.rows[0].cells.length;
    var prevRow = table.rows[rowindex - 1];
    table.deleteRow(rowindex);
    for (let i = numcol - 1; i >= 0; i--) {
        let inputElement = prevRow.cells[i].children[0];
        if (inputElement?.tagName?.toLowerCase() === 'input') {
            inputElement.focus();
            break;
        }
    }
}

function getAns(qnum) {
    return document.getElementById("srq" + qnum).getElementsByClassName("answer-input")[0].value;
}

function putAns(x, qnum) {
    return document.getElementById("srq" + qnum).getElementsByClassName("answer-input")[0].value = x;
}

//Multiple Choice Handler
var selectedOptionValues = [] // Initialize an array to store selected option values

function select(x, questionNumber) {
    var options = document.querySelectorAll('#mcq' + questionNumber + ' .options');
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.classList.contains('selected') && option !== document.querySelector('#mcq' + questionNumber + ' .' + x)) {
            option.classList.remove('selected');
            option.classList.add('unselected');
        }
    }

    var selectedOption = document.querySelector('#mcq' + questionNumber + ' .' + x);
    if (selectedOption.classList.contains('selected')) {
        selectedOption.classList.remove('selected');
        selectedOption.classList.add('unselected');
        selectedOptionValues[questionNumber - 1] = null; // Reset the selected option value
    } else {
        selectedOption.classList.remove('unselected');
        selectedOption.classList.add('selected');
        selectedOptionValues[questionNumber - 1] = selectedOption.textContent.trim(); // Store the selected option value
    }
}
var files = [];
function handleImageUpload(event, questionNumber) {
    const fileUploadInput = event.target;
    const imageContainer = fileUploadInput.parentElement;

    // Check if a file is selected
    if (fileUploadInput.files.length === 0) {
        return alert('Please select a file!');
    }

    // using index [0] to take the first file from the array
    const image = fileUploadInput.files[0];

    // Check if the file selected is not an image file
    if (!image.type.includes('image')) {
        return alert('Only images are allowed!');
    }

    // Check if size (in bytes) exceeds 10 MB
    if (image.size > 10_000_000) {
        return alert('Maximum upload size is 10MB!');
    }
    files[questionNumber - 1] = image;
    const fileReader = new FileReader();

    fileReader.onload = (fileReaderEvent) => {
        const questionPicture = imageContainer.querySelector('.question-picture');
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

function updateFileArray(file, i){
    files[i] = file;
}

function getQnArr(nummcq, numsa) {
    var arr = [];
    for (var i = 0; i < nummcq + numsa; i++) {
        const file = i < files.length ? files[i] : null;
        const ans = i < nummcq ? (i < selectedOptionValues.length ? selectedOptionValues[i] : null) : getAns(i + 1);
        const qnType = i < nummcq ? "mcq" : "srq";
        arr[i] = { "file": file, "qn": i + 1, "qnType": qnType, "ans": ans }
    }

    return arr;
}


