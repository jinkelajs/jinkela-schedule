{

  class X extends Jinkela {
    set x(value) {
      if (value < 0) value = 0;
      if (value > 1) value = 1;
      if (this.$x === value) return;
      this.$x = value;
      this.element.style.left = (this.x * 100).toFixed(4) + '%';
    }
    get x() { return this.$x || 0; }
  }

  class Handle extends X {
    init() {
      this.element.jinkela = this;
      this.mouseup = this.mouseup.bind(this);
      this.mousedown = this.mousedown.bind(this);
      this.mousemove = this.mousemove.bind(this);
      this.element.addEventListener('mousedown', this.mousedown);
    }
    get readonly() { return this.element.classList.contains('readonly'); }
    set readonly(value) { this.element.classList[value ? 'add' : 'remove']('readonly'); }
    mouseup() {
      removeEventListener('mouseup', this.mouseup);
      removeEventListener('mousemove', this.mousemove);
      this.element.classList.remove('active');
      this.moving = null;
      document.body.style.userSelect = '';
    }
    mousedown(event) {
      if (this.readonly) return;
      addEventListener('mouseup', this.mouseup);
      addEventListener('mousemove', this.mousemove);
      this.element.classList.add('active');
      this.moving = { x: (event.x - this.element.offsetLeft) / this.bar.width };
      document.body.style.userSelect = 'none';
    }
    mousemove(event) {
      this.x = event.x / this.bar.width - this.moving.x;
    }
    get x() { return super.x; }
    set x(value) {
      let { delta } = this.bar;
      if (delta) value = Math.round(value / delta) * delta;
      super.x = value;
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    get styleSheet() {
      return `
        :scope {
          width: 36px;
          height: 36px;
          position: absolute;
          top: -16px;
          transform: translateX(-50%);
          background-color: transparent;
          cursor: -webkit-grab;
          cursor: grab;
          z-index: 2;
          &::before {
            content: '';
            position: absolute;
            margin: auto;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            width: 12px;
            height: 12px;
            background-color: currentColor;
            border-radius: 50%;
            transition: .2s;
            user-select: none;
          }
          &:not(.readonly):hover, &:not(.readonly).active {
            z-index: 2;
            &::before {
              transform: scale(1.5);
              filter: brightness(.8);
            }
          }
          &.readonly {
            cursor: not-allowed;
          }
        }
      `;
    }
  }

  class Pipe extends Jinkela {
    get styleSheet() {
      return `
        :scope {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          background-color: currentColor;
          user-select: none;
        }
      `;
    }
    get width() { return this.element.offsetWidth; }
    update() {
      let x1 = this.handle1.x;
      let x2 = this.handle2.x;
      if (x1 > x2) [ x2, x1 ] = [ x1, x2 ];
      this.element.style.left = x1 * 100 + '%';
      this.element.style.right = (1 - x2) * 100 + '%';
    }
  }

  class Bar extends Jinkela {
    get Handle() { return Handle; }
    get Pipe() { return Pipe; }
    init() {
      if (this.width) this.element.style.width = this.width;
      this.pipe.update();
    }
    get bar() { return this; }
    set value([ x1, x2 ]) { this.handle1.x = x1; this.handle2.x = x2; }
    get value() { return [ this.handle1.x, this.handle2.x ].sort(); }
    get readonly() { return this.element.classList.contains('readonly'); }
    set readonly(value) {
      this.element.classList[value ? 'add' : 'remove']('readonly');
      this.handle1.readonly = value;
      this.handle2.readonly = value;
    }
    change() { this.pipe.update(); }
    click(event) {
      if (this.readonly) return;
      if (event.target.jinkela instanceof Handle) return;
      let x = (event.x - this.element.offsetLeft) / this.width;
      let x1 = this.handle1.x;
      let x2 = this.handle2.x;
      let [ d1, d2 ] = [ Math.abs(x - x1), Math.abs(x - x2) ];
      if (d2 > d1) {
        this.handle1.x = x;
      } else {
        this.handle2.x = x;
      }
    }
    get width() { return this.element.clientWidth; }
    get template() {
      return `
        <div on-change="{change}" on-click="{click}">
          <jkl-handle bar="{bar}" ref="handle1"></jkl-handle>
          <jkl-handle bar="{bar}" ref="handle2"></jkl-handle>
          <jkl-pipe bar="{bar}" ref="pipe" handle1="{handle1}" handle2="{handle2}"></jkl-pipe>
        </div>
      `;
    }
    get styleSheet() {
      return `
        :scope {
          height: 4px;
          border-color: transparent;
          border-style: solid;
          border-width: 16px 9px;
          border-radius: 3px;
          position: relative;
          cursor: pointer;
          &::before {
            content: '';
            display: block;
            background-color: #e4e8f1;
            height: 100%;
          }
          &.readonly {
            cursor: not-allowed;
          }
        }
      `;
    }
  }

  class Point extends X {
    get template() { return '<li title="{text}"></li>'; }
    get styleSheet() {
      return `
        :scope {
          height: 0;
          width: 0;
          position: absolute;
          &::before {
            color: #1f2d3d;
            line-height: 16px;
            font-size: 12px;
            content: attr(title);
            white-space: nowrap;
            position: absolute;
            transform: translateX(-50%);
            z-index: 1;
          }
          &::after {
            content: '';
            height: 4px;
            width: 4px;
            margin: auto;
            background: currentColor;
            position: absolute;
            transform: translateX(-50%);
            border-radius: 100%;
            bottom: -32px;
            transform: translateX(-50%);
            z-index: 2;
            filter: brightness(.8);
            opacity: .8;
          }
        }
      `;
    }
  }

  class Schedule extends Jinkela {
    get Bar() { return Bar; }
    init() {
      if (this.left === void 0) this.left = new Date();
      if (this.right === void 0) this.right = new Date(Date.now() + 864E5);
      this.duration = this.right - this.left;
      if (this.step === void 0) this.step = this.duration / 48;
      this.delta = this.step / this.duration;
      if (!this.$hasValue) this.value = void 0;
      if (this.width) this.element.style.width = this.width;
      if (this.readonly) this.element.classList.add('readonly');
      this.change();
      Object.entries(this.points || {}).forEach(([ text, date ]) => {
        if (date < this.left || date > this.right) return;
        let x = (date - this.left) / this.duration;
        new Point({ text, x }).to(this.pointList);
      });
    }
    convert(value) {
      let t = new Date(value);
      return [
        [ t.getFullYear(), t.getMonth() + 1, t.getDate() ].join('-'),
        [ t.getHours(), t.getMinutes(), t.getSeconds() ].join(':')
      ].join(' ').replace(/\b\d\b/g, '0$&');
    }
    get value() {
      return this.bar.value.map(p => new Date(p * this.duration + +this.left));
    }
    set value(value = this.defaultValue) {
      this.$hasValue = true;
      if (!(value instanceof Array)) value = [ this.left, this.left ];
      this.bar.value = value.map(t => (t - this.left) / this.duration);
    }
    change() {
      let [ l, r ] = this.value;
      this.leftText.textContent = this.convert(l);
      this.rightText.textContent = this.convert(r);
    }
    get readonly() { return this.element.classList.contains('readonly'); }
    set readonly(value) {
      this.element.classList[value ? 'add' : 'remove']('readonly');
      this.bar.readonly = value;
    }
    get template() {
      return `
        <div on-change="{change}">
          <ul ref="pointList"></ul>
          <jkl-bar ref="bar" delta="{delta}"></jkl-bar>
          <div class="tip">
            <span ref="leftText"></span> ~ <span ref="rightText"></span>
          </div>
        </div>
      `;
    }
    get styleSheet() {
      return `
        :scope {
          width: 500px;
          color: #20a0ff;
          > ul {
            list-style: none;
            padding: 0;
            margin: 0;
            height: 12px;
            border-style: solid;
            border-color: transparent;
            border-width: 0px 9px;
            position: relative;
            &:empty { display: none; }
          }
          > .tip {
            color: #1f2d3d;
            font-size: 14px;
            font-family: monospace;
            text-align: center;
          }
          &.readonly {
            color: #bfcbd9;
          }
        }
      `;
    }
  }

  window.Schedule = Schedule;

}
