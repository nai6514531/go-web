const Printer = (orderList) => {
	console.log(orderList)
	let tmp = ``;
	for(let i=0; i<orderList.length; i++){
		let str = `
			<div style="font-size:10px;text-align:center;margin-top: 10px;border:1px solid #000;">
				<div>海岸城影院</div>
				<div>3号厅</div>
				<div>F排11座</div>
				<div  style="border-bottom:1px dashed #000; padding-bottom:5px; font-size:6px;word-break:break-all;">放映时间：09/31/2016 15:03:03</div>
				<div style="text-align: left; border-bottom:1px dashed #000;">
					<div><div style="width: 30%;display:inline-block;">数量</div><div style="width: 40%;display:inline-block;">产品</div><div style="width: 30%;display:inline-block;">价格</div></div>
					<div><div style="width: 30%;display:inline-block;">数量</div><div style="width: 40%;display:inline-block;">产品</div><div style="width: 30%;display:inline-block;">价格</div></div>
					<div><div style="width: 30%;display:inline-block;">数量</div><div style="width: 40%;display:inline-block;">产品</div><div style="width: 30%;display:inline-block;">价格</div></div>
					<div><div style="width: 70%;display:inline-block;">小计</div><div style="width: 30%;display:inline-block;">36.00</div></div>
					<div><div style="width: 70%;display:inline-block;">微信支付</div><div style="width: 30%;display:inline-block;">36.00</div></div>
				</div>
				<div style="text-align: left;	border-bottom:1px dashed #000;">
					<div>配送员：54514</div>
					<div>时间：08/31/2016 15:03:03</div>
					<div>订单号：216541513156456</div>
					<div>支付交易号：4560230450300112452445542</div>
					<div>商家交易号：75148214</div>
				</div>
				<div style="">
					<div>欢迎光临深圳海岸城影城餐厅</div>
					<div>中国广东省深圳市南山区海岸城3楼302-B</div>
					<div>0755-86965414</div>
				</div>
			</div>
		`
		tmp += str;
	}
	return tmp;
}

export default Printer;