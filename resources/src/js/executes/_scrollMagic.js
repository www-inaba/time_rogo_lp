import $ from "jquery";
import ScrollMagic from "scrollmagic";
import Responsive from "../modules/_Responsive";

$(function () {
  var scroll = new ScrollMagic.Controller();
  new ScrollMagic.Scene({
    offset: 30,
  })
      .on("enter", function (e) {
        $("body").attr("data-position", "center");
        $(".c_header").addClass("__isActive");
      })
      .on("leave", function (e) {
        $("body").removeAttr("data-position");
        $(".c_header").removeClass("__isActive");
      })
      .addTo(scroll);
});
