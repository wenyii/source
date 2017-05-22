( function() {
    var pluginName = 'demo';
    
    CKEDITOR.dialog.add(pluginName,function(editor){
        
        var lang = editor.lang[pluginName];
        
        return {
            title: lang.tabTitle,
            minWidth: 300,
            minHeight: 200,
            buttons: [CKEDITOR.dialog.cancelButton],
            contents: [{
                id: "tab1",
                label: "tab1Name",
                title: "tab1Name",
                expand: !0,
                elements: [{
                    type: "html",
                    html: '内容测试'
                }]
            }],
            onOk : function() {
                // editor.insertHtml("编辑器追加内容");
            },
            onLoad: function() {
                // 页面弹出后要执行的代码
            },
            resizable: CKEDITOR.DIALOG_RESIZE_NONE
        };
    });
}());