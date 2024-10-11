import React, { Component } from 'react';
import { Header,Dropdown, Button, Modal, Form } from 'semantic-ui-react'
import Utils from '../../services/utils';

class CreateRecap extends Component {
    

    constructor(props) {
        super(props);
        const userAuth = JSON.parse(sessionStorage.getItem("user"));
        this.state = {
            recap: {
                nomRecap: "",
                academyId:"",
                userId: userAuth.id,
                idscenario:props.scenarios.length>0 ? props.scenarios[0].value : ""
            },
           
        }

    }
   
    componentDidMount() {
    }

    handleEvent = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        const newRecap = {...this.state.recap};
        newRecap[name]=value;
        this.setState({recap:newRecap});
    }

    handleEventBase = (event, data) => {
        const newRecap = {...this.state.recap};
        newRecap["idscenario"]=data.value;
        this.setState({recap:newRecap});
    }

    handleEventId =  (event, data) => {
        const newRecap = {...this.state.recap};
        newRecap["idscenario"]=data.value;
        this.setState({recap:newRecap});
    }

    addRecap = (event) => {
        const {createRecap, setCreateRecapModal} = this.props;
        const newRecap = {...this.state.recap};
        if(!newRecap.nomRecap || !newRecap.nomRecap.trim()) {
            alert("Veuillez saissir un nom valide.");
            return;
        }
        if(!newRecap.idscenario) {
            alert("Veuillez choisir un scénario.");
            return;
        }
        if(newRecap["base"] === "Constats") newRecap.isNew = true;
        else newRecap.isNew = false;
        const util = new Utils();
        if(util.validName(newRecap.nomRecap) === false) {
            alert("Le nom ne doit pas contenir de caractère spécial.")
        } else {
            newRecap.nomRecap = newRecap.nomRecap.trim();
            setCreateRecapModal(false);
            const userAuth = JSON.parse(sessionStorage.getItem("user"));
            this.setState( {
                recap: {
                    nomRecap: "",
                    academyId:"",
                    userId: userAuth.id,
                    idscenario:""
                },
               
            });
            createRecap(newRecap);

        }

        event.preventDefault();
    }

    render() {
        const { isCreateRecapModalOpen, setCreateRecapModal, scenarios, } = this.props;
        
        return (
            <Modal as={Form} size="small" closeIcon onClose={() => setCreateRecapModal(false)}
                open={isCreateRecapModalOpen} closeOnDimmerClick={false}>
                <Header content="Nouveau Recap" />
                <Modal.Content>
                    <div >
                        <label>Nom du recap</label>
                        <Form.Input type="text" placeholder="Entrez un nom du tabrécap..." name="nomRecap" value={this.state.recap.nomRecap}  onChange={this.handleEvent} />
                        <label>Scénario:</label>
                        <Dropdown  onChange={(event, data) => this.handleEventId(event, data)} value={this.state.recap.idscenario} fluid placeholder='' search selection options={scenarios} />
                        
                    </div>

                </Modal.Content>
                <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setCreateRecapModal(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" color="blue" onClick={this.addRecap}>
                        Valider
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default CreateRecap;