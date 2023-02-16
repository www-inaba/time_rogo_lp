import $ from "jquery";
import Responsive from "../modules/_Responsive";

$(function () {
  new Responsive({
    sp: function () {
      $('[data-button="accordion-button"]').next().hide();
      $('[data-button="accordion-button"]').removeClass("__isActive");
      $('[data-button="accordion-button"]').on("click.acbtn", function () {
        $(this).next().slideToggle();
        $(this).toggleClass("__isActive");
      });
    },
    pc: function () {
      $('[data-button="accordion-button"]').off("click.acbtn");
      $('[data-button="accordion-button"]').next().show();
    },
  });
});
