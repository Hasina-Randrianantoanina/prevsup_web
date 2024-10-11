import { DELETE_SCENARIO, ERROR_SCENARIO, LOADER_SCENARIO, RECEIVE_SCENARIOS, RECEIVE_SCENARIO_VARIABLE_OPENED, RECEIVE_SELECTED_SCENARIO, RECEIVE_SCENARIO_VARIABLE_WITH_CHILDREN_OPENED, CHANGE_DEGRE_SCENARIO, SCENARIO_RECONDUIRE_VARIABLES_DONE, SCENARIO_RECONDUIRE_VARIABLE_DONE, RECEIVE_SCENARIO_VARIABLE_MULTIPLE_WITH_CHILDREN_OPENED, SCENARIO_CALCUL_CONTEXTE_DONE, RECEIVE_FILIERES, EXPORTED_SCENARIO, CREATED_SCENARIO, RECEIVED_CALCULMERES_SCENARIO, ERROR_ARCHIVED, RECEIVE_ARCHIVED_SCENARIO, LOADING_SCENARIO_DONE,SCENARIO_RENAMED, SCENARION_CALCUL_ALL_DONE } from "./types";
import { handleError, informationError, informationSuccess } from ".";
import serverIP from "../components/Function/ServerInfo";

export const createScenarioAndFetchData = (newScenario) => async (dispatch) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    await Promise.all([dispatch(createScenario(newScenario, false))]);

    return dispatch({ type: LOADING_SCENARIO_DONE, applyLoading: true });

}

export const showScenario = (idScenario) => async (dispatch) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    await Promise.all([dispatch(fetchScenario(idScenario, "Entrant", "J900", false, true, false))]);

    return dispatch({ type: LOADING_SCENARIO_DONE, applyLoading: true });
}

export const fetchScenarios = (idUser, applyLoading = true) => async (dispatch) => {
    if (applyLoading) await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/ListScen?userId=${idUser}&academyId=null`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = [];
    data.Scenarios.forEach(scenario => {
        result.push({ key: scenario.Id, text: scenario.Name, value: scenario.Id, first_year: scenario.First_year, last_year: scenario.Last_year });
    });

    return dispatch({ type: RECEIVE_SCENARIOS, data: result, applyLoading });
}

export const fetchScenario = (idScenario, degre = "Entrant", parent = "J900", isChangingFiliere = false, filtre = true, applyLoading = true) => async (dispatch, getState) => {
    // INFO: Check if scenario exits
    const { scenarios } = getState();
    if (isChangingFiliere === false) {
        let isThere = false;
        scenarios.openedScenarios.forEach(opened => {
            if (opened.scenario.id === idScenario) {
                isThere = true;
            }
        });
        if (isThere) return dispatch(informationError(`Ce scénario est déjà ouvert`));
    }

    // INFO: GetScenario
    if (applyLoading) await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/GetFirstTreeScenario?id=${idScenario}&isNew=${false}&parent=${parent}&degre=${degre}&filtre=${filtre}`;

    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()))
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if(isChangingFiliere) data["deg"] = degre;
    const degresModifies=data.degres_modifies;
    const createdObj = createScenarioObject(idScenario, data);
    const openedScenariosCopied = [...scenarios.openedScenarios];

    if (createdObj.scenario.currentDegre !== "Entrant" && isChangingFiliere === false) {
        let trueDeg = createdObj.scenario.currentDegre;
        if (createdObj.scenario.currentDegre == 8) trueDeg = "Academie";
        else if (createdObj.scenario.currentDegre === 7) trueDeg = "Diplome";
        const res = await changeDegre(trueDeg, idScenario)(dispatch, getState);

        res.data.scenario["currentDegre"] = createdObj.scenario.currentDegre;
        res.data.scenario["name"] = createdObj.scenario.name;

        const newScenario = {...res.data};

        newScenario.scenario.degresModifies=degresModifies;
        
        openedScenariosCopied.push(newScenario);
        const result = {
            openedScenarios: openedScenariosCopied,
        };
        return dispatch({ type: RECEIVE_SELECTED_SCENARIO, data: result, applyLoading });
    }

    const newScenario = { ...createdObj };
    newScenario.scenario.degresModifies=degresModifies;
    openedScenariosCopied.push(newScenario);
    const result = {
        openedScenarios: openedScenariosCopied,
    }

    if (isChangingFiliere === false)
        return dispatch({ type: RECEIVE_SELECTED_SCENARIO, data: result, applyLoading });

    return dispatch({ type: LOADING_SCENARIO_DONE, data: newScenario, applyLoading });
}

const createScenarioObject = (idScenario, data) => {
    const allVariables = [];
    const hypoVariables = [];
    const resVariables = [];
    const degresModifies=[];
    const degre = data.deg == 0 || data.deg == undefined ? "Entrant" : data.deg;

    const tousVariable = {
        Name: "Tous",
        RealName: "Tous",
        Id: idScenario,
        Parent: "Tous",
        Root: "Hypotheses"
    };
    hypoVariables.push(tousVariable);
    tousVariable["Root"] = "Resultats";
    resVariables.push({ ...tousVariable });

    data.scen1.forEach(serie => {
        serie['IdParent'] = idScenario;
        serie["degree"] = degre;
        serie["Root"] = "Hypotheses";
        const variable = {
            Name: serie.Name,
            RealName: serie.RealName,
            Id: idScenario,
            Parent: serie.Parent,
            Root: "Hypotheses"
        };
        allVariables.push(variable);
        hypoVariables.push({ ...variable });
    });

    data.scen2.forEach(serie => {
        serie['IdParent'] = idScenario;
        serie["degree"] = degre;
        serie["Root"] = "Resultats";
        const variable = {
            Name: serie.Name,
            RealName: serie.RealName,
            Id: idScenario,
            Parent: serie.Parent,
            Root: "Resultats"
        };
        allVariables.push(variable);
        resVariables.push({ ...variable });
    });


    const scenario = {
        id: idScenario,
        name: data.Name,
        seriesHypo: data.scen1,
        seriesRes: data.scen2,
        years: data.YearsCount,
        lastYear: data.LastYear,
        time: new Date().getTime(),
        currentDegre: degre,
        degresModifies: data.degres_modifies
    };
    // TODO: LICENCE_N3_J_900 dans diplome a une erreur, LICENCE_N3_J_200, _104, _400 etc.. ne figurent pas, C EST PROBABLEMENT UNE ERREUR XML
    // TODO: DIP_LI_N3_J dans diplome
    // TODO: DIP_LP_N3_J dans diplome

    scenario["seriesHypo"] =  scenario["seriesHypo"].filter(serie => serie.Name !== "LICENCE_N3_J_900");
    scenario["seriesRes"] =  scenario["seriesRes"].filter(serie => serie.Name !== "DIP_LI_N3_J" && serie.Name !== "DIP_LP_N3_J");

    return {
        scenario: scenario,
        variables: allVariables,
        hypoVariables,
        resVariables
    };
}

export const closeScenario = (idScenario) => async (dispatch, getState) => {
    const { scenarios } = getState();
    const openedScenariosCopied = [...scenarios.openedScenarios];
    const filteredOpened = openedScenariosCopied.filter((opened) => {
        return opened.scenario.id !== idScenario;
    });
    return dispatch({ type: DELETE_SCENARIO, data: filteredOpened })
}

export const enregistrerScenario = (idScenario, userId, serie = "[]", shouldShowMess = true) => async (dispatch) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/SaveTreeScenario?id=${idScenario}&serie=${serie}`; //TODO: is the parameter serie always set to "[]"
    const response =  await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if(shouldShowMess){
        await dispatch(fetchScenarios(userId));
        return dispatch(informationSuccess("Scénario enregistré avec succès"));
    }else{
        return dispatch(fetchScenarios(userId));
    }
    
}

export const deleteScenario = (idScenario, idUser) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/Supprimer?id=${idScenario}`;
    const response =  await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if (data) {
        await dispatch(closeScenario(idScenario));
        await dispatch(fetchScenarios(idUser));

        return dispatch(informationSuccess("Scénario supprimé avec succès"));
    }
    else {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError("Vous ne pouvez pas supprimer ce Scénario car il est lié avec un ou plusieurs Récapitulatifs"));
    }
}

export const openScenarioVariable = (idVariable, idScenario, degre) => async (dispatch, getState) => {
    if (idVariable === "EFF") return dispatch({ type: RECEIVE_SCENARIO_VARIABLE_OPENED, data: [] });

    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/OpenRowChildScenario?id=${idVariable}&name=${idScenario}&detail=${degre}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.Datas.forEach(serie => {
        serie['IdParent'] = idScenario;
        serie['degree'] = degre;
    });
    return dispatch({ type: RECEIVE_SCENARIO_VARIABLE_OPENED, data: data.Datas });
}

export const openScenarioVariableWithChildren = (idVariable, idScenario, degre) => async (dispatch, getState) => {
    if (idVariable === "EFF") return dispatch({ type: RECEIVE_SCENARIO_VARIABLE_WITH_CHILDREN_OPENED, data: [] });
    await dispatch({ type: LOADER_SCENARIO });

    const url = `${serverIP}/Scenario/DepliageScenario?id=${idVariable}&name=${idScenario}&detail=${degre}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.Datas.forEach(serie => {
        serie['IdParent'] = idScenario;
        serie['degree'] = degre;
    });
    return dispatch({ type: RECEIVE_SCENARIO_VARIABLE_WITH_CHILDREN_OPENED, data: data.Datas });
}

export const openScenarioVariableWithChildrenSimple = async (idVariable, idScenario, degre, dispatch) => {

    const url = `${serverIP}/Scenario/DepliageScenario?id=${idVariable}&name=${idScenario}&detail=${degre}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        throw await response.text();
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.Datas.forEach(serie => {
        serie['degree'] = degre;
        serie['IdParent'] = idScenario;
    });

    return data.Datas;
}

export const openScenarioVariableWithChildrenMultiple = (variables, idScenario, degre) => async (dispatch, getState) => {
    await dispatch({ type: LOADER_SCENARIO });

    const promises = [];
    variables.forEach(variable => {
        promises.push(() => openScenarioVariableWithChildrenSimple(variable.Name, idScenario, degre, dispatch));
    });

    const response = await Promise.all(promises.map(f => f()));

    const result = [].concat(...response);
    result.forEach(serie => {
        serie["IdParent"] = idScenario
        serie["degree"] = degre
    });

    return dispatch({ type: RECEIVE_SCENARIO_VARIABLE_MULTIPLE_WITH_CHILDREN_OPENED, data: result });
}

export const changeDegre = (degre, idScenario) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/ChangeDegre?id=${idScenario}&degre=${degre}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data["deg"] = degre;
    const result = createScenarioObject(idScenario, data);
    return dispatch({ type: CHANGE_DEGRE_SCENARIO, data: result });
}

export const getTreeFiliere = (applyLoading = true) => async (dispatch, getState) => {
    if (applyLoading) await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/GetTreeFiliere`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    return dispatch({ type: RECEIVE_FILIERES, data: data, applyLoading });
}

export const reconduireVariable = (idScenario, variable, vcopie, degre,filiere) => async (dispatch, getState) => {
    await dispatch({ type: LOADER_SCENARIO });

    const url = `${serverIP}/Scenario/ReconduireVariable?id=${idScenario}&name=${variable.Name}&vcopie=${vcopie}&degre=${degre}&parent=${filiere}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.scen1.forEach(serie => {
        serie["IdParent"] = idScenario
    });
    data.scen2.forEach(serie => {
        serie["IdParent"] = idScenario
    });
    const result = {
        seriesHypo: data.scen1,
        seriesRes: data.scen2
    }
    return dispatch({ type: SCENARIO_RECONDUIRE_VARIABLE_DONE, data: result });
}

export const reconduireVariables = (idScenario, vcopie, degre,filiere) => async (dispatch, getState) => {
    await dispatch({ type: LOADER_SCENARIO });

    const url = `${serverIP}/Scenario/ReconduireVariables?id=${idScenario}&vcopie=${vcopie}&degre=${degre}&parent=${filiere}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    data.scen1.forEach(serie => {
        serie["IdParent"] = idScenario
    });
    data.scen2.forEach(serie => {
        serie["IdParent"] = idScenario
    });
    const result = {
        seriesHypo: data.scen1,
        seriesRes: data.scen2
    }
    return dispatch({ type: SCENARIO_RECONDUIRE_VARIABLES_DONE, data: result });
}

export const calculContexte = (idScenario, degre,filiere) => async (dispatch, getState) => {
    await dispatch({ type: LOADER_SCENARIO });

    let newDeg = -1;
    switch (degre) {
        case "Entrant":
            newDeg = 1;
            break
        case "Diplome":
            newDeg = 8;
            break;
        case "Academie":
            newDeg = 9;
            break;
        default:
            newDeg = parseInt(degre) + 1;
    }
    const url = `${serverIP}/Scenario/CalculContexte?id=${idScenario}&degre=${degre}&newdeg=${newDeg}&parent=${filiere}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const scenario = createScenarioObject(idScenario, data);

    return dispatch({ type: SCENARIO_CALCUL_CONTEXTE_DONE, data: scenario });
}

export const exportScenario = (idScenario, degre, variables) => async (dispatch, getState) => {
    await dispatch({ type: LOADER_SCENARIO });
    const url = `${serverIP}/Scenario/ExportScenarioCSV?id=${idScenario}&degre=${degre}&vars=${variables}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    dispatch(informationSuccess("Export réussi."));
    return dispatch({ type: EXPORTED_SCENARIO, data: data });
}

export const createScenario = (newScenario, applyLoading = true) => async (dispatch, getState) => {

    const { scenarios } = getState();
    if (applyLoading) await dispatch({ type: LOADER_SCENARIO });
    let id = "newId0";

    const name = newScenario.nomScenario;
    let newYears = `${newScenario.anneeDepartScenario}_${newScenario.anneeFinScenario}`; // TODO: check anneeFinConstat > anneeDepartConstat
    const isNew = newScenario.isNew;
    const idConstat = newScenario.idConstatOrScenario;
    const parent = "J900";
    const degre = null;
    const isEasy = newScenario.isEasy;
    const filtre = false;
    const hypoVars = "";
    const resVars = "";
    let url = ``;
    if (newScenario.isNew === false) {
        url = url + `${serverIP}/Scenario/GetScenario?id=${idConstat}&name=${name}&isNew=${isNew}&isEasy=${isEasy}`;
    } else {
        url = url + `${serverIP}/Scenario/GetFirstTreeScenario?id=${id}&name=${name}&newYears=${newYears}&isNew=${isNew}&idConstat=${idConstat}&parent=${parent}&degre=${degre}&isEasy=${isEasy}&filtre=${filtre}&hypoVars=${hypoVars}&resVars=${resVars}`;
    }



    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);

    const createdObj = createScenarioObject(data.Id, data);
    createdObj.scenario["name"] = name;


    const openedScenariosCopied = [...scenarios.openedScenarios];

    openedScenariosCopied.push({ ...createdObj });

    const result = {
        openedScenarios: openedScenariosCopied,
    }

    const first_year = createdObj.scenario.years[0];
    const last_year = createdObj.scenario.years[createdObj.scenario.years.length - 1];
    // INFO: Append the constat to list of constats
    const allCopied = [...scenarios.all];
    allCopied.push({ key: createdObj.scenario.id, text: createdObj.scenario.name, value: createdObj.scenario.id, first_year, last_year });

    return dispatch({ type: CREATED_SCENARIO, data: result, all: allCopied, applyLoading });
}

export const calculMereScenario = (row, degre ) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);

    const url = `${serverIP}/Scenario/CalculMeresScenario?id=${row.id}&year=${row.year}&valStr=${row.valStr}&variable=${row.variable}&parent=${row.parent}&degre=${degre}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    if(!data) {
        return dispatch({ type: RECEIVED_CALCULMERES_SCENARIO, data:{} });
    }
    // INFO: WE add the modified variable since it is not added in the response.json()
    data.newSeries.push({ Variable: row.variable, Value: row.parsedVal });
    data.newSeries.forEach(d => d["year"] = row.year);
    const result = {
        newSeries: [...data.newSeries],
        degres_modifies: data.degres_modifies
    }
    return dispatch({ type: RECEIVED_CALCULMERES_SCENARIO, data: result });
}

export const getArchivedScenario = (userId, academy) => async (dispatch) => {
    await dispatch({ type: LOADER_SCENARIO });
    const url = `${serverIP}/Scenario/GetScenarioArchive?id=archive_scenarios&name=Archive_scenarios&type=null&user=${userId}&academy=${academy}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_ARCHIVED });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = data.archives;
    return dispatch({ type: RECEIVE_ARCHIVED_SCENARIO, data: result });
}

export const renameScenario = (idScenario, scenarioName, idUser) => async (dispatch, getState) => {
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const { scenarios } = getState();
    const url = `${serverIP}/Scenario/UpdateScenarioName?_id=${idScenario}&name=${scenarioName}&userId=${idUser}`;
    const response =  await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }

    await dispatch(fetchScenarios(idUser));
    scenarios.openedScenarios.forEach(opened => {
        if (opened.scenario.id === idScenario) {
            opened.scenario.name = scenarioName
        }
    });
    const json = await response.json();
    const data = JSON.parse(json);
    
    await dispatch({type: SCENARIO_RENAMED});
    return dispatch(informationSuccess("Scénario renommé avec succès"));
}

export const calculateAll = (idScenario, lastYear, currentDegre, lastDegreeOpen, islastDegree, isNationalUser) => async (dispatch, getState) => {
   
    await Promise.all([dispatch({ type: LOADER_SCENARIO })]);
    const url = `${serverIP}/Scenario/CalculateAll?idScenario=${idScenario}&lastYear=${lastYear}&currentDegree=${currentDegre}&lastDegreeOpen=${lastDegreeOpen}&islastDegree=${islastDegree}&isNationalUser=${isNationalUser}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({ type: ERROR_SCENARIO });
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    // await dispatch(informationSuccess("Calculs effectués avec succès"))
    return dispatch({ type: SCENARION_CALCUL_ALL_DONE, data: data});
}  
