import academies from "./Academies";
import constats from "./Constats";
import information from "./Information";
import recapitulatifs from "./Recapitulatifs";
import scenarios from "./Scenarios";
import importData from "./ImportData";
import users from "./Users";
import archive from "./Archive";
import userGuide from "./UserGuide";
import appInfo from "./AppInfo";

const rootReducer = (state = {}, action) => {

    return {
        academies: academies(state.academies, action),
        constats: constats(state.constats, action),
        recapitulatifs: recapitulatifs(state.recapitulatifs, action),
        information: information(state.information, action),
        scenarios: scenarios(state.scenarios, action),
        importData: importData(state.importData, action),
        users: users(state.users, action),
        archives: archive(state.archives, action),
        userGuide: userGuide(state.userGuide,action),
        appInfo: appInfo(state.appInfo,action)

    }
};

export default rootReducer;