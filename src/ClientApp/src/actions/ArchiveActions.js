import {LOADER_ARCHIVE, SUCCES_ARCHIVED, ERROR_ARCHIVED} from "./types"
import { handleError, informationError, informationSuccess } from ".";
import serverIP from "../components/Function/ServerInfo";
import {fetchConstats} from "../actions/ConstatActions";
import { fetchRecapitulatifs } from "../actions/RecapitulatifActions";
import { fetchScenarios } from "../actions/ScenarioActions";
import {getArchivedConstat} from "../actions/ConstatActions";
import {getArchivedScenario} from "../actions/ScenarioActions";
import {getArchivedRecap} from "../actions/RecapitulatifActions";

export const archiveSave = (userId,academy,ListArchive, type) => async (dispatch) => {
    await dispatch({type: LOADER_ARCHIVE});
    const url = `${serverIP}/Archive/ArchiveSave?ListArchive=${ListArchive}&type=${type}&test=null`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_ARCHIVED});
        return dispatch(informationError(await response.text()));
    }
    const data = await response.json();
    // const data = JSON.parse(json);
    
    if(type==="Constat") {await dispatch(getArchivedConstat(userId,academy));await dispatch(fetchConstats(userId));} 
    else if(type==="Scenario") {await dispatch(getArchivedScenario(userId,academy));await dispatch(fetchScenarios(userId)); }
    else  {await dispatch(getArchivedRecap(userId,academy));await dispatch(fetchRecapitulatifs(userId));} 
   
    await dispatch(informationSuccess("Enregistrement effectué"));
    return dispatch({ type: SUCCES_ARCHIVED, data: data });
    
}
// export const getArchived =(type,user, academy) =>async (dispatch) => {
//     // 615c1b8dde38e583f951ed35
//     // academy 62e271d189c840d1300b4c0c
//     await dispatch({type: LOADER_ARCHIVE});
//     const url = `${serverIP}/Archive/GetInterfaceArchive?id=archive_constats&name=Archive_constats&type=${type}&user=${user}&academy=${academy}`;
//     const response = await fetch(url, { method: 'post' });
//     if (!response.ok) {
//         await dispatch({type: ERROR_ARCHIVED});
//         return dispatch(informationError(await response.text()));
//     }
//     const xmlD = await response.text().then(str => new window.DOMParser().parseFromString(str, "text/xml"));
//     //const data = JSON.parse(json);
//     //console.log(xmlD.getElementsByName("archives"));
//     //console.log(xmlD.getElementsByTagName("option"));
//     return dispatch(informationSuccess("Enregistrement effectué"));
//     // return dispatch({ type: SUCCES_ARCHIVED, data: data });
// }