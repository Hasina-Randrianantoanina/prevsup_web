
import React, { useState,useRef, useEffect } from 'react';
import { Header, Dropdown, Button, Modal, Form } from 'semantic-ui-react'
import './ChangeAppInfo.css'

import sanitizeHtml from 'sanitize-html-react';

const TextEditor = (props) => {
    const { appInfo, setNewInfo} = props;
    const inputRef = useRef(null);
    const outputRef= useRef(null);
    const [isBold, setBold]=useState(false)
    const [isItalic,setItalic] = useState(false)
    const [isUnderline,setUnderline]= useState(false)
    const [textInput,setTextInput]=useState("")
    const [selectedText,setSelectedText]=useState("")
    const sanitizeConf = {
        allowedTags: ["b", "i", "p", "div", "br", "u"],
    };
    

    useEffect(()=>{setNewInfo(textInput)},[textInput]);
    const onInputChange = (e) =>{       
        setTextInput(e.target.innerHTML)
    }
    const onSelect = (e) =>{
        const selection = window.getSelection();
        setSelectedText(selection)
        if (!selection.isCollapsed) {
            setItalic(document.queryCommandState("italic"));
            setUnderline(document.queryCommandState("underline"));
            setBold(document.queryCommandState("bold"));
        } else {
            setItalic(false);
            setUnderline(false);
            setBold(false);
        }
        e.preventDefault()
    }
    
    const onBoldClick = (e) =>{
        document.execCommand("bold", false, "");
    }
    const onUnderlineClick = () =>{
        setUnderline(!isUnderline);
        document.execCommand("underline", false, "");
    }

    const firstText = appInfo ? appInfo: `<div>&nbsp;</div>`;

    return (
        <div className='container-AppInfo'>
            
            <span className="Controls">
                <Button active={isBold} onClick={onBoldClick}><b>G</b></Button>
                <Button active={isUnderline} onClick={onUnderlineClick}><u>S</u></Button>
            </span>
            <div onInput={(event) => onInputChange(event)} style={{overflowY: 'scroll'}}  onSelect={onSelect} className='appInfoContentEditable' contentEditable dangerouslySetInnerHTML={{__html: sanitizeHtml(firstText, sanitizeConf)}} />
            
        </div>
        
                   
    );
}

export default TextEditor;