const Menus = [
	{
		"text": "数据管理",
		"key": "data",
		"icon": "appstore",
		"items": [
			{
				"key": "#/user",
				"text": "代理商管理",
				"routes": [
					{
						"route": "/user",
						"name": "代理商列表",
						"path": "/user/list"
					},
					{
						"route": "/trello/create",
						"name": "添加TRELLO",
						"path": "/trello/edit"
					},
					{
						"route": "/trello/:id",
						"name": "TRELLO详情",
						"path": "/trello/edit"
					}
				]
			},
			{
				"key": "#/settlement",
				"text": "结算管理",
				"routes": [
					{
						"route": "/settlement",
						"name": "账单列表",
						"path": "/settlement/list"
					}
				]
			},
			{
				"key": "#/logout",
				"text": "退出",
				"routes": []
			}
		]
	}
];

export default Menus;
