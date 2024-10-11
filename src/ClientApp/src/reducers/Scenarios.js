import {ERROR_SERVER, CHANGE_DEGRE_SCENARIO, DELETE_SCENARIO, ERROR_SCENARIO, LOADER_SCENARIO, RECEIVE_SCENARIOS, RECEIVE_SCENARIO_VARIABLE_MULTIPLE_WITH_CHILDREN_OPENED, RECEIVE_SCENARIO_VARIABLE_OPENED, RECEIVE_SCENARIO_VARIABLE_WITH_CHILDREN_OPENED, RECEIVE_SELECTED_SCENARIO, SCENARIO_CALCUL_CONTEXTE_DONE, SCENARIO_RECONDUIRE_VARIABLES_DONE, SCENARIO_RECONDUIRE_VARIABLE_DONE, RECEIVE_FILIERES, EXPORTED_SCENARIO, CREATED_SCENARIO, RESET_ALL, RECEIVED_CALCULMERES_SCENARIO, RECEIVE_ARCHIVED_SCENARIO, LOADING_SCENARIO_DONE,RECEIVED_SCENARIO_PROPRIETES, SCENARIO_RENAMED, SCENARION_CALCUL_ALL_DONE } from "../actions/types";

const scenarios = (state = { all: [], archivedScenarios: [], isFetching: false, openedScenarios: [], allFilieres: [], proprietes: {} }, action) => {
    switch (action.type) {
        case LOADER_SCENARIO:
            return { ...state, isFetching: true };
        case RECEIVE_SCENARIOS:
            if(action.applyLoading)
                return { ...state, isFetching: false, all: action.data }
            return { ...state, all: action.data }
        case RECEIVE_SELECTED_SCENARIO:
            if(action.applyLoading)
                return { ...state, isFetching: false, openedScenarios: action.data.openedScenarios }
            return { ...state, openedScenarios: action.data.openedScenarios }
        case DELETE_SCENARIO:
            return { ...state, openedScenarios: action.data };
        case RECEIVE_SCENARIO_VARIABLE_OPENED:
            return { ...state, isFetching: false }
        case RECEIVE_SCENARIO_VARIABLE_WITH_CHILDREN_OPENED:
            return { ...state, isFetching: false };
        case ERROR_SCENARIO:
            return { ...state, isFetching: false };
        case CHANGE_DEGRE_SCENARIO:
            return { ...state, isFetching: false };
        case RECEIVE_FILIERES:
            if(action.applyLoading)
                return { ...state, isFetching: false, allFilieres: action.data };
                return { ...state, allFilieres: action.data };
        case SCENARIO_RECONDUIRE_VARIABLES_DONE:
            return { ...state, isFetching: false }
        case SCENARIO_RECONDUIRE_VARIABLE_DONE:
            return { ...state, isFetching: false };
        case RECEIVE_SCENARIO_VARIABLE_MULTIPLE_WITH_CHILDREN_OPENED:
            return { ...state, isFetching: false };
        case SCENARIO_CALCUL_CONTEXTE_DONE:
            return { ...state, isFetching: false };
        case SCENARION_CALCUL_ALL_DONE:
            return { ...state, isFetching: false };
        case EXPORTED_SCENARIO:
            return { ...state, isFetching: false };
        case CREATED_SCENARIO:
            if(action.applyLoading)
                return { ...state, isFetching: false, openedScenarios: action.data.openedScenarios, all: action.all };
            return { ...state, openedScenarios: action.data.openedScenarios, all: action.all };
        case RECEIVE_ARCHIVED_SCENARIO:
            return { ...state, archivedScenarios: action.data, isFetching: false };
        case RECEIVED_SCENARIO_PROPRIETES:
            if(action.applyLoading)
                return {...state, proprietes: action.data, isFetching:false}
            return {...state, proprietes: action.data}
        case RESET_ALL:
            return { ...state, all: [], isFetching: false, openedScenarios: [], proprietes: {} };
        case RECEIVED_CALCULMERES_SCENARIO:
            return { ...state, isFetching: false };
        case LOADING_SCENARIO_DONE:
            if(action.applyLoading)
                return { ...state, isFetching: false };
            return {...state}
        case ERROR_SERVER:
            return {...state, isFetching: false}
        case SCENARIO_RENAMED:
            return {...state, isFetching: false}
        default:
            return state;
    }
}

export default scenarios;