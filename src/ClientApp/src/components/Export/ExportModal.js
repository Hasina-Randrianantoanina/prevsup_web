import React from 'react';
import { useState } from 'react';
import { List, Modal,Form, Button, Checkbox } from 'semantic-ui-react';
import './ExportModal.css';

function ExportModal(props) {
    const {isExportOpen, setExportOpen, variables, exportVariables} = props;

    const [selectedVars, setSelectedVars] = useState([]);

    const validate = () => {
        if(selectedVars.length == 0) {
            alert("Veuillez choisir au moins une variable à exporter");
            return;
        }
        exportVariables([...selectedVars]).then(() => setSelectedVars([]));
    }

    const addVar = (isChecked, variable) => {
        let selectedVarsCopied = [...selectedVars];
        if(isChecked)selectedVarsCopied.push(variable);
        else {
            selectedVarsCopied = selectedVarsCopied.filter(selectedVar => {
                return selectedVar.Name !== variable.Name;
            })
        }
        setSelectedVars(selectedVarsCopied);
    }

    const doSelectAll = (value) => {
        if(value) {
            let selectedVarsCopied = [...variables];
            setSelectedVars(selectedVarsCopied);
        } else {
            setSelectedVars([]);
        }
    }

    const listContent = variables.map(variable => {
        let found = selectedVars.find(x => x.Name === variable.Name);
        let isChecked = false;
        if(found) isChecked = true;

        return (
            <List.Content key={variable.Name}>
                <Checkbox checked={isChecked} onChange={(e, data) => addVar(data.checked, variable)} />
                <span>{variable.RealName}</span>
            </List.Content>
        );
    });

    const onClose = () => {
        setExportOpen(false);
        setSelectedVars([]);
    }

    return (
        <Modal  as={Form} size="small" closeIcon onClose={() => onClose()}
        open={isExportOpen} closeOnDimmerClick={false}>
            <Modal.Header content="Sélection des variables à exporter" />
            <Modal.Content >
                <Button primary onClick={(event) => doSelectAll(true)}>Tout cocher</Button> <Button secondary onClick={(event) => doSelectAll(false)}>Tout décocher</Button>
                <List className='export-vars'>
                {listContent}
                </List>
            </Modal.Content>
            <Modal.Actions>
            <Button type="reset" color="grey" onClick={() => onClose()}>
                    Annuler
                </Button>
                <Button type="submit" color="blue" onClick={(e) => validate(e)}>
                    Exporter
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default ExportModal;