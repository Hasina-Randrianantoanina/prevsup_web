import React, { useState } from 'react';
import { forwardRef } from 'react';
import {  Button, Grid, Input} from 'semantic-ui-react'
import Utils from '../../services/utils';

const TauxEvolutionAnnuel= forwardRef((props, ref) =>  {

    const {series, yearConstat, years, calculerHypothese, selectedVariable, atypicalYears, informationError} = props;
    let [decalage, setDecalage]=useState(0)
    let [internalFirstYearConstat, setInternalFirstYearConstat] = useState(years[0]);
    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    let [tauxEvolutionAnnuel, setTauxEvolutionAnnuel]=useState(0);
    let [lastYearPrevision, setLastYearPrevision] = useState(years[years.length-1]);
    const maxYear = years.length > 0 ? years[years.length - 1]: yearConstat;

    const handleDecal = (event) => {
        setInternalEndYearConstat(parseInt(yearConstat) + parseInt(event.target.value));
        setDecalage(event.target.value);
    }
    const handlePrevisionYear=(event) => {
        setLastYearPrevision(event.target.value);
    }
    const calculer=()=>{
        const util = new Utils();
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalFirstYearConstat) == false
        || util.isValidNumber(internalEndYearConstat) == false
        || util.isValidNumber(tauxEvolutionAnnuel) == false) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        if(util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if (selectedVariable.type !== "Data" && selectedVariable.child!==0) return;

        const newSeries = [...series];
        let updatedVariable = {};

        decalage = parseFloat(decalage);
        internalFirstYearConstat = parseFloat(internalFirstYearConstat);
        internalEndYearConstat = parseFloat(internalEndYearConstat);
        lastYearPrevision = parseFloat(lastYearPrevision);
        tauxEvolutionAnnuel = parseFloat(tauxEvolutionAnnuel);

        // console.log(decalage);
        // console.log(internalFirstYearConstat);
        // console.log(internalEndYearConstat);
        // console.log(lastYearPrevision);
        // console.log(tauxEvolutionAnnuel);

        for(let iS = 0; iS < newSeries.length; iS++) {
            if(newSeries[iS].Name === selectedVariable.Name) {
                const copied = {...newSeries[iS]};
                const idxEndYearCt = years.indexOf(internalEndYearConstat);
                const idxLastYearPrev = years.indexOf(parseInt(lastYearPrevision));
                const serieCopied = [...copied["serie"]];
                
                const yearCount = idxLastYearPrev - idxEndYearCt;
                let value = serieCopied[idxEndYearCt];
                let cst =  (tauxEvolutionAnnuel / 100);
                
                for(let iD = idxEndYearCt + 1; iD <= idxLastYearPrev; iD++ ) {
                    serieCopied[iD] = (value * cst) + value;
                    value = serieCopied[iD];
                }
                copied["serie"] = serieCopied;

                newSeries[iS] = copied;
                updatedVariable = copied;
                break;
            }
        }

        calculerHypothese(updatedVariable, newSeries);
    }
    return(
        <div>
            <u>Taux d'évolution annuel</u>
            <Grid>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Décalage:</label></Grid.Column>
                    <Grid.Column width={6}><Input type='number' min={0} value={decalage} onChange={handleDecal} /></Grid.Column>
                </Grid.Row>
                {/* <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Première année de constat:</label></Grid.Column>
                    <Grid.Column width={6}><Input value={internalFirstYearConstat} type='number' min={years[0]} max={yearConstat} onChange={(event,data)=>{setInternalFirstYearConstat(data.value)}} /></Grid.Column>
                </Grid.Row> */}
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Dernière année de constat:</label></Grid.Column>
                    <Grid.Column width={6}><Input readOnly disabled value={internalEndYearConstat} type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Dernière année de prévision:</label></Grid.Column>
                    <Grid.Column width={6}><Input min={yearConstat + 1} onChange={handlePrevisionYear} defaultValue={lastYearPrevision} max={maxYear} type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Taux d'évolution (%):</label></Grid.Column>
                    <Grid.Column width={6}><Input type='number' min={0} defaultValue={0} name={'taux'} onChange={(event,data)=>{setTauxEvolutionAnnuel(data.value)}} /></Grid.Column>
                </Grid.Row>
               
                <Grid.Row>
                    <Grid.Column width={16}>
                    <Button size='small' primary fluid onClick={() => calculer()}>Calculer hypothèses</Button>
                    </Grid.Column>
                </Grid.Row>
                
            </Grid>
        </div>
    )
});
export default TauxEvolutionAnnuel;