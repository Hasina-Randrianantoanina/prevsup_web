import { ERROR_ACADEMY, LOADING_ACADEMIES, RECEIVE_ACADEMIES_USER, RECEIVE_ALL_ACADEMIES,RECEIVE_IMPORTEDYEARS } from "./types"
import serverIP from "../components/Function/ServerInfo";
import { handleError, informationError } from ".";

export const fetchAllAcademies = (applyLoading = true) => async (dispatch) => {

    if(applyLoading) await Promise.all([dispatch({ type: LOADING_ACADEMIES })]);
    const url = `${serverIP}/Main/InitData`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_ACADEMY});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const academies = data.Academies;

    const result = [];
        academies.forEach(aca => {
                result.push({key: aca.Id, value: aca.Id, label: aca.Name});
        });
        await dispatch({type:RECEIVE_IMPORTEDYEARS,data:data.ImportedYearsString});
    return dispatch({ type: RECEIVE_ALL_ACADEMIES, data: result, applyLoading });
}

export const fetchAcademiesUser = (loginUser, applyLoading = true) => async (dispatch) => {

    if(applyLoading) await Promise.all([dispatch({ type: LOADING_ACADEMIES })]);
    const url = `${serverIP}/Main/InitData`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_ACADEMY});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);

    const utilisateurs = data.Utilisateurs;
    const academies = data.Academies;

    let myUser = undefined;
    utilisateurs.forEach(user => {
        if(user.Login === loginUser) myUser = user;
    });
    let userAcademies = [];
    const academyId = myUser.AcademyId; 
    if(myUser.Academies === undefined || myUser.Academies === null || myUser.Academies === "null" || myUser.Academies === "" || myUser.Academies.length === 0) {
        userAcademies = [];
        if(academyId) userAcademies.push(academyId);
    } else {
        userAcademies = myUser.Academies.split(",");
    }

    const result = [];

    userAcademies.forEach(acad => {
        let currAcad;
        academies.forEach(aca => {
            if(aca.Id === acad) {
                currAcad = aca;
            }
        });
        result.push({key: currAcad.Id, value: currAcad.Id, text: currAcad.Name});
    });
    
    return dispatch({ type: RECEIVE_ACADEMIES_USER, data: result,applyLoading });
}