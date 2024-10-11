import React, { useState } from 'react';
import { Button, Grid, Input } from 'semantic-ui-react';
import Utils from '../../services/utils';

function ModelePolynomial(props) {

    const { series, yearConstat, years, calculerHypothese, selectedVariable, atypicalYears, informationError} = props;
    let [decalage, setDecalage] = useState(0)
    let [internalFirstYearConstat, setInternalFirstYearConstat] = useState(years[0]);
    let [internalEndYearConstat, setInternalEndYearConstat] = useState(yearConstat);
    const [a, setA] = useState([]);
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
        if(util.isValidNumber(lastYearPrevision) == false || util.isValidNumber(internalFirstYearConstat) == false|| util.isValidNumber(internalEndYearConstat) == false) {
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
        
        // console.log(decalage)
        // console.log(internalFirstYearConstat)
        // console.log(internalEndYearConstat)
        // console.log(lastYearPrevision)
        // console.log(a)

        for (let iS = 0; iS < newSeries.length; iS++) {

            if (newSeries[iS].Name === selectedVariable.Name) {
                const copied = {...newSeries[iS]};
                const copiedSerie = [...copied["serie"]];

                const idxEndYearCt = years.indexOf(internalEndYearConstat);
                const idxLastYearPrev = years.indexOf(lastYearPrevision);

                let r2 = 0.0;
                const first_year = years[0];

                for(let i = 0; i <= idxEndYearCt; i++) {
                    const isAtypic = atypicalYears.indexOf(years[i]);
                    if(isAtypic === -1) {
                        let val = 0.0;
                        const realYear = years[i];
                        for(let j = 0; j < a.length; j++) {
                            val += a[j] * Math.pow(realYear, j);
                        } 
                        r2 += Math.pow(copiedSerie[i] - val, 2);
                    }
                }

                for(let i = idxEndYearCt + 1; i <= idxLastYearPrev; i++) {
                    let val = 0.0;
                    for(let j = 0; j < a.length; j++) {
                        val += a[j] * Math.pow(i + first_year, j);
                    }
                    copiedSerie[i] = val;
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

    const aContent = a.map((val, idx) => {
        return (
            <Grid.Row key={idx}>
                <Grid.Column width={6}><label>a{idx}:</label></Grid.Column>
                <Grid.Column width={6}><Input type='number' name='a' value={val} onChange={(event, data) => { 
                    const copiedA = [...a];
                    copiedA[idx] = parseFloat(data.value);
                    setA(copiedA);

                 }} /></Grid.Column>
            </Grid.Row>
        )
    });

    const changeA = (isAdd) => {
        const copiedA = [...a];
        if(isAdd) {
            copiedA.push(0);
        } else copiedA.pop();
       
        setA(copiedA)
    }

    return (
        <div>
            <u>Modèle polynomial</u>
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
                <label><b>Y=a<sub>0</sub>+a<sub>1</sub>X+a<sub>2</sub>X<sup>2</sup>+...+a<sub>n</sub>X<sup>n</sup></b></label>
                <Grid.Row>
                    <Grid.Column width={16}><label><b>Valeur des a[n] : (Degré n=0)</b></label>
                    <Grid style={{maxHeight: "200px", overflowY: "scroll"}}>
                        {aContent}
                    </Grid>
                    
                    </Grid.Column>
                </Grid.Row>
                
                <Grid.Row>
                    <Grid.Column width={6}><Button inverted color='green' onClick={() => changeA(true)}>+ Ajouter"a"</Button></Grid.Column>
                    <Grid.Column width={6}><Button inverted color='red' onClick={() => changeA(false)}>- Effacer"a"</Button></Grid.Column>
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
export default ModelePolynomial