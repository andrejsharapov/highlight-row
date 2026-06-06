const vscode = require('vscode');

// Хранилище подсвеченных строк: key = "filePath|lineNumber"
let highlightedRows = new Map();

// Декоратор для подсветки строк
let decorationType = null;

// Функция обновления декоратора (с учётом настроек цвета)
function updateDecorationType() {
    if (decorationType) {
        decorationType.dispose();
    }
    
    const config = vscode.workspace.getConfiguration('highlightRow');
    const backgroundColor = config.get('backgroundColor', '#4488ff44');
    
    decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: backgroundColor,
        isWholeLine: true,
        overviewRulerColor: backgroundColor,
        overviewRulerLane: vscode.OverviewRulerLane.Full
    });
}

// Получает все уникальные строки, где есть курсоры/выделения
function getSelectedRows(editor) {
    const rows = new Set();
    for (const selection of editor.selections) {
        const rowNumber = selection.active.line;
        rows.add(rowNumber);
    }
    return rows;
}

// Проверяет, подсвечена ли хотя бы одна из выбранных строк
function isAnySelectedRowHighlighted(editor) {
    const selectedRows = getSelectedRows(editor);
    const filePath = editor.document.uri.toString();
    
    for (const rowNum of selectedRows) {
        const key = `${filePath}|${rowNum}`;
        if (highlightedRows.has(key)) {
            return true;
        }
    }
    return false;
}

// Обновляет контекстное меню
function updateContextMenu() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.commands.executeCommand('setContext', 'highlightRow.isHighlighted', false);
        vscode.commands.executeCommand('setContext', 'highlightRow.hasMultipleSelections', false);
        return;
    }
    
    const selections = editor.selections;
    const hasMultipleSelections = selections.length > 1;
    vscode.commands.executeCommand('setContext', 'highlightRow.hasMultipleSelections', hasMultipleSelections);
    
    const isHighlighted = isAnySelectedRowHighlighted(editor);
    vscode.commands.executeCommand('setContext', 'highlightRow.isHighlighted', isHighlighted);
}

// Применяет подсветку ко всем открытым редакторам
function applyAllHighlights() {
    vscode.window.visibleTextEditors.forEach(editor => {
        applyHighlightsToEditor(editor);
    });
}

// Применяет подсветку к конкретному редактору
function applyHighlightsToEditor(editor) {
    if (!decorationType) return;
    
    const filePath = editor.document.uri.toString();
    const ranges = [];
    
    for (const [key, rowNumber] of highlightedRows.entries()) {
        const [storedFilePath, storedRowNumber] = key.split('|');
        if (storedFilePath === filePath) {
            const rowNum = parseInt(storedRowNumber, 10);
            if (rowNum < editor.document.lineCount) {
                const row = editor.document.lineAt(rowNum);
                ranges.push(row.range);
            }
        }
    }
    
    editor.setDecorations(decorationType, ranges);
}

// Подсветить строки (поддерживает множественные курсоры)
function highlightRow() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const document = editor.document;
    const filePath = document.uri.toString();
    const selectedRows = getSelectedRows(editor);
    
    for (const rowNumber of selectedRows) {
        const key = `${filePath}|${rowNumber}`;
        if (!highlightedRows.has(key)) {
            highlightedRows.set(key, rowNumber);
        }
    }
    
    applyHighlightsToEditor(editor);
    
    // Обновляем другие редакторы с этим же файлом
    vscode.window.visibleTextEditors.forEach(otherEditor => {
        if (otherEditor !== editor && otherEditor.document.uri.toString() === filePath) {
            applyHighlightsToEditor(otherEditor);
        }
    });
    
    updateContextMenu();
}

// Снять подсветку со строк (поддерживает множественные курсоры)
function unhighlightRow() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    const document = editor.document;
    const filePath = document.uri.toString();
    const selectedRows = getSelectedRows(editor);
    
    for (const rowNumber of selectedRows) {
        const key = `${filePath}|${rowNumber}`;
        if (highlightedRows.has(key)) {
            highlightedRows.delete(key);
        }
    }
    
    applyHighlightsToEditor(editor);
    
    // Обновляем другие редакторы с этим же файлом
    vscode.window.visibleTextEditors.forEach(otherEditor => {
        if (otherEditor !== editor && otherEditor.document.uri.toString() === filePath) {
            applyHighlightsToEditor(otherEditor);
        }
    });
    
    updateContextMenu();
}

// Следит за сменой активного редактора
function onActiveEditorChanged() {
    updateContextMenu();
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        applyHighlightsToEditor(editor);
    }
}

// Следит за перемещением курсора
function onSelectionChanged() {
    updateContextMenu();
}

// Простая и надёжная функция - без сдвига строк, только перерисовка
function onDocumentChanged(event) {
    const document = event.document;
    const filePath = document.uri.toString();
    
    // Просто перерисовываем все редакторы с этим файлом
    vscode.window.visibleTextEditors.forEach(editor => {
        if (editor.document.uri.toString() === filePath) {
            applyHighlightsToEditor(editor);
        }
    });
    
    updateContextMenu();
}

// Следит за изменением настроек
function onConfigurationChanged(event) {
    if (event.affectsConfiguration('highlightRow.backgroundColor')) {
        updateDecorationType();
        applyAllHighlights();
    }
}

// Активация расширения
function activate(context) {
    // Инициализируем декоратор
    updateDecorationType();
    
    // Регистрируем команды
    const highlightCmd = vscode.commands.registerCommand('highlight-row.highlightRow', highlightRow);
    const unhighlightCmd = vscode.commands.registerCommand('highlight-row.unhighlightRow', unhighlightRow);
    
    context.subscriptions.push(highlightCmd);
    context.subscriptions.push(unhighlightCmd);
    
    // Подписываемся на события
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(onActiveEditorChanged));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(onSelectionChanged));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onDocumentChanged));
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(onConfigurationChanged));
    
    // Применяем подсветку к уже открытым редакторам
    applyAllHighlights();
    
    // Инициализируем состояние контекстного меню
    updateContextMenu();
    
    context.subscriptions.push({ dispose: () => decorationType?.dispose() });
}

function deactivate() {
    if (decorationType) {
        decorationType.dispose();
    }
    highlightedRows.clear();
}

module.exports = {
    activate,
    deactivate
};