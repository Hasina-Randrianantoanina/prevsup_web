import serverIP from "../components/Function/ServerInfo"
import {DOWNLOADING_FILE, FILE_DOWNLOADED, ERROR_DOWNLOADING, RECEIVE_USER_GUIDE_NAME} from "./types"
import {informationError, informationSuccess, handleError } from ".";
import { LOADER_IMPORT, ERROR_IMPORT, SUCCES_IMPORT } from "./types";
import { saveAs } from "file-saver";


export const downloadUserGuide = () => async (dispatch) => {
    await dispatch({ type: DOWNLOADING_FILE })
    const url = `${serverIP}/UserGuide/DownloadUserGuide`;
    const urlUserGuideName = `${serverIP}/UserGuide/GetUserGuideName`;
    
    const response = await fetch(url, { method: 'get' });
    const responseName = await fetch(urlUserGuideName,{method: 'get'});
   
    if (!response.ok || !responseName.ok) {
        await dispatch({ type: ERROR_DOWNLOADING });
        return dispatch(informationError("Guide utilisateur indisponible, veuillez contacter l'administrateur."));
    }
    const json = await responseName.json();
    const data = JSON.parse(json);
    
    const blob = await response.blob();
    saveAs(blob,data.name);
    await dispatch({ type: FILE_DOWNLOADED });
    return await dispatch(informationSuccess("Guide utilisateur téléchargé avec succès."));
}
export const getUserGuideName = () =>async (dispatch) =>{
    const urlUserGuideName = `${serverIP}/UserGuide/GetUserGuideName`;
    const responseName = await fetch(urlUserGuideName,{method: 'get'});
    if (!responseName.ok) {
        return await dispatch({ type: ERROR_DOWNLOADING });
        // return dispatch(informationError(await responseName.text()));
        
    }
    const json = await responseName.json();
    const data = JSON.parse(json);
    return await dispatch({type: RECEIVE_USER_GUIDE_NAME,data:data.name});
}

export const uploadUserGuide = (file) => async(dispatch)=> {
    let body= new FormData();
    body.append("file", file)
    const url = `${serverIP}/UserGuide/UploadUserGuide`;
    const response = await (fetch(url, { method: 'post', body: body }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_IMPORT});
        return dispatch(informationError(await response.text()));
    }

    await dispatch({type: SUCCES_IMPORT});
    return dispatch(informationSuccess('Importation guide utilisateur réussie.'));
}