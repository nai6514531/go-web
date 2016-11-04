
export const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

export const parseJSON = (response) => {
  return response.json()
}

export const parseCode = (code) => {
  const newCode = parseInt(code.substr(-2), 10);
  return newCode;
}
