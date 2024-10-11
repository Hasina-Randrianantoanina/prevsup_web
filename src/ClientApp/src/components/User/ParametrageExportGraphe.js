import React, { useState } from 'react';
import { Header,Dropdown, Button, Modal, Form } from 'semantic-ui-react';

function ParametrageExportGraphe(props) {
    const { isParametrageExportModalOpen, setParametrageExportModal,choiceExportOption, setGraphExportOption, statusExport } = props;
    
    
    const [choice, setChoice]=useState(statusExport);
    const submitChoice = ()=>{
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        setGraphExportOption(choice,userId);
        setParametrageExportModal(false);
    }
    const handleChoice = (e,data)=>{
        setChoice(data.value)
    }
    return(
        <div>
            <Modal as={Form} size="small" closeIcon onClose={() => setParametrageExportModal(false)}
            open={isParametrageExportModalOpen} closeOnDimmerClick={false}>
            <Header content="Modifier le paramètre d'exportation de la partie graphique" />
            <Modal.Content>
                <div>
                    <label>Choix de l'option :</label>
                    <div>
                        <Dropdown onChange={(event,data) => handleChoice(event,data)} value={choice} fluid style={{ marginTop: "7px" }} placeholder='' search selection options={choiceExportOption} />
                    </div>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button type="reset" color="grey" onClick={() => setParametrageExportModal(false)}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={(event) => submitChoice()}>
                    Valider
                </Button>
            </Modal.Actions>
        </Modal>
        </div>
    )
}
export default ParametrageExportGraphe