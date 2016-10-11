package functions

//int数组去重
func IntDuplicate(ls []int) []int {
	intInSlice := func(i int, list []int) bool {
		for _, v := range list {
			if v == i {
				return true
			}
		}
		return false
	}
	var intDuplicate []int
	for _, v := range ls {
		if !intInSlice(v, intDuplicate) {
			intDuplicate = append(intDuplicate, v)
		}
	}
	return intDuplicate
}
