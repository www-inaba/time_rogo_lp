/**
 * サイドバーナビゲーションをコンテンツとリンクさせてクラスをつける
 *
 *
 * コンテンツ
 * <div data-interlock-content="foo">
 * オフセットつける場合
 * <div data-interlock-content="foo" data-interlock-content-offset="-100">
 *
 * ナビ
 * <ul>
 *   <li data-interlock-nav="foo">
 *
 *
 * @version 1.0
 * @author shota suzuki <pppottf1234@gmail.com>
 *
 */

import $ from "jquery";
import ScrollMagic from "scrollmagic";
// import ScrollMagic from "ScrollMagic";
// import "ScrollMagic/scrollmagic/uncompressed/plugins/debug.addIndicators";

export default class InterlockNav {
  constructor(options) {
    if (!$("[data-interlock-content]").length) return false;

    const that = this;
    const smc = new ScrollMagic.Controller();
    const $contents = $("[data-interlock-content]");
    const $navs = $("[data-interlock-nav]");

    const defaults = {
      offset: -100,
      className: "__isActive",
    };

    this.settings = $.extend(true, {}, defaults, options);

    if (!$navs.eq(0).hasClass(that.settings.className)) {
      $navs.eq(0).addClass(that.settings.className);
    }

    $contents.each(function (n, e) {
      const targetName = $(e).attr("data-interlock-content");
      const $nav = $(`[data-interlock-nav='${targetName}']`);
      const offset =
        $(e).attr("[data-interlock-content-offset]") || that.settings.offset;

      let $prev_nav;
      if (n - 1 < 0) {
        $prev_nav = $navs.eq(0);
      } else {
        $prev_nav = $navs.eq(n - 1);
      }

      new ScrollMagic.Scene({
        triggerElement: e,
        triggerHook: "onLeave",
        offset: offset,
      })
        .on("enter", function (e) {
          $navs.removeClass(that.settings.className);
          $nav.addClass(that.settings.className);
        })
        .on("leave", function (e) {
          $navs.removeClass(that.settings.className);
          $prev_nav.addClass(that.settings.className);
        })
        .addTo(smc);
    });
  }
}
