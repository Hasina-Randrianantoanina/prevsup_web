import React, { useState } from 'react';
import { useImperativeHandle } from 'react';
import { forwardRef } from 'react';
import { Dropdown, Button, Grid, Input } from 'semantic-ui-react'
import Utils from '../../services/utils';

const MoyenneArithmetique = forwardRef((props, ref) => {
    const { series, yearConstat, years, calculerHypothese, selectedVariable, firstYearConstat, atypicalYears, informationError} = props;

    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    let [internalFirstYearConstat, setInternalFirstYearConstat] = useState(firstYearConstat);
    let [decalage, setDecalage] = useState(0);
    let [lastYearPrevision, setLastYearPrevision] = useState(years[years.length - 1]);
    const maxYear = years.length > 0 ? years[years.length - 1] : yearConstat;

    const handleDecal = (event) => {
        // console.log(yearConstat + parseInt(event.target.value))
        setInternalEndYearConstat(yearConstat + parseInt(event.target.value));
    }

    const handleFirst = (event) => {
        setInternalFirstYearConstat(parseInt(event.target.value))
    }

    const handlePrevisionYear = (event) => {
        setLastYearPrevision(event.target.value);
    }

    const calculer = () => {
        const util = new Utils();
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalFirstYearConstat) == false|| util.isValidNumber(internalEndYearConstat) == false) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        if(util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if (selectedVariable.type !== "Data" && selectedVariable.child!==0) return;

        internalEndYearConstat = parseFloat(internalEndYearConstat);
        internalFirstYearConstat = parseFloat(internalFirstYearConstat);
        decalage = parseFloat(decalage);
        lastYearPrevision = parseFloat(lastYearPrevision);

        const newSeries = [...series];
        let updatedVariable = {};
        for (let iS = 0; iS < newSeries.length; iS++) {
            if (newSeries[iS].Name === selectedVariable.Name) {
                const copied = { ...newSeries[iS] };

                const idxEndYearCt = years.indexOf(internalEndYearConstat);
                const idxFirstYearCt = years.indexOf(internalFirstYearConstat);
                const idxYearPrev = years.indexOf(parseInt(lastYearPrevision));

                // INFO: Calcul moyenne
                let sum = 0;
                let count = idxEndYearCt - idxFirstYearCt + 1;
                for (let i = idxFirstYearCt; i <= idxEndYearCt; i++) {
                    const isAtypic = atypicalYears.indexOf(years[i]);
                    if(isAtypic === -1)
                        sum += copied["serie"][i];
                }
                const mean = sum / count;
                if(isNaN(mean)){
                    newSeries[iS]=newSeries[iS];
                    updatedVariable=copied;
                }else{
                    // INFO: Transferer valeur
                    copied["serie"] = copyValues(mean, idxEndYearCt, idxYearPrev, copied["serie"]);
                    newSeries[iS] = copied;
                    updatedVariable = copied;
                    break;
                }
                
            }
        }
        

        calculerHypothese(updatedVariable, newSeries);
    }

    const copyValues = (valueToCopy, idxEndYearCt, idxYearPrev, series) => {
        const result = [...series];
        for (let i = idxEndYearCt + 1; i <= idxYearPrev; i++) {
            result[i] = valueToCopy;
        }
        return result;
    }

    return (
        <div>
            <u>Moyenne arithmétique</u>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={6}><label>Décalage:</label></Grid.Column>
                    <Grid.Column width={10}><Input min={0} onChange={handleDecal} size='mini' type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>Première année de constat:</label></Grid.Column>
                    <Grid.Column width={10}><Input onChange={handleFirst} defaultValue={internalFirstYearConstat} min={firstYearConstat} max={yearConstat} size='mini' type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>Dernière année de constat:</label></Grid.Column>
                    <Grid.Column width={10}><Input readOnly disabled value={internalEndYearConstat} size='mini' type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>Dernière année de prévision:</label></Grid.Column>
                    <Grid.Column width={10}><Input min={yearConstat + 1} onChange={handlePrevisionYear} defaultValue={lastYearPrevision} max={maxYear} size='mini' type='number' /></Grid.Column>
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
export default MoyenneArithmetique;