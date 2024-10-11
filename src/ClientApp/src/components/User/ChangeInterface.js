import React, { useState } from 'react';
import { Header, Icon, Grid, Button, Modal, Form } from 'semantic-ui-react';


function ChangeInterface(props) {

    const { isChangInterfaceModalOpen, setChangeInterfaceModal, changeColorUI, GetColorUI } = props;
    const defaultColors = { active: "#0db4ea", back: "#ffffff", calcback: "#dbb9b9", calcconst: "#000000", calcscen: "#000000", constatdata: "#000000", scenback: "#dbb9b9", scendata: "#000000", separator: "#ff0a11" }
    const user = JSON.parse(sessionStorage.getItem("user"));
    const actualColor = user.colorUI;
    const userId = user.id;
    const [colors, setColors] = useState(JSON.parse(sessionStorage.getItem("user")).colorUI);
    const [newUser, setNewUser] = useState(user);
    const handleChange = (event) => {
        let name = event.target.name;
        let value = event.target.value;
        const newColor = { ...colors };
        newColor[name] = value;
        setColors(newColor);
    }
    const submitColor = () => {

        let newUser1 = { ...newUser }
        newUser1.colorUI = colors;
        sessionStorage.setItem("user", JSON.stringify(newUser1));
        // console.log(colors.calcscen)
        setChangeInterfaceModal(false);

        changeColorUI(colors, userId)
    }
    const restoreColor = () => {
        let newUser1 = { ...newUser }
        newUser1.colorUI = defaultColors;
        sessionStorage.setItem("user", JSON.stringify(newUser1));
        setChangeInterfaceModal(false);
        changeColorUI(defaultColors, userId)
    }
    return (
        <div>
            <Modal as={Form} size="small" closeIcon onClose={() => setChangeInterfaceModal(false)}
                open={isChangInterfaceModalOpen} closeOnDimmerClick={false}>
                <Header content="Interface d'utilisateur" />
                <Modal.Content>
                    <div>
                        <Grid>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Interface
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    Actuelle
                                </Grid.Column>
                                <Grid.Column>
                                    Defaut
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Séparateur vertical
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"separator"} value={colors.separator} onChange={handleChange} ></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.separator} ></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données (arrière plan)
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"back"} value={colors.back} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.back} ></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données calculées (arrière plan)
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"calcback"} value={colors.calcback} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.calcback} ></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données calculées de constat
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"calcconst"} value={colors.calcconst} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.calcconst} ></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données de constat
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"constatdata"} value={colors.constatdata} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.constatdata}></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données calculées de scénario
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"calcscen"} value={colors.calcscen} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.calcscen}></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données calculées de scénario (arrière plan)
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"scenback"} value={colors.scenback} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.scenback} ></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Données de scenario
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"scendata"} value={colors.scendata} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled value={defaultColors.scendata} ></input>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={6} only='large screen'>
                                <Grid.Column width={5}>
                                    Séléction de données
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} name={"active"} value={colors.active} onChange={handleChange}></input>
                                </Grid.Column>
                                <Grid.Column>
                                    <input type={"color"} readOnly disabled name={'active'} value={"#0db4ea"} ></input>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>

                    </div>
                </Modal.Content>
                <Modal.Actions>
                    <Button type="reset" color="red" onClick={() => setChangeInterfaceModal(false)}>
                        <Icon name='ban' /> Annuler
                    </Button>
                    <Button type="reset" color="grey" onClick={restoreColor}>
                        <Icon name='sync alternate' /> Réinitialiser
                    </Button>
                    <Button type="submit" color="green" onClick={submitColor} >
                        <Icon name='check' /> Valider
                    </Button>
                </Modal.Actions>
            </Modal>
        </div>
    )
}
export default ChangeInterface;