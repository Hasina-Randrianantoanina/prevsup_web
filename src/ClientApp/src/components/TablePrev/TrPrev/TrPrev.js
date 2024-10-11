import React, { useEffect } from "react";
import { useState, useRef } from "react";
import { Checkbox, Icon } from 'semantic-ui-react'
import './TrPrev.css';
import Utils from "../../../services/utils";

export function formatNumber(index, numb, serie, valueDisplay, type, display, idRow, tableType) { // type = Sum, Data, Calc // Display = Percent, Float, Hide, HideAll

  if (display === "Hide") {
    return "-";
  }
  let result = numb;
  if (!result) return result;
  if (typeof result === "string") result = parseFloat(result.replace(",", "."));
  
  if (valueDisplay === "diff") {
    if (index == 0) { return "0"; }
    if (display === "Percent") {
      const calc = ((serie[index] ? serie[index] : 0) - (serie[index - 1] ? serie[index - 1] : 0));
      const diff = Intl.NumberFormat('fr-FR').format(calc.toFixed(2));
      return diff + "%";
    }
    let diff = (serie[index] ? serie[index] : 0) - (serie[index - 1] ? serie[index - 1] : 0);
    if(Math.abs(diff) < 0.001) {
        diff = 0.00;
    }
    return getFormatedNumb(diff, type, idRow, tableType);
  } else if (valueDisplay === "rate") {
    if (index == 0) { return "0"; }
    if (serie[index - 1] === 0 || serie[index - 1] === undefined || serie[index - 1] === null) return "0";
    const rate = (((serie[index] ? serie[index] : 0) - (serie[index - 1] ? serie[index - 1] : 0)) / (serie[index - 1] && serie[index - 1] > 0 ? serie[index - 1] : 1)) * 100;
    return Intl.NumberFormat('fr-FR').format(rate.toFixed(2)) + "%";
  }

  // if (display === "Percent" && valueDisplay === "value") result *= 100;
  if (display === "Percent") result = Intl.NumberFormat('fr-FR').format(Number(result).toFixed(2))
  else {
    if(idRow && idRow.startsWith("ANCBAC_")) {
      result = Intl.NumberFormat('fr-FR').format(Number(result).toFixed(2))
    }
    else result = getFormatedNumb(result, type, idRow, tableType);
  }
  if (display === "Percent" && valueDisplay === "value") {
    result = result + "%";
  }

  return result;
}

function getFormatedNumb(result, type, idRow, tableType) {
    const utils = new Utils();
    if(utils.isValidNumber(result)) {
      if((type !== "Calc" && type !== "Sum") || idRow.includes("ANCINSC")) {
        result = parseFloat(result.toFixed(2));
      }
      else result = parseFloat(result.toFixed(0)).toLocaleString('en').replaceAll(',', ' ');

      if(tableType === "recapitulatif" || tableType === "constat" ||tableType === "scenario") {
        if(typeof result == "number") {
            if (result >999) result = parseFloat(result.toFixed(0)).toLocaleString('en').replaceAll(',', ' ');
        }
      }
    }
    
    return result;
}





const TrPrev = (props, ref) => {

  const { tableType, data, expand, checkVariable, isDefaultChecked, expandAll, isDefaultExpanded, calculMere, years, valueDisplay, setActive, selectVariable, scenType, lastYearConstat, currentDegre, colorUI, isDefaultOpened } = props;
  const [internalColorUI, setInternalColorUI] = useState(colorUI);
  const strSeries = [];
  data.serie.forEach(serie => {
    const trueSerie = data.display !== "Percent" ? serie : (serie * 100);
    strSeries.push(trueSerie);
  })
  const initFocused = [];
  data.serie.forEach(serie => initFocused.push(false));
  const isExpandValue = (isDefaultExpanded ? isDefaultExpanded : false);
  const isCheckValue = (isDefaultChecked ? isDefaultChecked : false);
  const indexLastYear = years.indexOf(lastYearConstat);
  const isOpenValue = (isDefaultOpened ? isDefaultOpened : false);

  const [isChecked, setChecked] = useState(isCheckValue);
  const [isExpanded, setExpanded] = useState(isExpandValue);
  const [isOpen, setOpen] = useState(isOpenValue);
  const tableRef = useRef(null);
  const [internalSeries, setInternalSeries] = useState(strSeries);
  const [areFocused, setFocused] = useState(initFocused);
  const [isEnterFired, setEnterFired] = useState(false);
  let trClassName = data.child === 0 ? "is-child" : "";
  
  useEffect(() => {
    const strSeries = [];
    data.serie.forEach(serie => {
      const trueSerie = data.display !== "Percent" ? serie : (serie * 100);
      strSeries.push(trueSerie);
    })
    setInternalSeries(strSeries);
  }, [data.serie]);

  useEffect(() => {
    const isOpenValue = (isDefaultOpened ? isDefaultOpened : false);
    setOpen(isOpenValue);
  }, [isDefaultOpened]);

  useEffect(() => {
    const isExpandValue = (isDefaultExpanded ? isDefaultExpanded : false);
    setExpanded(isExpandValue)
  }, [isDefaultExpanded])

  const className = `tr-${data.Level}`;
  let isParent = false;

  const firstTdStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  };

  if (tableType === "constat") {
    isParent = data.Parent === "Constat" ? true : false;
  } else if (tableType === "scenario") {
    isParent = (data.Parent === "Resultats" || data.Parent === "Hypotheses" || data.Root === "Resultats" || data.Root === "Hypotheses") ? true : false;
    if (isParent) {
      if (data.child <= 0) isParent = false;
    }
  } else if (tableType === "recapitulatif") {
    firstTdStyle["fontSize"] = "10px";
    firstTdStyle["textTransform"] = "capitalize";
    if (data.Parent === "Tableau Diplômés LMD" || data.Parent === "Tableau Effectifs LMD" || data.Parent === "Tableau Académiques LMD") isParent = true;

    if (isParent && data.child == 0) isParent = false;
  }

  const checking = () => {
    let newVal = !isChecked;
    setChecked(newVal);
    if (data.Name !== "EFF") {
      checkVariable(newVal, data)
    } else {
      const copiedData = { ...data };
      checkVariable(newVal, copiedData);
    }

  }

  const updateInternalSeries = (event, idx) => {

    const internalSeriesCopied = [...internalSeries];
    let value = event.target.value; //.replace(/\s/g, '').replace(/,/g, '.');
    if (value.length === 0) value = "";
    if (value.match(/^([0-9]{1,})?([,\.])?([0-9]{1,})?$/)) {
      internalSeriesCopied[idx] = value;
      setInternalSeries(internalSeriesCopied);
    }
  }

  const expandAllTr = (data, val) => {
    setExpanded(val);
    expandAll(data);
  }

  const expandTr = (data,) => {
    if (data.child > 0) {
      setExpanded(false);
      expand(data);
    }

  }

  let contentExpanded = (<Icon style={{ visibility: 'hidden' }} size="small" />);
  let contentOpen = (<div></div>);
  if (data.Name === "EFF") {
    //INFO: We do nothing
  }
  else if (isParent && isExpanded) {
    contentExpanded = (<Icon onClick={() => expandAllTr(data, false)} size="small" name='minus' />);
  } else if (isParent && (isExpanded === false)) {
    contentExpanded = (<Icon onClick={() => expandAllTr(data, true)} size="small" name='plus' />);
  }

  if (data.child > 0 && isOpen) {
    contentOpen = (<Icon name="triangle down" />);
  } else if (data.child > 0 && !isOpen) {
    contentOpen = (<Icon name="triangle right" />);
  }

  let inputProps = {
  };

  if (valueDisplay !== "value") inputProps["readOnly"] = true;

  const handleClick = (variable) => {
    setActive(variable.Name);
    if (selectVariable) selectVariable(variable);
  }

  const handleFocus = (event, idx) => {
    const copiedFocused = [...areFocused];
    copiedFocused[idx] = true;
    setFocused(copiedFocused);
  }

  const handleKeyPress = (event, index) => {
    if (event.key === 'Enter') {
      setEnterFired(true);
      launchCalcul(event, index);
      setTimeout(() => {
        event.target.blur(); // INFO: Inapropriate since it fires onblur event 
      }, 100);
    }
  }

  const inputValueChanged = (event, index) => {
    if (isEnterFired) {
      setEnterFired(false);
      return;
    }
    launchCalcul(event, index);
  }

  const launchCalcul = (event, index) => {
    const copiedFocused = [...areFocused];
    copiedFocused[index] = false;
    setFocused(copiedFocused)
    let value = internalSeries[index];
    if (value.length === 0) value = "0";
    const year = years[index];
    if (typeof value === "string") value = value.replace(",", ".");
    value = data.display === "Percent" ? parseFloat(value) / 100.0 : parseFloat(value);
    const oldValue = data.serie[index];

    if (value != oldValue) {
      const row = {
        id: data["IdParent"],
        year: year,
        valStr: value.toString(),
        variable: data["Name"],
        parent: data["Parent"],
        parsedVal: parseFloat(value)
      }
      if (calculMere) calculMere(row);
    }
    event.preventDefault();
  }

  let classNameTd = "";
  if (data.Level == 0) { classNameTd = "td-level0" }

  return (
    <tr ref={tableRef} onClick={() => handleClick(data)} type={data.type} display={data.display} parent={data.Parent} id={data.Name} className={trClassName} root={data.Root} degree={data.degree}>
      <td className='td-fixe' >
        <div style={firstTdStyle}>
          <div style={firstTdStyle}>
            {contentExpanded}
            {isDefaultChecked ? (<Checkbox defaultChecked onChange={(event) => checking()} />) : (<Checkbox onChange={(event) => checking()} />)}
          </div>
          
          {data.Name !== "EFF" ? (<div className={className} style={{width: '100%' }} onClick={() => expandTr(data)}><span className="content-open">{contentOpen}</span>{data.RealName}</div>):(
            <div style={{width: '100%', marginLeft: "7px" }}>{data.RealName}</div>
          )} 
          
        </div>

      </td>
      {data.serie.map((value, idx) => {
        return (<td key={idx} className={`data-${idx}`}>
          {
            ((data.type === "Data" && tableType !== "recapitulatif" && scenType !== "hypo" && scenType !== "res") || (tableType === "scenario" && idx > indexLastYear && scenType === "hypo" && data.type === "Data")) ? (<input onKeyPress={(event) => handleKeyPress(event, idx)} onFocus={(event) => handleFocus(event, idx)} type="text" {...inputProps} onChange={(event) => updateInternalSeries(event, idx)} onBlur={(event) => inputValueChanged(event, idx)} value={areFocused[idx] == false ? formatNumber(idx, internalSeries[idx], internalSeries, valueDisplay, data.type, data.display, data.Name, tableType) : internalSeries[idx]} />) : (<p>{formatNumber(idx, internalSeries[idx], internalSeries, valueDisplay, data.type, data.display, data.Name, tableType)}</p>)
          }
        </td>);
      })}
    </tr>
  );
}

export default TrPrev;