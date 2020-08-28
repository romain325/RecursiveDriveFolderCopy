// Init menu
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Duplicate Folder')
        .addItem('Select folder', 'startProcess')
        .addToUi();
}

// Allow to include other file in html
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}

// Start HTML view
function startProcess(){
    var html = HtmlService.createTemplateFromFile('View/CopyFolder').evaluate()
    .setWidth(610)
    .setHeight(450);

    SpreadsheetApp.getUi()
        .showModalDialog(html, 'Duplicate Folder');
}

