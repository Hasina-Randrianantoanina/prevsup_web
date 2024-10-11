import './ConstatPane.css'
import React, { Component } from 'react';
import TablePrev from '../../components/TablePrev/TablePrev';
import { calculMereConstat, deleteConstat, exportConstat, openConstatVariable, openConstatVariableWithChildren, enregistrerConstat, downloadFile } from '../../actions';

import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import ExportModal from '../../components/Export/ExportModal';
import { saveAs } from 'file-saver';
import ChartPrev from '../../components/Chart/ChartPrev';

class ConstatPane extends Component {

    constructor(props) {
        super(props);
        const { constat, users } = this.props;
        let openVariables = [];
        let checkedVariables = [];
        let series = constat.series;
        let expandedVariables = [];
        let foundConstat = sessionStorage.getItem(constat.id);


        if (foundConstat) {
            // foundConstat = JSON.parse(foundConstat);
            // openVariables = foundConstat.openVariables;
            // checkedVariables = foundConstat.checkedVariables;
            // expandedVariables = foundConstat.expandedVariables;
            // series = foundConstat.series;
        } else {
            constat["openVariables"] = openVariables;
            constat["checkedVariables"] = checkedVariables;
            constat["expandedVariables"] = expandedVariables;
            // constat["series"] = series;
            sessionStorage.setItem(constat.id, JSON.stringify(constat));
        }

        this.state = {
            series: series,
            years: constat.years,
            name: constat.name,
            id: constat.id,
            openVariables: openVariables,
            checkedVariables: checkedVariables,
            expandedVariables: expandedVariables,
            labels: constat.years,
            isExportOpen: false,
            valueDisplay: "value",
            active1: true,
            active2: false,
            active3: false,
            fetchedVariables: new Set([]),
            firstExpandedVariables: new Set([]),
        }
        this.myRef = React.createRef();
        this.myChartRef = React.createRef();
        this.myTableRef = React.createRef();
    }

    componentDidMount() {
        // TODO: Fetch all expandedVariables
    }

    // BEGIN - TreeView
    updateChart = () => {
        if (this.myChartRef.current && this.myChartRef.current.updateCheckedVariables)
            this.myChartRef.current.updateCheckedVariables(this.state.checkedVariables);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.myTableRef && this.myTableRef.current.updateColorUI && nextProps.users && nextProps.users.colorUI) {
            this.myTableRef.current.updateColorUI(nextProps.users.colorUI);
        }
        const { users } = this.props;
        if (this.state.series !== nextState.series || this.state.valueDisplay !== nextState.valueDisplay || this.state.isExportOpen !== nextState.isExportOpen || nextProps.users.colorUI !== users.colorUI) {
            return true;
        }
        return false;
    }

    expandAll = async (row) => {
        // INFO: Check if it is expanded
        const idRow = row.Name;
        let isExpanded = this.state.expandedVariables.find(variable => variable.Name === idRow);

        if (isExpanded) {
            // INFO: Remove expanded and openvariables
            this.removeExpandedChildren(row);
        } else {
            const isVariableFetched = Array.from(this.state.fetchedVariables).find(variable => variable.Name === idRow);
            let isFirstExpanded = Array.from(this.state.firstExpandedVariables).find(variable => variable.Name === idRow);

            const expandedVariablesCopied = [...this.state.expandedVariables];
            expandedVariablesCopied.push(row);

            const openVariablesCopied = [...this.state.openVariables];
            openVariablesCopied.push(row);

            if (isFirstExpanded) {
                const foundChildren = [];
                this.deleteChildren(idRow, idRow, this.state.series, foundChildren);
                foundChildren.forEach(child => {
                    if (child.child > 0) openVariablesCopied.push(child);
                });
                this.showAllChildren(idRow, idRow);

                // INFO: Apply icon
                this.applyIconToTr(idRow, "table-row");
                this.applyIconToChildren(foundChildren, "table-row");

                // INFO: update the state
                this.setState({
                    openVariables: openVariablesCopied,
                    expandedVariables: expandedVariablesCopied
                }, () => {
                    let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
                    foundConstat["openVariables"] = openVariablesCopied;
                    foundConstat["expandedVariables"] = expandedVariablesCopied;
                    sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
                })
            } else {
                const foundChildren = [];
                // INFO: We remove children of variable
                this.getChildren(idRow, this.state.series, foundChildren);
                const notChildren = this.state.series.filter(d => {
                    let isChild = false;
                    for (let iC = 0; iC < foundChildren.length; iC++) {
                        if (foundChildren[iC].Name === d.Name) {
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
                const { openConstatVariableWithChildren } = this.props;
                const result = await openConstatVariableWithChildren(row.Name, this.state.id);
                const idxVariable = this.findIdxVariable(idRow);

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
                this.setState({
                    series: notChildren,
                    openVariables: openVariablesCopied,
                    fetchedVariables: fetchedVariablesCopied,
                    firstExpandedVariables: firstExpandedVariablesCopied,
                    expandedVariables: expandedVariablesCopied
                }, () => {
                    let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
                    foundConstat["openVariables"] = openVariablesCopied;
                    // foundConstat["series"] = notChildren;
                    foundConstat["expandedVariables"] = expandedVariablesCopied;
                    sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
                    
                    this.showAllChildren(idRow, idRow);
                    // INFO: Apply Icon:
                    this.applyIconToTr(idRow, "table-row");
                    this.applyIconToChildren(foundChildren, "table-row");
                });
            }
        }

    }

    removeExpandedChildren = (row, cb) => {
        const idRow = row.Name;
        const expandedVariablesCopied = this.state.expandedVariables.filter(variable => {
            return variable.Name !== row.Name;
        });


        let openVariablesCopied = this.state.openVariables.filter(variable => variable.Name !== idRow);
        // INFO: Remove Children of idRow if any is open and hide children too
        const foundChildren = [];
        this.deleteChildren(idRow, idRow, this.state.series, foundChildren);
        openVariablesCopied = openVariablesCopied.filter(variable => {
            let isThere = false;
            foundChildren.forEach(child => {
                if (child.Name === variable.Name) isThere = true;
            })
            return !isThere;
        });

        // INFO: Update the state
        this.setState(
            {
                expandedVariables: expandedVariablesCopied,
                openVariables: openVariablesCopied
            }, () => {
                let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
                foundConstat["expandedVariables"] = expandedVariablesCopied;
                foundConstat["openVariables"] = openVariablesCopied;
                sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            });

    }

    expand = async (row) => {
        // INFO: Check variable is already opened
        let idRow = row.Name;
        let isVariableOpen = this.state.openVariables.find(variable => variable.Name === idRow);
        if (isVariableOpen) {

            let isExpanded = this.state.expandedVariables.find(variable => variable.Name === idRow);
            if (isExpanded) {
                this.removeExpandedChildren(row);
            } else {
                this.hideChildren(idRow, () => this.removeOpenVariables(idRow));
            }
        } else {
            let isVariableFetched = Array.from(this.state.fetchedVariables).find(variable => variable.Name === idRow);

            // INFO: We update the open variables
            let openVariablesCopied = [...this.state.openVariables];
            openVariablesCopied.push(row);

            if (isVariableFetched) {
                this.showChildren(idRow, this.state.series, []);

                // INFO: Update the State
                this.setState({ openVariables: openVariablesCopied }, () => {
                    let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
                    foundConstat["openVariables"] = openVariablesCopied;
                    sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
                });
            } else {
                const { doOpenVariable } = this.props;
                const result = await doOpenVariable(row.Name, row.IdParent)

                const children = result.data;
                children.forEach(child => {
                    child["Level"] = row.Level + 1;
                });
                // // INFO: We update the Data
                const dataCopied = [...this.state.series];
                let idxVariable = this.findIdxVariable(idRow);
                // INFO: Add children next to the parent
                if (children.length > 0) dataCopied.splice(idxVariable + 1, 0, ...children);


                const fetchedVariablesCopied = new Set(this.state.fetchedVariables);
                fetchedVariablesCopied.add(row);

                // INFO: Apply Icon
                this.applyIconToTr(idRow, "table-row");

                // INFO: Update the State
                this.setState({
                    openVariables: openVariablesCopied,
                    series: dataCopied,
                    fetchedVariables: fetchedVariablesCopied
                }, () => {
                    let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
                    foundConstat["openVariables"] = openVariablesCopied;
                    // foundConstat["series"] = dataCopied;
                    sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
                });
            }
        }
    }

    showAllChildren = (idRowParent, idRow) => {
        const foundChildren = [];
        this.getChildren(idRow, this.state.series, foundChildren);
        foundChildren.forEach(child => {
            this.myRef.current.querySelector(`tr[id='${idRowParent}'] ~ tr[id='${child.Name}']`).style.display = "table-row";
            this.showAllChildren(idRowParent, child.Name);
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
            if (data[iD].Parent === id) {
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

    findIdxVariable = (idVariable) => {
        let idxVariable = -1;

        for (let iD = 0; iD < this.state.series.length; iD++) {
            if (this.state.series[iD].Name === idVariable) {
                idxVariable = iD;
                break;
            }
        }
        return idxVariable;
    }

    removeOpenVariables = (idRow, cb) => {
        let openVariablesCopied = this.state.openVariables.filter(variable => variable.Name !== idRow);
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
        this.setState({ openVariables: openVariablesCopied }, () => {
            let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
            foundConstat["openVariables"] = openVariablesCopied;
            sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            if (cb) cb();
        });
    }

    hideChildren = (idVariable, cb) => {
        // INFO: Get all children
        const foundChildren = [];
        this.getAllChildren(idVariable, this.state.series, foundChildren);

        let ids = foundChildren.join(",")
        this.myRef.current.querySelectorAll(ids).forEach(el => el.style.display = "none");

        if (cb) cb();
    }

    checkVariable = (checked, row) => {
        let checkedVariablesCopied = [...this.state.checkedVariables];
        if (checked) {
            const { constats } = this.props;
            // TODO: need to check before accessing indexes
            const aide = constats.proprietes.aides.$values.filter(x => x.Variable.includes(row.RealName.split("_")[0]));
            const aideXml = constats.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable)).length>0 ? constats.proprietes.aidesXml[1].$values.filter(x => row.Name.startsWith(x.Variable))[0] : {Definition:`Propriété de la variable ${row.Name}`,Variable:'empty'};
            
            
            
            const formule = constats.proprietes.formules.$values.filter(x => x.Variable.includes(row.RealName.split("_")[0]));
            let filiere = constats.proprietes.filieres.$values.filter(x => x.indice.includes(row.RealName.split("_")[2]));
            let J="";
            let I="";
            if(row.Name!=="" && row.Name.includes("_JI")){
                I=row.RealName.split(',')[row.RealName.split(',').length-1];
                J=row.RealName.split(',')[0].split('_')[row.RealName.split(',')[0].split('_').length-1]
                if(row.Name.includes('1:9')) {
                    filiere = constats.proprietes.filieres.$values.filter(x => x.description == "Ensemble" || x.description == "ensemble");
                }
                else filiere = constats.proprietes.filieres.$values.filter(x => x.indice == 'I'+I || x.indice == I || x.indice.includes(J));
            }
            else if (row.RealName.split("_")[row.RealName.split("_").length-1] == "IJ") filiere = constats.proprietes.filieres.$values.filter(x => x.description == "Ensemble" || x.description == "ensemble");
            else if (row.RealName.split("_")[row.RealName.split("_").length-1] == "I" || !row.RealName.includes(',')) filiere = row.RealName.split("_")[row.RealName.split("_").length-1] == "I"? constats.proprietes.filieres.$values.filter(x => x.indice=='I1:9'):
                constats.proprietes.filieres.$values.filter(x => x.indice=='I'+row.RealName.split("_")[row.RealName.split("_").length-1] || x.indice==row.RealName.split("_")[row.RealName.split("_").length-1])
            else filiere = constats.proprietes.filieres.$values.filter(x => x.indice == 'I' + row.RealName.split(",")[0].split("_")[row.RealName.split(",")[0].split("_").length-1] || x.indice == row.RealName.split(",")[0].split("_")[row.RealName.split(",")[0].split("_").length-1] || x.indice.includes(row.RealName.split(",")[1]));
            
            let txtAide = "", txtFiliere = "", txtFormule = "", textDefinitionFromXML="", textFormuleFromXML= "" , textLinkFromXML= "", textVariableFromXML= "" ;
            if (aide.length > 0) {
                let definition = aide[0].Definition;
                let deg = row.RealName.split("_")[1].split("")[1];
                if (definition.includes("{0}")) definition = definition.replaceAll("{0}", deg);
                if (definition.includes("{0} + 1")) definition = definition.replaceAll("{0} + 1", deg + 1);
                txtAide = `${row.RealName}: ${definition}`;
            }
            if (formule.length > 0) txtFormule = `${row.RealName}: ${formule[0].FConstat}`;
            let resultatFiliere = "";
            if (filiere.length > 0) {

                for (let i = 0; i < filiere.length; i++) {
                    resultatFiliere = resultatFiliere + filiere[i].nomfiliere + ":" + filiere[i].description + "+";
                }
                txtFiliere = `${resultatFiliere}`
                
                if(txtFiliere.charAt(0)==="J" && resultatFiliere.split('+').length>2) txtFiliere=resultatFiliere.split('+')[1]+"+"+resultatFiliere.split('+')[0]
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
                textDefinitionFromXML: aideXml.Definition,
                textFormuleFromXML: aideXml.Formule,
                textLinkFromXML: aideXml.Link ? aideXml.Link :"",
                textVariableFromXML: aideXml.Variable
            });
            // console.log(checkedVariablesCopied)


        } else {
            checkedVariablesCopied = checkedVariablesCopied.filter(d => {
                return d.Name !== row.Name;
            });
        }

        this.setState({ checkedVariables: checkedVariablesCopied }, () => {
            let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
            foundConstat["checkedVariables"] = checkedVariablesCopied;
            sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            this.updateChart();
        });
    }

    calculMereConstatPane = (row) => {
        const { calculMereConstat, constats } = this.props;

        calculMereConstat(row).then((result) => {
            if (result.data.length == 0) { return; }
            const idxYear = this.state.years.indexOf(result.data[0].year);
            const hashRes = Object.assign({}, ...result.data.map((x) => ({ [x.Variable]: x.Value })));
            const seriesCopied = [...this.state.series];
            seriesCopied.forEach(variable => {

                // INFO: We update the variables that are returned by calculMeres
                if (hashRes[variable.Name] || hashRes[variable.Name] === 0) {
                    const serieCopied = [...variable.serie];
                    serieCopied[idxYear] = hashRes[variable.Name];
                    variable.serie = serieCopied;
                }
            });

            this.setState({ series: seriesCopied }, () => {
                // let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
                // foundConstat["series"] = seriesCopied;
                // sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            });
        })

    }
    // END - TreeView

    setExportOpen = (value) => {
        this.setState({ isExportOpen: value });
    }

    exportVariables = async (variablesToExport) => {
        this.setExportOpen(false);
        let idVariables = "";
        variablesToExport.forEach(variable => idVariables += variable.RealName + ";"); // TODO: When we change this to variable.Name, an error occured
        if (idVariables.length > 0) idVariables = idVariables.substring(0, idVariables.length - 1);

        const { exportConstat, downloadFile } = this.props;
        const result = await exportConstat(this.state.id, idVariables);
        const { Path, Filename } = result.data;
        const blob = await downloadFile(Path);

        saveAs(blob, Filename);
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

    deleteConstat = () => {
        const { deleteConstat } = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        if (window.confirm('Voulez-vous vraiment supprimer ce constat?')) {
            deleteConstat(this.state.id, userId);
        }

    }

    enregistrerConstat = () => {
        const { enregistrerConstat } = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        enregistrerConstat(this.state.id, userId);
    }

    clearCheckedVariables = () => {
        this.setState({checkedVariables: []});
    }

    render() {

        const { checkedVariables, expandedVariables, openVariables } = this.state;
        const { constats, users } = this.props;

        const dataChart = [];
        let txtAide = "", txtFiliere = "", txtFormule = "";
        if (checkedVariables.length > 0) {
            const currentChecked = checkedVariables[checkedVariables.length - 1];
            txtAide = currentChecked.txtAide;
            txtFiliere = currentChecked.txtFiliere;
            txtFormule = currentChecked.txtFormule;
            checkedVariables.forEach(checked => {
                dataChart.push({
                    label: checked.Name,
                    data: checked.serie
                })
            });
        }
        // console.log(users.colorUI)
        return (
            <div ref={this.myRef} className='constat-pane'>
                <div>
                    {/*Modal Open Export*/}
                    <ExportModal setExportOpen={this.setExportOpen} isExportOpen={this.state.isExportOpen} variables={constats.constatVariables} exportVariables={this.exportVariables} />
                </div>
                {/* <div>Constat: {this.state.name}</div> */}
                <div style={this.headStyle()}>
                    <div>
                        <Button onClick={() => this.enregistrerConstat()} primary >Enregistrer</Button>
                        <Button onClick={() => this.deleteConstat()} color='red'>Supprimer</Button>
                        <Button onClick={() => this.setExportOpen(true)} primary>Exporter</Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <p style={{ marginRight: "7px" }}>Affichage par:</p>
                        <Button.Group>
                            <Button className={this.state.active1 ? 'button-display-value': ''} style={{ marginLeft: "7px" }} active={this.state.active1} onClick={() => { this.setValueDisplay("value"); this.setState({ active1: true, active2: false, active3: false }) }}>Valeur</Button>
                            <Button className={this.state.active2 ? 'button-display-value': ''} style={{ marginLeft: "7px" }} active={this.state.active2} onClick={() => { this.setValueDisplay("diff"); this.setState({ active2: true, active1: false, active3: false }) }}>Différence</Button>
                            <Button className={this.state.active3 ? 'button-display-value': ''} style={{ marginLeft: "7px" }} active={this.state.active3} onClick={() => { this.setValueDisplay("rate");; this.setState({ active3: true, active2: false, active1: false }) }}>Taux d'évolution</Button>
                        </Button.Group>
                    </div>
                </div>
                <div className='constat-tableprev'>
                
                <TablePrev
                    openVariables={openVariables}
                    ref={this.myTableRef}
                    colorUI={users.colorUI}
                    tableType="constat"
                    valueDisplay={this.state.valueDisplay}
                    calculMere={this.calculMereConstatPane}
                    expandAll={this.expandAll}
                    expandedVariables={expandedVariables}
                    checkedVariables={checkedVariables}
                    checkVariable={this.checkVariable}
                    expand={this.expand}
                    years={this.state.years}
                    series={this.state.series}
                />
                </div>
                
                <ChartPrev parentRef={this.myRef} clearCheckedVariables={this.clearCheckedVariables} name={this.state.name} ref={this.myChartRef} id={this.state.id} labels={this.state.labels} type={"constat"} checkedVariables={checkedVariables} getGraphExportOption={this.props.getGraphExportOption} />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        constats: state.constats,
        users: state.users
    };
};

const mapDispatchToProps = dispatch => {
    return {
        doOpenVariable: async (idVariable, idConstat) => dispatch(openConstatVariable(idVariable, idConstat)),
        deleteConstat: async (idConstat, userId) => dispatch(deleteConstat(idConstat, userId)),
        // fetchVariables: async () => dispatch(fetchVariables()),
        // fetchInit: async () => dispatch(fetchInit())
        exportConstat: async (idConstat, variables) => dispatch(exportConstat(idConstat, variables)),
        openConstatVariableWithChildren: async (idVariable, idConstat) => dispatch(openConstatVariableWithChildren(idVariable, idConstat)),
        calculMereConstat: async (row) => dispatch(calculMereConstat(row)),
        enregistrerConstat: async (idConstat, userId) => dispatch(enregistrerConstat(idConstat, userId)),
        downloadFile: async (fileName) => dispatch(downloadFile(fileName))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ConstatPane);