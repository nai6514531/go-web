import  UserService from '../service/user';

import {
  GET_USER_LIST,
  GET_USER_DETAIL,
  POST_USER_DETAIL,
  PUT_USER_DETAIL,
  REMOVE_USER,
  GET_USER_SCHOOL,
  GET_USER_SCHOOL_DEVICE,
  GET_USER_PERMISSION,
  USER_LOGOUT,
  GET_USER_MENU,
  GET_USER_DEVICE,
  GET_ALL_SCHOOL,
  GET_DETAIL_TOTAL,
  GETING_USER_LIST,
} from '../constants/index';


export function getUserList(pager,searchValue) {
  return dispatch => {
    UserService.list(pager,searchValue).then((result) => {
      dispatch({
        type: GET_USER_LIST,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_LIST,
        result: { fetch: false, result },

      });
    });
  };
}

export function getUserDetail(id) {
  return dispatch => {
    UserService.detail(id).then((result) => {
      dispatch({
        type: GET_USER_DETAIL,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_DETAIL,
        result: { fetch: false, result },

      });
    });
  };
}

export function getDetailTotal(id) {
  return dispatch => {
    UserService.detailTotal(id).then((result) => {
      dispatch({
        type: GET_DETAIL_TOTAL,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_DETAIL_TOTAL,
        result: { fetch: false, result },

      });
    });
  };
}

export function postUserDetail(user) {
  return dispatch => {
    UserService.create(user).then((result) => {
      dispatch({
        type: POST_USER_DETAIL,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: POST_USER_DETAIL,
        result: { fetch: false, result },

      });
    });
  };
}

export function putUserDetail(id, user) {
  return dispatch => {
    UserService.edit(id, user).then((result) => {
      dispatch({
        type: PUT_USER_DETAIL,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: PUT_USER_DETAIL,
        result: { fetch: false, result },

      });
    });
  };
}

export function deleteUser(id) {
  return dispatch => {
    UserService.remove(id).then((result) => {
      dispatch({
        type: REMOVE_USER,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: REMOVE_USER,
        result: { fetch: false, result },

      });
    });
  };
}

export function getUserSchool(id, schoolId, pager, serialNumber) {
  return dispatch => {
    UserService.schoolTotal(id, schoolId, pager, serialNumber).then((result) => {
      dispatch({
        type: GET_USER_SCHOOL,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_SCHOOL,
        result: { fetch: false, result },

      });
    });
  };
}

export function getAllSchool(id, schoolId, pager) {
  return dispatch => {
    UserService.school(id, schoolId, pager).then((result) => {
      dispatch({
        type: GET_ALL_SCHOOL,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_ALL_SCHOOL,
        result: { fetch: false, result },

      });
    });
  };
}

export function getSchoolDevice(id, school_id, pager) {
  return dispatch => {
    UserService.schoolDevice(id, school_id, pager).then((result) => {
      dispatch({
        type: GET_USER_SCHOOL_DEVICE,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_SCHOOL_DEVICE,
        result: { fetch: false, result },

      });
    });
  };
}

export function getUserPermission(id) {
  return dispatch => {
    UserService.permission(id).then((result) => {
      dispatch({
        type: GET_USER_PERMISSION,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_PERMISSION,
        result: { fetch: false, result },

      });
    });
  };
}


export function userLogout() {
  return dispatch => {
    UserService.logout().then((result) => {
      console.log('IMLOGOUT');
      dispatch({
        type: USER_LOGOUT,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: USER_LOGOUT,
        result: { fetch: false, result },

      });
    });
  };
}


export function getUserMenu(id) {
  return dispatch => {
    UserService.menu(id).then((result) => {
      dispatch({
        type: GET_USER_MENU,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_MENU,
        result: { fetch: false, result },

      });
    });
  };
}

export function getUserDevice(id) {
  return dispatch => {
    UserService.device(id).then((result) => {
      dispatch({
        type: GET_USER_DEVICE,
        result: { fetch: true, result },
      });
    },(result) => {
      dispatch({
        type: GET_USER_DEVICE,
        result: { fetch: false, result },

      });
    });
  };
}



