import React from 'react'
import { Form,TextArea } from 'semantic-ui-react'


const ContactLogin = (props) => (
//   <Card content="En cas de difficulté d’accès ou d’utilisation de l’application, 
//   ou d’interrogation sur les données, nous vous remercions d’envoyer votre demande au SIES via l’adresse ci-contre : 
//   prevision.superieur@enseignementsup.gouv.fr"/>
    <Form>
        <TextArea cols="50" rows={5} value=" En cas de difficulté d’accès ou d’utilisation de l’application, 
   ou d’interrogation sur les données, nous vous remercions d’envoyer votre demande au SIES via l’adresse ci-contre : 
   prevision.superieur@enseignementsup.gouv.fr" readOnly></TextArea>
    </Form>
)

export default ContactLogin