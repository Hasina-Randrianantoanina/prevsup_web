import React, { useState } from "react";
import { Segment, Menu, Dropdown, Button,Icon } from 'semantic-ui-react'
import iconSettings from '../img/test.svg'
import iconUserManual from '../img/user_manual.png'
// import DualListBox from "react-dual-listbox";
// import 'react-dual-listbox/lib/react-dual-listbox.css'
import 'font-awesome/css/font-awesome.min.css'
// import select from "react-select";
import CreateConstat from './Constat/CreateConstat';
import OpenConstat from './Constat/OpenConstat';
import OpenRecapitulatif from './Recapitulatif/OpenRecapitulatif';
import ImportData from "./Import/ImportData";
import ImportUserGuide from "./User/ImportUserGuide";
import CreateUser from './User/CreateUser';
import OpenScenario from "./Scenario/OpenScenario";
import ModifyUser from "./User/ModifyUser";
import DeleteUser from "./User/DeleteUser";
import ShowUser from "./User/ShowUser";
import ChangePassword from "./User/ChangePassword";
import ConstatArchive from "./archive/ConstatArchive";
import RecapitulatifArchive from "./archive/RecapitulatifArchive";
import ScenarioArchive from "./archive/ScenarioArchive";
import CreateScenario from "./Scenario/CreateScenario";
import CreateRecap from "./Recapitulatif/CreateRecapitulatifs";
import ChangeInterface from "./User/ChangeInterface";
import ChangeAppInfo from "./User/ChangeAppInfo";
import './headerCss.css'
import { appVersion } from "./Function/ServerInfo";
import { saveAs } from "file-saver";
import RenameScenario from "./Scenario/RenameScenario";
import ParametrageExportGraphe from "./User/ParametrageExportGraphe";
import { useSelector } from "react-redux";

function HeaderPrev(props) {

    const { constats, academiesUser,importedYears, recapitulatifs, showRecapitulatif, showConstat, setCreateConstatModal, isCreateConstatModalOpen, isOpenConstatModalOpen, setOpenConstatModal, setCreateRecapitulatifModal, isCreateRecapitulatifModalOpen, isOpenRecapitulatifModalOpen, setOpenRecapitulatifModal, createConstat, scenarios, isOpenScenarioModalOpen, setOpenScenarioModal, showScenario, isAuthenticated, progressImport, createUser, isAdmin, allAcademies, users, user, showUser, deleteUser, handleSubmitModifyUser, updateUser, updateUserPassword, archiveConstats, archiveScenarios, archiveRecapitulatifs, getArchivedConstat, getArchivedRecapitulatif, getArchivedScenario, archiveSave, createScenario, createRecap, logout, changeColorUI, GetColorUI, isOpenArchiveConstatModal, setOpenArchiveConstatModal, isOpenArchiveRecapitulatifModal, setOpenArchiveRecapitulatifModal, isOpenArchiveScenarioModal, setOpenArchiveScenarioModal, isCreateScenarioModalOpen, setCreateScenarioModal,downloadUserGuide, uploadUserGuide,userGuide, updateAppInfo, appInfo, renameScenario, setGraphExportOption } = props;

    const [isCreateImportModalOpen, setCreateImportModal] = useState(false)
    const [isImportUserGuideModalOpen, setImportUserGuideModal]= useState(false)
    const [isNewUserModalOpen, setNewUserModal] = useState(false)
    const [isModifyUserModalOpen, setModifyUserModal] = useState(false)
    const [isDeleteUserModalOpen, setDeleteUserModal] = useState(false)
    const [isShowUserModalOpen, setShowUserModal] = useState(false)
    const [isChangePasswordModalOpen, setChangePasswordModal] = useState(false)
    const [isChangInterfaceModalOpen, setChangeInterfaceModal] = useState(false);
    const [isChangeAppInfoModalOpen, setChangeAppInfoModal] = useState(false);
    const [isRenameScenarioModalOpen, setRenameScenarioModal] = useState(false);


    const [isParametrageExportModalOpen, setParametrageExportModal] = useState(false)
    const choiceExportOption = [{text:"Complet", value:true},{text:"Simple", value:false}];
    
    const usersActual = useSelector(state=>state.users);
    const CustomIcon = (
        <i className="icon">
            <img src={iconUserManual} display="block" width={"150%"} />
        </i>
    );
        
    
    const downloadUsersGuide = async () => {
        const { downloadUserGuide } = props;
        if(userGuide.name!=="null"){
            await downloadUserGuide();
        }else{
            alert("Guide utilisateur indisponible, veuillez contacter l'administrateur.")
        }
    }
    const ChangeParametrageExportGraphe = isParametrageExportModalOpen?(<ParametrageExportGraphe key={1} setGraphExportOption={setGraphExportOption} setParametrageExportModal={setParametrageExportModal} isParametrageExportModalOpen={isParametrageExportModalOpen} choiceExportOption={choiceExportOption} statusExport={usersActual.isExportOptionComplete} />):(<div key={2}></div>);
    const ChangeInterfaceUser = isChangInterfaceModalOpen ? (<ChangeInterface key={3} setChangeInterfaceModal={setChangeInterfaceModal} isChangInterfaceModalOpen={isChangInterfaceModalOpen} changeColorUI={changeColorUI} GetColorUI={GetColorUI} />) : (<div key={4}></div>);
    // const ArchiveConstat= isOpenArchiveConstatModal ? (<ConstatArchive archiveSave={archiveSave} getArchivedConstat={getArchivedConstat} archiveConstats={archiveConstats} optionArchive={constats} isOpenArchiveConstatModal={isOpenArchiveConstatModal} setOpenArchiveConstatModal={setOpenArchiveConstatModal}/>) : (<div></div>);
    // const ArchiveScenario= isOpenArchiveScenarioModal ? (<ScenarioArchive archiveSave={archiveSave} getArchivedScenario={getArchivedScenario} archiveScenarios={archiveScenarios} optionArchive={constats} isOpenArchiveScenarioModal={isOpenArchiveScenarioModal} setOpenArchiveScenarioModal={setOpenArchiveScenarioModal}/>) : (<div></div>);
    // const ArchiveRecap= isOpenArchiveRecapitulatifModal ? (<RecapitulatifArchive archiveSave={archiveSave} getArchivedRecapitulatif={getArchivedRecapitulatif} archiveRecapitulatifs={archiveRecapitulatifs} optionArchive={constats} isOpenArchiveRecapitulatifModal={isOpenArchiveRecapitulatifModal} setOpenArchiveRecapitulatifModal={setOpenArchiveRecapitulatifModal}/>) : (<div></div>);
    return (
        <div className="header-prev">
            <div name="modal">
                {isAdmin() ?
                    [
                        <ImportData key={5} isCreateImportModalOpen={isCreateImportModalOpen} setCreateImportModal={setCreateImportModal} progressImport={progressImport} />,
                        <ImportUserGuide key={6} isImportUserGuideModalOpen={isImportUserGuideModalOpen} setImportUserGuideModal={setImportUserGuideModal} uploadUserGuide={uploadUserGuide} userGuide={userGuide} />,
                        <CreateUser key={7} isNewUserModalOpen={isNewUserModalOpen} setNewUserModal={setNewUserModal} createUser={createUser} allAcademies={allAcademies} />,
                        isModifyUserModalOpen ? (<ModifyUser key={8} isModifyUserModalOpen={isModifyUserModalOpen} setModifyUserModal={setModifyUserModal} users={users} showUser={showUser} isShowUserModalOpen={isShowUserModalOpen} setShowUserModal={setShowUserModal} user={user} handleSubmitModifyUser={handleSubmitModifyUser} updateUser={updateUser} allAcademies={allAcademies} />):(<div key={9}></div>),
                        // <ShowUser key={10} isShowUserModalOpen={isShowUserModalOpen} setShowUserModal={setShowUserModal} user={user}/>,
                        isDeleteUserModalOpen ? (<DeleteUser key={11} isDeleteUserModalOpen={isDeleteUserModalOpen} setDeleteUserModal={setDeleteUserModal} users={users} deleteUser={deleteUser} />):(<div key={12}></div>),
                        isChangeAppInfoModalOpen ? (<ChangeAppInfo key={13} appInfo={appInfo} isChangeAppInfoModalOpen={isChangeAppInfoModalOpen} setChangeAppInfoModal={setChangeAppInfoModal} updateAppInfo={updateAppInfo} />):(<div key={14} ></div>)
                    ] :
                    [
                        isCreateConstatModalOpen ? (<CreateConstat key={15} importedYears={importedYears} constats={constats} createConstat={createConstat} academies={academiesUser} isCreateConstatModalOpen={isCreateConstatModalOpen} setCreateConstatModal={setCreateConstatModal} />): (<div key={16}></div>),
                        isOpenConstatModalOpen ? (<OpenConstat key={17} showConstat={showConstat} constats={constats} isOpenConstatModalOpen={isOpenConstatModalOpen} setOpenConstatModal={setOpenConstatModal} />):(<div key={18}></div>),
                        isOpenRecapitulatifModalOpen ? (<OpenRecapitulatif key={19} showRecapitulatif={showRecapitulatif} recapitulatifs={recapitulatifs} isOpenRecapitulatifModalOpen={isOpenRecapitulatifModalOpen} setOpenRecapitulatifModal={setOpenRecapitulatifModal} />):(<div key={20}></div>),
                        isOpenScenarioModalOpen ? (<OpenScenario key={21} showScenario={showScenario} isOpenScenarioModalOpen={isOpenScenarioModalOpen} setOpenScenarioModal={setOpenScenarioModal} scenarios={scenarios} />):(<div key={22}></div>),
                        isCreateScenarioModalOpen ? (<CreateScenario key={23} createScenario={createScenario} isCreateScenarioModalOpen={isCreateScenarioModalOpen} setCreateScenarioModal={setCreateScenarioModal} scenarios={scenarios} constats={constats}/>):(<div key={24}></div>),
                        isCreateRecapitulatifModalOpen ? (<CreateRecap key={25} scenarios={scenarios} isCreateRecapModalOpen={isCreateRecapitulatifModalOpen} setCreateRecapModal={setCreateRecapitulatifModal} createRecap={createRecap} />) : (<div key={26}></div>),
                        // <ConstatArchive archiveSave={archiveSave} getArchivedConstat={getArchivedConstat} archiveConstats={archiveConstats} optionArchive={constats} isOpenArchiveConstatModal={isOpenArchiveConstatModal} setOpenArchiveConstatModal={setOpenArchiveConstatModal}/>,
                        isOpenArchiveConstatModal ? (<ConstatArchive key={27} archiveSave={archiveSave} getArchivedConstat={getArchivedConstat} archiveConstats={archiveConstats} optionArchive={constats} isOpenArchiveConstatModal={isOpenArchiveConstatModal} setOpenArchiveConstatModal={setOpenArchiveConstatModal} />) : (<div key={28}></div>),
                        // <ScenarioArchive archiveSave={archiveSave} getArchivedScenario={getArchivedScenario} archiveScenarios={archiveScenarios} optionArchive={constats} isOpenArchiveScenarioModal={isOpenArchiveScenarioModal} setOpenArchiveScenarioModal={setOpenArchiveScenarioModal}/>,
                        isOpenArchiveScenarioModal ? (<ScenarioArchive key={29} archiveSave={archiveSave} getArchivedScenario={getArchivedScenario} archiveScenarios={archiveScenarios} optionArchive={constats} isOpenArchiveScenarioModal={isOpenArchiveScenarioModal} setOpenArchiveScenarioModal={setOpenArchiveScenarioModal} />) : (<div key={30}></div>),
                        // <RecapitulatifArchive archiveSave={archiveSave} getArchivedRecapitulatif={getArchivedRecapitulatif} archiveRecapitulatifs={archiveRecapitulatifs} optionArchive={constats} isOpenArchiveRecapitulatifModal={isOpenArchiveRecapitulatifModal} setOpenArchiveRecapitulatifModal={setOpenArchiveRecapitulatifModal}/>,
                        isOpenArchiveRecapitulatifModal ? (<RecapitulatifArchive key={31} archiveSave={archiveSave} getArchivedRecapitulatif={getArchivedRecapitulatif} archiveRecapitulatifs={archiveRecapitulatifs} optionArchive={constats} isOpenArchiveRecapitulatifModal={isOpenArchiveRecapitulatifModal} setOpenArchiveRecapitulatifModal={setOpenArchiveRecapitulatifModal} />) : (<div key={32}></div>),
                        isRenameScenarioModalOpen? (<RenameScenario key={33} renameScenario={renameScenario} isRenameScenarioModalOpen={isRenameScenarioModalOpen} setRenameScenarioModal={setRenameScenarioModal} scenarios={scenarios}/>):(<div key={34}></div>)
                    ]
                }

                <ChangePassword key={35} setChangePasswordModal={setChangePasswordModal} isChangePasswordModalOpen={isChangePasswordModalOpen} updateUserPassword={updateUserPassword} />
                {ChangeInterfaceUser}
                {ChangeParametrageExportGraphe}
                
                

            </div>

            <Segment inverted>

                <Menu inverted secondary>
                    <Menu.Item><strong style={{ marginRight: '10px' }}>PREVSUP Web</strong> {appVersion}</Menu.Item>
                    {isAdmin() ? [
                        
                            <Dropdown key={36} text='Import des données' pointing className='link item'>
                                <Dropdown.Menu>
                                    {/** Menu importation des données académiques */}
                                    <Dropdown.Item key={47} onClick={() => setCreateImportModal(true)}>Données académiques</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>,
                            <Dropdown key={37} text='Utilisateurs' pointing className='link item'>
                                <Dropdown.Menu>
                                    {/** Menu nouvel utilisateur */}
                                    <Dropdown.Item key={48} onClick={() => setNewUserModal(true)}>Nouvel utilisateur</Dropdown.Item>
                                    <Dropdown.Item key={49} onClick={() => setModifyUserModal(true)}>Modifier un utilisateur</Dropdown.Item>
                                    <Dropdown.Item key={50} onClick={() => setDeleteUserModal(true)}>Supprimer un utilisateur</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>,
                            <Dropdown key={38} button className='link item' text='Import nouveau guide' icon={false} onClick={() => setImportUserGuideModal(true)} />,
                            <Dropdown key={39} text="Modification texte page d'accueil" pointing className='link item' icon={false} onClick={() => setChangeAppInfoModal(true)}></Dropdown>
                        
                    ] : [
                        <Dropdown id="menuObservations" key={40} text='Constats' pointing className='link item'>
                            <Dropdown.Menu>
                                {/** Menu nouvel constat */}
                                <Dropdown.Item key={51} id="newObservation" onClick={() => setCreateConstatModal(true)}>Nouveau</Dropdown.Item>
                                {/** Menu ouvrir un constat */}
                                <Dropdown.Item key={52} onClick={() => setOpenConstatModal(true)}>Ouvrir un constat</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>,
                        <Dropdown id="menuScenarios" key={41} text='Scénarios' pointing className='link item'>
                            <Dropdown.Menu>
                                {/** Menu nouvel scenario */}
                                <Dropdown.Item key={53} id="newScenario" onClick={() => setCreateScenarioModal(true)}>Nouveau</Dropdown.Item>
                                {/** Menu ouvrir un Scenario */}
                                <Dropdown.Item key={54} onClick={() => setOpenScenarioModal(true)}>Ouvrir un scénario</Dropdown.Item>
                                <Dropdown.Item key={55} onClick={() => setRenameScenarioModal(true)}>Renommer un scénario</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>,
                        <Dropdown key={42} text='Récapitulatifs' pointing className='link item'>
                            <Dropdown.Menu>
                                {/** Menu créer un récapitulatif */}
                                <Dropdown.Item key={56} onClick={() => setCreateRecapitulatifModal(true)}>Nouveau</Dropdown.Item>
                                {/** Menu ouvrir un récapitulatif */}
                                <Dropdown.Item key={57} onClick={() => setOpenRecapitulatifModal(true)}>Ouvrir un récapitulatif</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    ]}


                    <Menu.Menu position="right">
                        {isAdmin() ?
                            [] :
                            [
                                <Dropdown key={43} text="Guide utilisateur" pointing className='archive-style' icon="book" open={false} onClick={() => downloadUsersGuide()}/>,
                                <Dropdown key={44} text="Archive" icon='archive' pointing className='archive-style'>
                                    <Dropdown.Menu>
                                        <Dropdown.Item key={58} onClick={() => { setOpenArchiveConstatModal(true); }}>Archive Constats</Dropdown.Item>
                                        <Dropdown.Item key={59} onClick={() => setOpenArchiveScenarioModal(true)}>Archive Scénarios</Dropdown.Item>
                                        <Dropdown.Item key={60} onClick={() => setOpenArchiveRecapitulatifModal(true)}>Archive Récapitulatifs</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                                
                            ]}
                        <Dropdown key={45} text="Configuration" icon="settings" pointing className='configuration-style'>
                            <Dropdown.Menu>
                                <Dropdown.Item key={61} onClick={() => setChangePasswordModal(true)}>Changer mot de passe</Dropdown.Item>
                                {isAdmin() ? [] : 
                                [<Dropdown.Item key={62} onClick={() => setChangeInterfaceModal(true)}>Modifier l'interface</Dropdown.Item>,
                                <Dropdown.Item key={63} onClick={() => setParametrageExportModal(true)}>Exportation graphique</Dropdown.Item>]
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                        <Menu.Item>
                            {isAuthenticated() ? (<Button onClick={(event) => logout()} color='red'>Déconnexion</Button>) : (<div></div>)}
                        </Menu.Item>
                        {/* <Button basic ><Icon name={CustomIcon} color="red" /></Button> */}
                    </Menu.Menu>
                </Menu>

            </Segment>

        </div>
    );
}

export default HeaderPrev;