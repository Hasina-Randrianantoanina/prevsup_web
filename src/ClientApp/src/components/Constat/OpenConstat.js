import React, { useState } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react'

function OpenConstat(props) {
    const { setOpenConstatModal, isOpenConstatModalOpen, constats, showConstat } = props;

    const [idConstat, setIdConstat] = useState(constats.length>0 ? constats[0].value:null);

    const handleChangeConstat = (event, data) => {
        setIdConstat(data.value);
    }
    
    const showCt = () => {
        if(!idConstat){
            alert("Veuillez choisir un constat.");
            return;
        }
        showConstat(idConstat).then(setIdConstat(""));
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setOpenConstatModal(false)}
            open={isOpenConstatModalOpen} closeOnDimmerClick={false}>
            <Header content="Ouvrir un Constat" />
            <Modal.Content>
                <div>
                    <label>Constats enregistrés :</label>
                    <div>
                        <Dropdown onChange={(event, data) => handleChangeConstat(event, data)} value={idConstat} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={constats} />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setOpenConstatModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={(event) => showCt()}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default OpenConstat;