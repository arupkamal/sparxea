!INC Local Scripts.EAConstants-JavaScript
!INC Import Model.JavaScript-Helper Functions

/*
 * Script Name: Data Model Functions Library
 * Author: Arup Kamal
 * Purpose: To be used with other scripts
 * Date: 2025-05-31
 */

//*****************************************************************
// Search a Method
//*****************************************************************
function SearchMethod(element, name) {
    var method = null;
    var methods = element.Methods;
    for (var i = 0; i < methods.Count && method == null; i++) {
        var currentMethod as EA.Method;
        currentMethod = methods.GetAt(i);
        if (currentMethod.name == name) {
            method = currentMethod;
        }
    }
    return method;
}

//*****************************************************************
// Search a Package
//*****************************************************************
function SearchPackage(parentPackage, name) {
    var package = null
    try {
        var packages as EA.Collection;
        packages = parentPackage.Packages;
        package = packages.GetByName(name);		
    } catch (err) {}
    return package;
}

//*****************************************************************
// Search a Element
//*****************************************************************
function SearchElement(package, name) {
    var element = null
    try {
        var elements as EA.Collection
        elements = package.Elements
        element = elements.GetByName(name)
    } catch (err) {}
    return element;
}


//*****************************************************************
// Search an Attribute
//*****************************************************************
function SearchAttribute(element_, AttributeName) {
    var element as EA.Element
	element = element_
	return element.Attributes.GetByName(AttributeName)
}


//*****************************************************************
// Search an Element by ID
//*****************************************************************
function GetElementByID(ID) {
	return Repository.GetElementByID(ID)
}

//*****************************************************************
// Search an Attribute by ID
//*****************************************************************
function GetAttributeByID(ID) {
	return Repository.GetAttributeByID(ID)
}

//*****************************************************************
// Applies Default Layout to a diagram
//*****************************************************************
function applyDefaultLayout(diagram){
	if (diagram != null) {
		// Clear any previous selection
		Repository.ClearOutput("Script");
		// Log the start of the script
		Session.Output("Applying Default Layout to diagram: " + diagram.Name);
		// Apply the default layout
		var Project = Repository.GetProjectInterface()
		var applied = Project.LayoutDiagramEx(diagram.DiagramGUID,0,0,0,0,1)
    
		
		if (applied) {
			// Notify the user
			Session.Output("Default Layout applied successfully.");
			// Refresh the diagram
			Repository.RefreshOpenDiagrams(true);
		} else {
			// Notify the user of failure
			Session.Output("Failed to apply default layout.");
		}
	} else {
		// Notify the user if no diagram is selected
		Session.Output("No diagram selected.");
	}
}

//*****************************************************************
// Adds a Table to a Package
//*****************************************************************
function addTable(package, name, dbType){
	log("Creating table " + name)
	table = package.Elements.AddNew(name, "EAUML::Table")
	table.Gentype = dbType
	return table
	}

//*****************************************************************
// Adds a Column to a Table
//*****************************************************************
function addColumn(table, pos, name, notes, type, length, primary_key, not_null){
	log("Creating column " + name)
    attribute = table.Attributes.AddNew(name.trim(), "EAUML::column")
	attribute.Notes = notes.trim()
	attribute.Type = type.trim()
	attribute.Length = length
    attribute.Precision = length
    attribute.Stereotype = "column"
	attribute.Pos = pos
	
	
	if (not_null.trim().toUpperCase()=='T') {
            attribute.AllowDuplicates = true; // Not null
        } else {
            attribute.AllowDuplicates = false;
        }	
		
   if (primary_key.trim().toUpperCase()=='T') {
			attribute.IsOrdered = true
			attribute.Update()
			var name = 'PK_' + table.Name
			uniqueKey = table.Methods.AddNew(name,'PK');
			uniqueKey.Stereotype = 'PK'
			uniqueKey.Update()
			
			var parameter = uniqueKey.Parameters.AddNew(col.name, attribute.Type)
			parameter.Position = pos
			parameter.Update()
			uniqueKey.Update()			
        }		
	attribute.Update()		
		
	return attribute
}

//*****************************************************************
// Adds all Columns to a Table
//*****************************************************************
function addColumns(table, columns){
	var i = 1
	for (col of columns){
		if (!col.notes)			col.notes       = ''
		if (!col.length)		col.length      = ''				
		if (!col.not_null)		col.not_null    = ''		
		if (!col.type)			col.type        = 'String'				
		if (!col.not_null) 		col.not_null    = ''
		if (!col.primary_key)	col.primary_key = ''		

		attr= addColumn(myTable, i, col.name, col.notes, col.type, col.length, col.primary_key, col.not_null)
		myColumns [tbl.name + '.' + col.name] = attr.AttributeID
		i++
	}

}

//*****************************************************************
// Adds a Foreign Key to a Table
//*****************************************************************
function addForeignKey(keyPackage, pk_colid, fk_colid){
	
		toElmAtr   = pk_colid.split(".")
		fromElmAtr = fk_colid.split(".")
	
		if (toElmAtr.length!=2 || fromElmAtr.length!=2){
			MsgBox("pk_colid and fk_colid must follow TableName.ColumnName format!")
			return -1
		}
			
		//fromElement = GetElementByID(myTables[fromElmAtr[0]])
		//toElement   = GetElementByID(myTables[toElmAtr[0]])
		
		fromElement = SearchElement(keyPackage, fromElmAtr[0])
		toElement   = SearchElement(keyPackage,   toElmAtr[0])
		
		fromAttributeName = fromElmAtr[1]
		order = 1
		toAttributeName = toElmAtr[1]
		
		var type = "FK"
		var name = type + "_" + fromElement.Name+"."+fromAttributeName+"_"+toElement.Name+"."+toAttributeName

		foreignKey = fromElement.Methods.AddNew(name,type)
		foreignKey.Stereotype = type
		foreignKey.Update()
			
		var connector = fromElement.Connectors.AddNew(name,"Association");
		connector.SupplierID = toElement.ElementID
		connector.Update()
		
		connector.Direction = "Source -> Destination"
		connector.Stereotype = "EAUML::FK"
		connector.MetaType = "ForeignKey"
		connector.SequenceNo = order
		connector.StyleEx = "FKINFO=SRC=" + name + ":DST=PK_" + toElement.Name + ":"
		connector.ClientEnd.Aggregation = 0
		connector.ClientEnd.AllowDuplicates = false
		connector.ClientEnd.Cardinality = "0..*"
		connector.ClientEnd.Derived = false
		connector.ClientEnd.Role = name
		connector.SupplierEnd.Aggregation = 0
		connector.SupplierEnd.AllowDuplicates = false
		connector.SupplierEnd.Cardinality = "1"
		connector.SupplierEnd.Derived = false
		connector.SupplierEnd.Role = "PK_" + toElement.Name
		connector.Update()			
			
		var attribute = GetAttributeByID(myColumns[fk_colid])
		//var attribute = SearchAttribute(fromElement, fromAttributeName)
		var parameter = foreignKey.Parameters.AddNew(fromAttributeName,attribute.Type)
		parameter.Position = 1
		parameter.Update()
		
}

//*****************************************************************
// Creates a Package under a selected Package
//*****************************************************************
function CreatePackage(parentPackage, name) {
    var package as EA.Package;
    package = parentPackage.Packages.AddNew(name, "Class")
    package.Update()
    parentPackage.Packages.Refresh()
    return package
}

//*****************************************************************
// Creates a Diagram under a selected Package (low level function)
//*****************************************************************
function CreateDiagram(parentPackage, name, type, metaType, StyleEx, ExtendedStyle) {
    // Add the diagram
    var diagram as EA.Diagram;
    diagram = parentPackage.Diagrams.AddNew(name, type)
    diagram.MetaType = metaType
    diagram.Update()
	
	diagram.StyleEx = StyleEx + ";MDGDgm=" + metaType
	diagram.ExtendedStyle= ExtendedStyle
	diagram.Update()
    return diagram
}

//*****************************************************************
// Creates a Data Model Diagram under a selected Package
//*****************************************************************
function CreateDataModelDiagram(parentPackage, name) {
    var diagram = CreateDiagram(parentPackage
								, name
								, "Data Modeling"
								, "Extended::Data Modeling"
								, "ExcludeRTF=0;DocAll=0;HideQuals=0;AttPkg=1;ShowTests=0;ShowMaint=0;SuppressFOC=1;MatrixActive=0;SwimlanesActive=1;KanbanActive=0;MatrixLineWidth=1;MatrixLineClr=0;MatrixLocked=0;TConnectorNotation=Information Engineering;TExplicitNavigability=0;AdvancedElementProps=1;AdvancedFeatureProps=1;AdvancedConnectorProps=1;m_bElementClassifier=1;SPT=1;STBLDgm=;ShowNotes=0;VisibleAttributeDetail=0;ShowOpRetType=1;SuppressBrackets=0;SuppConnectorLabels=1;PrintPageHeadFoot=0;ShowAsList=0;SuppressedCompartments=;Theme=:119;SaveTag=E36D8386;"
								, "HideRel=0;ShowTags=0;ShowReqs=0;ShowCons=0;OpParams=1;ShowSN=0;ScalePI=0;PPgs.cx=0;PPgs.cy=0;PSize=9;ShowIcons=1;SuppCN=0;HideProps=0;HideParents=0;UseAlias=0;HideAtts=0;HideOps=1;HideStereo=0;HideEStereo=0;ShowRec=0;ShowRes=0;ShowShape=1;FormName=;"
								)
    return diagram
}
