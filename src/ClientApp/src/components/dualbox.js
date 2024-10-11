import React, { useState } from "react"
import DualListBox from 'react-dual-listbox';
import 'react-dual-listbox/lib/react-dual-listbox.css'



class Dualbox extends React.Component {
    constructor(){
        super()
        this.state={
            selected:[],
        }
    }
    componentDidMount(){
    }

    handleChange = (data) => {

        const { handleDualBox, type} = this.props;
        if(type === "show-user") handleDualBox(data);
        else{
            this.setState({selected: data}, () => {
                handleDualBox(data);
            });
        }
        
    }
    render(){
        const {academies, initialState,type} = this.props;
        
        return (
            <div>
                {(type==="show-user") ? [
                    <DualListBox options={academies} key={0} type={type} canFilter filterPlaceholder="Rechercher..." selected={initialState} onChange={(selected)=>{ this.handleChange(selected) }} />
                ]:[
                    <DualListBox options={academies} key={1} type={type} canFilter filterPlaceholder="Rechercher..." selected={this.state.selected} onChange={(selected)=>{ this.handleChange(selected) }} />
                ]}
                        
            </div>
        )
    }

    

}
export default Dualbox;
