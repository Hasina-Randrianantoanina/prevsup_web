import { informationSuccess, informationError, handleError } from ".";
import { CREATE_USER, LOADER_USER, ERROR_USER, RECEIVE_USERS, UPDATE_USER, RECEIVE_COLORS, RECEIVE_APP_INFO,UPDATE_APP_INFO,LOADING_APP_INFO, RECEIVE_EXPORT_OPTION} from "./types";
import serverIP from "../components/Function/ServerInfo";

export const createUser = (newUser) => async (dispatch) =>{
    await dispatch({type: LOADER_USER});
    const login = newUser.login;
    const nom = newUser.nom;
    const mdp = newUser.mdp;
    const profil = newUser.profil;
    const academies = newUser.academies;
    let url=`${serverIP}/User/CreateUser?login=${login}&nom=${nom}&password=${mdp}&academies=${academies}&profile=${profil}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }else{
        await dispatch({type: CREATE_USER});
        await dispatch(fetchUsers());
        return dispatch(informationSuccess('Utilisateur créé.'))
    }
}

export const fetchUsers = () => async (dispatch) =>{
    await dispatch({type: LOADER_USER});
    const url = `${serverIP}/User/ListUsers?userId&academyId=null`; // TODO: change userId in case of many administrator
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    const result = [];
    data.forEach(user => {
        const academies =  user.Academies ?  user.Academies.split(","): [];
        result.push({ id: user.Id, key: user.Id, text: user.Login, value: user.Id, login: user.Login,nom: user.Name,academies: academies, password: user.Password });
    })

    return dispatch({ type: RECEIVE_USERS, data: result });
}

export const deleteUser = (idUser) => async (dispatch) =>{

    await Promise.all([dispatch({ type: LOADER_USER })]);
    const url = `${serverIP}/User/DeleteUser?id=${idUser}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if(!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }else{
        await dispatch(fetchUsers());
        
        return dispatch(informationSuccess("Utilisateur supprimé avec succès"));
    
    }
    
    
}
export const updateUserPassword = (newPassword) => async(dispatch) =>{
    await dispatch({type: LOADER_USER});
    const url= `${serverIP}/USer/UpdateUserPassword?login=${newPassword.login}&password=${newPassword.newPassword}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    await dispatch({type:UPDATE_USER});
    return dispatch(informationSuccess("Mot de passe modifié avec succès"));
}

export const updateUser = (updatedUser) => async (dispatch, getState) =>{

    await Promise.all([dispatch({ type: LOADER_USER })]);
    const login=updatedUser.login;
    const nom=updatedUser.nom;
    const academies=updatedUser.academies;
    const password=updatedUser.password;
    const url = `${serverIP}/User/UpdateUser?login=${login}&nom=${nom}&academies=${academies}&password=${password}`;
    const response =  await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if(!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }

    // INFO: We update the user in the list of users
    const {users} = getState();
    const allCopied = [...users.all];
    const newAll = [];
    allCopied.forEach(user => {
        if(user.id === updatedUser.id) {
            newAll.push(updatedUser);
        } else {
            newAll.push(user);
        }
    });

    await dispatch({ type: RECEIVE_USERS, data: newAll });
    return dispatch(informationSuccess("Utilisateur modifié avec succès"));
}

// export const getColorUI = (userId) => async (dispatch, getState) =>{

//     await Promise.all([dispatch({ type: LOADER_USER })]);
   
//     const url = `${serverIP}/User/GetColorUI?userid=${userId}`;
//     const response = await fetch(url, {method: 'post'});
//     if(!response.ok) {
//         await dispatch({type: ERROR_USER});
//         return dispatch(informationError(await response.text()));
//     }
//     const json = await response.json();
//     const data = JSON.parse(json); 
//     console.log(data)
//     return await dispatch({ type: RECEIVE_COLORS,data:data});
    
// }

export const changeColorUI = (colors,userId) => async (dispatch, getState) =>{

    await Promise.all([dispatch({ type: LOADER_USER })]);
   
    const url = `${serverIP}/User/ChangeColorUI?user=${userId}`;
    const response = await fetch(url, {method: 'post', body: JSON.stringify(colors),headers: { 'Content-Type': 'application/json' }});
    if(!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    await dispatch({type: RECEIVE_COLORS,data: colors});
    //  await dispatch(getColorUI(userId));
    // const json = await response.json();
    // const data = JSON.parse(json); 
    return dispatch(informationSuccess("Interface modifié avec succès"));
}

export const setColorUI = (colors) => async (dispatch, getState) => {
    return dispatch({type: RECEIVE_COLORS,data: colors});
}

export const getAppInfo = () => async (dispatch) =>{
    await dispatch({type: LOADING_APP_INFO});
    const url = `${serverIP}/AppInfo/GetAppInfo`;
    const response = await (fetch(url, { method: 'get' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    return dispatch({ type: RECEIVE_APP_INFO, data: data });
}

export const setGraphExportOption = (isComplete,userId) => async (dispatch, getState)=>{
    await dispatch({type: LOADER_USER});
    const url= `${serverIP}/User/UpdateExportOptionGraph?isComplete=${isComplete}&userId=${userId}`;
    const response = await (fetch(url, { method: 'post' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    await dispatch({type: RECEIVE_EXPORT_OPTION, data:data})
    await dispatch(getGraphExportOption(userId))
    return dispatch(informationSuccess("Enregistrement effectué"))
}

export const getGraphExportOption = (userId) => async (dispatch, getState)=>{
    await dispatch({type: LOADER_USER});
    const url= `${serverIP}/User/GetExportOptionGraph?userId=${userId}`;
    const response = await (fetch(url, { method: 'get' }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    return dispatch({type: RECEIVE_EXPORT_OPTION, data:data})
}
    

export const updateAppInfo = (info) => async (dispatch) =>{
    await dispatch({type: LOADING_APP_INFO});
    const url = `${serverIP}/AppInfo/ChangeAppInfo`;
    let body= new FormData();
    body.append("info", info)
    const response = await (fetch(url, { method: 'post', body: body }).catch(err => handleError(err, dispatch)));
    if (!response.ok) {
        await dispatch({type: ERROR_USER});
        return dispatch(informationError(await response.text()));
    }
    const json = await response.json();
    const data = JSON.parse(json);
    await dispatch(getAppInfo());
    await dispatch(informationSuccess("Modification réussi"));
    return dispatch({ type: UPDATE_APP_INFO, data: data });
}