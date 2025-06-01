!INC Local Scripts.EAConstants-JavaScript
!INC Import Model.JavaScript-Helper Functions
!INC Import Model.JavaScript-Model Functions
/*
 * Script Name: Import Data Model
 * Author: Arup Kamal
 * Purpose: To be used with other scripts
 * Date: 2025-05-31
 */

myTables = {}
myColumns = {}


function main()
{
	SetupEnvironment()
	currentPackage = Repository.GetTreeSelectedPackage()
	if (currentPackage.Name !="Arup") {
		log("[User Input Error] ..  " + "Incorrect or No Package selected!")
		return -1
	}
	
	modelFile = openFile()
	if (!modelFile) {
		log("[User Input Error] ..  " + "No JSON file selected!")
		return -1
	}

	log("[JSON File selected] ..  " + modelFile)
	
	modelData = readJsonFile(modelFile)
		

	myPackage = CreatePackage(currentPackage, modelData["model_name"])
	
	myDiagram = CreateDataModelDiagram(currentPackage, modelData["model_name"]+" Diagram")
	

	for (tbl of modelData["tables"]){
		
		myTable = addTable(myPackage, tbl.name, "AWS Athena")
		myTables[ tbl.name ] = myTable.ElementID
		

        var diagramObj = myDiagram.DiagramObjects.AddNew("", "");
        diagramObj.ElementID = myTable.ElementID;
        diagramObj.Update()
        myDiagram.Update()
		
		addColumns(myTable, tbl.columns)
		
	}
	
	myPackage.Update();
    myPackage.Elements.Refresh()
	
	for (fk of modelData["foreign_keys"]){
		addForeignKey(myPackage, fk["pk_colid"], fk ["fk_colid"])
	}
	applyDefaultLayout(myDiagram)
	
}

main();
