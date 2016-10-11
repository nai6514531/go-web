import { combineReducers } from 'redux';
import device from './device';
import user from './user';
import region from './region';
import school from './school';



const rootReducer = combineReducers({
	device,
	user,
	region,
	school,
});

export default rootReducer;
