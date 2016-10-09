import { combineReducers } from 'redux';
import device from './device';
import user from './user';

const rootReducer = combineReducers({
	device,
	user,
});

export default rootReducer;
