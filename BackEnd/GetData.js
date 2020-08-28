/**
 * Return a list of all the sub folders of a folder
 * @param {string} folderId 
 * @return {string[]} table
 */
function getSubFolders(folderId){
    var source = DriveApp.getFolderById(folderId);
    var folders = source.getFolders(), table = [];

    while (folders.hasNext()){
        var folder = folders.next();
        table.push(folder.getName());
    }

    return table;
}


function WriteSelectedToCell(id){
        // get Google Drive folder by Id from Picker
        var folder = DriveApp.getFolderById(id);
        // get Google Drive folder Url
        var folderUrl = folder.getUrl();
        // get current spreadsheet
        var sheet = SpreadsheetApp.getActiveSheet();
        // get relevant cells for pasting in values
        var urlCell = sheet.getRange(1, 1);
        //set url to cell
        urlCell.setValue(folderUrl);        
}

function GetSelectedFromCell(){
    var sheet = SpreadsheetApp.getActiveSheet();
    var urlCell = sheet.getRange(1, 1);
    return urlCell.getValue();
}