import { Button, Dropdown, Grid } from "semantic-ui-react";
import DerniereValeurObserve from '../../components/methodeDeCalcul/DerniereValeurObserve';
import MoyenneArithmetique from '../../components/methodeDeCalcul/MoyenneArithmetique';
import ModeleEnPuissance from '../../components/methodeDeCalcul/ModeleEnPuissance';
import ModeleExponentiel from '../../components/methodeDeCalcul/ModeleExponentiel';
import ModeleLogarithmique from '../../components/methodeDeCalcul/ModeleLogarithmique';
import MoyenneGlissantePondere from '../../components/methodeDeCalcul/MoyenneGlissantePondere';
import RegressionLineaireParametree from '../../components/methodeDeCalcul/RegressionLineaireParametree';
import TauxEvolutionAnnuel from '../../components/methodeDeCalcul/TauxEvolutionAnnuel';
import TauxEvolutionGlobal from '../../components/methodeDeCalcul/TauxEvolutionGlobal';
import ModelePolynomial from '../../components/methodeDeCalcul/ModelePolynomial';
import AnneeAtypiqueAccordion from '../../components/Scenario/AnneeAtypiqueAccordion';

import Filiere from '../../components/Filtre/Filiere';
import { useState } from "react";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";


const methodeCalcul = [
    { text: "Dernière valeur observée", value: "lastValueObserved" },
    { text: "Moyenne arithmétique", value: "meanA" },
    { text: "Taux d'évolution globale", value: "Tglobal" },
    { text: "Taux d'évolution annuel", value: "Tannuel" },
    { text: "Moyenne glissante pondéré", value: "meanG" },
    { text: "Régression linéaire paramétrée", value: "regr" },
    { text: "Modèle exponentiel", value: "exp" },
    { text: "Modèle logarithmique", value: "log" },
    { text: "Modèle polynomial", value: "pol" },
    { text: "Modèle en puissance", value: "pow" }
];

const AidePrevision = forwardRef((props, ref) => {

    const { optionsFilieres, seriesHypo, lastYear, firstYear, years, calculContexte, calculerHypothese, selectedVariable, changeFiliere, informationError, filteredFilieres, currentDegre, setScenarioAtypicalYears, calculateAll,lastDegreeOpened,idScenario, getIndexDegre, updateDegreesModified, degresModifies, isNationalUser, degres, changeDegre } = props;

    const [selectedMethodeCalcul, setSelectedMethodeCalcul] = useState("lastValueObserved");

    const [internalSelectedVariable, setInternalSelectedVariable] = useState(selectedVariable);
    const [atypicalYears, setAtypicalYears] = useState([]);
    useImperativeHandle(ref, () => ({

        updateSelectedVariable(newSelectedVariable) {
            setInternalSelectedVariable(newSelectedVariable);
        }
    }));

    const calculerCtx = () => {
        calculContexte();
    }

    const calculerHypo = (type, updatedVariable, series) => {
        calculerHypothese(type, updatedVariable, series);
    }
    const calculAllDegreesOpened = () => {
        let idScen=idScenario
        let currentDegree=currentDegre
        let lastDegreeOpen= lastDegreeOpened
        let indexCurrentDegree=getIndexDegre(currentDegre)
        let lastDegree= isNationalUser?degres[degres.length-1] : degres[degres.length-2]
        let formatLastDegree= lastDegree==="Diplômé"? "Diplome": "Academie"
        let  islastDegree= lastDegreeOpen===formatLastDegree ? true : false
        const lastDegreOpenData = getDegreOnglet(lastDegreeOpened)
        const degreesModified = degresModifies;
        for(let i=indexCurrentDegree;i<degreesModified.length;i++){
            degreesModified[i]=false;
        }
        
        if (lastDegreeOpen===currentDegre || lastDegreeOpen===indexCurrentDegree){
            
            alert("Veuillez bien vérifier les onglets à calculer.")
        }else{
            calculateAll(idScen, lastYear, currentDegree, lastDegreeOpen,  islastDegree, isNationalUser)
            updateDegreesModified(degreesModified)
        }
    }
    const getDegreOnglet = (degre) =>{
        switch(degre){
            case 0:
                return "Entrant";
            case 1:
                return "Degré 1";
            case 2:
                return "Degré 2";
            case 3:
                return "Degré 3";
            case 4:
                return "Degré 4";
            case 5:
                return "Degré 5";
            case 6:
                return "Degré 6";
            case "Diplome":
                return "Diplômé";
            case "Academie":
                return "Académie";
            default:
                return "Entrant";
        }
    }

    const renderSwitch = (calculMethod) => {
        switch (calculMethod) {
            case "meanA":
                return <MoyenneArithmetique informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("meanA", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} firstYearConstat={firstYear} years={years} />; // ref={this.previsionContentRef} 
            case "Tglobal":
                return <TauxEvolutionGlobal informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("Tglobal", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />; // ref={this.previsionContentRef} 
            case "Tannuel":
                return <TauxEvolutionAnnuel informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("Tannuel", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />; // ref={this.previsionContentRef} 
            case "meanG":
                return <MoyenneGlissantePondere informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("meanG", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />; // ref={this.previsionContentRef} 
            case "regr":
                return <RegressionLineaireParametree informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("regr", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />; // ref={this.previsionContentRef} 
            case "exp":
                return <ModeleExponentiel informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("exp", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />;
            case "log":
                return <ModeleLogarithmique informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("log", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />;
            case "pol":
                return <ModelePolynomial informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("pol", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />;
            case "pow":
                return <ModeleEnPuissance informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("pow", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />;
            default:
                return <DerniereValeurObserve informationError={informationError} atypicalYears={atypicalYears} selectedVariable={internalSelectedVariable} calculerHypothese={(updatedVariable, series) => calculerHypo("", updatedVariable, series)} series={seriesHypo} yearConstat={lastYear} years={years} />;
        }
    }

    const constatYears = [];
    years.forEach(year => {
        if(year <= lastYear) constatYears.push(year);
    })
    return (


        <Grid>
            <Grid.Row>
                <Grid.Column width={6}><label>Méthode de calcul:</label></Grid.Column>
                <Grid.Column width={10}><Dropdown fluid placeholder='' search selection options={methodeCalcul} onChange={(event, data) => setSelectedMethodeCalcul(data.value)} /></Grid.Column>
            </Grid.Row>
            <div>{renderSwitch(selectedMethodeCalcul)}</div>
            <Grid.Row>
                <Grid.Column width={16}>
                    <AnneeAtypiqueAccordion constatYears={constatYears} setAtypicalYears={(years) => { setAtypicalYears(years); setScenarioAtypicalYears(years); }} />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Button size='small' primary fluid onClick={() => calculerCtx()}>Calculer contexte</Button>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column width={16}>
                    <Button size='small' primary fluid onClick={() => calculAllDegreesOpened()} >Tout calculer</Button>
                </Grid.Column>
            </Grid.Row>

            <Grid.Row>
                <Grid.Column width={16}>
                    <Filiere filteredFilieres={filteredFilieres} currentDegre={currentDegre} changeFiliere={changeFiliere} filieres={optionsFilieres} className="custom-accordion-filtre" />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    )
});

export default AidePrevision;