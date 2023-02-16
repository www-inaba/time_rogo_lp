/**
 * メールバリデーション
 *
 * recaptchaを使用する場合は、htmlに下記が必要
 *
 * <script src="https://www.google.com/recaptcha/api.js?render=reCAPTCHA_site_key"></script>
 * <input type="hidden" name="recaptchaResponse" id="recaptchaResponse">
 *
 * @version 1.6
 *
 * 【更新履歴】
 * 確認用メールアドレスと入力されたメールアドレスが一致するか確認する ( data-form-same="email-input" )
 * テキスト入力のグループ化を追加 ( data-form-require="text-group-input" )
 * ローカルではrecaptchaを無効にする
 * data-form-require="checkbox"を追加
 * data-form-require="file-input"　を追加して、ファイル添付を必須にする機能を追加
 * data-form-nameにdata-form-offsetを追加して、スクロールポジションを選べるように変更
 * メールアドレス形式をチェック出来るように変更
 *
 * @author shota suzuki <pppottf1234@gmail.com>
 *
 */

import $ from "jquery";

export default class EmailValidation {
  constructor(options) {
    const that = this;
    const defaults = {
      form: $("[data-form-name='form']"),
      confirm: $("[data-form-button='confirm']"),
      modify: $("[data-form-button='modify']"),
      accept: $("[data-form-button='accept']"),
      submit: $("[data-form-button='submit']"),

      offset: 0,

      file: {
        input: $("[data-form-file='use-api']"),
        detail: $("[data-form-file='detail']"),
        error: $("[data-form-file='error']"),
        uploads: [],
      },

      require: [
        //text or textarea
        {
          type: "text",
          input: $("[data-form-require='text-input']"),
          error: $("[data-form-require='text-error']"),
        },
        //select
        {
          type: "select",
          input: $("[data-form-require='select-input']"),
          error: $("[data-form-require='select-error']"),
        },
        {
          type: "file",
          input: $("[data-form-require='file-input']"),
          error: $("[data-form-require='file-error']"),
        },
        {
          type: "checkbox",
          input: $("[data-form-require='checkbox-input']"),
          error: $("[data-form-require='checkbox-error']"),
        },
        {
          type: "textgroup",
          input: $("[data-form-require='text-group-input']"),
          error: $("[data-form-require='text-group-error']"),
        },
      ],

      check: [
        {
          type: "email",
          input: $("[data-form-check='email-input']"),
          error: $("[data-form-check='email-error']"),
        },
      ],

      same: [
        {
          type: "email",
          input: $("[data-form-same='email-input']"),
          error: $("[data-form-same='email-error']"),
        },
      ],

      recaptcha: {
        site_key: null,
        action: "submit",
        dom_id: "recaptchaResponse",
        excludes: ["localhost:8000", "localhost:8080"],
      },

      currentHost: location.host,
    };

    this.settings = $.extend(true, {}, defaults, options);

    //fileApi bind
    if (this.settings.file.input.length !== 0) {
      this.settings.file.detail.hide();
      this.settings.file.error.hide();

      this.settings.file.input.each(function (i, e) {
        $(this).on("change", function (e) {
          const name = e.target.files[0]["name"];
          const size = e.target.files[0]["size"];
          const convert_size = that.size_convert(size);

          const text = that.esc(`【${name}】${convert_size}`);

          that.settings.file.detail.eq(i).text(text);
          that.settings.file.detail.eq(i).show();
          that.settings.file.uploads[i] = size;
        });
      });
    }

    //error domは最初は非表示
    this.settings.require.forEach((e) => {
      e.error.hide();
    });
    this.settings.check.forEach((e) => {
      e.error.hide();
    });
    this.settings.same.forEach((e) => {
      e.error.hide();
    });

    //acceptボタンがある場合は最初は送信、確認ボタンを押せない
    if (this.settings.accept.length !== 0) {
      this.settings.submit.prop("disabled", true);
      if (this.settings.confirm.length !== 0) {
        this.settings.confirm.prop("disabled", true);
      }

      this.settings.accept.on("click", function () {
        if ($(this).prop("checked")) {
          that.settings.submit.prop("disabled", false);
          if (that.settings.confirm.length !== 0) {
            that.settings.confirm.prop("disabled", false);
          }
        } else {
          that.settings.submit.prop("disabled", true);
          if (that.settings.confirm.length !== 0) {
            that.settings.confirm.prop("disabled", true);
          }
        }
      });
    }

    //confirmボタンがある場合は最初は送信、修正ボタンを非表示
    if (this.settings.confirm.length !== 0) {
      this.settings.submit.hide();
      this.settings.modify.hide();

      this.settings.confirm.on("click", function () {
        that.scroll();

        const valid = that.valid();

        if (!valid) {
          return false;
        }

        that.show("confirm");
        $(this).hide();
        that.settings.modify.show();
        that.settings.submit.show();
      });
    }

    //modify
    if (this.settings.modify.length !== 0) {
      this.settings.modify.on("click", function () {
        that.scroll();

        that.show("modify");
        $(this).hide();
        that.settings.submit.hide();
        that.settings.confirm.show();
      });
    }

    //submit
    this.settings.submit.on("click", function () {
      const valid = that.valid();

      if (!valid) {
        that.scroll();
        return false;
      }

      $(this).prop("disabled", true);
      that.send();
    });
  }

  valid() {
    const that = this;
    const $submit = this.settings.submit;
    const $form = this.settings.form;
    const require = this.settings.require;
    const check = this.settings.check;
    const same = this.settings.same;

    let results = [];
    let valid = false;

    //rquire
    require.forEach((e) => {
      //require text or textarea
      if (e.type === "text") {
        e.input.each(function (i, el) {
          if (!$(el).val()) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }

      //require select
      if (e.type === "select") {
        e.input.each(function (i, el) {
          if (!$(el).val()) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }

      //require file
      if (e.type === "file") {
        e.input.each(function (i, el) {
          if (el.files.length < 1) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }

      //require checkbox
      if (e.type === "checkbox") {
        e.input.each(function (i, el) {
          const count = $(this).find("input:checkbox:checked").length;

          if (count < 1) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }

      //require textgroup
      if (e.type === "textgroup") {
        e.input.each(function (i, el) {
          const inputs = $(this).find("input");
          const tmpResults = [];
          inputs.each(function (i, el) {
            if (!$(el).val()) {
              tmpResults.push(false);
            } else {
              tmpResults.push(true);
            }
          });

          const tmpValid = tmpResults.every((val) => {
            return val;
          });

          if (!tmpValid) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }

      //require radio
      //初期値で十分??
    });

    //check
    check.forEach((e) => {
      if (e.type === "email") {
        e.input.each(function (i, el) {
          if (
            !$(el)
              .val()
              .match(/.+@.+\..+/)
          ) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }
    });

    //整合性の確認
    same.forEach((e) => {
      if (e.type === "email") {
        e.input.each(function (i, el) {
          if ($(el).val() !== $("input[name='email']").val()) {
            e.error.eq(i).show();
            $(this).addClass("__error");
            results.push(false);
          } else {
            e.error.eq(i).hide();
            $(this).removeClass("__error");
            results.push(true);
          }
        });
      }
    });

    //filesize
    if (that.settings.file.uploads.length > 0) {
      that.settings.file.uploads.forEach((e, i) => {
        if (e > 1024 * 1024 * 10) {
          //10MB
          that.settings.file.error.eq(i).show();
          results.push(false);
        } else {
          that.settings.file.error.eq(i).hide();
          results.push(true);
        }
      });
    }

    valid = results.every((val) => {
      return val;
    });

    return valid;
  }

  scroll() {
    const offset =
      $("[data-form-offset]").data("formOffset") || this.settings.offset;
    const pos = this.settings.form.offset().top + offset;
    $("html,body").animate({ scrollTop: pos }, 1000);
  }

  send() {
    const that = this;

    if (
      that.settings.recaptcha.site_key &&
      that.settings.recaptcha.excludes.indexOf(that.settings.currentHost) < 0
    ) {
      grecaptcha.ready(function () {
        grecaptcha
          .execute(that.settings.recaptcha.site_key, {
            action: that.settings.recaptcha.action,
          })
          .then(function (token) {
            var recaptchaResponse = document.getElementById(
              that.settings.recaptcha.dom_id
            );
            recaptchaResponse.value = token;
            that.settings.form.submit();
          });
      });
    } else {
      this.settings.form.submit();
    }
  }

  show(mode) {
    const $form = this.settings.form;

    //confirm
    if (mode === "confirm") {
      //text
      $form.find('input[type="text"]').prop("readonly", true);

      //textarea
      $form.find("textarea").prop("readonly", true);
    }

    //modify
    if (mode === "modify") {
      //text
      $form.find('input[type="text"]').prop("readonly", false);

      //textarea
      $form.find("textarea").prop("readonly", false);
    }
  }

  //escape html
  esc(string) {
    if (typeof string !== "string") {
      return string;
    }
    return string.replace(/[&'`"<>]/g, function (match) {
      return {
        "&": "&amp;",
        "'": "&#x27;",
        "`": "&#x60;",
        '"': "&quot;",
        "<": "&lt;",
        ">": "&gt;",
      }[match];
    });
  }

  size_convert(bite, decimal) {
    decimal = decimal ? Math.pow(10, decimal) : 10;
    var kiro = 1024;
    var size = bite;
    var unit = "B";
    var units = ["B", "KB", "MB", "GB", "TB"];
    for (var i = units.length - 1; i > 0; i--) {
      if (bite / Math.pow(kiro, i) > 1) {
        size = Math.round((bite / Math.pow(kiro, i)) * decimal) / decimal;
        unit = units[i];
        break;
      }
    }
    return String(size) + " " + unit;
  }
}
