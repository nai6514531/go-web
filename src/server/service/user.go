package service

import (
	"github.com/jinzhu/gorm"
	"maizuo.com/soda-manager/src/server/common"
	"maizuo.com/soda-manager/src/server/model"
	"maizuo.com/soda-manager/src/server/model/muniu"
	"maizuo.com/soda-manager/src/server/model/soda"
)

type UserService struct {
}

//通过登录名查找user表
func (self *UserService) FindByAccount(name string) (*model.User, error) {
	user := &model.User{}
	r := common.SodaMngDB_WR.Where("account = ?", name).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

//通过手机号码查找user表
func (self *UserService) FindByMobile(mobile string) (*model.User, error) {
	user := &model.User{}
	r := common.SodaMngDB_R.Where("mobile = ?", mobile).First(user)
	if r.Error != nil {
		return nil, r.Error
	}
	return user, nil
}

func (self *UserService) BasicMapByLikeName(name string) (map[int]*model.User, error) {
	list := &[]*model.User{}
	data := make(map[int]*model.User, 0)
	r := common.SodaMngDB_R.Where("name like ?", "%"+name+"%").Find(list)
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
	r := common.SodaMngDB_R.Model(user).Where(sql, params...).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(total), nil
}

func (self *UserService) TotalOfDevice(userId int) (int, error) {
	device := &model.Device{}
	var total int
	r := common.SodaMngDB_R.Model(device).Where("user_id = ?", userId).Count(&total)
	if r.Error != nil {
		return 0, r.Error
	}
	return total, nil
}

func (self *UserService) ListOfSignIn(format string) (*[]*muniu.SignInUser, error) {
	list := []*muniu.SignInUser{}
	sql := ""
	if format == "month" {
		sql=`
		select date_format(date,'%Y-%m-%d') as 'date',sum(total_new_user) as 'count'
		from daily_operate
		group by date_format(date,'%Y-%m')
		order by created_timestamp desc
		`
	}else {
		sql=`
		select date_format(date,'%Y-%m-%d') as 'date',total_new_user as 'count'
		from daily_operate
		order by created_timestamp desc
		`
	}
	rows, err := common.SodaMngDB_R.Raw(sql).Rows()
	defer rows.Close()
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		signInUser := &muniu.SignInUser{}
		common.SodaMngDB_R.ScanRows(rows, signInUser)
		list = append(list, signInUser)
	}
	return &list, nil
}

func (self *UserService) Create(user *model.User) (bool,error) {
	//对明文密码md5
	//user.Password = fmt.Sprintf("%x", md5.Sum([]byte(user.Password)))
	transAction := common.SodaMngDB_WR.Begin()
	r := transAction.Create(user)
	if r.Error != nil {
		transAction.Rollback()
		return false, r.Error
	}
	transAction.Commit()
	return true,nil
}

func (self *UserService) Update(user *model.User) (bool, error) {
	transAction := common.SodaMngDB_WR.Begin()
	_user := map[string]interface{}{
		"name":      user.Name,
		"contact":   user.Contact,
		"mobile":    user.Mobile,
		"telephone": user.Telephone,
		"address":   user.Address,
		"email":     user.Email,
	}
	r := transAction.Model(&model.User{}).Where("id = ?", user.Id).Updates(_user)
	if r.Error != nil {
		common.Logger.Warningln("Save model.User:", r.Error.Error())
		transAction.Rollback()
		return false,r.Error
	}
	transAction.Commit()
	return true,nil
}
func (self *UserService)  UpdateWechatInfo(user *model.User) (error) {
	_user := map[string]interface{}{
		"extra":      user.Extra,
	}
	r := common.SodaMngDB_R.Model(&model.User{}).Where("id = ?", user.Id).Updates(_user)
	if r.Error != nil {
		common.Logger.Warningln("Save model.User:", r.Error.Error())
		return r.Error
	}
	return nil
}
func (self *UserService) Password(userId int, password string) (bool, error) {
	tx := common.SodaMngDB_WR.Begin()
	var r *gorm.DB
	r = tx.Model(&model.User{}).Where("id = ?", userId).Update("password", password)
	if r.Error != nil {
		tx.Rollback()
		return false, r.Error
	}
	tx.Commit()
	return true, nil
}

func (self *UserService) Basic(id int) (*model.User, error) {
	user := &model.User{}
	r := common.SodaMngDB_R.Where("id = ?", id).First(user)
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
	r := common.SodaMngDB_R.Offset((page-1)*perPage).Limit(perPage).Where(sql, params...).Order("id desc").Find(list)
	if r.Error != nil {
		return nil, r.Error
	}
	return list, nil
}

//根据父用户id列出所有子用户ids
func (self *UserService) ChildIdsByUserId(parentId int) ([]int, error) {
	var childIds []int
	list := &[]*model.User{}
	r := common.SodaMngDB_R.Where("parent_id = ? AND id != ?", parentId, parentId).Find(list)
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

	type fp func(pid int) []int
	var subChildsByUse fp
	//读回所有记录
	type uid struct {
		Id       int
		ParentId int
	}
	db := []*uid{}
	r := common.SodaMngDB_R.Raw("select id,parent_id from user where deleted_at IS NULL").Find(&db)
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
	r := common.SodaMngDB_R.Where("id in (?)", ids).Find(list)
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

func (self *UserService) Count() (int, error) {
	var count int64
	r := common.SodaDB_R.Model(&soda.User{}).Count(&count)
	if r.Error != nil {
		return 0, r.Error
	}
	return int(count), nil
}
