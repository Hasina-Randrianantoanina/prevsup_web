import React, { useState } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react'

function OpenScenario(props) {
    const { setOpenScenarioModal, isOpenScenarioModalOpen, scenarios, showScenario } = props;

    const [idScenario, setIdScenario] = useState(scenarios.length>0 ? scenarios[0].value:null);

    const handleScenario = (event, data) => {
        setIdScenario(data.value);
    }

    const showScen = () => {
        if(!idScenario) {
            alert("Veuillez choisir un scénario.");
            return;
        }
        showScenario(idScenario).then(setIdScenario(""));
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setOpenScenarioModal(false)}
            open={isOpenScenarioModalOpen} closeOnDimmerClick={false}>
            <Header content="Ouvrir un Scénario" />
            <Modal.Content>
                <div>
                    <label>Scenarios enregistrés :</label>
                    <div>
                        <Dropdown onChange={(event, data) => handleScenario(event, data)} value={idScenario} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={scenarios} />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setOpenScenarioModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={(event) => showScen()}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default OpenScenario;