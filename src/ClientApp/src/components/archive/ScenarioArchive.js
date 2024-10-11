import React, { useState } from "react"
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import { Header, Icon, Segment, Menu, Dropdown, Button, Modal, Form, Select } from 'semantic-ui-react'


function ScenarioArchive(props){
    const { setOpenArchiveScenarioModal, isOpenArchiveScenarioModal, optionArchive, archiveScenarios,archiveSave} = props;
    const getUserScenarios = [];
    const getUserArchivedOrNotScenario = [];
    // const getUserArchivedScenarios=[];
    // Object.values(optionArchive).forEach(scenario=>{getUserScenarios.push({key:scenario.key,label:scenario.text, value:scenario.value,text:scenario.text})});
    // console.log(archiveScenarios);
    archiveScenarios.forEach(archivedScenario => { getUserArchivedOrNotScenario.push({ value: archivedScenario.Id, id: archivedScenario.Id, label: archivedScenario.Name, is_archive: archivedScenario.Is_archive }) });
    const getUserArchivedScenarios = getUserArchivedOrNotScenario.filter(function (scenario) { 
        return scenario.is_archive === true 
    });
    const getArchived=[];
    getUserArchivedScenarios.forEach(scenario=>{getArchived.push(scenario.value)});
    const [archivedScenario, setarchivedScenario] = useState(getArchived);
    const handleChange = (data) => {
        const tab=[];
        // Object.values(getUserArchivedScenarios).forEach(scenario =>{tab.push({value:scenario.value, label:scenario.label})});
        setarchivedScenario(data);
    }
    const handleSubmitArchive = () => {
        let result = "";
        const newArchivedOrNotScenario=[];
        
        getUserArchivedOrNotScenario.forEach(scenario=>{if(archivedScenario.includes(scenario.value)){newArchivedOrNotScenario.push({id:scenario.id,is_archive:true})}else{newArchivedOrNotScenario.push({id:scenario.id,is_archive:false})}});
        
        newArchivedOrNotScenario.forEach(scenario=>{
        result=result+`{\"Id\":\"${scenario.id}\",\"Is_archive\":${scenario.is_archive}},`
        });
        result ="["+result.slice(0,-1)+"]";
        const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));
        archiveSave(userAuthenticated.id,userAuthenticated.academies.toString(), result,"Scenario");
        setOpenArchiveScenarioModal(false);
    }


    return (
        <div>
            <Modal as={Form} size="small" closeIcon onClose={() => setOpenArchiveScenarioModal(false)}
                open={isOpenArchiveScenarioModal} closeOnDimmerClick={false}>
                <Header content="Archivage des scénarios" />
                <Modal.Content>
                    <DualListBox options={getUserArchivedOrNotScenario} selected={archivedScenario} onChange={(selected) => { handleChange(selected) }} />
                </Modal.Content>
                <Modal.Actions>
                    <Button type="submit" color="blue" onClick={() => { handleSubmitArchive() }}>
                        Confirmer
                    </Button>
                </Modal.Actions>
            </Modal>

        </div>
    )
}
export default ScenarioArchive;
