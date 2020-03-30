const fs = require('fs');
const path = require('path');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let quillFilePath = require.resolve('quill');
let quillMinFilePath = quillFilePath.replace('quill.js', 'quill.min.js');

let quillLibrary = fs.readFileSync(quillMinFilePath);
let mutationObserverPolyfill = fs.readFileSync(path.join(__dirname, 'polyfill.js'));

const JSDOM_TEMPLATE = `
  <div id="editor">hello</div>
  <script>${mutationObserverPolyfill}</script>
  <script>${quillLibrary}</script>
  <script>
    document.getSelection = function() {
      return {
        getRangeAt: function() { }
      };
    };
    document.execCommand = function (command, showUI, value) {
      try {
          return document.execCommand(command, showUI, value);
      } catch(e) {}
      return false;
    };
  </script>
`;

const JSDOM_OPTIONS = { runScripts: 'dangerously' };
const DOM = new JSDOM(JSDOM_TEMPLATE, JSDOM_OPTIONS);

const cache = {};

function setCache() {
  // configure Quill to use inline styles
  var DirectionAttribute = DOM.window.Quill.import('attributors/attribute/direction');
  DOM.window.Quill.register(DirectionAttribute,true);

  var AlignClass = DOM.window.Quill.import('attributors/class/align');
  DOM.window.Quill.register(AlignClass,true);

  var BackgroundClass = DOM.window.Quill.import('attributors/class/background');
  DOM.window.Quill.register(BackgroundClass,true);

  var ColorClass = DOM.window.Quill.import('attributors/class/color');
  DOM.window.Quill.register(ColorClass,true);

  var DirectionClass = DOM.window.Quill.import('attributors/class/direction');
  DOM.window.Quill.register(DirectionClass,true);

  var FontClass = DOM.window.Quill.import('attributors/class/font');
  DOM.window.Quill.register(FontClass,true);

  var SizeClass = DOM.window.Quill.import('attributors/class/size');
  DOM.window.Quill.register(SizeClass,true);

  var AlignStyle = DOM.window.Quill.import('attributors/style/align');
  DOM.window.Quill.register(AlignStyle,true);

  var BackgroundStyle = DOM.window.Quill.import('attributors/style/background');
  DOM.window.Quill.register(BackgroundStyle,true);

  var ColorStyle = DOM.window.Quill.import('attributors/style/color');
  DOM.window.Quill.register(ColorStyle,true);

  var DirectionStyle = DOM.window.Quill.import('attributors/style/direction');
  DOM.window.Quill.register(DirectionStyle,true);

  var FontStyle = DOM.window.Quill.import('attributors/style/font');
  DOM.window.Quill.register(FontStyle,true);

  var SizeStyle = DOM.window.Quill.import('attributors/style/size');
  DOM.window.Quill.register(SizeStyle,true);

  cache.quill = new DOM.window.Quill('#editor');
}

exports.convertTextToDelta = (text) => {
  if (!cache.quill) {
    setCache();
  }

  cache.quill.setText(text);

  let delta = cache.quill.getContents();
  return delta;
};

exports.convertHtmlToDelta = (html) => {
  if (!cache.quill) {
    setCache();
  }

  let delta = cache.quill.clipboard.convert(html);

  return delta;
};

exports.convertDeltaToHtml = (delta) => {
  if (!cache.quill) {
    setCache();
  }

  cache.quill.setContents(delta);

  let html = cache.quill.root.innerHTML;
  return html;
};
