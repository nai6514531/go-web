package util

type DefinedError struct {
	Msg string
}

func (e *DefinedError) Error() string {
	return e.Msg
}
