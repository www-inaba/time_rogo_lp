/**
 * タブ表示
 *
 * data-tab-target = "foo" 開きたいタブの名前を指定
 * data-tab-contents = "foo" これが開く
 * data-tab-scroll-offset = "-100"
 *   new するときのオプションでも可。個別に指定したいときに使う。data-tab-contentsの所に記述する。
 *
 * @version 1.0
 * @author shota suzuki <pppottf1234@gmail.com>
 *
 */

import $ from 'jquery';

export default class Tab{
  
  constructor(options){
    const that = this;
    const defaults = {
      button: "[data-tab-target]",
      offset: 0,
      fade_speed: 1000,
      scroll_speed: 500,
      hash: true,
      toggle: false, //開いたタブをもう一度クリックしたときの挙動。trueだと閉じる。
      scroll: true,
      class_name: "__isActive",
    };
    
    this.settings = $.extend(true, {}, defaults, options);
    this.settings.button_no_bracket = this.settings.button.replace(/(\[|\])/g,'');
    
    //contentsの先頭以外非表示
    $("[data-tab-contents]").each((n,e)=>{
      $(e).children().not(":first").hide();
    });
    
    
    //ハッシュが必要な場合
    if(this._isHash()){
      const hash = location.hash;
      const $target = $("#" + hash.substr(1));

      $(window).on("load", function(){
        that.open($target.parent().attr("data-tab-contents"), $target.index(), true);
      });
    }
    
    //タブボタンクリック
    $(this.settings.button).each((n,e)=>{
      const target = $(e).attr(that.settings.button_no_bracket);
      
      $(e).children().on("click", function(){
        
        if(that.settings.toggle){
          if($(this).hasClass(that.settings.class_name)){
            that.close(target, $(this).index());
            return false;
          }
          
        }else{
          if($(this).hasClass(that.settings.class_name)){
            return false;
          }
        }
        
        that.open(target, $(this).index(), false);
        
        return false;
      });
    });
  }
  
  _isHash(){
    if(this.settings.hash){
      const hash = location.hash;
      if(!hash) return false;
      
      const $target = $("#" + hash.substr(1));
      if($target.length < 1) return false;
      
      return true;
    }
    
    return false;
  }

  open(target, num, step){
    const that = this;
    const $target_contents = $(`[data-tab-contents='${target}']`);
    const $target_contents_parents = $target_contents.parents("[data-tab-contents]");
    
    if($target_contents_parents.length > 0 && step){
      const objects = [];
      
      objects.push({
        'target': target,
        'num': num
      });
      
      let repeat = 0;
      let current_num = num;
      let current_target = target;
      
      while(repeat < $target_contents_parents.length){
        current_num = $(`[data-tab-contents='${current_target}']`).parent("div").index();
        current_target = $(`[data-tab-contents='${current_target}']`).parent("div").parent("[data-tab-contents]").attr("data-tab-contents");
        console.log(current_target);
        console.log(current_num);
        objects.push({
          'target': current_target,
          'num': current_num
        });
        repeat++;
      }
      
      objects.reverse();
      
      objects.forEach(function(o,n){
        that._open(o.target, o.num);
      });
      
      
    }else{
      this._open(target, num);
    }
  }
  
  close(target, num){
    this._close(target, num);
  }
  
  //private functions
  //コンテンツを開く
  _open(target, num){
    this._toggleClass(target, num);

    $(`[data-tab-contents='${target}']`).children().hide();
    $(`[data-tab-contents='${target}']`).children().eq(num).fadeIn(this.settings.fade_speed);
    
    if(this.settings.scroll){
      const offset = $(`[data-tab-contents='${target}']`).data("tabScrollOffset") || this.settings.offset;
      const pos = $(`[data-tab-contents='${target}']`).offset().top + offset;
      this._scroll(pos);
    }
  }
  
  _close(target, num){
    this._removeClass(target, num);
    $(`[data-tab-contents='${target}']`).children().eq(num).slideUp();
  }
  
  _removeClass(target, num){
    const that = this;
    const $button_parents = $(`[${this.settings.button_no_bracket}='${target}']`);

    $button_parents.each(function(n,e){
      $(e).children().removeClass(that.settings.class_name);
    });

    $(`[data-tab-contents='${target}']`).children().removeClass(that.settings.class_name);
  }
  
  _addClass(target, num){
    const that = this;
    const $button_parents = $(`[${this.settings.button_no_bracket}='${target}']`);

    $button_parents.each(function(n,e){
      $(e).children().eq(num).addClass(that.settings.class_name);
    });

    $(`[data-tab-contents='${target}']`).children().eq(num).addClass(that.settings.class_name);

  }
  
  //指定された位置までスクロール
  _scroll(pos){
    $("html,body").animate({scrollTop:pos}, this.settings.scroll_speed);
  }
  
  //押されたボタン以外からクラス削除して、押されたボタンにはクラス付与
  //コンテンツエリアの処理も同様
  _toggleClass(target, num){
    this._removeClass(target, num);
    this._addClass(target, num);

  }
  
}