/**
 * This is a part of Chrome Extensions Box
 * Read more on GitHub - https://github.com/onikienko/chrome-extensions-box
 *
 * Parse html and replace all {{property name from message.json}} from text nodes, title, alt, value and placeholder attrs
 * with chrome.i18n.getMessage http://developer.chrome.com/extensions/i18n.html
 */
/*
  HTML 파일에서 최상단에 해당 js를 import할 경우
  "{{ }}" 형식으로 된 Text를 대상으로 chrome.i18n.getMessage()이 호출되도록 지원
  사용처 : options.html, popup.html
*/

window.addEventListener("load", function () {
  const translator = (html) => {
    let i,
      length,
      attrs_to_check = ["title", "alt", "placeholder", "value", "href"];

    const replacer = (text) => {
      return text.replace(/\{\{([\s\S]*?)\}\}/gm, (str, g1) => {
        return chrome.i18n.getMessage(g1.trim()) || str;
      });
    };

    if (html.attributes) {
      attrs_to_check.forEach((el) => {
        if (html.attributes[el]) {
          html.attributes[el].value = replacer(html.attributes[el].value);
        }
      });
    }

    if (html.nodeType === 3) {
      //text node
      html.data = replacer(html.data);
    } else {
      for (i = 0, length = html.childNodes.length; i < length; i++) {
        translator(html.childNodes[i]);
      }
    }
  };

  translator(document.body);
  translator(document.head);
});
