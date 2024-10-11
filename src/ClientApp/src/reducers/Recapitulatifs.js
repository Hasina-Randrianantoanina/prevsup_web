import {ERROR_SERVER, DELETE_RECAPITULATIF, ERROR_RECAPITULATIF, EXPORTED_RECAPITULATIF, LOADING_RECAPITULATIFS, LOADING_SELECTED_RECAPITULATIF, RECEIVE_RECAPITULATIFS, RECEIVE_SELECTED_RECAPITULATIF, CREATED_RECAP, RESET_ALL,RECEIVE_ARCHIVED_RECAP, RECAP_CREATED } from "../actions/types";


const recapitulatifs = (state = { all: [],archivedRecapitulatifs: [], openedRecapitulatifs: [], isFetching: false}, action) => {
    switch (action.type) {
        case LOADING_RECAPITULATIFS:
            return { ...state, isFetching: true };
        case ERROR_RECAPITULATIF:
            return {...state, isFetching: false};
        case RECEIVE_RECAPITULATIFS:
            if(action.applyLoading)
                return { ...state, all: action.data, isFetching: false };
            return { ...state, all: action.data };
        case LOADING_SELECTED_RECAPITULATIF:
            return { ...state, isFetching: true };
        case RECEIVE_SELECTED_RECAPITULATIF:
            return { ...state, isFetching: false, openedRecapitulatifs: action.data}
        case RECAP_CREATED:
            return { ...state, isFetching: false, openedRecapitulatifs: action.data, all: action.all}
        case DELETE_RECAPITULATIF:
            return {...state, openedRecapitulatifs: action.data};
        case EXPORTED_RECAPITULATIF:
            return {...state, isFetching: false}
        case CREATED_RECAP:
            return {...state, isFetching:false}
        case RECEIVE_ARCHIVED_RECAP:
            return {...state,archivedRecapitulatifs:action.data,isFetching: false};
        case RESET_ALL:
            return {...state,  all: [], openedRecapitulatifs: [], isFetching: false};
        case ERROR_SERVER:
            return {...state, isFetching: false}
        default:
            return state;
    }
}

export default recapitulatifs;