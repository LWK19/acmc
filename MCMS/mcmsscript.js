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

//Multiple Choice Handler
var selectedOptionValues = new Array(10).fill(null); // Initialize an array to store selected option values for 10 questions
    
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



    
