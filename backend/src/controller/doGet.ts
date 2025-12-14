export default doGet;

function doGet() {
    return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('対戦交流会アプリ')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .addMetaTag('apple-mobile-web-app-capable','yes')
        .addMetaTag('mobile-web-app-capable','yes');
}
