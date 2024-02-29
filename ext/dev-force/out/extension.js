"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
function disposeTerminals() {
    Array.from(vscode.window.terminals)
        .filter(terminal => (terminal.name === 'Dev-Force'))
        .forEach(terminal => {
        terminal.dispose();
    });
}
function executeAnon(debug, file) {
    disposeTerminals();
    if (!file) {
        vscode.window.showInformationMessage('No active file found.');
        return;
    }
    let dirPath = file.split('\\').slice(0, -1);
    dirPath.push('output.log');
    const outputDir = dirPath.join('\\');
    const terminal = vscode.window.createTerminal('Dev-Force');
    if (debug) {
        terminal.sendText(`sf apex run --file ${file} | Select-String -Pattern USER_DEBUG | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
    }
    else {
        terminal.sendText(`sf apex run --file ${file} | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
    }
    terminal.show();
}
function pullLatestLogFromSF(debug, outputDir) {
    disposeTerminals();
    const terminal = vscode.window.createTerminal('Dev-Force');
    terminal.sendText(`$username = sf org display --json | ConvertFrom-Json | Select-Object -ExpandProperty result | Select-Object -ExpandProperty username`);
    terminal.sendText(`$user = sf data query -q "SELECT Name FROM User WHERE Username = '$username'" --json | ConvertFrom-Json | Select-Object -ExpandProperty result | Select-Object -ExpandProperty records -First 1 | Select-Object -ExpandProperty Name`);
    terminal.sendText(`$logs = sf apex log list --json | ConvertFrom-Json | Select-Object -ExpandProperty result`);
    terminal.sendText(`$recentLog = $logs | Where-Object { $_.LogUser.Name -eq $user } | Sort-Object -Property StartTime -Descending | Select-Object -First 1`);
    if (debug) {
        terminal.sendText(`sf apex get log --log-id $recentLog.Id | Select-String -Pattern USER_DEBUG | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
    }
    else {
        terminal.sendText(`sf apex get log --log-id $recentLog.Id | Out-String | Out-File -FilePath ${outputDir} -Encoding utf8`);
    }
    terminal.show();
}
function activate(context) {
    let execAnonWithDebug = vscode.commands.registerCommand('dev-force.execAnonWithDebug', (document) => {
        if (!document?.fsPath) {
            vscode.window.showInformationMessage('No active file found.');
            return;
        }
        executeAnon(true, document.fsPath);
    });
    let execAnon = vscode.commands.registerCommand('dev-force.execAnon', (document) => {
        if (!document?.fsPath) {
            vscode.window.showInformationMessage('No active file found.');
            return;
        }
        executeAnon(false, document.fsPath);
    });
    let pullLatestLogWithDebug = vscode.commands.registerCommand('dev-force.pullLatestLogWithDebug', (document) => {
        if (!document?.fsPath) {
            vscode.window.showInformationMessage('No active file found.');
            return;
        }
        pullLatestLogFromSF(true, document.fsPath);
    });
    let pullLatestLog = vscode.commands.registerCommand('dev-force.pullLatestLog', (document) => {
        if (!document?.fsPath) {
            vscode.window.showInformationMessage('No active file found.');
            return;
        }
        pullLatestLogFromSF(false, document.fsPath);
    });
    console.log('Dev-Force extension activated.');
    context.subscriptions.push(execAnonWithDebug, execAnon, pullLatestLogWithDebug, pullLatestLog);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map