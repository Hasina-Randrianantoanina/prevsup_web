import React, { useState } from 'react';
import { forwardRef } from 'react';
import { Button, Grid, Checkbox, Input } from 'semantic-ui-react'
import Utils from '../../services/utils';

const TauxEvolutionGlobal = forwardRef((props, ref) => {
    const { series, yearConstat, years, calculerHypothese, selectedVariable, atypicalYears, informationError} = props;
    let [valueTaux, setValueTaux] = useState(0);
    let [valueValeur, setValueValeur] = useState(0);
    // const [internalFirstYearConstat, setInternalFirstYearConstat] = useState(firstYearConstat);
    const [decalage, setDecalage]=useState(0)
    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    const [type, setType] = useState("taux");
    let [lastYearPrevision, setLastYearPrevision] = useState(yearConstat + 1);
    const maxYear = years.length > 0 ? years[years.length - 1] : yearConstat;


    const calculer = () => {
        const util = new Utils();
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalEndYearConstat) == false
        || (util.isValidNumber(valueTaux) == false &&  type === "taux")
        || (util.isValidNumber(valueValeur) == false && type === "valeur")) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        if(util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if (selectedVariable.type !== "Data" && selectedVariable.child!==0) return;

        valueTaux  = parseFloat(valueTaux);
        valueValeur = parseFloat(valueValeur);
        internalEndYearConstat = parseFloat(internalEndYearConstat);
        lastYearPrevision = parseFloat(lastYearPrevision);


        const newSeries = [...series];

        let updatedVariable = {};
        if(type === "taux") {
            for(let iS = 0; iS < newSeries.length; iS++) {
                if(newSeries[iS].Name === selectedVariable.Name) {
                    const copied = {...newSeries[iS]};
                    const idxEndYearCt = years.indexOf(internalEndYearConstat);
                    const idxLastYearPrev = years.indexOf(parseInt(lastYearPrevision));
                    const serieCopied = [...copied["serie"]];
                    
                    const yearCount = idxLastYearPrev - idxEndYearCt;
                    let value = serieCopied[idxEndYearCt];
                    const cst = Math.pow((1 + (parseFloat(valueTaux) / 100)), 1 / yearCount);;

                    for(let iD = idxEndYearCt + 1; iD <= idxLastYearPrev; iD++ ) {
                        serieCopied[iD] = value *  cst;
                        value = serieCopied[iD];
                    }
                    copied["serie"] = serieCopied;

                    newSeries[iS] = copied;
                    updatedVariable = copied;
                    break;
                }
            }
        } else if (type === "valeur") {
            for(let iS = 0; iS < newSeries.length; iS++) {
                if(newSeries[iS].Name === selectedVariable.Name) {
                    const copied = {...newSeries[iS]};
                    const idxEndYearCt = years.indexOf(internalEndYearConstat);
                    const idxLastYearPrev = years.indexOf(parseInt(lastYearPrevision));
                    const serieCopied = [...copied["serie"]];
                    
                    const yearCount = idxLastYearPrev - idxEndYearCt;
                    let value = serieCopied[idxEndYearCt];
                    let cst =  1 + ((valueValeur - serieCopied[idxEndYearCt]) / (serieCopied[idxEndYearCt]));
                    cst = Math.pow(cst, 1 / yearCount);
                    

                    for(let iD = idxEndYearCt + 1; iD <= idxLastYearPrev; iD++ ) {
                        serieCopied[iD] = value *  cst;
                        value = serieCopied[iD];
                    }
                    copied["serie"] = serieCopied;

                    newSeries[iS] = copied;
                    updatedVariable = copied;
                    break;
                }
            }
        }

        calculerHypothese(updatedVariable, newSeries);
    }

    return (
        <div>
            <u>Taux d'évolution global</u>
            <Grid>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Décalage:</label></Grid.Column>
                    <Grid.Column width={6}><Input type='number' min={0} defaultValue={0} onChange={(event) => setInternalEndYearConstat(yearConstat + parseInt(event.target.value))} /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Dernière année de constat:</label></Grid.Column>
                    <Grid.Column width={6}><Input readOnly disabled value={internalEndYearConstat} type='number' min={0} /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Dernière année de prévision:</label></Grid.Column>
                    <Grid.Column width={6}><Input min={yearConstat + 1} onChange={(event) => setLastYearPrevision(event.target.value)} defaultValue={lastYearPrevision} max={maxYear} type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><Checkbox radio label="Taux d'évolution globale(%):" name='checkboxRadioGroup' checked={type === 'taux'} onChange={(e, data) => setType("taux")} /></Grid.Column>
                    <Grid.Column width={6}><Input type='number' min={0} onChange={(event, data) => { setValueTaux(data.value) }} /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}>
                        <Checkbox radio label="Dérnière valeur de prévision:" name='checkboxRadioGroup' checked={type === 'valeur'} onChange={(e, data) => setType("valeur")} />
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Input type='number' min={0} onChange={(event, data) => { setValueValeur(data.value) }} />
                    </Grid.Column>
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
export default TauxEvolutionGlobal