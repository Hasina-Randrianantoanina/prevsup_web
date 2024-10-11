import { CREATED_CONSTAT, DELETED_CONSTAT, ERROR_CONSTAT, EXPORTED_CONSTAT, LOADER_CONSTATS, RECEIVED_CALCULMERES_CONSTAT, RECEIVED_CONSTAT_PROPRIETES, RECEIVE_CONSTATS, RECEIVE_SELECTED_CONSTAT, RECEIVE_CONSTAT_VARIABLE_OPENED, RECEIVE_CONSTAT_VARIABLE_WITH_CHILDREN_OPENED, ERROR_ARCHIVED,RECEIVE_ARCHIVED_CONSTAT, RECEIVED_SCENARIO_PROPRIETES, LOADER_CONSTATS_DONE } from "./types"

import { handleError, informationError, informationSuccess } from ".";
import serverIP from "../components/Function/ServerInfo";

export const createConstatAndFetchData = (newConstat, userId) => async (dispatch) => {
    await dispatch({type: LOADER_CONSTATS});
    await Promise.all([dispatch(createConstat(newConstat, userId, false))]);
    return dispatch({type: LOADER_CONSTATS_DONE});
}

export const showConstat = (idConstat) => async (dispatch) => {
    await dispatch({type: LOADER_CONSTATS});
    await Promise.all([dispatch(fetchConstat(idConstat, false))]);
    return dispatch({type: LOADER_CONSTATS_DONE});
}

export const fetchConstats = (userId="615c1b8dde38e583f951ed35", applyLoading = true) => async (dispatch) => {
    if(applyLoading) await Promise.all([dispatch({ type: LOADER_CONSTATS })]);
    const url = `${serverIP}/Constat/ListConstat?userId=${userId}&academyId=null`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = [];
    data.Constats.forEach(constat => {
        result.push({ key: constat.Id, text: constat.Name, value: constat.Id , first_year:constat.First_year, last_year:constat.Last_year});
    })

    return dispatch({ type: RECEIVE_CONSTATS, data: result, applyLoading });
}

export const fetchConstat = (idConstat, applyLoading = true) => async (dispatch, getState) => {
    // INFO: Check if constat exits
    const { constats } = getState();
    let isThere = false;
    constats.openedConstats.forEach(opened => {
        if (opened.id === idConstat) {
            isThere = true;
        }
    });
    if (isThere) return dispatch(informationError(`Ce constat est déjà ouvert`));

    // INFO: GetConstat
    if(applyLoading) await Promise.all([dispatch({ type: LOADER_CONSTATS })]);
    const url = `${serverIP}/Constat/GetFirstTreeConstat?id=${idConstat}&name&newYears&isNew`;

    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if(!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()))
    }
    const json = await response.json();
    const data = JSON.parse(json);
    
    const variables = [];
    data.Datas.forEach(serie => {
        serie['IdParent'] = idConstat;
        variables.push({
            Name: serie.Name,
            RealName: serie.RealName,
            Id: idConstat
        });
    });

    const constat = {
        id: idConstat,
        name: data.constatName,
        series: data.Datas,
        years: data.YearsCount,
        time:new Date().getTime(),
    };
    
    const result = {
        constat: constat,
        variables: variables,
    }
    return dispatch({ type: RECEIVE_SELECTED_CONSTAT, data: result, applyLoading });
}

export const openConstatVariable = (idVariable, idConstat) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_CONSTATS })]);

    const url = `${serverIP}/Constat/OpenRowChildConstat?id=${idVariable}&name=${idConstat}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.Datas.forEach(serie => {
        serie['IdParent'] = idConstat;
    });
    return dispatch({ type: RECEIVE_CONSTAT_VARIABLE_OPENED, data: data.Datas });
}

export const deleteConstat = (idConstat, userId) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_CONSTATS })]);
    const url = `${serverIP}/Constat/Supprimer?id=${idConstat}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if(!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if(data) {
        await dispatch(closeConstat(idConstat));
        await dispatch(fetchConstats(userId));
        
        return dispatch(informationSuccess("Constat supprimé avec succès"));
    }        
    else {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError("Vous ne pouvez pas supprimer ce Constat car il est lié avec un ou plusieurs Scénarios"));
    }
}

export const enregistrerConstat =(idConstat, userId) => async (dispatch) => {
    await Promise.all([dispatch({ type: LOADER_CONSTATS })]);
    const url = `${serverIP}/Constat/SaveTreeConstat?id=${idConstat}&serie=[]&save=true`; //TODO: find and pass in parameter the serie= [] an save=true
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if(!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if(data) {
        await dispatch(fetchConstats(userId));
        return dispatch(informationSuccess("Constat enregistré avec succès"));
    }        
    else {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError("Erreur d'enregistrement de constat"));
    }
}

export const closeConstat = (idConstat) => async (dispatch, getState) => {
    const {constats} = getState();
    const openedConstatsCopied = [...constats.openedConstats];
        const filteredOpened = openedConstatsCopied.filter((opened) => {
            return opened.id !== idConstat;
        });
    return dispatch({type: DELETED_CONSTAT, data: filteredOpened})
}

export const exportConstat = (idConstat, variables) => async (dispatch, getState) => {
    await dispatch({type: LOADER_CONSTATS});
    const url = `${serverIP}/Constat/ExportConstatCSV?id=${idConstat}&vars=${variables}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    dispatch(informationSuccess("Export réussi."));
    return dispatch({type: EXPORTED_CONSTAT, data: data});
}

export const openConstatVariableWithChildren = (idVariable, idConstat) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_CONSTATS })]);

    const url = `${serverIP}/Constat/DepliageConstat?id=${idVariable}&name=${idConstat}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.Datas.forEach(serie => {
        serie['IdParent'] = idConstat;
    });
    return dispatch({ type: RECEIVE_CONSTAT_VARIABLE_WITH_CHILDREN_OPENED, data: data.Datas });
}

export const createConstat = (newConstat, userId, applyLoading = true) => async (dispatch, getState) => {
    if(applyLoading) await dispatch({type: LOADER_CONSTATS});
    let newId = "newId0";
    const name = newConstat.nomConstat;
    let newYears = `${newConstat.anneeDepartConstat}_${newConstat.anneeFinConstat}`; // TODO: check anneeFinConstat > anneeDepartConstat
    const isNew = true;
    let academyId = undefined;
    
    let url = `${serverIP}/Constat/GetConstat?name=${name}&isNew=${isNew}&userId=${userId}`;

    if(newConstat.isAcademy) {
        academyId = newConstat.idAcademyOrConstat;
        url += `&newYears=${newYears}`;
        url += `&id=${newId}`;
    } else {
        newId = newConstat.idAcademyOrConstat;
        academyId = null;
        url += `&id=${newId}`;
    }

    url += `&academyId=${academyId}`;

    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);

    // INFO: Creating the Constat object
    const variables = [];
    const idConstat = data.Id;

    data.Datas.forEach(serie => {
        serie['IdParent'] = idConstat;
        variables.push({
            Name: serie.Name,
            RealName: serie.RealName,
            IdConstat: idConstat
        });
    });
    
    const constat = {
        id: idConstat,
        name: name,
        series: data.Datas,
        years: data.YearsCount,
        time: new Date().getTime()
    };


    // INFO: Append the constat to the opened constat
    const {constats}= getState();
    const openedConstatsCopied = [...constats.openedConstats];
    openedConstatsCopied.push(constat);

    const first_year = constat.years[0];
    const last_year = constat.years[constat.years.length - 1];

    // INFO: Append the constat to list of constats
    const allCopied = [...constats.all];
    allCopied.push({ key: constat.id, text: constat.name, value: constat.id, first_year, last_year });
    return dispatch({ type: CREATED_CONSTAT, data: openedConstatsCopied, variables: variables, all: allCopied, applyLoading});
}

export const calculMereConstat = (row) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_CONSTATS })]);

    const url = `${serverIP}/Constat/CalculMeresConstat?id=${row.id}&year=${row.year}&valStr=${row.valStr}&variable=${row.variable}&parent=${row.parent}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if(!data) {
        return dispatch({type: RECEIVED_CALCULMERES_CONSTAT, data: []});
    }
    // INFO: WE add the modified variable since it is not added in the response.json()
    data.push({Variable: row.variable, Value: row.parsedVal});
    data.forEach(d => d["year"] = row.year);
    return dispatch({type: RECEIVED_CALCULMERES_CONSTAT, data: data});
}

export const fetchProprietes = (applyLoading = true) => async (dispatch, getState) => { // TODO: is it true that it is all scenario and constat proprietes ?
    if(applyLoading) await Promise.all([dispatch({ type: LOADER_CONSTATS })]);
    const url = `${serverIP}/Main/GetAllData`;
    const urlXml = `${serverIP}/Main/GetAllDataProperties`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    const responseXml = await (fetch(urlXml, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok || !responseXml.ok) {
        await dispatch({type: ERROR_CONSTAT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const jsonXml = await responseXml.json();
    const data = JSON.parse(json);
    const dataXml= JSON.parse(jsonXml);
    
    const filieres = data[0];
    const aides = data[1];
    const formules = data[2];

    const result = {
        filieres: filieres,
        aides: aides,
        formules: formules,
        aidesXml: dataXml
    }
    await dispatch({type: RECEIVED_SCENARIO_PROPRIETES, data:result, applyLoading})
    return dispatch({type: RECEIVED_CONSTAT_PROPRIETES, data: result, applyLoading})
}

export const getArchivedConstat =(userId,academy) =>async (dispatch) => {
    // id Archive_constats
    // userId 615c1b8dde38e583f951ed35
    //  academy 62e271d189c840d1300b4c0c
    await dispatch({type: LOADER_CONSTATS});
    const url = `${serverIP}/Constat/GetConstatArchive?id=archive_constats&name=Archive_constats&type=null&user=${userId}&academy=${academy}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_ARCHIVED});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = data.archives;
    return dispatch({ type: RECEIVE_ARCHIVED_CONSTAT, data: result });
}

// export const fetchVariables = () => async(dispatch) => {
//     await dispatch({type: LOADER_CONSTATS});
//     const url = `${serverIP}/Main/GetAllData`;
//     const response = await fetch(url, {method:'post'});
//     if(!response.ok) {
//
//         await dispatch({type: ERROR_CONSTAT});
//         return dispatch(informationError(await response.text()));
//     }
//     const json = await response.json();
//     const data = JSON.parse(json);
//     //console.log(data);
    
//     return dispatch({type: RECEIVE_VARIABLES_CONSTAT, data: data[1]});
// }

// export const fetchInit = () => async(dispatch) => {
    // await dispatch({type: LOADER_CONSTATS});
    // const url = `${serverIP}/Main/InitData`;
    // const response = await fetch(url, {method:'post'});
    // const json = await response.json();
    // const data = JSON.parse(json);
    // //console.log(data);
    // return dispatch({type: RECEIVE_VARIABLES_CONSTAT, data: data});
// }