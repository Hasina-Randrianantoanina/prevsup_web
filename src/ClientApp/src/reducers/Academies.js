import {ERROR_SERVER, LOADING_ACADEMIES, RECEIVE_ACADEMIES, RECEIVE_ACADEMIES_USER, RECEIVE_ALL_ACADEMIES, RESET_ALL, RECEIVE_IMPORTEDYEARS} from '../actions/types';


const academies = (state = {all: [], isFetching: false, userAcademies:[], importedYears:[]}, action) => {
    switch(action.type) {
        case LOADING_ACADEMIES:
            return {...state, isFetching: true};
        case RECEIVE_ACADEMIES_USER:
            if(action.applyLoading)
                return {...state, userAcademies: action.data, isFetching: false};
            return {...state, userAcademies: action.data};
        case RECEIVE_ALL_ACADEMIES:
            if(action.applyLoading)
                return {...state, all: action.data, isFetching: false};
            return {...state, all: action.data};
        case RECEIVE_IMPORTEDYEARS:
            return {...state, importedYears:action.data}
        case RESET_ALL:
            return {...state, all: [], isFetching: false, userAcademies:[]};
        case ERROR_SERVER:
            return {...state, isFetching: false}
        default:
            return state;
    }
}

export default academies;