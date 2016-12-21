package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
)

type UserService struct {
}

//通过登陆名查找user表
func (self *UserService) FindByAccount(name string) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("account = ?", name).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

//通过手机号码查找user表
func (self *UserService) FindByMobile(mobile string) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("mobile = ?", mobile).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) BasicMapByLikeName(name string) (map[int]*model.User, error) {
	list := &[]*model.User{}
	data := make(map[int]*model.User, 0)
	r := common.DB.Where("name like ?", "%"+name+"%").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}

	for _, _user := range *list {
		data[_user.Id] = _user
	}
	return data, nil
}

func (self *UserService) TotalByParentId(parentId int, searchStr string) (int, error) {
	user := &model.User{}
	var total int64
	sql := "parent_id = ? AND id != ?"
	params := make([]interface{}, 0)
	params = append(params, parentId, parentId)
	if searchStr != "" {
		sql += " and (name like ? or contact like ?) "
		params = append(params, "%"+searchStr+"%", "%"+searchStr+"%")
	}
	r := common.DB.Model(user).Where(sql, params...).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *UserService) TotalOfDevice(userId int) (int, error) {
	device := &model.Device{}
	var total int
	r := common.DB.Model(device).Where("user_id = ?", userId).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *UserService) ListOfSignIn() (*[]*muniu.SignInUser, error) {
	list := []*muniu.SignInUser{}
	sql := "select date(inserttime) as 'date',count(*) as 'count' from box_user " +
		"where date(inserttime)>='2016-01-01' and companyid!=0 group by date(inserttime)"
	rows, err := common.MNDB.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		signInUser := &muniu.SignInUser{}
		common.MNDB.ScanRows(rows, signInUser)
		list = append(list, signInUser)
	}
	return &list, nil
}

func (self *UserService) Create(user *model.User) (bool,error) {
	//对明文密码md5
	//user.Password = fmt.Sprintf("%x", md5.Sum([]byte(user.Password)))
	transAction := common.DB.Begin()
	r := transAction.Create(user)
	if r.Error != nil {
		transAction.Rollback()
		return false, r.Error
	}
	//更新到木牛数据库
	boxAdmin := &muniu.BoxAdmin{}
	boxAdmin.FillByUser(user)
	boxAdmin.LastLoginTime = "0000-00-00 00:00:00"
	r = common.MNDB.Create(boxAdmin)
	if r.Error != nil {
		transAction.Rollback()
		common.Logger.Warningln("MNDB Create BoxAdmin:", r.Error.Error())
		return false, r.Error
	}
	transAction.Commit()
	return true,nil
}

func (self *UserService) Update(user *model.User) (bool, error) {
	transAction := common.DB.Begin()
	//r:=transAction.Save(&user).Scan(user)
	//{"name":"0","contact":"0","mobile":"12132131213","telephone":"0","address":"0","email":"","cashAccount":{"type":3,"realName":"1","bankName":"1","account":"1","mobile":"11111111111","cityId":210500,"provinceId":210000}}
	_user := map[string]interface{}{
		"name":      user.Name,
		"contact":   user.Contact,
		"mobile":    user.Mobile,
		"telephone": user.Telephone,
		"address":   user.Address,
		"email":     user.Email,
	}
	r := transAction.Model(&model.User{}).Where("id = ?", user.Id).Updates(_user).Scan(user)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Save model.User:", r.Error.Error())
		transAction.Rollback()
		return false,r.Error
	}
	//更新到木牛数据库
	/*boxAdmin := &muniu.BoxAdmin{}
	boxAdmin.FillByUser(user)
	r = common.MNDB.Save(&boxAdmin)
	if r.Error != nil {
		common.Logger.Warningln("MNDB Save BoxAdmin:", r.Error.Error())
		transAction.Rollback()
		return false
	}*/
	_boxAdmin := map[string]interface{}{
		"NAME":         user.Name,
		"CONTCAT":      user.Contact,
		"CONTACTNUM":   user.Mobile,
		"SERVICEPHONE": user.Telephone,
		"ADDRESS":      user.Address,
	}
	r = common.MNDB.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", (user.Id - 1)).Updates(_boxAdmin)
	if r.Error != nil {
		transAction.Rollback()
		common.Logger.Warningln("MNDB Update BoxAdmin:", r.Error.Error())
		return false,r.Error
	}
	transAction.Commit()
	return true,nil
}

func (self *UserService) Password(userId int, password string) (bool, error) {
	tx := common.DB.Begin()
	var r *gorm.DB
	var rmn *gorm.DB
	r = tx.Model(&model.User{}).Where("id = ?", userId).Update("password", password)
	if r.Error != nil {
		tx.Rollback()
		return false, r.Error
	}
	txmn := common.MNDB.Begin()
	rmn = txmn.Model(&muniu.BoxAdmin{}).Where("LOCALID = ?", userId-1).Update("PASSWORD", password)
	if rmn.Error != nil {
		tx.Rollback()
		txmn.Rollback()
		return false, r.Error
	}
	/*if r.RowsAffected != rmn.RowsAffected {
		tx.Rollback()
		txmn.Rollback()
		e := &functions.DefinedError{}
		e.Msg = "新旧数据库更新条数不一致: new_system:" + strconv.FormatInt(r.RowsAffected, 10) + ", old_system:" + strconv.FormatInt(rmn.RowsAffected, 10)
		err := e
		return false, err
	}*/
	txmn.Commit()
	tx.Commit()
	return true, nil
}

func (self *UserService) Basic(id int) (*model.User, error) {
	user := &model.User{}
	r := common.DB.Where("id = ?", id).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) SubList(parentId int, searchStr string, page int, perPage int) (*[]*model.User, error) {
	list := &[]*model.User{}
	sql := "parent_id = ? AND id != ?"
	params := make([]interface{}, 0)
	params = append(params, parentId, parentId)
	if searchStr != "" {
		sql += " and (name like ? or contact like ?) "
		params = append(params, "%"+searchStr+"%", "%"+searchStr+"%")
	}
	r := common.DB.Offset((page-1)*perPage).Limit(perPage).Where(sql, params...).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

//根据父用户id列出所有子用户ids
func (self *UserService) ChildIdsByUserId(parentId int) ([]int, error) {
	var childIds []int
	list := &[]*model.User{}
	r := common.DB.Where("parent_id = ? AND id != ?", parentId, parentId).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	if r.RowsAffected <= 0 { //没有找到
		return nil, nil
	}
	for _, v := range *list {
		childIds = append(childIds, v.Id)
	}
	return childIds, nil
}

//根据父用户递归列出所有（子子子。。）用户ids
func (self *UserService) SubChildIdsByUserId(parentId int) ([]int, error) {
	//方式1：查询数据库次数过多
	// var childIds []int
	// ids, _ := self.ChildIdsByUserId(parentId)
	// if ids == nil { //没有找到
	// 	return nil, nil
	// } else {
	// 	childIds = append(childIds, ids...)
	// 	for _, v := range ids {
	// 		ids, _ := self.SubChildIdsByUserId(v)
	// 		if ids != nil {
	// 			childIds = append(childIds, ids...)
	// 		}
	// 	}
	// 	return childIds, nil
	// }
	type fp func(pid int) []int
	var subChildsByUse fp
	//读回所有记录
	type uid struct {
		Id       int
		ParentId int
	}
	db := []*uid{}
	r := common.DB.Raw("select id,parent_id from user where deleted_at IS NULL").Find(&db)
	if r.Error != nil {
		return nil, r.Error
	}

	//函数1：以parentid找其直接子用户
	findChildsByParent := func(p int) []int {
		var re []int
		for _, v := range db {
			if v.ParentId == p && v.ParentId != v.Id {
				re = append(re, v.Id)
			}
		}
		return re
	}

	//函数2：递归查找其子子子。。用户
	subChildsByUse = func(pid int) []int {
		var childIds []int
		ids := findChildsByParent(pid) //找第一级
		if len(ids) == 0 {             //如果没有找到
			return nil
		}
		childIds = append(childIds, ids...)
		//如果找到了
		for _, id := range ids { //递归查找
			ids := subChildsByUse(id)
			if ids != nil {
				childIds = append(childIds, ids...)
			}
		}
		return childIds
	}
	return subChildsByUse(parentId), nil
}

func (self *UserService) ListById(ids ...int) (*[]*model.User, error) {
	list := &[]*model.User{}
	r := common.DB.Where("id in (?)", ids).Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

func (self *UserService) BasicMapById(ids ...int) (map[int]*model.User, error) {
	userService := &UserService{}
	_map := make(map[int]*model.User, 0)
	list, err := userService.ListById(ids...)
	if err != nil {
		return nil, err
	}
	for _, _user := range *list {
		_map[_user.Id] = _user
	}
	return _map, nil
}
