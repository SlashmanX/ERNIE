(function($){
    $.fn.extend({ 
        //plugin name - animatemenu
        jsticky: function(options) {
 
            //Settings list and the default values
            var defaults = {
                marginTop: 0,
            };
             
            var options = $.extend(defaults, options);
         
            return this.each(function() {
                var o = options;
                 
                //Assign current element to variable, in this case is UL element
                var obj = $(this);   


	var offset = obj.offset();
	var topOffset = offset.top;
	var marginTop = obj.css("marginTop");
	var marginTopNum = parseInt(marginTop);
	
	var diff = topOffset - marginTopNum
	

	var offset = obj.offset();
				var topOffset = offset.top;
				var leftOffset = offset.left;
				var marginTop = obj.css("marginTop");
				var marginLeft = obj.css("marginLeft");
	

				$(window).scroll(function() { 
					var WindowScrollTop = $(window).scrollTop();
					var scrollTop = WindowScrollTop + o.marginTop;
		
					if (scrollTop >= topOffset){

						obj.animate({
						marginTop: o.marginTop,
						marginLeft: marginLeft,
						position: "fixed"
						}, 1500);
					}
		
					if (scrollTop < topOffset){

						obj.css({
							marginTop: marginTop,
							marginLeft: marginLeft,
							position: 'absolute',
						});
					}
				});

                 
            });
        }
    });
})(jQuery);