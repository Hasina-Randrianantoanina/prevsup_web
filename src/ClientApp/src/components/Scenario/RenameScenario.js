import React, { useEffect, useState } from 'react';
import { Header, Dropdown, Button, Modal, Form,Input } from 'semantic-ui-react'
import Utils from '../../services/utils';

function RenameScenario(props) {
    const { setRenameScenarioModal, isRenameScenarioModalOpen, scenarios, renameScenario} = props;

    const [idScenario, setIdScenario] = useState(scenarios.length>0 ? scenarios[0].value:null);
    const [scenarioName,setScenarioName] = useState(scenarios.length>0 ? scenarios[0].text:null);
    const [oldScenarioName, setOldScenarioName] = useState(scenarioName);
    

    const handleScenario = (event, data) => {
        setIdScenario(data.value);
        var selectedScenario = scenarios.find(x=>x.value===data.value)
        setOldScenarioName(selectedScenario.text)
        setScenarioName(selectedScenario.text)
    }
    const handleScenarioName = (event)=>{
        setScenarioName(event.target.value)
    }

    const renameScen = () => {
        const userAuthenticated = JSON.parse(sessionStorage.getItem("user"))
        const idUser=userAuthenticated.id
        const util = new Utils();
        if(util.validName(scenarioName) === false){
            alert("Veuillez bien vérifier le nouveau nom du scénario.")
        }else if (scenarioName.trim() === oldScenarioName){
            setRenameScenarioModal(false)
        } else {
            setRenameScenarioModal(false)
            renameScenario(idScenario,scenarioName, idUser)
        }
       
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setRenameScenarioModal(false)}
            open={isRenameScenarioModalOpen} closeOnDimmerClick={false}>
            <Header content="Renommer un Scénario" />
            <Modal.Content>
                <div>
                    <label>Choix du scénario:</label>
                    <div>
                        <Dropdown onChange={(event, data) => handleScenario(event, data)} value={idScenario} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={scenarios} />
                    </div>
                    <br/>
                    <label>Nouveau nom:</label>
                    <div>
                        <Input name= 'scenarioName' fluid value={scenarioName} onChange={(event)=>handleScenarioName(event)} />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setRenameScenarioModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={(event) => renameScen()}>
                    Renommer
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default RenameScenario;