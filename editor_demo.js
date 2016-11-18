/**
 * Created by LiuJun on 2016/11/16.
 */
(function ($){
    'use strict'

    var template ='<input type="button" style="margin-left: inherit" value="居中">' +
        '<input type="button" style="margin-left: inherit" value="居左">' +
        '<input type="button" style="margin-left: inherit" value="底色">' +
        '<input type="button" style="margin-left: inherit" value="字号">' +
        '<input type="button" style="margin-left: inherit" value="首行缩进">';

    //浏览器判断
    var isIE = !!window.ActiveXObject;

    //一些特殊按键键值
    var KEY_ENTER = 13;
    var KEY_SPACE = 32;

    var isNumber = function (n) {
        return typeof n === 'number';
    };

    var toArray = function(obj,offset) {
        var args = [];

        if (isNumber(offset)) { // It's necessary for IE8
            args.push(offset);
        }
        return args.slice.apply(obj, args);
    };

    //键盘按下事件
    var keyPress = function (e) {
        e ? e.preventDefault() : window.event.preventDefault();
        var _this = this;
        //记录光标最近的p标签
        var textNode;

        //获取选择对象
        var selection = window.getSelection();
        // 如果是文本节点则先获取光标对象
        var range = selection.getRangeAt(0);
        // 获取当前光标的目标对象
        var startContainer = range.startContainer;
        // 获取光标位置
        var rangeStartOffset = range.startOffset;

        var keycode = e.which;

        //如果整个编辑区域的内容为空就给个p标签
        if(_this.children.length == 0){
            _this.appendChild(document.createElement('P'));
        }

        //处理将光标对象设置到p上
        if(startContainer.nodeName == 'DIV'){//如果是最外层div
            textNode = startContainer.children[0];
        }else if(startContainer.nodeName == '#text'){//如果在文字上
            textNode = startContainer.parentNode;
        }else {
            textNode = startContainer;
        }

        //非空格回车事件处理
        if(keycode != KEY_ENTER && keycode != KEY_SPACE) {
            //键盘输入值转成字符
            var char = String.fromCharCode(keycode);
            //处理p下只有一个br标签的情况
            if(textNode.childNodes.length > 0 && textNode.childNodes[0].nodeName == 'BR'){
                textNode.innerHTML = '';
            }
            //字符添加入节点
            textNode.innerText = (textNode.innerText.substring(0,rangeStartOffset) + char + textNode.innerText.substring(rangeStartOffset,textNode.innerText.length));
            //设置光标位置后移一格
            range.setStart(textNode.childNodes[0], rangeStartOffset + 1);
            //光标开始位置和结束位置重合
            range.collapse(true);
            // 清除选定对象的所有光标对象
            selection.removeAllRanges()
            // 插入新的光标对象
            selection.addRange(range)
            return;
        }

        //空格处理
        if(keycode == KEY_SPACE) {
            //处理p下只有一个br标签的情况
            if(textNode.childNodes.length > 0 && textNode.childNodes[0].nodeName == 'BR'){
                textNode.innerHTML = '&nbsp;';
            }else{
                //字符添加入节点
                textNode.innerHTML += '&nbsp;';
            }
            //设置光标位置后移一格
            range.setStart(textNode.childNodes[0], rangeStartOffset + 1);
            //光标开始位置和结束位置重合
            range.collapse(true);
            // 清除选定对象的所有光标对象
            selection.removeAllRanges()
            // 插入新的光标对象
            selection.addRange(range)
            return;
        }

        //回车处理
        if (keycode == KEY_ENTER) {
            var pNode = document.createElement('P');
            //如果光标在某一行末尾或者在p标签上或者内容区域为空，在p标签上表示这行没有文本
            if(startContainer.nodeName == 'P' || startContainer.length == rangeStartOffset || startContainer.nodeName == 'DIV'){
                // 文本节点在光标位置处插入新一行p标签
                pNode.appendChild(document.createElement("BR"));
                textNode.after(pNode);
                //设置光标开始位置
                range.setStart(pNode.childNodes[0], 0);
            }else if(rangeStartOffset > 0){//在文本当中
                //把文本后面的移到下一行
                pNode.append(startContainer.nodeValue.slice(rangeStartOffset, startContainer.length));
                //移除已经到第二行的文字
                startContainer.nodeValue = startContainer.nodeValue.substring(0,rangeStartOffset);
                textNode.after(pNode);
                //设置光标开始位置
                range.setStart(textNode.nextElementSibling.childNodes[0], 0);
            }else{//在文本开头
                //把文本前插入新一行
                pNode.appendChild(document.createElement("BR"));
                textNode.before(pNode);
                //设置光标开始位置
                range.setStart(textNode.childNodes[0], 0);
            }
            //光标开始位置和结束位置重合
            range.collapse(true);
            // 清除选定对象的所有光标对象
            selection.removeAllRanges()
            // 插入新的光标对象
            selection.addRange(range)
            return;
        }
    };

    //事件初始化
    var initEvent = function(element){
        var $element = $(element);

        $element.on('keypress', keyPress);

        $element.parent().find('[value="居中"]').click(function () {
            console.info(window.getSelection().focusNode.parentNode);
            window.getSelection().focusNode.parentNode.style = 'text-align:center;';
        });

        $element.parent().find('[value="居左"]').click(function () {
            console.info(window.getSelection().focusNode.parentNode);
            window.getSelection().focusNode.parentNode.style = 'text-align:left;';
        });

        $element.parent().find('[value="首行缩进"]').click(function () {
            console.info(window.getSelection().focusNode.parentNode);
            window.getSelection().focusNode.parentNode.style = 'text-indent:20px;';
        });
    }

    //UI初始化
    var initUI = function(element){
        var $element = $(element);

        $element.attr('contenteditable',true);
        $element.wrap('<div></div>');
        $element.before(template);
        $element.focus();

        $element.data('UI',1);
    }

    //Constrator
    var EditBox = function(element){
        //UI初始化
        initUI(element);

        //事件初始化
        initEvent(element);
    };

    $.extend(EditBox.prototype,{
        //销毁方法
        cleanUI: function (element) {
            var $element = $(element);
            var parent = $element.parent();
            $element.parent().before($element);
            parent.remove();
            $element.removeAttr('contenteditable');
            $element.removeData('UI');
        }
    })

   $.fn.editbox = function(options){
       //获取除了option参数以外的其他参数
       var args = toArray(arguments, 1);

       var $this = $(this),
           data = $this.data('editbox'),
           fn;

       if (!data) {
           $this.data('editbox', (data = new EditBox(this, options)));
       }

       if(!$this.data('UI')){
           initUI(this);
       }

       if (typeof options === 'string' && $.isFunction((fn = data[options]))) {
           fn.apply(data, args);
       }

        return this;
   };

   $.fn.editbox.Constructor = EditBox;

})(jQuery);