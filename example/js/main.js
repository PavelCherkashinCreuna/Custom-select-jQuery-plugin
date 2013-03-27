$(function () {
	selectInst = $('.select-1').select({
		onSelect: function (event,elem) {
			console.log(event,elem)
		}
	});
	selectInst1 = $('.select-for-replace').select({
		onSelect: function (event,elem) {
			console.log(event,elem)
		}
	});
});