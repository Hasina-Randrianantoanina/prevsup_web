import React, { useState } from 'react';
import { Header, Button, Modal, Form} from 'semantic-ui-react';

function ChangePassword(props) {
    const { setChangePasswordModal, isChangePasswordModalOpen, updateUserPassword} = props;
    const [connectedUser, setConnectedUser]=useState(JSON.parse(sessionStorage.getItem("user")));
    const [newPassword, setNewPassword]=useState({
        login:connectedUser.login,
        oldPassword:'',
        newPassword:'',
        confirmationPassword:'',
    })
    const updateSessionStorage =(value,cle)=>{
        let oldData= JSON.parse(sessionStorage.getItem(cle));
        Object.keys(value).forEach(function(val){
            oldData[val] = value[val];
       })
       sessionStorage.setItem(cle, JSON.stringify(oldData));
    }
    const handleChangePassword=(event)=>{
        const user = JSON.parse(sessionStorage.getItem("user"));
        if(newPassword.oldPassword===""){alert("Ancien mot de passe obligatoire.")}
        else if(newPassword.oldPassword!==user.password){alert("Ancien mot de passe incorrect.")}
        else if(newPassword.newPassword!==newPassword.confirmationPassword){alert("Les mots de passe ne sont pas identiques.")}
        else{
            setChangePasswordModal(false);
            updateUserPassword(newPassword).then(d => {
                updateSessionStorage({password:newPassword.newPassword}, "user")
            });
                        
        }
        
    }
    const handleEvent=(event)=>{
        let name=event.target.name;
        let value=event.target.value;
        const newDataPassword={...newPassword};
        newDataPassword[name]=value;
        setNewPassword(newDataPassword);

    }
    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setChangePasswordModal(false)}
            open={isChangePasswordModalOpen} closeOnDimmerClick={false}>
            <Header content="Modification utilisateur" />
            <Modal.Content>
                <div>
                    <label>Login</label>
                    <Form.Input type={"text"} name="login" value={newPassword.login} />
                    <label>Ancien mot de passe</label>
                    <Form.Input type={"password"} name="oldPassword" placeholder="Entrez votre ancien mot de passe..." onChange={(e) => handleEvent(e)} />
                    <label>Nouveau mot de passe</label>
                    <Form.Input type={"password"} name="newPassword" placeholder="Entrez le nouveau mot de passe..." onChange={(e) => handleEvent(e)} />
                    <label>Confirmer le nouveau mot de passe</label>
                    <Form.Input type={"password"} name="confirmationPassword" placeholder="Confirmer le nouveau mot de passe..." onChange={(e) => handleEvent(e)} />
                    
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setChangePasswordModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={() => handleChangePassword()}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ChangePassword;