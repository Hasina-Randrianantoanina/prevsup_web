import React, { useState, useEffect } from 'react';
import { Header, Icon, Segment, Menu, Dropdown, Button, Modal, Form, Select, Input } from 'semantic-ui-react';
import Dualbox from '../dualbox';

function ShowUser(props) {
    const { setShowUserModal, isShowUserModalOpen, user, updateUser,allAcademies,setModifyUserModal } = props;
    const [userToUpdate, setUserToUpdate] = useState(user);
    
    const handleEvent = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        const newUser = {...userToUpdate};
        newUser[name]=value;
        setUserToUpdate(newUser);
        
    }
    const handleModifyUser= () =>{
        
        if (userToUpdate.academies=="" || userToUpdate.academies==null){
            alert("Veuillez sélectionner au moins une académie.")
        }else if(userToUpdate.login=="" || userToUpdate.login==null){
            alert("Veuillez insérer un login.")
        }else if(userToUpdate.nom=="" || userToUpdate.nom==null){
            alert("Veuillez insérer un nom.")
        }else if(userToUpdate.password=="" || userToUpdate.password==null){
            alert("Veuillez insérer un mot de passe.")
        }
        else{
        if (window.confirm('Voulez-vous vraiment enregistrer les modifications ?')){
            setShowUserModal(false);
            updateUser(userToUpdate);
            setModifyUserModal(false);
        }
        
        }

    }
    const handleDualBox = (data) => {
        const newUser = {...userToUpdate};
        newUser['academies']=data;
        setUserToUpdate(newUser)
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setShowUserModal(false)}
            open={isShowUserModalOpen} closeOnDimmerClick={false}>
            <Header content="Modification utilisateur" />
            <Modal.Content>
                <div>
                    <label>Login</label>
                    <Form.Input type={"text"} name="login" value={userToUpdate.login} onChange={(e) => handleEvent(e)} />
                    <label>Nom</label>
                    <Form.Input type={"text"} name="nom" value={userToUpdate.nom} onChange={(e) => handleEvent(e)} />
                    <br />
                    <label>Academies:</label>
                    <Dualbox type="show-user" handleDualBox={handleDualBox} academies={allAcademies} initialState={userToUpdate["academies"]}/>
                    <label>Nouveau mot de passe</label>
                    <Form.Input type={"password"} name="password" value={userToUpdate.password} onChange={(e) => handleEvent(e)} />
                    
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setShowUserModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={() => handleModifyUser()}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ShowUser;