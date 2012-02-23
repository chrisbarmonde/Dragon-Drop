
// Need a way to determine if the dataTransfer object actually has data attached. If it doesn't, then
// some browsers will just not fire certain drag events.
Clipboard.prototype.realSetData = Clipboard.prototype.setData;
Clipboard.prototype.dataSet = false;
Clipboard.prototype.data_type = null;
Clipboard.prototype.data = null;
Clipboard.prototype.setData = function(data_type, data) {
	this.dataSet = true;
	this.data_type = data_type;
	this.data = data;
	this.realSetData(data_type, data);
};
Clipboard.prototype.hasData = function() {
	return this.dataSet || this.files.length > 0 || this.items.length > 0;
};
