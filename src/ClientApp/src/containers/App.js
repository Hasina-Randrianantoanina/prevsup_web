import './App.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { clearInformation, closeConstat, progressImport, fetchAcademiesUser, fetchAllAcademies, fetchConstats, fetchRecapitulatif, fetchRecapitulatifs, informationError, informationSuccess, createUser, fetchUsers, deleteUser, updateUser, updateUserPassword, closeRecap, getArchivedConstat, archiveSave, createRecap, resetAllData, getArchivedRecap, getArchivedScenario, changeColorUI, setColorUI, showConstat, showScenario, createScenarioAndFetchData, createConstatAndFetchData, fetchProprietes, fetchUserDatas, downloadUserGuide, uploadUserGuide,getUserGuideName,updateAppInfo,getAppInfo, renameScenario, calculateAll,  setGraphExportOption,getGraphExportOption } from '../actions'

import HeaderPrevsup from '../components/HeaderPrev';
import Fade from '../components/message/Fade';

import { Dimmer, Loader, Tab, Button, MenuItem } from 'semantic-ui-react'
import ConstatPane from './Constat/ConstatPane';
import { closeScenario, fetchScenarios, getTreeFiliere } from '../actions/ScenarioActions';
import ScenarioPane from './Scenario/ScenarioPane';
import Login from '../components/Login/Login';
import RecapitulatifPane from './Recapitulatif/RecapitulatifPane';
import serverIP from '../components/Function/ServerInfo';
import scenarios from '../reducers/Scenarios';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isCreateConstatModalOpen: false,
      isOpenConstatModalOpen: false,

      isOpenRecapitulatifModalOpen: false,

      isOpenScenarioModalOpen: false,
      isCreateScenarioModalOpen: false,

      isLoginModalOpen: false,
      isModifyUserModalOpen: false,
      isDeleteUserModalOpen: false,
      isShowUserModalOpen: false,
      isOpenArchiveConstatModal: false,
      isOpenArchiveRecapitulatifModal: false,
      isOpenArchiveScenarioModal: false,
      paneActiveIndex: 0
    }
  }

  componentDidMount() {
    this.fetchAllData();
  }
  

  fetchAllData = async () => {

    const isAuth = this.isAuthenticated();
    const {getAppInfo}=this.props;
    getAppInfo();
    if (isAuth === true) {
      const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));

      if (this.isAdmin()) {
        const { findAllUser, findAllAcademies } = this.props;
        findAllUser();
        findAllAcademies();
      } else {
        const { fetchUserDatas,getUserGuideName , getGraphExportOption} = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        fetchUserDatas(userAuthenticated);
        getUserGuideName();
        getGraphExportOption(userId);

      }
      const { setColorUI } = this.props;
      setColorUI(userAuthenticated.colorUI);
    }
  }

  updatePaneIndex = () => {
    const { constats, scenarios, recapitulatifs } = this.props;
    const index = constats.openedConstats.length + scenarios.openedScenarios.length + recapitulatifs.openedRecapitulatifs.length - 1;
    this.setState({ paneActiveIndex: index });
  }

  // CONSTAT

  handleCreateConstat = async (newConstat) => {
    // console.log(newConstat)
    const { createConstatAndFetchData } = this.props;
    const userId = JSON.parse(sessionStorage.getItem("user")).id;
    const response = await createConstatAndFetchData(newConstat, userId);
    this.updatePaneIndex();
    return response;
  }

  setCreateConstatModal = async (value) => {
    const isAuth = this.isAuthenticated();
    if (isAuth === true) {
      this.setState({ isCreateConstatModalOpen: value });
    }
  }

  setOpenConstatModal = async (value) => {
    const isAuth = this.isAuthenticated();
    if (isAuth === true) {
      this.setState({ isOpenConstatModalOpen: value });
    }
  }

  showConstat = async (idConstat) => {
    const { findConstat, showConstat } = this.props;
    this.setOpenConstatModal(false);
    await showConstat(idConstat);
    this.updatePaneIndex();
  }

  //USER
  showUser = (selectedUser) => {
  }
  setShowUserModal = (value) => {
    this.setState({ isShowUserModalOpen: value });
  }
  setModifyUserModal = (value) => {
    this.setState({ isModifyUserModalOpen: value });
  }


  deleteUser = (idUser) => {
    const { findUser } = this.props;
    this.setDeleteUserModal(false);
    deleteUser(idUser).then(d => {
      this.updatePaneIndex();
    });
  }
  setDeleteUserModal = (value) => {
    this.setState({ isDeleteUserModalOpen: value });
  }
  getGraphExportOption= (userId) => {
    const{getGraphExportOption} = this.props;
    getGraphExportOption(userId)
  }
  setGraphExportOption = (isComplete,userId) => {
    const{setGraphExportOption} = this.props;
    setGraphExportOption(isComplete,userId);
  }

  //App info
  updateAppInfo = (info) =>{
    const {updateAppInfo} = this.props;
    updateAppInfo(info);
  }
  // SCENARIO
  setCreateScenarioModal = async (value) => {
    if (this.isAuthenticated()) {
      this.setState({ isCreateScenarioModalOpen: value })
    }
  }

  setOpenScenarioModal = async (value) => {
    if (this.isAuthenticated()) {
      this.setState({ isOpenScenarioModalOpen: value })
    }
  }

  showScenario = async (idScenario) => {
    const { showScenario } = this.props;
    this.setOpenScenarioModal(false);
    await showScenario(idScenario);
    this.updatePaneIndex();
  }

  handleCreateScenario = (newScenario) => {
    const { createScenarioAndFetchData } = this.props;
    createScenarioAndFetchData(newScenario).then(d => {
      this.updatePaneIndex();
    });
  }

  // RECAP
  setCreateRecapitulatifModal = async (value) => {
    if (this.isAuthenticated()) {
      this.setState({ isCreateRecapitulatifModalOpen: value })
    }
  }

  setOpenRecapitulatifModal = async (value) => {
    if (this.isAuthenticated()) {
      this.setState({ isOpenRecapitulatifModalOpen: value });
    }

  }

  showRecapitulatif = (idRecapitulatif) => {
    const { findRecapitulatif } = this.props;
    this.setOpenRecapitulatifModal(false);
    findRecapitulatif(idRecapitulatif).then(d => {
      this.updatePaneIndex();
    })
  }

  hanldeCreateRecapitulatif = (newRecap) => {
    const { createRecap } = this.props;
    createRecap(newRecap).then(d => {
      this.updatePaneIndex();
    })
  }

  // LOGIN
  setLoginModal = (value) => {
    this.setState({ isLoginModalOpen: value });
  }

  login = async (user) => {
    const response = await (fetch(`${serverIP}/User/Login?username=${user.username}&password=${user.password}`, { method: 'post' }).catch(err => {
      throw "Erreur: serveur indisponible.";
    } ));
    if (!response.ok) {
      throw await response.text();
    }
    const json = await response.json();
    const data = JSON.parse(json);
    // console.log(data)
    let academies = [];

    if (data.Academies) {
      academies = data.Academies.split(",");
    } else {
      if (data.Academy) {
        academies.push(data.Academy.Id);
      }
    }
    let defaultColor = data.colorUI;


    if (!data.colorUI) {
      defaultColor = {
        active: "#0db4ea",
        back: "#ffffff",
        calcback: "#dbb9b9",
        calcconst: "#000000",
        calcscen: "#000000",
        constatdata: "#000000",
        scenback: "#dbb9b9",
        scendata: "#000000",
        separator: "#ff0a11"
      }
    }
    const connectedUser = {
      login: data.Login,
      name: data.Name,
      id: data.Id,
      profile: data.Profile,
      colorUI: defaultColor,
      academies,
      password: data.Password
    }



    sessionStorage.setItem("user", JSON.stringify(connectedUser));
    const { setColorUI } = this.props;
    setColorUI(connectedUser.colorUI);
    this.fetchAllData();
    this.setLoginModal(false);
  }

  logout = async () => {
    const { resetAllData } = this.props;
    this.setLoginModal(false);
    await resetAllData();
    sessionStorage.removeItem("user");
    this.setLoginModal(true);
  }

  isAuthenticated = () => {
    const foundUser = sessionStorage.getItem("user");
    if (foundUser) return true;
    return false;
  }

  isAdmin = () => {
    const foundUser = sessionStorage.getItem("user");
    if (foundUser) {
      const parsedUser = JSON.parse(foundUser);
      if (parsedUser["login"] === "admin") return true;
    }
    return false;
  }

  //Archive
  getArchivedConstat = async (userId, academy) => {
    const { getArchiveConstat } = this.props;
    return await getArchiveConstat(userId, academy);
  }
  getArchivedScenario = async (userId, academy) => {
    const { getArchiveScenario } = this.props;
    return await getArchiveScenario(userId, academy);
  }
  getArchivedRecap = async (userId, academy) => {
    const { getArchiveRecap } = this.props;
    return await getArchiveRecap(userId, academy);
  }
  saveArchive = (userId, userAcademies, ListArchive, type) => {
    const { archiveSave } = this.props;
    archiveSave(userId, userAcademies, ListArchive, type);
  }

  setOpenArchiveConstatModal = async (value) => {
    if (this.isAuthenticated()) {
      const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));
      if (value) await this.getArchivedConstat(userAuthenticated.id, userAuthenticated.academies.toString());
      this.setState({ isOpenArchiveConstatModal: value });
    }
  }

  setOpenArchiveRecapitulatifModal = async (value) => {
    if (this.isAuthenticated()) {
      const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));
      if (value) await this.getArchivedRecap(userAuthenticated.id, userAuthenticated.academies.toString());
      this.setState({ isOpenArchiveRecapitulatifModal: value })
    }
  }

  setOpenArchiveScenarioModal = async (value) => {
    if (this.isAuthenticated()) {
      const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));
      if (value) await this.getArchivedScenario(userAuthenticated.id, userAuthenticated.academies.toString());
      this.setState({ isOpenArchiveScenarioModal: value })

    }
  }
  //ColorUI
  // testGetColorUI= async()=>{
  //   const response = await fetch(`${serverIP}/User/GetColorUI?userid=615c1b8dde38e583f951ed35`, { method: 'post' });
  //   if (!response.ok) {
  //     throw await response.text();
  //   }
  //   const json = await response.json();
  //   const data = JSON.parse(json);
  //   console.log(data);
  // }
  // getColorsUI =(userid)=>{
  //   const {getColorUI}=this.props;
  //   getColorUI(userid);
  // }
  changeColorsUI = (colors, userId) => {
    const { changeColorUI } = this.props;
    changeColorUI(colors, userId);
  }

  // RENDERING
  onTabChange = (event, data) => {
    this.setState({ paneActiveIndex: data.activeIndex });
  }

  render() {

    const { academies, constats, information, clearInfo, closeConstat, recapitulatifs, scenarios, closeScenario, progressImport, importData, createUser, users, deleteUser, updateUser, updateUserPassword, closeRecap, archives,appInfo,downloadUserGuide, uploadUserGuide,userGuide, renameScenario } = this.props;
    
    if (this.state.isLoginModalOpen || (this.isAuthenticated() == false)) {
      return (Object.keys(appInfo.info).length>0 ? <Login appInfo={appInfo} handleSubmit={this.login} />:<div></div>);
    }
    
    // Information
    const isFetching = academies.isFetching || constats.isFetching || recapitulatifs.isFetching || scenarios.isFetching || importData.isFetching || users.isFetching || archives.isFetching || userGuide.isFetching;
    if (information.message !== "") {
      // setTimeout(() => {
      //   clearInfo();
      // }, 2000);
    }

    // Panes
    const constatPanes = [];
    constats.openedConstats.forEach((constat) => {
      constatPanes.push(
        {
          idPanes: constat.time,
          menuItem: <MenuItem key={constat.id}><div>{constat.name}<Button style={{ marginLeft: '7px' }} inverted icon="close" onClick={() => closeConstat(constat.id)} color='red' size='mini' /></div></MenuItem>,
          pane: <Tab.Pane key={constat.id} ><ConstatPane constat={constat} getGraphExportOption={this.getGraphExportOption} /></Tab.Pane>
        });
    });

    const scenarioPanes = [];
    scenarios.openedScenarios.forEach((opened) => {
      scenarioPanes.push(
        {
          idPanes: opened.scenario.time,
          menuItem: <MenuItem key={opened.scenario.id}><div>{opened.scenario.name}<Button style={{ marginLeft: '7px' }} inverted icon="close" onClick={() => closeScenario(opened.scenario.id)} color='red' size='mini' /></div></MenuItem>,
          pane: <Tab.Pane key={opened.scenario.id} ><ScenarioPane filieres={scenarios.allFilieres} scenario={opened.scenario} variables={opened.variables} hypoVariables={opened.hypoVariables} resVariables={opened.resVariables} getGraphExportOption={this.getGraphExportOption} /></Tab.Pane>
        });
    })
    const recapPanes = [];
    recapitulatifs.openedRecapitulatifs.forEach((opened) => {
      recapPanes.push({ idPanes: opened.time, menuItem: <MenuItem key={opened.id}><div>{opened.name}<Button style={{ marginLeft: '7px' }} inverted icon="close" onClick={() => closeRecap(opened.id)} color='red' size='mini' /></div></MenuItem>, pane: <Tab.Pane key={opened.id}><RecapitulatifPane recapitulatif={opened} getGraphExportOption={this.getGraphExportOption} users={users} /></Tab.Pane> });
    });
    // const archiveConstatPanes = [];
    // // if(archiveConstat===true) constatPanes.push({menuItem:"Archive_constats", render : () =>(<Tab.Pane><ConstatArchive/></Tab.Pane>)})
    // const archiveScenarioPanes = [];
    // const archiveRecapPanes = [];
    const panes = constatPanes.concat(scenarioPanes).concat(recapPanes);
    panes.sort((a, b) => {
      return a.idPanes - b.idPanes;
    });

    let height = document.querySelector("#root").clientHeight;
    height = height ? height: document.querySelector("body").clientHeight;
    height = Math.max(height, document.querySelector("body").clientHeight);
    const dimmerStyle = {
      height: `${height}px`
    };
    let top = "35";
    if(height <= document.querySelector("body").clientHeight) top = "50";
    const loaderStyle = {
      position: "absolute", 
      top: `${top}%`, 
      left: "50%",
      zIndex:999
    };

    const tabContent = panes.length > 0 ? (<Tab renderActiveOnly={false} panes={panes} onTabChange={this.onTabChange} activeIndex={this.state.paneActiveIndex} />): (<div></div>)
    return (
      <div>
        <Fade
          clearInfo={clearInfo}
          isError={information.isError}
          message={information.message}
        />
        <Dimmer verticalAlign='top' style={dimmerStyle} active={isFetching}>
          <Loader style={loaderStyle} />
          {/* <img style={{width: "20%", borderRadius: "50%"}} src={loading} /> */}
        </Dimmer>
        <HeaderPrevsup
          //User guide
          downloadUserGuide={downloadUserGuide}
          uploadUserGuide={uploadUserGuide}
          userGuide={userGuide}
          // Datas
          constats={constats.all}
          allAcademies={academies.all}
          importedYears={academies.importedYears}
          recapitulatifs={recapitulatifs.all}
          scenarios={scenarios.all}
          academiesUser={academies.userAcademies}
          deleteUser={deleteUser}

          //App info
          updateAppInfo={this.updateAppInfo}
          appInfo={appInfo}
          //Import - Datas
          progressImport={progressImport}

          // Handlers - Scenario
          setOpenScenarioModal={this.setOpenScenarioModal}
          showScenario={this.showScenario}
          setCreateScenarioModal={this.setCreateScenarioModal}
          isOpenScenarioModalOpen={this.state.isOpenScenarioModalOpen}
          isCreateScenarioModalOpen={this.state.isCreateScenarioModalOpen}
          createScenario={this.handleCreateScenario}
          renameScenario={renameScenario}

          // Handlers - Constat
          showConstat={this.showConstat}
          setOpenConstatModal={this.setOpenConstatModal}
          isOpenConstatModalOpen={this.state.isOpenConstatModalOpen}
          setCreateConstatModal={this.setCreateConstatModal}
          isCreateConstatModalOpen={this.state.isCreateConstatModalOpen}
          createConstat={this.handleCreateConstat}

          // Handlers - Recapitulatif
          showRecapitulatif={this.showRecapitulatif}
          setOpenRecapitulatifModal={this.setOpenRecapitulatifModal}
          isOpenRecapitulatifModalOpen={this.state.isOpenRecapitulatifModalOpen}
          createRecap={this.hanldeCreateRecapitulatif}
          setCreateRecapitulatifModal={this.setCreateRecapitulatifModal}
          isCreateRecapitulatifModalOpen={this.state.isCreateRecapitulatifModalOpen}

          //Handlers - User
          createUser={createUser}
          users={users.all}
          showUser={this.showUser}
          updateUser={updateUser}
          isShowUserModalOpen={this.isShowUserModalOpen}
          setShowUserModal={this.setShowUserModal}
          isModifyUserModalOpen={this.isModifyUserModalOpen}
          setModifyUserModal={this.setModifyUserModal}
          isDeleteUserModalOpen={this.isDeleteUserModalOpen}
          setDeleteUserModal={this.setDeleteUserModal}
          updateUserPassword={updateUserPassword}
          changeColorUI={this.changeColorsUI}
          GetColorUI={users.colorUI}
          setGraphExportOption={this.setGraphExportOption}


          // Handlers -login
          setLoginModal={this.setLoginModal}
          isAuthenticated={this.isAuthenticated}
          isAdmin={this.isAdmin}
          logout={this.logout}

          // Archive
          archiveConstats={constats.archivedConstats}
          archiveScenarios={scenarios.archivedScenarios}
          archiveRecapitulatifs={recapitulatifs.archivedRecapitulatifs}
          getArchivedConstat={this.getArchivedConstat}
          getArchivedRecap={this.getArchivedRecap}
          getArchivedScenario={this.getArchivedScenario}
          archiveSave={this.saveArchive}
          setOpenArchiveConstatModal={this.setOpenArchiveConstatModal}
          isOpenArchiveConstatModal={this.state.isOpenArchiveConstatModal}
          setOpenArchiveRecapitulatifModal={this.setOpenArchiveRecapitulatifModal}
          isOpenArchiveRecapitulatifModal={this.state.isOpenArchiveRecapitulatifModal}
          setOpenArchiveScenarioModal={this.setOpenArchiveScenarioModal}
          isOpenArchiveScenarioModal={this.state.isOpenArchiveScenarioModal}
        />

        <div style={{ margin: "7px 0" }}>
          {tabContent}
        </div>

      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    archives: state.archives,
    academies: state.academies,
    constats: state.constats,
    recapitulatifs: state.recapitulatifs,
    information: state.information,
    scenarios: state.scenarios,
    importData: state.importData,
    users: state.users,
    userGuide:state.userGuide,
    appInfo:state.appInfo
  };
};

const mapDispatchToProps = dispatch => {
  return {
    findAllAcademies: async (applyLoading) => dispatch(fetchAllAcademies(applyLoading)),
    findAcademiesUser: async (userLogin, applyLoading) => dispatch(fetchAcademiesUser(userLogin, applyLoading)),
    findAllConstats: async (idUser, applyLoading) => dispatch(fetchConstats(idUser, applyLoading)),
    showConstat: async (id) => dispatch(showConstat(id)),
    findAllRecapitulatifs: async (idUser, applyLoading) => dispatch(fetchRecapitulatifs(idUser, applyLoading)),
    findRecapitulatif: async (id) => dispatch(fetchRecapitulatif(id)),
    clearInfo: () => dispatch(clearInformation()),
    closeConstat: async (idConstat) => dispatch(closeConstat(idConstat)),
    createConstatAndFetchData: async (newConstat, userId) => dispatch(createConstatAndFetchData(newConstat, userId)),
    progressImport: async (file) => dispatch(progressImport(file)),
    findAllScenarios: async (idUser, applyLoading) => dispatch(fetchScenarios(idUser, applyLoading)),
    showScenario: async (id) => dispatch(showScenario(id)),
    createUser: async (newUser) => dispatch(createUser(newUser)),
    findAllUser: async () => dispatch((fetchUsers())),
    deleteUser: async (idUser) => dispatch(deleteUser(idUser)),
    updateUser: async (newUser) => dispatch(updateUser(newUser)),
    updateUserPassword: async (newDataPassword) => dispatch(updateUserPassword(newDataPassword)),
    closeScenario: async (idScenario) => dispatch(closeScenario(idScenario)),
    informationSuccess: async (message) => dispatch(informationSuccess(message)),
    informationError: async (message) => dispatch(informationError(message)),
    closeRecap: async (idRecap) => dispatch(closeRecap(idRecap)),
    // getArchived: async () => dispatch(getArchived()),
    getArchiveConstat: async (userId, academy) => dispatch(getArchivedConstat(userId, academy)),
    archiveSave: async (userId, userAcademies, ListArchive, type) => dispatch(archiveSave(userId, userAcademies, ListArchive, type)),
    createScenarioAndFetchData: async (newScenario) => dispatch(createScenarioAndFetchData(newScenario)),
    createRecap: async (newRecap) => dispatch(createRecap(newRecap)),
    resetAllData: async () => dispatch(resetAllData()),
    getArchiveRecap: async (userId, academy) => dispatch(getArchivedRecap(userId, academy)),
    getArchiveScenario: async (userId, academy) => dispatch(getArchivedScenario(userId, academy)),
    changeColorUI: async (colors, userId) => dispatch(changeColorUI(colors, userId)),
    setColorUI: async (colors) => dispatch(setColorUI(colors)),
    // getColorUI:async(userid)=>dispatch(getColorUI(userid)),
    getTreeFiliere: async (applyLoading) => dispatch(getTreeFiliere(applyLoading)),
    fetchProprietes: async (applyLoading) => dispatch(fetchProprietes(applyLoading)),
    fetchUserDatas: async (user) => dispatch(fetchUserDatas(user)),
    downloadUserGuide: async () => dispatch(downloadUserGuide()),
    uploadUserGuide : async (file) => dispatch(uploadUserGuide(file)),
    getUserGuideName: async () => dispatch(getUserGuideName()),
    updateAppInfo: async (info) => dispatch(updateAppInfo(info)),
    getAppInfo: async () => dispatch(getAppInfo()),
    renameScenario: async (idScenario, scenarioName,idUser) =>dispatch(renameScenario(idScenario, scenarioName,idUser)),
    fetchUserDatas: async (user) => dispatch(fetchUserDatas(user)),
    setGraphExportOption: async (isComplete, userId) => dispatch(setGraphExportOption(isComplete,userId)),
    getGraphExportOption: async (userId) => dispatch(getGraphExportOption(userId))
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(App);
