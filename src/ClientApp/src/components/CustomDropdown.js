import React from "react";
import { Dropdown } from "semantic-ui-react";
import '../containers/Scenario/ScenarioPane.css'

const CustomDropdown=(props)=>{
  const {opt}=props;
    const getCustomerItems = () => {

        const options = opt.map(element => {
            return (
                <Dropdown.Item
                    key={element.value}
                    className={`filiere-${element.level}`}
                    ><p>{element.text}</p>
                </Dropdown.Item>
            );
        })
        return options;
    }
    
    return (
           <Dropdown text='Zoom sur une filière' fluid  closeOnChange={false}>
                <Dropdown.Menu>
                  {getCustomerItems()}
                </Dropdown.Menu>
            </Dropdown>
      );
}
export default CustomDropdown;