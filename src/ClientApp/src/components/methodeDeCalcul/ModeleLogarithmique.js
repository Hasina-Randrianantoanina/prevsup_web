import React, { useState } from 'react';
import { Button, Grid, Input } from 'semantic-ui-react';
import Utils from '../../services/utils';

function ModeleLogarithmique(props) {

    let { series, yearConstat, years, calculerHypothese, selectedVariable, atypicalYears, informationError} = props;
    let [decalage, setDecalage] = useState(0)
    let [internalFirstYearConstat, setInternalFirstYearConstat] = useState(years[0]);
    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    let [a, setA] = useState(0);
    let [b, setB] = useState(0);
    let [lastYearPrevision, setLastYearPrevision] = useState(years[years.length - 1]);
    const maxYear = years.length > 0 ? years[years.length - 1] : yearConstat;

    const handleDecal = (event) => {
        setInternalEndYearConstat(parseInt(yearConstat) + parseInt(event.target.value));
        setDecalage(event.target.value);
    }
    const handlePrevisionYear = (event) => {
        setLastYearPrevision(event.target.value);
    }
    const calculer = () => {
        const util = new Utils();
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalEndYearConstat) == false || util.isValidNumber(internalFirstYearConstat) == false
        || util.isValidNumber(a) == false
        || util.isValidNumber(b) == false) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        if(util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if(selectedVariable.type !== "Data" && selectedVariable.child!==0) return;
        
        let updatedVariable = {};
        const newSeries = [...series];
        decalage = parseFloat(decalage);
        internalFirstYearConstat = parseFloat(internalFirstYearConstat);
        internalEndYearConstat = parseFloat(internalEndYearConstat);
        lastYearPrevision = parseFloat(lastYearPrevision);
        a = parseFloat(a);
        b = parseFloat(b);
        // console.log(decalage)
        // console.log(internalFirstYearConstat)
        // console.log(internalEndYearConstat)
        // console.log(lastYearPrevision)
        // console.log(a)
        // console.log(b)

        for (let iS = 0; iS < newSeries.length; iS++) {

            if (newSeries[iS].Name === selectedVariable.Name) {
                const copied = { ...newSeries[iS] };
                const copiedSerie = [...copied["serie"]];
                let r2 = 0.0;
                const idxEndYearCt = years.indexOf(internalEndYearConstat);
                const idxLastYearPrev = years.indexOf(lastYearPrevision);
                const first_year = years[0];

                for (let i = 0; i <= idxEndYearCt; i++) {
                    const isAtypic = atypicalYears.indexOf(years[i]);
                    if(isAtypic === -1)
                    r2 += Math.pow(copiedSerie[i] - a * Math.log(i + first_year) - b, 2);
                }

                for (let i = idxEndYearCt + 1; i <= idxLastYearPrev; i++) {
                    copiedSerie[i] = a * Math.log(i + first_year) + b;
                }

                // console.log("r2=" + r2);
                copied["serie"] = copiedSerie;
                newSeries[iS] = copied;
                updatedVariable = copied;
                break;
            }
        }


        calculerHypothese(updatedVariable, newSeries);
    }
    return (
        <div>
            <u>Modèle logarithmique</u>
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
                <label><b>Y=a.log(X) + b</b></label>
                <Grid.Row>
                    <Grid.Column width={6}><label>a=</label></Grid.Column>
                    <Grid.Column width={10}><Input type='number' name='a' value={a} onChange={(event, data) => { setA(data.value) }} /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>b=</label></Grid.Column>
                    <Grid.Column width={10}><Input type='number' name='b' value={b} onChange={(event, data) => { setB(data.value) }} /></Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column width={16}>
                        <Button size='small' primary fluid onClick={() => calculer()}>Calculer hypothèses</Button>
                    </Grid.Column>
                </Grid.Row>


            </Grid>
        </div>
    )
}
export default ModeleLogarithmique