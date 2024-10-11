import React, { Component } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react'
import Utils from '../../services/utils';

class CreateConstat extends Component {


    constructor(props) {
        super(props);
        const lastYearImported= this.props.importedYears.length>0 ? this.props.importedYears[this.props.importedYears.length-1]:"";
        this.state = {
            constat: {
                nomConstat: "",
                anneeDepartConstat: "2010",
                anneeFinConstat: lastYearImported,
                isAcademy: "academique",
                idAcademyOrConstat: props.academies.length>0 ? props.academies[0].value:"",
            },
            valueSelect: "",
            baseConstat: [{ text: "Données académiques", value: "academique" }, { text: "Constat existant", value: "constat" }],
        }

    }
    AllBaseConsta = [{ text: "Données académiques", value: "Données académiques" }, { text: "Constat existant", value: "Constat existant" }];
    AllAcademieConstat = [{ text: "Ensemble", value: "Ensemble" }];

    componentDidMount() {
    }

    handleEvent = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        const newConstat = { ...this.state.constat };
        newConstat[name] = value;
        this.setState({ constat: newConstat });
    }

    handleEventBase = (event, data) => {
        const newConstat = { ...this.state.constat };
        newConstat["isAcademy"] = data.value;
        this.setState({ constat: newConstat });
    }

    handleEventId = (event, data) => {
        const newConstat = { ...this.state.constat };
        newConstat["idAcademyOrConstat"] = data.value;
        this.setState({ constat: newConstat });
    }

    addConstat = (event) => {
        const { createConstat, setCreateConstatModal } = this.props;

        const newConstat = { ...this.state.constat };
        if (newConstat["isAcademy"] === "academique") newConstat.isAcademy = true;
        else newConstat.isAcademy = false;

        if (newConstat.nomConstat === "" || newConstat.nomConstat === null) {
            alert("Nom du constat obligatoire.");
        }
        else if (newConstat.idAcademyOrConstat === "" || newConstat.idAcademyOrConstat === null) {
            alert("Académie ou Constat obligatoire.");
        } else {
            const util = new Utils();
            if(util.validName(newConstat.nomConstat) === false) {
                alert("Le nom ne doit pas contenir de caractère spécial.")
            } else {
                setCreateConstatModal(false);
                newConstat.nomConstat = newConstat.nomConstat.trim();
                this.setState({
                    constat: {
                        nomConstat: "",
                        anneeDepartConstat: "2010",
                        anneeFinConstat: this.props.importedYears[this.props.importedYears.length-1],
                        isAcademy: "academique",
                        idAcademyOrConstat: "",
                    },
                    valueSelect: "",
                    baseConstat: [{ text: "Données académiques", value: "academique" }, { text: "Constat existant", value: "constat" }],
                });
                createConstat(newConstat);
            }
            
        }

    }

    render() {
        const { isCreateConstatModalOpen, setCreateConstatModal, academies, constats } = this.props;
        const { constat } = this.state;
        return (
            <Modal as={Form} size="small" closeIcon onClose={() => setCreateConstatModal(false)}
                open={isCreateConstatModalOpen} closeOnDimmerClick={false}>
                <Header content="Nouveau Constat" />
                <Modal.Content>
                    <div >
                        <label>Nom du constat</label>
                        <Form.Input type="text" placeholder="Entrez un nom pour le constat..." name="nomConstat" value={this.state.constat.nomConstat} onChange={this.handleEvent} />
                        <label>Année de départ (min 2010)</label>
                        <Form.Input type={"number"} min="2010" value={constat.anneeDepartConstat} name="anneeDepartConstat" onChange={(e) => this.handleEvent(e)} />
                        <label>Année de fin</label>
                        <Form.Input type={"number"} min={constat.anneeDepartConstat} value={constat.anneeFinConstat} name="anneeFinConstat" onChange={(e) => this.handleEvent(e)} />
                        <label>Constat à créer sur la base de :</label>
                        <Dropdown style={{ marginBottom: '10px' }} onChange={(event, data) => this.handleEventBase(event, data)} value={this.state.constat.isAcademy} fluid placeholder='' search selection options={this.state.baseConstat} />
                        {
                            constat.isAcademy === "academique" ? (
                                <label>Choix de l'académie</label>
                            ) : (
                                <label>Choix du constat</label>
                            )
                        }
                        {
                            constat.isAcademy === "academique" ? (

                                <Dropdown onChange={(event, data) => this.handleEventId(event, data)} value={this.state.constat.idAcademyOrConstat} fluid placeholder='' search selection options={academies} />

                            ) : (
                                <Dropdown onChange={(event, data) => this.handleEventId(event, data)} value={this.state.constat.idAcademyOrConstat} fluid placeholder='' search selection options={constats} />

                            )
                        }


                    </div>

                </Modal.Content>
                <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setCreateConstatModal(false)}>
                        Annuler
                    </Button>
                    <Button id="btnCreateConstat" type="submit" color="blue" onClick={this.addConstat}>
                        Valider
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default CreateConstat;