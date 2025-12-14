import { isAdmin } from "../auth/admin";

export default doGet;

function doGet() {
    const template = createTemplate();
    return template
        .evaluate()
        .setTitle('対戦交流会アプリ')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .addMetaTag('apple-mobile-web-app-capable','yes')
        .addMetaTag('mobile-web-app-capable','yes')
}

function createTemplate() {
    const template = HtmlService.createTemplateFromFile('index');
    template.isAdmin = isAdmin();
    return template
}
