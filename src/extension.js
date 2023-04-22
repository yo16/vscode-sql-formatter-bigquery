'use strict';

const vscode = require('vscode');
const formatter = require('sql-formatter');

const getSetting = (group1, group2, settings_key, def) => {
	const key = `${group2}.${settings_key}`;
	const settings = vscode.workspace.getConfiguration(group1, null);
	const editor = vscode.window.activeTextEditor;
	const language = editor && editor.document && editor.document.languageId;
	const languageSettings =
		language && vscode.workspace.getConfiguration(null, null).get(`[${language}]`);
	let value = languageSettings && languageSettings[`${group1}.${key}`];
	if (value == null) value = settings.get(key, def);
	return value == null ? def : value;
};

const configMap = {
	'3-1': {
		'変更しない': 'preserve',
		'大文字'	: 'upper',
		'小文字'	: 'lower'
	}
};

const getConfig = ({ insertSpaces, tabSize }) => ({
	indent: insertSpaces ? ' '.repeat(tabSize) : '\t',
	language: getSetting('SQL整形', '1_全体', 'データベース', 'sql'),
	useTabs: getSetting('SQL整形', '2_字下げ', '2-1_タブを使う', false),
	tabWidth: getSetting('SQL整形', '2_字下げ', '2-2_スペース幅', 4),
	keywordCase: configMap['3-1'][getSetting('SQL整形', '3_整形', '3-1_予約語の大文字/小文字', '大文字')],
//	indentStyle: getSetting('SQL整形',),
//	logicalOperatorNewline: getSetting('SQL整形',),
//	tabulatedAlias: getSetting('SQL整形',),
//	commaPosition: getSetting('SQL整形',),
//	expressionWidth: getSetting('SQL整形',),
//	linesBetweenQueries: getSetting('SQL整形',),
//	denseOperators: getSetting('SQL整形',),
//	newlineBeforeSemicolon: getSetting('SQL整形',),
//	ParamsparamTypes: getSetting('SQL整形',),
});

const format = function(text, config) {
	const query = 'select a,b from hoge where a=10 and b=5 group by a,b;';
	console.log(query);
	console.log(formatter);
	const formatted = formatter.format(query, config);
	console.log(formatted);
	console.log('------');
	const ret = formatted;

	// eturn sqlFormatter.format(text, config);
	return ret;
}

const fullDocumentRange = (document) => {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(0, 0, lastLineId, document.lineAt(lastLineId).text.length);
};

module.exports.activate = function(context) {
	const disposable = vscode.commands.registerTextEditorCommand('extension.formatSQL', (editor, edit) => {
		const text = editor.document.getText(editor.selection);
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
