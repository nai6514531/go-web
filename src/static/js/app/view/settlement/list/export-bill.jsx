import React from 'react';

const FormList = React.createClass({
	getInitialState() {
		return {
		};
	},
	cancel() {
		this.props.closeExportModal();
	},
	submit() {
		this.props.openExportModal();
	},
	render(){
		const exportUrl = this.props.exportUrl;
		return (
			<form name="exportbill" >
        <span className="form-text">确认导出这批账单吗？</span>
        <button onClick={this.cancel} type="button" id="cancel">取消</button>
        <a href={exportUrl} target="_blank" id="submit" download onClick={this.cancel}>确认</a>
      </form>
		);
	}
});

export default FormList;
