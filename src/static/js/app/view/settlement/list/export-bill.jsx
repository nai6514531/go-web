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
        <button onClick={this.cancel} type="button" id="cancel">取消</button>
        <button onClick={this.submit} type="submit" id="submit">确认</button>
      </form>
		);
	}
});

export default FormList;
