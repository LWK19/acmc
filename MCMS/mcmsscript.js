function addNewInputRow(table, rowindex = -1) {
    //Validation
    for (let h = 0; h < table.rows.length; h++) {
        let currentRow = table.rows[h];
        for (let i = 0; i < currentRow.cells.length; i++) {
            let inputElement = currentRow.cells[i].children[0];
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
    var row = table.insertRow(rowindex + 1);
    var cells = [];
    for (var i = 0; i < numcol; i++) {
        cells.push(row.insertCell(i));
        cells[i].innerHTML = '<input class="participantinput" onkeyup="rowhandler(event)">';
    }
    cells[0].getElementsByTagName('input')[0].focus();
}

function deleteInputRow(table, rowindex = table.rows.length - 1) {
    if (Array.from(table.rows[rowindex].cells).every(cell => cell.children[0].value === "")) {
        if (rowindex > 1) {
            table.deleteRow(rowindex);
        }
    }
    var numcol = table.rows[0].cells.length;
    table.rows[rowindex-1].cells[numcol - 1].children[0].focus();
}
