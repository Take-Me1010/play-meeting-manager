/**
 * スプレッドシートの初期化とシート管理
 */

export function initializeSpreadsheet() {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    createUsersSheet(spreadsheet);
    createMatchesSheet(spreadsheet);
    createMatchOpponentsSheet(spreadsheet);
    createMatchResultsSheet(spreadsheet);

    Logger.log('スプレッドシートの初期化が完了しました');
}

function createUsersSheet(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    const sheetName = 'users';
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
    }

    // ヘッダー行を設定
    const headers = ['id', 'name', 'email', 'role'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行をフリーズして太字にする
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // 列幅を調整
    sheet.setColumnWidth(1, 60);  // id
    sheet.setColumnWidth(2, 150); // name
    sheet.setColumnWidth(3, 200); // email
    sheet.setColumnWidth(4, 100); // role
}

function createMatchesSheet(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    const sheetName = 'matches';
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
    }

    // ヘッダー行を設定
    const headers = ['id', 'round', 'finished'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行をフリーズして太字にする
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // 列幅を調整
    sheet.setColumnWidth(1, 60);  // id
    sheet.setColumnWidth(2, 80);  // round
    sheet.setColumnWidth(3, 100); // finished
}

function createMatchOpponentsSheet(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    const sheetName = 'match_opponents';
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
    }

    // ヘッダー行を設定
    const headers = ['match_id', 'user_id'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行をフリーズして太字にする
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // 列幅を調整
    sheet.setColumnWidth(1, 100); // match_id
    sheet.setColumnWidth(2, 100); // user_id
}

function createMatchResultsSheet(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
    const sheetName = 'match_results';
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
    }

    // ヘッダー行を設定
    const headers = ['match_id', 'winner_user_id', 'finished'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行をフリーズして太字にする
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // 列幅を調整
    sheet.setColumnWidth(1, 100); // match_id
    sheet.setColumnWidth(2, 150); // winner_user_id
    sheet.setColumnWidth(3, 100); // finished
}

export function getSheet(sheetName: string): GoogleAppsScript.Spreadsheet.Sheet {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
        throw new Error(`シート '${sheetName}' が見つかりません。先にinitializeSpreadsheet()を実行してください。`);
    }

    return sheet;
}