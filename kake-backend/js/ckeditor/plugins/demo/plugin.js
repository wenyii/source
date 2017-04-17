(function(){
    var pluginName='demo';
    
    CKEDITOR.plugins.add(pluginName,{
        requires : 'dialog',
        icons : pluginName,
        hidpi : true,
        
        init : function(editor){

            //语言包
            var lang=editor.lang[pluginName];

            //载入dialog
            CKEDITOR.dialog.add(pluginName, this.path + 'dialogs/' + pluginName + '.js');

            //命令
            editor.addCommand(pluginName, new CKEDITOR.dialogCommand(pluginName));

            //生成toolbar插件按钮
            editor.ui.addButton(pluginName,{
                label: lang.toolbarTitle,
                command: pluginName,
                icon: this.path + 'icons/' + pluginName + '.png'
            });
        }
    });
})();