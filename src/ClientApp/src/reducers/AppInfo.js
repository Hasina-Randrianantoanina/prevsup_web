import {RECEIVE_APP_INFO, UPDATE_APP_INFO, LOADING_APP_INFO} from '../actions/types';


const appInfo = (state = { info:{}, isFetching: false }, action) => {
    switch (action.type) {
        case LOADING_APP_INFO:
            return { ...state, isFetching: true };
        case RECEIVE_APP_INFO:
            return { ...state, info:action.data, isFetching: false };
        case UPDATE_APP_INFO:
            return { ...state, isFetching: false };
        default:
            return state;
    }
}

export default appInfo;