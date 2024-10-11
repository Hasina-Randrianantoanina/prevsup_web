import React, { useRef, useState } from 'react';
import { useImperativeHandle } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { forwardRef } from "react";
import { Button, Card, Grid } from 'semantic-ui-react';
import serverIP from '../Function/ServerInfo';
import LineChart from './LineChart';
// import HTMLReactParser from 'html-react-parser';
import imageLogo from '../../img/logoExport.jpg';
import { appVersion } from '../Function/ServerInfo';

const ChartPrev = forwardRef((props, ref) => {

    const { checkedVariables, id, labels, type, scenarioName, degre, name, clearCheckedVariables,parentRef , getGraphExportOption} = props;
    const [internalCheckedVariables, setInternalCheckedVariables] = useState(checkedVariables ? checkedVariables : []);
    const [internalAides, setInternalAides] = useState([]);
    const users = useSelector(state=>state.users);
    const refChart = useRef(null);
    useImperativeHandle(ref, () => ({
        updateCheckedVariables(newlyChecked) {
            const copied = [...newlyChecked];
            for (let i = 0; i < copied.length; i++) {
                if (copied[i].display === "Percent") {
                    const cp = { ...copied[i] }
                    const serieCopied = [...cp["serie"]]
                    for (let iS = 0; iS < serieCopied.length; iS++) {
                        serieCopied[iS] = serieCopied[iS] * 100;
                    }
                    cp["serie"] = serieCopied;
                    copied[i] = cp;
                    // console.log(cp);
                }
            }
            setInternalCheckedVariables(copied)
        }
    }));
    
    const dataChart = [];
    let label = "", txtAide = "", txtFiliere = "", txtFormule = "",realName="", textDefinitionFromXML = "", textFormuleFromXML = "", textLinkFromXML = "", textVariableFromXML = "", row={};
    if (internalCheckedVariables.length > 0 && type !== "recap") {
        
        const currentChecked = internalCheckedVariables[internalCheckedVariables.length - 1];
        realName = currentChecked.RealName;
        label = currentChecked.Name;
        txtAide = currentChecked.txtAide;
        txtFiliere = currentChecked.txtFiliere;
        txtFormule = currentChecked.txtFormule;
        textDefinitionFromXML= currentChecked.textDefinitionFromXML;
        textFormuleFromXML= currentChecked.textFormuleFromXML;
        textLinkFromXML= currentChecked.textLinkFromXML;
        textVariableFromXML= currentChecked.textVariableFromXML;
        row=currentChecked.row;
        
        
    }
    let titleVariable="",titleLinkVariable="";
    if(degre!=="Academie") {
        let splitRealName= realName.split('_');
        splitRealName.pop();
        titleVariable=splitRealName.join('_')
        
        if(row.Level>0){
            let splitParent = row.Parent? row.Parent.split('_'): [] ; 
            splitParent.pop();
            realName=splitParent.join('_')
            
        }
        
    }
    else{
        let splitRealName= row.Parent? row.Parent.split('_'): [] ;
        splitRealName.pop();
        row.Level>0? titleVariable=splitRealName.join('_') : titleVariable=realName;
        
        realName=titleVariable
    }
    
    
    

    // INFO: Get link code branch import
    // let regexLink = /"(.*)"/i;
	// let regexResult = textLinkFromXML ? textLinkFromXML.match(regexLink): [];
    // let link = regexResult.length > 1 ? regexResult[1]: realName +" _IJ.html";
    
    if (internalCheckedVariables.length > 0) {
        internalCheckedVariables.forEach(checked => {
            const label = checked.RealName ? checked.RealName : checked.Name;
            dataChart.push({
                label: label,
                data: checked.serie
            })
        });
    }
    useEffect(() => {
        fetch(`${serverIP}/Main/GetAides`, {method: 'post'}).then(resp => resp.json()).then(data => {
            setInternalAides(JSON.parse(data)); // TODO: Sometimes there exist file but only J not for IJ
        });
    }, []);
    let filiere1="";
    let filiere2="";
    let indice="";
    // type!=="recap" && type!=="constat" ? indice="J": indice="I";
    let extensionLinkIJ=degre!=="Academie"? "_IJ.html": ".html"
    let extensionLinkJ=degre!=="Academie"? "_J.html": ".html"
   
    //check if txtFiliere have less than 3 elements split by +
    let newTxtFiliere = txtFiliere.split('+').length<3 ? txtFiliere+txtFiliere : txtFiliere;
    txtFiliere=newTxtFiliere;
    // console.log(txtFiliere)

    const exportGraph = () => {
        
        if(refChart && refChart.current) {
            const today = new Date();
            const hour = today.toLocaleString("default", { hour: "2-digit" }).replace(" ", "_");
            const todayStr = `${today.getFullYear()}_${today.toLocaleString("default", { month: "2-digit" })}_${today.toLocaleString("default", { day: "2-digit" })}_${hour}_${today.toLocaleString("default", { minute: "2-digit" })}`;
            const capType = type.charAt(0).toUpperCase() + type.slice(1);
            if(users.isExportOptionComplete===true){
                //data to use
                
                const frenchDate = today.toLocaleDateString('fr-FR');
                const login = JSON.parse(sessionStorage.getItem("user")).login;

                // Export the chart as an image
                const canvas1 = refChart.current.toBase64Image();
                const img = new Image();
                const img2 = new Image();
                if (capType==="Scenario"){
                    img.width=1122;
                    img.height=561;
                }
            
                img.onload = function() {
                    // Create a new canvas and draw the image and date into it
                    const canvas2 = document.createElement('canvas');
                    canvas2.width = img.width;
                    canvas2.height = img.height + 20;
                    const ctx = canvas2.getContext('2d');
                    ctx.fillStyle = "white";
                    ctx.fillRect(0,0,canvas2.width,canvas2.height);
                    ctx.drawImage(img, 175, 110,img.width*0.75, img.height*0.75);
                    ctx.drawImage(img2, 75, 0,img2.width*0.75, img2.height*0.75);
            
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(login, 110, img.height + 10);
                    ctx.fillText(name, img.width / 2-20, img.height + 10);
                    ctx.fillText(`PREVSUP Web ${appVersion}`, img.width/2-30, 40);
                    ctx.fillText(frenchDate, img.width-200, 40);            

                    // Export the canvas as an image and initiate a download
                    const dataUrl = canvas2.toDataURL('image/png');
                    const link = document.createElement('a');
            
                    link.download = `${capType}_${name}_graphe_${todayStr}.jpg`;
                    link.href = dataUrl;
                    link.click();
                };
                img.src = canvas1;
                img2.src = imageLogo;
            
            }else{
                
                const img = new Image();
                img.onload = function() {
                    // Create a new canvas and draw the image and date into it
                    const canvas2 = document.createElement('canvas');
                    canvas2.width = img.width;
                    canvas2.height = img.height + 20;
                    const ctx = canvas2.getContext('2d');
                    ctx.fillStyle = "white";
                    ctx.fillRect(0,0,canvas2.width,canvas2.height);
                    ctx.drawImage(img, 0,0);
            
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';         

                    // Export the canvas as an image and initiate a download
                    const dataUrl = canvas2.toDataURL('image/png');
                    const link = document.createElement('a');
            
                    link.download = `${capType}_${name}_graphe_${todayStr}.jpg`;
                    link.href = dataUrl;
                    link.click();
                }
                img.src = refChart.current.toBase64Image();

            }
            
        }
    }
    

    const emptyGraph = () => {
        internalCheckedVariables.forEach(variable => {
            parentRef.current.querySelector(`tr[id='${variable.Name}'] .checkbox input`).click();
        })
        setInternalCheckedVariables([]);
        clearCheckedVariables();
    }

    
    
    
    return (
        <div style={{ marginTop: '7px', minHeight: "466px" }}>
            <Grid columns={3} divided>
                <Grid.Row columns={2}>
                    {type === "recap" ? (
                        <Grid.Column width={4}>
                            <h4>Scénario parent: {scenarioName}</h4>
                        </Grid.Column>
                    ) : (
                        <Grid.Column width={4}>
                            <h4>Propriétés</h4>
                            {/* {txtAide !== "" ? (<div style={{ marginBottom: "10px" }}><b>{txtAide.split(':')[0]}</b> : {txtAide.split(':')[1]}</div>) : (<div style={{ marginBottom: "10px" }}></div>)}
                            {txtFiliere !== "" ? (<div style={{ marginBottom: "10px" }}><b></b></div>) : (<div style={{ marginBottom: "10px" }}></div>)}
                            {txtFiliere !== "" ? (<div style={{ marginBottom: "10px" }}>{txtFiliere.split('+')[1]}</div>) : (<div style={{ marginBottom: "10px" }}></div>)}

                            {txtFormule !== "" ? (<div style={{ marginBottom: "10px" }}>{txtFormule.split(':')[1]}</div>) : (<div style={{ marginBottom: "10px" }}></div>)} */}
                            
                            {textDefinitionFromXML !=="" ? (<div style={{ marginBottom: "10px" }}><b>{titleVariable}</b> : {textDefinitionFromXML}</div>): (<div style={{ marginBottom: "10px" }}></div>)}
                            {degre==="Academie" ?
                                (<div></div>) 
                                : textVariableFromXML!=="empty" && txtFiliere !=="" ? 
                                    label.includes(',') || label.includes("_I_") ? 
                                        (<div style={{ marginBottom: "10px" }}>{txtFiliere.startsWith('D')? (<b></b>) : (<b>I</b>) }<b>{label.includes('_JI')?
                                            label.split(',')[1]
                                        :label.split(',')[0].split('_')[label.split(',')[0].split('_').length-1]}</b> 
                                    : {txtFiliere.split('+')[0].split(':')[txtFiliere.split('+')[0].split(':').length-1]}</div>)
                                : (<div style={{ marginBottom: "10px" }}><b>I1:9</b> : Ensemble </div>) 
                            :(<div style={{ marginBottom: "10px" }}></div>)}

                            
                            {label.includes("_I_") ? (<div></div>) : degre==="Academie" && textVariableFromXML!=="empty" && txtFiliere !==""?
                                (<div style={{ marginBottom: "10px" }}><b>{txtFiliere.split('+')[0]} :</b>{txtFiliere.split('+')[txtFiliere.split('+').length-1]}</div>) 
                            : textVariableFromXML!=="empty" && txtFiliere !=="" ? 
                                label.includes(',') ? 
                                    (<div style={{ marginBottom: "10px" }}><b>J{label.includes('_JI')? 
                                    <b>{label.split(',')[0].split('_')[label.split(',')[0].split('_').length-1]}</b> 
                                    :label.split(',')[1]}</b> : {txtFiliere.split('+')[txtFiliere.split('+').length-1] !==""? 
                                    txtFiliere.split('+')[txtFiliere.split('+').length-1].split(':')[txtFiliere.split('+')[txtFiliere.split('+').length-1].split(':').length-1]
                                    : txtFiliere.split('+')[1].split(':')[1]}</div>)
                                : txtFiliere.split("+")[1]===""? 
                                    (<div><b>{txtFiliere.split('+')[0].split(':')[0]} 
                                    : </b>{ txtFiliere.split('+')[0].split(':')[1]}</div>): degre==="Diplome" && !txtFiliere.startsWith("I1:9")?
                                        (<div><b>{txtFiliere.split('+')[0].split(':')[0]} :</b>{txtFiliere.split('+')[0].split(':')[1]}</div>)
                                    :(<div><b>J900 :</b> Ensemble</div>) 
                            :(<div style={{ marginBottom: "10px" }}></div>)}
                            
                            {textFormuleFromXML !=="" ? (<div style={{ marginBottom: "10px" }}>{textFormuleFromXML}</div>): (<div style={{ marginBottom: "10px" }}></div>)}
                            {/* {textLinkFromXML !=="" ? (<div style={{ marginBottom: "10px" }}>{HTMLReactParser(textLinkFromXML)}</div>): (<div style={{ marginBottom: "10px" }}></div>)} */}
                            {internalAides.find(x => x == (titleVariable + extensionLinkIJ ) || x ==( titleVariable+ extensionLinkJ)) ? (<a href={`/Aide/${realName}.html`}><u>Aide HTML sur la variable {realName}</u></a>) : (<div style={{ marginBottom: "10px" }}></div>)}
                           
                        </Grid.Column>
                    )}

                    <Grid.Column width={10}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <h4>Graphe</h4>
                            <div>
                                <Button icon='file image' onClick={exportGraph} primary title="Exporter graphe" size="tiny" />
                                <Button icon='trash' onClick={emptyGraph} primary title="Réinitialiser graphe" size="tiny" />
                            </div>
                        </div>
                        
                        {internalCheckedVariables.length > 0 ? (<LineChart
                            reference={refChart}
                            key={id}
                            labels={labels} data={dataChart} />) : (<div></div>)}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
});

export default ChartPrev;