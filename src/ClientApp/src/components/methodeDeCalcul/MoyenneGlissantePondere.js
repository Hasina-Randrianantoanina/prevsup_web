import React, { useState } from 'react';
import { Button, Grid, Input } from 'semantic-ui-react';
import Utils from '../../services/utils';

function MoyenneGlissantePondere(props) {

    const { series, yearConstat, years, calculerHypothese, selectedVariable, atypicalYears, informationError } = props;
    let [decalage, setDecalage] = useState(0)
    let [internalFirstYearConstat, setInternalFirstYearConstat] = useState(years[0]);
    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    let [lastYearPrevision, setLastYearPrevision] = useState(yearConstat + 1);
    const [pond, setPond] = useState([]);
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
        if (util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalFirstYearConstat) == false || util.isValidNumber(internalEndYearConstat) == false) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        if (util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if (selectedVariable.type !== "Data" && selectedVariable.child!==0) return;

        decalage = parseFloat(decalage);
        internalFirstYearConstat = parseFloat(internalFirstYearConstat);
        internalEndYearConstat = parseFloat(internalEndYearConstat);
        lastYearPrevision = parseFloat(lastYearPrevision);

        // console.log(decalage)
        // console.log(internalFirstYearConstat)
        // console.log(internalEndYearConstat)
        // console.log(lastYearPrevision)

        if (pond.length < internalEndYearConstat - internalFirstYearConstat + 1) {
            informationError(`Le nombre de pondérations est issuffisants.`);
            return;
        }        

        const newSeries = [...series];
        let updatedVariable = {};

        for (let iS = 0; iS < newSeries.length; iS++) {

            if (newSeries[iS].Name === selectedVariable.Name) {
                const copied = { ...newSeries[iS] };
                const copiedSerie = [...copied["serie"]];
                const idxEndYearCt = years.indexOf(internalEndYearConstat);
                const idxFirstYearCt = years.indexOf(internalFirstYearConstat);
                const idxLastYearPrev = years.indexOf(lastYearPrevision);
                const first_year = years[0];
                
                for (let i = 0; i <= idxEndYearCt; i++) {

                }
                let refYear = idxFirstYearCt;
                for (let i = idxEndYearCt + 1; i <= idxLastYearPrev; i++) {
                    let val = 0.0;
                    let e = 0.0;
                    for (let j = refYear; j < i; j++) {
                        const isAtypic = atypicalYears.indexOf(years[i]);
                        if (isAtypic === -1) {
                            let tmptaux = pond[(pond.length - 1) - (j - refYear)];
                            e += tmptaux;
                            val = val + (tmptaux * copiedSerie[j]);
                        }
                    }
                    if (e != 0.0) {
                        copiedSerie[i] = val / e;
                    } else {
                        copiedSerie[i] = 0.0;
                    }
                    refYear++;
                }

                copied["serie"] = copiedSerie;
                newSeries[iS] = copied;
                updatedVariable = copied;
            }
        }

        calculerHypothese(updatedVariable, newSeries);
    }

    const pondContent = pond.map((val, idx) => {
        return (
            <Grid.Row key={idx}>
                <Grid.Column width={6}><label>p{idx+1}:</label></Grid.Column>
                <Grid.Column width={6}><Input type='number' name='a' value={val} onChange={(event, data) => {
                    if (!isNaN(data.value)) {
                        const copiedPond = [...pond];
                        copiedPond[idx] = parseFloat(data.value);
                        setPond(copiedPond);
                    }
                }} /></Grid.Column>
            </Grid.Row>
        )
    });

    const changePond = (isAdd) => {
        const copiedPond = [...pond];
        if (isAdd) {
            copiedPond.push(0);
        } else copiedPond.pop();

        setPond(copiedPond);
    }
    return (
        <div>
            <u>Moyenne glissante pondérée</u>
            <Grid>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Décalage:</label></Grid.Column>
                    <Grid.Column width={6}><Input type='number' min={0} value={decalage} onChange={handleDecal} /></Grid.Column>
                </Grid.Row>
                {/* <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Première année de constat:</label></Grid.Column>
                    <Grid.Column width={6}><Input value={internalFirstYearConstat} type='number' min={years[0]} max={yearConstat} onChange={(event, data) => { setInternalFirstYearConstat(data.value) }} /></Grid.Column>
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
                    <Grid.Column width={6}><label>Nombre de pondération</label></Grid.Column>
                    <Grid.Column width={6}><Input disabled value={internalEndYearConstat - internalFirstYearConstat + 1} type='number' /></Grid.Column>
                </Grid.Row>
                {/* <Grid.Row>
                    <Grid.Column width={6}>Pondération:</Grid.Column>
                </Grid.Row> */}
                <Grid.Row>
                    <Grid.Column width={16}>
                        <div><label>Pondération</label></div>
                        <Grid style={{ maxHeight: "200px", overflowY: "scroll" }}>
                            {pondContent}
                        </Grid>

                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><Button inverted color='green' onClick={() => changePond(true)}>+ Ajouter"a"</Button></Grid.Column>
                    <Grid.Column width={6}><Button inverted color='red' onClick={() => changePond(false)}>- Effacer"a"</Button></Grid.Column>
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
export default MoyenneGlissantePondere