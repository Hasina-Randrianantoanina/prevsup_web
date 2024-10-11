import React from "react";
import { useState } from "react";
import { useRef } from "react";
import { Button, Dropdown } from "semantic-ui-react";


const CustomFiltreScenario = (props) => {
    const { data, className, label, applyFilter } = props;
    const [isOpen, setOpen] = useState(false);
    const handleEventId = (event, data) => {
        if (isOpen) {
            element.current.style.left = "-215px";
            setOpen(false);
        }
        applyFilter(data.value);
    }
    
    const options = [];
    Object.values(data).forEach(element => { options.push({ key: element.Parent + "-" + element.Name, text: element.RealName, value: element.Name }) });

    const element = useRef(null);

    const handleClick = (event) => {
        if (isOpen) {
            element.current.style.left = "-215px";
        } else {
            element.current.style.left = "0px";
        }
        setOpen(!isOpen);
    }


    return (
        <div ref={element} className={className}>
            <Dropdown className="custom-dropdown" onChange={(event, data) => handleEventId(event, data)} fluid placeholder='' search selection options={options} />
            <Button onClick={handleClick} size="small">{label}</Button>
        </div>
    );
}
export default CustomFiltreScenario;