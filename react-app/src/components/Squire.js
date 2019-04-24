import React from 'react';

const divSyle={
    width:'50px',
    height:'50px',
    background:'white',
    border:'1px solid black'
}

export default function Squire(props){
        return(
            <button style={divSyle}
            onClick={props.onClick}>
                {props.value}
            </button>
        )
}