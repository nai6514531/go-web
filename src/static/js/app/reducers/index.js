import { combineReducers } from 'redux';
import device from './device';
import user from './user';
import region from './region';


const rootReducer = combineReducers({
	device,
	user,
	region,
});

export default rootReducer;
