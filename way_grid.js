/**
 * way-grid
 * ==
 * [Summary]
 *  格子におけるブロックのリスト表示を最適化するシステム
 * [Howto]
 * 
 * [spec]
 * -カラム数固定の場合
 *  options = {
 *    column_count : [n or auto];
 *  }
 * 
 * - カラムサイズ固定の場合
 *  options = {
 *    column_width : [n-px or auto];
 *  }
 * 両方に"auto"を登録した場合は、第１コンテンツのサイズを元にcolumn_widthがセットされる。
 * 
 */
;$$way_grid = (function(){
  var __event = function(target, mode, func){
		if (typeof target.addEventListener !== "undefined"){target.addEventListener(mode, func, false);}
    else if(typeof target.attachEvent !== "undefined"){target.attachEvent('on' + mode, function(){func.call(target , window.event)});}
  };
  // [共通関数] URL情報分解
	var __urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };
  // 起動scriptタグを選択
  var __currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return __currentScriptTag = scripts[scripts.length-1].src;
  })();
  // [初期設定] 基本CSSセット(jsと同じ階層同じファイル名.cssを読み込む)
  var __initCSS = function(){
    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var modal_pathinfo = __urlinfo(__currentScriptTag);
    var css  = document.createElement("link");
    css.rel  = "stylesheet";
    var model_css = modal_pathinfo.dir + modal_pathinfo.file.replace(".js",".css");
    var query = [];
    for(var i in modal_pathinfo.query){
      query.push(i);
    }
    css.href = model_css +"?"+ query.join("");
    base.appendChild(css);
  };

  // elementのstyle情報を取得
  var __getStyle = function(e,s){
    if(!s){return}
    
		//対象項目チェック;
		if(typeof e == 'undefined' || e == null || !e){
			e = document.body;
		}
		//属性チェック;
		var d = '';
		if(typeof e.currentStyle != 'undefined'){
			d = e.currentStyle[__camelize(s)];
			if(d == 'medium'){
				d = "0";
			}
		}
		else if(typeof document.defaultView != 'undefined'){
			d = document.defaultView.getComputedStyle(e,'').getPropertyValue(s);
		}
		return d;
  };
  var __camelize = function(v){
		if(typeof(v)!='string'){return}
		return v.replace(/-([a-z])/g , function(m){return m.charAt(1).toUpperCase();});
	};

  // [共通関数] JS読み込み時の実行タイミング処理（body読み込み後にJS実行する場合に使用）
	var __construct = function(){
    switch(document.readyState){
      case "complete"    : new $$;break;
      case "interactive" : __event(window , "DOMContentLoaded" , function(){new $$});break;
      default            : __event(window , "load" , function(){new $$});break;
		}
  };
  
  var __options = {
    baseSelector : ".way-grid",
    column_count : "auto",
    column_width : 200,
    $ : null
  };


  var $$ = function(options){
    switch(document.readyState){
      case "complete"    : this.start(options);break;
      case "interactive" : __event(window , "DOMContentLoaded" , (function(options,e){this.start(options)}).bind(this,options));break;
      default            : __event(window , "load" , (function(options,e){this.start(options)}).bind(this,options));break;
		}
  };
  
  $$.prototype.start = function(options){
    // option初期設定
    this.replaceOptions(options);
    // 初期設定
    this.initBase();
    // 並べ設定
    this.setBases();
  };

  // [初期設定] インスタンス引数を基本設定(options)と入れ替える
  $$.prototype.replaceOptions = function(options){
    var default_options = __options;
    if(options){
      for(var i in options){
        default_options[i] = options[i];
      }
    }
    
    this.options = default_options;
  };

  // lists-parent部分の初期設定
  $$.prototype.initBase = function(){
    var bases = document.querySelectorAll(this.options.baseSelector);
    if(!bases){return;}
    for(var i=0; i<bases.length; i++){
      if(bases[i].getAttribute("data-way-grid-base")){continue;}
      bases[i].setAttribute("data-way-grid-base","1");
      this.initBoxes(bases[i]);
    }

    this.resize_flg = null;
    __event(window , "resize" , (function(){
      if(this.resize_flg !== null){
        clearTimeout(this.resize_flg);
        this.resize_flg = null;
      }
      this.resize_flg = setTimeout((function(){this.resize()}).bind(this),300);
    }).bind(this));
  };

  $$.prototype.resize = function(){

    if(!this.resize_count){
      this.resize_count = 1;
    }
    else{
      this.resize_count++;
    }

    var bases = document.querySelectorAll(this.options.baseSelector);
    if(!bases){return;}
    for(var i=0; i<bases.length; i++){
      this.setBoxes(bases[i]);
    }
  };


  // lists部分の初期設定
  $$.prototype.initBoxes = function(base){
    var boxes = base.querySelectorAll(":scope > *");
    if(!boxes){return};
    for(var i=0; i<boxes.length; i++){
      if(boxes[i].getAttribute("data-way-grid-box")){continue;}
      boxes[i].setAttribute("data-way-grid-box","1");
      // boxes[i].style.setProperty("position","absolute","");
    }
  };

  // 
  $$.prototype.setBases = function(){
    var bases = document.querySelectorAll(this.options.baseSelector);
    if(!bases){return;}
    for(var i=0; i<bases.length; i++){
      this.setBoxes(bases[i]);
    }
  };

  // 
  $$.prototype.setBoxes = function(base){
    if(!base){return;}
    var baseSize = this.getSize(base);
    
    if(this.options.column_width === "auto" && this.options.column_count !== "auto"){
      var column_count = this.options.column_count;
      var column_width = Math.floor(baseSize.w / column_count);
    }
    else if(this.options.column_width !== "auto" && this.options.column_count === "auto"){
      var column_width = this.options.column_width;
      var column_count = Math.floor(baseSize.w / column_width);
    }
    else if(this.options.column_width !== "auto" && this.options.column_count !== "auto"){
      var column_count = this.options.column_count;
      var column_width = this.options.column_width;
    }
    else if(this.options.column_width === "auto" && this.options.column_count === "auto"){
      console.log("Error !!!");
    }
    else{
      console.log("Error : way-grid (options column_count,column_width is fail.");
      return;
    }

    var boxes = base.querySelectorAll(":scope > *");
    var cols = 0;
    // var rows = 0;
    var bottom_element = [];
    for(var i=0; i<boxes.length; i++){
      boxes[i].style.setProperty("width" , column_width + "px" , "");
      
      // 最上段処理
      if(bottom_element.length < column_count){
        var top = 0;
        boxes[i].style.setProperty("top"  , top  + "px" , "");
        boxes[i].setAttribute("data-top" , top);

        var left = column_width * cols;
        boxes[i].style.setProperty("left" , left + "px" , "");
        bottom_element[cols] = boxes[i];
        cols++;
        if(cols > column_count -1){
          cols = 0;
        }
      }
      // 次段以降の処理
      else{
        var bottom_datas = this.getMinPositions(bottom_element);
        var top = bottom_datas.min_pos;
        boxes[i].style.setProperty("top"  , top  + "px" , "");
        boxes[i].setAttribute("data-top" , top);

        var left = column_width * bottom_datas.min_col;
        boxes[i].style.setProperty("left" , left + "px" , "");

        bottom_element[bottom_datas.min_col] = boxes[i];
      }
    }
  }

  // get-size
  $$.prototype.getSize = function(elm){
    if(elm){
      return {
        w : elm.offsetWidth,
        h : elm.offsetHeight
      };
    }
    else{
      return null;
    }
  };

  // 最下部の位置情報を取得
  $$.prototype.getMinPositions = function(elms){
    if(!elms || !elms.length){return;}
    var datas = {
      min_col : null,
      min_pos : null
    };
    for(var i=0; i<elms.length; i++){
      var top = Number(elms[i].getAttribute("data-top"));
      var bottom_pos = top + elms[i].offsetHeight;
      if(datas.min_pos === null || datas.min_pos > bottom_pos){
        datas.min_pos = bottom_pos;
        datas.min_col = i;
      }
    }
    return datas;
  };


  __initCSS();
  return $$;
})();