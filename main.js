(function (window) {
  var boxes2 = [];

  var selectionHandles = [];

  var canvas;
  var ctx;
  var WIDTH;
  var HEIGHT;
  var INTERVAL = 20;

  var isDrag = false;
  var isResizeDrag = false;
  var expectResize = -1;
  var mx, my;

  var canvasValid = false;

  var mySel = null;

  var mySelColor = "white";
  var mySelWidth = 2;
  var mySelBoxColor = "black";
  var mySelBoxSize = 6;

  var ghostcanvas;
  var gctx;

  var offsetx, offsety;

  var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

  var ship = new Image();
  ship.src = "images/back5.png";

  function Box2() {
    this.x = 0;
    this.y = 0;
    this.w = 1;
    this.h = 1;
    this.fill = "#444444";
  }

  Box2.prototype = {
    draw: function (context, optionalColor) {
      if (context === gctx) {
        context.fillStyle = "black";
      } else {
        context.fillStyle = this.fill;
      }

      if (this.x > WIDTH || this.y > HEIGHT) return;
      if (this.x + this.w < 0 || this.y + this.h < 0) return;

      context.fillRect(this.x, this.y, this.w, this.h);

      if (mySel === this) {
        context.strokeStyle = mySelColor;
        context.lineWidth = mySelWidth;
        context.strokeRect(this.x, this.y, this.w, this.h);

        var half = mySelBoxSize / 2;

        selectionHandles[0].x = this.x - half;
        selectionHandles[0].y = this.y - half;

        selectionHandles[1].x = this.x + this.w / 2 - half;
        selectionHandles[1].y = this.y - half;

        selectionHandles[2].x = this.x + this.w - half;
        selectionHandles[2].y = this.y - half;

        selectionHandles[3].x = this.x - half;
        selectionHandles[3].y = this.y + this.h / 2 - half;

        selectionHandles[4].x = this.x + this.w - half;
        selectionHandles[4].y = this.y + this.h / 2 - half;

        selectionHandles[6].x = this.x + this.w / 2 - half;
        selectionHandles[6].y = this.y + this.h - half;

        selectionHandles[5].x = this.x - half;
        selectionHandles[5].y = this.y + this.h - half;

        selectionHandles[7].x = this.x + this.w - half;
        selectionHandles[7].y = this.y + this.h - half;

        context.fillStyle = mySelBoxColor;
        for (var i = 0; i < 8; i++) {
          var cur = selectionHandles[i];
          context.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
        }
      }
    },
  };

  function addRect(x, y, w, h, fill) {
    var rect = new Box2();
    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;
    rect.fill = fill;
    boxes2.push(rect);
    invalidate();
  }

  function init2() {
    canvas = document.getElementById("canvas2");
    HEIGHT = canvas.height;
    WIDTH = canvas.width;
    ctx = canvas.getContext("2d");
    ghostcanvas = document.createElement("canvas");
    ghostcanvas.height = HEIGHT;
    ghostcanvas.width = WIDTH;
    gctx = ghostcanvas.getContext("2d");
    canvas.onselectstart = function () {
      return false;
    };

    if (document.defaultView && document.defaultView.getComputedStyle) {
      stylePaddingLeft =
        parseInt(
          document.defaultView.getComputedStyle(canvas, null)["paddingLeft"],
          10
        ) || 0;
      stylePaddingTop =
        parseInt(
          document.defaultView.getComputedStyle(canvas, null)["paddingTop"],
          10
        ) || 0;
      styleBorderLeft =
        parseInt(
          document.defaultView.getComputedStyle(canvas, null)[
            "borderLeftWidth"
          ],
          10
        ) || 0;
      styleBorderTop =
        parseInt(
          document.defaultView.getComputedStyle(canvas, null)["borderTopWidth"],
          10
        ) || 0;
    }

    setInterval(mainDraw, INTERVAL);

    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
    canvas.ondblclick = myDblClick;
    canvas.onmousemove = myMove;

    for (var i = 0; i < 8; i++) {
      var rect = new Box2();
      selectionHandles.push(rect);
    }

    addRect(220, 70, 60, 65, "#ff5700");

    addRect(150, 120, 60, 65, "#0084ff");

    addRect(45, 60, 60, 60, "#bd081c");
  }

  function clear(c) {
    c.clearRect(0, 0, WIDTH, HEIGHT);
  }

  function mainDraw() {
    if (canvasValid == false) {
      clear(ctx);

      var l = boxes2.length;
      for (var i = 0; i < l; i++) {
        boxes2[i].draw(ctx);
      }

      canvasValid = true;
    }
  }

  function myMove(e) {
    if (isDrag) {
      getMouse(e);

      mySel.x = mx - offsetx;
      mySel.y = my - offsety;

      invalidate();
    } else if (isResizeDrag) {
      var oldx = mySel.x;
      var oldy = mySel.y;

      switch (expectResize) {
        case 0:
          mySel.x = mx;
          mySel.y = my;
          mySel.w += oldx - mx;
          mySel.h += oldy - my;
          break;
        case 1:
          mySel.y = my;
          mySel.h += oldy - my;
          break;
        case 2:
          mySel.y = my;
          mySel.w = mx - oldx;
          mySel.h += oldy - my;
          break;
        case 3:
          mySel.x = mx;
          mySel.w += oldx - mx;
          break;
        case 4:
          mySel.w = mx - oldx;
          break;
        case 5:
          mySel.x = mx;
          mySel.w += oldx - mx;
          mySel.h = my - oldy;
          break;
        case 6:
          mySel.h = my - oldy;
          break;
        case 7:
          mySel.w = mx - oldx;
          mySel.h = my - oldy;
          break;
      }

      invalidate();
    }

    getMouse(e);

    if (mySel !== null && !isResizeDrag) {
      for (var i = 0; i < 8; i++) {
        var cur = selectionHandles[i];

        if (
          mx >= cur.x &&
          mx <= cur.x + mySelBoxSize &&
          my >= cur.y &&
          my <= cur.y + mySelBoxSize
        ) {
          expectResize = i;
          invalidate();

          switch (i) {
            case 0:
              this.style.cursor = "nw-resize";
              break;
            case 1:
              this.style.cursor = "n-resize";
              break;
            case 2:
              this.style.cursor = "ne-resize";
              break;
            case 3:
              this.style.cursor = "w-resize";
              break;
            case 4:
              this.style.cursor = "e-resize";
              break;
            case 5:
              this.style.cursor = "sw-resize";
              break;
            case 6:
              this.style.cursor = "s-resize";
              break;
            case 7:
              this.style.cursor = "se-resize";
              break;
          }
          return;
        }
      }

      isResizeDrag = false;
      expectResize = -1;
      this.style.cursor = "auto";
    }
  }

  function myDown(e) {
    getMouse(e);

    if (expectResize !== -1) {
      isResizeDrag = true;
      return;
    }

    clear(gctx);
    var l = boxes2.length;
    for (var i = l - 1; i >= 0; i--) {
      boxes2[i].draw(gctx, "black");

      var imageData = gctx.getImageData(mx, my, 1, 1);
      var index = (mx + my * imageData.width) * 4;

      if (imageData.data[3] > 0) {
        mySel = boxes2[i];
        offsetx = mx - mySel.x;
        offsety = my - mySel.y;
        mySel.x = mx - offsetx;
        mySel.y = my - offsety;
        isDrag = true;

        invalidate();
        clear(gctx);
        return;
      }
    }

    mySel = null;

    clear(gctx);

    invalidate();
  }

  function myUp() {
    isDrag = false;
    isResizeDrag = false;
    expectResize = -1;
  }

  function myDblClick(e) {
    getMouse(e);
    var width = 20;
    var height = 20;
    addRect(
      mx - width / 2,
      my - height / 2,
      width,
      height,
      "rgba(220,205,65,0.7)"
    );
  }

  function invalidate() {
    canvasValid = false;
  }

  function getMouse(e) {
    var element = canvas,
      offsetX = 0,
      offsetY = 0;

    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    offsetX += stylePaddingLeft;
    offsetY += stylePaddingTop;

    offsetX += styleBorderLeft;
    offsetY += styleBorderTop;

    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
  }

  window.init2 = init2;
})(window);

$(document).ready(function () {
  init2();
});
