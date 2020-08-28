function getOAuthToken() {
    DriveApp.getRootFolder();
    return ScriptApp.getOAuthToken();
  }


function sendFailMail(){
  var titre = "Duplication Folder Failed";
  var message = `
  The folder duplication unfortunately failed.\n
  You should erase the folder and start a new duplication.\n
  Sorry For the inconvenience.
  `;
  sendMail(titre,message);
}

function sendSuccessMail(){
  var titre = "Duplication Folder Successful";
  var message = `
  Your Folder duplication has ended successfully!\n
  Thanks for using this script!
  `;
  sendMail(titre,message);
}

function sendMail(titre, message){
  var email = Session.getActiveUser().getEmail();
  message = message + `\n\n
  Dev: Romain OLIVIER
  GitHub: https://github.com/romain325`;
  MailApp.sendEmail(email, titre, message);    
}