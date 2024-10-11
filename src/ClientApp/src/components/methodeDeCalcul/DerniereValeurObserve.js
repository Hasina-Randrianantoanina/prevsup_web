import React, { useState } from 'react';
import { Button, Grid, Input} from 'semantic-ui-react'
import Utils from '../../services/utils';

function DerniereValeurObserve(props) {

    const {series, yearConstat, years, calculerHypothese, selectedVariable, informationError, atypicalYears} = props;
    let [decalage, setDecalage]=useState(0);
    let [internalYearConstat, setInternalYearConstat] = useState(yearConstat);
    let [lastYearPrevision, setLastYearPrevision] = useState(years[years.length-1]);
    const maxYear = years.length > 0 ? years[years.length - 1]: parseInt(yearConstat);
    

    const calculer = () => {
        const util = new Utils();
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalYearConstat) == false) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        internalYearConstat = parseFloat(internalYearConstat);
        
        lastYearPrevision = parseFloat(lastYearPrevision);
        if(internalYearConstat>=lastYearPrevision){
            informationError("Veuillez vérifier le nombre de décalage.");
            return;
        }
        if(util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if(selectedVariable.type !== "Data" && selectedVariable.child!==0) return;
        
        const newSeries = [...series];
        let updatedVariable = {};
        for(let iS = 0; iS < newSeries.length; iS++) {
            
            if(newSeries[iS].Name === selectedVariable.Name) {
                const copied = {...newSeries[iS]};

                // INFO: We get the values of the AtypicalYears that are showed on left of dualbox and get the maximum of those values if any
                
                const allIncludedYears = util.minus(years, atypicalYears, yearConstat);
                const allYearsConstats =years.filter(x=> x<=yearConstat)
                if(allIncludedYears.length > 0 && allIncludedYears.length < allYearsConstats.length) internalYearConstat = Math.max(...allIncludedYears);
                let idxYearCt = years.indexOf(internalYearConstat);
                
                const lastIdx = idxYearCt + (lastYearPrevision - internalYearConstat + 1);
                if(idxYearCt > -1 && lastIdx) {
                    const serieCopied = [...copied["serie"]];
                    for(let i = Math.max(idxYearCt + 1, years.indexOf(yearConstat) + 1); i < lastIdx; i++) {
                        serieCopied[i] = serieCopied[idxYearCt];
                        
                    }
                    copied["serie"] = serieCopied;
                    newSeries[iS] = copied;
                }
                updatedVariable = copied;
                break;
            }
            
        }

        calculerHypothese(updatedVariable,newSeries);
    }

    const handleDecal = (event) => {
        setInternalYearConstat(yearConstat + parseInt(event.target.value));
    }

    const handlePrevisionYear=(event) => {
        setLastYearPrevision(event.target.value);
    }

    return(
        <div>
            <u>Dernière valeur observée</u>
            <Grid>
                <Grid.Row>
                    <Grid.Column width={6}><label>Décalage:</label></Grid.Column>
                    <Grid.Column width={10}><Input min={0} onChange={handleDecal} size='mini' type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>Dernière année de constat:</label></Grid.Column>
                    <Grid.Column width={10}><Input readOnly disabled value={internalYearConstat} size='mini' type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>Dernière année de prévision:</label></Grid.Column>
                    <Grid.Column width={10}><Input min={yearConstat+1} onChange={handlePrevisionYear} defaultValue={lastYearPrevision} max={maxYear} size='mini' type='number' /></Grid.Column>
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
export default DerniereValeurObserve