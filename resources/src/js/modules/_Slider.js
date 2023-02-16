/**
 * スライダー
 * classの付け替えでアニメーション操作する
 *

 * @version 1.1
 *
 * 【更新履歴】
 * windowのloadが終わらない場合でも、強制的に発火出来るように変更
 *
 * @author shota suzuki <pppottf1234@gmail.com>
 *
 */

import $ from "jquery";

export default class Slider {
  constructor(options) {
    const defaults = {
      manager: "", //slider head
      items: [], //classをつける要素,
      buttons: {
        //next : ,
        //prev : ,
        //dots : ,
      },
      disable_button_time: 1000,
      autoplay: true,
      autoplay_time: 6000,
      autoplay_delay: 1000,
      rub_delay: 100, //短すぎると正常にクラス付与できない
      load_duration: 1000,
      force_autoplay_time: 6000,
    };

    this._settings = $.extend(true, {}, defaults, options);

    //managerがない場合はなにもしない
    if (!this._settings.manager) return;

    this._index = 0;
    this._timer = "";
    this._caller = "";

    this._classes = {
      //current 現在表示中
      //old 前に表示されていたもの
      //other それ以外
      //rub currentに付与され、もう一度currentが付与されるタイミングでrub_delayの時間消えたあと、もう一度付与される
      slide_current: "slide-current",
      slide_old: "slide-old",
      slide_other: "slide-other",
      slide_rub: "slide-rub",

      //next currentの次
      //prev currentの前
      slide_next: "slide-next",
      slide_prev: "slide-prev",

      //n2c nextが押されたとき
      //p2c prevが押されたとき
      slide_n2c: "slide-n2c",
      slide_p2c: "slide-p2c",

      //currentから順に番号がふられる
      slide_num: "slide-num-",
    };

    //Add EventListener
    const _this = this;

    //next button
    if (this._settings.buttons.next) {
      this._settings.buttons.next.on("click", function () {
        _this.next();
      });
    }
    // //prev button
    if (this._settings.buttons.prev) {
      this._settings.buttons.prev.on("click", function () {
        _this.prev();
      });
    }
    // //dots button
    if (this._settings.buttons.dots) {
      this._settings.buttons.dots.on("click", function () {
        _this.goto($(this).index());
      });
    }

    $(window).on("load", function () {
      setTimeout(function () {
        if (_this._settings.manager.attr("data-slider-state") === "loaded")
          return;

        console.log("load");
        _this._settings.manager.attr("data-slider-state", "loaded");

        // //autoplay
        if (_this._settings.autoplay) {
          _this.auto();
        }
      }, _this._settings.load_duration);
    });

    if (_this._settings.force_autoplay_time) {
      setTimeout(function () {
        if (_this._settings.manager.attr("data-slider-state") !== "loaded") {
          console.log("force");
          _this._settings.manager.attr("data-slider-state", "loaded");

          // //autoplay
          if (_this._settings.autoplay) {
            _this.auto();
          }
        }
      }, _this._settings.force_autoplay_time);
    }
  }

  auto() {
    const _this = this;
    this._settings.manager.attr("data-slider-progress", "start");
    this._timer = setTimeout(function () {
      _this.next();
    }, this._settings.autoplay_time);
  }

  next() {
    this.caller = "next";
    if (this._index < this._settings.items[0].length - 1) {
      this._anime(this._index + 1);
    } else {
      this._anime(0);
    }
  }

  prev() {
    this.caller = "prev";
    if (this._index > 0) {
      this._anime(this._index - 1);
    } else {
      this._anime(this._settings.items[0].length - 1);
    }
  }

  goto(num) {
    this.caller = "goto";
    if (this._index === num) {
      return;
    }
    this._anime(num);
  }

  _is_animated() {
    return this._settings.manager.attr("data-slider-anime-state") === "animated"
      ? true
      : false;
  }

  _complete() {
    const _this = this;
    setTimeout(function () {
      _this._settings.manager.attr("data-slider-anime-state", "wait");
    }, this._settings.disable_button_time);

    if (this._timer) {
      clearTimeout(this._timer);
      this._settings.manager.attr("data-slider-progress", "wait");
      setTimeout(function () {
        _this.auto();
      }, this._settings.autoplay_delay);
    }
  }

  _remove_classes(elements) {
    const _this = this;
    elements.each(function () {
      $(this).removeClass(function (index, className) {
        var removeClassName = (className.match(/\bslide-\S+/g) || []).join(" ");
        removeClassName = removeClassName.replace(/slide-rub/g, "");
        return removeClassName;
      });
    });
  }

  _add_classes(elements, current_num) {
    const _this = this;
    const old_num = this._index;

    //add slide-old, slide-current
    elements.eq(old_num).addClass(this._classes.slide_old);
    elements.eq(current_num).addClass(this._classes.slide_current);

    //add slide-rub
    if (elements.eq(current_num).hasClass("slide-rub")) {
      elements.eq(current_num).removeClass("slide-rub");
      setTimeout(function () {
        elements.eq(current_num).addClass(_this._classes.slide_rub);
      }, _this._settings.rub_delay);
    } else {
      elements.eq(current_num).addClass(this._classes.slide_rub);
    }

    //add slide-other
    elements.each(function () {
      if (
        !(
          $(this).hasClass(_this._classes.slide_current) ||
          $(this).hasClass(_this._classes.slide_old)
        )
      ) {
        $(this).addClass(_this._classes.slide_other);
      }
    });

    //add slide-n2c, slide-p2c
    if (this._caller === "next") {
      elements.eq(old_num).addClass(this._classes.slide_n2c);
      elements.eq(current_num).addClass(this._classes.slide_n2c);
    } else if (this._caller === "prev") {
      elements.eq(old_num).addClass(this._classes.slide_p2c);
      elements.eq(current_num).addClass(this._classes.slide_p2c);
    } else if (this._caller === "goto") {
      if (old_num < current_num) {
        elements.eq(old_num).addClass(this._classes.slide_n2c);
        elements.eq(current_num).addClass(this._classes.slide_n2c);
      } else if (old_num > current_num) {
        elements.eq(old_num).addClass(this._classes.slide_p2c);
        elements.eq(current_num).addClass(this._classes.slide_p2c);
      }
    }

    //add slide-next, slide-prev
    var next_num = current_num + 1;
    if (next_num > elements.length - 1) {
      next_num = 0;
    }
    elements.eq(next_num).addClass(this._classes.slide_next);

    var prev_num = current_num - 1;
    if (prev_num < 0) {
      prev_num = elements.length - 1;
    }
    elements.eq(prev_num).addClass(this._classes.slide_prev);

    //add slide-num
    for (var i = 0; i < elements.length; i++) {
      var element_num = current_num + i;
      if (element_num > elements.length - 1) {
        element_num -= elements.length;
      }
      elements.eq(element_num).addClass(this._classes.slide_num + (i + 1));
    }
  }

  _anime(current_num) {
    if (this._is_animated()) {
      return;
    } else {
      this._settings.manager.attr("data-slider-anime-state", "animated");
    }

    this._settings.items.forEach(function (elements) {
      this._remove_classes(elements);
      this._add_classes(elements, current_num);
    }, this);

    this._index = current_num;
    this._complete();
  }
}
