function showParams() {
	if ($("#allparameters").find(".realinputvalue").length > 0) {
		$("#allparameters").show();
	} else {
		$("#allparameters").hide();
	}
}

function showHeaders() {
	if ($("#allheaders").find(".realinputvalue").length > 0) {
		$("#allheaders").show();
	} else {
		$("#allheaders").hide();
	}
}

//this specifies the parameter names
$(".fakeinputname").blur(function() {
	var newparamname = $(this).val();
	$(this).parent().parent().parent().parent().find(".realinputvalue").attr("name", newparamname);
});


$(".close").click(function(e) {
	e.preventDefault();
	$(this).parent().remove();
	showParams();
});

$("#addprambutton").click(function(e) {
	e.preventDefault();
	$('.httpparameter:first').clone(true).appendTo("#allparameters");
	showParams();
});

$("#addheader").click(function(e) {
	e.preventDefault();
	$('.httpparameter:first').clone(true).appendTo("#allheaders");
	showHeaders();
});

$("#addfilebutton").click(function(e) {
	e.preventDefault();
	$('.httpfile:first').clone(true).appendTo("#allparameters");
	showParams();
});

function postWithAjax(myajax) {
	myajax = myajax || {};
	myajax.url = $("#urlvalue").val();
	myajax.type = $("#httpmethod").val();
	myajax.headers = createHeader();
	myajax.complete = function(jqXHR) {
		$("#statuspre").text(
			"HTTP " + jqXHR.status + " " + jqXHR.statusText);
		if (jqXHR.status == 0) {
			httpZeroError();
		} else if (jqXHR.status >= 200 && jqXHR.status < 300) {
			$("#statuspre").addClass("alert-success");
		} else if (jqXHR.status >= 400) {
			$("#statuspre").addClass("alert-error");
		} else {
			$("#statuspre").addClass("alert-warning");
		}
		$("#outputpre").text(jqXHR.responseText);
		$("#headerpre").text(jqXHR.getAllResponseHeaders());
	}

	if (jQuery.isEmptyObject(myajax.data)) {
		myajax.contentType = 'application/x-www-form-urlencoded';
	}

	$("#outputframe").hide();
	$("#outputpre").empty();
	$("#headerpre").empty();
	$("#outputframe").attr("src", "")
	$("#ajaxoutput").show();
	$("#statuspre").text("0");
	$("#statuspre").removeClass("alert-success");
	$("#statuspre").removeClass("alert-error");
	$("#statuspre").removeClass("alert-warning");

	$('#ajaxspinner').show();

	var req = $.ajax(myajax).always(function(){
		$('#ajaxspinner').hide();
	});
}

$("#submitajax").click(function(e) {
	e.preventDefault();
	if(checkForFiles()){
		postWithAjax({
			data : createMultipart(), 
			cache: false,
			contentType: false,
			processData: false  
		});
	} else {
		postWithAjax({
			data : createUrlData()
		});    
	}
});

function checkForFiles() {
	return $("#paramform").find(".input-file").length > 0;
}

function createUrlData(){
	var mydata = {};
	var parameters = $("#allparameters").find(".realinputvalue");
	for (i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
		var parametersValue = $(parameters).eq(i).val();
    	if(parametersValue.slice(0,1) == '{' && parametersValue.slice(-1)=='}')
    	  	eval('parametersValue =' + parametersValue);
    	console.log(parametersValue);
		mydata[name] = parametersValue;
	}
	return(mydata);
}

function createHeader(){
	var header ={};
	var parameters = $("#allheaders").find(".realinputvalue");

	for (i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
		header[name] = $(parameters).eq(i).val();
	}

	return(header);
}

function createMultipart(){
	//create multipart object
	var data = new FormData();
	
	//add parameters
	var parameters = $("#allparameters").find(".realinputvalue");
	for (i = 0; i < parameters.length; i++) {
		name = $(parameters).eq(i).attr("name");
		if (name == undefined || name == "undefined") {
			continue;
		}
		if(parameters[i].files){
  			data.append(name, parameters[i].files[0]);      
		} else {
    		var parametersValue = $(parameters).eq(i).val();
    		if(parametersValue.slice(0,1) == '{' && parametersValue.slice(-1)=='}')
    	  		eval('parametersValue =' + parametersValue);
    		console.log(parametersValue);
			data.append(name, parametersValue);
		}
	}
	return(data)  
}

function httpZeroError() {
	$("#errordiv").append('<div class="alert alert-error"> <a class="close" data-dismiss="alert">&times;</a> <strong>Oh no!</strong> Javascript returned an HTTP 0 error. One common reason this might happen is that you requested a cross-domain resource from a server that did not include the appropriate CORS headers in the response. Better open up your Firebug...</div>');
}

$("#testajax").click(
	function (e){
		e.preventDefault();
		var host = location.hostname || 'localhost';
		var port = location.port==''?'':':'+location.port;
		port = host == 'localhost' ? ':8080': port;
		var time = new Date().getTime();
		var dotest = confirm('Send 1000 REST request?');
		if(dotest)
			for(var i=0;i<1000;i++)
		{
			console.log('sending '+i);
			$.ajax({
		        type: 'GET',
		        headers: {},
		        data: {'data':{'time':i}},
		        url: "http://"+ host + port +"/db/test",
		        success: function(data) {
		            $("#outputpre").text(data);
		        },    
		        error : function(data) {    
		        	console.log(data.responseText);
		            $("#outputpre").text(data.responseText);
		        }
			});
		}
	}  
);
