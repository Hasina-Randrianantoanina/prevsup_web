import {ERROR_SERVER,LOADER_IMPORT,ERROR_IMPORT,SUCCES_IMPORT, RESET_ALL} from '../actions/types';


const importData = (state = {all: [], isFetching: false}, action) => {
    switch(action.type) {
        case LOADER_IMPORT:
            return {...state, isFetching: true};
        case ERROR_IMPORT:
            return {...state, all: action.data, isFetching: false};
        case SUCCES_IMPORT:
            return {...state,isFetching: false};
        case RESET_ALL:
            return {...state, all: [], isFetching: false};
        case ERROR_SERVER:
            return {...state, isFetching: false}
        default:
            return state;
    }
}

export default importData;