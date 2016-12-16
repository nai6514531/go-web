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
			<form name="exportbill" action={exportUrl} method="post" target="_blank">
        <span className="form-text">确认导出这批账单吗？</span>
        <button onClick={this.cancel} type="button" id="cancel">取消</button>
        <button onClick={this.submit} type="submit" id="submit">确认</button>
      </form>
		);
	}
});

export default FormList;
