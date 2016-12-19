package functions

import (
	"strconv"
	"os"
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
