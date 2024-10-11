import React from 'react'
import { Component } from 'react'
import {
  Checkbox,
  Grid,
  Header,
  Icon,
  Image,
  Menu,
  Segment,
  Select,
  Sidebar,
  Dropdown
} from 'semantic-ui-react'

class TestFiltreHypothese extends Component{

    
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
        }
      render(){
        const optionFiltre=[
            {text: "Dernière valeur observée", value: "lastValueObserved"},
            {text: "Moyenne arithmétique", value: "meanA"},
            {text: "Taux d'évolution globale", value: "Tglobal"},
            {text: "Taux d'évolution annuel", value: "Tannuel"},
            {text: "Moyenne glissante pondéré", value: "meanG"},
            {text: "Régression linéaire paramétrée", value: "regr"},
            {text: "Modèle exponentiel", value: "exp"},
            {text: "Modèle logarithmique", value: "log"},
            {text: "Modèle polynomial", value: "pol"},
            {text: "Modèle en puissance", value: "pow"}

        ]
        return (
            <Grid columns={1}>
              <Grid.Column>
                <Checkbox
                  checked={this.state.visible}
                  label={{ children: <code>visible</code> }}
                  onChange={(e, data) => this.setState({visible:data.checked})}
                />
              </Grid.Column>
        
              <Grid.Column>
                <Sidebar.Pushable as={Segment}>
                  <Sidebar
                    
                    animation='overlay'
                    icon='labeled'
                    inverted
                    onHide={() => this.setState({visible:false})}
                    vertical
                    visible={this.state.visible}
                    width='thin'
                  >
                    <Dropdown fluid placeholder='' search selection options={optionFiltre} />
                    
                  </Sidebar>
        
                  <Sidebar.Pusher>
                    <Segment basic>
                      tabscenario
                    </Segment>
                  </Sidebar.Pusher>
                </Sidebar.Pushable>
              </Grid.Column>
            </Grid>
          )
      }          
  
}

export default TestFiltreHypothese