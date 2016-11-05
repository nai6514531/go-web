import {
  GET_SCHOOL_DETAIL,
} from '../constants/index';

const initialState = {
  device: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_SCHOOL_DETAIL:
      return {
        ...state,
        schoolDetail: action.result,
      };
    default:
      return state;
  }
}



