$(function(){
	//$('.selectpicker,select').selectpicker();
	var v=0, c = $('.hidemap').parent().parent().attr('class');
	$('.hidemap').on('click', function(){
		if(v==0){
			$(this).next().hide().parent().parent().addClass('col-md-12').end().find('span').text('Show Map');
			v=1;
			//$('.list-view').parent().addClass('col-md-6');
		}else{
			//$(this).siblings('.maprow').find('> div:last').show().end().find('> div:first').removeClass().addClass(c).end().end().find('span').text('Hide Map');
			v=0;			
			//$('.list-view').parent().removeClass('col-md-6');
		}
	});
	
	$('.createAccount').on('click',function(){
		$('#account').modal('show')
	});
	$('.signin').on('click',function(){
		$('#signin').modal('show')
	});
	$('.contactDetails').on('click',function(){
		$('#contacts').modal('show')
	});
	$("input,select,textarea").not("[type=submit]").jqBootstrapValidation();
});

var map;
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(17.4833, 78.4167),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);
}

//google.maps.event.addDomListener(window, 'load', initialize);
