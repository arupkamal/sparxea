!INC Local Scripts.EAConstants-JavaScript

/*
 * Script Name: Helper Functions Library
 * Author: Arup Kamal
 * Purpose: To be used with other scripts
 * Date: 2025-05-31
 */


var DLG_MAXFILESIZE = 260;
var OF_FILEMUSTEXIST = 0x1000;
var OF_OVERWRITEPROMPT = 0x2;

//***************************************************************** 
// Displays a message in the Session.Output screen like the console.log function 
//*****************************************************************
function log(msg) {
    Session.Output(msg)
}

//*****************************************************************
// Makes an http get call and converts the response (coming as JSON) into a JScript object
//*****************************************************************
function httpGet(url) {
    try {
        var http = new COMObject("MSXML2.XMLHTTP.6.0")
		log("HTTP Get: "+url)
        http.open("GET", url, false)
        http.send()
        if (http.status === 200) {
            var resp = JSON.parse(http.responseText)
		log(http.statusText)			
		return {"code": http.status, "status": http.statusText, "response": resp}
        } else {
			log(http.statusText)
			return {"code": http.status, "status": http.statusText, "response": null}
        }
    } catch (err) {
        json = null
        errorMsg = "Error: " + err.message
		log(errorMsg)
		return {"code": 999, "status": errorMsg, "response": null}
    }
}


//*****************************************************************
// Reads a JSON file from local machine
//*****************************************************************
function readJsonFile(filename){
	log("Reading JSON file " + filename)
	
	try {
		var fs = new COMObject("Scripting.FileSystemObject")
		var jsonFile = fs.OpenTextFile(filename, 1, -2)
		var line = jsonFile.ReadLine()
		var jsonString = ""
		while(!jsonFile.AtEndOfStream){
			jsonString = jsonString + '\n' + line
			line = jsonFile.ReadLine()
		}
		jsonString = jsonString + '\n' + line
		jsonFile.Close()
	} catch(err) {
        errorMsg = "Error: " + err.message
		log(errorMsg)
		return null
    }
	//log(jsonString)
	return JSON.parse(jsonString)
}


//*****************************************************************
// Displays a Message Box
//*****************************************************************
function MsgBox(promptText) {
	Session.Prompt(promptText, 1)
}

//*****************************************************************
// Opens a File Dialog Box
//*****************************************************************
function openFile()
{
	var	filterString = "JSON Files (*.json)|*.json";
	var defaultFilterIndex = 1;

	var filename = "";
	var flags = OF_FILEMUSTEXIST;
	var initialDirectory = "";
	var openOrSave = 0;
	
	// Show the dialog and return the selected file name
	return Repository.GetProjectInterface().GetFileNameDialog(filename, filterString, defaultFilterIndex, flags, initialDirectory, openOrSave);
}

//*****************************************************************
// Sets up Sparx Script Environment before execution
//*****************************************************************
function SetupEnvironment(){
	Repository.EnsureOutputVisible("Script")
    Repository.ClearOutput("Script")
}


