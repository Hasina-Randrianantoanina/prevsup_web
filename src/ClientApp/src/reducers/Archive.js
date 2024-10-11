import {ERROR_SERVER, LOADER_ARCHIVE, SUCCES_ARCHIVED, ERROR_ARCHIVED, RESET_ALL } from '../actions/types';


const archive = (state = { all: [], isFetching: false }, action) => {
    switch (action.type) {
        case LOADER_ARCHIVE:
            return { ...state, isFetching: true };
        case ERROR_ARCHIVED:
            return { ...state, isFetching: false };
        case SUCCES_ARCHIVED:
            return { ...state, all: action.data, isFetching: false };
        case RESET_ALL:
            return { ...state, all: [], isFetching: false };
        case ERROR_SERVER:
            return { ...state, isFetching: false }
        default:
            return state;
    }
}

export default archive;