import React, { useState } from "react"
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import { Header, Button, Modal, Form } from 'semantic-ui-react'


function RecapitulatifArchive(props){
    const { setOpenArchiveRecapitulatifModal, isOpenArchiveRecapitulatifModal, optionArchive,archiveRecapitulatifs,archiveSave} = props;
    const getUserRecapitulatifs = [];
    const getUserArchivedOrNotRecapitulatif = [];
    // const getUserArchivedRecapitulatifs=[];
    // Object.values(optionArchive).forEach(recapitulatif=>{getUserRecapitulatifs.push({key:recapitulatif.key,label:recapitulatif.text, value:recapitulatif.value,text:recapitulatif.text})});
    //console.log(optionArchive);
    archiveRecapitulatifs.forEach(archivedRecapitulatif => { getUserArchivedOrNotRecapitulatif.push({ value: archivedRecapitulatif.Id, id: archivedRecapitulatif.Id, label: archivedRecapitulatif.Name, is_archive: archivedRecapitulatif.Is_archive }) });
    const getUserArchivedRecapitulatifs = getUserArchivedOrNotRecapitulatif.filter(function (recapitulatif) { 
        return recapitulatif.is_archive === true 
    });
    const getArchived=[];
    getUserArchivedRecapitulatifs.forEach(recapitulatif=>{getArchived.push(recapitulatif.value)});
    const [archivedRecapitulatif, setarchivedRecapitulatif] = useState(getArchived);
    const handleChange = (data) => {
        const tab=[];
        // Object.values(getUserArchivedRecapitulatifs).forEach(recapitulatif =>{tab.push({value:recapitulatif.value, label:recapitulatif.label})});
        setarchivedRecapitulatif(data);
    }
    const handleSubmitArchive = () => {
        let result = "";
        const newArchivedOrNotRecapitulatif=[];
        
        getUserArchivedOrNotRecapitulatif.forEach(recapitulatif=>{if(archivedRecapitulatif.includes(recapitulatif.value)){newArchivedOrNotRecapitulatif.push({id:recapitulatif.id,is_archive:true})}else{newArchivedOrNotRecapitulatif.push({id:recapitulatif.id,is_archive:false})}});
        
        newArchivedOrNotRecapitulatif.forEach(recapitulatif=>{
        result=result+`{\"Id\":\"${recapitulatif.id}\",\"Is_archive\":${recapitulatif.is_archive}},`
        });
        result ="["+result.slice(0,-1)+"]";
        const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));
        archiveSave(userAuthenticated.id,userAuthenticated.academies.toString(), result,"Recap");
        setOpenArchiveRecapitulatifModal(false);
    }


    return (
        <div>
            <Modal as={Form} size="small" closeIcon onClose={() => setOpenArchiveRecapitulatifModal(false)}
                open={isOpenArchiveRecapitulatifModal} closeOnDimmerClick={false}>
                <Header content="Archivage des tableaux récapitulatifs" />
                <Modal.Content>
                    <DualListBox options={getUserArchivedOrNotRecapitulatif} selected={archivedRecapitulatif} onChange={(selected) => { handleChange(selected) }} />
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
export default RecapitulatifArchive;
