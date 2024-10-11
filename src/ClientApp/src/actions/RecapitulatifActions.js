import { DELETE_RECAPITULATIF, ERROR_RECAPITULATIF, EXPORTED_RECAPITULATIF, LOADING_RECAPITULATIFS, RECEIVE_RECAPITULATIFS, RECEIVE_SELECTED_RECAPITULATIF, ERROR_ARCHIVED, RECEIVE_ARCHIVED_RECAP, RECAP_CREATED } from "./types"


import { handleError, informationError, informationSuccess } from ".";
import serverIP from "../components/Function/ServerInfo";

export const fetchRecapitulatifs = (idUser, applyLoading = true) => async (dispatch) => {
    if (applyLoading) await dispatch({ type: LOADING_RECAPITULATIFS });
    const url = `${serverIP}/Recap/ListRecap?userId=${idUser}&academyId=null`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)))
    if (!response.ok) {
        await dispatch({ type: ERROR_RECAPITULATIF });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = [];

    data.forEach(recapitulatif => {
        result.push({ id: recapitulatif.Id, name: recapitulatif.Name, key: recapitulatif.Id, text: recapitulatif.Name, value: recapitulatif.Id });
    });

    return dispatch({ type: RECEIVE_RECAPITULATIFS, data: result, applyLoading });
}

export const fetchRecapitulatif = (idRecap) => async (dispatch, getState) => {
    // INFO: Check if recapitulatif is already opened
    const { recapitulatifs } = getState();
    let isThere = false;
    recapitulatifs.openedRecapitulatifs.forEach(opened => {
        if (opened.id === idRecap) {
            isThere = true;
        }
    });
    if (isThere) return dispatch(informationError(`Ce tableau récapitulatif est déjà ouvert`));

    // INFO: Get the needed data to send to back-end
    const authUser = JSON.parse(sessionStorage.getItem("user"));
    if (!authUser) return dispatch(informationError("Veuillez vous authentifiez"));
    const recap = recapitulatifs.all.find(x => x.id === idRecap);

    // INFO: GetRecapitulatif
    await Promise.all([dispatch({ type: LOADING_RECAPITULATIFS })]);
    const url = `${serverIP}/Recap/OpenRecap?userId=${authUser.id}&recapit=${recap.name}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)))
    if (!response.ok) {
        await dispatch({ type: ERROR_RECAPITULATIF });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);

    const openedRecapitulatifsCopied = [...recapitulatifs.openedRecapitulatifs];

    const newRecap = {
        ...recap,
        seriesEffectif: addDataToSeries(data.EffectifLMD),
        seriesDiplome: addDataToSeries(data.DiplomeLMD),
        seriesAcademie: addDataToSeries(data.AccademieLMD),
        years: data.YearsAca,
        yearEndConstat: data.YearEndCAca,
        scenario: {
            name: data.scenarioname
        },
        time: new Date().getTime()
    };
    openedRecapitulatifsCopied.push(newRecap);
    return dispatch({ type: RECEIVE_SELECTED_RECAPITULATIF, data: openedRecapitulatifsCopied });
}

const addDataToSeries = (series, id) => {
    const result = [];
    if (!series) return result;
    series.forEach(serie => {
        result.push({
            Id: id,
            Name: serie.Name,
            RealName: serie.displayLabel,
            serie: serie._data,
            Level: serie.Level,
            child: serie.Child,
            Parent: serie.parent,
            type: serie.type,
            display: serie.display
        });
    });
    return result;
}

export const closeRecap = (idRecap) => async (dispatch, getState) => {
    const { recapitulatifs } = getState();
    const openedRecapitulatifsCopied = [...recapitulatifs.openedRecapitulatifs];
    const filteredOpened = openedRecapitulatifsCopied.filter((opened) => {
        return opened.id !== idRecap;
    });
    return dispatch({ type: DELETE_RECAPITULATIF, data: filteredOpened })
}

export const deleteRecap = (recapName, idRecaP, userId) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADING_RECAPITULATIFS })]);
    const url = `${serverIP}/Recap/DeleteRecap?name=${recapName}`;
    const response = await (fetch(url, { method: 'delete' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_RECAPITULATIF });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    await dispatch(closeRecap(idRecaP));
    await dispatch(fetchRecapitulatifs(userId));

    return dispatch(informationSuccess("Récapitulatif supprimé avec succès"));

}

export const exportRecap = (recapName, type, userId) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADING_RECAPITULATIFS })]);
    const url = `${serverIP}/Recap/downloadFile?name=${recapName}&type=${type}&userId=${userId}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_RECAPITULATIF });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    dispatch(informationSuccess("Export réussi."));
    return dispatch({ type: EXPORTED_RECAPITULATIF, data: data.Path });
}
export const createRecap = (newRecap) => async (dispatch, getState) => {
    const { recapitulatifs } = getState();
    await Promise.all([dispatch({ type: LOADING_RECAPITULATIFS })]);
    const url = `${serverIP}/Recap/CreateRecap?name=${newRecap.nomRecap}&userId=${newRecap.userId}&academyId=${newRecap.academyId}&idscenario=${newRecap.idscenario}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_RECAPITULATIF });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const openedRecapitulatifsCopied = [...recapitulatifs.openedRecapitulatifs];
    const allCopied = [...recapitulatifs.all];
    const recap = recapitulatifs.all.find(x => x.name === newRecap.nomRecap);
    const openNewRecap = {
        id: data.Id,
        name: newRecap.nomRecap,
        text: newRecap.nomRecap,
        key: data.Id,
        value: data.Id,
        seriesEffectif: addDataToSeries(data.EffectifLMD),
        seriesDiplome: addDataToSeries(data.DiplomeLMD),
        seriesAcademie: addDataToSeries(data.AccademieLMD),
        years: data.YearsAca,
        yearEndConstat: data.YearEndCAca,
        scenario: {
            name: data.scenarioname
        },
        time: new Date().getTime()
    };

    openedRecapitulatifsCopied.push(openNewRecap);
    allCopied.push(openNewRecap);

    return dispatch({ type: RECAP_CREATED, data: openedRecapitulatifsCopied, all: allCopied });
}

export const getArchivedRecap = (userId, academy) => async (dispatch) => {
    // id Archive_constats
    // userId 615c1b8dde38e583f951ed35
    //  academy 62e271d189c840d1300b4c0c
    await dispatch({ type: LOADING_RECAPITULATIFS });
    const url = `${serverIP}/Recap/GetRecapitulatifArchive?id=archive_recaps&name=Archive_recaps&type=null&user=${userId}&academy=${academy}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_ARCHIVED });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = data.archives;
    return dispatch({ type: RECEIVE_ARCHIVED_RECAP, data: result });
}