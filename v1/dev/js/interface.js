define(["jquery", "../../../../../../_common/js/spon/v0/util/interface"], function($, mInterface) {

    var doc, isFirst;

    function init(){
        doc = $("body");
        isFirst = true;
    }

    function setSizeIframe(addPix){
//      console.log("setIframeSize, arg: " + addPix);
        addPix = addPix || 0;
        addPix += 18;


//        console.log(">>" + (doc.outerHeight() + addPix) +  "px");

        mInterface.resizeIFrame({
            duration : 0,
//          width : 100,
            height : doc.outerHeight() + addPix
        });
    }

    function count(caller){

        caller = "*" + caller || "";        //noBuild
//      console.log("count() " + caller);


        if(!isFirst){
            mInterface.reCountPage();
        } else {
            console.log("-> keine initiale zählung -> diese erfolgt über den artikel");
            isFirst = null;
        }
    }

    return {
        init: init,
        setSize: setSizeIframe,
        count: count
    };
});