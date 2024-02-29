import * as vscode from 'vscode';

function disposeTerminals() {
	Array.from(vscode.window.terminals)
	.filter(terminal => (
		terminal.name === 'Dev-Force'
	))
	.forEach(terminal => {
		terminal.dispose();
	});
}

function executeAnon(debug: Boolean, file?: string) {
	disposeTerminals();
	if(!file) {
		vscode.window.showInformationMessage('No active file found.');
		return;
	}

	let dirPath = file.split('\\').slice(0, -1);
	dirPath.push('output.log');
	const outputDir = dirPath.join('\\');

	const terminal = vscode.window.createTerminal('Dev-Force');
	if(debug) {
		terminal.sendText(`sf apex run --file ${file} | Select-String -Pattern USER_DEBUG | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
	} else {
		terminal.sendText(`sf apex run --file ${file} | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
	}
	terminal.show();
}

function pullLatestLogFromSF(debug: Boolean, outputDir: string) {
	disposeTerminals();
	const terminal = vscode.window.createTerminal('Dev-Force');
	terminal.sendText(`$username = sf org display --json | ConvertFrom-Json | Select-Object -ExpandProperty result | Select-Object -ExpandProperty username`);
	terminal.sendText(`$user = sf data query -q "SELECT Name FROM User WHERE Username = '$username'" --json | ConvertFrom-Json | Select-Object -ExpandProperty result | Select-Object -ExpandProperty records -First 1 | Select-Object -ExpandProperty Name`);
	terminal.sendText(`$logs = sf apex log list --json | ConvertFrom-Json | Select-Object -ExpandProperty result`);
	terminal.sendText(`$recentLog = $logs | Where-Object { $_.LogUser.Name -eq $user } | Sort-Object -Property StartTime -Descending | Select-Object -First 1`);
	if(debug) {
		terminal.sendText(`sf apex get log --log-id $recentLog.Id | Select-String -Pattern USER_DEBUG | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
	}
	else {
		terminal.sendText(`sf apex get log --log-id $recentLog.Id | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
	}
	terminal.show();
}

export function activate(context: vscode.ExtensionContext) {
	let execAnonWithDebug = vscode.commands.registerCommand('dev-force.execAnonWithDebug', (document: vscode.Uri) => {
		if(!document?.fsPath) {
			vscode.window.showInformationMessage('No active file found.');
			return;
		}
		executeAnon(true, document.fsPath);
	});

	let execAnon = vscode.commands.registerCommand('dev-force.execAnon', (document: vscode.Uri) => {
		if(!document?.fsPath) {
			vscode.window.showInformationMessage('No active file found.');
			return;
		}
		executeAnon(false, document.fsPath);	
	});

	let pullLatestLogWithDebug = vscode.commands.registerCommand('dev-force.pullLatestLogWithDebug', (document: vscode.Uri) => {
		if(!document?.fsPath) {
			vscode.window.showInformationMessage('No active file found.');
			return;
		}
		pullLatestLogFromSF(true, document.fsPath);
	});

	let pullLatestLog = vscode.commands.registerCommand('dev-force.pullLatestLog', (document: vscode.Uri) => {
		if(!document?.fsPath) {
			vscode.window.showInformationMessage('No active file found.');
			return;
		}
		pullLatestLogFromSF(false, document.fsPath);
	});

	console.log('Dev-Force extension activated.');

	context.subscriptions.push(execAnonWithDebug, execAnon, pullLatestLogWithDebug, pullLatestLog);
}

// This method is called when your extension is deactivated
export function deactivate() {}
