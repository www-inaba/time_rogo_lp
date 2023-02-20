import $ from "jquery";
import { gsap } from "gsap";

$(function () {
  const wait = 0;
  const force = 8000;

  const cookies = document.cookie;
  const cookies_array = cookies.split(";");
  let has_cookie = false;

  cookies_array.forEach(function (o, n) {
    const c_array = o.split("=");
    if (c_array[0].replace(" ", "") === "loaded") {
      has_cookie = true;
    }
  });

  if (!has_cookie) {
    $(window).on("load", function () {
      gsap.to(".p_loading", {
        opacity: 0,
        duration: 0.5,
        delay: 6,
      });
      document.cookie = "loaded=true; path=/; max-age=86400";
    });

    setTimeout(function () {
      $(".p_loading").hide();
    }, force);
  } else {
    $(".p_loading").hide();
  }

  $("body").attr("data-load-state", "start");
  $(window).on("load", function () {
    if ($("body").prop("data-load-state") === "complete") return;

    $("body").attr("data-load-state", "end");
    setTimeout(function () {
      $("body").attr("data-load-state", "complete");
    }, wait);
  });

  setTimeout(function () {
    if ($("body").prop("data-load-state") === "complete") return;
    $("body").attr("data-load-state", "complete");
  }, force);
});
