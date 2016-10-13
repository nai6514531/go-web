package enity

type ListResult struct {
	Total int64       `json:"total"`
	List  interface{} `json:"list"`
}
