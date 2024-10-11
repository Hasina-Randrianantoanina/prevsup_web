import React, { Component } from 'react'
import { Accordion, Form, Menu } from 'semantic-ui-react';
import DualListBox from 'react-dual-listbox';




export default class AnneeAtypiqueAccordion extends Component {
  constructor(props) {
    super(props);

    this.state = { activeIndex: 1, selected: [] };
  }


  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  handleChange = (selected) => {
    // console.log(selected);
    this.setState({ selected }, () => {
      const {setAtypicalYears} = this.props;
      setAtypicalYears(selected);
    })
  }

  render() {
    const { activeIndex } = this.state;
    const {constatYears} = this.props;
    
    const options = [];
    if(constatYears) {
      constatYears.forEach(year => {
        options.push({ label: year, value: year });
      });
    }
    
    const dualListForm = (
      <Form className='custom-accordion-anneeAtipyque'>
        <DualListBox selected={this.state.selected} onChange={this.handleChange} options={options} className='dualB' />
      </Form>
    );

    return (
      <Accordion as={Menu} vertical fluid >
        <Menu.Item>
          <Accordion.Title
            active={this.state.activeIndex === 0}
            content='Années atypiques'
            index={0}
            onClick={this.handleClick}
          />
          <Accordion.Content active={this.state.activeIndex === 0} content={dualListForm} />
        </Menu.Item>
      </Accordion>
    )
  }
}