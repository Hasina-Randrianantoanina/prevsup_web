import {ERROR_SERVER, CREATED_CONSTAT, DELETED_CONSTAT, ERROR_CONSTAT, EXPORTED_CONSTAT, LOADER_CONSTATS, RECEIVED_CALCULMERES_CONSTAT, RECEIVED_CONSTAT_PROPRIETES, RECEIVE_CONSTATS, RECEIVE_SELECTED_CONSTAT, RECEIVE_VARIABLES_CONSTAT, RECEIVE_CONSTAT_VARIABLE_OPENED, RECEIVE_CONSTAT_VARIABLE_WITH_CHILDREN_OPENED, SAVE_CONSTAT,RECEIVE_ARCHIVED_CONSTAT, RESET_ALL, LOADER_CONSTATS_DONE } from "../actions/types";


const constats = (state = { all: [],archivedConstats:[], openedConstats: [], isFetching: false, openVariablesChildren: [], constatVariables: [], filePath: "", proprietes: {}}, action) => {
    switch (action.type) {
        case LOADER_CONSTATS:
            return { ...state, isFetching: true };
        case LOADER_CONSTATS_DONE:
            return {...state, isFetching: false};
        case ERROR_CONSTAT:
            return { ...state, isFetching: false};
        case RECEIVE_CONSTATS:
            if(action.applyLoading)
                return { ...state, all: action.data, isFetching: false };
                return { ...state, all: action.data };
        case RECEIVE_SELECTED_CONSTAT:  // TODO Move the logic in Actions
            const newOpenedConstats = [...state.openedConstats];
            newOpenedConstats.push(action.data.constat);
            if(action.applyLoading)
                return { ...state, isFetching: false, openedConstats: newOpenedConstats, constatVariables: action.data.variables };
                return { ...state, openedConstats: newOpenedConstats, constatVariables: action.data.variables };
        case RECEIVE_CONSTAT_VARIABLE_OPENED:
            return { ...state, isFetching: false };
        case DELETED_CONSTAT:
            return {...state, openedConstats: action.data};
        case EXPORTED_CONSTAT:
            return {...state, filePath: action.data, isFetching: false};
        case RECEIVE_CONSTAT_VARIABLE_WITH_CHILDREN_OPENED:
            return {...state, isFetching: false};
        case CREATED_CONSTAT:
            if(action.applyLoading)
                return {...state, openedConstats: action.data, constatVariables: action.variables, all: action.all, isFetching: false};
            return {...state, openedConstats: action.data, constatVariables: action.variables, all: action.all};
        case RECEIVED_CALCULMERES_CONSTAT:
            return {...state, isFetching: false}
        case RECEIVED_CONSTAT_PROPRIETES: 
            if(action.applyLoading)
                return {...state, proprietes: action.data, isFetching:false}
                return {...state, proprietes: action.data}
        case SAVE_CONSTAT:
            return {...state, isFetching:false}
        case RECEIVE_ARCHIVED_CONSTAT:
            return {...state,archivedConstats:action.data,isFetching: false};
        case RESET_ALL:
            return {...state, all: [],archivedConstats:[], openedConstats: [], isFetching: false, openVariablesChildren: [], constatVariables: [], filePath: "", proprietes: {}};
        case ERROR_SERVER:
            return {...state, isFetching: false}
        default:
            return state;
    }
}

export default constats;