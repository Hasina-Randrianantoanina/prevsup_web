import React, { useState } from 'react';
import { forwardRef } from 'react';
import { Button, Grid, Checkbox, Input} from 'semantic-ui-react'
import Utils from '../../services/utils';

const RegressionLineaireParametree = forwardRef((props, ref) => {

    const {series, yearConstat, years, calculerHypothese, selectedVariable, atypicalYears, informationError} = props;
    let [decalage, setDecalage]=useState(0)
    let [internalFirstYearConstat, setInternalFirstYearConstat] = useState(years[0]);
    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    const [typeCalc, setTypeCalc]=useState('classique')
    let [coeff, setCoeff]=useState(0);
    let [lastYearPrevision, setLastYearPrevision] = useState(years[years.length-1]);

    
    const maxYear = years.length > 0 ? years[years.length - 1]: yearConstat;
    const handleDecal = (event) => {
        setInternalEndYearConstat(parseInt(yearConstat) + parseInt(event.target.value));
        setDecalage(event.target.value);
    }
    const handlePrevisionYear=(event) => {
        setLastYearPrevision(event.target.value);
    }

    const computeRegLinP = (serie) => {
        const idxFirstYearCt = years.indexOf(internalFirstYearConstat);
        const idxEndYearCt = years.indexOf(internalEndYearConstat);
        let val = 0.0;
        
        let count = idxEndYearCt - idxFirstYearCt + 1;
        for(let i = idxFirstYearCt; i <= idxEndYearCt; i++) {
            const isAtypic = atypicalYears.indexOf(years[i]);
            if(isAtypic === -1) {
                val += serie[i];
            } else count --;
            
        }

        return val / count;
    }

    const computeRegLinX = (serie) => {
        const idxFirstYearCt = years.indexOf(internalFirstYearConstat);
        const idxEndYearCt = years.indexOf(internalEndYearConstat);
        
        let val = 0.0;
        let count = idxEndYearCt - idxFirstYearCt + 1;
        for(let i = idxFirstYearCt; i <= idxEndYearCt; i++) {
            const isAtypic = atypicalYears.indexOf(years[i]);
            if(isAtypic === -1)
            val += years[i];
            else count --;
        }

        return val / count;
    }
    
    const computeRegLinA = (serie, p, x) => {
        const idxFirstYearCt = years.indexOf(internalFirstYearConstat);
        const idxEndYearCt = years.indexOf(internalEndYearConstat);

        let num = 0.0;
        let div = 0.0;

        for(let i = idxFirstYearCt; i <= idxEndYearCt; i++) {
            let realYear = years[i];
            const isAtypic = atypicalYears.indexOf(years[i]);
            if(isAtypic === -1) {
                num = num + ((years[i] - x) * (serie[i] - p));
                div = div + ((years[i] - x) * (years[i] - x));
            }

        }

        return num / div;
    }

    const computeRegLinB = (p, a, x) => {
        return (p - (a *x));
    }

    const calculer=()=>{
        const util = new Utils();
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalFirstYearConstat) == false|| util.isValidNumber(internalEndYearConstat) == false
        || (util.isValidNumber(coeff) == false && typeCalc === "dernierValue")) {
            informationError("Entrez des valeurs correctes");
            return;
        }
        if(util.isEmpty(selectedVariable)) {
            informationError("Aucune variable sélectionnée.");
        }
        if (selectedVariable.type !== "Data" && selectedVariable.child!==0) return;

        decalage = parseFloat(decalage);
        internalFirstYearConstat = parseFloat(internalFirstYearConstat);
        internalEndYearConstat = parseFloat(internalEndYearConstat);
        lastYearPrevision = parseFloat(lastYearPrevision);
        coeff = parseFloat(coeff);

        // console.log(decalage)
        // console.log(internalFirstYearConstat)
        // console.log(internalEndYearConstat)
        // console.log(lastYearPrevision)
        // console.log(typeCalc)
        // console.log(coeff)

        const newSeries = [...series];
        let updatedVariable = {};

        if(typeCalc === "classique") {
            for(let iS = 0; iS < series.length; iS++ ) {
                if(newSeries[iS].Name === selectedVariable.Name) {
                    const copied = {...newSeries[iS]};
                    const copiedSerie = [...copied["serie"]];

                    const idxEndYearCt = years.indexOf(internalEndYearConstat);
                    const idxLastYearPrev = years.indexOf(parseInt(lastYearPrevision));
            
                    const coeff = 1; // INFO: Fonction semble fausse pour un coeff != 1
                    let sum = 0.0;
                    let moy = 0.0;
                    let sum2 = 0.0;
                    let r2 = 0.0;
                    let p = computeRegLinP(copiedSerie);
                    let x = computeRegLinX(copiedSerie);
                    let a = computeRegLinA(copiedSerie, p, x);
                    let b = computeRegLinB(p, a, x);

                    // console.table([p, x, a, b])

                    // INFO: Calcul moyenne
                    for(let i = 0; i < copiedSerie.length; i++) {
                        sum += copiedSerie[i];
                    }
                    moy = sum / copiedSerie.length;

                    // INFO - Somme des différences aux carrés
                    for(let i = 0; i < copiedSerie.length; i++) {
                        sum2 += Math.pow(copiedSerie[i] - moy, 2);
                    }
    
                    // INFO: We calculate the r2
                    for(let i = 0; i < idxEndYearCt; i++ ) {
                        const isAtypic = atypicalYears.indexOf(years[i]);
                        if(isAtypic === -1) {
                            let prevu = b + (coeff * a * years[i]);
                            r2 += Math.pow(prevu - copiedSerie[i], 2);
                        }
                    }

                    // INFO:
                    for(let i = idxEndYearCt + 1; i <= idxLastYearPrev; i++) {
                        copiedSerie[i] = b + (coeff * a * years[i]);
                    }

                    // console.log(` r2 / sum2 = ${r2 / sum2}`); // TODO: Should display this in a messagebox ?

                    // INFO: Update
                    copied["serie"] = copiedSerie;
                    updatedVariable = copied;                    
                    newSeries[iS] = updatedVariable;
                    break;
                }
            }
        } else if (typeCalc === "dernierValue") {
            for(let iS = 0; iS < series.length; iS++ ) {
                if(newSeries[iS].Name === selectedVariable.Name) {
                    const copied = {...newSeries[iS]};
                    const copiedSerie = [...copied["serie"]];

                    const idxEndYearCt = years.indexOf(internalEndYearConstat);
                    const idxLastYearPrev = years.indexOf(parseInt(lastYearPrevision));
            
                    // const coeff = 1; // INFO: Fonction semble fausse pour un coeff != 1
                    let sum = 0.0;
                    let moy = 0.0;
                    let sum2 = 0.0;
                    let r2 = 0.0;
                    let p = computeRegLinP(copiedSerie);
                    let x = computeRegLinX(copiedSerie);
                    let a = computeRegLinA(copiedSerie, p, x);

                    for(let i = Math.max(1, idxEndYearCt + 1); i < copiedSerie.length; i++) {
                        copiedSerie[i] = copiedSerie[i-1] + (coeff * a);
                    }

                    let j = 1;
                    for(let i = idxEndYearCt - 2; i >= 0; i--) {
                        const isAtypic = atypicalYears.indexOf(years[i]);
                        if(isAtypic === -1) {
                            let tmp = copiedSerie[i];
                            let prevu = copiedSerie[idxEndYearCt-1] - j * coeff * a;
                            r2 += Math.pow(prevu-tmp, 2);
                            j++;
                        }
                    }

                    // console.log(` r2 = ${r2`); // TODO: Should display this in a messagebox ?

                    // INFO: Update
                    copied["serie"] = copiedSerie;
                    updatedVariable = copied;                    
                    newSeries[iS] = updatedVariable;
                    break;
                }
            }
        }

        calculerHypothese(updatedVariable, newSeries);
    }

    const inputProp = {};
    if(typeCalc === "classique") {
        inputProp.disabled = true;
    }
    return(
        <div>
            <u>Régression linéaire paramétrée</u>
            <Grid>
            <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Décalage:</label></Grid.Column>
                    <Grid.Column width={6}><Input type='number' min={0} value={decalage} onChange={handleDecal} /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Première année de constat:</label></Grid.Column>
                    <Grid.Column width={6}><Input value={internalFirstYearConstat} type='number' min={years[0]} max={yearConstat} onChange={(event,data)=>{setInternalFirstYearConstat(data.value)}} /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Dernière année de constat:</label></Grid.Column>
                    <Grid.Column width={6}><Input readOnly disabled value={internalEndYearConstat} type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                    <Grid.Column width={6}><label>Dernière année de prévision:</label></Grid.Column>
                    <Grid.Column width={6}><Input min={yearConstat + 1} onChange={handlePrevisionYear} defaultValue={lastYearPrevision} max={maxYear} type='number' /></Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={16}>
                        <Checkbox radio label="Classique: y= ax + b" name='checkboxRadioGroup' value={'classique'} checked={typeCalc === 'classique'} onChange={(event,data)=>{setTypeCalc(data.value)}}   />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Checkbox radio label="Dérnière valeur + coeff*a" name='checkboxRadioGroup' value={'dernierValue'} checked={typeCalc === 'dernierValue'} onChange={(event,data)=>{setTypeCalc(data.value)}} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={6}><label>Coefficient pente ([0,1]):</label></Grid.Column>
                    <Grid.Column width={10}><Input {...inputProp} type='number'  name={'coeff pente'} onChange={(event,data)=>{setCoeff(data.value)}} /></Grid.Column>
                
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

export default RegressionLineaireParametree