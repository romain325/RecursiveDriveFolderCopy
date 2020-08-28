/**
 * Set Root Folder and Continuation Token
 * @param {string} sourceid 
 * @param {string} name 
 */
function startCopy(sourceid, name, destination , sub = []) {
    source = DriveApp.getFolderById(sourceid)
    sub.push(source.getName());
    // Create the target folder
    if(destination === "" || destination == sourceid){
      root = source.getParents();
      if(root.hasNext()){
        var parent = root.next();
        target = parent.createFolder(name);  
      }else {
        root = DriveApp.getRootFolder();
        target = root.createFolder(name);
      }
    }else{
      root = DriveApp.getFolderById(destination);
      target = root.createFolder(name);  
    }
    
    // Copy the top level files
    copyFiles(source, target)
    
    // Now set the subdirectories to process
    var subfolders = source.getFolders(), continuationToken = subfolders.getContinuationToken(), userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('COPY_FILES_CONTINUATION_TOKEN', continuationToken);
    userProperties.setProperty('COPY_FILES_BASE_TARGET_FOLDER_ID', target.getId());
    userProperties.setProperty('EXCLUDED',sub.toString());
        
    // Set the trigger to start after 20 seconds - will allow the webapp portion to complete
    ScriptApp.newTrigger("resume")
        .timeBased()
        .after(20000)
        .create();
};


/**
 *  Copies the files from sfolder to dfolder
 * @param {GoogleAppsScript.Drive.Folder} sfolder 
 * @param {GoogleAppsScript.Drive.Folder} dfolder 
 */
function copyFiles(sfolder, dfolder) {
  var files = sfolder.getFiles(),file,fname;

  while(files.hasNext()) {
    file = files.next();
    fname = file.getName();
    Logger.log("\Copie de " + fname);
    file.makeCopy(fname, dfolder);
  }
};

/**
 *  Copies the folders from sfolder to dfolder
 * @param {GoogleAppsScript.Drive.Folder} sfolder 
 * @param {GoogleAppsScript.Drive.Folder} dfolder 
 */
function copyFolder(sfolder, dfolder) {
  var dir, newdir;
  
  copyFiles(sfolder, dfolder)
  
  var dirs = sfolder.getFolders();
  while(dirs.hasNext()) {
    dir = dirs.next();
    newdir = dfolder.createFolder(dir.getName());
    Logger.log("Entrée dans le Sous-Fichier " + dir.getName());
    copyFolder(dir, newdir);
  }
};


// Resume the copy
function resume(e) {
  
    var userProperties = PropertiesService.getUserProperties();
    var continuationToken = userProperties.getProperty('COPY_FILES_CONTINUATION_TOKEN');
    var lastTargetFolderCreatedId = userProperties.getProperty('COPY_FILES_LAST_TARGET_FOLDER_ID');
    var baseTargetFolderId = userProperties.getProperty('COPY_FILES_BASE_TARGET_FOLDER_ID');
    var excludedSubFolder = userProperties.getProperty('EXCLUDED');
    var dir, newdir;

/*
    // Remove any partially copied directories
    if(lastTargetFolderCreatedId != null || lastTargetFolderCreatedId == "") {     
        var partialdir = DriveApp.getFolderById(lastTargetFolderCreatedId);
        partialdir.setTrashed(true);
    }
  */  // Clear any existing triggers
    removeTriggers();
    
    // We're finished
    if(continuationToken == null) {
      return null; 
    }
    
    // Install a trigger in case we timeout or have a problem
    ScriptApp.newTrigger("resume")
      .timeBased()
      .after(7 * 60 * 1000)
      .create();  

    var subfolders = DriveApp.continueFolderIterator(continuationToken);
    var dfolder = DriveApp.getFolderById(baseTargetFolderId);

    while(subfolders.hasNext()) {    
        var continuationToken = subfolders.getContinuationToken();
        userProperties.setProperty('COPY_FILES_CONTINUATION_TOKEN', continuationToken);    

        
        dir = subfolders.next();

        if(excludedSubFolder.includes(dir.getName())){
          continue;
        }


        newdir = dfolder.createFolder(dir.getName());
        Logger.log("Recursing in to " + dir.getName());
        
        userProperties.setProperty('COPY_FILES_LAST_TARGET_FOLDER_ID', newdir.getId());
        copyFolder(dir, newdir);
    }
    
    // Clean up - we're done
    userProperties.deleteAllProperties();
    removeTriggers();
    
    // Send confirmation mail
    sendSuccessMail();
};

function removeTriggers() {
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }   
};

