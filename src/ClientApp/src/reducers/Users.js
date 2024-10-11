import {ERROR_SERVER, CREATE_USER, LOADER_USER, ERROR_USER, RECEIVE_USERS, DELETE_USER, UPDATE_USER, RESET_ALL, RECEIVE_COLORS, LOADER_USER_DONE, RECEIVE_EXPORT_OPTION } from '../actions/types';


const users = (state = { all: [], colorUI: {}, isFetching: false, isExportOptionComplete: false }, action) => {
    switch (action.type) {
        case LOADER_USER:
            return { ...state, isFetching: true };
        case ERROR_USER:
            return { ...state, isFetching: false };
        case CREATE_USER:
            return { ...state, isFetching: false };
        case RECEIVE_USERS:
            return { ...state, all: action.data, isFetching: false };
        case DELETE_USER:
            return { ...state }
        case UPDATE_USER:
            return { ...state, isFetching: false };
        case RECEIVE_COLORS:
            return { ...state, colorUI: action.data, isFetching: false };
        case RESET_ALL:
            return { ...state, all: [], isFetching: false };
        case LOADER_USER_DONE:
            return { ...state, isFetching: false }
        case ERROR_SERVER:
            return {...state, isFetching: false}
        case RECEIVE_EXPORT_OPTION:
            return {...state, isFetching:false, isExportOptionComplete:action.data}
        default:
            return state;
    }
}

export default users;