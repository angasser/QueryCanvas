export function initCodeTab(state) {
    state.codeTab = document.querySelector('#codeTab');
    state.codeBox = document.getElementById("code");
    
    state.codeTab.style.fontSize = '24px';

    var editor = CodeMirror.fromTextArea(state.codeBox, {
        lineNumbers: true,
        mode: "python",
        theme: "default",
        viewportMargin: Infinity
    });

    // Additional CSS adjustments for the CodeMirror instance
    var css = `
        .CodeMirror {
            height: auto !important;
            overflow-y: hidden !important; /* Prevent vertical scrollbar */
        }
        .CodeMirror-scroll {
            overflow-y: hidden !important; /* Prevent vertical scrollbar */
            height: auto !important;
            max-height: calc(100vh - 128px);
        }
    `;

    var style = document.createElement('style');
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
}

export function updateCodeTab(state) {
}