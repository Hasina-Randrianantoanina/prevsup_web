import React,{Component} from 'react';
import { Header,  Button, Modal, Form ,Loader,Dimmer} from 'semantic-ui-react'
import Utils from '../../services/utils'


class ImportUserGuide extends Component{

    constructor(props) {
        super(props);
        this.state = {
           selectedFile: null,
           isImportRunning: false
        };

    }
    componentDidMount() {
    }

    handleEvent = (event) => {
        const newSelectedFile=event.target.files[0];
        this.setState({selectedFile:newSelectedFile});     
    }
    importData = (event) => {
        const util=new Utils()
        const {uploadUserGuide, setImportUserGuideModal}=this.props;
        if(this.state.selectedFile===null){
            alert("Veuillez selectionner un fichier.")
        }else if(util.getFileExtension(this.state.selectedFile.name).toLowerCase() !=="pdf"){
            alert("Veuillez choisir un fichier au format PDF.")
        }else{
            // console.log(typeof(selectedFile))
            this.setState({isImportRunning: true}, () => {
                uploadUserGuide(this.state.selectedFile).then(result => {
                    this.setState({isImportRunning: false}, () => {
                        setImportUserGuideModal(false);
                    });
                    
                });
            })
            // console.log("OKOK")
            
        }
        event.preventDefault();
        
        
    }

    close  =(event) => {
        if(this.state.isImportRunning == false) {
        const { setImportUserGuideModal } = this.props;

        setImportUserGuideModal(false);
        }
   
    }

    render(){
        const { isImportUserGuideModalOpen, setImportUserGuideModal } = this.props;
        const attribute = {
        }
        const attributeModal = {}

        if(this.state.isImportRunning) {
            attributeModal.dimmer = "blurring";
            attribute.disabled = true;}

        return (
            <Modal {...attributeModal} style={{zIndex: -998}} as={Form} size="small" closeIcon onClose={this.close}
                open={isImportUserGuideModalOpen} closeOnDimmerClick={false}>
                <Header content="Importation d'un guide utilisateur" />
                <Modal.Content>
                    <div>
                        Veuillez ajouter un fichier pdf.
                    </div>
                    <br />
                    <Form.Input {...attribute} accept="application/pdf" transparent name="upload" type="file" onChange={(e)=> this.handleEvent(e)}/>
                </Modal.Content>
                
                
                {
                    this.state.isImportRunning ? (<div> <Dimmer active inverted > <Loader ><h4>Importation en cours...</h4></Loader> </Dimmer></div>): (
                        <Modal.Actions>
                    <Button type="reset" color="grey" onClick={() => setImportUserGuideModal(false)}>
                        Annuler
                    </Button>
                    <Button type="submit" color="blue" onClick={this.importData}>
                        Ajouter
                    </Button>
                </Modal.Actions>
                    )
                }
                
            </Modal>
        );
    }
    
}

export default ImportUserGuide;