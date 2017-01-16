var maxSecNum = 3;
var activeSec = 0;
var activePage = 0;
var maxPageNum = 4;

var isTransiting = false;

// Hash control
var hashCtrl = function() {
	var hash = location.hash;
	hash = hash.replace('#','');

	if(!hash) hash = 'section0';
	if(!(/section/.test(hash)))
		return;
		
	activeSec = +hash.substr(7);
	isTransiting = true;
	setTimeout(function() {
		if(isTransiting) isTransiting = false;
	},900);
	getById('fullpage').style.transform = "translate3d(0,-"+activeSec+"00%,0)";
	getById('fullpage').style.webkitTransform = getById('fullpage').style.transform;
	for(var i = 0; i < maxSecNum; i++) {
		getById('nav-btn-'+i).className = '';
	}
	getById('nav-btn-'+activeSec).className = 'active';
};
window.onhashchange = hashCtrl;
hashCtrl();




function getById(id) {
	return document.getElementById(id);
}


// scroll page, section control
var pageCtrl = function(e) {
	var event;
	if(e.keyCode && (e.keyCode == 38 || e.keyCode == 33)){
		event = 'UP';
	}else if(e.keyCode && (e.keyCode == 40 || e.keyCode == 34) )
		event = 'DOWN';

	if(e.wheelDeltaY && e.wheelDeltaY > 100)
		event = 'UP';
	else if(e.wheelDeltaY && e.wheelDeltaY <-100)
		event = 'DOWN';

	if(isTransiting) return;
		
	pageGo(event);

};

function pageGo(direction) {
	if(activeSec == 1){
		var nextSection = false;
		var prevSection = false;
		if(direction=='UP'){ 	//往上滚
			(activePage > 0 )? activePage -- : (prevSection = true);
		}else if(direction == 'DOWN'){ //往下滚
			(activePage < maxPageNum - 1 )? activePage ++ : (nextSection = true);
		}
		if(!nextSection && !prevSection){
			return jump(activePage);
		}			
	}
	if(direction=='UP'){ 	//往上滚
		activeSec = (activeSec > 0 )? activeSec - 1 : activeSec;
	}else if(direction=='DOWN'){ //往下滚
		activeSec = (activeSec < maxSecNum - 1 )? activeSec + 1 : activeSec;
	}
	location.hash = '#section'+activeSec;
}
document.body.addEventListener("DOMMouseScroll", pageCtrl);
document.body.addEventListener("mousewheel", pageCtrl);

// bind keyboard event to scroll
document.addEventListener('keydown', pageCtrl);

var starty;
var endy;
document.addEventListener('touchstart',function(e) {
	e.preventDefault();
	e.stopPropagation();
	starty = e.touches[0].pageY;
});
document.addEventListener('touchend',function(e) {
	e.preventDefault();
	e.stopPropagation();
	endy = e.changedTouches[0].pageY;
	if(endy - starty < -10){
		pageGo('DOWN');
	}else if(endy - starty > 10){
		pageGo('UP');
	}
});
$('#expandBtn, ul.navbar-nav li a').on('touchend',function(e) {
	e.preventDefault();
	e.stopPropagation();
	$(this).trigger('click');
	location.hash = $(this).attr('href'); //a hack for touch screen
});


$(getById('fullpage')).on('webkitTransitionEnd',function(e) {
	isTransiting = false;
});

// iphone ctrl
function jump(pageid) {
	var btns = document.getElementsByClassName('guide-btn');
	for(var i = 0; i < btns.length; i++) {
		btns[i].className = "guide-btn";
	}
	btns[pageid].className = "guide-btn active";
	$('.guide-text').removeClass('active').eq(pageid).addClass('active');
	$('.phonePage').removeClass('active');
	if(pageid>0)
		$('.phonePage').eq(pageid-1).addClass('active');
	
}

