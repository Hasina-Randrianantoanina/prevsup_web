import React, { useState } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react'

function DeleteUser(props) {
    const { setDeleteUserModal, isDeleteUserModalOpen, users, deleteUser } = props;
    const [idUser, setIdUser] = useState(users.length>0 ? users[0].value:null);

    const handleChangeUser = (event, data) => {
        setIdUser(data.value);
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setDeleteUserModal(false)}
            open={isDeleteUserModalOpen} closeOnDimmerClick={false}>
            <Header content="Supprimer un utilisateur" />
            <Modal.Content>
                <div>
                    <label>Sélectionné un utilisateur :</label>
                    <div>
                        <Dropdown onChange={(event, data) => handleChangeUser(event, data)} value={idUser} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={users} />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setDeleteUserModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={() => { if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')){deleteUser(idUser);setDeleteUserModal(false);}}}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default DeleteUser;