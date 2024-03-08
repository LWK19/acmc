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
