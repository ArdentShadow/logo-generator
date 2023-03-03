class SimplegenTextComponent {
    constructor(name, text, color, fontFamily, fontWeight, fontSize, letterSpacing = 0) {
      Object.assign(this, { name, text, color, fontFamily, fontWeight, fontSize, letterSpacing });
    }
  
    init() {
      const dataParams = { text: this.text, color: this.color, fontFamily: this.fontFamily, fontWeight: this.fontWeight === "bold", fontSize: this.fontSize, letterSpacing: this.letterSpacing };
  
      for (const [param, value] of Object.entries(dataParams)) {
        const element = document.querySelector(`[data-component="${this.name}"][data-param="${param}"]`);
        if (param === "fontWeight") $(element).bootstrapToggle(value ? "on" : "off");
        else {
          element.value = value;
          const displayElement = element.nextElementSibling.querySelector('[data-display="value"] span');
          displayElement.textContent = value;
        }
      }
    }
  
    sync(object) { Object.assign(this, object) }
  
    getText() { return [...this.text].join(String.fromCharCode(8202).repeat(this.letterSpacing)) }
  
    getFont() { return `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}` }
  }
  
  const canvas_logo = document.getElementById("logo-canvas");
  const canvas_fav = document.getElementById("fav-canvas");
  [canvas_logo, canvas_fav].forEach(c => c.width = c.height = 5);
  const ctx_logo = canvas_logo.getContext("2d");
  const ctx_fav = canvas_fav.getContext("2d");
  
  const icon = new SimplegenTextComponent("icon", window.getComputedStyle(document.querySelector("#icp-component i"), ":before").content.replace(/['"]/g, ""), "#000000", window.getComputedStyle(document.querySelector("#icp-component i")).fontFamily, window.getComputedStyle(document.querySelector("#icp-component i")).fontWeight, 48);
  const main = new SimplegenTextComponent("main", "", "#000000", "Arial", "bold", 48);
  const accent = new SimplegenTextComponent("accent", "", "#cccccc", "Arial", "bold", 48);
  const components = { icon, main, accent };
  
  const padding = Object.freeze({ width: 7, height: 7, internal: { x: 3, y: 5 } });
  const global = { offset: { size: 0, color: "#e2e2e2" }, layout: "HORIZONTAL", shapes: true };
  
  $(document).ready(() => {
    $(".widget[role='md2html']").each((_, widget) => $.get($(widget).attr("data-widget"), data => $(widget).html(new showdown.Converter().makeHtml(data))));
  });
  
  $("#icp").on("iconpickerSelected", () => {
    $("#icp-component i").attr("style", "").html("");
    icon.sync({ text: window.getComputedStyle(document.querySelector("#icp-component i"), ":before").content.replace(/['"]/g, ""), fontFamily: window.getComputedStyle(document.querySelector("#icp-component i")).fontFamily, fontWeight: window.getComputedStyle(document.querySelector("#icp-component i")).fontWeight });
    render();
  });
  
  $(`input[type='text'][data-param='text']`).on("input", function () {
    components[$(this).attr("data-component")].text = $(this).val();
    render();
  });
  // allows the icon to be functional and checks that it is there
  $('input[data-toggle="toggle"][data-param="shapes"]').on("change", function() {
    global.shapes = $(this).prop("checked");
    render();
  });
//sets the color but if not there it makes the whole thing null
  $('input[type="color"][data-param="color"]').on("input", function() {
    components[$(this).attr("data-component")].color = $(this).val();
    render();
  });
  //icon sizer
  $('input[type="range"][data-param="fontSize"]').on("input", function() {
    components[$(this).attr("data-component")].fontSize = parseInt($(this).val());
    $(this).siblings('.input-group-append[data-display="value"]').children("span").html($(this).val());
    render();
  });  

  /* FUNCTIONS */
  /**
   * Set the selected font family to the selector
   * @param {HTMLSelectElement} select : HTML select element to change font family
   */
  function setSelectFont(select) {
    if (select) {
      select.style.fontFamily = select.value;
    }
  }

  /**
   * Refresh GUI data from JS objects
   * @param {Array} ignore : Components to not refresh
   */
  function refreshGUI(ignore = []) {
    ignore = ignore.map((component) => {
      return component.toLowerCase();
    });
  }

  /**
   * Render favicon and logo canvas
   */
  function render() {
    document.fonts.ready.then((_) => {
      renderFav(ctx_fav, canvas_fav);
      renderLogo(ctx_logo, canvas_logo);
    });
  }
  
  /**
   * Render favicon
   * @param {CanvasRenderingContext2D} ctx : Context for drawing favicon
   * @param {HTMLCanvasElement} canvas : Painting canvas element
   */
  function renderFav(ctx, canvas) {
    ctx.font = icon.getFont();
    canvas.width = ctx.measureText(icon.text).width + 2 * padding.width;
    canvas.height = icon.fontSize + 2 * padding.height;
    ctx.textBaseline = "middle";
    ctx.font = icon.getFont();
    ctx.fillStyle = icon.color;
    ctx.fillText(icon.text, padding.width, canvas.height / 2);
  }
  
  /**
   // RENDERS THE WHOLE
   * @param {CanvasRenderingContext2D} ctx : Context for drawing logo
   * @param {HTMLCanvasElement} canvas : Painting canvas element
   */
  function renderLogo(ctx, canvas) {
    if (global.layout.toUpperCase() == "HORIZONTAL") {
      renderLogoHorizontal(ctx, canvas);
    } else {
      renderLogoVertical(ctx, canvas);
    }
  }
  
  /**
   * Render Logo in horizontal layout
   * @param {CanvasRenderingContext2D} ctx : Context for drawing logo
   * @param {HTMLCanvasElement} canvas : Painting canvas element
   */
  function renderLogoHorizontal(ctx, canvas) {
    ctx.font = icon.getFont();
    var icon_w = ctx.measureText(icon.text).width;
  
    ctx.font = main.getFont();
    var main_w = ctx.measureText(main.getText()).width;
  
    ctx.font = accent.getFont();
    var accent_w = ctx.measureText(accent.getText()).width;
  
    var max_h = Math.max(icon.fontSize, main.fontSize, accent.fontSize);
    var icon_start = padding.width;
    var main_start =
      icon_start + icon_w + (main.text != "" ? padding.internal.x : 0);
    var accent_start =
      main_start +
      main_w +
      (accent.text != "" ? padding.internal.x : 0) +
      (accent.text != "" && global.shapes ? 2 * padding.internal.x : 0);
  
    canvas.width =
      icon_w +
      (main.text != "" ? padding.internal.x : 0) +
      main_w +
      (accent.text != "" ? padding.internal.x : 0) +
      (accent.text != "" && global.shapes ? 4 * padding.internal.x : 0) +
      accent_w +
      2 * padding.width;
    canvas.height =
      max_h +
      (accent.text != "" && global.shapes ? 2 * padding.internal.y : 0) +
      2 * padding.height;
  
    var baseline = canvas.height / 2;
    ctx.textBaseline = "middle";


    //SHAPE ANIMATOR
    // Shape Drawing
    if (accent.text != "" && global.shapes) {
      ctx.strokeStyle = main.color;
      ctx.fillStyle = main.color;
      var pos = new Object();
      pos.x = accent_start - 2 * padding.internal.x;
      pos.y = padding.height;
      var dim = new Object();
      dim.width = accent_w + 4 * padding.internal.x;
      dim.height = canvas.height - 2 * padding.height;
      roundRect(ctx, pos, dim, 5, true, true);
    }
  

    // TEXT ANIMATOR
    // Text drawing
    ctx.font = icon.getFont();
    ctx.fillStyle = icon.color;
    ctx.fillText(icon.text, icon_start, baseline);
  
    ctx.font = main.getFont();
    ctx.fillStyle = main.color;
    ctx.fillText(main.getText(), main_start, baseline);
  
    ctx.font = accent.getFont();
    ctx.fillStyle = accent.color;
    ctx.fillText(accent.getText(), accent_start, baseline);
  }
  
  /**
   * Render Logo in vertical layout
   * @param {CanvasRenderingContext2D} ctx : Context for drawing logo
   * @param {HTMLCanvasElement} canvas : Painting canvas element
   */
  function renderLogoVertical(ctx, canvas) {
    ctx.font = icon.getFont();
    var icon_w = ctx.measureText(icon.text).width;
  
    ctx.font = main.getFont();
    var main_w = ctx.measureText(main.getText()).width;
  
    ctx.font = accent.getFont();
    var accent_w = ctx.measureText(accent.getText()).width;
  
    var max_w = Math.max(icon_w, main_w, accent_w);
    var center = (max_w + 2 * padding.width) / 2;
  
    var icon_start = padding.height + icon.fontSize / 2;
    var main_start =
      icon_start + icon.fontSize / 2 + padding.internal.y + main.fontSize / 2;
    var accent_start =
      main_start + main.fontSize / 2 + padding.internal.y + accent.fontSize / 2;
  
    canvas.width = max_w + 2 * padding.width;
    canvas.height =
      icon.fontSize +
      padding.internal.y +
      main.fontSize +
      padding.internal.y +
      accent.fontSize +
      2 * padding.height;
  
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  
  
    // Text Drawing
    ctx.font = icon.getFont();
    ctx.fillStyle = icon.color;
    ctx.fillText(icon.text, center, icon_start);
  
    ctx.font = main.getFont();
    ctx.fillStyle = main.color;
    ctx.fillText(main.getText(), center, main_start);
  
    ctx.font = accent.getFont();
    ctx.fillStyle = accent.color;
    ctx.fillText(accent.getText(), center, accent_start);
  }
  /**
   *
   * @param {HTMLAnchorElement} btn_download : Anchor element for downloading
   * @param {HTMLCanvasElement} canvas : Canvas element to export
   * @param {String} filename : Downloading filename without extension
   * @param {Function} renderFunction : Canvas render function
   */
  function exportCanva(btn_download, canvas, filename, renderFunction) {
    var selectFormat = document.getElementById("export_format-select");
    var mimetype = selectFormat.options[selectFormat.selectedIndex].value;
    var extension = selectFormat.options[selectFormat.selectedIndex].text;
  
    var canvas_temp = canvas.cloneNode(true);
    var ctx_temp;
    var dataURL;
    switch (mimetype) {
      case "image/png":
        dataURL = canvas.toDataURL(mimetype);
        break;
      case "image/webp":
        dataURL = canvas.toDataURL(mimetype);
        break;
      case "image/jpeg":
        ctx_temp = canvas_temp.getContext("2d");
        ctx_temp.fillStyle = "#FFF";
        ctx_temp.fillRect(0, 0, canvas_temp.width, canvas_temp.height);
        ctx_temp.drawImage(canvas, 0, 0);
        dataURL = canvas.toDataURL(mimetype);
        break;
      case "image/svg+xml":
        ctx_temp = new C2S(canvas_temp.width, canvas_temp.height);
        renderFunction(ctx_temp, canvas_temp);
        var svgfonts = "<style>\r\n";
        svgfonts +=
          '@import url("https://fonts.googleapis.com/css?family=Montez|Lobster|Josefin+Sans|Shadows+Into+Light|Pacifico|Amatic+SC:700|Orbitron:400,900|Rokkitt|Righteous|Dancing+Script:700|Bangers|Chewy|Sigmar+One|Architects+Daughter|Abril+Fatface|Covered+By+Your+Grace|Kaushan+Script|Gloria+Hallelujah|Satisfy|Lobster+Two:700|Comfortaa:700|Cinzel|Courgette|Annie+Use+Your+Telescope|Baloo|Bowlby+One+SC|Bungee+Inline|Cabin+Sketch|Caveat|Contrail+One|Damion|Economica|Fascinate+Inline|Faster+One|Fredericka+the+Great|Gabriela|Just+Another+Hand|Kodchasan|Love+Ya+Like+A+Sister|Megrim|Monoton|Mouse+Memoirs|Podkova|Pompiere|Quicksand|Reenie+Beanie|Rokkitt|Six+Caps|Source+Sans+Pro|Special+Elite|Spicy+Rice|VT323|Wire+One");\r\n';
        svgfonts +=
          '@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css");\r\n';
        var svg = ctx_temp
          .getSerializedSvg()
          .replace("<defs/>", svgfonts + "</style>\r\n<defs/>");
        dataURL =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent('<?xml version="1.0" standalone="no"?>\r\n' + svg);
        break;
      default:
        break;
    }
    btn_download.setAttribute("download", filename + "." + extension);
    btn_download.href = dataURL;
  }
  
 function hexToComplimentary(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);

  r /= 255;
  g /= 255;
  b /= 255;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
     }
  }