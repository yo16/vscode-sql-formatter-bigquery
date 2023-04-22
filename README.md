# SQL Formatter for JAPANESE

- 日本語で設定できる、SQLフォーマッターです。
- SQLフォーマッターとは、SQLをいつも決まったルールで整形するツールです。
- これを使うことで、プロジェクト内の全メンバーが、共通のルールでSQLを書くことができます。


## 使い方

- インストールすると、`Format SQL`というコマンドが追加されます。これを呼び出します。
- 呼び出し方法
  1. `Ctrl+Shift+P`でコマンドパレットを開く
  2. `Format SQL`と入力する、または途中まで入力して出てきた`Format SQL`をクリックする
- 呼び出す際の２つの方法
  - すべてを整形する場合は、何も選択せず呼び出す
  - 一部を整形する場合は、整形したい範囲を選択し呼び出す


## 設定
- ファイル＞ユーザー設定＞設定 を開く
  - `Ctrl+,`でも同じ画面が開きます。
- 

## プロジェクト内で共通の設定を使いたい場合



**`sql-formatter.dialect`**: Changes which dialect to format with (`sql`: Standard SQL, `n1ql`: Couchbase N1QL, `db2`: IBM DB2, `pl/sql`: Oracle PL/SQL). Defaults to `sql`.

**`sql-formatter.uppercase`**: Convert keywords to uppercase. Defaults to false.

**`sql-formatter.linesBetweenQueries`**: Number of linebreaks between queries. Defaults to 2.


## ソース
- 内部的には、npmパッケージの「[sql-formatter - npm](https://www.npmjs.com/package/sql-formatter)」を使っています。
- この機能拡張のソースはこちら。
  - [sql-formatter-org/sql-formatter: A whitespace formatter for different query languages](https://github.com/sql-formatter-org/sql-formatter)
- 内部で使っているパッケージのソースはこちら。
  - [sql-formatter-org/sql-formatter: A whitespace formatter for different query languages](https://github.com/sql-formatter-org/sql-formatter)
Format SQL files using the [googleapis/nodejs-bigquery](https://github.com/googleapis/nodejs-bigquery) npm package.

