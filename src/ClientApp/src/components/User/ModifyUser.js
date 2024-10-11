import React, { useState } from 'react';
import { useEffect } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react';
import ShowUser from "./ShowUser";

function ModifyUser(props) {
    const { setModifyUserModal, isModifyUserModalOpen, users, showUser, setShowUserModal,isShowUserModalOpen,updateUser, allAcademies } = props;

    const [userSelected, setUserSelected] = useState(users.length>0 ? users[0] : null);
    const handleChangeUser = (event, data) => {
        const newUsers= Object.values(users);
        const selectedUser=newUsers.find(user=> user.key===data.value);
        if(selectedUser) setUserSelected(selectedUser);
    }
    const handleSubmitModifyUser=()=>{
        setShowUserModal(true);
    }

    const showUserContent = isShowUserModalOpen ? (<ShowUser key={3} isShowUserModalOpen={isShowUserModalOpen} setShowUserModal={setShowUserModal} setModifyUserModal={setModifyUserModal} user={userSelected} updateUser={updateUser} allAcademies={allAcademies}/>) : (<div></div>);


    return (
        <div>
            {showUserContent}
            <Modal as={Form} size="small" closeIcon onClose={() => setModifyUserModal(false)}
                open={isModifyUserModalOpen} closeOnDimmerClick={false}>
                <Header content="Modifier un utilisateur" />
                <Modal.Content>
                    <div>
                        <label>Sélectionné un utilisateur :</label>
                        <div>
                            <Dropdown onChange={(event, data) => handleChangeUser(event, data)} value={userSelected.value} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={users} />
                        </div>
                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setModifyUserModal(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" color="blue" onClick={() => handleSubmitModifyUser()}>
                        Valider
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
        
    );
}

export default ModifyUser;