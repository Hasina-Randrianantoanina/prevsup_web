import React, { useState } from 'react';
import { Header, Dropdown, Button, Modal, Form} from 'semantic-ui-react'

function OpenRecapitulatif(props) {
    const { setOpenRecapitulatifModal, isOpenRecapitulatifModalOpen, recapitulatifs, showRecapitulatif } = props;

    const [idRecap, setIdRecap] = useState(recapitulatifs.length>0? recapitulatifs[0].value:null);

    const handleChangeRecapitulatif = (event, data) => {
        setIdRecap(data.value);
    }

    const showRecap = () => {
        if(!idRecap) {
            alert("Veuillez choisir un récapitulatif.");
            return;
        }
        showRecapitulatif(idRecap);
        setIdRecap("");
    }

    const recapOptions = [];
    if(recapitulatifs) {
        recapitulatifs.forEach(recap => {
            recapOptions.push({
                id: recap.id,
                name: recap.name,
                text: recap.name,
                key: recap.id,
                value: recap.id
            });
        });
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setOpenRecapitulatifModal(false)}
            open={isOpenRecapitulatifModalOpen} closeOnDimmerClick={false}>
            <Header content="Consultation tableau récapitulatif" />
            <Modal.Content>
                <div>
                    <label>Tableaux récapitulatifs:</label>
                    <div>
                        <Dropdown onChange={(event, data) => handleChangeRecapitulatif(event, data)} value={idRecap} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={recapOptions} />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setOpenRecapitulatifModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={((event) => showRecap())}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default OpenRecapitulatif;