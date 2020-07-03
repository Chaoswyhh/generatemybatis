// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "generatemybatis" is now active!');
	console.log("Generate BEGIN !");

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('generatemybatis.generateMybatisInsert', function () {
		// The code you place here will be executed every time your command is executed

		const editor = vscode.window.activeTextEditor;
		const doc = editor.document;
		//console.log(editor.selection);

		const currentlyOpenTabFilePath = doc.fileName;
		//console.log("currentFilePath: " + currentlyOpenTabFilePath);

		const fileContentArr = fs.readFileSync(currentlyOpenTabFilePath, 'utf8').split(/\r?\n/);

		// clear file all content
		//fs.truncateSync(currentlyOpenTabFilePath);
		//fs.appendFileSync(currentlyOpenTabFilePath, '\n');

		let columnStr = "";
		let propertyStr = "";

		let entity = "";
		let propertyPrefix = "";

		fileContentArr.forEach( (line, index) => {
			if (index === 0) {
				//console.log("first line="+line);
				entity = line;
				propertyPrefix = "#{" + line +".";
				return;
			}

			if (!line.trim()) {
				return;
			}

			//console.log("propertyPrefix:["+propertyPrefix+"]");

			let column = line.length > 0 ? line.match(/column=\"(\S*)\" jdbcType/)[1] : "";
			let property =  line.length > 0 ? line.match(/property=\"(\S*)\"\ \/\>/)[1] : "";
			//console.log("column :" + column);
			//console.log("property :" + property);

			//let columnSuffix = index === fileContentArr.length -1 ? "" : ", ";
			let columnSuffix = ", ";
			//console.log("columnSuffix:["+columnSuffix+"]");
			columnStr = columnStr + column + columnSuffix;
			
			//let propertySuffix = index === fileContentArr.length -1 ? "}" : "}, ";
			let propertySuffix = "}, ";
			//console.log("propertySuffix:["+propertySuffix+"]");
			propertyStr = propertyStr + propertyPrefix + property + propertySuffix;

			//console.log("index="+index+", length="+fileContentArr.length);

			//let contentLength = content.length;
			//fs.appendFileSync(currentlyOpenTabFilePath, content + ((index == contentLength - 1) ? '' : '\n'));
		})

		//console.log("columnStr:["+columnStr+"]");
		//console.log("propertyStr:["+propertyStr+"]");

		columnStr = columnStr.substr(0, columnStr.length - 2);
		propertyStr = propertyStr.substr(0, propertyStr.length - 2);

		fs.appendFileSync(currentlyOpenTabFilePath, '\n\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '<insert id="insertBatch" parameterType="java.util.List">' + '\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '  INSERT INTO table' + '\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '    \(' + columnStr + '\)' + '\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '  VALUES' + '\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '  <foreach collection ="list" item="' + entity + '" separator =",">'+'\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '    \(' + propertyStr + '\)' + '\n');
		fs.appendFileSync(currentlyOpenTabFilePath, '  </foreach>' + "\n");
		fs.appendFileSync(currentlyOpenTabFilePath, '</insert>' + "\n\n\n");

		fs.appendFileSync(currentlyOpenTabFilePath, 'int insertBatch(@Param("list") List<> list);\n');

		//let docContent = doc.getText();
		//console.log(docContent);
		
		console.log("Generate END !");

		// Display a message box to the user
		//vscode.window.showInformationMessage('Generate END !');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
