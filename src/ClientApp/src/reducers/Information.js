import {ERROR_SERVER, INFORMATION_ERROR, CLEAR_INFORMATION, INFORMATION_SUCCESS, RESET_ALL } from '../actions/types'

const information = (state = { isError: false, message: "" }, action) => {
    switch (action.type) {
        case INFORMATION_SUCCESS: 
            return {...state, message: action.successMessage, isError: false};
        case CLEAR_INFORMATION:
            return { ...state, message: "", isError: false };
        case INFORMATION_ERROR:
            return { ...state, message: action.errorMessage, isError: true };
        case RESET_ALL:
            return {...state, isError: false, message: ""};
        case ERROR_SERVER:
            return {...state, isFetching: false}
        default:
            return state;
    }
}

export default information;