package util

import (
	"github.com/kataras/iris"
	"strconv"
	"reflect"
	"net/url"
	"fmt"
	"github.com/iris-contrib/errors"
)

type Util struct {
}

func URLParamInt(ctx *iris.Context, param string) int {
	paramValue, err := ctx.URLParamInt(param)
	if err != nil {
		return 0
	}
	return paramValue
}

func StringToInt(value string) int {
	v, e := strconv.Atoi(value)
	if e != nil {
		return 0
	}
	return v
}

func GetMaxInt () int {
	const MaxUint = ^uint(0)
	const MaxInt = int(MaxUint >> 1)
	return MaxInt
}


func MapToStruct(s interface{}, m map[string]interface{}) error {
	for k, v := range m {
		err := SetField(s, k, v)
		if err != nil {
			return err
		}
	}
	return nil
}

func SetField(obj interface{}, name string, value interface{}) error {
	structValue := reflect.ValueOf(obj).Elem()
	structFieldValue := structValue.FieldByName(name)

	if !structFieldValue.IsValid() {
		return fmt.Errorf("No such field: %s in obj", name)
	}

	if !structFieldValue.CanSet() {
		return fmt.Errorf("Cannot set %s field value", name)
	}

	structFieldType := structFieldValue.Type()
	val := reflect.ValueOf(value)
	if structFieldType != val.Type() {
		invalidTypeError := errors.New("Provided value type didn't match obj field type")
		return invalidTypeError
	}

	structFieldValue.Set(val)
	return nil
}


func StructToMap(i interface{}) (values url.Values) {
	values = url.Values{}
	iVal := reflect.ValueOf(i).Elem()
	typ := iVal.Type()
	for i := 0; i < iVal.NumField(); i++ {
		f := iVal.Field(i)
		// You ca use tags here...
		// tag := typ.Field(i).Tag.Get("tagname")
		// Convert each type into a string for the url.Values string map
		var v string
		switch f.Interface().(type) {
		case int, int8, int16, int32, int64:
			v = strconv.FormatInt(f.Int(), 10)
		case uint, uint8, uint16, uint32, uint64:
			v = strconv.FormatUint(f.Uint(), 10)
		case float32:
			v = strconv.FormatFloat(f.Float(), 'f', 4, 32)
		case float64:
			v = strconv.FormatFloat(f.Float(), 'f', 4, 64)
		case []byte:
			v = string(f.Bytes())
		case string:
			v = f.String()
		}
		values.Set(typ.Field(i).Name, v)
	}
	return
}

//func FillStruct(data map[string]interface{}, result interface{}) {
//	t := reflect.ValueOf(result).Elem()
//	fmt.Println("ttttttttttttttttttt=", t)
//	for k, v := range data {
//		val := t.FieldByName(k)
//		fmt.Println("valvalvalval====", val)
//		val.Set(reflect.ValueOf(v))
//		fmt.Println("reflectreflectreflectreflect====", reflect.ValueOf(v))
//	}
//}
