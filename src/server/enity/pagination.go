package enity

type Pagination struct {
	Total int `json:"total"`
	List  interface{} `json:"list"`
}
