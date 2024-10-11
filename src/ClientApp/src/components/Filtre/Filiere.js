import React, { Component } from 'react'
import { Accordion, Form, Menu } from 'semantic-ui-react'
import './Filiere.css'




export default class Filiere extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 1,
      liSelected: "",
    }
  }


  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  render() {
    const { activeIndex } = this.state;
    const { filieres, className, changeFiliere, currentDegre, filteredFilieres } = this.props;

    let activeFiliere = "";
    filteredFilieres.forEach(filiere => {
      if(filiere.degree == currentDegre) {
        activeFiliere = filiere.idFiliere;
      }
    })

    const FiliereForm = (
      <Form className={className}>
        <ul>
          {
            filieres.map(element => {
              const liProps = {
                className: `filiere-${element.level}`
              };

              if(element.value === activeFiliere) {
                liProps.className = `filiere-${element.level} active`;
              }
              return (<li
                id={element.value}
                key={element.value}
                {...liProps}
                // style={{backgroundColor: this.state.liSelected===element ? 'rgba(32,120,200,0.60)' :''}}
                onClick={() => { changeFiliere(element.value); this.setState({ liSelected: element });}}
              >{element.text}</li>)
            })}
        </ul>
      </Form>
    )

    return (
      <Accordion as={Menu} vertical fluid >
        <Menu.Item >
          <Accordion.Title
            active={activeIndex === 0}
            content='Zoom sur filière'
            index={0}
            onClick={this.handleClick}
          />
          <Accordion.Content active={activeIndex === 0} content={FiliereForm} />
        </Menu.Item>

      </Accordion>
    )
  }
}