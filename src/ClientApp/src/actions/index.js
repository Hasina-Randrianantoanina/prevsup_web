import serverIP from "../components/Function/ServerInfo"
import { fetchAcademiesUser, fetchAllAcademies } from "./AcademyActions"
import { fetchConstats, fetchProprietes } from "./ConstatActions"
import { fetchRecapitulatifs } from "./RecapitulatifActions"
import { fetchScenarios, getTreeFiliere } from "./ScenarioActions"
import { INFORMATION_ERROR, CLEAR_INFORMATION, INFORMATION_SUCCESS, RESET_ALL, DOWNLOADING_FILE, FILE_DOWNLOADED, ERROR_DOWNLOADING, LOADER_SCENARIO, LOADING_SCENARIO_DONE, ERROR_SERVER } from "./types"
// GENERAL Actions
export function informationError(errorMessage) {
    return {
        type: INFORMATION_ERROR,
        errorMessage
    }
}
export function informationSuccess(successMessage) {
    return {
        type: INFORMATION_SUCCESS,
        successMessage
    }
}
export function clearInformation() {
    return {
        type: CLEAR_INFORMATION
    }
}

export const resetAllData = () => async (dispatch) => {
    return dispatch({ type: RESET_ALL })
}

export const downloadFile = (fileName) => async (dispatch) => {
    await dispatch({ type: DOWNLOADING_FILE })
    const url = `${serverIP}/Main/GetFile?file=${fileName}`;
    const response = await fetch(url, { method: 'get' });
    if (!response.ok) {
        await dispatch({ type: ERROR_DOWNLOADING });
        return dispatch(informationError(await response.text()));
    }
    await dispatch({ type: FILE_DOWNLOADED });
    return await response.blob();
}



export const fetchUserDatas = (userAuthenticated) => async (dispatch) => {
    await dispatch({ type: LOADER_SCENARIO })
    await Promise.all([dispatch(fetchConstats(userAuthenticated.id, false)), dispatch(fetchAcademiesUser(userAuthenticated.login, false)), dispatch(fetchScenarios(userAuthenticated.id, false)), dispatch(fetchProprietes(false)), dispatch(getTreeFiliere(false)), dispatch(fetchRecapitulatifs(userAuthenticated.id, false)), dispatch(fetchAllAcademies(false))]);
    await dispatch({ type: LOADING_SCENARIO_DONE, applyLoading: true })
}

export const handleError = (err, dispatch) => {
    dispatch(informationError("Erreur: serveur indisponible."));
    dispatch({type: ERROR_SERVER});
}

export * from './AcademyActions';
export * from './ConstatActions';
export * from './RecapitulatifActions';
export * from './ImportActions';
export * from './ScenarioActions';
export * from './UserActions';
export * from './ArchiveActions';
export * from './UserGuideActions';
