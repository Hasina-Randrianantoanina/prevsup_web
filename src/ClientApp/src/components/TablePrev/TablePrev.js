import React, { useEffect, useRef, useState } from "react";
import './TablePrev.css'
import TrPrev from "./TrPrev/TrPrev";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";

const TablePrev = forwardRef((props, ref) => {

    const { series, years, expand, checkVariable, checkedVariables, expandedVariables, expandAll, calculMere, valueDisplay, tableType, onScroll, selectVariable, lastYearConstat, scenType, colorUI, currentDegre, selectedVariable, openVariables } = props;
    
    const [internalColorUI, setInternalColorUI] = useState(colorUI);
    const [internalSelectedVariable, setInternalSelectedVariable] = useState(selectedVariable);

    const tableRef = useRef(null);

    useImperativeHandle(ref, () => ({

        updateColorUI(newColorUI) {
            setInternalColorUI(newColorUI);
        }
        ,
        updateSelectedVarialbe(variable) {
            setInternalSelectedVariable(variable);
        }
    }));

    const setActive = (idRow) => {
        tableRef.current.querySelectorAll("tr:not(.is-child) td, tr:not(.is-child)").forEach(tr => tr.style.setProperty("background-color", internalColorUI.back, "important"));
        tableRef.current.querySelectorAll("tr.is-child, tr.is-child td, tr.is-child input").forEach(tr => tr.style.backgroundColor = internalColorUI.calcback)
        tableRef.current.querySelectorAll("tr.is-child td:first-child").forEach(tr => tr.style.backgroundColor = internalColorUI.calcback)

        tableRef.current.querySelectorAll(`tr[id='${idRow}'], tr[id='${idRow}'] input, tr[id='${idRow}'] td`).forEach(tr => tr.style.setProperty("background-color", internalColorUI.active, "important"));
    }

    useEffect(() => {
        tableRef.current.querySelectorAll("tr:not(.is-child) td, tr:not(.is-child)").forEach(tr => tr.style.setProperty("background-color", internalColorUI.back, "important"));
        tableRef.current.querySelectorAll("tr.is-child, tr.is-child td, tr.is-child input").forEach(tr => tr.style.backgroundColor = internalColorUI.calcback)
        tableRef.current.querySelectorAll("tr.is-child td:first-child").forEach(tr => tr.style.backgroundColor = internalColorUI.calcback);
        if (internalSelectedVariable && internalSelectedVariable.Name) {
            setActive(internalSelectedVariable.Name);
        }
        if (tableType === "scenario") {
            const indexLastYear = years.indexOf(lastYearConstat);

            for (let i = 0; i <= indexLastYear; i++) {
                tableRef.current.querySelectorAll(`tr:not(.is-child) .data-${i} p`).forEach(el => el.style.setProperty("color", internalColorUI.calcconst, "important"))
                tableRef.current.querySelectorAll(`tr.is-child td p`).forEach(el => el.style.setProperty("color", internalColorUI.constatdata, "important"))
            }
            for (let i = indexLastYear + 1; i < years.length; i++) {
                tableRef.current.querySelectorAll(`tr:not(.is-child) .data-${i} p`).forEach(el => el.style.setProperty("color", internalColorUI.calcscen, "important"))
                tableRef.current.querySelectorAll(`tr:not(.is-child) .data-${i} p`).forEach(el => el.style.setProperty("backgroundColor", internalColorUI.scenback, "important"))
                tableRef.current.querySelectorAll(`tr.is-child td.data-${i} *`).forEach(el => el.style.setProperty("color", internalColorUI.scendata, "important"))
            }

        }

    }, [internalColorUI, series, internalSelectedVariable]);

    let hashCheckedVariables = checkedVariables.reduce(function (map, obj) {
        map[obj.Name] = true;
        return map;
    }, {});

    let hashExpandedVariables = expandedVariables.reduce(function (map, obj) {
        map[obj.Name] = true;
        return map;
    }, {});

    let hashOpenvariables = openVariables ? openVariables.reduce(function(map, obj) {
        map[obj.Name] = true;
        return map;
    },{}): {};

    const style = {
        "resize": "vertical"
    };

    if (tableType === "constat") {
        style["height"] = "500px";
    } else if (tableType == "scenario") {
        style["height"] = "30vh";
    } else if (tableType === "recapitulatif") {
        style["height"] = "40vh";
    }

    useEffect(() => {
        if (lastYearConstat && tableRef.current) {
            // console.log(lastYearConstat)
            const idx = years.indexOf(lastYearConstat) + 2;
            tableRef.current.querySelectorAll(`.table-container tr td:nth-child(${idx})`).forEach(el => el.style.setProperty("border-right", "1px solid " + internalColorUI.separator, "important"))
        }
    })


    return (
        <div onScroll={onScroll} className='table-container' style={style}>
            <table ref={tableRef} cellSpacing="0">
                <thead>
                    <tr>
                        <th>Variable</th>
                        {years.map((year, idx) => <th key={idx}>{year}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {series.map((row) =>
                        <TrPrev lastYearConstat={lastYearConstat} scenType={scenType} selectVariable={selectVariable} setActive={setActive} tableType={tableType} isDefaultExpanded={hashExpandedVariables[row.Name]} valueDisplay={valueDisplay} years={years} calculMere={calculMere} expandAll={expandAll} isDefaultChecked={hashCheckedVariables[row.Name] ? true : false} checkedVariables={checkedVariables} checkVariable={checkVariable} expand={expand} data={row} key={row.Name + "_" + row.Parent + "_" + row.degree} currentDegre={currentDegre} colorUI={colorUI} isDefaultOpened={hashOpenvariables[row.Name]}>
                        </TrPrev>
                    )}
                    {series.length == 0 ? (<tr>
                        <td colSpan={years.length + 1}><p>Pas de données</p></td>
                    </tr>):(<tr style={{display: "none"}}><td></td></tr>)}
                </tbody>
            </table>
        </div>
    );
});

export default TablePrev;