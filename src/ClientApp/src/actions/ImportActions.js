import { informationSuccess, informationError, handleError } from ".";
import { LOADER_IMPORT, ERROR_IMPORT, SUCCES_IMPORT } from "./types";
import serverIP from "../components/Function/ServerInfo";


export const progressImport = (file) => async (dispatch)=> {
    await Promise.all([dispatch({type: LOADER_IMPORT})]);
    const url=`${serverIP}/ImportData/Progress/`;
    const response = await (fetch(url, { method: 'get' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_IMPORT});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);

    if(data.isRunning){
        return dispatch(informationError('Une importation est déjà en cours. Veuillez contacter votre administrateur système.'));
    }else{
        // do_upload_file(file);
        await Promise.all([dispatch({type: LOADER_IMPORT})]);
        let files=file;
        if(files.length==0){
            return dispatch(informationError('Importation données académiques", "Auncun fichier sélectionné.'));
        }
        let body= new FormData();
        body.append("upload", files)
        const url = `${serverIP}/ImportData/Index`;
        const response = await (fetch(url, { method: 'post', body: body }).catch(err => handleError(err, dispatch)));
        if (!response.ok) {
            await dispatch({type: ERROR_IMPORT});
            return dispatch(informationError(await response.text()));
        }

        const json = await response.json();
        const data = JSON.parse(json);

        await dispatch({type: SUCCES_IMPORT});
        return dispatch(informationSuccess('Importation réussie.'));
    }
}
export const do_upload_file = (file) => async (dispatch)=>{
    // await Promise.all([dispatch({type: LOADER_IMPORT})]);
    // let files=file;
    // if(files.length==0){
    //     await dispatch(informationError('Importation données académiques", "Auncun fichier sélectionné.'));
    //     return;
    // }
    let data= new FormData();
    // data.append("upload", files[0])
    //console.log(data)
    //console.log("data eto")
    // const url = `${serverIP}/ImportData/Index?upload=${files}`;
    // const response = await fetch(url, { method: 'post' });
    // if (!response.ok) {
    //     //console.log(response);
    //     await dispatch({type: ERROR_IMPORT});
    //     return dispatch(informationError(await response.text()));
    // }else{
    //     await dispatch({type: SUCCES_IMPORT});
    //     return dispatch(informationSuccess('Importation réussi.'));
    // }

}

