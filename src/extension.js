'use strict';

const vscode = require('vscode');
const sqlFormatter = require('sql-formatter-plus');

const getSetting = (group, key, def) => {
	const settings = vscode.workspace.getConfiguration(group, null);
	const editor = vscode.window.activeTextEditor;
	const language = editor && editor.document && editor.document.languageId;
	const languageSettings =
		language && vscode.workspace.getConfiguration(null, null).get(`[${language}]`);
	let value = languageSettings && languageSettings[`${group}.${key}`];
	if (value == null) value = settings.get(key, def);
	return value == null ? def : value;
};

const getConfig = ({ insertSpaces, tabSize }) => ({
	indent: insertSpaces ? ' '.repeat(tabSize) : '\t',
	language: getSetting('sql-formatter', 'dialect', 'sql'),
	uppercase: getSetting('sql-formatter', 'uppercase', false),
	linesBetweenQueries: getSetting('sql-formatter', 'linesBetweenQueries', 2)
});

const format = (text, config) => sqlFormatter.format(text, config);

const fullDocumentRange = (document) => {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
};

module.exports.activate = function(context) {
	let disposable = vscode.commands.registerTextEditorCommand('extension.formatSQL', (editor, edit) => {
		let text = editor.document.getText(editor.selection);
        editor.edit(builder => {
			if(text !== ''){
				builder.replace(editor.selection, format(text, getConfig(editor.options)));
			} else {
				const allSelection = fullDocumentRange(editor.document);
				const allText = editor.document.getText(allSelection);
				builder.replace(allSelection, format(allText, getConfig(editor.options)));
			}
		}).then(success => {
			if(success && text === ''){
				const startPos = new vscode.Position(0,0);
				editor.selection = new vscode.Selection(startPos, startPos);	
			}
		});
		// vscode.window.showInformationMessage('debug print');
	});
	context.subscriptions.push(disposable);

	vscode.languages.registerDocumentRangeFormattingEditProvider('sql', {
		provideDocumentRangeFormattingEdits: (document, range, options) => [
			vscode.TextEdit.replace(range, format(document.getText(range), getConfig(options)))
		]
	});
}
