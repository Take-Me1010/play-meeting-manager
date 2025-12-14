/**
 * 管理者判定ユーティリティ
 * スクリプトプロパティ ADMIN_EMAIL と現在のセッションユーザーを比較
 */

export function isAdmin(): boolean {
    const email = Session.getActiveUser().getEmail();
    if (!email) {
        return false;
    }

    const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
    if (!adminEmail) {
        return false;
    }

    return email.toLowerCase() === adminEmail.toLowerCase();
}
