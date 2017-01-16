(function(){
	var app = angular.module('Directives', []);

	app.directive('soundPlay',function() {
		return {
			restrict: 'E',
			template: '<div>Hi there</div>',
			replace: true,
			link :  function(scope,element, attrs) {
				
			}
		};
	});
	app.directive("contenteditable", function(){
		return {
			restrict: "A",
			require: "ngModel",
			link: function(scope, element, attrs, ngModel) {
				function read() {
					ngModel.$setViewValue(element.html());
				}

				ngModel.$render = function() {
					element.html(ngModel.$viewValue || "");
				};

				element.bind('blur keyup change', function() {
					scope.$apply(read);
				});
			}
		};
	});
})();
