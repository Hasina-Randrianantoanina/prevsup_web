import './ScenarioPane.css'
import React, { Component } from 'react';
import TablePrev from '../../components/TablePrev/TablePrev';
import { deleteScenario, openScenarioVariableWithChildren, enregistrerScenario, openScenarioVariable, changeDegre, reconduireVariable, reconduireVariables, openScenarioVariableWithChildrenMultiple, calculContexte, exportScenario, calculMereScenario, fetchScenario, downloadFile, informationError, calculateAll } from '../../actions';

import { connect } from 'react-redux';
import { Button, Card, Checkbox, Divider, Form, Grid,Confirm } from 'semantic-ui-react';
import ExportModal from '../../components/Export/ExportModal';

// import AccordionExampleMenu from '../AccordionExampleMenu';
import 'react-dual-listbox/lib/react-dual-listbox.css';

import { saveAs } from 'file-saver';

import CustomFiltreScenario from '../../components/Scenario/CustomFiltreScenario';

import AidePrevision from './AidePrevision';
import ChartPrev from '../../components/Chart/ChartPrev';
import Utils from '../../services/utils';



class ScenarioPane extends Component {

    filteredVariables = [{ idVariable: "Tous", degree: "Entrant" }, { idVariable: "Tous", degree: 1 }, { idVariable: "Tous", degree: 2 }, { idVariable: "Tous", degree: 3 }, { idVariable: "Tous", degree: 4 }, { idVariable: "Tous", degree: 5 }, { idVariable: "Tous", degree: 6 }, { idVariable: "Tous", degree: "Diplome" }, { idVariable: "Tous", degree: "Academie" }];

    constructor(props) {
        super(props);
        const { scenario, variables, filieres, hypoVariables, resVariables } = this.props;
        let openVariables = this.getDefaultOpenVars();

        let filteredHypoVariables = JSON.parse(JSON.stringify(this.filteredVariables));
        let filteredResVariables = JSON.parse(JSON.stringify(this.filteredVariables));
        let filteredFilieres = [{ idFiliere: "J900", degree: "Entrant" }, { idFiliere: "J900", degree: 1 }, { idFiliere: "J900", degree: 2 }, { idFiliere: "J900", degree: 3 }, { idFiliere: "J900", degree: 4 }, { idFiliere: "J900", degree: 5 }, { idFiliere: "J900", degree: 6 }, { idFiliere: "J900", degree: "Diplome" }, { idFiliere: "J900", degree: "Academie" }];
        let checkedVariables = [];
        let seriesHypo = scenario.seriesHypo;
        let seriesRes = scenario.seriesRes;
        let expandedVariables = [];
        const getFilieres = [];
        Object.values(filieres).forEach(filiere => { getFilieres.push({ key: filiere.id, text: "(" + filiere.nom + ")" + " " + filiere.description, value: filiere.indice, level: filiere.Level }) })
        let foundScenario = localStorage.getItem(scenario.id);
        const degre = scenario.currentDegre ? scenario.currentDegre : "Entrant";
        if (foundScenario) {
            foundScenario = JSON.parse(foundScenario);
            openVariables = foundScenario.openVariables;
            filteredHypoVariables = foundScenario.filteredHypoVariables;
            filteredResVariables = foundScenario.filteredResVariables;
            filteredFilieres = foundScenario.filteredFilieres
            // checkedVariables = foundScenario.checkedVariables;
            // expandedVariables = foundScenario.expandedVariables;
            // series = foundScenario.series;
        } else {
            scenario["openVariables"] = openVariables;
            scenario["checkedVariables"] = checkedVariables;
            scenario["expandedVariables"] = expandedVariables;
            scenario["filteredHypoVariables"] = filteredHypoVariables;
            scenario["filteredResVariables"] = filteredResVariables;
            scenario["filteredFilieres"] = filteredFilieres;
            localStorage.setItem(scenario.id, JSON.stringify(scenario));
        }

        const degres = ["Entrant", "Degré 1", "Degré 2", "Degré 3", "Degré 4", "Degré 5", "Degré 6", "Diplômé", "Académie"];

        let idxOrigDegre = 0;

        if (degre === "Diplome") idxOrigDegre = 7;
        else if (degre === "Entrant") idxOrigDegre = 0;
        else if (degre === "Academie") idxOrigDegre = 8;
        else idxOrigDegre = parseInt(degre);

        const authUser = JSON.parse(sessionStorage.getItem("user"));
        // const {scenarios}=this.props
        // const degresModifies=scenarios.degresModifies;
        //     for (let i=0;i<degresModifies;i++){
        //         if(degresModifies[i]===true) this.myRef.current.querySelectorAll(".checkbox-degre label ")[i].style.color="red";
        //         else this.myRef.current.querySelectorAll(".checkbox-degre label ")[i].style.color="black";
        //     }
        this.state = {
            userLogin: authUser.login,
            seriesHypo: seriesHypo,
            seriesRes: seriesRes,
            years: scenario.years,
            name: scenario.name,
            id: scenario.id,
            openVariables: openVariables,
            checkedVariables: checkedVariables,
            expandedVariables: expandedVariables,
            labels: scenario.years,
            isExportOpen: false,
            valueDisplay: "value",
            active1: true,
            active2: false,
            active3: false,
            lastYear: scenario.years[scenario.lastYear],
            firstYear: scenario.years[0],
            currentDegreLabel: this.getTrueDegreLabel(degre),
            currentDegre: this.getTrueDegre(degre),
            degres: degres,
            ignoreScrollEvents: false,
            variables: variables,
            degresModifies:scenario.degresModifies,
            degresModifiesFirst: Array(degres.length).fill(false),
            anneeAtypique: [
                { text: 2010, value: "2010" },
                { text: 2011, value: "2011" },
                { text: 2012, value: "2012" },
                { text: 2013, value: "2013" },
                { text: 2014, value: "2014" },
                { text: 2015, value: "2015" },
                { text: 2016, value: "2016" },
                { text: 2017, value: "2017" },
                { text: 2018, value: "2018" },
                { text: 2019, value: "2019" },
                { text: 2020, value: "2020" }
            ],
            selectedVariable: {},
            optionsFilieres: getFilieres,
            testOptionLevel: [
                { text: 2010, value: "2010" },
                { text: 2010, value: "2010" },
                { text: 2010, value: "2010" }
            ],

            fetchedVariables: new Set([]),
            firstExpandedVariables: new Set([]),
            hypoVariables: hypoVariables,
            resVariables: resVariables,
            idxOrigDegre: idxOrigDegre,
            idxTrueOrigDegre: idxOrigDegre,
            filteredResVariables: filteredResVariables,
            filteredHypoVariables: filteredHypoVariables,
            filteredFilieres: filteredFilieres,
            atypicalYears: [],
            openConfirmModificationContexte:false
        }
        
        this.myRef = React.createRef();
        this.previsionContentRef = React.createRef();
        this.myChartRef = React.createRef();
        this.myHypoTableRef = React.createRef();
        this.myResTableRef = React.createRef();

        this.tableContainerHYpo = null;
        this.tableContainerRes = null;
    }
    updateDegreesModifiedCalculateAll = (tabDegreesModified, ongletActivated) =>{
        this.setState({degresModifies:tabDegreesModified, currentDegreLabel:ongletActivated})
    }

    componentDidMount() {
        this.fetchOpenVariablesAndApplyFilterAndApplyFiliere();

        this.tableContainerHYpo = this.myRef.current.querySelectorAll(".table-container")[0];
        this.tableContainerRes= this.myRef.current.querySelectorAll(".table-container")[1];
    }

    getDefaultOpenVars = () => {
        let openVariables = [{ variables: [], degree: "Entrant" }, { variables: [], degree: 1 }, { variables: [], degree: 2 }, { variables: [], degree: 3 }, { variables: [], degree: 4 }, { variables: [], degree: 5 }, { variables: [], degree: 6 }, { variables: [], degree: "Diplome" }, { variables: [], degree: "Academie" }];
        return openVariables;
    }

    // BEGIN - Fetch variables when changing degre or first showing scenario
    expandAllReturnValues = async (row, idScenaro, degre) => { // TODO: Due to lack of time I proceed with a copy paste
        // INFO: Check if it is expanded
        const idRow = row.Name;

        const openVariablesCopied = [];
        openVariablesCopied.push(row);

        const expandedVariablesCopied = [];
        expandedVariablesCopied.push(row);

        // INFO: Add to the firstExpandedVariables
        const firstExpandedVariablesCopied = new Set([]);
        firstExpandedVariablesCopied.add(row);

        // INFO: We fetch the children of the variable
        const { openScenarioVariableWithChildren } = this.props;
        const result = await openScenarioVariableWithChildren(idRow, idScenaro, degre);

        // INFO: We add to the openvariables and fetchedVariables
        const fetchedVariablesCopied = new Set([]);
        result.data.forEach(res => {
            if (res.child > 0) openVariablesCopied.push(res);
            if (res.child > 0) fetchedVariablesCopied.add(res);
        });
        fetchedVariablesCopied.add(row);

        return {
            openVariables: openVariablesCopied,
            fetchedVariables: Array.from(fetchedVariablesCopied),
            firstExpandedVariables: Array.from(firstExpandedVariablesCopied),
            expandedVariables: expandedVariablesCopied,
            series: result.data
        }
    }

    fetchOpenVariablesAndApplyFilterAndApplyFiliere = async () => {
        this.fetchOpenVariables(() => {
            this.applyFiliereAndFilterWhenChangingDegree();
        });
    }
    
    fetchOpenVariables = async (cb) => {
        let foundScenario = localStorage.getItem(this.state.id);
        if (!foundScenario) return;
        foundScenario = JSON.parse(foundScenario);
        // INFO - We fetch only the openVariables for the current degree
        const promisesHypo = [];
        const promisesRes = [];
        const fetchingHypoVariables = [];
        const fetchingResVariables = [];

        // foundScenario.openVariables = [...new Map(foundScenario.openVariables.map(v => [v.Name, v])).values()];
        let openVariablesScenario = [];
        foundScenario.openVariables.forEach(degreeOpenVars => {
            if(degreeOpenVars.degree == this.state.currentDegre) openVariablesScenario = degreeOpenVars.variables;
        })

        const filiere = foundScenario.filteredFilieres.find(x => x.degree == this.state.currentDegre);
        
        if(filiere.idFiliere === "J900") {
            openVariablesScenario.forEach(variable => {
                if (variable.degree == this.state.currentDegre && variable.Parent === "Hypotheses") {
                    promisesHypo.push(() => this.expandAllReturnValues(variable, this.state.id, this.state.currentDegre));
                    fetchingHypoVariables.push(variable);
                }
                if (variable.degree == this.state.currentDegre && variable.Parent === "Resultats") {
                    promisesRes.push(() => this.expandAllReturnValues(variable, this.state.id, this.state.currentDegre));
                    fetchingResVariables.push(variable);
                }
            });
        } else {
            // TODO: should fetch open variables
            // this.state.seriesHypo.forEach(variable => {
            //     const found = foundScenario.openVariables.find(x => x.Name === variable.Name);
            //     if(found && found.Root === "Hypotheses") {
            //         promisesHypo.push(() => this.expandAllReturnValues(found, this.state.id, this.state.currentDegre));
            //         fetchingHypoVariables.push(found);
            //     }
            // })
            // console.log(promisesHypo);
            // console.log(foundScenario.openVariables);
            // console.log(this.state.seriesHypo)
            // console.log("\n\n");
        }


        const responseHypo = await Promise.all(promisesHypo.map(f => f()));
        const responseRes = await Promise.all(promisesRes.map(f => f()));

        if (responseHypo.length > 0 || responseRes.length > 0) {

            let openVariablesCopied = [...openVariablesScenario];
            let fetchedVariablesCopied = [...this.state.fetchedVariables];
            let firstExpandedVariablesCopied = [...this.state.firstExpandedVariables];
            let expandedVariablesCopied = [...this.state.expandedVariables];
            const seriesHypoCopied = [...this.state.seriesHypo];
            const seriesResCopied = [...this.state.seriesRes];

            responseHypo.forEach((result, idx) => {
                let idxVariable = this.findIdxVariable(fetchingHypoVariables[idx].Name, seriesHypoCopied);
                if (result.series.length > 0) seriesHypoCopied.splice(idxVariable + 1, 0, ...result.series);
                if (result.openVariables.length > 0) openVariablesCopied = openVariablesCopied.concat(result.openVariables);
                if (result.fetchedVariables.length > 0) fetchedVariablesCopied = fetchedVariablesCopied.concat(result.fetchedVariables);
                if (result.firstExpandedVariables.length > 0) firstExpandedVariablesCopied = firstExpandedVariablesCopied.concat(result.firstExpandedVariables);
                if (result.expandedVariables.length > 0) expandedVariablesCopied = expandedVariablesCopied.concat(result.expandedVariables);
            });

            responseRes.forEach((result, idx) => {
                let idxVariable = this.findIdxVariable(fetchingResVariables[idx].Name, seriesResCopied);
                if (result.series.length > 0) seriesResCopied.splice(idxVariable + 1, 0, ...result.series);
                if (result.openVariables.length > 0) openVariablesCopied = openVariablesCopied.concat(result.openVariables);
                if (result.fetchedVariables.length > 0) fetchedVariablesCopied = fetchedVariablesCopied.concat(result.fetchedVariables);
                if (result.firstExpandedVariables.length > 0) firstExpandedVariablesCopied = firstExpandedVariablesCopied.concat(result.firstExpandedVariables);
                if (result.expandedVariables.length > 0) expandedVariablesCopied = expandedVariablesCopied.concat(result.expandedVariables);
            });

            
            const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
            this.setState({
                seriesHypo: seriesHypoCopied,
                seriesRes: seriesResCopied,
                // openVariables: [...new Map(openVariablesCopied.map((m) => [m.Name + "_" + m.degree, m])).values()],
                openVariables: updatedOpenVars,
                fetchedVariables: [...new Map(fetchedVariablesCopied.map((m) => [m.Name, m])).values()],
                firstExpandedVariables: [...new Map(firstExpandedVariablesCopied.map((m) => [m.Name, m])).values()],
                expandedVariables: [...new Map(expandedVariablesCopied.map((m) => [m.Name, m])).values()]
            }, () => {
                foundScenario["openVariables"] = updatedOpenVars;
                localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
                // TODO: Should also update the UI: ExpandAll
                if(cb) cb();
            });
        } else {
            if(cb) cb();
        }

    }

    applyFiliereAndFilterWhenChangingDegree = () => {
        let isChangingFiliere = false;
        this.state.filteredFilieres.forEach(filtered => {
            if (filtered.idFiliere !== "J900" && filtered.degree == this.state.currentDegre) {
                isChangingFiliere = true;
                this.changeFiliere(false, filtered.idFiliere, () => {
                    this.applyFilterWhenChangingDegree();
                    this.fetchOpenVariables(undefined);
                });
            }
        })

        if (isChangingFiliere === false) {
            this.applyFilterWhenChangingDegree();
        }

    }

    applyFilterWhenChangingDegree = () => {

        this.state.filteredHypoVariables.forEach(filtered => {
            if (filtered.idVariable !== "Tous" && filtered.degree == this.state.currentDegre) {
                this.applyFilter(filtered.idVariable, "hypo");
            }
        });

        this.state.filteredResVariables.forEach(filtered => {
            if (filtered.idVariable !== "Tous" && filtered.degree == this.state.currentDegre) {
                this.applyFilter(filtered.idVariable, "res");
            }
        });
    }

    // END - Fetch variables when changing degre or first showing scenario

    getTrueDegreLabel = (deg) => {
        let result = deg;
        switch (deg) {
            case 1:
                result = "Degré 1";
                break;
            case 2:
                result = "Degré 2";
                break;
            case 3:
                result = "Degré 3";
                break;
            case 4:
                result = "Degré 4";
                break;
            case 5:
                result = "Degré 5";
                break;
            case 6:
                result = "Degré 6";
                break;
            case 7:
                result = "Diplômé";
                break;
            case 8:
                result = "Académie";
                break;
        }
        return result;
    }

    getTrueDegre = (deg) => {
        let result = deg;
        switch (deg) {
            case 6:
                result = "6";
                break;
            case 7:
                result = "Diplome";
                break;
            case 8:
                result = "Academie";
                break;
        }
        return result;
    }
    getFilteredFiliere =()=>{
        let result;
        
        for(let i=0;i<this.state.filteredFilieres.length;i++){
            if(this.state.filteredFilieres[i].degree==this.state.currentDegre) result = this.state.filteredFilieres[i].idFiliere;
            
        }
        return result;
    }

    // BEGIN - TREEVIEW FUNCTIONS

    updateSeries = (newSeries, type, cb) => {
        if (type === "hypo") {
            this.setState({ seriesHypo: newSeries }, () => {
                if(cb) cb();
                // let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                // foundScenario["seriesHypo"] = newSeries;
                // localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
            });
        } else if (type === "res") {
            this.setState({ seriesRes: newSeries }, () => {
                if(cb) cb();
                // let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                // foundScenario["seriesRes"] = newSeries;
                // localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.myHypoTableRef && this.myHypoTableRef.current.updateColorUI && nextProps.users && nextProps.users.colorUI) {
            this.myHypoTableRef.current.updateColorUI(nextProps.users.colorUI)
        }
            if(this.myRef && this.myRef.current){
                const degres=[...nextState.degresModifies];
                let id=0;
                const user=JSON.parse(sessionStorage.getItem("user")) ;
                let degresUser=[];
                if(user.login==="ssr70") degresUser=degres
                else degresUser=degres.slice(0,-1)
                degresUser.forEach(deg=>{
                    if(deg===true) this.myRef.current.querySelectorAll(".checkbox-degre label ")[id].style.color="red"
                    else this.myRef.current.querySelectorAll(".checkbox-degre label ")[id].style.color="black"
                    id++;
            })
            }
            
        
            
        
        if (this.myResTableRef && this.myResTableRef.current.updateColorUI && nextProps.users && nextProps.users.colorUI) {
            this.myResTableRef.current.updateColorUI(nextProps.users.colorUI)
        }
        if (this.state.seriesHypo !== nextState.seriesHypo || this.state.seriesRes !== nextState.seriesRes || this.state.valueDisplay !== nextState.valueDisplay || this.state.isExportOpen !== nextState.isExportOpen) {
            return true;
        }
        return false;
    }

    getOpenVariables = () => {
        for(let i = 0; i < this.state.openVariables.length; i++) {
            if(this.state.openVariables[i].degree == this.state.currentDegre) return this.state.openVariables[i].variables;
        }

        return [];
    }

    updateOpenVariables = (newOpenVariables) => {
        const openVariablesCopied = [...this.state.openVariables];
        for(let i = 0; i < openVariablesCopied.length; i++) {
            const variable = openVariablesCopied[i];
            if(variable.degree == this.state.currentDegre) {
                const copiedObj = {...variable};
                copiedObj["variables"] = newOpenVariables;
                openVariablesCopied[i] = copiedObj;
                // break;
            }
            openVariablesCopied[i].variables = [...new Map(openVariablesCopied[i].variables.map((m) => [m.Name, m])).values()];
        };

        return openVariablesCopied;
    }

    expandAll = async (row, type) => {
        // INFO: Check if it is expanded
        const idRow = row.Name;
        let isExpanded = this.state.expandedVariables.find(variable => variable.Name === idRow);

        if (isExpanded) {
            // INFO: Remove expanded and openvariables
            this.removeExpandedChildren(row, type);
        } else {
            const isVariableFetched = Array.from(this.state.fetchedVariables).find(variable => variable.Name === idRow);
            let isFirstExpanded = Array.from(this.state.firstExpandedVariables).find(variable => variable.Name === idRow);

            const expandedVariablesCopied = [...this.state.expandedVariables];
            expandedVariablesCopied.push(row);
            let series = [];
            if (type === "hypo") series = this.state.seriesHypo;
            else if (type === "res") series = this.state.seriesRes;

            const openVariablesCopied = [...this.getOpenVariables()];
            openVariablesCopied.push(row);

            if (isFirstExpanded) {
                const foundChildren = [];
                this.deleteChildren(idRow, idRow, series, foundChildren);

                foundChildren.forEach(child => {
                    if (child.child > 0) openVariablesCopied.push(child);
                });
                this.showAllChildren(idRow, idRow, type);
                
                // INFO: Apply icon
                this.applyIconToTr(idRow, "table-row");
                this.applyIconToChildren(foundChildren, "table-row");

                // INFO: update the state
                const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
                this.setState({
                    openVariables: updatedOpenVars,
                    expandedVariables: expandedVariablesCopied
                }, () => {
                    let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                    foundScenario["openVariables"] = updatedOpenVars;
                    foundScenario["expandedVariables"] = expandedVariablesCopied;
                    localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
                })
            } else {
                const foundChildren = [];
                // INFO: We remove children of variable
                this.getChildren(idRow, series, foundChildren);
                
                const notChildren = series.filter(d => {
                    let isChild = false;
                    for (let iC = 0; iC < foundChildren.length; iC++) {
                        if (foundChildren[iC].Name === d.Name && foundChildren[iC].degree == this.state.currentDegre) {
                            isChild = true;
                            break;
                        }
                    }
                    return isChild == false;
                });

                // INFO: Add to the firstExpandedVariables
                const firstExpandedVariablesCopied = new Set(this.state.firstExpandedVariables);
                firstExpandedVariablesCopied.add(row);

                // INFO: We fetch the children of the variable
                const { openScenarioVariableWithChildren } = this.props;
                const result = await openScenarioVariableWithChildren(row.Name, this.state.id, this.state.currentDegre);
                const idxVariable = this.findIdxVariable(idRow, series, type);

                // INFO: We add to the openvariables and fetchedVariables
                const fetchedVariablesCopied = new Set(this.state.fetchedVariables);
                result.data.forEach(res => {
                    if (res.child > 0) openVariablesCopied.push(res);
                    if (res.child > 0) fetchedVariablesCopied.add(res);
                });
                fetchedVariablesCopied.add(row);
                // INFO: We just append all children to the series
                if (result.data.length > 0) notChildren.splice(idxVariable + 1, 0, ...result.data);               

                // INFO: Update state
                const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
                this.setState({
                    openVariables: updatedOpenVars,
                    fetchedVariables: fetchedVariablesCopied,
                    firstExpandedVariables: firstExpandedVariablesCopied,
                    expandedVariables: expandedVariablesCopied
                }, () => {
                    let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                    foundScenario["openVariables"] = updatedOpenVars;
                    foundScenario["expandedVariables"] = expandedVariablesCopied;
                    localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
                });
                this.updateSeries(notChildren, type, () => {
                    // INFO: Apply Icon:
                    this.showAllChildren(idRow, idRow, type);
                    this.applyIconToTr(idRow, "table-row");
                    this.applyIconToChildren(foundChildren, "table-row");
                });

            }
        }

    }

    removeExpandedChildren = (row, type) => {
        const idRow = row.Name;
        const expandedVariablesCopied = this.state.expandedVariables.filter(variable => {
            return variable.Name !== row.Name && variable.degree == this.state.currentDegre;
        });


        let openVariablesCopied = this.getOpenVariables().filter(variable => variable.Name !== idRow);
        // INFO: Add any other variables which are duplicated of idRow in other degrees
        // let variable = {};
        // for(let i = 0; i < this.state.openVariables.length; i++) {
        //     variable = this.state.openVariables[i];
        //     if(variable.Name === idRow && variable.degree != this.state.currentDegre) {
        //         openVariablesCopied.push(variable);
        //         break;
        //     }

        // }


        // INFO: Remove Children of idRow if any is open and hide children too
        const foundChildren = [];
        let series = [];
        if (type === "hypo") series = this.state.seriesHypo;
        else if (type === "res") series = this.state.seriesRes;

        this.deleteChildren(idRow, idRow, series, foundChildren);
        openVariablesCopied = openVariablesCopied.filter(variable => {
            let isThere = false;
            foundChildren.forEach(child => {
                if (child.Name === variable.Name) isThere = true;
            })
            return !isThere;
        });

        // INFO: Update the state
        const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
        this.setState(
            {
                expandedVariables: expandedVariablesCopied,
                openVariables: updatedOpenVars
            }, () => {
                let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                foundScenario["expandedVariables"] = expandedVariablesCopied;
                foundScenario["openVariables"] = updatedOpenVars;
                localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
            });

    }

    expand = async (row, type) => {
        // INFO: Check variable is already opened
        let idRow = row.Name;
        let isVariableOpen = this.getOpenVariables().find(variable => variable.Name === idRow && variable.degree == this.state.currentDegre);
        if (isVariableOpen) {

            let isExpanded = this.state.expandedVariables.find(variable => variable.Name === idRow && variable.degree == this.state.currentDegre);

            if (isExpanded) {
                this.removeExpandedChildren(row, type);
            } else {
                this.hideChildren(idRow, type, () => this.removeOpenVariables(idRow));
            }
        } else {
            let isVariableFetched = Array.from(this.state.fetchedVariables).find(variable => variable.Name === idRow);

            // INFO: We update the open variables
            let openVariablesCopied = [...this.getOpenVariables()];
            openVariablesCopied.push(row);

            let series = [];
            if (type === "hypo") series = this.state.seriesHypo;
            else if (type === "res") series = this.state.seriesRes;

            if (isVariableFetched) {
                this.showChildren(idRow, series, []);

                // INFO: Update the State
                const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
                this.setState({ openVariables: updatedOpenVars }, () => {
                    let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                    foundScenario["openVariables"] = updatedOpenVars;
                    localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
                });
            } else {
                const { doOpenVariable } = this.props;
                const result = await doOpenVariable(row.Name, row.IdParent, this.state.currentDegre)

                const children = result.data;
                children.forEach(child => {
                    child["Level"] = row.Level + 1;
                });
                // // INFO: We update the Data
                const dataCopied = [...series];
                let idxVariable = this.findIdxVariable(idRow, series, type);
                // INFO: Add children next to the parent
                if (children.length > 0) dataCopied.splice(idxVariable + 1, 0, ...children);


                const fetchedVariablesCopied = new Set(this.state.fetchedVariables);
                fetchedVariablesCopied.add(row);

                // INFO: Apply Icon
                this.applyIconToTr(idRow, "table-row");

                // INFO: Update the State
                const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
                this.setState({
                    openVariables: updatedOpenVars,
                    fetchedVariables: fetchedVariablesCopied
                }, () => {
                    let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
                    foundScenario["openVariables"] = updatedOpenVars;
                    localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
                });

                this.updateSeries(dataCopied, type);
            }
        }
    }

    showAllChildren = (idParent, idRow, type) => {
        const foundChildren = [];
        let series = [];
        if (type === "hypo") series = this.state.seriesHypo;
        else if (type === "res") series = this.state.seriesRes;
        this.getChildren(idRow, series, foundChildren);
        foundChildren.forEach(child => {
            this.myRef.current.querySelector(`tr[id='${idParent}'] ~ tr[id='${child.Name}']`).style.display = "table-row";
            this.showAllChildren(idParent, child.Name, type);
        });
    }

    showChildren = (id, data, children) => {
        this.applyIconToTr(id, "table-row");
        this.changeChildrenDisplay(id, id, data, children, "table-row");
    }

    deleteChildren = (idParent, id, data, children) => {
        this.applyIconToTr(id, "none");        
        this.changeChildrenDisplay(idParent, id, data, children, "none");
        this.applyIconToChildren(children, "none");
    }
    
    applyIconToChildren(children, type) {
        if(!children) return;
        children.forEach(child => {
            this.applyIconToTr(child.Name, type);
        });
    }

    applyIconToTr(id, type) {
        const tr =  this.myRef.current.querySelector(`tr[id='${id}']`);
        if(tr.className.includes("is-child") == false) {
            const icon = tr.querySelector(`.content-open i`);
            if(icon && type == "none") {
                icon.className = "triangle right icon";
            } else if(icon && type != "none") {
                icon.className = "triangle down icon";
            }
        }
    }

    changeChildrenDisplay = (idParent, id, data, children, type) => {
        for (let iD = 0; iD < data.length; iD++) {
            if (data[iD].Parent === id && data[iD].degree == this.state.currentDegre) {
                children.push(data[iD]);
                this.myRef.current.querySelector(`tr[id='${idParent}'] ~ tr[id='${data[iD].Name}']`).style.display = type;
                this.deleteChildren(idParent, data[iD].Name, data, children);
            }
        }
    }

    getAllChildren = (id, data, childrenName = []) => {
        for (let iD = 0; iD < data.length; iD++) {
            if (data[iD].Parent === id) {
                childrenName.push(`tr[id='${data[iD].Name}']`);
                this.getAllChildren(data[iD].Name, data, childrenName);
            }
        }
    }

    getChildren = (id, data, children) => {
        for (let iD = 0; iD < data.length; iD++) {
            if (data[iD].Parent === id) {
                children.push(data[iD]);
                this.getChildren(data[iD].Name, data, children);
            }
        }
    }

    findIdxVariable = (idVariable, series, type = null) => {
        let idxVariable = -1;

        for (let iD = 0; iD < series.length; iD++) {
            if (series[iD].Name === idVariable) {
                idxVariable = iD;
                break;
            }
        }
        return idxVariable;
    }

    removeOpenVariables = (idRow, cb) => {
        let openVariablesCopied = this.getOpenVariables().filter(variable => variable.Name !== idRow);
        // INFO: Remove Children of idRow if any is open
        const foundChildren = [];
        this.deleteChildren(idRow, idRow, openVariablesCopied, foundChildren);
        openVariablesCopied = openVariablesCopied.filter(variable => {
            let isThere = false;
            foundChildren.forEach(child => {
                if (child.Name === variable.Name) isThere = true;
            })
            return !isThere;
        });
        const updatedOpenVars = this.updateOpenVariables(openVariablesCopied);
        this.setState({ openVariables: updatedOpenVars }, () => {
            let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
            foundScenario["openVariables"] = updatedOpenVars;
            localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
            if (cb) cb();
        });
    }

    hideChildren = (idVariable, type, cb) => {
        // INFO: Get all children
        const foundChildren = [];
        let series = [];
        if (type === "hypo") series = this.state.seriesHypo;
        else if (type === "res") series = this.state.seriesRes;

        this.getAllChildren(idVariable, series, foundChildren);

        let ids = foundChildren.join(",")
        if (ids.length > 0)
            this.myRef.current.querySelectorAll(ids).forEach(el => el.style.display = "none");

        if (cb) cb();
    }

    checkVariable = (checked, row) => {
        let checkedVariablesCopied = [...this.state.checkedVariables];
        const { scenarios } = this.props;
        if (checked) {
            let txtAide = "", txtFiliere = "", txtFormule = "", textDefinitionFromXML="", textFormuleFromXML= "" , textLinkFromXML= "", textVariableFromXML= "" ;
            
            
            if (row.Name !== "EFF" && row.Name!=="EFF_TOT_FIL") {
                

                if(this.state.currentDegre !=="Academie"){
                // TODO: need to check before accessing indexes
                const aide = scenarios.proprietes.aides.$values.filter(x => x.Variable.includes(row.RealName.split("_")[0]));
                const aideXml = scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable)).length>0 ? scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable))[0] : {Definition:`Propriété de la variable ${row.Name}`,Variable:'empty'};
                
                const formule = scenarios.proprietes.formules.$values.filter(x => x.Variable.includes(row.RealName.split("_")[0]));
                let filiere = scenarios.proprietes.filieres.$values.filter(x => x.indice.includes(row.RealName.split("_")[row.RealName.split("_").length-1]));
                let J="";
                let I="";
                
                if(row.Name!=="" && row.Name.includes("_JI")){
                    I=row.RealName.split(',')[row.RealName.split(',').length-1];
                    J=row.RealName.split(',')[0].split('_')[row.RealName.split(',')[0].split('_').length-1]
                    if(row.Name.includes('1:9')) {
                        filiere = scenarios.proprietes.filieres.$values.filter(x => x.description == "Ensemble" || x.description == "ensemble");
                    }
                    else filiere = scenarios.proprietes.filieres.$values.filter(x => x.indice == 'I'+I || x.indice == I || x.indice.includes(J));
                }
                else if (row.RealName.split("_")[row.RealName.split("_").length-1] == "IJ" || row.RealName.split("_")[row.RealName.split("_").length-1] == "J") 
                {
                    filiere = scenarios.proprietes.filieres.$values.filter(x => x.description == "Ensemble" || x.description == "ensemble");
                }
                else if (row.RealName.split("_")[row.RealName.split("_").length-1] == "I" || !row.RealName.includes(',')) 
                {
                    filiere = row.RealName.split("_")[row.RealName.split("_").length-1] == "I"? 
                        scenarios.proprietes.filieres.$values.filter(x => x.indice=='I1:9')
                    : row.RealName.includes(':') ? 
                        scenarios.proprietes.filieres.$values.filter(x => x.indice=='I'+row.RealName.split("_")[row.RealName.split("_").length-1])
                    : scenarios.proprietes.filieres.$values.filter(x => x.indice.includes(row.RealName.split("_")[row.RealName.split("_").length-1]))
                }
                else {
                    filiere = !row.RealName.includes(',') ? 
                        scenarios.proprietes.filieres.$values.filter(x => x.indice == 'I' + row.RealName.split("_")[row.RealName.split("_").length-1] || x.indice == 'J' + row.RealName.split("_")[row.RealName.split("_").length-1])
                    : scenarios.proprietes.filieres.$values.filter(x => x.indice == 'I' + row.RealName.split(",")[0].split("_")[row.RealName.split(",")[0].split("_").length-1] || x.indice == row.RealName.split(",")[0].split("_")[row.RealName.split(",")[0].split("_").length-1] || x.indice.includes(row.RealName.split(",")[1]));
                }
                
                if (aide.length > 0) {
                    let definition = aide[0].Definition;
                    let deg = row.RealName.split("_")[1].split("")[1];
                    if (definition.includes("{0}")) definition = definition.replaceAll("{0}", deg);
                    if (definition.includes("{0} + 1")) definition = definition.replaceAll("{0} + 1", deg + 1);
                    txtAide = `${row.RealName}: ${definition}`;
                }
                if (formule.length > 0) txtFormule = `${row.RealName}: ${formule[0].FConstat}`;
                let resultatFiliere="";
                if (filiere.length > 0) {
                    // let nomFiliere = filiere[0].description;
                    // let description = filiere[0].description;
                    // txtFiliere = `${nomFiliere} + ${description}`

                    for (let i = 0; i < filiere.length; i++) {
                        resultatFiliere = resultatFiliere + filiere[i].nomfiliere + ":" + filiere[i].description + "+";
                    }
                    txtFiliere = `${resultatFiliere}`;
                    
                    if(txtFiliere.charAt(0)==="J" && resultatFiliere.split('+').length>2) txtFiliere=resultatFiliere.split('+')[1]+"+"+resultatFiliere.split('+')[0]
                }
                textDefinitionFromXML= aideXml.Definition;
                textFormuleFromXML= aideXml.Formule;
                textLinkFromXML= aideXml.Link ? aideXml.Link :"";
                textVariableFromXML= aideXml.Variable;
                }else{
                    if(row.RealName.includes(',')){
                        let filiere = scenarios.proprietes.filieres.$values.filter(x => x.indice.includes(row.RealName.split(",")[0].split("_")[row.RealName.split(",")[0].split("_").length-1])); 
                        const aideXml = scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable)).length>0 ? scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable))[0] : {Definition:`Propriété de la variable ${row.Name}`,Variable:'empty'};
                        textDefinitionFromXML= aideXml.Definition;
                        textFormuleFromXML= aideXml.Formule;
                        textLinkFromXML= aideXml.Link ? aideXml.Link :"";
                        textVariableFromXML= aideXml.Variable;
                        
                        if(filiere!==[]) {
                            txtFiliere=filiere[0].nomfiliere+"+"+filiere[0].description 
                        }                        
                        else {
                        txtFiliere =  "";

                        }
                        
                        // if (row.RealName.split("_")[row.RealName.split("_").length-1] == "IJ" || row.RealName.split("_")[row.RealName.split("_").length-1] == "J") filiere = scenarios.proprietes.filieres.$values.filter(x => x.description == "Ensemble" || x.description == "ensemble");
                

                    }
                    else{
                        // let filiere = scenarios.proprietes.filieres.$values.filter(x => x.indice.includes(row.RealName.split("_")[row.RealName.split(",")[0].split("_").length-1])); 
                        const aideXml = scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable)).length>0 ? scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable))[0] : {Definition:`Propriété de la variable ${row.Name}`,Variable:'empty'};
                        textDefinitionFromXML= aideXml.Definition;
                        textFormuleFromXML= aideXml.Formule;
                        textLinkFromXML= aideXml.Link ? aideXml.Link :"";
                        textVariableFromXML= aideXml.Variable;
                        txtFiliere="J900+Ensemble";
                    }
                }
            }
            else{
                const aideXml = scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable)).length>0 ? scenarios.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable))[0] : {Definition:`Propriété de la variable ${row.Name}`,Variable:'empty'};
                textDefinitionFromXML= "Effectif total";
                textFormuleFromXML= "";
                textLinkFromXML= aideXml.Link ? aideXml.Link :"";
                textVariableFromXML="";
            }
            
            checkedVariablesCopied.push({
                RealName: row.RealName,
                row:row,
                display: row.display,
                Name: row.Name,
                serie: row.serie,
                txtAide: txtAide,
                txtFiliere: txtFiliere,
                txtFormule: txtFormule,
                txtFormule: txtFormule,
                txtFormule: txtFormule,
                textDefinitionFromXML: textDefinitionFromXML,
                textFormuleFromXML: textFormuleFromXML,
                textLinkFromXML: textLinkFromXML,
                textVariableFromXML: textVariableFromXML
            });
        } else {
            checkedVariablesCopied = checkedVariablesCopied.filter(d => {
                return d.Name !== row.Name;
            });
        }

        this.setState({ checkedVariables: checkedVariablesCopied }, () => {
            let foundScenario = JSON.parse(localStorage.getItem(this.state.id));
            foundScenario["checkedVariables"] = checkedVariablesCopied;
            localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
            this.updateChart();
        });
    }

    updateChart = () => {
        if (this.myChartRef.current && this.myChartRef.current.updateCheckedVariables)
            this.myChartRef.current.updateCheckedVariables(this.state.checkedVariables);
    }

    calculMereScenarioPane = (row) => {
        const { calculMereScenario } = this.props;

        calculMereScenario(row, this.state.currentDegre).then(result => {
            if(!result.data) return;
            const util = new Utils();
            if(util.isEmpty(result.data)) return;
            if(result.data.newSeries.length == 0) return;

            const idxYear = this.state.years.indexOf(result.data.newSeries[0].year);
            const hashRes = Object.assign({}, ...result.data.newSeries.map((x) => ({ [x.Variable]: x.Value })));
            const seriesHypoCopied = [...this.state.seriesHypo];
            seriesHypoCopied.forEach(variable => {

                // INFO: We update the variables that are returned by calculMeres
                if (hashRes[variable.Name] || hashRes[variable.Name] === 0) {
                    const serieCopied = [...variable.serie];
                    serieCopied[idxYear] = hashRes[variable.Name];
                    variable.serie = serieCopied;
                }
            });
            let currDegree = this.getIndexDegre(this.state.currentDegre);
            
            if (currDegree < this.state.idxOrigDegre) {
                if(this.state.degresModifiesFirst[currDegree] == false){
                    
                    const {informationError} = this.props;
                    informationError("Modification d'un contexte qui n'est pas le dernier calculé.");
                    // this.setState({openConfirmModificationContexte:true});
                    // console.log(this.state.openConfirmModificationContexte);
                    // <Confirm open={this.state.openConfirmModificationContexte} content="Modification d'un contexte qui n'est pas le dernier calculé." onConfirm={()=> this.setState({openConfirmModificationContexte:false})}/>
                    // alert("Modification d'un contexte qui n'est pas le dernier calculé.")
        
                    const degresModifiesFirstCopied = [...this.state.degresModifiesFirst];
                    degresModifiesFirstCopied[currDegree] = true;
                    this.setState({degresModifiesFirst: degresModifiesFirstCopied});
                }

                    
                
                //     const tableDegre=[...this.state.degresModifies];
                
                //     for(let i=currDegree;i<=this.state.idxTrueOrigDegre;i++){
                //         tableDegre[i]=true;
                //     }
                //     this.setState({degresModifies:tableDegre})
                // }else{
                //     const tableDegre=[...this.state.degresModifies];
                
                //     for(let i=currDegree;i<=this.state.idxTrueOrigDegre;i++){
                //         tableDegre[i]=true;
                //     }
                //     this.setState({degresModifies:tableDegre})
                // }
                this.setState({degresModifies: result.data.degres_modifies});
                
                
            }
            this.updateSeries(seriesHypoCopied, "hypo");
            this.updateChartUI();
        });

    }
    
    getIndexDegre(degre) {
        let result = degre;
        if (degre=== "Diplome") result = 7;
        else if (degre=== "Entrant") result = 0;
        else if (degre=== "Academie") result = 8;
        else result = parseInt(degre);

        return result;
    }

    // END - TREEVIEW FUNCTIONS

    setSelectedVariable = (selected, isCalcul = false) => {
        if (this.previsionContentRef.current && this.previsionContentRef.current.updateSelectedVariable)
            this.previsionContentRef.current.updateSelectedVariable(selected);
        if(this.myHypoTableRef.current && this.myHypoTableRef.current.updateSelectedVarialbe && isCalcul) 
            this.myHypoTableRef.current.updateSelectedVarialbe(selected);
        this.setState({ selectedVariable: selected });
    }

    headStyle = () => {
        return {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "7px"
        }
    }

    setValueDisplay = (val) => {
        this.setState({ valueDisplay: val });
    }

    handleChangeDegre = async (e, data) => {
        this.setState({ checkedVariables: [] })
        const { changeDegre } = this.props;
        let deg = "Entrant";
        switch (data.value) {
            case "Degré 1":
                deg = "1";
                break;
            case "Degré 2":
                deg = "2";
                break;
            case "Degré 3":
                deg = "3";
                break;
            case "Degré 4":
                deg = "4";
                break;
            case "Degré 5":
                deg = "5";
                break;
            case "Degré 6":
                deg = "6";
                break;
            case "Diplômé":
                deg = "Diplome";
                break;
            case "Académie":
                deg = "Academie";
                break;
        }
        const result = await changeDegre(deg, this.state.id);
        const scenario = result.data.scenario;
        this.setState({ fetchedVariables: [], expandedVariables: [], firstExpandedVariables: [], seriesHypo: scenario.seriesHypo, seriesRes: scenario.seriesRes, currentDegreLabel: data.value, currentDegre: deg, variables: result.data.variables, hypoVariables: result.data.hypoVariables, resVariables: result.data.resVariables, checkedVariables: [] }, () => {
            this.setSelectedVariable({}, true);
            this.updateChart();
            this.fetchOpenVariablesAndApplyFilterAndApplyFiliere();
        });
    }

    getDegreOnglet = (degre) =>{
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
            case 7:
                return "Diplômé";
            case 8:
                return "Académie";
            default:
                return "Entrant";
        }
    }
    selectLastDegre = async (data,isNationalUser) => {
        let dataValue = this.getDegreOnglet(data)
        this.setState({ checkedVariables: [] })
        const { changeDegre } = this.props;
        let deg = "Entrant";
        switch (dataValue) {
            case "Degré 1":
                deg = "1";
                break;
            case "Degré 2":
                deg = "2";
                break;
            case "Degré 3":
                deg = "3";
                break;
            case "Degré 4":
                deg = "4";
                break;
            case "Degré 5":
                deg = "5";
                break;
            case "Degré 6":
                deg = "6";
                break;
            case "Diplômé":
                deg = "Diplome";
                break;
            case "Académie":
                deg = "Academie";
                break;
        }
        if (deg==="Academie" && isNationalUser===false){ 
            deg = "Diplome"
        }
        const result = await changeDegre(deg, this.state.id);
        const scenario = result.data.scenario;
        this.setState({ fetchedVariables: [], expandedVariables: [], firstExpandedVariables: [], seriesHypo: scenario.seriesHypo, seriesRes: scenario.seriesRes, currentDegreLabel: dataValue, currentDegre: deg, variables: result.data.variables, hypoVariables: result.data.hypoVariables, resVariables: result.data.resVariables, checkedVariables: [] }, () => {
            this.setSelectedVariable({}, true);
            this.updateChart();
            this.fetchOpenVariablesAndApplyFilterAndApplyFiliere();
        });
    }

    // BEGIN - TABLE SCROLL
    tableScrollHypo = (event) => {
        setTimeout(() => {
            if(this.tableContainerHYpo && this.tableContainerRes)
            this.tableContainerRes.scrollLeft = this.tableContainerHYpo.scrollLeft;
        }, 20);

    }

    tableScrollRes = (event) => {
        setTimeout(() => {
            if(this.tableContainerHYpo && this.tableContainerRes)
                this.tableContainerHYpo.scrollLeft = this.tableContainerRes.scrollLeft;
        }, 20);
        
    }
    // END - TABLE SCROLL

    // BEGIN - ReconduireVariables
    reconduireVariable = async () => {
        const util = new Utils();
        if(util.isEmpty(this.state.selectedVariable)) {
            const {informationError} = this.props;
            informationError("Aucune variable sélectionnée");
            return;
        }
        const { reconduireVariable } = this.props;
        let vcopie = this.state.lastYear;
        // INFO: We take into account the atypical years
        const allIncludedYears = util.minus(this.state.years, this.state.atypicalYears, this.state.lastYear);
        if(allIncludedYears.length > 0) vcopie = Math.max(...allIncludedYears);

        const response = await reconduireVariable(this.state.id, this.state.selectedVariable, vcopie, this.state.currentDegre,this.getFilteredFiliere());
        this.updateSeriesHypo(response.data.seriesHypo, () => {
            this.setSelectedVariable({}, true);
            this.updateChartUI();
        });
    }

    reconduireVariables = async () => {
        const { reconduireVariables } = this.props;
        const util = new Utils();

        let vcopie = this.state.lastYear;
        // INFO: We take into account the atypical years
        const allIncludedYears = util.minus(this.state.years, this.state.atypicalYears, this.state.lastYear);
        if(allIncludedYears.length > 0) vcopie = Math.max(...allIncludedYears);

        const response = await reconduireVariables(this.state.id, vcopie, this.state.currentDegre, this.getFilteredFiliere());
        this.setSelectedVariable({}, true);
        this.updateSeriesHypo(response.data.seriesHypo, this.updateChartUI());
    }

    getHypoMere = () => {
        const mereVariables = [];

        this.getOpenVariables().forEach(variable => {
            if (variable.Parent === "Hypotheses" || variable.Root === "Hypotheses" ) mereVariables.push(variable);
        });
        this.state.fetchedVariables.forEach(variable => {
            if (variable.Parent === "Hypotheses" || variable.Root === "Hypotheses" ) {
                const found = mereVariables.some(el => el.Name === variable.Name);
                if (!found) mereVariables.push(variable);
            }
        });
        return new Set(mereVariables);
    }

    updateSeriesHypo = async (seriesHypo, cb) => {
        const variables = this.getHypoMere();
        const seriesCopied = [...this.state.seriesHypo];
        await this.updateAllSeries(variables, seriesHypo, seriesCopied, "hypo", cb);
    }

    updateAllSeries = async (variables, arrayOfValues, series, type, cb) => {
        let arrayOfValuesCopied = arrayOfValues;
        if (variables.size > 0) {
            const { openScenarioVariableWithChildrenMultiple } = this.props;
            const responseOpen = await openScenarioVariableWithChildrenMultiple(Array.from(variables), this.state.id, this.state.currentDegre);
            arrayOfValuesCopied = responseOpen.data.concat(arrayOfValuesCopied);
        }

        

        let hashSeries = arrayOfValuesCopied.reduce(function (map, obj) {
            map[obj.Name] = obj.serie;
            return map;
        }, {});

        for (let iS = 0; iS < series.length; iS++) {
            const variable = { ...series[iS] };
            if (hashSeries[variable.Name]) {
                variable["serie"] = hashSeries[variable.Name];
                series[iS] = variable;
            }
        }
        if (type === "hypo") {
            this.setState({ seriesHypo: series }, () => {
                if (cb) cb();
            });
        } else if (type === "res") {
            this.setState({ seriesRes: series }, () => {
                if (cb) cb();
            });
        }

    }
    // END - ReconduireVariables

    // BEGIN - CalculContexte
    calculContexte = async () => {
        const { calculContexte } = this.props;
        const response = await calculContexte(this.state.id, this.state.currentDegre,this.getFilteredFiliere());
        let currDegree = this.getIndexDegre(this.state.currentDegre);
        const currentDegre=parseInt(currDegree);
        const newDegreModifies=[...this.state.degresModifies];
        
        newDegreModifies[currentDegre]=false
        // this.setState({degresModifies:newDegreModifies})
        await Promise.all([this.updateSeriesHypo(response.data.scenario.seriesHypo), this.updateSeriesRes(response.data.scenario.seriesRes)]); // TODO: The loading maybe Set to false too early
        this.setSelectedVariable({}, true);
        if(this.state.idxOrigDegre==currDegree && currDegree!==8) this.setState({idxOrigDegre: this.state.idxOrigDegre + 1});
        
        const degresModifiesFirstCopied = [...this.state.degresModifiesFirst];
        degresModifiesFirstCopied[currentDegre] = false;

        this.setState({degresModifies:newDegreModifies, degresModifiesFirst: degresModifiesFirstCopied});
        this.updateChartUI();
    }
    getResMere = () => {
        const mereVariables = [];
        this.getOpenVariables().forEach(variable => {
            if (variable.Parent === "Resultats") mereVariables.push(variable);
        });
        this.state.fetchedVariables.forEach(variable => {
            if (variable.Parent === "Resultats") {
                const found = mereVariables.some(el => el.Name === variable.Name);
                if (!found) mereVariables.push(variable);
            }
        });
        return new Set(mereVariables);
    }
    updateSeriesRes = async (seriesRes, cb) => {
        const variables = this.getResMere();
        const seriesCopied = [...this.state.seriesRes];
        await this.updateAllSeries(variables, seriesRes, seriesCopied, "res", cb);
    }
    // END - CalculContexte

    // BEGIN - Export
    setExportOpen = (value) => {
        this.setState({ isExportOpen: value });
    }

    exportVariables = async (variablesToExport) => {
        this.setExportOpen(false);
        let idVariables = "";
        variablesToExport.forEach(variable => idVariables += variable.RealName + ";"); // TODO: When we change this to variable.Name, an error occured
        if (idVariables.length > 0) idVariables = idVariables.substring(0, idVariables.length - 1);

        const { exportScenario, downloadFile } = this.props;
        const result = await exportScenario(this.state.id, this.state.currentDegre, idVariables);
        const { Path, Filename } = result.data;
        const blob = await downloadFile(Path);

        saveAs(blob, Filename);
    }
    // END - Export

    // BEGIN - Calcul Hypothése

    updateChartUI = () => {
        const checkedVariablesCopied = [...this.state.checkedVariables];

        this.setState({checkedVariables: []}, () => {
            let idsChecked = [];
            checkedVariablesCopied.forEach(checked => {
                idsChecked.push(`tr[id='${checked.Name}'] input[type='checkbox']`);
            });
    
            if(idsChecked.length > 0) {
                this.myRef.current.querySelectorAll(idsChecked.join(',')).forEach(elem => {
                    elem.click();
                    setTimeout(() => elem.click(), 100); // INFO: Did'nt find better way, still not understand why this work
                });
            }
        })


    }

    calculerHypothese = (type, updatedVariable, newSeries) => {
        // switch(type) {
        //     case "meanA":
        //         break;
        //     case "Tglobal":
        //         break;
        //     case "Tannuel":
        //         break;
        //     case "meanG":
        //         break;
        //     case "regr":
        //         break;
        //     case "exp":
        //         break;
        //     case "log":
        //         break;
        //     case "pol":
        //         break;
        //     case "pow":
        //         break;
        //     default:
        //         this.setState({seriesHypo: newSeries});
        // }
        // const
        const variable = [{
            Values: updatedVariable.serie,
            Variable: updatedVariable.Name
        }];

        const { enregistrerScenario } = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        enregistrerScenario(this.state.id, userId, JSON.stringify(variable), false).then(d => { // TODO
            this.setState({ seriesHypo: newSeries });
            this.updateChartUI();
            this.setSelectedVariable(this.state.selectedVariable, true);
        });
    }
    // END - Calcul Hypothése

    deleteScenario = () => {
        const { deleteScenario } = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        if (window.confirm('Voulez-vous vraiment supprimer ce scénario ?')) {
            deleteScenario(this.state.id, userId);
        }
    }

    enregistrerScenario = () => {
        const { enregistrerScenario } = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        enregistrerScenario(this.state.id, userId);
    }

    changeFiliere = async (isClicked, filiere, cb) => {
        const { fetchScenario } = this.props;
        const response = await fetchScenario(this.state.id, this.state.currentDegre, filiere, true);

        // INFO: Update filiere filtre
        const copiedFilteredFilieres = [...this.state.filteredFilieres];
        for (let i = 0; i < copiedFilteredFilieres.length; i++) {
            if (copiedFilteredFilieres[i].degree == this.state.currentDegre) {
                const copiedObj = { ...copiedFilteredFilieres[i] };
                copiedObj.idFiliere = filiere;
                copiedFilteredFilieres[i] = copiedObj;
                break;
            }
        }
        const copiedFilteredHypoVariables = [...this.state.filteredHypoVariables];
        const copiedFilteredResVariables = [...this.state.filteredResVariables];
        if (isClicked) {
            // INFO: Update Filtre Hypo
            for (let i = 0; i < copiedFilteredHypoVariables.length; i++) {
                if (copiedFilteredHypoVariables[i].degree == this.state.currentDegre) {
                    const copiedObj = { ...copiedFilteredHypoVariables[i] };
                    copiedObj.idVariable = "Tous";
                    copiedFilteredHypoVariables[i] = copiedObj;
                    break;
                }
            }

            // INFO: Update Filtre res
            for (let i = 0; i < copiedFilteredResVariables.length; i++) {
                if (copiedFilteredResVariables[i].degree == this.state.currentDegre) {
                    const copiedObj = { ...copiedFilteredResVariables[i] };
                    copiedObj.idVariable = "Tous";
                    copiedFilteredResVariables[i] = copiedObj;
                    break;
                }
            }
        }

        


        this.setState({ seriesHypo: response.data.scenario.seriesHypo, seriesRes: response.data.scenario.seriesRes, fetchedVariables: [], expandedVariables: [], firstExpandedVariables: [], openVariables: this.getDefaultOpenVars(), hypoVariables: response.data.hypoVariables, resVariables: response.data.resVariables, filteredFilieres: copiedFilteredFilieres, filteredHypoVariables: copiedFilteredHypoVariables, filteredResVariables: copiedFilteredResVariables, checkedVariables: [] }, () => {
            this.setSelectedVariable({}, true); 
            
            const foundScenario = JSON.parse(localStorage.getItem(this.state.id));
            foundScenario["filteredFilieres"] = copiedFilteredFilieres;
            foundScenario["filteredResVariables"] = copiedFilteredResVariables;
            foundScenario["filteredHypoVariables"] = copiedFilteredHypoVariables;
            localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
            this.updateChart();
            if (cb) cb();
        });
    }

    applyFilter = async (idVariable, type) => {
        const series = type === "hypo" ? this.state.seriesHypo : this.state.seriesRes;
        const parent = type === "hypo" ? "Hypotheses": "Resultats";

        let selector = `.scenario-tableprev-${type} table tbody tr[parent="${parent}"], .scenario-tableprev-${type} table tbody tr[root="${parent}"]`;
        this.myRef.current.querySelectorAll(selector).forEach(tr => tr.style.display = "table-row");
        if (idVariable === "Tous") {
            if (type === "hypo") {
                this.updateHypoFiltered(idVariable);
            } else if (type === "res") {
                this.updateResFiltered(idVariable);
            }
            this.getOpenVariables().forEach(variable => {
                const idsChildren = this.getIdsFirstChildren(series, variable.Name);
                this.myRef.current.querySelectorAll(`.scenario-tableprev-${type} table tbody tr${idsChildren.join(",")}`).forEach(tr => tr.style.display = "table-row");
            });
             
            return;
        }
        const foundChildren = [];
        this.getChildren(idVariable, series, foundChildren);

        let strId = [];
        strId.push(`[id='${idVariable}']`);
        foundChildren.forEach(child => {
            strId.push(`[id='${child.Name}']`);
        });

        this.myRef.current.querySelectorAll(`.scenario-tableprev-${type} table tbody tr:not(${strId.join(",")})`).forEach(tr => tr.style.display = "none");
        const isOpen = this.getOpenVariables().find(variable => variable.Name === idVariable);
        if(isOpen) {
            foundChildren.forEach(child => {
                const isChildOpen = this.getOpenVariables().find(variable => variable.Name === child.Name);
                if(isChildOpen) {
                    const idsChildren = this.getIdsFirstChildren(series, child.Name);
                    this.myRef.current.querySelectorAll(`.scenario-tableprev-${type} table tbody tr${idsChildren.join(",")}`).forEach(tr => tr.style.display = "table-row");
                }
            });
            const idsChildren = this.getIdsFirstChildren(series, idVariable);
            this.myRef.current.querySelectorAll(`.scenario-tableprev-${type} table tbody tr${idsChildren.join(",")}`).forEach(tr => tr.style.display = "table-row");
        }
        if (type === "hypo") {
            this.updateHypoFiltered(idVariable);
        } else if (type === "res") {
            this.updateResFiltered(idVariable);
        }
    }

    getFirstChildren = (id, data, children) => {
        for (let iD = 0; iD < data.length; iD++) {
            if (data[iD].Parent === id) {
                children.push(data[iD]);
            }
        }
    }
     
    getIdsFirstChildren = (series, idVariable) => {
        const foundChildren = [];
        this.getFirstChildren(idVariable, series, foundChildren);

        let strId = [];
        strId.push(`[id='${idVariable}']`);
        foundChildren.forEach(child => {
            strId.push(`[id='${child.Name}']`);
        });

        return strId;
    }

    updateResFiltered = (idVariable) => {
        const copiedFilteredRes = [...this.state.filteredResVariables];
        for (let i = 0; i < copiedFilteredRes.length; i++) {
            if (copiedFilteredRes[i].degree == this.state.currentDegre) {
                const copiedObj = { ...copiedFilteredRes[i] };
                copiedObj.idVariable = idVariable;
                copiedFilteredRes[i] = copiedObj;
                break;
            }
        }

        this.setState({ filteredResVariables: copiedFilteredRes }, () => {
            const foundScenario = JSON.parse(localStorage.getItem(this.state.id));
            foundScenario["filteredResVariables"] = copiedFilteredRes;
            localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
        })
    }

    updateHypoFiltered = (idVariable) => {
        const copiedFilteredHypo = [...this.state.filteredHypoVariables];
        for (let i = 0; i < copiedFilteredHypo.length; i++) {
            if (copiedFilteredHypo[i].degree == this.state.currentDegre) {
                const copiedObj = { ...copiedFilteredHypo[i] };
                copiedObj.idVariable = idVariable;
                copiedFilteredHypo[i] = copiedObj;
                break;
            }
        }

        this.setState({ filteredHypoVariables: copiedFilteredHypo }, () => {
            const foundScenario = JSON.parse(localStorage.getItem(this.state.id));
            foundScenario["filteredHypoVariables"] = copiedFilteredHypo;
            localStorage.setItem(this.state.id, JSON.stringify(foundScenario));
        });
    }

    clearCheckedVariables = () => {
        this.setState({checkedVariables: []});
    }
    
    handleCalculateAll = (idScenario, lastYear, currentDegree, lastDegreeOpen, islastDegree, isNationalUser) => {
        const {calculateAll} = this.props;
        calculateAll(idScenario, lastYear, currentDegree, lastDegreeOpen, islastDegree, isNationalUser).then(()=> this.selectLastDegre(this.state.idxOrigDegre,isNationalUser));
    }

    render() {
        const { checkedVariables, expandedVariables, openVariables } = this.state;
        
        const { users, informationError } = this.props;

        let degresToShow = this.state.degres;

        if (this.state.userLogin !== "ssr70") {
            degresToShow = degresToShow.filter(degree => degree !== "Académie");
        }

        const degresContent = degresToShow.map((degre, idx) => {
            const checkProps = {};
            const {scenarios}=this.props;

            if (idx > this.state.idxOrigDegre) checkProps.disabled = true;
            
            return (
                <Form.Field key={degre}>
                    <Checkbox {...checkProps} name='degre' radio onChange={(e, data) => this.handleChangeDegre(e, data)} checked={this.state.currentDegreLabel === degre} value={degre} label={degre} className='checkbox-degre' />
                </Form.Field>
            )
        });
        
        return (

            <div ref={this.myRef} className='scenario-pane'>
                <Grid>
                    <Grid.Row columns={1}>
                        <Grid.Column width={16}>
                            <div>
                                {/*Modal Open Export*/}
                                <ExportModal setExportOpen={this.setExportOpen} isExportOpen={this.state.isExportOpen} variables={this.state.variables} exportVariables={this.exportVariables} />
                            </div>
                            {/* <div><p>Scénario: {this.state.name}</p></div> */}
                            <div style={this.headStyle()}>
                                <div>
                                    <Button onClick={() => this.enregistrerScenario()} primary >Enregistrer</Button>
                                    <Button onClick={() => this.deleteScenario()} color='red'>Supprimer</Button>
                                    <Button onClick={() => this.setExportOpen(true)} primary>Exporter</Button>
                                </div>

                                <div style={{ display: 'flex'}}>
                                    <p style={{ marginRight: "7px" }}>Affichage par:</p>
                                    <Button.Group>
                                        <Button className={this.state.active1 ? 'button-display-value': ''} style={{ marginLeft: "7px" }} active={this.state.active1} onClick={() => { this.setValueDisplay("value"); this.setState({ active1: true, active2: false, active3: false }) }}>Valeur</Button>
                                        <Button className={this.state.active2 ? 'button-display-value': ''} style={{ marginLeft: "7px" }} active={this.state.active2} onClick={() => { this.setValueDisplay("diff"); this.setState({ active2: true, active1: false, active3: false }) }}>Différence</Button>
                                        <Button className={this.state.active3 ? 'button-display-value': ''} style={{ marginLeft: "7px" }} active={this.state.active3} onClick={() => { this.setValueDisplay("rate"); this.setState({ active3: true, active2: false, active1: false }) }}>Taux d'évolution</Button>
                                    </Button.Group>
                                </div>
                            </div>
                            <Grid>
                                <Grid.Column width={12}>
                                    <div className='scenario-tableprev scenario-tableprev-hypo'>
                                        <h2>Hypothèses</h2>
                                        <div className='div-filter'>
                                            <CustomFiltreScenario applyFilter={(value) => this.applyFilter(value, "hypo")} label="Hypothèses" className="custom-filtre-scenario-hypo" data={this.state.hypoVariables} />
                                        </div>
                                        <div className='div-table'>
                                            <TablePrev
                                                openVariables={this.getOpenVariables()}
                                                selectedVariable={this.state.selectedVariable}
                                                ref={this.myHypoTableRef}
                                                colorUI={users.colorUI}
                                                className="tableprev"
                                                selectVariable={this.setSelectedVariable}
                                                style={{ overflow: "scroll" }}
                                                onScroll={this.tableScrollHypo}
                                                tableType="scenario"
                                                scenType="hypo"
                                                valueDisplay={this.state.valueDisplay}
                                                calculMere={this.calculMereScenarioPane}
                                                expandAll={(row) => this.expandAll(row, "hypo")}
                                                expandedVariables={expandedVariables}
                                                checkedVariables={checkedVariables}
                                                checkVariable={this.checkVariable}
                                                expand={(row) => this.expand(row, "hypo")}
                                                years={this.state.years}
                                                series={this.state.seriesHypo}
                                                lastYearConstat={this.state.lastYear}
                                                currentDegre={this.state.currentDegre}
                                            />
                                        </div>

                                    </div>

                                    <div className='scenario-tableprev scenario-tableprev-res'>
                                        <h2>Résultats</h2>
                                        <CustomFiltreScenario applyFilter={(value) => this.applyFilter(value, "res")} label="Résultats" className="custom-filtre-scenario-res" data={this.state.resVariables} />
                                        <div className='div-table'>
                                            <TablePrev
                                                openVariables={this.getOpenVariables()}
                                                ref={this.myResTableRef}
                                                colorUI={users.colorUI}
                                                className="tableprev"
                                                onScroll={this.tableScrollRes}
                                                tableType="scenario"
                                                scenType="res"
                                                valueDisplay={this.state.valueDisplay}
                                                expandAll={(row) => this.expandAll(row, "res")}
                                                expandedVariables={expandedVariables}
                                                checkedVariables={checkedVariables}
                                                checkVariable={this.checkVariable}
                                                expand={(row) => this.expand(row, "res")}
                                                years={this.state.years}
                                                series={this.state.seriesRes}
                                                lastYearConstat={this.state.lastYear}
                                                currentDegre={this.state.currentDegre}
                                            />
                                        </div>

                                    </div>

                                    <Form style={{ display: "flex", justifyContent: "space-around" }}>
                                        {degresContent}
                                    </Form>
                                    <ChartPrev parentRef={this.myRef} clearCheckedVariables={this.clearCheckedVariables} name={this.state.name} ref={this.myChartRef} id={this.state.id} labels={this.state.labels} type={"scenario"} checkedVariables={checkedVariables} degre={this.state.currentDegre} getGraphExportOption={this.props.getGraphExportOption} />
                                </Grid.Column>
                                <Grid.Column width={4}>
                                    <Card fluid>
                                        <Card.Content>
                                            <Card.Header>Aide à la prévision</Card.Header>
                                            <Button.Group widths={2}>
                                                <Button size="small" primary onClick={() => this.reconduireVariable()}> Reconduire la variable</Button>
                                                <Button size="small" primary style={{ marginLeft: "7px" }} onClick={() => this.reconduireVariables()}>Reconduire les variables</Button>
                                            </Button.Group>
                                            <Divider />

                                            <AidePrevision setScenarioAtypicalYears={(years) => this.setState({atypicalYears: years})} currentDegre={this.state.currentDegre} filteredFilieres={this.state.filteredFilieres} changeFiliere={(filiere) => this.changeFiliere(true, filiere, undefined)} ref={this.previsionContentRef} optionsFilieres={this.state.optionsFilieres} seriesHypo={this.state.seriesHypo} lastYear={this.state.lastYear} firstYear={this.state.firstYear} years={this.state.years} calculContexte={this.calculContexte} calculerHypothese={this.calculerHypothese} selectedVariable={this.state.selectedVariable} informationError={informationError} calculateAll={this.handleCalculateAll} lastDegreeOpened={this.getTrueDegre(this.state.idxOrigDegre)} getIndexDegre={this.getIndexDegre} idScenario={this.state.id} degresModifies={this.state.degresModifies} updateDegreesModified={this.updateDegreesModifiedCalculateAll} isNationalUser={this.state.userLogin === "ssr70"} degres={this.state.degres} changeDegre={this.selectLastDegre} />


                                        </Card.Content>
                                    </Card>
                                </Grid.Column>
                            </Grid>

                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        scenarios: state.scenarios,
        users: state.users
    };
};

const mapDispatchToProps = dispatch => {
    return {
        doOpenVariable: async (idVariable, idScenario, degre) => dispatch(openScenarioVariable(idVariable, idScenario, degre)),
        deleteScenario: async (idScenario, userId) => dispatch(deleteScenario(idScenario, userId)),
        openScenarioVariableWithChildren: async (idVariable, idScenario, degre) => dispatch(openScenarioVariableWithChildren(idVariable, idScenario, degre)),
        calculMereScenario: async (row, degre) => dispatch(calculMereScenario(row, degre)),
        enregistrerScenario: async (idScenario, userId, serie,shouldShowMess) => dispatch(enregistrerScenario(idScenario, userId, serie,shouldShowMess)),
        changeDegre: async (degre, idScenario) => dispatch(changeDegre(degre, idScenario)),
        reconduireVariable: async (idScenario, varName, vcopie, degre, parent) => dispatch(reconduireVariable(idScenario, varName, vcopie, degre, parent)),
        reconduireVariables: async (idScenario, vcopie, degre,parent) => dispatch(reconduireVariables(idScenario, vcopie, degre,parent)),
        openScenarioVariableWithChildrenMultiple: async (variables, idScenario, degre) => dispatch(openScenarioVariableWithChildrenMultiple(variables, idScenario, degre)),
        calculContexte: async (idScenario, degre,filiere) => dispatch(calculContexte(idScenario, degre,filiere)),
        exportScenario: async (idScenario, degre, variables) => dispatch(exportScenario(idScenario, degre, variables)),
        fetchScenario: async (idScenario, degre, parent, isChangingFiliere) => dispatch(fetchScenario(idScenario, degre, parent, isChangingFiliere)),
        downloadFile: async (fileName) => dispatch(downloadFile(fileName)),
        informationError: async (error) => dispatch(informationError(error)),
        calculateAll: async (idScenario, lastYear, currentDegree, lastDegreeOpen, islastDegree, isNationalUser) => dispatch(calculateAll(idScenario, lastYear, currentDegree, lastDegreeOpen,  islastDegree, isNationalUser))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScenarioPane);