import {
  GET_PROVINCE_LIST,
  GET_PROVINCE_DETAIL,
  GET_PROVINCE_CITY_LIST,
  GET_PROVINCE_SCHOOL_LIST,

  GET_CITY_LIST,
  GET_CITY_DETAIL,
  GET_CITY_DISTRICT_LIST,

  GET_DISTRICT_DETAIL,
} from '../constants/index';

const initialState = {
  region: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PROVINCE_LIST:
      return {
        ...state,
        provinceList: action.result,
      };
    case GET_PROVINCE_DETAIL:
      return {
        ...state,
        provinceDetail: action.result,
      };
    case GET_PROVINCE_CITY_LIST:
      return {
        ...state,
        provinceCity: action.result,
      };
    case GET_PROVINCE_SCHOOL_LIST:
      return {
        ...state,
        provinceSchool: action.result,
      };
    case GET_CITY_LIST:
      return {
        ...state,
        cityList: action.result,
      };
    case GET_CITY_DETAIL:
      return {
        ...state,
        cityDetail: action.result,
      };
    case GET_CITY_DISTRICT_LIST:
      return {
        ...state,
        cityDistrict: action.result,
      };
    case GET_DISTRICT_DETAIL:
      return {
        ...state,
        districtDetail: action.result,
      };

    default:
      return state;
  }
}



