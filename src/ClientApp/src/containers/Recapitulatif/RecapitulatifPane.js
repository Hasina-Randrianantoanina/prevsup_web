import './RecapitulatifPane.css'
import React, { Component } from 'react';
import TablePrev from '../../components/TablePrev/TablePrev';
import { calculMereConstat, closeConstat, deleteConstat, exportConstat, openConstatVariable, openConstatVariableWithChildren, deleteRecap, exportRecap, downloadFile } from '../../actions';

import { connect } from 'react-redux';
import { Button, Grid, MenuItem, Tab } from 'semantic-ui-react';
import LineChart from '../../components/Chart/LineChart';
import ExportModal from '../../components/Export/ExportModal';
import { saveAs } from 'file-saver';
import ChartPrev from '../../components/Chart/ChartPrev';

class RecapitulatifPane extends Component {

    constructor(props) {
        super(props);
        const { recapitulatif } = this.props;
        let openVariables = [];
        let checkedVariables = [];
        let expandedVariables = [];
        let foundRecap = sessionStorage.getItem(recapitulatif.id);
        const fetchedVariables = [];
        // if(foundRecap) {
        //     foundRecap = JSON.parse(foundRecap);
        //     openVariables = foundRecap.openVariables;
        //     checkedVariables = foundRecap.checkedVariables;
        //     expandedVariables = foundRecap.expandedVariables;
        //     // series = foundRecap.series;
        // } else {
        //     recapitulatif["openVariables"] = openVariables;
        //     recapitulatif["checkedVariables"] = checkedVariables;
        //     recapitulatif["expandedVariables"] = expandedVariables;
        //     recapitulatif["series"] = series;
        //     sessionStorage.setItem(recapitulatif.id, JSON.stringify(recapitulatif));
        // }

        recapitulatif.seriesEffectif.forEach(serie => {
            if (serie.child > 0) {
                fetchedVariables.push(serie);
                openVariables.push(serie);
            }
            if (serie.Parent === "Tableau Diplômés LMD" || serie.Parent === "Tableau Effectifs LMD" || serie.Parent === "Tableau Académiques LMD") expandedVariables.push(serie);
        });
        recapitulatif.seriesDiplome.forEach(serie => {
            if (serie.child > 0) {
                fetchedVariables.push(serie);
                openVariables.push(serie);
            }
            if (serie.Parent === "Tableau Diplômés LMD" || serie.Parent === "Tableau Effectifs LMD" || serie.Parent === "Tableau Académiques LMD") expandedVariables.push(serie);
        });
        recapitulatif.seriesAcademie.forEach(serie => {
            if (serie.child > 0) {
                fetchedVariables.push(serie);
                openVariables.push(serie);
            }
            if (serie.Parent === "Tableau Diplômés LMD" || serie.Parent === "Tableau Effectifs LMD" || serie.Parent === "Tableau Académiques LMD") expandedVariables.push(serie);
        });

        this.state = {
            seriesAcademie: recapitulatif.seriesAcademie,
            seriesDiplome: recapitulatif.seriesDiplome,
            seriesEffectif: recapitulatif.seriesEffectif,
            yearEndConstat: recapitulatif.yearEndConstat,
            scenario: recapitulatif.scenario,
            years: recapitulatif.years,
            name: recapitulatif.name,
            id: recapitulatif.id,

            openVariables: openVariables,
            checkedVariables: checkedVariables,
            expandedVariables: expandedVariables,
            labels: recapitulatif.years,
            valueDisplay: "value",
            fetchedVariables: new Set(fetchedVariables),
        }
        this.myRef = React.createRef();
        this.myChartRef = React.createRef();
    }

    componentDidMount() {
    }

    updateChart = () => {
        if (this.myChartRef.current && this.myChartRef.current.updateCheckedVariables)
            this.myChartRef.current.updateCheckedVariables(this.state.checkedVariables);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.seriesAcademie !== nextState.seriesAcademie || this.state.seriesDiplome !== nextState.seriesDiplome || this.state.valueDisplay !== nextState.valueDisplay || this.state.seriesEffectif !== nextState.seriesEffectif || this.state.scenario !== nextState.scenario || this.state.name !== nextState.name || this.state.id !== nextState.id) {
            return true;
        }
        return false;
    }

    expandAll = async (type, row) => {
        // INFO: Check if it is expanded
        const idRow = row.Name;
        let isExpanded = this.state.expandedVariables.find(variable => variable.Name === idRow);

        if (isExpanded) {
            // INFO: Remove expanded and openvariables
            this.removeExpandedChildren(row, type);
        } else {
            const expandedVariablesCopied = [...this.state.expandedVariables];
            expandedVariablesCopied.push(row);
            let series = this.getSeries(type);

            const openVariablesCopied = [...this.state.openVariables];
            openVariablesCopied.push(row);

            const foundChildren = [];
            this.deleteChildren(idRow, series, foundChildren);

            foundChildren.forEach(child => {
                if (child.child > 0) openVariablesCopied.push(child);
            });
            this.showAllChildren(idRow, type);
            // INFO: apply icon
            this.applyIconToTr(idRow, "table-row");
            this.applyIconToChildren(foundChildren, "table-row");

            // INFO: update the state
            this.setState({
                openVariables: openVariablesCopied,
                expandedVariables: expandedVariablesCopied
            }, () => {
            })

        }
    }

    getSeries = (type) => {
        let series = this.state.seriesEffectif;
        if (type === "dip") series = this.state.seriesDiplome;
        else if (type === "aca") series = this.state.seriesAcademie;
        return series;
    }

    removeExpandedChildren = (row, type, cb) => {
        const idRow = row.Name;
        const expandedVariablesCopied = this.state.expandedVariables.filter(variable => {
            return variable.Name !== row.Name;
        });

        this.updateExpandedVariables(expandedVariablesCopied, () => this.removeChildren(idRow, type, () => this.removeOpenVariables(idRow, cb)));
    }

    expand = async (type, row) => {
        // INFO: Check variable is already opened
        let idRow = row.Name;
        let isVariableOpen = this.state.openVariables.find(variable => variable.Name === idRow);
        if (isVariableOpen) {

            let isExpanded = this.state.expandedVariables.find(variable => variable.Name === idRow);
            if (isExpanded) {
                this.removeExpandedChildren(row, type);
            } else {
                this.removeChildren(idRow, type, () => this.removeOpenVariables(idRow));
            }
        } else {
            const series = this.getSeries(type);
            this.showChildren(idRow, series, []);
            // INFO: apply icon
            this.applyIconToTr(idRow, "table-row");

            // INFO: We update the open variables
            let openVariablesCopied = [...this.state.openVariables];
            openVariablesCopied.push(row);
            this.updateOpenVariables(openVariablesCopied);
        }
    }

    updateFetchedVariables = (fetchedVariablesCopied, cb) => {
        this.setState({ fetchedVariables: fetchedVariablesCopied }, () => {
            if (cb) cb();
        });
    }

    showAllChildren = (idRow, type) => {
        const foundChildren = [];
        let series = this.getSeries(type);
        this.getChildren(idRow, series, foundChildren);
        foundChildren.forEach(child => {
            this.myRef.current.querySelector(`tr[id='${child.Name}']`).style.display = "table-row";
            this.showAllChildren(child.Name, type);
        });
    }

    showChildren = (id, data, children) => {
        this.applyIconToTr(id, "table-row");
        this.changeChildrenDisplay(id, data, children, "table-row");
    }

    deleteChildren = (id, data, children) => {
        this.applyIconToTr(id, "none");
        this.changeChildrenDisplay(id, data, children, "none");
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

    changeChildrenDisplay = (id, data, children, type) => {
        for (let iD = 0; iD < data.length; iD++) {
            if (data[iD].Parent === id) {
                children.push(data[iD]);
                this.myRef.current.querySelectorAll(`tr[id='${data[iD].Name}']`).forEach(tr => tr.style.display = type);
                this.deleteChildren(data[iD].Name, data, children);
            }
        }
    }

    getChildren = (id, data, children) => {
        for (let iD = 0; iD < data.length; iD++) {
            if (data[iD].Parent === id) {
                children.push(data[iD]);
            }
        }
    }

    updateSeries = (newSeries, cb) => {
        this.setState({ series: newSeries }, () => {
            // let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
            // foundConstat["series"] = newSeries;
            // sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            if (cb) cb();
        });
    }

    updateOpenVariables = (newOpen, cb) => {
        this.setState({ openVariables: newOpen }, () => {
            // let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
            // foundConstat["openVariables"] = newOpen;
            // sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            if (cb) cb();
        });
    }

    updateExpandedVariables = (newExpanded, cb) => {
        this.setState({ expandedVariables: newExpanded }, () => {
            // let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
            // foundConstat["expandedVariables"] = newExpanded;
            // sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
            if (cb) cb();
        });
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
        this.deleteChildren(idRow, openVariablesCopied, foundChildren);
        openVariablesCopied = openVariablesCopied.filter(variable => {
            let isThere = false;
            foundChildren.forEach(child => {
                if (child.Name === variable.Name) isThere = true;
            })
            return !isThere;
        });
        this.updateOpenVariables(openVariablesCopied, cb);
    }

    removeChildren = (idVariable, type, cb) => {
        // INFO: Get all children
        const foundChildren = [];
        const series = this.getSeries(type);
        this.deleteChildren(idVariable, series, foundChildren);
        if (cb) cb();


    }

    checkVariable = (checked, row) => {
        let checkedVariablesCopied = [...this.state.checkedVariables];
        if (checked) {

            checkedVariablesCopied.push({
                display: row.display,
                Name: row.Name,
                serie: row.serie,
                RealName: row.RealName
            });

        } else {
            checkedVariablesCopied = checkedVariablesCopied.filter(d => {
                return d.Name !== row.Name;
            });
        }

        this.setState({ checkedVariables: checkedVariablesCopied }, () => {
            this.updateChart();
            // let foundConstat = JSON.parse(sessionStorage.getItem(this.state.id));
            // foundConstat["checkedVariables"] = checkedVariablesCopied;
            // sessionStorage.setItem(this.state.id, JSON.stringify(foundConstat));
        });
    }

    exportVariables = async (type) => {
        const authUser = JSON.parse(sessionStorage.getItem("user"));
        const { exportRecap, downloadFile } = this.props;
        const result = await exportRecap(this.state.name, type, authUser.id);
        const path = result.data;
        const blob = await downloadFile(path);

        saveAs(blob, path);

    }

    calculMereRecapShouldNotWork = (row) => {
        // INFO: it should not work in recapitulatif
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

    deleteRecap = () => {
        const { deleteRecap } = this.props;
        const userId = JSON.parse(sessionStorage.getItem("user")).id;
        if (window.confirm('Voulez-vous vraiment supprimer ce tableau récapitulatif ?')) {
            deleteRecap(this.state.name, this.state.id, userId);
        }
    }

    shouldSeeAcademiePane = () => {
        const user = JSON.parse(sessionStorage.getItem("user"));
        if (user.login === "ssr70") return true;
        return false;
    }

    clearCheckedVariables = () => {
        this.setState({checkedVariables: []});
    }

    render() {
        // console.log("rendering");
        const { checkedVariables, expandedVariables } = this.state;
        const { users } = this.props;

        const dataChart = [];
        if (checkedVariables.length > 0) {
            checkedVariables.forEach(checked => {
                dataChart.push({
                    label: checked.Name,
                    data: checked.serie
                })
            });
        }

        const panes = [{
            menuItem: <MenuItem key={1}><div>Projection effectifs LMD</div></MenuItem>,
            pane: <Tab.Pane key={4}>
                <div key={1} style={this.headStyle()}>
                    <div>
                        <Button onClick={() => this.deleteRecap()} color='red'>Supprimer</Button>
                        <Button onClick={() => this.exportVariables("eff")} primary>Exporter</Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <p style={{ marginRight: "7px" }}>Affichage par:</p>
                        <Button.Group>
                            <Button className={this.state.valueDisplay === "value" ? 'button-display-value': ''} active={this.state.valueDisplay === "value"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("value")}>Valeur</Button>
                            <Button className={this.state.valueDisplay === "diff" ? 'button-display-value': ''} active={this.state.valueDisplay === "diff"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("diff")}>Différence</Button>
                            <Button className={this.state.valueDisplay === "rate" ? 'button-display-value': ''} active={this.state.valueDisplay === "rate"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("rate")}>Taux d'évolution</Button>
                        </Button.Group>
                    </div>
                </div>
                <div className='recap-tableprev'>
                    <TablePrev
                        openVariables={this.state.openVariables}
                        colorUI={users.colorUI}
                        tableType="recapitulatif"
                        valueDisplay={this.state.valueDisplay}
                        calculMere={this.calculMereRecapShouldNotWork}
                        expandAll={(row) => this.expandAll("eff", row)}
                        expandedVariables={expandedVariables}
                        checkedVariables={checkedVariables}
                        checkVariable={this.checkVariable}
                        expand={(row) => this.expand("eff", row)}
                        years={this.state.years}
                        series={this.state.seriesEffectif}
                        lastYearConstat={this.state.yearEndConstat}
                    />
                </div>
            </Tab.Pane>
        }, {
            menuItem: <MenuItem key={2}><div>Projection diplômés LMD</div></MenuItem>,
            pane: <Tab.Pane key={5}>
                <div key={1} style={this.headStyle()}>
                    <div>
                        <Button onClick={() => this.deleteRecap(this.state.name, this.state.id)} color='red'>Supprimer</Button>
                        <Button onClick={() => this.exportVariables("dip")} primary>Exporter</Button>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <p style={{ marginRight: "7px" }}>Affichage par:</p>
                        <Button.Group>
                            <Button className={this.state.valueDisplay === "value" ? 'button-display-value': ''} active={this.state.valueDisplay === "value"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("value")}>Valeur</Button>
                            <Button className={this.state.valueDisplay === "diff" ? 'button-display-value': ''}  active={this.state.valueDisplay === "diff"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("diff")}>Différence</Button>
                            <Button className={this.state.valueDisplay === "rate" ? 'button-display-value': ''}  active={this.state.valueDisplay === "rate"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("rate")}>Taux d'évolution</Button>
                        </Button.Group>
                    </div>
                </div>
                <div className='recap-tableprev'>
                    <TablePrev
                        openVariables={this.state.openVariables}
                        colorUI={users.colorUI}
                        tableType="recapitulatif"
                        valueDisplay={this.state.valueDisplay}
                        calculMere={this.calculMereRecapShouldNotWork}
                        expandAll={(row) => this.expandAll("dip", row)}
                        expandedVariables={expandedVariables}
                        checkedVariables={checkedVariables}
                        checkVariable={this.checkVariable}
                        expand={(row) => this.expand("dip", row)}
                        years={this.state.years}
                        series={this.state.seriesDiplome}
                        lastYearConstat={this.state.yearEndConstat}
                    />
                </div>
            </Tab.Pane>
        }];

        if (this.shouldSeeAcademiePane()) {
            panes.push({
                menuItem: <MenuItem key={3}><div>Projection académies LMD</div></MenuItem>,
                pane: <Tab.Pane key={6}>
                    <div key={1} style={this.headStyle()}>
                        <div>
                            <Button onClick={() => this.deleteRecap(this.state.name, this.state.id)} color='red'>Supprimer</Button>
                            <Button onClick={() => this.exportVariables("acc")} primary>Exporter</Button>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <p style={{ marginRight: "7px" }}>Affichage par:</p>
                            <Button.Group>
                                <Button className={this.state.valueDisplay === "value" ? 'button-display-value': ''} active={this.state.valueDisplay === "value"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("value")}>Valeur</Button>
                                <Button className={this.state.valueDisplay === "diff" ? 'button-display-value': ''}  active={this.state.valueDisplay === "diff"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("diff")}>Différence</Button>
                                <Button className={this.state.valueDisplay === "rate" ? 'button-display-value': ''}  active={this.state.valueDisplay === "rate"} style={{ marginLeft: "7px" }} onClick={() => this.setValueDisplay("rate")}>Taux d'évolution</Button>
                            </Button.Group>
                        </div>
                    </div>
                    <div className='recap-tableprev'>
                        <TablePrev
                            openVariables={this.state.openVariables}
                            colorUI={users.colorUI}
                            tableType="recapitulatif"
                            valueDisplay={this.state.valueDisplay}
                            calculMere={this.calculMereRecapShouldNotWork}
                            expandAll={(row) => this.expandAll("aca", row)}
                            expandedVariables={expandedVariables}
                            checkedVariables={checkedVariables}
                            checkVariable={this.checkVariable}
                            expand={(row) => this.expand("aca", row)}
                            years={this.state.years}
                            series={this.state.seriesAcademie}
                            lastYearConstat={this.state.yearEndConstat}
                        />
                    </div>
                </Tab.Pane>

            });
        }

        return (
            <div ref={this.myRef} className='recap-pane'>
                <div>
                    {/*Modal Open Export*/}
                </div>
                {/* <div>Récapitulatif: {this.state.name}</div> */}

                <Tab menu={{ attached: 'bottom' }} renderActiveOnly={false} panes={panes} />
                <ChartPrev parentRef={this.myRef} clearCheckedVariables={this.clearCheckedVariables} name={this.state.name} ref={this.myChartRef} id={this.state.id} type="recap" scenarioName={this.state.scenario.name} labels={this.state.labels} checkedVariables={checkedVariables} getGraphExportOption={this.props.getGraphExportOption} />
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
        exportRecap: async (name, type, userId) => dispatch(exportRecap(name, type, userId)),
        openConstatVariableWithChildren: async (idVariable, idConstat) => dispatch(openConstatVariableWithChildren(idVariable, idConstat)),
        calculMereConstat: async (row) => dispatch(calculMereConstat(row)),
        deleteRecap: async (recapName, idRecap, userId) => dispatch(deleteRecap(recapName, idRecap, userId)),
        downloadFile: async (fileName) => dispatch(downloadFile(fileName))

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RecapitulatifPane);