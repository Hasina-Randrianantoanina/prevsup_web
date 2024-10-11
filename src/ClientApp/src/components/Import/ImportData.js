import React,{Component} from 'react';
import { Header,  Button, Modal, Form ,Loader,Dimmer} from 'semantic-ui-react'


class ImportData extends Component{

    constructor(props) {
        super(props);
        this.state = {
           selectedFile: null,
           isImportRunning: false
        };

    }
    componentDidMount() {
    }
    //const { isCreateImportModalOpen, setCreateImportModal } = props;

    handleEvent = (event) => {
        
        const newSelectedFile=event.target.files[0];
        this.setState({selectedFile:newSelectedFile});
         //TODO: search how to update imediately the state       
    }
    importData = (event) => {
        const {progressImport, setCreateImportModal}=this.props;
        if(this.state.selectedFile===null){
            alert("Veuillez selectionner un fichier.")
        }else{
            this.setState({isImportRunning: true}, () => {
                progressImport(this.state.selectedFile).then(result => {
                    this.setState({isImportRunning: false}, () => {
                        setCreateImportModal(false);
                    });
                    
                });
            })
            
            
        }
        event.preventDefault();
        
        
    }

    close  =(event) => {
        if(this.state.isImportRunning == false) {
        const { setCreateImportModal } = this.props;

            setCreateImportModal(false);
        }
   
    }

    render(){
        const { isCreateImportModalOpen, setCreateImportModal } = this.props;
        const attribute = {
        }
        const attributeModal = {}

        if(this.state.isImportRunning) {
            attributeModal.dimmer = "blurring";
            attribute.disabled = true;}

        return (
            <Modal {...attributeModal} style={{zIndex: -998}} as={Form} size="small" closeIcon onClose={this.close}
                open={isCreateImportModalOpen} closeOnDimmerClick={false}>
                <Header content="Importation des données académiques" />
                <Modal.Content>
                    <div>
                        Compresser dans un ZIP les fichiers suivants:
                        <ul>
                            <li>coefLMD.xml</li>
                            <li>insdipflu.xml</li>
                            <li>recap_aca.xml</li>
                            <li>recap_pgm150.xml</li>
                            <li>tbt.xml</li>
                        </ul>
                        (Ne pas inclure le nom du dossier dans le ZIP)
                    </div>
                    <br />
                    <Form.Input {...attribute} transparent name="upload" type="file" onChange={(e)=> this.handleEvent(e)}/>
                </Modal.Content>
                
                
                {
                    this.state.isImportRunning ? (<div> <Dimmer active inverted > <Loader ><h4>Importation en cours...</h4></Loader> </Dimmer></div>): (
                        <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setCreateImportModal(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" color="blue" onClick={this.importData}>
                        Importer
                    </Button>
                </Modal.Actions>
                    )
                }
                
            </Modal>
        );
    }
    
}

export default ImportData;