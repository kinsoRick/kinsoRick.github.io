const RESERVED_JS_KEYWORDS = "if|else|constructor|let|try|catch|extends|super|return|new|const|typeof|continue|for|while|this|class |function|static|async|await|true|false|null|undefined".split("|")
let _id = 0;


function welcomeMessage() {
  return [
    "// Program name: VanEditor",
    "// Author: Masnaveev Kamil Albertovich <kmasnaveev@gmail.com>",
    "// Stack: Vanilla JS, vanilla CSS",
    "// ",
  ].join("\n")
}

function useState(initialState, cb = () => {}) {
  const proxyState = new Proxy({state: initialState}, {
    
  });

  const setState = (newState) => {
    proxyState.state = newState;
    cb(proxyState.state);
  }
  const getState = () => proxyState.state;

  return [getState, setState];
}

function HTMLEscape(original) {
  return original.replace(/&/g, '&amp;')
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
}

// TODO: HTMLESCAPE PROBLEM
function HTMLHighlight(original) {
  const result = HTMLEscape(original)
    .replace(/&gt;/g,  (word) => `<span class="highlight-blue-shift">${word}</span>`)
    .replace(/&lt;\w+/g, (word) => `<span class="highlight-blue-shift">${word}</span>`)
    .replace(/&lt;\/\w+/g, (word) => `<span class="highlight-blue-shift">${word}</span>`)

  return result;
}

function CSSHighlight(original) {
  const result = original
    .replace(/\.[A-Za-z0-9\-_]+/g, (classname) => `<span class="highlight-yellow">${classname}</span>`)
    .replace(/#\w+\;/g, (color) => `<span class="highlight-orange">${color}</span>`)
    .replace(/.+: /g, (property) => `<span class="highlight-blue-shift">${property}</span>`);
  return result;
}

function JSHighlight(original) {
  const STATES = {
    NONE: 0,
    SL_COMMENT: 1,
    ML_COMMENT: 2,
    REGEX: 3,
    S_QUOTE: 4,
    D_QUOTE: 5,
    R_QUOTE: 6,
  };

  original = HTMLEscape(original)
  let result = "";

  let state = STATES.NONE;
  for (let i = 0; i < original.length; i++) {
    // Chars
    const current = original[i];
    const prev = original[i - 1];
    const next = original[i + 1];

    // <Comment lines highlight>
    if (state === STATES.NONE && current === "/" && next === "/") {
      state = STATES.SL_COMMENT;  
      result += '<span class="comment-line">' + current; 
      continue;
    }

    if (state === STATES.SL_COMMENT && next === "\n") {
      state = STATES.NONE
      result += current + '</span>'; 
      continue;
    }

    if (state === STATES.NONE && current === "/" && next === "*") {
      state = STATES.ML_COMMENT;
      result += '<span class="comment-line">' + current;
      continue;
    }

    if (state === STATES.ML_COMMENT && prev === "*" && current === "/") {
      state = STATES.NONE;
      result += current + '</span>'; 
      continue;
    }
    
    // </Comment lines highlight>

    if (state === STATES.NONE && current === "`") {
      state = STATES.R_QUOTE;
      result += '<span class="highlight-orange">' + current;
      continue;
    }

    if (state === STATES.R_QUOTE && current === "`") {
      state = STATES.NONE;
      result += current + '</span>';
      continue;
    }

    if (state === STATES.NONE && current === `'`) {
      state = STATES.S_QUOTE;
      result += '<span class="highlight-orange">' + current;
      continue;
    }

    if (state === STATES.S_QUOTE && current === `'`) {
      state = STATES.NONE;
      result += current + '</span>';
      continue;
    }

    if (state === STATES.NONE && current === '"') {
      state = STATES.D_QUOTE;
      result += '<span class="highlight-orange">' + current;
      continue;
    }

    if (state === STATES.D_QUOTE && current === '"') {
      state = STATES.NONE;
      result += current + '</span>';
      continue;
    }

    // <REGEX highlight>
    if (state === STATES.NONE && current === "/" && next !== "/") {
      state = STATES.REGEX;
      result += '<span class="highlight-orange">' + current;
      continue;
    }

    if (state === STATES.REGEX && current === "/" && (
        next === " " ||
        next === "\n" ||
        next === "g" ||
        next === "i"
      )) {
      state = STATES.NONE;
      result += current + '</span>';
      continue;
    }
    // </REGEX highlight>

    result += original[i];
  }

  RESERVED_JS_KEYWORDS.forEach((word) => result = result.replaceAll(
    word, (word) => `<span class="highlight-blue-shift">${word}</span>`)
  );

  result = result.replace(/\(\w+\)/g, (word) => `(<span class="highlight-yellow">${word.slice(1, word.length - 1)}</span>)`)
    .replace(/\[\w+\]/g, (word) => `[<span class="highlight-yellow">${word.slice(1, word.length - 1)}</span>]`)
    .replace(/\d/g, (digit) => `<span class="highlight-green">${digit}</span>`)
  return result
}

// result.replaceAll(/class/g, "<span class=\"highlight-blue\">class</span>");

const classnames = (...args) => {
  let result = [];

  args.forEach((arg) => {
    if (typeof arg === "object" && !Array.isArray(arg)) {
      Object.entries(arg).forEach(([className, isActive]) => {
        if (isActive) result.push(className);
      });
    }
    if (typeof arg === "string") result.push(arg);
    if (Array.isArray(arg)) result = result.concat(arg);
  });

  return result.join(" ");
}


const createGlobalState = (initialState = {}) => {
  const state = initialState;
  const subscribers = {};

  const proxyState = new Proxy(state, {
    get: (obj, key, proxy) => {
      return obj[key];
    },
    set: (obj, key, value) => {
      const result = Reflect.set(state, key, value);
      if (subscribers.hasOwnProperty(key)) {
        subscribers[key].forEach((cb) => cb());
      }
      return result;
    }
  });

  const subscribe = (stateKey, cb) => {
    if (!subscribers[stateKey]) {
      subscribers[stateKey] = [cb];
      return;
    }
    subscribers[stateKey].push(cb);
  }

  return [proxyState, subscribe];
}

const [globalState, subscribeGlobalState] = createGlobalState({
  count: 0,
  currentWorkspace: {},
  
  isSidebarVisible: true,
  sidebarWidth: null,

  currentFileName: "",
  currentFile: null,
  currentFileHandler: null,
  caret: {
    line: 0,
    column: 0,
  },
  useIframe: false,
});

class FS {
  static async openFolder() {
    const dir = await showDirectoryPicker();
    console.log(dir);
    const toWalk = [["root", dir.values()]];
    const folders = {}

    while (toWalk.length > 0) {
      const [folderName, currentFolder] = toWalk[0];

      const { done, value } = await currentFolder.next();

      if (done) {
        toWalk.shift();
        continue;
      }

      const { kind, name } = value;
      if (kind === "directory") {
        toWalk.unshift([name, value.values()]);
      }
      if (folders.hasOwnProperty(folderName)) {
        folders[folderName].push([name, value])
      } else {
        folders[folderName] = [[name, value]];
      }
    }

    const createTree = (obj) => {
      let lastFolder = "root";
      let result = {};

      obj.forEach(([name, value]) => {
        if (folders.hasOwnProperty(name)) {
          result[name] = {
            type: "folder",
            childs: createTree(folders[name]),
          };
        } else {
          result[name] = {
            type: "file",
            handler: value,
          }
        }
      });
      return result
    }
    
    return createTree(folders.root);
  }
}

class Component {
  constructor(providedProps) {
    const props = {
      HTMLAttribute: "div",
      childNodes: [],
      attrs: {
       
      },
      
    }

    Object.assign(props, providedProps);
    this.props = props;
  }

  render() {
    const {HTMLAttribute, childNodes, attrs, text} = this.props;
    const element = document.createElement(HTMLAttribute);

    if (attrs) {
      Object.entries(attrs).forEach(([attr,value]) => {
        element.setAttribute(attr, value);
      });
    }

    if (text) element.textContent = text;

    childNodes.forEach((node)=>{
      element.appendChild(node.render());
    });

    this.afterRender(element);
    return element;
  }

  afterRender(element) {
    // [EXPLAIN] if this.element equals to rerender
    if (this.element) {
      this.element.replaceWith(element);
    } 
    this.element = element;
    return element;
  }
}

class DivComponent extends Component {
  constructor(props) {
    super(Object.assign({
      HTMLAttribute: "div",
    }, props));
  }
}

class LinkComponent extends Component {
  constructor(href, attrs) {
    super(Object.assign({
      HTMLAttribute: "a",
      attrs: Object.assign({
        href: href,
      }, attrs),
    }, props));
  }
}

class ButtonComponent extends Component {
  constructor(text, onClick = () => {}, attrs) {
    const baseAttrs = {
      class: "btn",
    }

    super({
      HTMLAttribute: "button",
      text: text,
      attrs: Object.assign(baseAttrs, attrs),
    });

    this.onClick = onClick;
  }

  afterRender (element) {
    element.addEventListener("click", this.onClick);
    return super.afterRender(element);
  }
}

class SpanComponent extends Component {
  constructor(text, attrs = {}) {
    super({
      HTMLAttribute: "span",
      text,
      attrs: attrs,
    })
  }
}

class DropdownComponent extends Component {
  constructor(name, btns = {}, attrs = {}) {
    const baseAttrs = {
      class: "dropdown",
    }

    super({
      attrs: Object.assign(baseAttrs, attrs),
    });

    this.name = name;
    this.btns = btns;
    this.isCollapsed = useState(false, (state) => { this.render() });
  }


  toggle() {
    const [getIsCollapsed, setIsCollapsed] = this.isCollapsed;
    setIsCollapsed(!getIsCollapsed());
  }

  render() {
    const isCollapsed = this.isCollapsed[0]();

    const dropdownCollapseClasses = classnames("dropdown-collapse", {
      "dropdown-collapse--visible": isCollapsed,
    });
    const dropdownCollapseBtnClasses = classnames("btn btn-dropdown", {
      "btn-dropdown--selected": isCollapsed,
    });

    const btnComponents = [];
    Object.entries(this.btns).forEach(([name, cb]) => {
      btnComponents.push(new ButtonComponent(name, () => {
        cb();
        this.toggle();
      }, { "class": "btn btn-dropdown" }));
    })
    
    const childsTree = [
      new ButtonComponent(this.name, () => this.toggle(), { class: dropdownCollapseBtnClasses }),
      new DivComponent({
        childNodes: btnComponents,
        attrs: { class: dropdownCollapseClasses },
      })
    ]
    
    Object.assign(this.props.childNodes, childsTree);
    return super.render();
  }
}

class TopBarSearch extends DivComponent {
  constructor(attrs = {}) {
    const baseAttrs = {
      class: "topbar-search"
    }

    super({attrs: Object.assign(baseAttrs, attrs)});
  }

  render() {
    this.input = new Component({
      HTMLAttribute: "input",
      attrs: {
        class: "topbar-search-input",
        placeholder: "Поиск"
      }
    })
    const childsTree = [
      this.input,
      new SpanComponent("", {
        class: "icon icon-search"
      })
    ];

    Object.assign(this.props.childNodes, childsTree)
    return super.render();
  }
}

class TopBarComponent extends DivComponent {
  constructor(attrs = {}) {
    const baseAttrs = {
      class: "topbar"
    }

    super({attrs: Object.assign(baseAttrs, attrs)})
  }

  render() {
    const childsTree = [
//       new TopBarSearch(),
      new DropdownComponent(
        "Файлы",
        {
          "Открыть файл": () => console.error("[OPEN FILE] NOT IMPLEMENTED"),
          "Сохранить файл": () => console.error("[SAVE FILE] NOT IMPLEMENTED"),
          "Открыть папку": async () => {
            const folder = await FS.openFolder();
            globalState.currentWorkspace = folder;
          },
        }
      ),
//       new DropdownComponent(
//         "Редактировать",
//         {
//           "Форматировать файл": () => console.error("[FORMAT] NOT IMPLEMENTED"),
//         }
//       ),
      new DropdownComponent(
        "Окна",
        {
          "Iframe": () => globalState.useIframe = !globalState.useIframe,
        }
      ),
    ];

    Object.assign(this.props.childNodes, childsTree)
    return super.render();
  }
}

class FolderBtn extends Component {
  constructor(name, childNodes, attrs = {}) {
    super(Object.assign({
      HTMLAttribute: "div",
    }, { attrs }));

    this.childNodes = childNodes;
    this.name = name;
    this.isCollapsed = useState(true, (state) => { this.render() });
    this.getIsCollapsed = this.isCollapsed[0];
  }

  toggle() {
    const [getIsCollapsed, setIsCollapsed] = this.isCollapsed;
    setIsCollapsed(!getIsCollapsed());
  }

  render() {
    this.props.childNodes = [];
    const childsTree = [
      new ButtonComponent(
        this.name,
        () => this.toggle(),
        {
          class: classnames("btn btn-sidebar btn-sidebar--folder icon", {
            "expanded": !this.isCollapsed[0](),
            "icon-folder-expanded": !this.isCollapsed[0](),
            "icon-folder": this.isCollapsed[0](),
          })
        }
      ),
    ];

    if (!this.isCollapsed[0]()) {
      childsTree.push(
        new DivComponent({
          childNodes: this.childNodes,
          attrs: {
            class: "folded"
          }
        })
      )
    }
    
    
    Object.assign(this.props.childNodes, childsTree)
    return super.render();
  }
}

class FileBtn extends ButtonComponent {
  constructor(name, handler) {
    super(
      name,
      async () => {
        if (globalState.currentFileName === name) return;
        const file = await handler.getFile();
        globalState.currentFileHandler = await handler;
        globalState.currentFile = file;
        globalState.currentFileName = name;
      },
    );

    this.name = name;

    subscribeGlobalState("currentFileName", () => {
      this.render();
    });
  }

  render() {
    const classes = classnames("btn btn-sidebar icon icon-file", {
      "btn-sidebar--active": globalState.currentFileName === this.name,
    })
    
    Object.assign(this.props.attrs, { class: classes });
    return super.render();
  }
}

class SidebarExpanderComponent extends Component {
  constructor() {
    super({
      HTMLAttribute: "div",
      attrs: {
        class: "sidebar-expander"
      }
    });

    this.prevX = 0;
  }

  afterRender(element) {
    element.draggable = true;
    element.addEventListener("drag", (e) => {
      const { target, screenX} = e;
      if (this.prevX === screenX) return;
      if (screenX === 0) return;
      
      if (screenX < 20) {
        globalState.isSidebarVisible = false;
        return;
      }

      if (screenX > 30) {
        globalState.isSidebarVisible = true;
      }
      
      globalState.sidebarWidth = screenX;
      this.prevX = screenX;
    });

    return super.afterRender(element);
  }
}

class SidebarComponent extends Component {
  constructor(attrs = {}) {
    const baseAttrs = {
      class: "sidebar",
    }

    super({ attrs: Object.assign(baseAttrs, attrs) });

    subscribeGlobalState("currentWorkspace", () => {
      this.render()
    });

    subscribeGlobalState("isSidebarVisible", () => {
      this.render()
    });

    subscribeGlobalState("sidebarWidth", () => {
      this.resize(globalState.sidebarWidth);
    });
  }

  resize(x) {
    this.element.setAttribute("style", `width: ${x}px;`)
  }

  render() {
    const walk = (obj) => {
      const folders = [];
      const files = [];
      
      Object.entries(obj).forEach(([name, val]) => {
        if (val.type === "folder") {
            folders.push(
              new FolderBtn(
                name,
                walk(val.childs),
                {
                  class: "btn btn-sidebar-folder"
                }
              )
            );
          }
          else {
            files.push(
              new FileBtn(name, val.handler)
            )
          }
      })
      
      const tree = [...folders, ...files];
      return tree;
    }

    const buttons = walk(globalState.currentWorkspace);

    const childsTree = (buttons.length > 0) ? buttons : [
      new ButtonComponent(
        "+ Добавить файлы в рабочее пространство",
        async () => {
          globalState.currentWorkspace = await FS.openFolder();;
        },
        {
          class: "btn btn-sidebar"
        }
      )
    ]; 

    Object.assign(this.props.attrs, {
      class: classnames("sidebar", { "sidebar--active": globalState.isSidebarVisible})
    })

    Object.assign(this.props.childNodes, [
      new DivComponent({
        childNodes: childsTree,
        attrs: { class: "sidebar-btns"}
      }), new SidebarExpanderComponent()
    ]);
    return super.render();
  }
}

class WindowBarCollapseSidebarBtn extends ButtonComponent {
  constructor() {
    super(
      "",
      () => { globalState.isSidebarVisible = !globalState.isSidebarVisible },
      {
        class: classnames("btn btn-collapse-sidebar", {
          "btn-collapse-sidebar--active": globalState.isSidebarVisible 
        })
      }
    );

    subscribeGlobalState("isSidebarVisible", () => {
      this.render()
    });
  }

  render () {
    const classes = classnames("btn btn-collapse-sidebar", {
      "btn-collapse-sidebar--active": globalState.isSidebarVisible 
    })

    Object.assign(this.props.attrs, { class: classes })
    return super.render();
  }
}

class WindowBtn extends Component {
  constructor(
    windowName = "",
    isActive = false,
    onClick = () => {},
    onClose = () => {}
  ) {
    super({
      HTMLAttribute: "div",
      text: windowName,
      attrs: {
        class: classnames("btn btn-tab", {
          "btn-tab--active": isActive,
        })
      }
    });

    this.onClick = onClick;
    this.onClose = onClose;
    this.isActive = isActive;
  }

  render () {
    const childsTree = [
      new ButtonComponent(
        "",
        this.onClose,
        {
          class: "btn btn-tab--close"
        }
      )
    ];

    if (this.isActive) Object.assign(this.props.childNodes, childsTree);
    return super.render();
  }

  afterRender(element) {
    if (!this.isActive) element.addEventListener("click", this.onClick);

    super.afterRender(element);
  }
}

class WindowBarComponent extends Component {
  constructor() {
    super({
      attrs: {
        class: "editor-window-bar"
      }
    });

    this.currentWindowId = useState("Стартовая страница", () => { this.render() });
    this.filesOpened = useState({
      "Стартовая страница": null,
    }, (state) => {
      this.render();
    })

    subscribeGlobalState("currentFileName", async () => {
      this.openNewWindow(globalState.currentFileName, globalState.currentFile);
    })
  }

  openNewWindow(fileName, file) {
    const [getCurrentWindowId, setCurrentWindowId] = this.currentWindowId;
    const [getFilesOpened, setFilesOpened] = this.filesOpened;
    const filesOpened = getFilesOpened();
    
    setCurrentWindowId(fileName);
    setFilesOpened(Object.assign(filesOpened, {
      [fileName]: file,
    }))
  }

  closeCurrentWindow(windowName) {
    const [getCurrentWindowId, setCurrentWindowId] = this.currentWindowId;
    const [getFilesOpened, setFilesOpened] = this.filesOpened;
    const filesOpened = getFilesOpened();

    delete filesOpened[windowName];
    setFilesOpened(filesOpened);
    
    const fileKeys = Object.keys(filesOpened);
    const lastFileName = fileKeys[fileKeys.length - 1]

    this.openWindowToEditor(lastFileName ? lastFileName : "Стартовая страница");
  }

  openWindowToEditor(windowName) {
    const [getFilesOpened, setFilesOpened] = this.filesOpened;
    const filesOpened = getFilesOpened();

    const newCurrentFile = filesOpened[windowName];

    globalState.currentFile = (newCurrentFile) ? newCurrentFile : null;
    globalState.currentFileName = windowName;
    globalState.currentFileHandler = globalState.currentWorkspace[windowName].handler;
  }

  render() {
    const [getCurrentWindowId, setCurrentWindowId] = this.currentWindowId;
    const [getFilesOpened, setFilesOpened] = this.filesOpened;
    const currentWindowId = getCurrentWindowId();
    const filesOpened = getFilesOpened();
    
    const windowBtns = [];

    Object.entries(filesOpened).forEach(([fileName, text]) => {
      windowBtns.push(
        new WindowBtn(
          fileName,
          currentWindowId === fileName,
          () => this.openWindowToEditor(fileName),
          () => this.closeCurrentWindow(fileName)
        )
      );
    })

    const childsTree = [
      new WindowBarCollapseSidebarBtn(),
      new DivComponent({
        childNodes: windowBtns,
        attrs: { class: "editor-window-bar-btns" }
      })
    ];

    Object.assign(this.props.childNodes, childsTree);
    return super.render();
  }
}

class IframeComponent extends Component {
  constructor(additionalProps) {
    super(Object.assign({
      HTMLAttribute: "iframe"
    }, additionalProps));
    console.log(Object.assign({ HTMLAttribute: "iframe" }, additionalProps));

    this.size = 0;
  }
  
  afterRender(element) {

    setInterval(async () => {
      if (!globalState.currentWorkspace.hasOwnProperty("test-view.html")) return;
      const file = await globalState.currentWorkspace["test-view.html"].handler.getFile();
      
      if (file.size !== this.size) {
        element.src = "./test-view.html";
        this.size = file.size;
      }
    }, 2000)

    return super.afterRender(element);
  }
}

class EditorCodeComponent extends Component {
  constructor() {
    super({
      HTMLAttribute: "div",
      attrs: {
        class: "editor-code"
      }
    });

    this.type = "text";

    subscribeGlobalState("currentFileHandler", async () => {
      const handler = globalState.currentFileHandler;
      if (!handler) {
        return this.setText(welcomeMessage())
      }

      const file = await globalState.currentFileHandler.getFile();
      const text = await file.text();
      this.type = file.type;
      this.setText(text, file.type);
    })

    subscribeGlobalState("useIframe", () => { this.render() })
  }

  render() {
    this.pre = new Component({
      HTMLAttribute: "pre",
      attrs: {
        class: "editor-code-view"
      }
    });

    this.textarea = new Component({
      HTMLAttribute: "textarea",
      attrs: {
        class: "editor-code-input"
      }
    });

    this.linesNumber = new Component({
      HTMLAttribute: "pre",
      attrs: {
        class: "editor-code-lines"
      }
    });

    const childsTree = [
      this.linesNumber,
      new DivComponent({
        childNodes: [
          this.textarea,
          this.pre
        ],
        attrs: {
          class: "editor-main",
        }
      })
    ];

    if (globalState.useIframe === true) {
      childsTree.push(new IframeComponent({
        attrs: {
          class: "editor-view-result",
          src: "./test-view.html"
        }
      }))
    }

    this.props.childNodes = childsTree;
    return super.render();
  }

  setText(text, type = "text") {
    let result = text;
    const linesCount = text.match(/\n/g);
    
    const comments = text.match(/\/\/.+$/g);
    
    if (type === "text/javascript") result = JSHighlight(result);
    if (type === "text/html") result = HTMLHighlight(result);
    if (type === "text/css") result = CSSHighlight(result);

    if (linesCount) this.setLinesCount(linesCount.length);
    if (!linesCount) this.setLinesCount(1);
    this.pre.element.innerHTML = result + '<br>';
    this.textarea.element.value = text;
  }

  setLinesCount(number) {
    let count = 1;
    let result = ""
    while (count <= number + 1) {
      result += `${count}\n`;
      count += 1;
    }
    this.linesNumber.element.textContent = result; 
  }

  afterRender(element) {
    this.textarea.element.addEventListener("input", (e) => {
      this.setText(e.target.value, this.type);
    });

    this.textarea.element.addEventListener("keydown", (e) => {
      const { ctrlKey, code } = e;

      console.debug(code)

      if (code === "Tab") {
        e.preventDefault();
        const {selectionStart, selectionEnd, value } = this.textarea.element;
        
        if (selectionStart === selectionEnd) {
          const a = this.textarea.element.value;
          const valueWithSpaces = a.slice(0, selectionStart) + "  " + a.slice(selectionStart, a.length);
          this.setText(valueWithSpaces, this.type);
          this.textarea.element.selectionStart = selectionStart + 2;
          this.textarea.element.selectionEnd = selectionStart + 2;
        }
      }

      if (!ctrlKey) return;
      
      const handlers = {
        "KeyS": async () => {
          e.preventDefault();
          const fileHandler = globalState.currentFileHandler;
          if (!fileHandler) return;
          const writeStream = await fileHandler.createWritable();
          await writeStream.write(this.textarea.element.value);
          await writeStream.close();
        },
      };

      if (handlers[code]) {
        handlers[code]();
      }
    });

    this.textarea.element.addEventListener("scroll", (e) => {
      const {scrollTop, scrollLeft} = e.target;

      this.pre.element.scrollTop = scrollTop;
      this.pre.element.scrollLeft = scrollLeft;

      this.linesNumber.element.scrollTop = scrollTop;
    });

    this.setText(welcomeMessage());
    
    return super.afterRender(element);
  }
}



class EditorComponent extends Component {
  constructor() {
    super({
      HTMLAttribute: "div",
      attrs: {
        class: "editor"
      }
    });
  }

  render() {
    const childsTree = [
      new WindowBarComponent(),
      new EditorCodeComponent(),
    ];

    Object.assign(this.props.childNodes, childsTree);
    return super.render();
  }
}



class CaretInfoComponent extends SpanComponent {
  constructor() {
    super("", {
        class: "info-caret",
    });
    subscribeGlobalState("caret", () => this.render())
  }

  render() {
    const {line, column} = globalState.caret;

    this.props.text = `${line}:${column}`;
    return super.render();
  }
}

class BottomBarComponent extends DivComponent {
  constructor(attrs = {}) {
    const baseAttrs = {
      class: "bottombar"
    }

    super({attrs: Object.assign(baseAttrs, attrs)})
  }

  render() {
    const childsTree = [
      new DivComponent({
        childNodes: [],
      }),
      new DivComponent({
        childNodes: [
          new CaretInfoComponent(),
        ]
      })
    ];

    Object.assign(this.props.childNodes, childsTree)
    return super.render();
  }
}

class AppComponent extends Component {
  constructor(attrs = {}) {
    const baseAttrs = {
      id: "application"
    }

    super({attrs: Object.assign(baseAttrs, attrs)});
  }

  render() {
    const childsTree = [
      new TopBarComponent(),
        new DivComponent({
          childNodes: [
            new SidebarComponent(),
            new EditorComponent(),
          ],
          attrs: {
            class: "workspace",
          }
        }),
        new BottomBarComponent(),
    ];

    Object.assign(this.props.childNodes, childsTree);
    return super.render();
  }
}

const root = document.getElementById("root");

root.appendChild(new AppComponent().render());
