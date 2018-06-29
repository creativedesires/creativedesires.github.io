// progress bar
 $(document).ready(function() {
      $('.progress .progress-bar').css("width",
                function() {
                    return $(this).attr("aria-valuenow") + "%";
                }
        )
    });

// Owl Carosel
 jQuery(document).ready(function($) {
              $('.fadeOut').owlCarousel({
                items: 1,
                animateOut: 'fadeOut',
                loop: true,
                margin: 0,
				autoplay:true,
				autoplayTimeout:5000,
				autoplayHoverPause:true,
				nav: true,
              });
            });
		
		

			
			$(".testi").owlCarousel({
			 items: 1,
			 loop: true,
			 margin: 30,
			 nav: true,
			 smartSpeed: 900,
			 navText: ["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"]
		});
		

	
// isotop

jQuery(window).on("load resize",function(e){
	var $container = $('.isotope'),
	colWidth = function () {
		var w = $container.width(), 
		columnNum = 1,
		columnWidth = 0;
	//Select what will be your porjects columns according to container widht
	if (w > 1040)     { columnNum  = 5; }  
	else if (w > 850) { columnNum  = 3; }  
	else if (w > 768) { columnNum  = 3; }  
	else if (w > 480) { columnNum  = 2; }
	else if (w > 300) { columnNum  = 1; }
	columnWidth = Math.floor(w/columnNum);

	//Default item width and height
	$container.find('.item').each(function() {
		var $item = $(this), 
		width = columnWidth,
		height = columnWidth;
		$item.css({ width: width, });
	}); 




	return columnWidth;
	},
	isotope = function () {
		$container.isotope({
			resizable: true,
			itemSelector: '.item',
			masonry: {
				columnWidth: colWidth(),
				gutterWidth: 10
			}
		});
	};
	isotope(); 


	// bind filter button click
	$('.isotope-filters').on( 'click', 'button', function() {
		var filterValue = $( this ).attr('data-filter');
		$container.isotope({ filter: filterValue });
	});

	// change active class on buttons
	$('.isotope-filters').each( function( i, buttonGroup ) {
		var $buttonGroup = $( buttonGroup );
		$buttonGroup.on( 'click', 'button', function() {
			$buttonGroup.find('.active').removeClass('active');
			$( this ).addClass('active');
		});
	}); 

});

// magnatic pop up
 $(document).ready(function() {
        $('.popup-gallery').magnificPopup({
          delegate: 'a',
          type: 'image',
          tLoading: 'Loading image #%curr%...',
          mainClass: 'mfp-img-mobile',
          gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0,1] // Will preload 0 - before current, and 1 after the current image
          },
          image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
            titleSrc: function(item) {
              return item.el.attr('title') + '';
            }
          }
        });
      });