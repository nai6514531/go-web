package functions

import (
	"strconv"
	"os"
	"time"
	"math/rand"
	"fmt"
)

//int数组去重
func Uniq(ls []int) []int {
	intInSlice := func(i int, list []int) bool {
		for _, v := range list {
			if v == i {
				return true
			}
		}
		return false
	}
	var Uniq []int
	for _, v := range ls {
		if !intInSlice(v, Uniq) {
			Uniq = append(Uniq, v)
		}
	}
	return Uniq
}

//在数组中查找,找到返回index 没找到返回-1
func FindIndex(ls []int, value int) int {
	for k, v := range ls {
		if value == v {
			return k
		}
	}
	return -1
}

func StringToInt(value string) int {
	v, e := strconv.Atoi(value)
	if e != nil {
		return -1
	}
	return v
}

func Float64ToString(num float64, prec int) string {
	return strconv.FormatFloat(num, 'f', prec, 64)
}

func Int64ToString(num int64) string {
	//10为十进制
	return strconv.FormatInt(num, 10)
}

func FormatFloat(num float64, prec int) float64 {
	s := strconv.FormatFloat(num, 'f', prec, 64)
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return float64(-1)
	}
	return f
}

func CreatePathIfNotExists(path string) (bool, error) {
	_, err := os.Stat(path)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		err = os.Mkdir(path, os.ModePerm)
		if err != nil {
			return false, err
		}
		return true, nil
	}
	return false, err
}

func IntToBool(i int) bool {
	if i == 1 {
		return true
	}
	return false
}

func RandInt64(min, max int64) int64 {
	if min >= max || min == 0 || max == 0 {
		return max
	}
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return r.Int63n(max-min) + min
}

func GenerateIdByMobile(mobile string) string {
	if len(mobile) != 11 {
		return ""
	}
	prefix := mobile[len(mobile)-4:]
	ymd := time.Now().Format("060102")
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := fmt.Sprintf("%06v", rnd.Int31n(1000000))
	id := ymd + prefix + code
	return id
}

func GenerateIdByUserId(userId int) string {
	prefix := fmt.Sprintf("%04d",userId)
	ymd := time.Now().Format("060102")
	rnd := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := fmt.Sprintf("%06v", rnd.Int31n(1000000))
	return ymd + prefix + code
}
