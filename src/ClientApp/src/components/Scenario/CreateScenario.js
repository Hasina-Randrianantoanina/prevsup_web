import React, { Component } from 'react';
import { Header, Icon, Segment, Menu, Dropdown, Button, Modal, Form, Select } from 'semantic-ui-react'
import Utils from '../../services/utils';

class CreateScenario extends Component {
    // const;
    // const 

    constructor(props) {
        super(props);
        this.state = {
            scenario: {
                nomScenario: "",
                anneeDepartScenario: props.constats.length>0 && props.constats[0] && props.constats[0].last_year ? (parseInt(props.constats[0].last_year)+1).toString() :"2010",
                anneeFinScenario: props.constats.length>0 && props.constats[0] && props.constats[0].last_year ? (parseInt(props.constats[0].last_year)+2).toString():"2011" ,
                detail: "simplifie",
                base: "constat",
                idConstatOrScenario: props.constats.length>0 && props.constats[0] ? props.constats[0].value:"",
                isNew: "",
                isEasy: true,
                minDepart: "",
                minFin: ""
            },
            details: [{ text: "simplifié", value: "simplifie" }, { text: "fin", value: "fin" }],

            baseScenario: [{ text: "Constats", value: "constat" }, { text: "Scenario existant", value: "scenario" }],
        }
    }
    AllBaseConsta = [{ text: "Données académiques", value: "Données académiques" }, { text: "Scenario existant", value: "Scenario existant" }];
    AllAcademieScenario = [{ text: "Ensemble", value: "Ensemble" }];

    componentDidMount() {
    }

    handleEvent = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        const newScenario = { ...this.state.scenario };
        newScenario[name] = value;
        this.setState({ scenario: newScenario });
    }

    handleEventBase = (event, baseOrDetail, data) => {
        const newScenario = { ...this.state.scenario };
        if (baseOrDetail === "base") newScenario["base"] = data.value;
        else newScenario["detail"] = data.value;
        this.setState({ scenario: newScenario });
    }

    handleEventId = (event, data, constatOrScenario, constatOrScenarioAll) => {
        const newScenario = { ...this.state.scenario };
        newScenario["idConstatOrScenario"] = data.value;
        let anneDepartScenario = "";
        let anneeFinScenario = "";

        if (constatOrScenario === "constat") {
            // newScenario["minFin"]=data.value;
            const constats = [];
            //console.log(constatOrScenarioAll)
            Object.values(constatOrScenarioAll).forEach(c => { constats.push({ key: c.key, lastYear: c.last_year }) });
            const cn = constats.find(c => c.key === data.value);
            anneDepartScenario = parseInt(cn.lastYear) + 1;
            // //console.log(anneDepartScenario.toString())
            //console.log(anneDepartScenario.toString())
            newScenario["anneeDepartScenario"] = anneDepartScenario.toString();
            newScenario["anneeFinScenario"] = (anneDepartScenario+1).toString();
        }
        else {
            const scenarios = [];
            //console.log(constatOrScenarioAll)
            Object.values(constatOrScenarioAll).forEach(s => { scenarios.push({ key: s.key, lastYear: s.last_year, firstYear: s.first_year }) });
            const sc = scenarios.find(s => s.key === data.value);
            anneDepartScenario = sc.firstYear;
            anneeFinScenario = sc.lastYear;
            // newScenario["minDepart"] = anneDepartScenario;
            // newScenario["minFin"] = anneeFinScenario;
            newScenario["anneeDepartScenario"] = anneDepartScenario;
            newScenario["anneeFinScenario"] = anneeFinScenario;


        }
        this.setState({ scenario: newScenario });

    }

    addScenario = (event) => {
        const { createScenario, setCreateScenarioModal } = this.props;

        const newScenario = { ...this.state.scenario };
        if (newScenario["base"] === "constat") newScenario.isNew = true;
        else newScenario.isNew = false;

        if (newScenario["detail"] === "simplifie") newScenario.isEasy = true;
        else newScenario.isEasy = false;
        if (newScenario.nomScenario === "" || newScenario.nomScenario === null) {
            alert("Nom du scénario obligatoire.");
        }
        else if (newScenario.idConstatOrScenario === "" || newScenario.idConstatOrScenario === null) {
            alert("Constat ou scnénario de base obligatoire.");
        } else {
            const util = new Utils();
            if(util.validName(newScenario.nomScenario) == false) {
                alert("Le nom ne doit pas contenir de caractère spécial.")
            } else {
                newScenario.nomScenario = newScenario.nomScenario.trim();
                setCreateScenarioModal(false);
                this.setState(
                    {
                        scenario: {
                            nomScenario: "",
                            anneeDepartScenario: "2010",
                            anneeFinScenario: "2020",
                            detail: "simplifie",
                            base: "constat",
                            idConstatOrScenario: "",
                            isNew: "",
                            isEasy: true,
                            minDepart: "",
                            minFin: ""
                        },
                        details: [{ text: "simplifié", value: "simplifie" }, { text: "fin", value: "fin" }],
    
                        baseScenario: [{ text: "Constats", value: "constat" }, { text: "Scenario existant", value: "scenario" }],
                    }
                )
                createScenario(newScenario);
            }
            
        }
        // console.log(newScenario)
        event.preventDefault();
    }

    render() {
        const { isCreateScenarioModalOpen, setCreateScenarioModal, constats, scenarios } = this.props;
        const { scenario } = this.state;
        return (
            <Modal as={Form} size="small" closeIcon onClose={() => setCreateScenarioModal(false)}
                open={isCreateScenarioModalOpen} closeOnDimmerClick={false}>
                <Header content="Nouveau Scénario" />
                <Modal.Content>
                    <div >
                        <label>Nom du scenario</label>
                        <Form.Input type="text" placeholder="Entrez un nom pour le scénario..." name="nomScenario" value={this.state.scenario.nomScenario} onChange={this.handleEvent} />
                        <label>Année de départ de prévision</label>
                        <Form.Input type={"number"} value={scenario.anneeDepartScenario} name="anneeDepartScenario" />
                        <label>Année de fin de prévision</label>
                        {
                            scenario.base === "constat" ? (
                                <Form.Input type={"number"} min={(parseInt(scenario.anneeDepartScenario) + 1).toString()} value={scenario.anneeFinScenario} name="anneeFinScenario" onChange={(e) => this.handleEvent(e)} />
                            ) : (
                                <Form.Input type={"number"} value={scenario.anneeFinScenario} name="anneeFinScenario" />
                            )
                        }

                        <label>Niveau de détail:</label>
                        <Dropdown style={{ marginBottom: '10px' }} onChange={(event, data) => this.handleEventBase(event, "detail", data)} defaultValue={"simplifie"} fluid placeholder='' search selection options={this.state.details} />
                        <label>Scénario à créer sur la base de:</label>
                        <Dropdown style={{ marginBottom: '10px' }} onChange={(event, data) => this.handleEventBase(event, "base", data)} defaultValue={"constat"} fluid placeholder='' search selection options={this.state.baseScenario} />
                        {
                            scenario.base === "constat" ? (
                                <label>Liste des constats</label>
                            ) : (
                                <label>Liste des scenarios</label>
                            )
                        }
                        {
                            scenario.base === "constat" ? (

                                <Dropdown onChange={(event, data) => this.handleEventId(event, data, "constat", constats)} value={this.state.scenario.idConstatOrScenario} fluid placeholder='' search selection options={constats} />

                            ) : (
                                <Dropdown onChange={(event, data) => this.handleEventId(event, data, "scenario", scenarios)} value={this.state.scenario.idConstatOrScenario} fluid placeholder='' search selection options={scenarios} />

                            )
                        }


                    </div>

                </Modal.Content>
                <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setCreateScenarioModal(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" color="blue" onClick={this.addScenario}>
                        Valider
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default CreateScenario;