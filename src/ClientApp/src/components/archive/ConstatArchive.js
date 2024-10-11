import React, { useState } from "react"
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css';
import { Header, Button, Modal, Form } from 'semantic-ui-react'


function ConstatArchive(props) {
    const { setOpenArchiveConstatModal, isOpenArchiveConstatModal, optionArchive, showConstat, archiveConstats,archiveSave } = props;
    const getUserConstats = [];
    const getUserArchivedOrNotConstat = [];
    // const getUserArchivedConstats=[];
    // Object.values(optionArchive).forEach(constat=>{getUserConstats.push({key:constat.key,label:constat.text, value:constat.value,text:constat.text})});
    
    archiveConstats.forEach(archivedConstat => { getUserArchivedOrNotConstat.push({ value: archivedConstat.Id, id: archivedConstat.Id, label: archivedConstat.Name, is_archive: archivedConstat.Is_archive }) });
    const getUserArchivedConstats = getUserArchivedOrNotConstat.filter(function (constat) { 
        return constat.is_archive === true 
    });
    const getArchived=[];
    
    getUserArchivedConstats.forEach(constat=>{getArchived.push(constat.value)});
    // console.log(getArchived)
    const [archivedConstat, setarchivedConstat] = useState(getArchived);
    // useEffect(()=>{setarchivedConstat(getArchived)},[]);
    // console.log(archivedConstat)
    const handleChange = (data) => {
        const tab=[];
        // Object.values(getUserArchivedConstats).forEach(constat =>{tab.push({value:constat.value, label:constat.label})});
        setarchivedConstat(data);
    }
    const handleSubmitArchive = () => {
        let result = "";
        const newArchivedOrNotConstat=[];
        
        getUserArchivedOrNotConstat.forEach(constat=>{if(archivedConstat.includes(constat.value)){newArchivedOrNotConstat.push({id:constat.id,is_archive:true})}else{newArchivedOrNotConstat.push({id:constat.id,is_archive:false})}});
        
        newArchivedOrNotConstat.forEach(constat=>{
        result=result+`{\"Id\":\"${constat.id}\",\"Is_archive\":${constat.is_archive}},`
        });
        result ="["+result.slice(0,-1)+"]";
        const userAuthenticated = JSON.parse(sessionStorage.getItem("user"));
        
        archiveSave(userAuthenticated.id,userAuthenticated.academies.toString(), result,"Constat");
        setOpenArchiveConstatModal(false);
    }


    return (
        <div>
            <Modal as={Form} size="small" closeIcon onClose={() => setOpenArchiveConstatModal(false)}
                open={isOpenArchiveConstatModal} closeOnDimmerClick={false}>
                <Header content="Archivage des constats" />
                <Modal.Content>
                    <DualListBox options={getUserArchivedOrNotConstat} selected={archivedConstat} onChange={(selected) => { handleChange(selected) }} />
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
export default ConstatArchive;
