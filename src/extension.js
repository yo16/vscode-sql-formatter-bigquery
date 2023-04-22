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
	},
	'3-2': {
		'前'		: 'before',
		'後'		: 'after'
	},
	'3-6': {
		'標準'		: 'standard',
		'左揃え'	: 'tablarLeft',
		'右揃え'	: 'tablarRight'
	},
	'3-9': {
		'行末'				: 'after',
		'行末で縦に揃える'	: 'tabular',
		'行頭'				: 'before'
	}
};

const parseJson = function(s){
	let ret = '';
	try {
		ret = JSON.parse(s);
	} catch (err) {
		console.log('error');
		console.log(err);
		ret = ''
	}
	console.log(ret);
	return ret;
}

const getConfig = ({ insertSpaces, tabSize }) => ({
	indent: insertSpaces ? ' '.repeat(tabSize) : '\t',
	language: getSetting('SQL整形', '1_全体', 'データベース', 'sql'),
	useTabs: getSetting('SQL整形', '2_字下げ', '2-1_タブを使う', false),
	tabWidth: getSetting('SQL整形', '2_字下げ', '2-2_スペース幅', 4),
	keywordCase: configMap['3-1'][getSetting('SQL整形', '3_整形', '3-1_予約語の大文字/小文字', '大文字')],
	logicalOperatorNewline: configMap['3-2'][getSetting('SQL整形', '3_整形', '3-2_論理演算前後の改行', '後')],
	denseOperators: !getSetting('SQL整形', '3_整形', '3-3_演算子前後のスペース有り', true),
		// denseOperatorsは、tureで密集=スペースなし、falseでスペースありでわかりづらいので、
		// スペース有無という設定にして反転させている
	expressionWidth: getSetting('SQL整形', '3_整形', '3-4_カッコ内の文字列長', 50),
	newlineBeforeSemicolon: getSetting('SQL整形', '3_整形', '3-5_セミコロンの前に改行', true),
	indentStyle: configMap['3-6'][getSetting('SQL整形', '3_整形', '3-6_表形式', '標準')],
	linesBetweenQueries: getSetting('SQL整形', '3_整形', '3-7_次のクエリの間の空行', 1),
	tabulateAlias: getSetting('SQL整形', '3_整形', '3-8_列の表形式', false),						// deprected
	commaPosition: configMap['3-9'][getSetting('SQL整形', '3_整形', '3-9_カンマの位置', '前')],		// deprected
	params: parseJson(getSetting('SQL整形', '4_変数展開', '4-1_変数の設定', ''))
//	paramTypes: getSetting('SQL整形','4_変数展開'),
});

const format = function(text, config) {
	let query = 'select a,b,  product.price+(product.original_price*product.sales_tax+something_alpha) AS total from hoge where a=10+c and b=5*d group by a,b;';
	if (text.length > 0) {
		query = text;
	}
	const formatted = formatter.format(query, config);
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
