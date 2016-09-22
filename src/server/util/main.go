package util

import (
	"encoding/json"
	"github.com/bitly/go-simplejson"
	"reflect"
)

/*

type User struct {
	Id        int    `json:"Id" orm:"pk"`
	Name      string `json:"Name" orm:"column(name)"`
	Account   string `json:"Account" orm:"column(account)"`
	Password  string `json:"Password" orm:"column(password)"`
	CompanyId int    `json:"CompanyId" orm:"column(companyId)"` //  orm:"rel(fk);column(companyid)"`
}

func (this User) ToString() string {
	return fmt.Sprintf("Id:%d\tName:%s\tAccount:%s\tPassword:%s\tCompanyId:%d", this.Id, this.Name, this.Account, this.Password, this.CompanyId)
}

jsonstring := `{"objects":[{"Id":100,"Name":"anjie","Account":"anjie","Password":"password","CompanyId":10001},{"Id":100,"Name":"anjie","Account":"anjie","Password":"password","CompanyId":10001}]}`
users := []User{}
err := JsonStringToStruct(jsonstring, &users)
if err != nil {
	fmt.Println(err)
}
//fmt.Println(len(users))
for _, user := range users {
	fmt.Println(user.ToString())
}

*/

func JsonToStruct(jsonString string, md interface{}) (retErr error) {
	mdVal := reflect.ValueOf(md)          // *[]User Value
	mdIndirect := reflect.Indirect(mdVal) // []User Value
	mdType := mdIndirect.Type()           //[]User
	mdElemType := mdType.Elem()           //User

	mdSlice := reflect.MakeSlice(mdType, 0, 1) //[]User Value
	mdElem := reflect.New(mdElemType)          //*User Value

	sj, err := simplejson.NewJson([]byte(jsonString))
	if err != nil {
		panic(err)
	}

	objs, err := sj.Get("objects").Array()
	if err != nil {
		retErr = err
	}

	for _, v := range objs {
		bytes, err := json.Marshal(v)
		if err != nil {
			retErr = err
		}
		//use the interface to get the json unmarshal data
		mdElemInterface := mdElem.Interface()
		if err := json.Unmarshal(bytes, &mdElemInterface); err != nil {
			retErr = err
		}
		mdSlice = reflect.Append(mdSlice, mdElem.Elem())
	}
	//set the data into the indirect value
	mdIndirect.Set(mdSlice)
	return retErr
}
