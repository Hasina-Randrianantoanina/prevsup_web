import { Message,Button,Modal, ModalContent } from 'semantic-ui-react';
import React from 'react';
import './Fade.css';
import { useState } from 'react';
import { useEffect } from 'react';




const Fade = (props) => {
	
	const {
		isError,
		message,
		clearInfo
	} = props;
const [modalMessage,setModalMessage]=useState(message !== ""?true:false);
useEffect(()=>{message !== "" ?setModalMessage(true):setModalMessage(false)})

	let content = (
		
		<Modal open={modalMessage} size='mini' closeOnDimmerClick={false}>
			<Modal.Content>
				{/* <Message className={`snackbar ${message !== ""?"show":""}`} success>
					<Message.Header>{message}</Message.Header>
					<Button size='mini' inverted color='green' onClick={clearInfo} style={{float:'right',marginTop:'3%'}} >OK</Button>
				</Message> */}
				<p>{message}</p>
			</Modal.Content>
			<Modal.Actions>
          		<Button positive onClick={() => {clearInfo();setModalMessage(false)}}>
            		OK
          		</Button>
        	</Modal.Actions>
		</Modal>
	);

	// if (isError) {
	// 	content = (
	// 		// <div>
	// 		// 	<Message className={`snackbar ${message !== ""?"show":""}`} negative>
	// 		// 		<Message.Header>{message}</Message.Header>
	// 		// 		<Button size='mini'  inverted color='brown' onClick={clearInfo} style={{marginLeft:'80%',marginTop:'3%'}} >OK</Button>
	// 		// 	</Message>
	// 		// </div>
	// 		<Modal open={modalMessage} size='mini' closeOnDimmerClick={false}>
	// 		<Modal.Content>
	// 			<p>{isError}</p>
	// 		</Modal.Content>
	// 		<Modal.Actions>
    //       		<Button positive onClick={() => {clearInfo();setModalMessage(false)}}>
    //         		OK
    //       		</Button>
    //     	</Modal.Actions>
	// 	</Modal>
	// 	);
	// }


	return (
		<div style={{float: "left", zIndex:"1000",marginLeft:"50%"}}>
			{content}
		</div>
	);
};

export default Fade;
