import React, { Component } from 'react';
import { Header, Icon, Segment, Menu, Dropdown, Button, Modal, Form, Select } from 'semantic-ui-react';
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css'
import Dualbox from '../dualbox';
import Utils from '../../services/utils';

class CreateUser extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            user: {
                login: "",
                nom: "",
                mdp: "",
                confirmationMdp: "",
                profil: this.allProfil[0].value,
                academies: "",
            },
        };
    }
    allProfil= [{ value: 'Prévisionniste SSA', text: 'Prévisionniste SSA' }, { value: 'Administrateur', text: 'Administrateur' }]
    

    handleEvent = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        const newUser = {...this.state.user};
        newUser[name]=value;
        this.setState({user:newUser});
        
    }

    addUser = () => {
        const {createUser,setNewUserModal}=this.props;
        const newUser={...this.state.user};
        if(newUser.mdp!=newUser.confirmationMdp){
            alert("Le mot de passe et confirmation mot de passe ne sont pas identiques.")
        }else if(newUser.academies=="" || newUser.academies==null){
            alert("Veuillez sélectionner au moins une académie.")
        }else{
            const util=new Utils();
            if(util.validNameWithSpace(newUser.nom) === false || util.validName(newUser.login)===false) {
                alert("Le login et nom ne doivent pas contenir de caractère spécial.")
            }else{
                setNewUserModal(false);
            createUser(newUser)
            }
            
        }
    }


    handleDualBox = (data) => {
        const newUser = {...this.state.user};
        newUser['academies']=data.join(',')
        this.setState({user:newUser});
    }

    render() {
        const { isNewUserModalOpen, setNewUserModal, allAcademies } = this.props;

        return (
            <Modal as={Form} size="small" closeIcon onClose={() => setNewUserModal(false)}

                open={isNewUserModalOpen} closeOnDimmerClick={false}>
                <Header content="Nouvel utilisateur" />
                <Modal.Content>
                    <div>
                        <label>Login</label>
                        <Form.Input type={"text"} placeholder="Entrez le login..." name="login" onChange={(e) => this.handleEvent(e)} />
                        <label>Nom</label>
                        <Form.Input type={"text"} placeholder="Entrez le nom..." name="nom" onChange={(e) => this.handleEvent(e)} />
                        <label>Mot de passe</label>
                        <Form.Input type={"password"} placeholder="Entrez le mot de passe..." name="mdp" onChange={(e) => this.handleEvent(e)} />
                        <label>Confirmer le mot de passe</label>
                        <Form.Input type={"password"} placeholder="Confirmez le mot de passe..." name="confirmationMdp" onChange={(e) => this.handleEvent(e)} />
                        <label>Profil:</label>
                        <br></br>
                        <select value={this.state.user.profil} name="profil" onChange={(e) => this.handleEvent(e)}>

                            {this.allProfil.map(profil => (

                                <option key={profil.value} value={profil.value}>
                                    {profil.text}
                                </option>
                            ))}
                        </select>
                        <br />
                        <label>Academies:</label>
                       
                        <Dualbox handleDualBox={this.handleDualBox} academies={allAcademies} initialState={null} type={"create-user"}/>
                    </div>

                </Modal.Content>
                <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setNewUserModal(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" color="blue" onClick={() => this.addUser()}>
                        Valider
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default CreateUser;