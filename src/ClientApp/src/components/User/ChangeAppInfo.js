
import React, { useState,useRef } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react'
import './ChangeAppInfo.css'
import TextEditor from './TextEditor';

function ChangeAppInfo(props) {
    const { appInfo,setChangeAppInfoModal,isChangeAppInfoModalOpen,updateAppInfo } = props;    
    const [newInfo, setNewInfo]=useState("")
    const information = appInfo.info? appInfo.info.content : ""
    const onSubmit = (info)=>{
        if (window.confirm('Voulez-vous vraiment prendre en compte les modifications ?')){
            if(info) updateAppInfo(info)
            else updateAppInfo(information);
            setChangeAppInfoModal(false);
        }
        
        
    }

    return (
        <Modal as={Form} size="small" closeIcon onClose={() => setChangeAppInfoModal(false)}
            open={isChangeAppInfoModalOpen} closeOnDimmerClick={false}>
            <Header content="Modifier les informations concernant l'application dans la page d'accueil." />
            <Modal.Content>
                <TextEditor setNewInfo={setNewInfo} appInfo={information} ></TextEditor>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setChangeAppInfoModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={() => {onSubmit(newInfo)}}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
    );
}

export default ChangeAppInfo;