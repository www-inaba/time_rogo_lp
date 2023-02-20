/**
 * breakpointでfunctionを実行
 *
 * @version 1.0
 * @author shota suzuki <pppottf1234@gmail.com>
 *
 */

import $ from "jquery";

export default class Responsive {
  constructor(options) {
    const that = this;
    const defaults = {
      breakpoint: 768,
      sp: function () {},
      pc: function () {},
    };

    this.settings = $.extend(true, {}, defaults, options);

    const mql = window.matchMedia(
      "screen and (max-width:" + that.settings.breakpoint + "px)"
    );

    function checkBreakPoint(mql) {
      if (mql.matches) {
        if (that.settings.sp) {
          that.settings.sp();
        }
      } else {
        if (that.settings.pc) {
          that.settings.pc();
        }
      }
    }
    mql.addListener(checkBreakPoint);
    checkBreakPoint(mql);
  }
}
