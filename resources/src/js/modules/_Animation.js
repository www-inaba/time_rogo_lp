/**
 * data属性でアニメーション操作する
 *
 * addClass
 *   data-anime-group = "parent", "child"
 *   data-anime-delay = "*" 単位はms
 *   data-anime-trigger = "onLoad", "onEnter", "onLeave"
 *   data-anime-offset = "*" 単位はpx //発火タイミングのオフセット
 *
 * infinite
 *   data-anime-direction = "ltr", "rtl", "up", "down" 動く向き
 *   data-anime-clone = "*" domを複製する個数
 *   data-anime-duration = "*" 単位はs //この秒数かけてアニメーション
 *
 * parallax
 *   data-anime-direction = "up", "down", "ltr", "rtl" 動く向き
 *   data-anime-velocity = "*" //動きの速さ
 *
 * liquidSVG //svg path限定
 *   data-anime-points = "12",
 *   data-anime-reduce-radius =  "5%", // %指定がない場合はpx解釈 最大サイズからどれくらい小さくするか
 *   data-anime-min-duration = "0.75", //最大半径から最小半径に到達する時間
 *   data-anime-max-duration = "1.5" //最大半径から最小半径に到達する時間
 *
 * morphSVG
 *
 * 【更新履歴】
 * 付与されるクラス名を.u_anime-startに変更
 * infiniteに縦方向を追加
 *
 * @version 1.1
 * @author shota suzuki <pppottf1234@gmail.com>
 *
 */

import $ from "jquery";
import ScrollMagic from "scrollmagic";
import { gsap } from "gsap";

export default class Animation {
  constructor(options) {
    const that = this;
    const defaults = {
      mode: "addClass", // or 'infinite', 'parallax', 'liquidSVG', 'morphSVG'
      //      '$element': $("[data-anime='addClass']"), //指定しなければmodeと同じ名前でセットされる

      //use addClass
      force: 10000, // onLoadのときにloadが終わらない場合には、10000msで強制的に発火
      wait: 0, //発火するまでの待ち時間 ロード画面のアニメーションがある場合に使う

      offset: 0, //アニメーションするタイミングのオフセット
      trigger: "onEnter", //アニメーションするタイミングのオフセット

      //use infinite
      duration: 5,
      clone: 1,

      //use parallax
      velocity: 50,

      //use infinite, parallax
      direction: "rtl", //or 'ltr', 'up', 'down'

      //use liquidSVG
      points: 12,
      reduce_radius: "10%",
      min_duration: 1.5,
      max_duration: 3,
    };

    this.settings = $.extend(true, {}, defaults, options);

    //$elementの指定がない場合、modeの名前と同じものをセット
    if (!this.settings.$element) {
      this.settings.$element = $("[data-anime='" + this.settings.mode + "']");
    }

    switch (this.settings.mode) {
      case "addClass":
        this.addClass();
        break;

      case "infinite":
        this.infinite();
        break;

      case "parallax":
        this.parallax();
        break;

      case "liquidSVG":
        this.liquidSVG();
        break;

      case "morphSVG":
        this.morphSVG();
        break;

      default:
        console.log(
          "modeは、addClass, infinite, parallax, liquidSVG, morphSVGから選択してください。"
        );
    }
  }

  addClass() {
    const that = this;
    const smc = new ScrollMagic.Controller();

    const start = (e, wait = that.settings.wait) => {
      if ($(e).hasClass("u_anime-start")) {
        return;
      }

      let delay = $(e).data("animeDelay") || 0;
      delay += wait;

      setTimeout(() => {
        $(e).addClass("u_anime-start");
      }, delay);
    };

    this.settings.$element.each(function (n, e) {
      const trigger_hook = $(e).data("animeTrigger") || "onEnter";

      if (trigger_hook === "onLoad") {
        $(window).on("load", function () {
          //group
          if ($(e).attr("data-anime-group") === "parent") {
            $(e)
              .find("[data-anime-group='child']")
              .each(function (n, e) {
                start(e);
              });

            //singlar
          } else {
            start(e);
          }
        });

        setTimeout(() => {
          //group
          if ($(e).attr("data-anime-group") === "parent") {
            $(e)
              .find("[data-anime-group='child']")
              .each(function (n, e) {
                start(e, 0);
              });

            //singlar
          } else {
            start(e, 0);
          }
        }, that.settings.force);
      } else {
        const offset = $(e).data("animeOffset") || that.settings.offset;

        new ScrollMagic.Scene({
          triggerElement: e,
          reverse: false,
          triggerHook: trigger_hook,
          offset: offset,
        })
          .on("enter", function () {
            //group
            if ($(e).attr("data-anime-group") === "parent") {
              $(e)
                .find("[data-anime-group='child']")
                .each(function (n, e) {
                  start(e);
                });
              //singlar
            } else {
              start(e);
            }
          })
          .addTo(smc);
      }
    });
  }

  infinite() {
    const that = this;

    this.settings.$element.each(function (n, e) {
      const elements = [e];
      const num = $(e).data("animeClone") || that.settings.clone;
      const direction = $(e).data("animeDirection") || that.settings.direction;
      const duration = $(e).data("animeDuration") || that.settings.duration;
      let fromPosX = 0;
      let fromPosY = 0;
      let toPosX = 0;
      let toPosY = 0;

      switch (direction) {
        case "rtl":
          toPosX = "-100%";
          break;

        case "ltr":
          fromPosX = "-100%";
          break;

        case "up":
          toPosY = "-100%";
          break;

        case "down":
          fromPosY = "-100%";
          break;

        default:
          console.log(
            "data-anime-directionはrtl,ltr,up,downから選択してください。"
          );
          toPosX = "-100%";
          break;
      }

      for (let i = 0; i < num; i++) {
        const clone = $(e).clone();
        elements.push(clone.get(0));
        $(elements[i]).after(clone);
      }

      elements.forEach(function (e, n) {
        gsap.fromTo(
          e,
          {
            x: fromPosX,
            y: fromPosY,
          },
          {
            x: toPosX,
            y: toPosY,
            duration: duration,
            repeat: -1,
            ease: "none",
          }
        );
      });
    });
  }

  parallax() {
    const that = this;

    this.settings.$element.each(function (n, e) {
      const direction = $(e).data("animeDirection") || that.settings.direction;
      const velocity = $(e).data("animeVelocity") || that.settings.velocity;
      const vector = {};

      switch (direction) {
        case "up":
          vector.x = 0;
          vector.y = -velocity;
          break;

        case "down":
          vector.x = 0;
          vector.y = velocity;
          break;

        case "rtl":
          vector.x = -velocity;
          vector.y = 0;
          break;

        case "ltr":
          vector.x = velocity;
          vector.y = 0;
          break;

        default:
          console.log(
            "data-anime-directionはup,down,rtl,ltrから選択してください。"
          );
          vector.x = 0;
          vector.y = -velocity;
          break;
      }

      const smc = new ScrollMagic.Controller();

      new ScrollMagic.Scene({
        triggerElement: e,
        duration: "100%",
        triggerHook: "onEnter",
      })
        .on("progress", function (event) {
          const progress = Math.round(event.progress * 1000) / 1000;
          const toPos = {
            x: vector.x * progress,
            y: vector.y * progress,
          };

          gsap.to(e, {
            x: toPos.x,
            y: toPos.y,
            duration: 1,
          });
        })
        .addTo(smc);
    });
  }

  liquidSVG() {
    const that = this;
    this.settings.$element.each(function (n, e) {
      const viewbox = $(e).closest("svg").attr("viewBox").split(" ");
      const width = viewbox[2];
      const height = viewbox[3];
      const max_radius = Math.min(width, height) / 2;
      let reduce_radius =
        $(e).data("animeReduceRadius") || that.settings.reduce_radius;

      let min_radius = 0;

      if (typeof reduce_radius !== "string") {
        reduce_radius = String(reduce_radius);
      }
      if (reduce_radius.slice(-1) === "%") {
        min_radius =
          (max_radius * (100 - reduce_radius.replace("%", ""))) / 100;
      } else {
        min_radius = max_radius - reduce_radius;
      }

      createBlob({
        element: e,
        num_points: $(e).data("animePoints") || that.settings.points,
        center_x: width / 2,
        center_y: height / 2,
        min_radius: min_radius,
        max_radius: max_radius,
        min_duration:
          $(e).data("animeMinDuration") || that.settings.min_duration,
        max_duration:
          $(e).data("animeMaxDuration") || that.settings.max_duration,
      });
    });

    function createBlob(options) {
      var points = [];
      var path = options.element;
      var slice = (Math.PI * 2) / options.num_points;
      var startAngle = random(Math.PI * 2);

      var tl = gsap.timeline({
        onUpdate: update,
      });

      for (var i = 0; i < options.num_points; i++) {
        var angle = startAngle + i * slice;
        var duration = random(options.min_duration, options.max_duration);

        var point = {
          x: options.center_x + Math.cos(angle) * options.min_radius,
          y: options.center_y + Math.sin(angle) * options.min_radius,
        };

        var tween = gsap.to(point, {
          x: options.center_x + Math.cos(angle) * options.max_radius,
          y: options.center_y + Math.sin(angle) * options.max_radius,
          repeat: -1,
          duration: duration,
          yoyo: true,
          ease: "power1.inOut",
        });

        tl.add(tween, -random(duration));
        points.push(point);
      }

      options.tl = tl;
      options.points = points;

      function update() {
        path.setAttribute("d", cardinal(points, true, 1));
      }

      return options;
    }

    function cardinal(data, closed, tension) {
      if (data.length < 1) return "M0 0";
      if (tension == null) tension = 1;

      var size = data.length - (closed ? 0 : 1);
      var path = "M" + data[0].x + " " + data[0].y + " C";

      for (var i = 0; i < size; i++) {
        var p0, p1, p2, p3;

        if (closed) {
          p0 = data[(i - 1 + size) % size];
          p1 = data[i];
          p2 = data[(i + 1) % size];
          p3 = data[(i + 2) % size];
        } else {
          p0 = i == 0 ? data[0] : data[i - 1];
          p1 = data[i];
          p2 = data[i + 1];
          p3 = i == size - 1 ? p2 : data[i + 2];
        }

        var x1 = p1.x + ((p2.x - p0.x) / 6) * tension;
        var y1 = p1.y + ((p2.y - p0.y) / 6) * tension;

        var x2 = p2.x - ((p3.x - p1.x) / 6) * tension;
        var y2 = p2.y - ((p3.y - p1.y) / 6) * tension;

        path +=
          " " + x1 + " " + y1 + " " + x2 + " " + y2 + " " + p2.x + " " + p2.y;
      }

      return closed ? path + "z" : path;
    }

    function random(min, max) {
      if (max == null) {
        max = min;
        min = 0;
      }
      if (min > max) {
        var tmp = min;
        min = max;
        max = tmp;
      }
      return min + (max - min) * Math.random();
    }
  }

  morphSVG() {
    const that = this;

    this.settings.$element.each(function (n, e) {
      const base_element = e;
      const base_d = $(e).attr("d");
      const siblings = $(e).siblings();
      siblings.hide();
      const tl = gsap.timeline({ repeat: -1 });
      const duration = $(e).data("animeDuration") || that.settings.duration;
      siblings.each(function (n, e) {
        const d = $(e).attr("d");
        tl.to(base_element, {
          attr: {
            d: d,
          },
          duration: duration,
          ease: "power1.inOut",
        });

        // 最後の要素だったら最初の形に戻す
        if (n === siblings.length - 1) {
          tl.to(base_element, {
            attr: {
              d: base_d,
            },
            duration: duration,
            ease: "power1.inOut",
          });
        }
      });
    });
  }
}
